import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { City } from "country-state-city";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    business_name: "",
    gst_number: "",
    phone: "",
    state: "",
    city: "",
    business_address: "",
    pincode: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const indianStates = [
    "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
    "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
    "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya",
    "Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim",
    "Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand",
    "West Bengal","Delhi"
  ];

  const indianCities = City.getCitiesOfCountry("IN");

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "state") {
      setForm({
        ...form,
        state: value,
        city: ""
      });
      return;
    }
  
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validation (GST optional)
    if (!form.name.trim()) {
      setError("Full Name has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.business_name.trim()) {
      setError("Business Name has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.gst_number.trim()) {
      setError("GST Number has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.email.trim()) {
      setError("Email has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.phone.trim()) {
      setError("Contact Number has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.state) {
      setError("State has to be selected");
      setLoading(false);
      return;
    }
    
    if (!form.city) {
      setError("City has to be selected");
      setLoading(false);
      return;
    }
    
    if (!form.business_address.trim()) {
      setError("Business Address has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.pincode.trim()) {
      setError("Pincode has to be filled");
      setLoading(false);
      return;
    }
    
    if (!form.password) {
      setError("Password has to be filled");
      setLoading(false);
      return;
    }

    try {
      await register(form);
      toast.success("Registration successful! Check your email for verification.");
      navigate("/login");
    } catch (err) {
      console.log(err); // 👈 IMPORTANT
    
      const msg =
        err?.response?.data?.detail ||
        JSON.stringify(err?.response?.data) ||
        err.message ||
        "Something went wrong. Try again.";
    
      setError(msg);
    }finally {
      setLoading(false);
    }
  };

  const fields = [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Your full name",
      required: true
    },
    {
      name: "business_name",
      label: "Business Name",
      type: "text",
      placeholder: "Your jewellery business name",
      required: true
    },
    {
      name: "gst_number",
      label: "GST Number",
      type: "text",
      placeholder: "GST registration number",
      required: true
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Business email address",
      required: true
    },
    {
      name: "phone",
      label: "Contact Number",
      type: "tel",
      placeholder: "Phone number",
      required: true
    },
    {
      name: "state",
      label: "State",
      type: "select",
      placeholder: "Select State",
      required: true
    },
    {
      name: "city",
      label: "City",
      type: "select",
      placeholder: "Select City",
      required: true
    },
    {
      name: "business_address",
      label: "Business Address",
      type: "text",
      placeholder: "Enter your complete business address",
      required: true
    },
    {
      name: "pincode",
      label: "Pincode",
      type: "text",
      placeholder: "Enter your 6-digit pincode",
      required: true
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      required: true
    },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">
            Apply as Retailer
          </h1>
          <p className="text-[#4B5563] text-sm">
            Register your business to access our B2B platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

{fields.map((f) => (
  <div key={f.name}>
    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
      {f.label}
    </Label>

    {f.name === "state" ? (
      <select
        name="state"
        value={form.state}
        onChange={handleChange}
        required
        className="mt-1 w-full rounded-sm border border-[#E5E7EB] p-2 focus:outline-none focus:ring-2 focus:ring-[#4AB868]"
      >
        <option value="">Select State</option>

        {indianStates.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

    ) : f.name === "city" ? (
      <select
        name="city"
        value={form.city}
        onChange={handleChange}
        required
        disabled={!form.state}
        className="mt-1 w-full rounded-sm border border-[#E5E7EB] p-2 focus:outline-none focus:ring-2 focus:ring-[#4AB868] disabled:bg-gray-100"
      >
        <option value="">
          {form.state ? "Select City" : "Select State First"}
        </option>

        {indianCities
          .filter((city) => city.stateName === form.state)
          .map((city) => (
            <option
              key={`${city.name}-${city.stateCode}`}
              value={city.name}
            >
              {city.name}
            </option>
          ))}
      </select>

    ) : f.name === "business_address" ? (
      <textarea
        name="business_address"
        value={form.business_address}
        onChange={handleChange}
        placeholder={f.placeholder}
        required
        rows={4}
        className="mt-1 w-full rounded-sm border border-[#E5E7EB] p-3 focus:outline-none focus:ring-2 focus:ring-[#4AB868] resize-none"
      />

    ) : (
      <Input
  name={f.name}
  type={f.name === "pincode" ? "text" : f.type}
  value={form[f.name]}
  onChange={(e) => {
    if (f.name === "pincode") {
      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
      setForm({ ...form, pincode: value });
    } else {
      handleChange(e);
    }
  }}
  placeholder={f.placeholder}
  required={f.required}
  inputMode={f.name === "pincode" ? "numeric" : undefined}
  className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
/>
    )}
  </div>
))}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium mt-2"
          >
            {loading ? "Submitting..." : "Submit Application"}
          </Button>
        </form>

        <p className="text-center mt-8 text-sm text-[#4B5563]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#359E58] font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}