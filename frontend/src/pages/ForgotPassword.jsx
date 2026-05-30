import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const InputField = ({ label, type, placeholder, icon: Icon, name, value, onChange, autoComplete }) => (
  <div className="mb-3">
    <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
        <Icon className="text-gray-400" size={18} />
      </div>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm  outline-none transition-all placeholder:text-gray-400"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      // Move to OTP verify screen. We'll pass email via navigation state.
      navigate("/verify-otp", { state: { email: formData.email } });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="max-w-[440px] w-full bg-white rounded-[32px] shadow-lg border border-gray-100 p-10">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500 rounded-2xl text-white mb-4 shadow-lg shadow-indigo-100">
            <Mail size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-500 mt-1">Enter your email to receive an OTP.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          {message && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 active:scale-[0.98]"
          >
            {isSubmitting ? "Sending OTP..." : "Send OTP"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4 font-medium">
          Remembered your password?{" "}
          <button
            type="button"
            className="text-indigo-500 font-bold hover:underline"
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </p>
      </div>
    </div>
  );
}

