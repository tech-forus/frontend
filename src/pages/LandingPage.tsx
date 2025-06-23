import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  DollarSign,
  SlidersHorizontal,
  Sparkles,
  ThumbsUp,
  Truck,
  Users,
  Zap,
  X as XIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import landingBgPattern from "../assets/landing-bg-final.png";
import BlueDartLogo from "../assets/logos/bluedart.svg";
import DelhiveryLogo from "../assets/logos/delhivery.svg";
import DTDCLogo from "../assets/logos/dtdc.svg";
import FedExLogo from "../assets/logos/fedex.svg";

// --- REUSABLE ANIMATED COMPONENTS ---
const MotionSection = ({
    children,
    className,
    style,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}) => (
    <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={className}
        style={style}
    >
        {children}
    </motion.section>
);

const staggerContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};
const staggerItemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.42, 0, 0.58, 1] } },
};

// --- STYLED COMPONENTS ---
const StepCard = ({ stepNumber, title, description, icon: Icon }: { stepNumber: string; title: string; description: string; icon: React.ElementType; }) => (
    <motion.div variants={staggerItemVariants} className="relative mt-8">
        <div className="bg-white rounded-xl shadow-lg p-8 pt-12 text-center h-full group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl shadow-md border-4 border-white">
                {stepNumber}
            </div>
            <div className="mb-4 inline-block p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-600 leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string; }) => (
    <motion.div variants={staggerItemVariants} className="bg-white rounded-xl shadow-lg p-6 text-center h-full group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="mb-4 inline-block p-4 bg-yellow-100 rounded-full transition-colors">
          <Icon className="w-8 h-8 text-yellow-500" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </motion.div>
);

