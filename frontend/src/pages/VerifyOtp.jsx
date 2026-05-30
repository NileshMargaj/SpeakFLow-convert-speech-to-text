import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "lucide-react";

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

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const initialEmail = location?.state?.email || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
  });

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!formData.email && initialEmail) {
      setFormData((p) => ({ ...p, email: initialEmail }));
    }
  }, [initialEmail]);

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
      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "OTP verification failed");
      }

      navigate("/reset-password", { state: { email: formData.email } });
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
            <Lock size={28} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Verify OTP</h2>
          <p className="text-sm text-gray-500 mt-1">Enter the OTP sent to your email.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <InputField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            icon={Lock}
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <InputField
            label="OTP"
            name="otp"
            type="text"
            placeholder="6-digit OTP"
            icon={Lock}
            value={formData.otp}
            onChange={handleChange}
            autoComplete="one-time-code"
          />

          {message && (
            <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{message}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !formData.email}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-100 active:scale-[0.98]"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
            <ArrowRight size={18} />
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4 font-medium">
          Go back to OTP request?{" "}
          <button
            type="button"
            className="text-indigo-500 font-bold hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            Resend / Change Email
          </button>
        </p>
      </div>
    </div>
  );
}

