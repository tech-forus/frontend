// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Mail } from 'lucide-react'; // Icon for visual cue
import axios from 'axios';
import toast from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(''); // For success or error feedback
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>(''); // To style messages

  const navigate = useNavigate(); // For potential navigation after certain actions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    setIsLoading(true);

    if (!email.trim()) {
      setMessage('Please enter your email address.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:8000/api/auth/forgotpassword", {email: email});
      if(res.data.success){
        toast.success(res.data.message);
      }
      else{
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
    // --- END OF MOCK API RESPONSE LOGIC ---

    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <div className="flex justify-center">
            <Mail className="h-12 w-auto text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Your Password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
            No problem! Enter your email address below, and if an account exists,
            we'll send you a temporary password.
          </p>
        </div>

        {message && (
          <div 
            className={`p-4 mb-4 text-sm rounded-lg ${
              messageType === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : ''
            } ${
              messageType === 'error' ? 'bg-red-100 text-red-700 border border-red-300' : ''
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address-forgot" className="sr-only"> 
              Email address
            </label>
            <input
              id="email-address-forgot" // Different ID from sign-in page
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isLoading}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm disabled:bg-gray-50"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoading ? 'Sending...' : 'Send Temporary Password'}
            </button>
          </div>
        </form>

        <div className="text-sm text-center mt-6 flex justify-between items-center">
          <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
            ← Back to Sign In
          </Link>
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Create an account →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;