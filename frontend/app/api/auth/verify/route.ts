import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie");

    console.log("Incoming Cookies in Next.js API:", cookieHeader); // ✅ Debugging

    if (!cookieHeader) {
        return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }

    try {
        const flaskResponse = await fetch("http://localhost:5858/auth/verify", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader || "", // ✅ Manually forward cookies
            },
            credentials: "include",
        });

        const data = await flaskResponse.json();

        console.log("Flask /auth/verify Response:", data); // ✅ Debugging

        return NextResponse.json(data, { status: flaskResponse.status });
    } catch (error) {
        console.error("Error in /api/auth/verify:", error);
        return NextResponse.json({ error: "Failed to verify authentication" }, { status: 500 });
    }
}

