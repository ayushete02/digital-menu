"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      const isSmallScreen = window.innerWidth < 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current.stop()
          .then(() => {
            if (scannerRef.current) {
              scannerRef.current.clear();
            }
          })
          .catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    // Don't allow scanning on desktop
    if (!isMobile) {
      setError("QR scanning is only available on mobile devices. Desktop users should use the QR code display below.");
      return;
    }

    try {
      setError(null);
      setIsReady(false);

      // Clean up any existing scanner first
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }

      // Small delay to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new scanner instance
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Start with back camera using facingMode
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      // Try to use back camera
      try {
        await scanner.start(
          { facingMode: "environment" }, // This requests back camera
          config,
          (decodedText) => {
            // Handle successful scan
            console.log("QR Code detected:", decodedText);

            // Stop scanning
            stopScanning();

            // Navigate to the scanned URL
            if (decodedText.startsWith("http")) {
              try {
                const url = new URL(decodedText);
                router.push(url.pathname);
              } catch {
                router.push(decodedText);
              }
            } else {
              router.push(decodedText);
            }
          },
          (errorMessage) => {
            // Scan errors are normal and continuous - ignore them
          }
        );
        setIsScanning(true);
        setIsReady(true);
      } catch (backCameraError) {
        console.log("Back camera failed, trying any available camera:", backCameraError);
        
        // If back camera fails, try to get any available camera
        const devices = await Html5Qrcode.getCameras();
        
        if (devices && devices.length > 0) {
          // Try with the first available camera
          await scanner.start(
            devices[0].id,
            config,
            (decodedText) => {
              console.log("QR Code detected:", decodedText);
              stopScanning();

              if (decodedText.startsWith("http")) {
                try {
                  const url = new URL(decodedText);
                  router.push(url.pathname);
                } catch {
                  router.push(decodedText);
                }
              } else {
                router.push(decodedText);
              }
            },
            (errorMessage) => {
              // Scan errors are normal - ignore
            }
          );
          setIsScanning(true);
          setIsReady(true);
        } else {
          throw new Error("No cameras available on this device");
        }
      }
    } catch (err) {
      console.error("Failed to start scanner:", err);
      
      setIsScanning(false);
      setIsReady(false);
      
      if (err instanceof Error) {
        if (err.message.includes("NotAllowedError") || err.message.includes("Permission")) {
          setError("Camera permission denied. Please allow camera access in your browser settings.");
        } else if (err.message.includes("NotFoundError") || err.message.includes("No cameras")) {
          setError("No camera found on this device.");
        } else if (err.message.includes("NotReadableError")) {
          setError("Camera is being used by another app. Please close other camera apps.");
        } else {
          setError(`Failed to start camera: ${err.message}`);
        }
      } else {
        setError("Failed to start camera. Please try again.");
      }
      
      // Clean up on error
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
          scannerRef.current = null;
        } catch (e) {
          console.log("Error cleanup failed:", e);
        }
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner:", err);
        // Force cleanup
        scannerRef.current = null;
        setIsScanning(false);
      }
    }
  };

  // Don't render scanner on desktop
  if (!isMobile) {
    return null;
  }

  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            className="w-full px-6 py-4 rounded-lg bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            Scan QR Code
          </button>
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Camera Access Issue</p>
                <p>{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    startScanning();
                  }}
                  className="mt-3 text-xs underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
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
