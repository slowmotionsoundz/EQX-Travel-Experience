import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from './Button';
import { motion, AnimatePresence } from 'motion/react';

interface SignatureProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

export function SignaturePadCard({ onSave, onClear }: SignatureProps) {
  const padRef = useRef<SignaturePad>(null);
  const [hasContent, setHasContent] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleEnd = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      setHasContent(true);
    } else {
      setHasContent(false);
    }
  };

  const handleSave = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      onSave(padRef.current.getCanvas().toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    if (padRef.current) {
      setIsClearing(true);
      setTimeout(() => {
        if (padRef.current) {
          padRef.current.clear();
        }
        setHasContent(false);
        setIsClearing(false);
        onClear();
      }, 200); // Wait for the visual fade before actually clearing data
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-[var(--color-surface-inset)] overflow-hidden shadow-inner relative">
        <motion.div
          animate={isClearing ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full h-full"
        >
          <SignaturePad
            ref={padRef}
            canvasProps={{
              className: 'w-full h-48 cursor-crosshair touch-none',
              style: { backgroundColor: 'transparent' }
            }}
            penColor="var(--color-accent)"
            onEnd={handleEnd}
          />
        </motion.div>
      </div>
      <div className="flex justify-end space-x-2 relative z-10 w-full pr-4">
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
  );
}
