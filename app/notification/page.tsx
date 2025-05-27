// src/app/notification/page.tsx

import React from 'react';
import NotificationComponent from '../../components/Notification/NotificationComponent';

const NotificationPage = () => {
    // 실제 receiverId와 receiverType은 로그인된 사용자나 관리자의 데이터에서 가져와야 합니다.
    const receiverId = 1;  // 예시: 로그인된 사용자 ID
    const receiverType: 'USER' | 'ADMIN' = 'USER';  // 예시: 알림을 받을 대상 유형 (USER 또는 ADMIN)

    return (
        <div>
            <h1>실시간 알림</h1>
            <NotificationComponent receiverId={receiverId} receiverType={receiverType} />
            <noti />
        </div>

    );
};

export default NotificationPage;
