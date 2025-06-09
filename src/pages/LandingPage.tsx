// src/pages/LandingPage.tsx
import React, { useState, FormEvent } from "react";
import img from "../assets/landing-bg-final.png";
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
} from "lucide-react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

// SVG imports (make sure these are renamed to lowercase on disk)
import BlueDartLogo from "../assets/logos/bluedart.svg";
import DelhiveryLogo from "../assets/logos/delhivery.svg";
import DTDCLogo from "../assets/logos/dtdc.svg";
import FedExLogo from "../assets/logos/fedex.svg";

const LandingPage: React.FC = () => {
  // Original Quick-Compare state (unused now, but kept in case)
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [weight, setWeight] = useState("");

  // --- DEMO STATE & LOGIC (unchanged from before) ---
  const [showDemo, setShowDemo] = useState(false);
  const [demoFrom, setDemoFrom] = useState("");
  const [demoTo, setDemoTo] = useState("");
  const [demoWeight, setDemoWeight] = useState("");
  const [demoDistance, setDemoDistance] = useState<number | null>(null);
  const [demoETA, setDemoETA] = useState<number | null>(null);
  const [demoCost, setDemoCost] = useState<number | null>(null);
  const [demoError, setDemoError] = useState<string | null>(null);

  const runDemoCalc = (e: FormEvent) => {
    e.preventDefault();
    setDemoError(null);

    if (!demoFrom.match(/^\d{6}$/) || !demoTo.match(/^\d{6}$/)) {
      setDemoError("Please enter valid 6-digit Indian pincodes.");
      return;
    }
    const w = parseFloat(demoWeight);
    if (isNaN(w) || w <= 0) {
      setDemoError("Please enter a valid weight (> 0).");
      return;
    }

    const fromNum = parseInt(demoFrom, 10);
    const toNum = parseInt(demoTo, 10);
    const dist = Math.abs(fromNum - toNum) / 100; // Demo logic
    const etaDays = Math.max(1, Math.ceil(dist / 500));
    const cost = parseFloat((dist * w * 7).toFixed(2));

    setDemoDistance(dist);
    setDemoETA(etaDays);
    setDemoCost(cost);
  };
  // --- DEMO END ---

  // (Keep handleQuickCompare if you ever want the old form back)
  const handleQuickCompare = (e: FormEvent) => {
    e.preventDefault();
    alert(`Comparing: From ${origin} to ${destination}, Weight: ${weight}kg`);
  };

  const StepCard: React.FC<{
    stepNumber: string;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = ({ stepNumber, title, description, icon: Icon }) => (
    <div className="group relative flex flex-col items-center text-center bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300">
      <div
        className="
          absolute -top-5 left-1/2 transform -translate-x-1/2 
          w-10 h-10 bg-blue-600 text-white rounded-full 
          flex items-center justify-center text-lg font-bold 
          shadow-md
        "
      >
        {stepNumber}
      </div>
      <div className="mt-8 bg-blue-100 p-3 rounded-full mb-4 flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-200">
        <Icon className="w-7 h-7 text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
      </div>
      <h4 className="text-xl font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600 text-base leading-relaxed">{description}</p>
    </div>
  );

  const FeatureCard: React.FC<{
    icon: React.ElementType;
    title: string;
    description: string;
  }> = ({ icon: Icon, title, description }) => (
    <div className="group flex flex-col items-center text-center bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
      <div className="bg-yellow-100 p-4 rounded-full mb-4 transition-colors duration-300 group-hover:bg-yellow-200">
        <Icon className="w-10 h-10 text-yellow-600 group-hover:text-yellow-700 transition-colors duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-base leading-relaxed">{description}</p>
    </div>
  );

  return (
    <div className="font-sans text-gray-700">
      {/* Navigation (Header) */}
      <Header />

      {/* Hero Section */}
      <header
        className="text-white pt-32 pb-20 md:pt-40 md:pb-28 bg-cover bg-center"
        style={{ backgroundImage: `url(${img})` }}
      >
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Stop Overpaying for Shipping.
            <br />
            <span className="text-yellow-400">
              Find the Best Rates, Instantly.
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            FreightCompare helps you compare real-time quotes from top carriers, saving you time and money on every shipment.
            Make smarter logistics decisions, effortlessly.
          </p>

          {/* ▶️ DEMO BUTTONS (no inputs here) */}
          <div className="mt-8 flex justify-center space-x-4">
            {/* 1) Try Demo on the left (blue, no arrow) */}
            <button
              onClick={() => setShowDemo(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Try Demo
            </button>

            {/* 2) Get Started on the right (yellow, with arrow) */}
            <a
              href="/signup"
              className="bg-yellow-400 text-black px-6 py-3 rounded-md hover:bg-yellow-500 transition-colors duration-200 font-medium inline-flex items-center"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="howitworks" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Simple Steps to Smart Shipping
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Getting the best shipping deal is as easy as 1-2-3. Let us show you how:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <StepCard
              stepNumber="1"
              title="Enter Details"
              description="Provide your shipment origin, destination, and package specifics (weight, dimensions)."
              icon={SlidersHorizontal}
            />
            <StepCard
              stepNumber="2"
              title="Compare Quotes"
              description="Instantly see real-time rates and delivery times from a wide range of trusted carriers."
              icon={BarChart3}
            />
            <StepCard
              stepNumber="3"
              title="Choose & Ship"
              description="Select the best option that fits your budget and needs, then proceed to book your shipment."
              icon={CheckCircle}
            />
          </div>

          <div className="mt-16 text-center">
            <a
              href="/compare"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200"
            >
              Get Started Now
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Everything You Need for Smarter Logistics
            </h2>
            <p className="mt-4 text-gray-600 text-lg max-w-2xl mx-auto">
              Our platform is packed with features to simplify your shipping process.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Zap}
              title="Real-Time Rates"
              description="Access up-to-the-minute pricing from multiple carriers in one place."
            />
            <FeatureCard
              icon={Users}
              title="Wide Carrier Network"
              description="Compare options from local couriers to global logistics giants."
            />
            <FeatureCard
              icon={DollarSign}
              title="Save Big"
              description="Find the most cost-effective shipping solutions and reduce your expenses."
            />
            <FeatureCard
              icon={ThumbsUp}
              title="Transparent Pricing"
              description="No hidden fees. What you see is what you pay. Full cost breakdown."
            />
            <FeatureCard
              icon={Sparkles}
              title="Easy-to-Use"
              description="Intuitive interface designed for speed and simplicity, even for complex shipments."
            />
            <FeatureCard
              icon={Truck}
              title="All Shipment Types"
              description="From small parcels to large freight, we cover a wide range of shipping needs."
            />
          </div>
        </div>
      </section>

      {/* Trusted By / Carrier Logos Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-gray-700 text-center mb-8">
            Compare Rates from Leading Carriers Like:
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            <img src={BlueDartLogo} alt="Blue Dart" className="h-12 object-contain" />
            <img src={DelhiveryLogo} alt="Delhivery" className="h-12 object-contain" />
            <img src={DTDCLogo} alt="DTDC" className="h-12 object-contain" />
            <img src={FedExLogo} alt="FedEx" className="h-12 object-contain" />
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section id="pricing" className="py-20 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Ready to Optimize Your Shipping Costs?
          </h2>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-blue-100">
            Join thousands of businesses already saving time and money with FreightCompare.
            Get started for free today!
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center bg-yellow-500 text-gray-900 font-semibold px-10 py-4 rounded-md hover:bg-yellow-600 transition-colors duration-200 text-lg"
          >
            Create Your Free Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Demo Modal Overlay (unchanged) */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={() => setShowDemo(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close demo"
            >
              ✕
            </button>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Demo Shipping Calculator
            </h3>

            <form onSubmit={runDemoCalc} className="space-y-4">
              <div>
                <label htmlFor="demo-from" className="block text-gray-700 font-medium mb-1">
                  From Pincode
                </label>
                <input
                  id="demo-from"
                  type="text"
                  maxLength={6}
                  value={demoFrom}
                  onChange={e => setDemoFrom(e.target.value)}
                  placeholder="e.g., 110001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="demo-to" className="block text-gray-700 font-medium mb-1">
                  To Pincode
                </label>
                <input
                  id="demo-to"
                  type="text"
                  maxLength={6}
                  value={demoTo}
                  onChange={e => setDemoTo(e.target.value)}
                  placeholder="e.g., 560001"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="demo-weight" className="block text-gray-700 font-medium mb-1">
                  Total Weight (kg)
                </label>
                <input
                  id="demo-weight"
                  type="number"
                  step="0.1"
                  min="0"
                  value={demoWeight}
                  onChange={e => setDemoWeight(e.target.value)}
                  placeholder="e.g., 10.5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {demoError && <p className="text-red-500 text-sm">{demoError}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                Calculate Demo
              </button>
            </form>

            {demoDistance !== null && demoETA !== null && demoCost !== null && (
              <div className="mt-6 bg-gray-50 p-4 rounded-md border border-gray-200">
                <p className="text-gray-700">
                  <span className="font-medium">Distance:</span> {demoDistance.toFixed(2)} km
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">ETA:</span> {demoETA} {demoETA === 1 ? "day" : "days"}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Estimated Cost:</span> ₹{demoCost.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;