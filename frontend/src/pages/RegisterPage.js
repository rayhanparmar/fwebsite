// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";

// export default function RegisterPage() {
//   const { register } = useAuth();
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ name: "", email: "", password: "", business_name: "", gst_number: "", phone: "", location: "" });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     try {
//       await register(form);
//       toast.success("Registration successful! Your account is pending approval.");
//       navigate("/login");
//     } catch (err) {
//       const detail = err.response?.data?.detail;
//       const msg = typeof detail === "string" ? detail
//         : Array.isArray(detail) ? detail.map(e => e.msg || JSON.stringify(e)).join(" ")
//         : "Registration failed.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fields = [
//     { name: "name", label: "Full Name", type: "text", placeholder: "Your full name" },
//     { name: "business_name", label: "Business Name", type: "text", placeholder: "Your jewellery business name" },
//     { name: "gst_number", label: "GST Number", type: "text", placeholder: "GST registration number" },
//     { name: "email", label: "Email", type: "email", placeholder: "Business email address" },
//     { name: "phone", label: "Contact Number", type: "tel", placeholder: "Phone number" },
//     { name: "location", label: "Location", type: "text", placeholder: "City, State" },
//     { name: "password", label: "Password", type: "password", placeholder: "Create a password" },
//   ];

//   return (
//     <div data-testid="register-page" className="min-h-[80vh] flex items-center justify-center px-6 py-16">
//       <div className="w-full max-w-lg">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">Apply as Retailer</h1>
//           <p className="text-[#4B5563] text-sm font-body">Register your business to access our B2B platform</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4" data-testid="register-form">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-body" data-testid="register-error">
//               {error}
//             </div>
//           )}
//           {fields.map(f => (
//             <div key={f.name}>
//               <Label htmlFor={f.name} className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">{f.label}</Label>
//               <Input id={f.name} name={f.name} type={f.type} value={form[f.name]} onChange={handleChange}
//                 className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
//                 placeholder={f.placeholder} required data-testid={`register-${f.name}-input`} />
//             </div>
//           ))}
//           <Button type="submit" disabled={loading}
//             className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium mt-2"
//             data-testid="register-submit-button">
//             {loading ? "Submitting..." : "Submit Application"}
//           </Button>
//         </form>

//         <p className="text-center mt-8 text-sm text-[#4B5563] font-body">
//           Already have an account?{" "}
//           <Link to="/login" className="text-[#359E58] font-medium hover:underline">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "@/contexts/AuthContext";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";

// export default function RegisterPage() {
//   const { register } = useAuth();
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     business_name: "",
//     gst_number: "",
//     phone: "",
//     location: ""
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     // ✅ CUSTOM VALIDATION (GST optional)
//     if (
//       !form.name ||
//       !form.email ||
//       !form.password ||
//       !form.business_name ||
//       !form.phone ||
//       !form.location
//     ) {
//       setError("Please fill all required fields");
//       setLoading(false);
//       return;
//     }

//     try {
//       await register(form);
//       toast.success("Registration successful! Check your email for verification.");
//       navigate("/login");
//     } catch (err) {
//       const detail = err.response?.data?.detail;
//       const msg =
//         typeof detail === "string"
//           ? detail
//           : Array.isArray(detail)
//           ? detail.map((e) => e.msg || JSON.stringify(e)).join(" ")
//           : "Registration failed.";
//       setError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fields = [
//     { name: "name", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
//     { name: "business_name", label: "Business Name", type: "text", placeholder: "Your jewellery business name", required: true },
//     { name: "gst_number", label: "GST Number (Optional)", type: "text", placeholder: "GST registration number", required: false }, // ✅ optional
//     { name: "email", label: "Email", type: "email", placeholder: "Business email address", required: true },
//     { name: "phone", label: "Contact Number", type: "tel", placeholder: "Phone number", required: true },
//     { name: "location", label: "Location", type: "text", placeholder: "City, State", required: true },
//     { name: "password", label: "Password", type: "password", placeholder: "Create a password", required: true },
//   ];

//   return (
//     <div className="min-h-[80vh] flex items-center justify-center px-6 py-16">
//       <div className="w-full max-w-lg">
//         <div className="text-center mb-10">
//           <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">
//             Apply as Retailer
//           </h1>
//           <p className="text-[#4B5563] text-sm">
//             Register your business to access our B2B platform
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
//               {error}
//             </div>
//           )}

//           {fields.map((f) => (
//             <div key={f.name}>
//               <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
//                 {f.label}
//               </Label>
//               <Input
//                 name={f.name}
//                 type={f.type}
//                 value={form[f.name]}
//                 onChange={handleChange}
//                 placeholder={f.placeholder}
//                 required={f.required} // ✅ dynamic required
//                 className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
//               />
//             </div>
//           ))}

//           <Button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium mt-2"
//           >
//             {loading ? "Submitting..." : "Submit Application"}
//           </Button>
//         </form>

//         <p className="text-center mt-8 text-sm text-[#4B5563]">
//           Already have an account?{" "}
//           <Link to="/login" className="text-[#359E58] font-medium hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    location: ""
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Validation (GST optional)
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.business_name ||
      !form.phone ||
      !form.location
    ) {
      setError("Please fill all required fields");
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
    { name: "name", label: "Full Name", type: "text", placeholder: "Your full name", required: true },
    { name: "business_name", label: "Business Name", type: "text", placeholder: "Your jewellery business name", required: true },
    { name: "gst_number", label: "GST Number (Optional)", type: "text", placeholder: "GST registration number", required: false },
    { name: "email", label: "Email", type: "email", placeholder: "Business email address", required: true },
    { name: "phone", label: "Contact Number", type: "tel", placeholder: "Phone number", required: true },
    { name: "location", label: "Location", type: "text", placeholder: "City, State", required: true },
    { name: "password", label: "Password", type: "password", placeholder: "Create a password", required: true },
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

              {/* ✅ LOCATION DROPDOWN */}
              {f.name === "location" ? (
                <select
                  name="location"
                  value={form.location}
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
              ) : (
                <Input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required={f.required}
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