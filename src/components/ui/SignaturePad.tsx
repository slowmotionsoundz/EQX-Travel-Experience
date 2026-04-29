import React, { useRef, useState, useEffect } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, Type, Upload } from 'lucide-react';

interface SignatureProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

export function SignaturePadCard({ onSave, onClear }: SignatureProps) {
  const padRef = useRef<SignaturePad>(null);
  const [hasContent, setHasContent] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  const [typedName, setTypedName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [ipAddress, setIpAddress] = useState('Fetching IP...');
  const [timestamp, setTimestamp] = useState(new Date().toISOString());

  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress('Unknown IP'));
  }, []);

  useEffect(() => {
    if (mode === 'type') {
      setHasContent(typedName.trim().length > 0);
    } else if (mode === 'upload') {
      setHasContent(uploadedImage !== null);
    } else if (mode === 'draw') {
      setHasContent(padRef.current ? !padRef.current.isEmpty() : false);
    }
  }, [mode, typedName, uploadedImage]);

  const handleEnd = () => {
    if (mode === 'draw' && padRef.current && !padRef.current.isEmpty()) {
      setHasContent(true);
    } else {
      setHasContent(false);
    }
  };

  const drawMetadataAndReturnDataURL = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      ctx.font = '10px monospace';
      ctx.fillStyle = '#666666';
      ctx.textAlign = 'left';
      
      const currentTimestamp = new Date().toISOString();
      setTimestamp(currentTimestamp);
      
      ctx.fillText(`IP: ${ipAddress}`, 10, canvas.height - 20);
      ctx.fillText(`Time: ${currentTimestamp}`, 10, canvas.height - 8);
      ctx.restore();
    }
    return canvas.toDataURL('image/png');
  };

  const handleSave = () => {
    if (mode === 'draw' && padRef.current && !padRef.current.isEmpty()) {
      const origCanvas = padRef.current.getCanvas();
      const canvas = document.createElement('canvas');
      canvas.width = origCanvas.width;
      canvas.height = origCanvas.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(origCanvas, 0, 0);
      }
      onSave(drawMetadataAndReturnDataURL(canvas));
    } else if (mode === 'type' && typedName.trim() !== '') {
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 200;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = 'italic 48px serif';
        ctx.fillStyle = '#0C6B70';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);
      }
      onSave(drawMetadataAndReturnDataURL(canvas));
    } else if (mode === 'upload' && uploadedImage) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 500;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const dx = (canvas.width - drawWidth) / 2;
          const dy = (canvas.height - drawHeight) / 2;
          ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
        }
        onSave(drawMetadataAndReturnDataURL(canvas));
      };
      img.src = uploadedImage;
    }
  };

  const handleClear = () => {
    setIsClearing(true);
    setTimeout(() => {
      if (mode === 'draw' && padRef.current) {
        padRef.current.clear();
      }
      setTypedName('');
      setUploadedImage(null);
      setHasContent(false);
      setIsClearing(false);
      onClear();
    }, 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setHasContent(true);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex space-x-2 border-b border-gray-700 pb-2">
        <button 
          onClick={() => setMode('draw')}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'draw' ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] shadow-soft-pressed' : 'text-gray-400 hover:text-white'}`}
        >
          <PenTool size={14} /> <span>Draw</span>
        </button>
        <button 
          onClick={() => setMode('type')}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'type' ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] shadow-soft-pressed' : 'text-gray-400 hover:text-white'}`}
        >
          <Type size={14} /> <span>Type</span>
        </button>
        <button 
          onClick={() => setMode('upload')}
          className={`flex items-center space-x-1 px-3 py-1.5 text-xs rounded-full transition-colors ${mode === 'upload' ? 'bg-[var(--color-surface-inset)] text-[var(--color-primary)] shadow-soft-pressed' : 'text-gray-400 hover:text-white'}`}
        >
          <Upload size={14} /> <span>Upload</span>
        </button>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-[var(--color-surface-inset)] overflow-hidden shadow-inner relative h-48">
        <motion.div
           animate={isClearing ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
           transition={{ duration: 0.2, ease: "easeOut" }}
           className="w-full h-full relative"
        >
           {mode === 'draw' && (
             <SignaturePad
               ref={padRef}
               canvasProps={{
                 className: 'w-full h-full cursor-crosshair touch-none',
                 style: { backgroundColor: 'transparent' }
               }}
               penColor="#0C6B70"
               onEnd={handleEnd}
             />
           )}
           {mode === 'type' && (
             <div className="w-full h-full flex items-center justify-center p-4">
               <input 
                 type="text" 
                 value={typedName}
                 onChange={(e) => setTypedName(e.target.value)}
                 placeholder="Type your full name"
                 className="w-full bg-transparent text-center focus:outline-none border-b border-gray-600 focus:border-[#0C6B70] text-3xl italic text-[#0C6B70] placeholder-gray-500 transition-colors py-2"
               />
             </div>
           )}
           {mode === 'upload' && (
             <div className="w-full h-full flex flex-col items-center justify-center p-4">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Signature" className="max-h-full max-w-full object-contain" />
                ) : (
                  <label className="cursor-pointer flex flex-col items-center space-y-3 text-gray-500 hover:text-gray-300 transition-colors border-2 border-dashed border-gray-700 rounded-xl p-8 w-full max-w-xs text-center">
                    <Upload size={32} />
                    <span className="text-sm">Click to upload signature</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
             </div>
           )}
        </motion.div>
      </div>
      
      <div className="flex justify-between items-end relative z-10 w-full pr-4">
        <div className="text-[10px] text-gray-500 font-mono flex flex-col gap-0.5 pointer-events-none">
           <span>IP: {ipAddress}</span>
           <span>Time: {timestamp}</span>
        </div>
        <div className="flex space-x-2">
          <AnimatePresence>
            {hasContent && !isClearing && (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)", x: 5 }}
                animate={{ opacity: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="ghost" size="sm" onClick={handleClear} className="text-[var(--color-text-secondary)] hover:text-white z-20 transition-colors">
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <Button size="sm" onClick={handleSave} disabled={!hasContent || isClearing} className="z-20">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
