import { Authsignal } from "@authsignal/node";

const apiSecretKey = process.env.AUTHSIGNAL_SECRET_KEY ?? "";
const apiUrl = process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL ?? "";

if (!apiSecretKey) {
  throw new Error("AUTHSIGNAL_SECRET_KEY environment variable is required");
}

if (!apiUrl) {
  throw new Error(
    "NEXT_PUBLIC_AUTHSIGNAL_BASE_URL environment variable is required"
  );
}

export const authsignalServer = new Authsignal({
  apiSecretKey,
  apiUrl,
});
