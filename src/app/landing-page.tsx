import Link from "next/link";
import QRCode from "react-qr-code";

export default function LandingPage() {
  const restaurantsUrl = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/restaurants`
    : "https://digitalmenu02.vercel.app/restaurants";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-white to-gray-100 px-4">
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to Digital Menu
        </h1>
        <p className="text-lg text-muted-foreground">
          Scan a QR code at your table or enter a menu link to view the
          restaurant menu instantly on your mobile device. No app required.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
          <Link
            href="/restaurants"
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
          >
            Browse Restaurants
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition"
          >
            Restaurant Login
          </Link>
        </div>
        <div className="mt-8">
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
      </div>
    </main>
  );
}
