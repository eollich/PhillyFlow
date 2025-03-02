import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }
    try {
        const { eventId } = params;

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const flaskResponse = await fetch(`http://localhost:5858/events/join_event/${eventId}`, {
            method: "POST",
            headers: {
                Cookie: cookieHeader || "",
            },
            credentials: "include",
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
        return NextResponse.json({ error: "Failed to join event" }, { status: 500 });
    }
}
