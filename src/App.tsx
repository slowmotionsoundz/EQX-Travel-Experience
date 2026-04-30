import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { Input } from './components/ui/Input';
import { Checkbox } from './components/ui/Checkbox';
import { Plus, Trash2, ChevronRight, ChevronLeft, ShieldCheck, CreditCard, PenTool } from 'lucide-react';
import { cn } from './lib/utils';
import { SignaturePadCard } from './components/ui/SignaturePad';
import { Onboarding } from './components/Onboarding';
import { DatePicker } from './components/ui/DatePicker';
// Removed react-stripe-js imports
// import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// import { loadStripe } from '@stripe/stripe-js';

// Define the window.Stripe type locally
declare global {
  interface Window {
    Stripe?: any;
  }
}

const PaymentModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [processingState, setProcessingState] = React.useState<'idle' | 'processing' | 'confirmed'>('idle');

  React.useEffect(() => {
    if (!isOpen) {
      setProcessingState('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-[24px] bg-[var(--color-bg-base)] p-8 shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-inset)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] shadow-soft-raised transition-colors"
        >
          X
        </button>
        
        {processingState === 'idle' ? (
          <>
            <div className="mb-8 mt-2 text-center">
              <h2 className="text-2xl font-light text-[var(--color-text-primary)]">Complete Your Registration</h2>
              <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-2">Secure your spot — Nordic Sound Experience</p>
            </div>
            
            <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-6 mb-8 text-center shadow-soft-pressed">
              <p className="text-sm text-[var(--color-text-secondary)] uppercase tracking-widest mb-1">Total Due Now</p>
              <p className="text-3xl font-semibold text-[var(--color-accent)]">€3,500 <span className="text-sm font-normal text-[var(--color-text-secondary)]">deposit</span></p>
            </div>

            <a 
              href="https://buy.stripe.com/cNi4gyfV01Bx9qPckleME00"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                setProcessingState('processing');
                setTimeout(() => setProcessingState('confirmed'), 8000);
              }}
              className="w-full flex justify-center items-center h-14 rounded-[12px] bg-[var(--color-accent)] text-sm font-bold tracking-wider text-white shadow-soft-raised transition-all hover:bg-opacity-90"
            >
              PAY NOW
            </a>
          </>
        ) : processingState === 'processing' ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-surface-inset)] border-t-[var(--color-accent)] mb-6"></div>
            <h2 className="text-xl font-light text-[var(--color-text-primary)]">Awaiting Payment...</h2>
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-3 max-w-[250px] leading-relaxed">
              Please complete the transaction in the secure Stripe tab that just opened.
            </p>
          </div>
        ) : (
           <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded-full flex items-center justify-center mb-6">
              <ShieldCheck size={32} />
            </div>
            <h2 className="text-xl font-light text-[var(--color-text-primary)]">Registration Complete</h2>
            <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-3 leading-relaxed">
              We've received your data. Once Stripe verifies the payment, you will receive an email receipt.
            </p>
            <button 
              onClick={onClose}
              className="mt-8 px-8 flex justify-center items-center h-12 rounded-[12px] bg-[var(--color-surface-inset)] text-[11px] font-bold tracking-widest uppercase text-[var(--color-text-primary)] shadow-soft-raised transition-all hover:shadow-soft-pressed"
            >
              CLOSE WINDOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
};


type Traveler = {
  id: string;
  name: string;
  passport: string;
  passportExpiry: string;
  dob: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
  role: string;
};

const INITIAL_BASE_PRICE = 5500;
const EXTRA_SEAT_PRICE = 1100;
const DEPOSIT_PRICE = 3500;

const BASE_TRAVELERS_COUNT = 5;

const generateId = () => Math.random().toString(36).substr(2, 9);

