import React, { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  User,
  Building,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Hash,
  MapPin,
  ClipboardList,
  BarChart,
  AtSign
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// You can find a similar image or use your own branding asset
import SignUpIllustration from "../assets/signup-illustration.svg"; 


// --- REUSABLE STYLED COMPONENTS ---

const InputField = ({ icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode }) => (
    <div>
      <label htmlFor={props.id} className="block text-sm font-medium text-slate-600 mb-1">{props['aria-label']}</label>
      <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none">{icon}</span>
          <input {...props} className="w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-200/70" />
      </div>
    </div>
);

const StepIndicator = ({ currentStep, steps }: { currentStep: number, steps: string[] }) => (
  <nav aria-label="Progress">
    <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
      {steps.map((step, stepIdx) => (
        <li key={step} className="md:flex-1">
          {stepIdx <= currentStep ? (
            <div className="group flex flex-col border-l-4 border-blue-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-semibold text-blue-600">{`Step ${stepIdx + 1}`}</span>
              <span className="text-sm font-medium text-slate-700">{step}</span>
            </div>
          ) : (
            <div className="group flex flex-col border-l-4 border-slate-200 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-semibold text-slate-500">{`Step ${stepIdx + 1}`}</span>
              <span className="text-sm font-medium text-slate-500">{step}</span>
            </div>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

const SignUpPage: React.FC = () => {
  // All state from your original file
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [mailId, setMailId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [address, setAddress] = useState("");
  const [customerState, setCustomerState] = useState("");
  const [pincode, setPincode] = useState("");
  const [monthlyOrders, setMonthlyOrders] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const formSteps = ["Account Info", "Business Info", "Address", "Verification"];
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    
    try {
      await axios.post("http://localhost:8000/api/auth/signup/initiate", {
        firstName, lastName, companyName, phone: Number(contactNumber), email: mailId,
        businessType, monthlyOrder: Number(monthlyOrders), password, gstNumber, address,
        state: customerState, pincode: Number(pincode),
      });
      toast.success("OTP sent successfully to your email and phone!");
      nextStep();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8000/api/auth/signup/verify", { email: mailId, emailOtp, phoneOtp });
      toast.success("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 font-sans bg-slate-50">
        {/* Left Column: Branding */}
        <div className="relative hidden lg:flex flex-col justify-center items-center bg-blue-50 p-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: "easeOut"}}>
                <img src={SignUpIllustration} alt="Logistics management illustration" className="w-full max-w-lg mx-auto"/>
                <h1 className="mt-8 text-3xl font-bold text-slate-800">Unlock Smarter Shipping Today</h1>
                <p className="mt-2 text-slate-600 max-w-md mx-auto">Join a growing community of businesses optimizing their logistics with real-time data and insights.</p>
            </motion.div>
        </div>
        
        {/* Right Column: Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-lg">
                 <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="lg:hidden text-center mb-8">
                      <UserPlus className="h-12 w-auto text-blue-600 mx-auto" />
                      <h2 className="mt-4 text-3xl font-extrabold text-slate-900">Create an Account</h2>
                    </div>
                     <div className="hidden lg:block text-left mb-8">
                       <h2 className="text-3xl font-extrabold text-slate-900">Create an Account</h2>
                       <p className="mt-2 text-sm text-slate-600">Already have one?{" "}
                         <Link to="/signin" className="font-semibold text-blue-600 hover:text-blue-500">Sign in</Link>
                       </p>
                    </div>
                 </motion.div>

                 <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
                    <StepIndicator currentStep={currentStep} steps={formSteps} />

                    <div className="overflow-hidden">
                       <AnimatePresence mode="wait">
                          <motion.div key={currentStep} variants={formVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.4, ease: 'easeInOut' }}>
                              
                               {/* --- Step 1: Account Info --- */}
                               {currentStep === 0 && (
                                  <form className="space-y-4" onSubmit={e => { e.preventDefault(); nextStep() }}>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                         <InputField aria-label="First Name" icon={<User/>} id="firstName" name="firstName" type="text" placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                                         <InputField aria-label="Last Name" icon={<User/>} id="lastName" name="lastName" type="text" placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                                      </div>
                                      <InputField aria-label="Email" icon={<Mail/>} id="email" name="email" type="email" placeholder="Email Address" value={mailId} onChange={e => setMailId(e.target.value)} required />
                                      <InputField aria-label="Phone" icon={<Phone/>} id="phone" name="phone" type="tel" placeholder="Contact Number" value={contactNumber} onChange={e => setContactNumber(e.target.value.replace(/[^0-9]/g, '').substring(0, 10))} maxLength={10} required />
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                          <InputField aria-label="Password" icon={<Lock/>} id="password" name="password" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                                          <InputField aria-label="Confirm Password" icon={<Lock/>} id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                      </div>
                                      <div className="pt-4 flex justify-end"><button type="submit" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">Next <ArrowRight size={18}/></button></div>
                                  </form>
                               )}

                               {/* --- Step 2: Business Info --- */}
                               {currentStep === 1 && (
                                   <form className="space-y-4" onSubmit={e => { e.preventDefault(); nextStep() }}>
                                      <InputField aria-label="Company Name" icon={<Building/>} id="companyName" name="companyName" type="text" placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
                                      <InputField aria-label="GST Number" icon={<Hash/>} id="gstNumber" name="gstNumber" type="text" placeholder="GST Number" value={gstNumber} onChange={e => setGstNumber(e.target.value)} required />
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="relative"><ClipboardList className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"/><select id="businessType" name="businessType" value={businessType} onChange={e => setBusinessType(e.target.value)} required className="w-full pl-11 pr-3 py-2.5 border border-slate-300 rounded-lg text-slate-700 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="" disabled>Business Type</option><option value="Retailer">Retailer</option><option value="Ecommerce">Ecommerce</option><option value="Franchise">Franchise</option><option value="Co-loader">Co-loader</option><option value="Brand">Brand</option><option value="Enterprise">Enterprise</option></select></div>
                                        <InputField aria-label="Monthly Orders" icon={<BarChart/>} id="monthlyOrders" name="monthlyOrders" type="number" placeholder="Avg. Monthly Orders" value={monthlyOrders} onChange={e => setMonthlyOrders(e.target.value)} required />
                                      </div>
                                      <div className="pt-4 flex justify-between">
                                        <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300"><ArrowLeft size={18}/> Previous</button>
                                        <button type="submit" className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700">Next <ArrowRight size={18}/></button>
                                      </div>
                                  </form>
                               )}
                               
                               {/* --- Step 3: Address Info --- */}
                               {currentStep === 2 && (
                                   <form className="space-y-4" onSubmit={handleSendOtp}>
                                        <InputField aria-label="Address" icon={<MapPin/>} id="address" name="address" placeholder="Primary Business Address" value={address} onChange={e => setAddress(e.target.value)} required />
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <InputField aria-label="State" icon={<MapPin/>} id="state" name="state" type="text" placeholder="State" value={customerState} onChange={e => setCustomerState(e.target.value)} required />
                                            <InputField aria-label="Pincode" icon={<AtSign/>} id="pincode" name="pincode" type="tel" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value.replace(/[^0-9]/g, '').substring(0, 6))} maxLength={6} required />
                                        </div>
                                         <div className="pt-4 flex justify-between">
                                            <button type="button" onClick={prevStep} className="inline-flex items-center gap-2 px-6 py-2 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300"><ArrowLeft size={18}/> Previous</button>
                                            <button type="submit" disabled={isLoading} className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400">
                                                {isLoading ? <><Loader2 size={18} className="animate-spin"/> Sending OTP...</> : <>Send OTP & Continue</>}
                                            </button>
                                        </div>
                                   </form>
                               )}
                               
                               {/* --- Step 4: Verification --- */}
                               {currentStep === 3 && (
                                    <div className="text-center space-y-4 py-4">
                                      <CheckCircle className="mx-auto w-12 h-12 text-green-500"/>
                                      <h3 className="text-xl font-bold text-slate-800">Final Step: Verify Your Account</h3>
                                      <p className="text-slate-500">Enter the 6-digit codes sent to your registered email and phone.</p>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto">
                                          <InputField aria-label="Email OTP" icon={<Mail/>} id="emailOtp" type="tel" placeholder="Email OTP" value={emailOtp} onChange={e => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} required />
                                          <InputField aria-label="Phone OTP" icon={<Phone/>} id="phoneOtp" type="tel" placeholder="Phone OTP" value={phoneOtp} onChange={e => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ''))} maxLength={6} required />
                                      </div>
                                      <div className="pt-4 flex flex-col sm:flex-row-reverse items-center justify-center gap-4">
                                          <button type="button" onClick={handleVerifyOtp} disabled={isLoading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:bg-blue-400">
                                            {isLoading ? <><Loader2 size={18} className="animate-spin"/>Verifying...</> : <>Verify & Create Account</>}
                                          </button>
                                          <button type="button" onClick={prevStep} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-800 font-semibold rounded-lg hover:bg-slate-300"><ArrowLeft size={18}/> Go Back</button>
                                      </div>
                                   </div>
                               )}

                          </motion.div>
                       </AnimatePresence>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default SignUpPage;