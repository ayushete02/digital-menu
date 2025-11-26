"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const router = useRouter();

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          // Handle successful scan
          console.log("QR Code detected:", decodedText);
          
          // Stop scanning
          stopScanning();
          
          // Navigate to the scanned URL
          if (decodedText.startsWith("http")) {
            // If it's a full URL, extract the path
            try {
              const url = new URL(decodedText);
              router.push(url.pathname);
            } catch {
              // If URL parsing fails, just navigate to the text
              router.push(decodedText);
            }
          } else {
            // If it's a path, navigate directly
            router.push(decodedText);
          }
        },
        (errorMessage) => {
          // Handle scan error (can be ignored as it fires continuously)
          console.log("Scan error:", errorMessage);
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);
      setError("Failed to access camera. Please ensure camera permissions are granted.");
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full px-6 py-4 rounded-lg bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition flex items-center justify-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Scan QR Code
          </button>
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div
            id="qr-reader"
            className="w-full rounded-lg overflow-hidden border-2 border-primary shadow-lg"
          />
          <button
            onClick={stopScanning}
            className="w-full px-6 py-3 rounded-lg border border-destructive text-destructive font-semibold hover:bg-destructive/10 transition flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Stop Scanning
          </button>
          <p className="text-sm text-muted-foreground text-center">
            Point your camera at a QR code to scan
          </p>
        </div>
      )}
    </div>
  );
}
