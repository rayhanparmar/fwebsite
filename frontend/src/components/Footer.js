import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer data-testid="footer" className="bg-[#0A0A0A] text-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="font-heading text-2xl font-medium mb-4">Shree Mother Gold & Diamond Jewellery</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Your trusted manufacturing partner with over 50 years of craftsmanship excellence. 
              We turn custom ideas into finished jewellery with unmatched accuracy and turnaround speed.
            </p>
          </div>
          <div>
            <h4 className="font-heading text-lg font-medium mb-4 text-[#31e24f]">Quick Links</h4>
            <div className="space-y-2">
              {[{to:"/",label:"Home"},{to:"/about",label:"About"},{to:"/contact",label:"Contact"},{to:"/login",label:"Retailer Login"}].map(l=>(
                <Link key={l.to} to={l.to} className="block text-gray-400 hover:text-[#4AB868] transition-colors text-sm">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-heading text-lg font-medium mb-4 text-[#6CC284]">Contact</h4>
            <div className="space-y-3">
              <a href="tel:7045927391" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                <Phone className="w-4 h-4" strokeWidth={1.5} />7045927391
              </a>
              <a href="mailto:jaysachetijs@gmail.com" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm">
                <Mail className="w-4 h-4" strokeWidth={1.5} />jaysachetijs@gmail.com
              </a>
              <div className="flex items-start gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={1.5} />India
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Shree Mother Gold & Diamond Jewellery. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
