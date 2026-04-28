import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import { Button } from './Button';

interface SignatureProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

export function SignaturePadCard({ onSave, onClear }: SignatureProps) {
  const padRef = useRef<SignaturePad>(null);
  const [hasContent, setHasContent] = useState(false);

  const handleEnd = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      setHasContent(true);
    } else {
      setHasContent(false);
    }
  };

  const handleSave = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      onSave(padRef.current.getTrimmedCanvas().toDataURL('image/png'));
    }
  };

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setHasContent(false);
      onClear();
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="rounded-2xl border border-gray-800 bg-[var(--color-surface-inset)] overflow-hidden shadow-inner">
        <SignaturePad
          ref={padRef}
          canvasProps={{
            className: 'w-full h-48 cursor-crosshair touch-none',
            style: { backgroundColor: 'transparent' }
          }}
          penColor="var(--color-accent)"
          onEnd={handleEnd}
        />
      </div>
      <div className="flex justify-end space-x-2 relative z-10 w-full mb-2 pr-4">
        {hasContent && (
          <Button variant="ghost" size="sm" onClick={handleClear} className="text-gray-400 z-20">
            Clear
          </Button>
        )}
        <Button size="sm" onClick={handleSave} disabled={!hasContent} className="z-20">
          Save
        </Button>
      </div>
    </div>
  );
}
