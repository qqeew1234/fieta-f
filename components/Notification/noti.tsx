"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Notification {
    message: string;
    createdAt: number;
}

export default function Notification({ token }: { token: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const fetchUnread = async () => {
            const res = await axios.get("/sse/notifications", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnreadCount(res.data.unreadCount);
        };

        fetchUnread();

        const emitterId = token; // JWT 토큰을 emitterId로 사용한다고 가정
        const eventSource = new EventSource(
            `https://localhost:8443/sse/notifications?emitterId=${emitterId}`
        );

        eventSource.addEventListener("newPost", (event: MessageEvent) => {
            const newNotification = JSON.parse(event.data);
            setNotifications((prev) => [...prev, newNotification]);
            setUnreadCount((prev) => prev + 1);
        });

        eventSource.onerror = (error) => {
            console.error("SSE error:", error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [token]);

    return (
        <div>
            <div style={{ position: "relative" }}>
                <button>🔔</button>
                {unreadCount > 0 && (
                    <span style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        backgroundColor: "red",
                        borderRadius: "50%",
                        width: 10,
                        height: 10
                    }} />
                )}
            </div>
            <ul>
                {notifications.map((noti, idx) => (
                    <li key={idx}>{noti.message}</li>
                ))}
            </ul>
        </div>
    );
}
