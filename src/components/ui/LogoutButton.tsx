// components/LogoutButton.tsx
"use client"


import { Button } from "@/src/components/ui/button"
import {logout} from "@/src/components/logout";

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