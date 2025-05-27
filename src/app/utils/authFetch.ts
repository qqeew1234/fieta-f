import {cookies} from "next/headers";

export async function authFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    let res = await fetch(input, { ...init, credentials: "include" });

    if (res.status === 401) {

        // accessToken 만료 → refresh 시도
        const refreshRes = await fetch("http://localhost:8080/api/v1/refresh", {
            method: "POST",
        });

        if (refreshRes.ok) {
            const { accessToken, refreshToken } = await res.json();
            const cookieStore = await cookies();

            // 쿠키에 저장 (expires 옵션 등 필요에 따라 조정)
            cookieStore.set({ name: "accessToken", value: accessToken, path: "/", maxAge : 900 })
            cookieStore.set({ name: "refreshToken", value: refreshToken, path: "/", maxAge : 1209600 })
            // 재발급 성공 → 원래 요청 다시 시도
            res = await fetch(input, { ...init});
        } else {
            // refreshToken도 만료 → 로그인 페이지로 이동
            window.location.href = "/login";
            throw new Error("로그인이 필요합니다.");
        }
    }

    return res;
}