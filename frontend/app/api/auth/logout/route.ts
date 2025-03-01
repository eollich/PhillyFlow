import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie");

    try {
        const flaskResponse = await fetch("http://localhost:5858/auth/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader || "",
            },
            credentials: "include",
        });


        const responseBody = await flaskResponse.text();

        const response = new NextResponse(responseBody, {
            status: flaskResponse.status,
        });

        response.headers.set("Set-Cookie", "session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None");
        return response;
    } catch (error) {
        return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
    }
}

