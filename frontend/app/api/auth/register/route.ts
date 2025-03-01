import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const flaskResponse = await fetch("http://localhost:5858/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(body),
        });

        const responseBody = await flaskResponse.json();

        const nextResponse = new NextResponse(JSON.stringify(responseBody), {
            status: flaskResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Origin": "http://localhost:3000",
            },
        });

        const setCookie = flaskResponse.headers.get("Set-Cookie");
        if (setCookie) {
            nextResponse.headers.set("Set-Cookie", setCookie);
        }

        return nextResponse;
    } catch (error) {
        return NextResponse.json({ error: "Failed to register" }, { status: 500 });
    }
}

