"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function QrScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraId, setCameraId] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isInitializedRef = useRef(false);
  const router = useRouter();

  // Check camera permissions and get camera ID
  const checkCameraPermissions = async () => {
    try {
      // First, request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach((track) => track.stop());

      // Now get available cameras
      const devices = await Html5Qrcode.getCameras();

      if (devices && devices.length > 0) {
        // Prefer back camera
        const backCamera = devices.find(
          (device) =>
            device.label.toLowerCase().includes("back") ||
            device.label.toLowerCase().includes("rear") ||
            device.label.toLowerCase().includes("environment")
        );

        const selectedCamera = backCamera ?? devices[0];
        if (selectedCamera) {
          setCameraId(selectedCamera.id);
          return true;
        }
      }

      setError("No cameras found on this device.");
      return false;
    } catch (err) {
      console.error("Camera permission error:", err);

      if (err instanceof Error) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setError(
            "Camera permission denied. Please allow camera access in your browser settings and refresh the page."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError(
            "Camera is being used by another application. Please close other apps using the camera."
          );
        } else {
          setError(
            "Failed to access camera. Please check your browser settings."
          );
        }
      } else {
        setError(
          "Failed to access camera. Please check your browser settings."
        );
      }

      return false;
    }
  };

  const startScanning = async () => {
    try {
      setError(null);

      // Check permissions first
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission || !cameraId) {
        return;
      }

      // Clean up any existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }

      // Create new scanner instance
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
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
          // Only log in development
          if (process.env.NODE_ENV === "development") {
            console.log("Scan error:", errorMessage);
          }
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Failed to start scanner:", err);

      if (err instanceof Error) {
        setError(`Scanner error: ${err.message}`);
      } else {
        setError("Failed to start scanner. Please try again.");
      }

      setIsScanning(false);

      // Clean up on error
      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
          scannerRef.current = null;
        } catch (e) {
          console.log("Cleanup error:", e);
        }
      }
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
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

  useEffect(() => {
    // Initialize camera on mount
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      checkCameraPermissions();
    }

    return () => {
      // Cleanup on unmount
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(console.error);
      }
    };
  }, []);

  return (
    <div className="w-full">
      {!isScanning ? (
        <div className="space-y-4">
          <button
            onClick={startScanning}
            disabled={!cameraId}
            className="w-full px-6 py-4 rounded-lg bg-primary text-white font-semibold shadow-lg hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="w-5 h-5" />
            {cameraId ? "Scan QR Code" : "Checking Camera..."}
          </button>
          {error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">Camera Access Issue</p>
                <p>{error}</p>
                <button
                  onClick={checkCameraPermissions}
                  className="mt-3 text-xs underline hover:no-underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          {!error && cameraId && (
            <p className="text-xs text-muted-foreground text-center">
              Click the button above to start scanning
            </p>
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
