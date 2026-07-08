import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/components/FloatingWhatsApp";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/contact`, form);
      toast.success("Message sent successfully!");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch {
      toast.error("Failed to send message");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="contact-page" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-4 font-body">Get In Touch</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] mb-6">Contact Us</h1>
            <p className="text-[#4B5563] mb-10 font-body leading-relaxed">
              Have questions about our products or services? We'd love to hear from you.
            </p>

            <div className="space-y-6">
              <a href="tel:7045927391" className="flex items-center gap-4 group" data-testid="contact-phone">
                <div className="w-12 h-12 bg-[#359E58]/10 flex items-center justify-center group-hover:bg-[#359E58]/20 transition-colors">
                  <Phone className="w-5 h-5 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#4B5563] font-body">Phone</p>
                  <p className="font-medium text-[#0A0A0A] font-body">7045927391</p>
                </div>
              </a>
              <a href="mailto:jaysachetijs@gmail.com" className="flex items-center gap-4 group" data-testid="contact-email">
                <div className="w-12 h-12 bg-[#359E58]/10 flex items-center justify-center group-hover:bg-[#359E58]/20 transition-colors">
                  <Mail className="w-5 h-5 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#4B5563] font-body">Email</p>
                  <p className="font-medium text-[#0A0A0A] font-body">jaysachetijs@gmail.com</p>
                </div>
              </a>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#359E58]/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-xs text-[#4B5563] font-body">Location</p>
                  <p className="font-medium text-[#0A0A0A] font-body">India</p>
                </div>
              </div>
            </div>

            <a href={getWhatsAppUrl("Hi, I'm interested in your B2B jewellery services. I'd like to learn more.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-10 bg-[#25D366] hover:bg-[#20BD5A] text-white px-6 py-3 text-sm font-medium transition-colors rounded-sm" data-testid="contact-whatsapp">
              <MessageCircle className="w-5 h-5" strokeWidth={1.5} />Chat on WhatsApp
            </a>
          </div>

          {/* Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="contact-form">
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Name</Label>
                <Input name="name" value={form.name} onChange={handleChange}
                  className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
                  placeholder="Your name" required data-testid="contact-name-input" />
              </div>
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Email</Label>
                <Input name="email" type="email" value={form.email} onChange={handleChange}
                  className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
                  placeholder="Your email" required data-testid="contact-email-input" />
              </div>
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Phone</Label>
                <Input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868]"
                  placeholder="Your phone number" required data-testid="contact-phone-input" />
              </div>
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Message</Label>
                <Textarea name="message" value={form.message} onChange={handleChange}
                  className="mt-1 rounded-sm border-[#E5E7EB] focus-visible:ring-[#4AB868] min-h-[120px]"
                  placeholder="How can we help?" required data-testid="contact-message-input" />
              </div>
              <Button type="submit" disabled={loading}
                className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium"
                data-testid="contact-submit-button">
                {loading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
