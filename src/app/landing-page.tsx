import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
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
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-primary text-white font-semibold shadow hover:bg-primary/90 transition"
          >
            Restaurant Login
          </Link>
          <Link
            href="/menu/demo"
            className="px-6 py-3 rounded-lg border border-primary text-primary font-semibold hover:bg-primary/10 transition"
          >
            View Demo Menu
          </Link>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-medium mb-2">Scan QR Code</h2>
          <img
            src="/qr-demo.svg"
            alt="Scan QR code to view menu"
            className="mx-auto w-40 h-40 border rounded-lg shadow"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Point your phone camera at the QR code to open the menu directly.
          </p>
        </div>
      </div>
    </main>
  );
}
