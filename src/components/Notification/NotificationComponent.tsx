// src/components/Notification/NotificationComponent.tsx
'use client'

import React, { useEffect, useState } from 'react';
import NotificationList from './NotificationList';

interface NotificationData {
    message: string;
    type: string;
    targetId: string;
    receiverType: 'USER' | 'ADMIN';
}

interface NotificationComponentProps {
    receiverId: number;
    receiverType: 'USER' | 'ADMIN';
}

const NotificationComponent: React.FC<NotificationComponentProps> = ({ receiverId, receiverType }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    // 서버로부터 알림을 실시간으로 받기 위한 SSE 연결
    useEffect(() => {
        const eventSource = new EventSource(`/sse/notifications?receiverId=${receiverId}&receiverType=${receiverType}`);

        eventSource.onmessage = (event) => {
            const newNotification: NotificationData = JSON.parse(event.data); // 서버에서 전달된 알림 데이터
            setNotifications((prevNotifications) => [
                ...prevNotifications,
                newNotification, // 기존 알림 목록에 새 알림 추가
            ]);
        };

        eventSource.onerror = (err) => {
            console.error('SSE Error', err);
        };

        // 컴포넌트가 언마운트될 때 연결 종료
        return () => {
            eventSource.close();
        };
    }, [receiverId, receiverType]);

    return (
        <div>
            <h2>알림 목록</h2>
            <NotificationList notifications={notifications} />
        </div>
    );
};

export default NotificationComponent;
