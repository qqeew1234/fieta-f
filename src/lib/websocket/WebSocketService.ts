import {
  Client,
  StompHeaders,
  Message,
  Frame,
  IFrame,
  StompSubscription,
} from '@stomp/stompjs';
import SockJS from 'sockjs-client';

/**
 * 연결 상태를 나타내는 열거형
 */
export enum ConnectionStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
}

/**
 * 메시지 핸들러 타입 정의
 */
export type MessageHandler = (message: Message) => void;

/**
 * 웹소켓 옵션 타입 정의
 */
export interface WebSocketOptions {
  /** 웹소켓 연결 시 사용할 인증 토큰 */
  authToken?: string;
  /** 자동 재연결 활성화 여부 */
  autoReconnect?: boolean;
  /** 상태 변경 시 호출되는 콜백 */
  onStatusChange?: (status: ConnectionStatus) => void;
  /** 오류 발생 시 호출되는 콜백 */
  onError?: (error: Error) => void;
  /** 디버그 모드 활성화 여부 */
  debug?: boolean;
  /** 최대 재연결 시도 횟수 */
  maxReconnectAttempts?: number;
  /** 최초 재연결 시도 딜레이 (ms) */
  initialReconnectDelay?: number;
  /** 최대 재연결 시도 딜레이 (ms) */
  maxReconnectDelay?: number;
  /** 연결 시도 타임아웃 (ms) */
  connectTimeout?: number;
  /** 사용자 정의 STOMP 헤더 */
  connectHeaders?: StompHeaders;
}

/**
 * 이벤트 타입 정의
 */
type EventType =
  | 'statusChange'
  | 'error'
  | 'connecting'
  | 'connected'
  | 'disconnected';

/**
 * 웹소켓 서비스 클래스
 * STOMP 프로토콜과 SockJS를 사용하여 웹소켓 통신을 처리
 */
export class WebSocketService {
  private client: Client | null = null;
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageHandlers: Map<string, Set<MessageHandler>> = new Map();
  private eventListeners: Map<EventType, Set<Function>> = new Map();
  private reconnectAttempts: number = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<void> | null = null;
  private connectResolve: (() => void) | null = null;
  private connectReject: ((error: Error) => void) | null = null;
  private disconnectPromise: Promise<void> | null = null;
  private disconnectResolve: (() => void) | null = null;
  private disconnectReject: ((error: Error) => void) | null = null;
  private pendingMessages: Array<{
    destination: string;
    body: any;
    headers?: StompHeaders;
  }> = [];
  private messageIdCounter: number = 0;
  private readonly defaultOptions: Required<WebSocketOptions> = {
    authToken: '',
    autoReconnect: true,
    onStatusChange: () => {},
    onError: () => {},
    debug: false,
    maxReconnectAttempts: 5,
    initialReconnectDelay: 1000,
    maxReconnectDelay: 30000,
    connectTimeout: 10000,
    connectHeaders: {},
  };
  private readonly options: Required<WebSocketOptions>;

  /**
   * WebSocketService 생성자
   * @param url WebSocket 서버 URL
   * @param options 웹소켓 연결 옵션
   */
  constructor(
    private readonly url: string,
    options: WebSocketOptions = {}
  ) {
    this.options = { ...this.defaultOptions, ...options };

    // 이벤트 리스너 초기화
    [
      'statusChange',
      'error',
      'connecting',
      'connected',
      'disconnected',
    ].forEach((event) =>
      this.eventListeners.set(event as EventType, new Set())
    );

    // 상태 변경 및 오류 핸들러 등록
    if (this.options.onStatusChange) {
      this.addEventListener('statusChange', this.options.onStatusChange);
    }

    if (this.options.onError) {
      this.addEventListener('error', this.options.onError);
    }
  }

