// src/components/Notification/NotificationList.tsx

import React from 'react';
import NotificationItem from './NotificationItem';

interface NotificationData {
    message: string;
    type: string;
    targetId: string;
    receiverType: 'USER' | 'ADMIN';
}

interface NotificationListProps {
    notifications: NotificationData[];
}

const NotificationList: React.FC<NotificationListProps> = ({ notifications }) => {
    return (
        <div>
            {notifications.length === 0 ? (
                <p>새로운 알림이 없습니다.</p>
            ) : (
                <ul>
                    {notifications.map((notification, index) => (
                        <NotificationItem key={index} notification={notification} />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default NotificationList;
