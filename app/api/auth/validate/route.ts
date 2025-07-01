import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authsignalServer } from "@/app/lib/authsignal-server";
import { crossmintWallets } from "@/app/lib/crossmint";

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

    // create a crossmint wallet
    // TODO: this could be done in a separate endpoint with JWT validation
    const wallet = await crossmintWallets.createWallet({
      chain: "base-sepolia",
      signer: {
        type: "api-key",
      },
      owner: `phoneNumber:${userId}`,
    });

    // fetch the wallet balances
    const { usdc } = await wallet.balances();

    return NextResponse.json({
      success,
      state: response.state,
      userId: response.userId,
      walletAddress: wallet.address,
      usdcBalance: usdc.amount,
    });
  } catch (error) {
    console.error("Auth validation error:", error);
    return NextResponse.json(
      { error: "Failed to validate auth" },
      { status: 500 }
    );
  }
}
