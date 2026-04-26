import { useState, useRef, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, QrCode } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function QRGeneratorPage() {
  const { session } = useAuth();
  const [qrStyle, setQrStyle] = useState<"rounded" | "square">("rounded");
  const [fgColor, setFgColor] = useState("#F59E0B");
  const [bgColor, setBgColor] = useState("#111827");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const userId = session?.user?.id ?? "";
  
  // Create base URL cleanly, handling trailing slashes if present
  const envUrl = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  const baseUrl = `${envUrl.replace(/\/+$/, '')}/menu`;
  
  // Include user id for scoping the account's menu
  const fullUrl = userId ? `${baseUrl}?uid=${encodeURIComponent(userId)}` : baseUrl;

  const generateQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !userId) return;

    try {
      await QRCode.toCanvas(canvas, fullUrl, {
        width: 280,
        margin: 2,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "M",
      });

      if (qrStyle === "rounded") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.globalCompositeOperation = "destination-in";
          const radius = 16;
          const w = canvas.width;
          const h = canvas.height;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(w - radius, 0);
          ctx.quadraticCurveTo(w, 0, w, radius);
          ctx.lineTo(w, h - radius);
          ctx.quadraticCurveTo(w, h, w - radius, h);
          ctx.lineTo(radius, h);
          ctx.quadraticCurveTo(0, h, 0, h - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.fill();
          ctx.globalCompositeOperation = "source-over";
        }
      }
    } catch {
      // invalid data, ignore
    }
  }, [fullUrl, fgColor, bgColor, qrStyle, userId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generateQR, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [generateQR]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bistrobox-qr.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">QR Code Generator</h1>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Label>Generated Menu URL</Label>
            <Input value={userId ? fullUrl : "Loading..."} readOnly className="text-muted-foreground text-xs" />
            <p className="text-xs text-muted-foreground">
              This QR links customers directly to <strong>your</strong> menu.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
            <RadioGroup value={qrStyle} onValueChange={(v) => setQrStyle(v as "rounded" | "square")}>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="rounded" id="rounded" />
                <Label htmlFor="rounded" className="cursor-pointer">Rounded dots</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="square" id="square" />
                <Label htmlFor="square" className="cursor-pointer">Square dots</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fg-color">QR Color</Label>
              <div className="flex items-center gap-2">
                <input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="text-sm text-muted-foreground">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bg-color">Background</Label>
              <div className="flex items-center gap-2">
                <input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-10 cursor-pointer rounded border border-border bg-transparent"
                />
                <span className="text-sm text-muted-foreground">{bgColor}</span>
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            disabled={!userId}
            className="gap-2"
          >
            <Download className="h-4 w-4" /> Download PNG
          </Button>
        </div>

        <div className="flex items-start justify-center">
          <div className="glass-card flex flex-col items-center rounded-xl p-8">
            {userId ? (
              <canvas ref={canvasRef} />
            ) : (
              <div className="flex h-[280px] w-[280px] items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground/20" />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Debug Info for Admin */}
      <div className="mt-12 pt-6 border-t border-border/50 opacity-30 hover:opacity-100 transition-opacity">
        <p className="text-[10px] font-mono text-muted-foreground break-all">
          DEBUG: UID={userId} | URL={fullUrl}
        </p>
      </div>
    </div>
  );
}
