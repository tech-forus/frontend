// src/pages/SignUpPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const SignUpPage: React.FC = () => {
  // Form state
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
  const [phoneOtp, setphoneOtp] = useState("");
  const [emailOtp, setemailOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // UI state
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const baseInputClasses =
    "appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-100";

  const handleContactNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    const limitedValue = value.substring(0, 10);
    setContactNumber(limitedValue);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const trimmedPincode = pincode.trim();
    const parsedPincode = parseInt(trimmedPincode, 10);
    if (
      trimmedPincode === "" ||
      isNaN(parsedPincode) ||
      String(parsedPincode).length !== trimmedPincode.length
    ) {
      setError("Pincode is required and must be a valid number.");
      toast.error(
        "Pincode is required and must be a valid number (e.g., 123456)."
      );
      setIsLoading(false);
      return;
    }

    if (contactNumber.trim().length === 0) {
      setError("Contact Number is required.");
      toast.error("Contact Number is required.");
      setIsLoading(false);
      return;
    }


    try {
      await axios.post("http://localhost:8000/api/auth/signup/initiate", {
        firstName: firstName,
        lastName: lastName,
        companyName: companyName,
        phone: contactNumber,
        email: mailId,
        businessType: businessType,
        monthlyOrder: monthlyOrders,
        password: password,
        gstNumber: gstNumber,
        address: address,
        state: customerState,
        pincode: parsedPincode,
      });
      toast.success("OTP sent successfully!");
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signup/verify",
        {
          email: mailId,
          emailOtp: emailOtp,
          phoneOtp: phoneOtp,
        }
      );
      if (res) {
        toast.success("OTP verified!");
        navigate("/signin");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-10rem)]">
      <div className="max-w-md w-full lg:max-w-4xl space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-lg">
        <div className="text-center">
          <UserPlus className="h-10 w-auto text-blue-600 sm:h-12 mx-auto" />
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in if you already have an account
            </Link>
          </p>
        </div>

        <form className="space-y-6">
          <div className="flex gap-3">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-md w-1/2`}
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-md w-1/2`}
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <div className="flex flex-col gap-1 w-full">
            <select
              id="businessType"
              name="businessType"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={isLoading}
              required
              className={`${baseInputClasses} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="" disabled style={{ color: "#1565c0", fontWeight: "bold" }}>
                Select Business Type
              </option>
              <option value="Retailer">Retailer</option>
              <option value="Ecommerce">Ecommerce</option>
              <option value="Franchise">Franchise</option>
              <option value="Co-loader">Co-loader</option>
              <option value="Brand">Brand</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <input
            id="contactNumber"
            name="contactNumber"
            type="text"
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="Monthly Orders"
            value={monthlyOrders}
            onChange={(e) => setMonthlyOrders(e.target.value)}
            maxLength={10}
          />
          <input
            id="contactNumber"
            name="contactNumber"
            type="text"
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="Contact Number (max 10 characters)"
            value={contactNumber}
            onChange={handleContactNumberChange}
            maxLength={10}
          />
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="Email address"
            value={mailId}
            onChange={(e) => setMailId(e.target.value)}
          />

          <div className="rounded-md shadow-sm -space-y-px">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-t-md`}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-b-md`}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <input
            id="gstNumber"
            name="gstNumber"
            type="text"
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="GST Number"
            value={gstNumber}
            onChange={(e) => setGstNumber(e.target.value)}
          />
          <textarea
            id="address"
            name="address"
            rows={3}
            required
            disabled={isLoading}
            className={`${baseInputClasses} rounded-md`}
            placeholder="Primary Business Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              id="customerState"
              name="customerState"
              type="text"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-md`}
              placeholder="State"
              value={customerState}
              onChange={(e) => setCustomerState(e.target.value)}
            />
            <input
              id="pincode"
              name="pincode"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              required
              disabled={isLoading}
              className={`${baseInputClasses} rounded-md`}
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 text-center py-1">{error}</p>
          )}

          <div className="pt-2">
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            ) : (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Email OTP"
                  value={emailOtp}
                  onChange={(e) => setemailOtp(e.target.value)}
                  className={`${baseInputClasses} rounded-md`}
                  maxLength={6}
                  disabled={isLoading}
                />
                <input
                  type="text"
                  placeholder="Phone OTP"
                  value={phoneOtp}
                  onChange={(e) => setphoneOtp(e.target.value)}
                  className={`${baseInputClasses} rounded-md`}
                  maxLength={6}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
