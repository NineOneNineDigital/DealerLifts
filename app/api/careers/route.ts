import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.position || !data.message) {
      return NextResponse.json(
        { error: "Name, email, position, and message are required" },
        { status: 400 }
      );
    }

    // In production, send email and/or store in database
    console.log("Career application submission:", {
      name: data.name,
      email: data.email,
      phone: data.phone,
      position: data.position,
      experience: data.experience,
      message: data.message,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 }
    );
  }
}
