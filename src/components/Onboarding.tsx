import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { MapPin, Target, Wallet, Shield, CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function Onboarding({ onStart }: { onStart: () => void }) {
  const [activeTab, setActiveTab] = useState('scope');

  const tabs = [
    { id: 'scope', label: 'Project Scope', icon: Target },
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'value', label: 'Value & Cost', icon: Wallet },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header Snippet */}
      <div className="text-center space-y-3 mb-8">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-[var(--color-surface-inset)] shadow-soft-pressed text-[var(--color-accent)] mb-2">
          <Shield size={24} />
        </div>
        <h2 className="text-2xl font-light text-[var(--color-text-primary)]">Executive Briefing</h2>
        <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-widest">
          Essential details for Tycoon Vision delegates
        </p>
      </div>

      <div className="w-full h-48 sm:h-64 mb-8 rounded-[24px] overflow-hidden shadow-soft-pressed relative">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-[var(--color-accent)]/30 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop" 
          alt="Nordic Sound Experience Studio" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
          <div>
            <span className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-md text-[9px] uppercase tracking-widest text-white/80 mb-2 inline-block">Destination</span>
            <h3 className="text-xl text-white font-light tracking-wide">EQX Studio, Landskrona</h3>
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden relative">
        <div className="flex flex-col sm:flex-row border-b border-gray-300">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 flex items-center justify-center p-5 text-xs font-semibold uppercase tracking-wider transition-all relative border-b-2 sm:border-b-0 sm:border-r border-gray-300 last:border-0",
                activeTab === tab.id 
                  ? "text-[var(--color-accent)] bg-[var(--color-surface-inset)] shadow-inner" 
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-base)]"
              )}
            >
              <tab.icon size={16} className="mr-2" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-1 sm:h-auto sm:w-1 sm:top-0 sm:bottom-0 sm:left-auto sm:right-0 bg-[var(--color-accent)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 sm:p-8 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'scope' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Nordic Sound Experience (NSE)</h3>
                  <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
                    A guided, all-in package that pairs professional studio time with a genuine cultural experience. 
                    Designed to remove every logistical obstacle so your team can focus exclusively on making great music.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-pressed">
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Primary Goal</div>
                      <div className="text-sm text-[var(--color-text-primary)] font-medium">Record a 4–5 song EP at EQX Studio in Landskrona.</div>
                    </div>
                    <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-5 shadow-soft-pressed">
                      <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] mb-2">Secondary Goal</div>
                      <div className="text-sm text-[var(--color-text-primary)] font-medium">BTS content creation, cultural immersion, and local DJ events.</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="space-y-4">
                  {[
                    { days: "Day 1-2", loc: "Travel & Arrival", desc: "Fly into CPH. Settle into accommodation, gear setup, and initial orientation." },
                    { days: "Day 3-5", loc: "Landskrona, SE", desc: "Core studio recording sessions at EQX. Includes evening cultural events (e.g., Madame Mustache DJ set)." },
                    { days: "Day 6-8", loc: "Post & Content", desc: "Studio mix-down days, final tracklisting, BTS content capture (Kronborg Castle optional), and return travel." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-[16px] bg-[var(--color-surface-inset)] shadow-soft-flat items-start">
                      <div className="flex-shrink-0 w-16 text-right pt-1">
                        <span className="text-[10px] font-bold uppercase text-[var(--color-accent)] tracking-wider">{item.days}</span>
                      </div>
                      <div className="w-[1px] h-full min-h-[40px] bg-gray-300 relative mx-2">
                        <div className="absolute top-1.5 left-[-4px] w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.loc}</h4>
                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'value' && (
                <div className="space-y-6">
                  <div className="rounded-[16px] bg-[var(--color-surface-inset)] p-6 shadow-soft-flat border-l-4 border-[var(--color-accent)]">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">Strategic Partner Pricing</h3>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-gray-300 pb-2">
                        <span className="text-xs text-[var(--color-text-secondary)]">Standard Studio Package (Full Week)</span>
                        <span className="text-sm text-[var(--color-text-secondary)] line-through">~$11,500.00</span>
                      </div>
                      
                      <div className="flex justify-between items-end border-b border-gray-300 pb-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-[var(--color-text-primary)] font-medium">EQ Labs Joint Venture Base (5 Travelers)</span>
                          <span className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest mt-1">Flights, accommodation & meals modeled separate</span>
                        </div>
                        <span className="text-lg font-mono text-[var(--color-text-primary)]">$5,500.00</span>
                      </div>

                      <div className="pt-2">
                         <div className="flex items-start space-x-3 bg-[var(--color-bg-base)] p-4 rounded-[12px] shadow-soft-pressed">
                          <CheckCircle2 className="text-[var(--color-accent)] mt-0.5" size={16} />
                          <div>
                            <span className="text-xs font-bold text-[var(--color-text-primary)] block mb-1">Value-Add & Subsidized Logistics</span>
                            <span className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                              As an exclusive partner benefit, EQX Studio time (a $1,000 baseline value) is fully bundled. Included regional toll logistics and ground coordination ensure a frictionless experience.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="p-6 bg-[var(--color-surface-inset)] border-t border-gray-300 mt-4 flex justify-end">
          <Button onClick={onStart} className="w-full sm:w-auto px-8">
            Complete Registration <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
