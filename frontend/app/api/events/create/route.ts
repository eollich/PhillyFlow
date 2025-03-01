
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) {
        return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }
    try {
        const body = await req.json();

        const flaskResponse = await fetch("http://localhost:5858/events/create_event", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader || "",
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


        return nextResponse;
    } catch (error) {
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
