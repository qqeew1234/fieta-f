import { useEffect, useRef, useState, useCallback } from 'react';
import {
  WebSocketService,
  ConnectionStatus,
  MessageHandler,
} from './WebSocketService';
import { StompSubscription, StompHeaders } from '@stomp/stompjs';

export interface UseWebSocketOptions {
  /** 자동 연결 여부 */
  autoConnect?: boolean;
  /** 웹소켓 서비스 옵션 */
  wsOptions?: ConstructorParameters<typeof WebSocketService>[1];
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const { autoConnect = true, wsOptions = {} } = options;

  // WebSocketService 인스턴스 관리
  const serviceRef = useRef<WebSocketService | null>(null);

  // 연결 상태 관리
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    ConnectionStatus.DISCONNECTED
  );

  // 오류 상태 관리
  const [error, setError] = useState<Error | null>(null);

  // 구독 관리를 위한 참조
  const subscriptionsRef = useRef<Map<string, StompSubscription>>(new Map());

  // 서비스 초기화
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = new WebSocketService(url, {
        ...wsOptions,
        onStatusChange: (status) => setConnectionStatus(status),
        onError: (err) => setError(err),
      });
    }

    // 자동 연결 옵션이 활성화된 경우
    if (autoConnect) {
      serviceRef.current.connect().catch((err) => {
        setError(err);
      });
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 모든 구독 해제
      subscriptionsRef.current.forEach((subscription) => {
        serviceRef.current?.unsubscribe(subscription);
      });
      subscriptionsRef.current.clear();

      // 서비스 정리
      serviceRef.current?.dispose();
      serviceRef.current = null;
    };
  }, [url, autoConnect]);

  // 연결 함수
  const connect = useCallback(() => {
    if (!serviceRef.current)
      return Promise.reject(new Error('WebSocketService not initialized'));
    return serviceRef.current.connect();
  }, []);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    if (!serviceRef.current)
      return Promise.reject(new Error('WebSocketService not initialized'));
    return serviceRef.current.disconnect();
  }, []);

  // 구독 함수
  const subscribe = useCallback(
    (destination: string, callback: MessageHandler) => {
      if (!serviceRef.current) {
        throw new Error('WebSocketService not initialized');
      }

      const subscription = serviceRef.current.subscribe(destination, callback);
      subscriptionsRef.current.set(destination, subscription);

      return subscription;
    },
    []
  );

  // 구독 해제 함수
  const unsubscribe = useCallback(
    (subscription: StompSubscription | string) => {
      if (!serviceRef.current) return;

      serviceRef.current.unsubscribe(subscription);

      // 구독 목록에서 제거
      if (typeof subscription === 'string') {
        subscriptionsRef.current.forEach((sub, key) => {
          if (sub.id === subscription) {
            subscriptionsRef.current.delete(key);
          }
        });
      } else {
        subscriptionsRef.current.forEach((sub, key) => {
          if (sub.id === subscription.id) {
            subscriptionsRef.current.delete(key);
          }
        });
      }
    },
    []
  );

  // 메시지 전송 함수
  const send = useCallback(
    (destination: string, body: any, headers?: StompHeaders) => {
      if (!serviceRef.current) {
        throw new Error('WebSocketService not initialized');
      }

      return serviceRef.current.send(destination, body, headers);
    },
    []
  );

  // 오류 초기화 함수
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    connectionStatus,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    clearError,
    isConnected: connectionStatus === ConnectionStatus.CONNECTED,
    isConnecting: connectionStatus === ConnectionStatus.CONNECTING,
    isDisconnected: connectionStatus === ConnectionStatus.DISCONNECTED,
    hasError: connectionStatus === ConnectionStatus.ERROR,
  };
}
