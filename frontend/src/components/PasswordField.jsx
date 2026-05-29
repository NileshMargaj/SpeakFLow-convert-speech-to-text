import React from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordField({
  label,
  name,
  placeholder,
  value,
  onChange,
  icon: Icon,
  autoComplete,
}) {
  const [show, setShow] = React.useState(false);

  return (
    <div className="mb-3">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Icon className="text-gray-400" size={18} />
        </div>

        <input
          name={name}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm  outline-none transition-all placeholder:text-gray-400"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} className="text-gray-400" /> : <Eye size={18} className="text-gray-400" />}
        </button>
      </div>
    </div>
  );
}

