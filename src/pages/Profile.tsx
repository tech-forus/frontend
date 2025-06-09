// src/pages/ProfilePage.tsx
import React, { useState, FormEvent } from 'react';
import { UserCircle, LockKeyhole, Save } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios'; // Ensure axios is imported if not already globally available

interface PasswordFieldsType {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const [passwordFields, setPasswordFields] = useState<PasswordFieldsType>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const { user } = useAuth(); // Assuming useAuth provides the user object

  // customer object derived from user, with a fallback to an empty object
  const customer = (user as any)?.customer || {};
  const nameParts = (customer.name || '').split(' ');

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordFields(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    setMessageType(null);

    // Frontend Validations
    if (passwordFields.newPassword !== passwordFields.confirmPassword) {
      setMessage('New password and confirm password do not match.');
      setMessageType('error');
      setIsSaving(false);
      return;
    }
    if (passwordFields.newPassword.length < 8) {
      setMessage('New password must be at least 8 characters long.');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    // Ensure mailId is available from the customer object
    if (!customer.mailId) {
      setMessage('User email could not be determined. Cannot change password.');
      setMessageType('error');
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        mailId: customer.mailId, // Use mailId from the customer object
        password: passwordFields.currentPassword,
        newpassword: passwordFields.newPassword,
      };

      const response = await axios.post(
        "http://localhost:8000/api/auth/changepassword", 
        payload
      );

      // Assuming API responds with 2xx status and a message in response.data
      setMessage(response.data?.message || 'Password changed successfully!');
      setMessageType('success');
      setPasswordFields({ // Reset fields on success
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        
      });

    } catch (error) {
      console.error("Password change error:", error);
      let errorMessage = 'An unexpected error occurred while changing password.';
      if (axios.isAxiosError(error) && error.response) {
        // Backend responded with an error status code (4xx, 5xx)
        // Try to use message from backend response, or fallback to Axios error message or generic one
        errorMessage = error.response.data?.message || error.message || 'Failed to change password due to a server error.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setIsSaving(false);
    }
  };

  const ProfileField: React.FC<{ label: string; value: string | undefined | null }> = ({ label, value }) => (
    <div>
      <p className="block text-sm font-medium text-gray-500 mb-0.5">{label}</p>
      <p className="text-md text-gray-800">{value || '-'}</p>
    </div>
  );

  return (
    <div className="container mx-auto p-4 font-sans">
      {/* Header */}
      <div className="flex items-center mb-6 border-b pb-4">
        <UserCircle size={36} className="mr-3 text-blue-600" />
        <h1 className="text-3xl font-semibold text-gray-800">User Profile</h1>
      </div>

      <div className="space-y-8 bg-white p-6 md:p-8 rounded-lg shadow-lg">
        {/* Personal Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="First Name" value={nameParts[0]} />
            <ProfileField label="Last Name" value={nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-'} />
          </div>
        </section>

        {/* Contact Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Email Address" value={customer.mailId} />
            <ProfileField label="Phone Number" value={customer.contactNumber} />
          </div>
        </section>

        {/* Company Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">
            Company Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <ProfileField label="Company Name" value={customer.companyName} />
            <ProfileField label="GST Number" value={customer.gstNumber} />
          </div>
        </section>

        {/* Address Info */}
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">
            Company Address
          </h2>
          <div className="space-y-4">
            <ProfileField label="Address Line" value={customer.address} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              <ProfileField label="State / Province" value={customer.state} />
              <ProfileField label="Pincode / ZIP Code" value={customer.pincode} />
              <ProfileField label="Country" value={"India"} /> {/* Assuming country is fixed */}
            </div>
          </div>
        </section>

        <hr className="my-6" />

        {/* Password Change */}
        <section>
          <div className="flex items-center mb-4">
            <LockKeyhole size={28} className="mr-3 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-700 border-l-4 border-blue-500 pl-2">
              Change Password
            </h2>
          </div>
          {/* Form onSubmit now correctly calls the revised handlePasswordSubmit */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {['currentPassword', 'newPassword', 'confirmPassword'].map(field => (
              <div key={field}>
                <label
                  htmlFor={field}
                  className="block text-sm font-medium text-gray-600 mb-1 capitalize"
                >
                  {/* Simple capitalization for display */}
                  {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type="password"
                  name={field}
                  id={field}
                  value={(passwordFields as any)[field]}
                  onChange={handlePasswordInputChange}
                  required
                  minLength={field !== 'currentPassword' ? 8 : undefined}
                  className="mt-1 block w-full md:w-1/2 rounded-md border border-gray-400 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
                />
              </div>
            ))}

            {message && (
              <div
                className={`mt-4 p-3 rounded-md text-sm ${
                  messageType === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <div className="pt-2 flex">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md shadow-sm text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? 'Saving...' : 'Change Password'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;