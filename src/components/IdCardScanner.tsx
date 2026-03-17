import { useState, useRef } from 'react';
import { CreditCard, Loader2, CheckCircle, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import BarcodeReader from './BarcodeReader';

interface IdCardScannerProps {
  onScan: (studentId: string) => void;
}

export function IdCardScanner({ onScan }: IdCardScannerProps) {
  const [studentId, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const handleScan = async (idToUse?: string) => {
    const finalId = idToUse || studentId;
    if (!finalId.trim()) return;
    
    setIsScanning(true);
    setShowCamera(false);
    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsScanning(false);
    setScanned(true);
    
    setTimeout(() => {
      onScan(finalId);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div
        className={cn(
          'relative mx-auto flex min-h-[12rem] w-full max-w-[20rem] flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden',
          isScanning && 'border-primary bg-primary/5 animate-pulse-soft',
          scanned && 'border-primary bg-primary/10',
          !isScanning && !scanned && 'border-border bg-muted/50'
        )}
      >
        {showCamera ? (
          <div className="relative w-full">
            <BarcodeReader 
              onDetected={(decodedText) => {
                setStudentId(decodedText);
                handleScan(decodedText);
              }} 
            />
            <Button 
              size="icon" 
              variant="destructive" 
              className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full"
              onClick={() => setShowCamera(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : scanned ? (
          <CheckCircle className="h-16 w-16 text-primary animate-scale-in" />
        ) : isScanning ? (
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        ) : (
          <>
            <CreditCard className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Scan barcode or enter manually
            </p>
          </>
        )}
      </div>

      {!scanned && !isScanning && (
        <div className="flex flex-col gap-4">
          {!showCamera ? (
             <>
              <Button
                onClick={() => setShowCamera(true)}
                variant="outline"
                size="lg"
                className="w-full h-14 rounded-2xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary font-bold"
              >
                <Camera className="mr-2 h-5 w-5" />
                Scan with Camera
              </Button>
              <div className="relative flex items-center gap-4 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">OR MANUALLY</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Input
                type="text"
                placeholder="Enter Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                className="h-12 text-center text-lg font-medium tracking-wider rounded-xl border-2 focus-visible:ring-primary/20"
              />
              <Button
                onClick={() => handleScan()}
                disabled={!studentId.trim()}
                variant="hero"
                size="lg"
                className="w-full h-14 rounded-2xl shadow-glow"
              >
                Continue Verification
              </Button>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Align barcode within the frame
            </p>
          )}
        </div>
      )}

      {(scanned || isScanning) && !showCamera && (
        <div className="text-center animate-scale-in">
          <p className="text-lg font-bold text-[#112250]">{studentId}</p>
          <p className="text-sm text-muted-foreground">
            {isScanning ? 'Verifying student record...' : 'Identity confirmed'}
          </p>
        </div>
      )}
    </div>
  );
}
