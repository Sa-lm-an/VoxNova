import React, { useState, useEffect } from "react";
import Quagga from "@ericblade/quagga2";
import { Button } from "./ui/button";

interface BarcodeReaderProps {
  onDetected: (result: string) => void;
}

const BarcodeReader: React.FC<BarcodeReaderProps> = ({ onDetected }) => {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const initializeQuagga = () => {
      console.log("Initializing Quagga...");
      Quagga.init(
        {
          inputStream: {
            type: "LiveStream",
            target: document.querySelector('#interactive') as HTMLElement,
            constraints: {
              width: { min: 640 },
              height: { min: 480 },
              facingMode: "environment",
              aspectRatio: { min: 1, max: 2 }
            },
          },
          locator: {
            patchSize: "medium",
            halfSample: true,
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: ["code_128_reader", "ean_reader", "ean_8_reader", "upc_reader", "code_39_reader"],
          },
          locate: true,
        },
        (err) => {
          if (err) {
            console.error("Quagga initialization error:", err);
            return;
          }
          console.log("Quagga initialized successfully. Starting...");
          Quagga.start();
        },
      );

      Quagga.onDetected((data) => {
        const code = data.codeResult.code;
        console.log('Barcode detected and processed:', code);
        if (code !== null) {
          onDetected(code);
          setScanning(false); // stop scanning when a code is detected
        }
      });
    };

    if (scanning) {
      initializeQuagga();
    }

    return () => {
      if (scanning) {
        console.log("Stopping Quagga...");
        Quagga.stop();
      }
    };
  }, [scanning, onDetected]);

  const handleScan = () => {
    setScanning(true);
  };

  const handleStop = () => {
    setScanning(false);
    Quagga.stop();
  };

  return (
    <div className="flex flex-col items-center justify-center rounded-md border p-2 py-4 bg-white/5 dark:bg-black/20">
      <div
        id="interactive"
        className="viewport m-2 max-h-[210px] min-h-[210px] w-full max-w-[280px] overflow-hidden rounded-lg bg-black md:max-h-[300px] md:min-h-[300px] md:max-w-[400px]"
      />
      <div className="mt-4 flex items-center justify-center gap-4">
        <Button onClick={handleScan} variant={scanning ? "outline" : "hero"}>
          {scanning ? "Scanning..." : "Start Scan"}
        </Button>
        {scanning && (
          <Button onClick={handleStop} variant="destructive">
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};

export default BarcodeReader;
