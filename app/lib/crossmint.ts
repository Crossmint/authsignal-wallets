import { CrossmintWallets, createCrossmint } from "@crossmint/wallets-sdk";

const crossmintApiKey = process.env.CROSSMINT_API_KEY ?? "";

if (!crossmintApiKey) {
  throw new Error("CROSSMINT_API_KEY environment variable is required");
}

const crossmint = createCrossmint({
  apiKey: crossmintApiKey,
});

export const crossmintWallets = CrossmintWallets.from(crossmint);
