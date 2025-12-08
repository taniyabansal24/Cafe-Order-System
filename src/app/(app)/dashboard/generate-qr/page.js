"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

export default function GenerateQrPage() {
  const { data: session, status } = useSession();
  const [qrUrl, setQrUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const ownerId = session?.user?._id;

  // Fetch saved QR code when the component loads
  useEffect(() => {
    const fetchQr = async () => {
      if (!ownerId) return;

      try {
        const res = await axios.get(`/api/qr/get?ownerId=${ownerId}`);
        if (res.data.qrUrl) {
          setQrUrl(res.data.qrUrl);
        }
      } catch (err) {
        console.log("No saved QR found.");
      }
    };

    fetchQr();
  }, [ownerId]);

  // Handle QR code generation and saving
  const generateQr = async () => {
    if (!ownerId) return toast.error("User not logged in");

    setLoading(true);
    try {
      // Point to your order page
      const url = `${window.location.origin}/order`;

      // Generate QR code with the order page URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

      await axios.post("/api/qr/save", {
        ownerId,
        qrUrl: qrCodeUrl,
      });

      setQrUrl(qrCodeUrl);
      toast.success("QR code generated and saved!");
      toast.info("When scanned, this QR will open your order menu page");
    } catch (error) {
      console.error("QR Generation Error:", error);
      toast.error("Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  // Proper download handler
  const downloadQR = async () => {
    if (!qrUrl) return;

    try {
      // Fetch the QR code image as a blob
      const response = await fetch(qrUrl);
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cafe-menu-qr.png`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("QR code downloaded!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    }
  };

  if (status === "loading")
    return <div className="text-foreground">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 lg:flex flex-row justify-between lg:max-w-max lg:gap-8">
      {/* QR Code Card */}
      <Card className="p-6 shadow-lg bg-card border-border">
        <CardContent className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-bold text-center text-foreground">
            QR Code for Your Menu
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Generate a QR code that customers can scan to view your menu and
            place orders
          </p>

          {qrUrl ? (
            <div className="flex flex-col items-center gap-4 mt-6">
              <Image
                src={qrUrl}
                alt="Menu QR Code"
                width={224} // 56 * 4 (approx to match w-56)
                height={224} // 56 * 4 (approx to match h-56)
                className="w-56 h-56 rounded-xl shadow-md border border-border"
                unoptimized // add this if qrUrl is a blob/base64/dynamic URL
              />

              <div className="text-center">
                <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                  ✓ QR code points to:{" "}
                  <strong className="text-foreground">
                    {window.location.origin}/order
                  </strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Scan this code to test your menu page
                </p>
              </div>

              <div className="flex gap-4 flex-wrap justify-center">
                <Button onClick={generateQr} disabled={loading}>
                  {loading ? "Regenerating..." : "Regenerate QR"}
                </Button>
                <Button onClick={downloadQR} variant="outline">
                  Download QR
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button onClick={generateQr} disabled={loading} className="mb-4">
                {loading ? "Generating..." : "Generate QR Code"}
              </Button>
              <p className="text-sm text-muted-foreground">
                This will create a QR code that opens your order menu page
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions section */}
      <Card className="mt-6 p-6 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 md:max-h-max">
        <CardContent>
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
            How to Use:
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
            <li>• Generate the QR code</li>
            <li>• Download and print it</li>
            <li>• Place it on tables or at the entrance</li>
            <li>• Customers scan it to view your menu</li>
            <li>• They can order directly from their phones</li>
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-3">
            Note: The QR code will work fully once your site is deployed to
            production
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
