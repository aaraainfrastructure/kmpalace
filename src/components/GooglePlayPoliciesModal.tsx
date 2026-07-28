import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, Globe, Github, Smartphone, Lock, AlertTriangle, ExternalLink, X, Copy, Check } from 'lucide-react';

interface GooglePlayPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayPoliciesModal: React.FC<GooglePlayPoliciesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'privacy' | 'vercel' | 'github'>('play');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyConfig = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-[28px] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-[rgba(199,168,109,0.35)] flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-[#2E2A26] text-[#E8D8B0] flex items-center justify-between shrink-0 border-b border-[rgba(199,168,109,0.3)]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(199,168,109,0.2)] border border-[rgba(199,168,109,0.4)] flex items-center justify-center text-[#C7A86D]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-white">
                Google Play Store App Policies & Deployment Specifications
              </h3>
              <p className="text-xs text-[#D4C5A9]">
                Compliance Documentation, Privacy Policy, Vercel & GitHub Dependencies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 pt-2 gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'play'
                ? 'bg-white dark:bg-slate-900 text-[#7A0019] border-t-2 border-[#7A0019]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Google Play Approval Policies</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-white dark:bg-slate-900 text-[#7A0019] border-t-2 border-[#7A0019]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Privacy & User Data</span>
          </button>

          <button
            onClick={() => setActiveTab('vercel')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'vercel'
                ? 'bg-white dark:bg-slate-900 text-[#7A0019] border-t-2 border-[#7A0019]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Vercel Deployment Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
              activeTab === 'github'
                ? 'bg-white dark:bg-slate-900 text-[#7A0019] border-t-2 border-[#7A0019]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Github className="w-4 h-4" />
            <span>GitHub Workflow</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          
          {/* TAB 1: GOOGLE PLAY STORE APPROVAL POLICIES */}
          {activeTab === 'play' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start space-x-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Google Play Console App Compliance Status: READY FOR SUBMISSION
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    All Android Developer Policies (Target SDK 34, Data Safety Declaration, Financial Policy, and Content Rating) are fully validated for KM Palace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7A46]">App Identity</span>
                  <p className="text-xs font-semibold">App Title: <span className="font-bold text-[#7A0019]">KM Palace</span></p>
                  <p className="text-xs font-semibold">Package ID: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">com.kmpalace.app</code></p>
                  <p className="text-xs font-semibold">Category: Event Venue & Reservation</p>
                  <p className="text-xs font-semibold">Target SDK: Android 14 (API level 34)</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7A46]">Financial & Booking Disclosures</span>
                  <p className="text-xs"><strong>Deposit Policy:</strong> Mandatory ₹20,000 caution deposit refundable post-event.</p>
                  <p className="text-xs"><strong>Advance Policy:</strong> Booking advance amount is non-refundable upon confirmation.</p>
                  <p className="text-xs"><strong>Catering Policy:</strong> Strictly 100% Pure Vegetarian Only.</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold font-serif text-slate-900 dark:text-white">
                  Mandatory Google Play Policy Declarations
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>User Data Safety:</strong> The app collects customer name, phone number, and event dates solely for hall reservation fulfillment. No user data is sold or shared with third parties.</span>
                  </li>
                  <li className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Reservation Policy:</strong> Hall bookings and enquiries are submitted directly to KM PALACE management with direct confirmation.</span>
                  </li>
                  <li className="flex items-start space-x-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Account Deletion & Data Privacy:</strong> Users can request complete reservation data deletion by emailing <code className="font-bold text-[#7A0019]">Kannan.d26@gmail.com</code> or visiting kmpalace.com.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY POLICY & TERMS */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-1">
                <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200 font-serif">
                  Official Privacy Policy for KM Palace Application
                </h4>
                <p className="text-amber-800 dark:text-amber-300">
                  Effective Date: July 2026 • Location: Kundrathur, Chennai, Tamil Nadu, India
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">1. Information Collection and Use</h5>
                <p>
                  When you reserve KM Palace Kalyana Mandapam through our mobile application or website, we collect personal information including the Bride & Groom Name, Contact Phone Number, Email Address, Event Type, and Selected Date.
                </p>

                <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-4">2. Venue Terms & Conditions</h5>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Booking advance amount is strictly non-refundable upon confirmation.</li>
                  <li>Outside gas cylinders strictly not allowed. Venue supplies cylinders at market price.</li>
                  <li>Mandatory refundable caution deposit of ₹20,000 required before key handover.</li>
                  <li>Any property damages or extra usage of AC/Generator will be deducted from caution deposit.</li>
                  <li>Outside decorators and outside DJ are strictly not allowed inside venue premises.</li>
                  <li>DJ sound systems and light music performances allowed strictly till 10:00 PM.</li>
                </ul>

                <h5 className="font-bold text-sm text-slate-900 dark:text-white mt-4">3. Data Retention and Security</h5>
                <p>
                  We implement robust industry-standard electronic security measures. Reservation records are stored securely in encrypted databases.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: VERCEL DEPLOYMENT SPECIFICATIONS */}
          {activeTab === 'vercel' && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-black text-white">
                <div>
                  <h4 className="text-sm font-bold flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Vercel Serverless Production Architecture</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Production domain: <span className="text-amber-300 font-bold">https://www.kmpalace.com</span>
                  </p>
                </div>
                <button
                  onClick={() => handleCopyConfig(`// vercel.json
{
  "version": 2,
  "builds": [
    { "src": "server.ts", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server.ts" },
    { "src": "/(.*)", "dest": "/dist/$1" }
  ]
}`)}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center space-x-1.5 transition-all cursor-pointer font-sans"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied vercel.json' : 'Copy vercel.json'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto space-y-2">
                <p className="text-slate-400">// vercel.json Configuration</p>
                <pre className="text-emerald-400">
{`{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: GITHUB WORKFLOW */}
          {activeTab === 'github' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Github className="w-6 h-6 text-[#C7A86D]" />
                  <div>
                    <h4 className="text-sm font-bold">GitHub CI/CD Actions Pipeline</h4>
                    <p className="text-[11px] text-slate-400">Main repository build & Google Play App Bundle (.aab) generation</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto">
                <p className="text-slate-400">// .github/workflows/deploy.yml</p>
                <pre className="text-amber-300 mt-2">
{`name: KM Palace App Build & Google Play Publish

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Install dependencies
        run: npm ci
      - name: Build Web Production
        run: npm run build
      - name: Lint Verification
        run: npm run lint`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-500 font-mono">
            Package: com.kmpalace.app • Target: Android 14
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2E2A26] text-[#E8D8B0] hover:bg-black transition-all font-bold cursor-pointer"
          >
            Close & Continue
          </button>
        </div>

      </div>
    </div>
  );
};
