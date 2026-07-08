import { Award, Gem, Monitor, TrendingUp } from "lucide-react";

const CRAFTSMAN = "/raydada.jpg";

const highlights = [
  { icon: Award, title: "50 Years of Legacy", desc: "Half a century of precision craftsmanship, manufacturing excellence, and commitment to quality that retailers trust." },
  { icon: Gem, title: "Diamond & Polki Experts", desc: "Specialized expertise in diamond and polki jewellery with deep knowledge of stone selection and setting techniques." },
  { icon: Monitor, title: "Advanced CAD Capabilities", desc: "State-of-the-art CAD technology for rapid design rendering, allowing retailers to visualize designs before production." },
  { icon: TrendingUp, title: "Market-Ready Designs", desc: "We adapt our designs based on current market trends and retailer feedback, ensuring every piece sells." },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="py-20 md:py-32 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-4 font-body">Our Story</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] leading-tight mb-6">
                Crafting Excellence for 50 Years
              </h1>
              <p className="text-[#4B5563] leading-relaxed mb-6 font-body">
                Shree Mother Gold & Diamond Jewellery has been a cornerstone of the B2B jewellery manufacturing 
                industry for over five decades. Founded with a vision of precision and trust, we have grown to become 
                one of the most reliable manufacturing partners for retailers across India.
              </p>
              <p className="text-[#4B5563] leading-relaxed font-body">
                Our journey began with a small workshop and a passion for perfect craftsmanship. Today, we combine 
                traditional techniques with modern CAD technology to deliver designs that meet the highest standards 
                of quality and aesthetics.
              </p>
            </div>
            <div className="aspect-[4/3] overflow-hidden bg-gray-100">
              <img src={CRAFTSMAN} alt="Craftsmanship" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">What Sets Us Apart</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#0A0A0A] mb-16">Our Strengths</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="bg-[#FAFAFA] border border-[#E5E7EB] p-8 md:p-10" data-testid={`about-highlight-${i}`}>
                <div className="w-12 h-12 bg-[#359E58]/10 flex items-center justify-center mb-6">
                  <h.icon className="w-6 h-6 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <h3 className="text-xl font-medium text-[#0A0A0A] mb-3">{h.title}</h3>
                <p className="text-sm text-[#4B5563] leading-relaxed font-body">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-32 bg-[#0A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-6">Our Manufacturing Promise</h2>
          <p className="text-gray-400 max-w-2xl mx-auto font-body leading-relaxed">
            Every piece that leaves our workshop carries the promise of precision, quality, and timely delivery. 
            We understand that as a retailer, your reputation depends on the quality of jewellery you offer. 
            That's why we treat every order with the same level of care and attention to detail, 
            whether it's a single custom piece or a bulk production run.
          </p>
        </div>
      </section>
    </div>
  );
}
