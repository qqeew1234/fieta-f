// components/LogoutButton.tsx
"use client"


import { Button } from "@/components/ui/button"
import {logout} from "@/components/logout";

export default function LogoutButton() {
    const handleLogout = async () => {
        await logout()
    }

    return (
        <Button variant="outline" onClick={handleLogout} className="w-20">
            로그아웃
        </Button>
    )
}