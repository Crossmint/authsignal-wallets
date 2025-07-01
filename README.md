# SMS Authentication with Authsignal + Crossmint Wallets

SMS OTP authentication integration with Authsignal and Crossmint wallet creation.

## What This Does

- User enters phone number
- Sends SMS code via Authsignal + Bird
- User enters code
- Creates/retrieves Crossmint wallet on successful authentication
- Shows wallet address and USDC balance

## Setup Steps

### 1. Authsignal Account Setup

1. Create account at [Authsignal](https://portal.authsignal.com)
2. Get your credentials:
   - Tenant ID
   - Base URL
   - Secret Key

### 2. Bird SMS Setup (Required for SMS delivery)

1. Create account at [Bird](https://bird.com)
2. Add a US phone number
3. Get Bird credentials
4. In Authsignal dashboard, integrate Bird SMS with these **required roles**:
   - `Reach Email Admin`
   - `Channels API Client` ← **Most important**

### 3. Environment Variables

Create `.env.local`:

```bash
# Authsignal Server (server)
AUTHSIGNAL_SECRET_KEY=your_secret_key_here

# Authsignal Client (public)
NEXT_PUBLIC_AUTHSIGNAL_TENANT_ID=your_tenant_id_here
NEXT_PUBLIC_AUTHSIGNAL_BASE_URL=https://api.authsignal.com/v1

# Crossmint API Key (server)
CROSSMINT_API_KEY=your_api_key_here
```

### 4. Run the App

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`

## How It Works

1. **Phone Input** → User enters phone number
2. **Server** → Creates token via Authsignal API
3. **SMS** → Authsignal + Bird send SMS code
4. **Code Input** → User enters 6-digit code  
5. **Success** → Creates/retrieves Crossmint wallet and shows balance

## Troubleshooting

- **403 Forbidden**: Check Bird roles (need `Channels API Client`)
- **SMS not sending**: Verify Bird integration in Authsignal dashboard
- **Token errors**: Check environment variables

## API Docs

- [Server SDK](https://docs.authsignal.com/sdks/server/overview)
- [Client SDK](https://docs.authsignal.com/sdks/client/web)

## Files

```
app/
├── components/sms-auth.tsx       ← Main component
├── lib/authsignal-client.ts      ← Client utilities  
├── api/auth/init/route.ts        ← Get token
├── api/auth/validate/route.ts    ← Validate token
└── lib/authsignal-server.ts      ← Server client
```