export default function App() {
  const [view, setView] = React.useState<'welcome' | 'onboarding' | 'registration'>('welcome');
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const savedState = localStorage.getItem('registration_progress_global');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.travelers) setTravelers(parsed.travelers);
        if (parsed.agreement) setAgreement(parsed.agreement);
        if (parsed.signatureData) setSignatureData(parsed.signatureData);
        if (parsed.step) setStep(parsed.step);
        if (parsed.payFull !== undefined) setPayFull(parsed.payFull);
      } catch (e) {
        console.error("Failed to parse saved progress", e);
      }
    }
  }, []);

  const [travelers, setTravelers] = React.useState<Traveler[]>(
    Array.from({ length: 5 }).map(() => ({ id: generateId(), name: '', passport: '', passportExpiry: '', dob: '', addressLine1: '', city: '', state: '', country: '', role: '' }))
  );

  const [agreement, setAgreement] = React.useState({
    productionCredit: true,
    writingMechanicals: true,
    nonCompete: true,
    travelInsurance: false,
    liabilityRelease: false,
    travelResponsibility: false,
    cancellationInsurance: false,
  });

  const [signatureData, setSignatureData] = React.useState<string | null>(null);
  const [payFull, setPayFull] = React.useState(false);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);

  // Save progress to local storage when state changes
  React.useEffect(() => {
    const stateToSave = {
      travelers,
      agreement,
      signatureData,
      step,
      payFull
    };
    localStorage.setItem('registration_progress_global', JSON.stringify(stateToSave));
  }, [travelers, agreement, signatureData, step, payFull]);

  // Pricing calculation
  const extraSeats = Math.max(0, travelers.length - BASE_TRAVELERS_COUNT);
  const insuranceCost = agreement.cancellationInsurance ? travelers.length * 200 : 0;
  const totalPrice = INITIAL_BASE_PRICE + (extraSeats * EXTRA_SEAT_PRICE) + insuranceCost;
  const totalAmountDue = payFull ? totalPrice : DEPOSIT_PRICE + insuranceCost;

  const validateForm = () => {
    for (const t of travelers) {
      if (!t.name.trim() || !t.passport.trim() || !t.dob.trim() || !t.addressLine1.trim() || !t.city.trim() || !t.state.trim() || !t.country.trim()) {
        return "Please complete all required fields for travelers in Step 1. (Address Line 1, City, State/Province, Country)";
      }
      const validDobFormat = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$|^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!validDobFormat.test(t.dob.trim())) {
        return `Please provide a valid Date of Birth for ${t.name || 'a traveler'} in Step 1.`;
      }
      if (t.passportExpiry && !validDobFormat.test(t.passportExpiry.trim())) {
        return `Please provide a valid Passport Expiry for ${t.name || 'a traveler'} in Step 1.`;
      }
    }
    if (!agreement.travelInsurance) {
        return "Please confirm Travel Insurance in Step 2.";
    }
    if (!agreement.liabilityRelease) {
        return "Please accept the Waiver & Property Damage rules in Step 2.";
    }
    if (!agreement.travelResponsibility) {
        return "Please confirm Travel & Luggage Responsibility in Step 2.";
    }
    if (!signatureData) {
        return "Please provide an Authorized Executive signature in Step 4.";
    }
    return null;
  };

  const validationError = validateForm();

  const handleNext = () => setStep(s => Math.min(5, s + 1));
  const handlePrev = () => setStep(s => Math.max(1, s - 1));

  const addTraveler = () => {
    setTravelers([...travelers, { id: generateId(), name: '', passport: '', passportExpiry: '', dob: '', addressLine1: '', city: '', state: '', country: '', role: '' }]);
  };

  const removeTraveler = (id: string) => {
    if (travelers.length <= 1) return;
    setTravelers(travelers.filter(t => t.id !== id));
  };

  const updateTraveler = (id: string, field: keyof Traveler, value: string) => {
    setTravelers(travelers.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { db } = await import('./lib/firebase');
      const { doc, setDoc, collection, serverTimestamp } = await import('firebase/firestore');
      
      const registrationId = generateId();
      const regRef = doc(db, 'registrations', registrationId);
      
      await setDoc(regRef, {
        totalAmount: totalAmountDue,
        status: 'pending',
        signatureData: signatureData || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const promises = travelers.map(t => {
        const tRef = doc(collection(regRef, 'travelers'), t.id);
        return setDoc(tRef, {
          registrationId,
          name: t.name,
          passport: t.passport,
          passportExpiry: t.passportExpiry,
          dob: t.dob,
          addressLine1: t.addressLine1,
          city: t.city,
          state: t.state,
          country: t.country,
          role: t.role,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      
      await Promise.all(promises);
      
      // Clear saved progress on successful submission
      localStorage.removeItem('registration_progress_global');
    } catch (error: any) {
      console.error(error);
      
      const { handleFirestoreError, OperationType } = await import('./lib/firestoreError');
      try {
        handleFirestoreError(error, OperationType.WRITE, 'registrations');
      } catch (err: any) {
        setSubmitError("Failed to save to database: " + err.message);
        throw err; // throw so we don't open the modal if we fail to save
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (view === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-base)] p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-bg-base)] via-[var(--color-surface-base)] to-[var(--color-surface-inset)]" />
        
        <div className="max-w-md w-full bg-[var(--color-surface-inset)] p-10 rounded-[32px] shadow-soft-flat text-center border border-[var(--color-surface-base)] relative z-10">
          <div className="mx-auto w-16 h-16 bg-[var(--color-bg-base)] rounded-full flex items-center justify-center mb-6 shadow-inner">
            <ShieldCheck size={28} className="text-[var(--color-accent)]" />
          </div>
          
          <h1 className="text-3xl font-light tracking-tight text-[var(--color-text-primary)] mb-3">Nordic Sound Experience</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-10 leading-relaxed font-light">
            Welcome to the Booking Portal. Continue to view the trip details and secure your booking.
          </p>
          
          <button 
            onClick={() => setView('onboarding')}
            className="flex items-center justify-center w-full h-14 bg-[var(--color-accent)] text-white rounded-[16px] font-semibold text-sm tracking-widest uppercase shadow-soft-raised hover:bg-opacity-90 hover:scale-[1.02] transition-all duration-200"
          >
            Enter Portal <ChevronRight size={18} className="ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl min-h-screen flex-col p-4 py-8 sm:p-6 lg:p-8">
      
      {/* Header */}
        <div className="flex justify-between items-end border-b border-gray-300 pb-6 mb-8 text-left">
        <div>
          <h1 className="text-xs tracking-[0.4em] uppercase text-[var(--color-text-secondary)] font-semibold mb-1">Booking Portal</h1>
          <h2 className="text-3xl font-light tracking-tight text-[var(--color-text-primary)]">EQ Labs Europe <span className="text-[var(--color-text-secondary)] mx-2">/</span> Tycoon Vision</h2>
        </div>
      </div>

      {view === 'onboarding' ? (
        <Onboarding onStart={() => setView('registration')} />
      ) : (
      <div className="w-full">
        
        {/* Progress Bar (Stepper) */}
        <div className="mb-8 flex items-center justify-center space-x-2 sm:space-x-4">
          {[
            { num: 1, label: 'Travelers' },
            { num: 2, label: 'Agreement' },
            { num: 3, label: 'Details' },
            { num: 4, label: 'Signature' },
            { num: 5, label: 'Payment' }
          ].map((s) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold transition-all",
                  step >= s.num ? "bg-[var(--color-accent)] text-white shadow-soft-raised" : "bg-[var(--color-surface-inset)] text-[var(--color-text-secondary)] shadow-soft-pressed"
                )}>
                  {s.num}
                </div>
                <span className="mt-2 hidden text-[9px] uppercase tracking-[0.1em] text-[var(--color-text-secondary)] sm:block">{s.label}</span>
              </div>
              {s.num < 5 && (
                <div className="mb-5 h-[2px] w-8 bg-[var(--color-surface-inset)] shadow-soft-pressed sm:w-16" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Image Header */}
        <div className="w-full h-32 sm:h-48 mb-8 rounded-[24px] overflow-hidden shadow-soft-pressed relative">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-[var(--color-accent)]/20 mix-blend-multiply z-10" />
          <AnimatePresence mode="wait">
            <motion.img
              key={step}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              src={[
                "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1200&auto=format&fit=crop", // Step 1
                "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1200&auto=format&fit=crop", // Step 2 (Agreement)
                "https://images.unsplash.com/photo-1541336032412-2048a678540d?q=80&w=1200&auto=format&fit=crop", // Step 3 (Briefing)
                "https://images.unsplash.com/photo-1583508915901-b5f84c1dcde1?q=80&w=1200&auto=format&fit=crop", // Step 4 (Signature)
                "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop", // Step 5 (Payment)
              ][step - 1]}
              alt={`Step ${step} Context`}
              className="w-full h-full object-cover absolute inset-0"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>
          <div className="absolute bottom-4 left-6 z-20 flex flex-col pointer-events-none">
            <span className="text-[9px] uppercase tracking-widest text-[#0C6B70] font-bold bg-[#DCE8E8] px-2 py-0.5 rounded shadow-sm self-start mb-1">
              Step 0{step}
            </span>
            <h3 className="text-white text-lg font-light tracking-wide">
              {['Traveler Info', 'Trip Agreement', 'Trip Details', 'Signature', 'Payment'][step - 1]}
            </h3>
          </div>
        </div>

        <Card className="min-h-[400px] overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {step === 1 && (
                <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-gray-300 pb-4">
                <div>
                  <h2 className="text-xl font-light text-[var(--color-text-primary)]">Traveler Info</h2>
                  <p className="text-[11px] text-[var(--color-text-secondary)] mt-1 uppercase tracking-widest">Base package includes up to 5 seats.</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest">Base Rate</div>
                  <div className="text-lg font-mono text-[var(--color-text-primary)]">${INITIAL_BASE_PRICE}</div>
                </div>
              </div>

              <div className="space-y-4">
                {travelers.map((traveler, index) => (
                  <div key={traveler.id} className="relative rounded-[16px] bg-[var(--color-surface-inset)] p-4 sm:p-6 shadow-soft-flat space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Seat 0{index + 1} {index >= 5 && <span className="text-[var(--color-text-primary)]">(+$1,100)</span>}</span>
                      {travelers.length > 1 && (
                        <button onClick={() => removeTraveler(traveler.id)} className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <Input 
                        label={index === 0 ? "Full Name (From Auth)" : "Full Name"} 
                        placeholder={index === 0 ? "Authenticating..." : "e.g. Jane Doe"} 
                        value={traveler.name} 
                        onChange={e => updateTraveler(traveler.id, 'name', e.target.value)}
                        readOnly={index === 0}
                        className={index === 0 ? "opacity-70 cursor-not-allowed" : ""}
                      />
                      <Input 
                        label="Passport No." 
                        placeholder="P-12345678" 
                        value={traveler.passport} 
                        onChange={e => updateTraveler(traveler.id, 'passport', e.target.value)} 
                      />
                      <div className="flex w-full flex-col space-y-1">
                        <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Role/Title (Optional)</label>
                        <select 
                          className="flex h-11 w-full rounded-[12px] bg-[var(--color-surface-inset)] px-4 py-2 text-base sm:text-sm text-[var(--color-text-primary)] shadow-soft-pressed transition-all placeholder:text-[var(--color-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] border-none"
                          value={traveler.role}
                          onChange={e => updateTraveler(traveler.id, 'role', e.target.value)}
                        >
                          <option value="">Select Role...</option>
                          <option value="Artist">Artist (Primary)</option>
                          <option value="Producer">Producer</option>
                          <option value="Cameraman">Cameraman / Media</option>
                          <option value="Family">Family Member</option>
                          <option value="Host">Host / Coordination</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-[var(--color-bg-base)]">
                      <DatePicker 
                        label="Passport Expiry (Optional)" 
                        date={traveler.passportExpiry} 
                        setDate={(date) => updateTraveler(traveler.id, 'passportExpiry', date)} 
                      />
                      <DatePicker 
                        label="Date of Birth" 
                        date={traveler.dob} 
                        setDate={(date) => updateTraveler(traveler.id, 'dob', date)} 
                      />
                    </div>
                    <div className="pt-2">
                       <Input 
                         label="Address Line 1" 
                         placeholder="123 Main St" 
                         value={traveler.addressLine1} 
                         onChange={e => updateTraveler(traveler.id, 'addressLine1', e.target.value)} 
                       />
                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mt-4">
                         <Input 
                           label="City" 
                           placeholder="City" 
                           value={traveler.city} 
                           onChange={e => updateTraveler(traveler.id, 'city', e.target.value)} 
                         />
                         <Input 
                           label="State/Province" 
                           placeholder="State" 
                           value={traveler.state} 
                           onChange={e => updateTraveler(traveler.id, 'state', e.target.value)} 
                         />
                         <Input 
                           label="Country" 
                           placeholder="Country" 
                           value={traveler.country} 
                           onChange={e => updateTraveler(traveler.id, 'country', e.target.value)} 
                         />
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={addTraveler} variant="outline" className="w-full border-dashed text-[10px] uppercase tracking-widest">
                <Plus size={16} className="mr-2" /> Manage Additional Seats
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="border-b border-gray-300 pb-4">
                <h2 className="text-xl font-light text-[var(--color-text-primary)]">Trip Agreement</h2>
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Rules and Info</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                  <div className="flex items-start space-x-4">
                    <ShieldCheck className="text-[var(--color-accent)] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">Credit Split</h4>
                      <p className="text-sm font-light text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        All production credits from this trip will be split 50/50 between EQ Labs Europe and Tycoon Vision Media Group.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                   <div className="flex items-start space-x-4">
                    <PenTool className="text-[var(--color-accent)] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase text-[var(--color-text-secondary)]">Writing & Royalties</h4>
                      <p className="text-sm font-light text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        Royalties from writing and mechanicals will be shared equally (50%) between both parties.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                   <div className="flex items-start space-x-4">
                    <ShieldCheck className="text-[var(--color-accent)] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[11px] font-bold italic text-[var(--color-text-secondary)]">12-Month Non-Compete</h4>
                      <p className="text-xs text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        You agree not to directly compete in the specified European areas for 12 months after the trip.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat border border-[#D32F2F]/20">
                   <div className="flex items-start space-x-4">
                    <ShieldCheck className="text-[#D32F2F] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[11px] font-bold italic text-[#D32F2F]">Waiver & Property Damage</h4>
                      <p className="text-xs text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        You agree not to hold our parent company, Ozone Solutions AB, responsible for any damages or injuries. You are responsible for fixing or replacing anything you damage. We will pursue payment for damages if necessary.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat border border-[#D32F2F]/20">
                   <div className="flex items-start space-x-4">
                    <ShieldCheck className="text-[#D32F2F] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[11px] font-bold italic text-[#D32F2F]">Travel, Flights & Luggage</h4>
                      <p className="text-xs text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        We are not responsible for missed flights, cancellations, or lost luggage. Guests are solely responsible for securing their own travel insurance and handling these matters independently.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat border-l-4 border-[var(--color-accent)]">
                   <div className="flex items-start space-x-4">
                    <ShieldCheck className="text-[var(--color-accent)] mt-1 flex-shrink-0" size={16} />
                    <div>
                      <h4 className="text-[11px] font-bold uppercase text-[var(--color-text-secondary)]">Cancellation Policy</h4>
                      <p className="text-xs text-[var(--color-text-primary)] mt-1 leading-relaxed">
                        Cancellations made 14 days or more before the trip are eligible for a 50% refund. Cancellations made within 14 days are non-refundable. 
                        You can opt in for Flight & Accommodation Cancellation Insurance below. If selected, your flights and Airbnb will be refundable according to their standard policies.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-300 mt-6 space-y-3">
                  <Checkbox 
                    label="Mandatory Travel Insurance Confirmed" 
                    checked={agreement.travelInsurance} 
                    onChange={e => setAgreement({...agreement, travelInsurance: e.target.checked})} 
                  />
                  <Checkbox 
                    label="I accept the Waiver & Property Damage rules" 
                    checked={agreement.liabilityRelease} 
                    onChange={e => setAgreement({...agreement, liabilityRelease: e.target.checked})} 
                  />
                  <Checkbox 
                    label="I acknowledge sole responsibility for flights, luggage, and travel insurance" 
                    checked={agreement.travelResponsibility} 
                    onChange={e => setAgreement({...agreement, travelResponsibility: e.target.checked})} 
                  />
                  <Checkbox 
                    label="Add Flight & Accommodation Cancellation Insurance at $200 per traveler" 
                    checked={agreement.cancellationInsurance} 
                    onChange={e => setAgreement({...agreement, cancellationInsurance: e.target.checked})} 
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="border-b border-gray-300 pb-4">
                <h2 className="text-xl font-light text-[var(--color-text-primary)]">Trip Details</h2>
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Essential Information for Your Journey</p>
              </div>

              <div className="space-y-4">
                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                  <h4 className="text-[11px] font-bold uppercase text-[var(--color-text-secondary)] border-b border-gray-300 pb-2 mb-3">Packing & Cost Saving Tips</h4>
                  <ul className="text-sm font-light text-[var(--color-text-primary)] leading-relaxed space-y-2 list-disc pl-4">
                    <li>Pack in layers. Scandinavian weather can be unpredictable; versatile layers save space and prepare you for varying temperatures.</li>
                    <li>Roll your clothes instead of folding to maximize luggage space and minimize wrinkles.</li>
                    <li>Avoid heavy baggage fees by coordinating shared toiletries and bulky items within your group.</li>
                    <li>Opt for a sturdy carry-on if possible. If checking bags, ensure you pack all essentials (chargers, medications, a change of clothes) in your personal item.</li>
                  </ul>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                  <h4 className="text-[11px] font-bold uppercase text-[var(--color-text-secondary)] border-b border-gray-300 pb-2 mb-3">First-Time Flyers (US to EU)</h4>
                  <ul className="text-sm font-light text-[var(--color-text-primary)] leading-relaxed space-y-2 list-disc pl-4">
                    <li>Bring a universal power adapter suitable for Northern Europe (Type C or Type F).</li>
                    <li>Notify your bank of your travel dates to prevent cards from being blocked. Most places in Sweden are completely cashless.</li>
                    <li>Stay hydrated on the flight and try to sync your sleep schedule to Central European Time (CET) a few days before departure.</li>
                    <li>Have digital and physical copies of your passport, booking references, and this signed agreement.</li>
                  </ul>
                </div>

                <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-flat">
                  <h4 className="text-[11px] font-bold uppercase text-[var(--color-text-secondary)] border-b border-gray-300 pb-2 mb-3">The Skåne & Copenhagen Metro Area</h4>
                  <p className="text-sm font-light text-[var(--color-text-primary)] leading-relaxed">
                    You'll be visiting the vibrant Øresund region, bridging southern Sweden (Skåne) and Denmark's capital (Copenhagen).
                    The area is connected by the iconic Øresund Bridge. Trains run frequently between Malmö and Copenhagen and take about 35 minutes.
                    Expect a highly efficient, clean, and safe metropolitan experience. English is widely spoken, so communication will be effortless.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
               <div className="border-b border-gray-300 pb-4">
                <h2 className="text-xl font-light text-[var(--color-text-primary)]">Signature</h2>
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Sign below to accept</p>
              </div>
              
              <div className="rounded-[16px] bg-[var(--color-surface-inset)] shadow-soft-pressed relative">
                <div className="p-4">
                  <SignaturePadCard 
                    onSave={(data) => setSignatureData(data)} 
                    onClear={() => setSignatureData(null)} 
                  />
                </div>
                {!signatureData && <span className="absolute inset-0 flex items-center justify-center text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest italic pointer-events-none">Signature Pad</span>}
                <div className="absolute bottom-2 left-4 text-[10px] text-[var(--color-text-secondary)] font-medium uppercase tracking-wider pointer-events-none">Authorized Executive</div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8">
              <div className="border-b border-gray-300 pb-4">
                <h2 className="text-xl font-light text-[var(--color-text-primary)]">Payment & Finalization</h2>
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-text-secondary)] mt-1">Select your payment preference</p>
              </div>

              {/* Invoice Breakdown */}
              <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-6 space-y-4 shadow-soft-flat">
                <div className={cn("flex justify-between text-xs", extraSeats === 0 && !agreement.cancellationInsurance && "border-b border-gray-300 pb-3")}>
                  <span className="text-[var(--color-text-secondary)]">Base Fee</span>
                  <span className="text-[var(--color-text-primary)]">${INITIAL_BASE_PRICE.toLocaleString()}.00</span>
                </div>
                {extraSeats > 0 && (
                  <div className={cn("flex justify-between text-xs", !agreement.cancellationInsurance && "border-b border-gray-300 pb-3")}>
                    <span className="text-[var(--color-text-secondary)]">Extra Seats ({extraSeats})</span>
                    <span className="text-[var(--color-text-primary)]">${(extraSeats * EXTRA_SEAT_PRICE).toLocaleString()}.00</span>
                  </div>
                )}
                {agreement.cancellationInsurance && (
                  <div className="flex justify-between text-xs border-b border-gray-300 pb-3">
                    <span className="text-[var(--color-text-secondary)]">Cancellation Insurance (x{travelers.length})</span>
                    <span className="text-[var(--color-text-primary)]">${(insuranceCost).toLocaleString()}.00</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="text-[10px] uppercase text-[var(--color-text-secondary)] font-bold">Total Amount</span>
                  <span className="text-2xl font-light text-[var(--color-text-primary)] font-mono">${totalPrice.toLocaleString()}.00</span>
                </div>
              </div>

              <div className="text-[10px] text-[var(--color-text-secondary)] bg-[var(--color-surface-inset)] rounded-[8px] p-3 mx-1 space-y-2">
                <p><span className="text-[#D32F2F] font-bold">Important:</span> This base rate is calculated using current international flight pricing. Taking too long to secure payment may result in an increased total as flight prices rise prior to departure.</p>
                <p><strong className="text-[var(--color-text-primary)]">Baggage Charges:</strong> Please be advised that baggage will incur extra charges according to the individual airline policies. These are not included in the base fee.</p>
              </div>

              {/* Payment Options */}
              <div className="flex gap-2 flex-col sm:flex-row">
                <button 
                  onClick={() => setPayFull(true)}
                  className={cn(
                    "flex-1 text-[11px] font-bold uppercase py-3 tracking-widest transition-all rounded-[12px]",
                    payFull ? "bg-[var(--color-accent)] text-white shadow-soft-raised border-none" : "bg-[var(--color-surface-inset)] text-[var(--color-text-secondary)] shadow-soft-pressed hover:text-[var(--color-text-primary)]"
                  )}
                >
                  Pay Full Amount
                </button>
                <button 
                  onClick={() => setPayFull(false)}
                  className={cn(
                    "flex-1 text-[11px] font-bold uppercase py-3 tracking-widest transition-all rounded-[12px]",
                    !payFull ? "bg-[var(--color-accent)] text-white shadow-soft-raised border-none" : "bg-[var(--color-surface-inset)] text-[var(--color-text-secondary)] shadow-soft-pressed hover:text-[var(--color-text-primary)]"
                  )}
                >
                  Deposit ${(DEPOSIT_PRICE + insuranceCost).toLocaleString()}
                </button>
              </div>

              {/* Payment Component */}
              <div className="pt-2">
                {validationError && (
                  <div className="mb-4 p-3 bg-[#D32F2F]/10 border border-[#D32F2F]/20 text-[#D32F2F] text-sm rounded-[12px]">
                    <span className="font-bold mb-1 uppercase tracking-widest text-[9px]">Action Required</span>
                    <p className="mt-1">{validationError}</p>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    handleFinalSubmit().then(() => setShowPaymentModal(true)).catch(() => {});
                  }}
                  disabled={!!validationError || isSubmitting}
                  className="w-full flex justify-center items-center h-12 rounded-[12px] bg-[var(--color-accent)] text-[11px] font-bold tracking-widest uppercase text-white shadow-soft-raised transition-all hover:bg-opacity-90 disabled:opacity-50"
                >
                  <CreditCard className="mr-2" size={16} /> {isSubmitting ? 'Processing...' : 'Complete Registration'}
                </button>
                
                {submitError && <div className="text-[#D32F2F] text-[11px] uppercase tracking-widest mt-4 text-center">{submitError}</div>}
                <div className="flex justify-center space-x-4 pt-6 opacity-50">
                  <span className="text-[9px] tracking-widest uppercase text-[var(--color-text-secondary)]">Stripe Secure</span>
                  <span className="text-[9px] tracking-widest uppercase text-[var(--color-text-secondary)]">Google Pay</span>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </Card>

        <PaymentModal 
          isOpen={showPaymentModal} 
          onClose={() => setShowPaymentModal(false)}
        />

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button 
            variant="secondary" 
            onClick={handlePrev} 
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>
          
          {step < 5 && (
            <Button onClick={handleNext}>
              Next Step <ChevronRight size={16} className="ml-1" />
            </Button>
          )}
        </div>

        <footer className="mt-12 flex justify-between items-center text-[10px] tracking-widest text-[var(--color-text-secondary)] opacity-70 border-t border-gray-300 pt-6 flex-col gap-2 sm:flex-row">
          <span>REF: EQ-TV-2024-089</span>
          <span className="uppercase text-center">Equipping Visionaries Across the Continent</span>
          <span>v1.0.5 - NEUMORPHIC</span>
        </footer>

      </div>
      )}
    </div>
  );
}
