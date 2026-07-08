import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap, Palette, Award, MessageSquare, ClipboardList, Search, Send, Package } from "lucide-react";

const HERO_BG = "https://static.prod-images.emergentagent.com/jobs/9bb42aae-fb6d-46ba-ae48-310133cc4e67/images/698ab8deb15cdb7d190448cac4df80dcd80eff7d114580c39d22f1a61f1049d4.png";

const features = [
  {
    icon: Zap,
    title: "Fast CAD Turnaround",
    desc: "Get your custom designs rendered in CAD within 24-48 hours",
    span: "md:col-span-1",
    action: () => navigate("/catalogue"),
  },
  {
    icon: Palette,
    title: "100% Customisable",
    desc: "Any design, any modification - we make it happen with precision",
    span: "md:col-span-1",
    action: () => navigate("/customisation"),
  },
  {
    icon: Award,
    title: "50 Years Legacy",
    desc: "Five decades of manufacturing excellence and innovation",
    span: "md:col-span-1",
    action: () => navigate("/about"),
  },
  {
    icon: MessageSquare,
    title: "Reliable Communication",
    desc: "Stay updated at every step with transparent communication",
    span: "md:col-span-1",
    action: () => window.open("https://wa.me/917045927391", "_blank"),
  },
];

const steps = [
  { num: "1", icon: ClipboardList, title: "Apply & Get Approved", desc: "Register as a retailer with business details" },
  { num: "2", icon: Search, title: "Browse or Customise", desc: "Explore our collection or request custom designs" },
  { num: "3", icon: Send, title: "Submit Enquiry", desc: "Add items to cart and submit your enquiry" },
  { num: "4", icon: Package, title: "Receive & Sell", desc: "Get your precision-crafted jewellery delivered" },
];

const stats = [
  { value: "50+", label: "Years Experience" },
  { value: "500+", label: "Retailer Partners" },
  { value: "10K+", label: "Designs Created" },
  { value: "24h", label: "CAD Turnaround" },
];

export default function HomePage() {
  const { user } = useAuth();
  const isApproved = user?.approved || user?.role === "admin";
  const navigate = useNavigate();

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-white/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-16 sm:py-24 md:py-32">
          <div className="max-w-3xl">
            <p className="text-sm sm:text-base md:text-lg font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#359E58] mb-4 sm:mb-6 animate-fade-up font-body">
              Premium B2B Jewellery Manufacturing
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.15]">
  <span className="text-[#0A0A0A]">
    Your Manufacturing Partner for
  </span>
  <br />
  <span className="text-[#359E58]">
    Precision, Speed & Customisation
  </span>
</h1>
            <p className="text-sm sm:text-base md:text-lg text-[#4B5563] leading-relaxed mb-8 sm:mb-10 max-w-xl animate-fade-up stagger-2 font-body">
            We manufacture premium custom jewellery in gold, diamond, and platinum for retailers and luxury brands worldwide — specialising in finely crafted rings, necklaces, bracelets, pendants, and bespoke pieces with exceptional detailing, precision production, and superior finishing standards.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 animate-fade-up stagger-3">
              {!user && (
                <Link to="/register">
                  <Button className="bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-8 py-5 sm:py-6 text-sm font-medium w-full sm:w-auto" data-testid="hero-apply-button">
                    Apply as Retailer
                  </Button>
                </Link>
              )}
              {isApproved ? (
                <Link to="/catalogue">
                  <Button variant="outline" className="border-[#359E58] text-[#359E58] hover:bg-[#359E58]/5 rounded-sm px-8 py-5 sm:py-6 text-sm font-medium w-full sm:w-auto" data-testid="hero-explore-button">
                    Explore Catalogue
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="border-[#359E58] text-[#359E58] hover:bg-[#359E58]/5 rounded-sm px-8 py-5 sm:py-6 text-sm font-medium w-full sm:w-auto" data-testid="hero-explore-button">
                    Retailer Login
                  </Button>
                </Link>
              )}
              {isApproved && (
                <Link to="/customisation">
                  <Button variant="outline" className="border-[#4B5563] text-[#4B5563] hover:bg-gray-50 rounded-sm px-8 py-5 sm:py-6 text-sm font-medium w-full sm:w-auto" data-testid="hero-customise-button">
                    Request Customisation
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Why Retailers Choose */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-4">
  <span className="text-[#0A0A0A]">
    Why Retailers Choose{" "}
  </span>
  <span className="text-[#359E58]">
    Shree Mother Gold & Diamond Jewellery
  </span>
</h2>
          <p className="text-[#4B5563] mb-16 max-w-lg font-body">Built on trust, powered by precision</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <div
              key={i}
              onClick={() => {
                if (i === 0) navigate("/catalogue");
                if (i === 1) navigate("/customisation");
                if (i === 2) navigate("/about");
                if (i === 3) window.open("https://wa.me/917045927391", "_blank");
              }}
              className={`bg-white border border-[#E5E7EB] p-8 md:p-10 hover:border-[#6CC284]/50 hover:shadow-lg hover:scale-105 cursor-pointer transition-all duration-300 ${f.span}`}
              data-testid={`feature-card-${i}`}
            >
                <div className="w-12 h-12 bg-[#359E58]/10 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-[28px] font-medium text-[#0A0A0A] mb-4 leading-snug">{f.title}</h3>
                <p className="text-base md:text-lg text-[#4B5563] leading-relaxed font-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideas CTA */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="p-12 md:p-20 text-center bg-cover bg-center"style={{ backgroundImage: "url('/banner.png')" }}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-white mb-4">Turn Your Ideas Into Reality</h2>
            <p className="text-gray-400 mb-10 max-w-lg mx-auto font-body">
              Upload sketches, share references, or describe your vision. Our expert team will bring your custom jewellery designs to life.
            </p>
            <Link to={isApproved ? "/customisation" : "/register"}>
              <Button className="bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-10 py-6 text-sm font-medium" data-testid="ideas-cta-button">
                Request Customisation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 sm:py-24 md:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">How It Works</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#0A0A0A] mb-4">Our Simple Process</h2>
          <p className="text-[#4B5563] mb-16 max-w-lg font-body">From concept to creation in 4 easy steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div
              key={i}
              className={`relative ${i === 0 ? "cursor-pointer hover:scale-105 transition-all duration-300" : ""}`}
              data-testid={`process-step-${i}`}
              onClick={() => i === 0 && navigate("/register")}
            >
                <div className="text-6xl font-heading font-bold text-[#0A0A0A] mb-4">{s.num}</div>
                <div className="w-10 h-10 bg-[#359E58] flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-[#0A0A0A] mb-2">{s.title}</h3>
                <p className="text-sm text-[#4B5563] font-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center" data-testid={`stat-${i}`}>
                <div className="text-4xl sm:text-5xl font-serif font-semibold text-[#359E58] mb-2">{s.value}</div>
                <div className="text-sm text-[#4B5563] font-body">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#0A0A0A] mb-4">Ready to Partner with Shree Mother Gold and Diamond Jewellery?</h2>
          <p className="text-[#4B5563] mb-10 max-w-lg mx-auto font-body">Join hundreds of retailers who trust us for their jewellery manufacturing needs</p>
          <Link to={user ? "/catalogue" : "/register"}>
            <Button className="bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-10 py-6 text-sm font-medium" data-testid="final-cta-button">
              {user ? "Explore Catalogue" : "Apply Now"}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