  /**
   * 웹소켓 초기화 및 이벤트 핸들러 설정
   * @private
   */
  private initialize(): void {
    if (this.client) {
      return;
    }

    // SockJS 인스턴스 생성 함수 정의
    const createSockJSInstance = () => new SockJS(this.url);

    // STOMP 클라이언트 설정
    this.client = new Client({
      webSocketFactory: createSockJSInstance,
      connectHeaders: this.buildConnectHeaders(),
      debug: this.options.debug ? console.log : () => {},
      reconnectDelay: 0, // 내부 재연결 비활성화 (직접 구현)
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 이벤트 핸들러
    this.client.onConnect = this.handleConnect.bind(this);
    this.client.onStompError = this.handleStompError.bind(this);
    this.client.onWebSocketError = this.handleWebSocketError.bind(this);
    this.client.onWebSocketClose = this.handleWebSocketClose.bind(this);
  }

  /**
   * 연결 헤더 생성
   * @private
   * @returns STOMP 연결 헤더
   */
  private buildConnectHeaders(): StompHeaders {
    const headers: StompHeaders = { ...this.options.connectHeaders };

    // 인증 토큰이 있으면 헤더에 추가
    if (this.options.authToken) {
      headers['Authorization'] = `Bearer ${this.options.authToken}`;
    }

    return headers;
  }

  /**
   * 이벤트 리스너 등록
   * @param event 이벤트 타입
   * @param callback 콜백 함수
   */
  public addEventListener(event: EventType, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(callback);
    }
  }

  /**
   * 이벤트 리스너 제거
   * @param event 이벤트 타입
   * @param callback 콜백 함수
   */
  public removeEventListener(event: EventType, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 이벤트 발생 처리
   * @private
   * @param event 이벤트 타입
   * @param args 이벤트 인자들
   */
  private emitEvent(event: EventType, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${event} event listener:`, error);
        }
      });
    }
  }

  /**
   * 연결 상태 업데이트
   * @private
   * @param status 새로운 연결 상태
   */
  private updateConnectionStatus(status: ConnectionStatus): void {
    if (this.connectionStatus !== status) {
      this.connectionStatus = status;
      this.emitEvent('statusChange', status);

      // 상태별 추가 이벤트 발생
      switch (status) {
        case ConnectionStatus.CONNECTING:
          this.emitEvent('connecting');
          break;
        case ConnectionStatus.CONNECTED:
          this.emitEvent('connected');
          break;
        case ConnectionStatus.DISCONNECTED:
          this.emitEvent('disconnected');
          break;
      }
    }
  }

  /**
   * 연결 성공 핸들러
   * @private
   * @param frame 연결 성공 프레임
   */
  private handleConnect(frame: IFrame): void {
    this.reconnectAttempts = 0;
    this.updateConnectionStatus(ConnectionStatus.CONNECTED);

    // 연결 프로미스 해결
    if (this.connectResolve) {
      this.connectResolve();
      this.connectResolve = null;
      this.connectReject = null;
    }

    // 연결 끊김 이후 재연결된 경우 구독 복구
    this.restoreSubscriptions();

    // 연결 끊김 동안 쌓인 메시지 처리
    this.flushPendingMessages();
  }

  /**
   * STOMP 오류 핸들러
   * @private
   * @param frame 오류 프레임
   */
  private handleStompError(frame: IFrame): void {
    const error = new Error(
      `STOMP Error: ${frame.headers?.message || 'Unknown error'}`
    );
    this.handleConnectionError(error);
  }

  /**
   * WebSocket 오류 핸들러
   * @private
   * @param event WebSocket 오류 이벤트
   */
  private handleWebSocketError(event: Event): void {
    const error = new Error(
      `WebSocket Error: ${(event as ErrorEvent)?.message || 'Unknown error'}`
    );
    this.handleConnectionError(error);
  }

  /**
   * WebSocket 연결 종료 핸들러
   * @private
   */
  private handleWebSocketClose(): void {
    // 의도적 연결 종료가 아닌 경우에만 재연결 시도
    if (
      this.connectionStatus !== ConnectionStatus.DISCONNECTING &&
      this.connectionStatus !== ConnectionStatus.DISCONNECTED
    ) {
      this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);

      // 자동 재연결이 활성화된 경우 재연결 시도
      if (this.options.autoReconnect) {
        this.scheduleReconnect();
      }
    } else if (this.connectionStatus === ConnectionStatus.DISCONNECTING) {
      this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);

      // 연결 종료 프로미스 해결
      if (this.disconnectResolve) {
        this.disconnectResolve();
        this.disconnectResolve = null;
        this.disconnectReject = null;
      }
    }
  }

  /**
   * 연결 오류 처리
   * @private
   * @param error 발생한 오류
   */
  private handleConnectionError(error: Error): void {
    this.updateConnectionStatus(ConnectionStatus.ERROR);
    this.emitEvent('error', error);

    // 연결 시도 중 오류가 발생한 경우 프로미스 거부
    if (
      this.connectionStatus === ConnectionStatus.CONNECTING &&
      this.connectReject
    ) {
      this.connectReject(error);
      this.connectResolve = null;
      this.connectReject = null;
    }

    // 연결 종료 중 오류가 발생한 경우 프로미스 거부
    if (
      this.connectionStatus === ConnectionStatus.DISCONNECTING &&
      this.disconnectReject
    ) {
      this.disconnectReject(error);
      this.disconnectResolve = null;
      this.disconnectReject = null;
    }

    // 자동 재연결이 활성화된 경우 재연결 시도
    if (this.options.autoReconnect) {
      this.scheduleReconnect();
    }
  }

  /**
   * 재연결 예약
   * @private
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 최대 재연결 시도 횟수 초과 시 중단
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.warn(
        `Maximum reconnect attempts (${this.options.maxReconnectAttempts}) reached.`
      );
      return;
    }

    // 지수 백오프 알고리즘을 사용한 재연결 딜레이 계산
    const delay = Math.min(
      this.options.initialReconnectDelay *
        Math.pow(1.5, this.reconnectAttempts),
      this.options.maxReconnectDelay
    );

    this.reconnectAttempts++;

    console.info(
      `Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch((error) => {
        console.error('Reconnect attempt failed:', error);
      });
    }, delay);
  }

