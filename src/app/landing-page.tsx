import Link from "next/link";
import QRCode from "react-qr-code";
import { QrScanner } from "./_components/qr-scanner";

export default function LandingPage() {
  const restaurantsUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/restaurants`
    : "https://digitalmenu02.vercel.app/restaurants";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-white to-gray-100 px-4 py-8">
      <div className="max-w-xl w-full space-y-8">
        {/* Mobile: QR Scanner at top */}
        <div className="md:hidden space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-primary">
              Welcome to Digital Menu
            </h1>
            <p className="text-base text-muted-foreground mt-3">
              Scan a restaurant QR code to view their menu instantly
            </p>
          </div>
          <QrScanner />
        </div>

        {/* Desktop: Traditional layout */}
        <div className="hidden md:block text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-primary">
            Welcome to Digital Menu
          </h1>
          <p className="text-lg text-muted-foreground">
            Scan a QR code at your table or enter a menu link to view the
            restaurant menu instantly on your mobile device. No app required.
          </p>
        </div>

        {/* Action buttons - shown on both mobile and desktop */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="/restaurants"
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition text-center"
          >
            Browse Restaurants
          </Link>
          <Link
            href="/dashboard"
            className="w-full md:w-auto px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition text-center"
          >
            Restaurant Login
          </Link>
        </div>

        {/* Desktop QR Code display / Mobile: Additional info at bottom */}
        <div className="mt-8">
          {/* Desktop: Show QR code */}
          <div className="hidden md:block text-center">
            <h2 className="text-lg font-medium mb-4">
              Scan to Browse Restaurants
            </h2>
            <div className="mx-auto w-48 h-48 bg-white p-4 rounded-lg shadow-lg border">
              <QRCode
                value={restaurantsUrl}
                size={176}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Point your phone camera at the QR code to browse all available
              menus.
            </p>
          </div>

          {/* Mobile: Additional information */}
          <div className="md:hidden space-y-4 text-center">
            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold text-primary mb-2">
                How It Works
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the scanner above to scan any restaurant&apos;s menu QR code, or
                browse all available restaurants using the button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
