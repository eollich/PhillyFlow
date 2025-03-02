import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { eventId: string } }) {

    const { eventId } = params;

    if (!eventId) {
        return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
    }
    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
        return NextResponse.json({ error: "No cookies found" }, { status: 400 });
    }
    try {
        const body = await req.json();
        const flaskResponse = await fetch(`http://localhost:5858/events/edit_event/${eventId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader || "",
            },
            credentials: "include",
            body: JSON.stringify(body),
        });

        const responseBody = await flaskResponse.json();

        return new NextResponse(JSON.stringify(responseBody), {
            status: flaskResponse.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Origin": "http://localhost:3000",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to edit event" }, { status: 500 });
    }
}
