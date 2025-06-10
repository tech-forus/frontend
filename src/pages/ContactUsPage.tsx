// src/pages/ContactUsPage.tsx
import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Building,
  User,
  MessageSquare,
  Type,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactInfoItem: React.FC<{
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  href?: string;
}> = ({ icon: Icon, title, children, href }) => (
  <div className="flex items-start space-x-3">
    <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
    <div>
      <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-md text-gray-600 hover:text-blue-700 underline"
        >
          {children}
        </a>
      ) : (
        <p className="mt-1 text-md text-gray-600">{children}</p>
      )}
    </div>
  </div>
);

const ContactUsPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const validate = (): boolean => {
    const { name, email, subject, message } = formData;
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all fields.');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    return true;
  };

  const buildMailtoLink = () => {
    const { name, email, subject, message } = formData;
    const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
    return (
      `mailto:tech@foruselectric.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };

  const buildGmailLink = () => {
    const { name, email, subject, message } = formData;
    const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
    return (
      `https://mail.google.com/mail/?view=cm&fs=1&to=tech@foruselectric.com&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    );
  };

  const mailtoLink = buildMailtoLink();
  const gmailLink = buildGmailLink();

  return (
    <div className="bg-gray-50 font-sans">
      <div className="container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <Building size={48} className="mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help and answer any question you might have. We look
            forward to hearing from you!
          </p>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">

            {/* FORM */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Send Us a Message
              </h2>
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject
                  </label>
                  <div className="relative">
                    <Type className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      placeholder="Inquiry about..."
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <textarea
                      name="message"
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 block w-full pl-10 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2.5"
                      placeholder="Your message here..."
                    />
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}

                {/* BUTTONS */}
                <div className="flex space-x-4">
                  {/* Native mail client chooser */}
                  <a
                    href={mailtoLink}
                    onClick={e => {
                      if (!validate()) e.preventDefault();
                    }}
                    className="flex-1 inline-flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md shadow-sm text-base font-medium transition-colors duration-150"
                  >
                    📧 Use my email app
                  </a>

                  {/* Gmail web */}
                  <a
                    href={gmailLink}
                    onClick={e => {
                      if (!validate()) e.preventDefault();
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm text-base font-medium transition-colors duration-150"
                  >
                    ✉ Open in Gmail
                  </a>
                </div>
              </div>
            </section>

            {/* INFO & MAP */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-700 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <ContactInfoItem
                  icon={Mail}
                  title="Email Us"
                  href="mailto:tech@foruselectric.com"
                >
                  tech@foruselectric.com
                </ContactInfoItem>
                <ContactInfoItem
                  icon={Phone}
                  title="Call Us"
                  href="tel:+911140366378"
                >
                  +911140366378
                </ContactInfoItem>
                <ContactInfoItem icon={MapPin} title="Our Office">
                  Building No. 313,<br />
                  Okhla Phase 1,<br />
                  Delhi – 110020
                </ContactInfoItem>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-medium text-gray-800 mb-3">
                  Find Us Here
                </h3>
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg shadow overflow-hidden">
                  <iframe
                    src="https://maps.google.com/maps?q=Forus%20Electric%20Building%20No.%20313%20Okhla%20Phase%201%2C%20Delhi%20-%20110020&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    title="Forus Electric – Okhla Phase 1"
                  />
                </div>
                <a
                  href="https://maps.app.goo.gl/6WwirDV5uYnub3j57"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  View on Google Maps
                </a>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;