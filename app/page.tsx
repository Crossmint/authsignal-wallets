import SMSAuth from "@/app/components/sms-auth";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            SMS Authentication
          </h1>
          <p className="text-lg text-gray-600">
            Secure phone number verification using Authsignal
          </p>
        </div>

        <SMSAuth />
      </div>
    </div>
  );
}