  /**
   * 연결 시도 타임아웃 설정
   * @private
   * @returns 타임아웃 ID
   */
  private setupConnectTimeout(): NodeJS.Timeout {
    return setTimeout(() => {
      if (
        this.connectionStatus === ConnectionStatus.CONNECTING &&
        this.connectReject
      ) {
        const error = new Error(
          `Connection timeout after ${this.options.connectTimeout}ms`
        );
        this.handleConnectionError(error);
      }
    }, this.options.connectTimeout);
  }

  /**
   * 웹소켓 서버에 연결
   * @returns 연결 결과 프로미스
   */
  public connect(): Promise<void> {
    // 이미 연결 중이거나 연결된 상태인 경우
    if (this.connectionStatus === ConnectionStatus.CONNECTING) {
      return this.connectionPromise!;
    }

    if (this.connectionStatus === ConnectionStatus.CONNECTED) {
      return Promise.resolve();
    }

    // 연결 초기화
    this.initialize();
    this.updateConnectionStatus(ConnectionStatus.CONNECTING);

    // 연결 프로미스 생성
    this.connectionPromise = new Promise<void>((resolve, reject) => {
      this.connectResolve = resolve;
      this.connectReject = reject;

      // 타임아웃 설정
      const timeoutId = this.setupConnectTimeout();

      // 클라이언트 활성화
      if (this.client) {
        try {
          this.client.activate();

          // 연결 성공 시 타임아웃 제거
          this.addEventListener('connected', () => clearTimeout(timeoutId));
        } catch (error) {
          clearTimeout(timeoutId);
          this.handleConnectionError(error as Error);
        }
      } else {
        clearTimeout(timeoutId);
        reject(new Error('STOMP client not initialized'));
      }
    });

    return this.connectionPromise;
  }