const LandingPage: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [demoFrom, setDemoFrom] = useState("");
  const [demoTo, setDemoTo] = useState("");
  const [demoWeight, setDemoWeight] = useState("");
  const [demoDistance, setDemoDistance] = useState<number | null>(null);
  const [demoETA, setDemoETA] = useState<number | null>(null);
  const [demoCost, setDemoCost] = useState<number | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const runDemoCalc = (e: FormEvent) => {
    e.preventDefault(); setDemoError(null);
    if (!demoFrom.match(/^\d{6}$/) || !demoTo.match(/^\d{6}$/)) { setDemoError("Please enter valid 6-digit Indian pincodes."); return; }
    const w = parseFloat(demoWeight);
    if (isNaN(w) || w <= 0) { setDemoError("Please enter a valid weight (> 0)."); return; }
    const fromNum = parseInt(demoFrom, 10);
    const toNum = parseInt(demoTo, 10);
    const dist = Math.abs(fromNum - toNum) / 100;
    const etaDays = Math.max(1, Math.ceil(dist / 500));
    const cost = parseFloat((dist * w * 7).toFixed(2));
    setDemoDistance(dist); setDemoETA(etaDays); setDemoCost(cost);
  };

  return (
    <div className="font-sans text-gray-700 bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <header
          className="relative text-white pt-32 pb-24 md:pt-40 md:pb-32 bg-cover bg-center"
          style={{ backgroundImage: `url(${landingBgPattern})` }}
        >
          <div className="container mx-auto px-6 text-center relative z-10">
            <motion.h1
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight"
            >
              Stop Overpaying for Shipping.
              <br />
              <span className="text-yellow-400">Find the Best Rates, Instantly.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-blue-100"
            >
              FreightCompare helps you compare real-time quotes from top carriers, saving you time and money on every shipment. Make smarter logistics decisions, effortlessly.
            </motion.p>
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button onClick={() => setShowDemo(true)} className="px-8 py-3 w-full sm:w-auto bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all">
                  Try Demo
              </button>
              <Link to="/signup" className="px-8 py-3 w-full sm:w-auto bg-yellow-400 text-slate-900 text-lg font-semibold rounded-lg shadow-lg hover:bg-yellow-300 transform hover:scale-105 transition-all inline-flex items-center justify-center">
                  Get Started <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </div>
        </header>

        {/* How It Works Section */}
        <MotionSection className="py-20 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Simple Steps to Smart Shipping</h2>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">Getting the best shipping deal is as easy as 1-2-3. Let us show you how:</p>
            </div>
            <motion.div variants={staggerContainerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <StepCard stepNumber="1" title="Enter Details" description="Provide your shipment origin, destination, and package specifics (weight, dimensions)." icon={SlidersHorizontal} />
              <StepCard stepNumber="2" title="Compare Quotes" description="Instantly see real-time rates and delivery times from a wide range of trusted carriers." icon={BarChart3} />
              <StepCard stepNumber="3" title="Choose & Ship" description="Select the best option that fits your budget and needs, then book your shipment." icon={CheckCircle} />
            </motion.div>
          </div>
        </MotionSection>

        {/* Features Section */}
        <MotionSection className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Everything You Need for Smarter Logistics</h2>
              <p className="mt-4 text-slate-600 text-lg max-w-2xl mx-auto">Our platform is packed with features to simplify your shipping process.</p>
            </div>
            <motion.div variants={staggerContainerVariants} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={Zap} title="Real-Time Rates" description="Access up-to-the-minute pricing from multiple carriers in one place."/>
              <FeatureCard icon={Users} title="Wide Carrier Network" description="Compare options from local couriers to global logistics giants."/>
              <FeatureCard icon={DollarSign} title="Save Big" description="Find the most cost-effective shipping solutions and reduce your expenses."/>
              <FeatureCard icon={ThumbsUp} title="Transparent Pricing" description="No hidden fees. What you see is what you pay. Full cost breakdown."/>
              <FeatureCard icon={Sparkles} title="Easy-to-Use" description="Intuitive interface designed for speed and simplicity, even for complex shipments."/>
              <FeatureCard icon={Truck} title="All Shipment Types" description="From small parcels to large freight, we cover a wide range of shipping needs."/>
            </motion.div>
          </div>
        </MotionSection>

        {/* Trusted By Section (Logos are now in full color) */}
        <MotionSection className="py-20 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-slate-700 text-center mb-10">Compare Rates from Leading Carriers</h2>
            <div className="flex flex-wrap justify-center items-center gap-x-12 sm:gap-x-16 gap-y-8">
                {/* ✨ UPDATED: Removed grayscale classes */}
                <img src={BlueDartLogo} alt="Blue Dart" className="h-10 sm:h-12 object-contain transition-transform duration-300 hover:scale-110" />
                <img src={DelhiveryLogo} alt="Delhivery" className="h-10 sm:h-12 object-contain transition-transform duration-300 hover:scale-110" />
                <img src={DTDCLogo} alt="DTDC" className="h-12 sm:h-14 object-contain transition-transform duration-300 hover:scale-110" />
                <img src={FedExLogo} alt="FedEx" className="h-8 sm:h-10 object-contain transition-transform duration-300 hover:scale-110" />
            </div>
          </div>
        </MotionSection>

        {/* Final CTA Section */}
        <MotionSection className="py-20 bg-blue-600 bg-cover bg-center" style={{ backgroundImage: `url(${landingBgPattern})` }}>
           <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Optimize Your Shipping Costs?</h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-blue-100">Join thousands of businesses already saving time and money. Get started for free today!</p>
              <Link to="/signup" className="inline-flex items-center justify-center bg-yellow-400 text-slate-900 font-bold px-10 py-4 rounded-lg hover:bg-yellow-300 transform hover:scale-105 transition-all text-lg shadow-2xl">
                Create Your Free Account <ArrowRight className="w-6 h-6 ml-3" />
              </Link>
          </div>
        </MotionSection>
      </main>

      <Footer />

      {/* Demo Modal Overlay */}
      <AnimatePresence>
        {showDemo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl max-w-md w-full p-8 relative shadow-2xl">
              <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600" aria-label="Close demo"><XIcon/></button>
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Demo Shipping Calculator</h3>
              <form onSubmit={runDemoCalc} className="space-y-4">
                   <div><label htmlFor="demo-from" className="block text-slate-700 font-medium mb-1">From Pincode</label><input id="demo-from" type="text" maxLength={6} value={demoFrom} onChange={e => setDemoFrom(e.target.value)} placeholder="e.g., 110001" className="w-full px-4 py-2 border border-slate-300 rounded-md"/></div>
                   <div><label htmlFor="demo-to" className="block text-slate-700 font-medium mb-1">To Pincode</label><input id="demo-to" type="text" maxLength={6} value={demoTo} onChange={e => setDemoTo(e.target.value)} placeholder="e.g., 560001" className="w-full px-4 py-2 border border-slate-300 rounded-md"/></div>
                   <div><label htmlFor="demo-weight" className="block text-slate-700 font-medium mb-1">Total Weight (kg)</label><input id="demo-weight" type="number" step="0.1" min="0" value={demoWeight} onChange={e => setDemoWeight(e.target.value)} placeholder="e.g., 10.5" className="w-full px-4 py-2 border border-slate-300 rounded-md"/></div>
                   {demoError && <p className="text-red-600 text-sm font-semibold">{demoError}</p>}
                   <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700">Calculate Demo</button>
              </form>
              {demoCost !== null && (
                  <div className="mt-6 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                      <p className="text-slate-800"><span className="font-semibold">Est. Distance:</span> {demoDistance?.toFixed(2)} km</p>
                      <p className="text-slate-800"><span className="font-semibold">Est. Delivery Time:</span> {demoETA} {demoETA === 1 ? "day" : "days"}</p>
                      <p className="text-lg font-bold text-blue-700"><span className="font-semibold">Est. Cost:</span> ₹ {demoCost.toLocaleString()}</p>
                  </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;