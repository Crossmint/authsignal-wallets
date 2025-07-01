import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authsignalServer } from "@/app/lib/authsignal-server";

export async function POST(request: NextRequest) {
  try {
    const { token, userId } = await request.json();

    if (!token || !userId) {
      return NextResponse.json(
        { error: "token and userId required" },
        { status: 400 }
      );
    }

    const response = await authsignalServer.validateChallenge({
      token,
      userId,
    });

    const success = response.state === "CHALLENGE_SUCCEEDED";

    return NextResponse.json({
      success,
      state: response.state,
      userId: response.userId,
    });
  } catch (error) {
    console.error("Auth validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate auth" },
      { status: 500 }
    );
  }
}