  /**
   * 웹소켓 연결 종료
   * @returns 연결 종료 결과 프로미스
   */
  public disconnect(): Promise<void> {
    // 이미 연결 종료 중이거나 연결 해제된 상태인 경우
    if (this.connectionStatus === ConnectionStatus.DISCONNECTING) {
      return this.disconnectPromise!;
    }

    if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
      return Promise.resolve();
    }

    // 재연결 타임아웃이 있다면 제거
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.updateConnectionStatus(ConnectionStatus.DISCONNECTING);

    // 연결 종료 프로미스 생성
    this.disconnectPromise = new Promise<void>((resolve, reject) => {
      this.disconnectResolve = resolve;
      this.disconnectReject = reject;

      if (this.client && this.client.connected) {
        try {
          this.client.deactivate();
        } catch (error) {
          this.handleConnectionError(error as Error);
        }
      } else {
        this.updateConnectionStatus(ConnectionStatus.DISCONNECTED);
        resolve();
      }
    });

    return this.disconnectPromise;
  }

  /**
   * 주제(destination)에 구독
   * @param destination 구독할 주제 경로
   * @param callback 메시지 핸들러 콜백
   * @param headers 구독 헤더
   * @returns 구독 객체
   */
  public subscribe(
    destination: string,
    callback: MessageHandler,
    headers: StompHeaders = {}
  ): StompSubscription {
    // 메시지 핸들러 등록
    if (!this.messageHandlers.has(destination)) {
      this.messageHandlers.set(destination, new Set());
    }
    this.messageHandlers.get(destination)?.add(callback);

    // 이미 해당 주제를 구독 중인 경우
    if (this.subscriptions.has(destination)) {
      return this.subscriptions.get(destination)!;
    }

    // 연결되지 않은 경우 자동 연결
    if (this.connectionStatus !== ConnectionStatus.CONNECTED) {
      // 더미 구독 객체 반환 (연결 후 실제 구독으로 대체됨)
      const dummySubscription: StompSubscription = {
        id: `pending-${++this.messageIdCounter}`,
        unsubscribe: () => {
          const handlers = this.messageHandlers.get(destination);
          if (handlers) {
            handlers.delete(callback);
          }
        },
      };

      // 연결 후 실제 구독 수행
      this.connect().catch((error) => {
        console.error('Failed to auto-connect for subscription:', error);
      });

      return dummySubscription;
    }

    // 실제 구독 수행
    if (this.client && this.client.connected) {
      try {
        const subscription = this.client.subscribe(
          destination,
          (message) => this.handleMessage(destination, message),
          headers
        );

        this.subscriptions.set(destination, subscription);
        return subscription;
      } catch (error) {
        console.error('Failed to subscribe:', error);
        throw error;
      }
    } else {
      throw new Error('STOMP client not connected');
    }
  }

  /**
   * 구독 해제
   * @param subscription 구독 객체 또는 구독 ID
   * @param keepHandlers 메시지 핸들러 유지 여부
   */
  public unsubscribe(
    subscription: StompSubscription | string,
    keepHandlers: boolean = false
  ): void {
    const subId =
      typeof subscription === 'string' ? subscription : subscription.id;
    let destination: string | undefined;

    // 구독 ID로 대상 찾기
    for (const [dest, sub] of this.subscriptions.entries()) {
      if (sub.id === subId) {
        destination = dest;
        break;
      }
    }

    // 구독 ID에 해당하는 구독 객체를 찾은 경우
    if (destination) {
      const sub = this.subscriptions.get(destination);
      if (sub) {
        try {
          // 실제 구독 해제
          sub.unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing:', error);
        }

        // 구독 맵에서 제거
        this.subscriptions.delete(destination);

        // 핸들러 맵에서 제거 (옵션에 따라)
        if (!keepHandlers) {
          this.messageHandlers.delete(destination);
        }
      }
    }
  }

  /**
   * 메시지 전송
   * @param destination 목적지 경로
   * @param body 메시지 본문
   * @param headers 메시지 헤더
   * @returns 메시지 ID
   */
  public send(
    destination: string,
    body: any,
    headers: StompHeaders = {}
  ): string {
    // 연결되지 않은 경우 메시지 큐에 추가
    if (this.connectionStatus !== ConnectionStatus.CONNECTED) {
      const messageId = `pending-${++this.messageIdCounter}`;
      this.pendingMessages.push({ destination, body, headers });

      // 연결되지 않은 경우 자동 연결
      if (this.connectionStatus === ConnectionStatus.DISCONNECTED) {
        this.connect().catch((error) => {
          console.error('Failed to auto-connect for sending message:', error);
        });
      }

      return messageId;
    }

    // 연결된 경우 즉시 전송
    if (this.client && this.client.connected) {
      const messageId = `msg-${++this.messageIdCounter}`;
      const messageHeaders = { ...headers, 'message-id': messageId };

      try {
        this.client.publish({
          destination,
          body: typeof body === 'string' ? body : JSON.stringify(body),
          headers: messageHeaders,
        });

        return messageId;
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    } else {
      throw new Error('STOMP client not connected');
    }
  }

  /**
   * 메시지 처리
   * @private
   * @param destination 메시지 경로
   * @param message 수신된 메시지
   */
  private handleMessage(destination: string, message: Message): void {
    const handlers = this.messageHandlers.get(destination);
    if (handlers && handlers.size > 0) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error in message handler for ${destination}:`, error);
        }
      });
    }
  }

  /**
   * 연결 끊김 이후 구독 복구
   * @private
   */
  private restoreSubscriptions(): void {
    if (!this.client || !this.client.connected) {
      return;
    }

    // 이전 구독 정보 백업
    const oldSubscriptions = new Map(this.subscriptions);
    this.subscriptions.clear();

    // 메시지 핸들러 맵을 기반으로 구독 복구
    for (const [destination, handlers] of this.messageHandlers.entries()) {
      if (handlers.size > 0) {
        try {
          const subscription = this.client.subscribe(
            destination,
            (message) => this.handleMessage(destination, message),
            {}
          );

          this.subscriptions.set(destination, subscription);
        } catch (error) {
          console.error(
            `Failed to restore subscription to ${destination}:`,
            error
          );
        }
      }
    }
  }

  /**
   * 대기 중인 메시지 처리
   * @private
   */
  private flushPendingMessages(): void {
    if (
      this.pendingMessages.length === 0 ||
      !this.client ||
      !this.client.connected
    ) {
      return;
    }

    // 대기 중인 메시지 복사 후 초기화
    const messages = [...this.pendingMessages];
    this.pendingMessages = [];

    // 메시지 전송
    for (const { destination, body, headers } of messages) {
      try {
        this.send(destination, body, headers);
      } catch (error) {
        console.error('Failed to send pending message:', error);
        // 전송 실패한 메시지는 다시 큐에 추가
        this.pendingMessages.push({ destination, body, headers });
      }
    }
  }

  /**
   * 현재 연결 상태 조회
   * @returns 현재 연결 상태
   */
  public getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * 활성 구독 목록 조회
   * @returns 활성 구독 목록
   */
  public getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * 자원 정리
   */
  public dispose(): void {
    this.disconnect().catch(() => {});

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 이벤트 리스너 초기화
    this.eventListeners.forEach((listeners) => listeners.clear());

    // 메시지 핸들러 초기화
    this.messageHandlers.clear();

    // 구독 초기화
    this.subscriptions.clear();

    // 대기 중인 메시지 초기화
    this.pendingMessages = [];
  }
}
