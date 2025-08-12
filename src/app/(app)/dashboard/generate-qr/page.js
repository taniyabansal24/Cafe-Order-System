"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
      const url = `${window.location.origin}/menu/${ownerId}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${url}`;

      await axios.post("/api/qr/save", {
        ownerId,
        qrUrl: qrCodeUrl,
      });

      setQrUrl(qrCodeUrl);
      toast.success("QR code generated and saved!");
    } catch (error) {
      console.error("QR Generation Error:", error);
      toast.error("Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  // Proper download handler
  const downloadQR = async () => {
    try {
      // Fetch the QR code image as a blob
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `menu-qr-${ownerId}.png`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10">
      <Card className="p-6 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6">
          <h2 className="text-xl font-bold">QR Code for Your Menu</h2>

          {qrUrl ? (
            <div className="flex flex-col items-center gap-4 mt-6">
              <img
                src={qrUrl}
                alt="Generated QR"
                className="w-56 h-56 rounded-xl shadow-md border"
              />

              <div className="flex gap-4">
                <Button onClick={generateQr} disabled={loading}>
                  {loading ? "Regenerating..." : "Regenerate QR"}
                </Button>
                <Button onClick={downloadQR} variant="outline">
                  Download QR
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={generateQr} disabled={loading}>
              {loading ? "Generating..." : "Generate QR"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}