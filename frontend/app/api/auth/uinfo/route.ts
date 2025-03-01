import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookieHeader = req.headers.get("cookie");


    if (!cookieHeader) {
        return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }

    try {
        const flaskResponse = await fetch("http://localhost:5858/auth/get_user_info", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader || "",
            },
            credentials: "include",
        });

        const data = await flaskResponse.json();


        return NextResponse.json(data, { status: flaskResponse.status });
    } catch (error) {
        console.error("Error in /api/auth/verify:", error);
        return NextResponse.json({ error: "Failed to verify authentication" }, { status: 500 });
    }
}

