// src/components/Notification/NotificationItem.tsx

import React from 'react';

interface NotificationData {
    message: string;
    type: string;
    targetId: string;
    receiverType: 'USER' | 'ADMIN';
}

interface NotificationItemProps {
    notification: NotificationData;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
    return (
        <li className="notification-item">
            <div>
                <p><strong>{notification.message}</strong></p>
                <p>타입: {notification.type}</p>
            </div>
        </li>
    );
};

export default NotificationItem;
