import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { location } = body;

        if (!location) {
            return NextResponse.json({ error: "Location is required" }, { status: 400 });
        }

        const cookieHeader = req.headers.get("cookie");
        if (!cookieHeader) {
            return NextResponse.json({ error: "No authentication" }, { status: 401 });
        }

        const flaskResponse = await fetch("http://localhost:5858/auth/update_location", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader,
            },
            credentials: "include",
            body: JSON.stringify({ location }),
        });

        const responseBody = await flaskResponse.json();

        return new NextResponse(JSON.stringify(responseBody), {
            status: flaskResponse.status,
            headers: {
                "Content-Type": "application/json",
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update location" }, { status: 500 });
    }
}
