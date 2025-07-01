import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authsignalServer } from "@/app/lib/authsignal-server";

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber required" },
        { status: 400 }
      );
    }

    // Use phone number as userId
    const userId = phoneNumber.replace(/\+/g, "").replace(/\s/g, "");

    // Use "enroll" action for new users - this works for both new and existing
    const response = await authsignalServer.track({
      userId,
      action: "enroll",
      attributes: {
        phoneNumber,
        scope: "add:authenticators",
      },
    });

    return NextResponse.json({
      token: response.token,
      isEnrolled: response.isEnrolled || false,
      hasSmsEnrolled: false, // Client will determine this
      userId,
    });
  } catch (error) {
    console.error("Auth init error:", error);
    return NextResponse.json(
      { error: "Failed to initialize auth" },
      { status: 500 }
    );
  }
}
