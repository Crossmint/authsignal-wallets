const tenantId = process.env.NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID ?? "";
const baseUrl = process.env.NEXT_PUBLIC_AUTHSIGNAL_BASE_URL ?? "";

if (!tenantId) {
  throw new Error(
    "NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID environment variable is required"
  );
}

if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_AUTHSIGNAL_BASE_URL environment variable is required"
  );
}

// need dynamic import to avoid SSR issues
export const createAuthsignal = async () => {
  const { Authsignal } = await import("@authsignal/browser");
  return new Authsignal({
    tenantId,
    baseUrl,
  });
};
