"use client";

import { createAuthsignal } from "@/app/lib/authsignal-client";
import { useState } from "react";

type ApiError = {
  error?: string;
};

type WalletData = {
  walletAddress: string;
  usdcBalance: string;
};

type AuthData = {
  userId: string;
  token: string;
  isEnrolled: boolean;
  hasSmsEnrolled: boolean;
};

type UserData = AuthData & ApiError & WalletData;

type ValidationData = {
  success: boolean;
  state: string;
  userId: string;
} & ApiError &
  WalletData;

export default function SMSAuth() {
  const [currentStep, setCurrentStep] = useState("phone-input");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);

  const sendSMS = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      // get token from server
      const response = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = (await response.json()) as UserData;
      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      setUserData(data);

      // Send SMS with Authsignal
      const authsignal = await createAuthsignal();
      authsignal.setToken(data.token);

      const smsResult = !data.hasSmsEnrolled
        ? await authsignal.sms.enroll({ phoneNumber })
        : await authsignal.sms.challenge();

      if (smsResult.error) {
        setErrorMessage(smsResult.error);
        return;
      }

      setCurrentStep("code-input");
    } catch (err) {
      setErrorMessage(`Something went wrong: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setErrorMessage("");
    setLoading(true);

    try {
      const authsignal = await createAuthsignal();
      const verifyResult = await authsignal.sms.verify({ code: otpCode });

      if (verifyResult.error) {
        setErrorMessage(verifyResult.error);
        return;
      }

      if (!verifyResult.data?.isVerified) {
        setErrorMessage("Code verification failed");
        return;
      }

      // validate with server
      const response = await fetch("/api/auth/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: verifyResult.data.token,
          userId: userData?.userId,
        }),
      });

      const data = (await response.json()) as ValidationData;
      if (data.error || !data.success) {
        setErrorMessage(data.error || "Validation failed");
        return;
      }

      if (userData) {
        setUserData({
          ...userData,
          walletAddress: data.walletAddress,
          usdcBalance: data.usdcBalance,
        });
      }

      setCurrentStep("success");
    } catch (err) {
      setErrorMessage(`Something went wrong: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // reset
  const startOver = () => {
    setCurrentStep("phone-input");
    setPhoneNumber("");
    setOtpCode("");
    setErrorMessage("");
    setUserData(null);
  };

      return (
      <div className="max-w-md mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-8 text-black">
          SMS Authentication
        </h1>

      {/* Show errors if any */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      {currentStep === "phone-input" && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-bold mb-2 text-black"
            >
              Phone Number (with country code)
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890"
              className="w-full p-3 border-2 rounded-lg text-lg text-black"
            />
            <p className="text-xs text-black mt-1">
              We&apos;ll create an account if you&apos;re new, or sign you in if
              you exist
            </p>
          </div>

          <button
            type="button"
            onClick={sendSMS}
            disabled={loading || !phoneNumber}
            className="w-full bg-blue-500 text-white text-lg font-bold py-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending SMS..." : "Send SMS Code"}
          </button>
        </div>
      )}

      {currentStep === "code-input" && (
        <div className="space-y-4">
                      <div className="text-center">
              <p className="text-black mb-4">
                We sent a code to <strong>{phoneNumber}</strong>
              </p>
              <p className="text-sm text-black">
                {userData?.hasSmsEnrolled
                  ? "Sign-in code"
                  : "New account enrollment"}
              </p>
            </div>

                      <div>
              <label htmlFor="otpCode" className="block text-sm font-bold mb-2 text-black">
                Enter the 6-digit code
              </label>
              <input
                id="otpCode"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="w-full p-3 border-2 rounded-lg text-center text-2xl font-mono text-black"
              />
            </div>

          <button
            type="button"
            onClick={verifyCode}
            disabled={loading || otpCode.length < 6}
            className="w-full bg-green-500 text-white text-lg font-bold py-4 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={startOver}
            className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      )}

      {currentStep === "success" && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-green-600">
            Authentication Successful!
          </h2>
          <p className="text-black">
            User <strong>{userData?.userId}</strong> is now authenticated with
            SMS OTP!
            <br />
            <p>
              {userData?.hasSmsEnrolled
                ? "Successfully signed in"
                : "Account created & phone enrolled"}
            </p>
            <p>
              Wallet address: <strong>{userData?.walletAddress}</strong>
            </p>
            <p>
              USDC balance: <strong>{userData?.usdcBalance}</strong>
            </p>
          </p>
          <button
            type="button"
            onClick={startOver}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-bold"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
