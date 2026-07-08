import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, ArrowLeft, ShoppingCart, Send, MessageCircle } from "lucide-react";
import { getProductWhatsAppUrl } from "@/components/FloatingWhatsApp";

const SIZE_OPTIONS = {
  Rings: ["4","5","6","7","8","9","10","11","12","13"],
  Bangle: ["2.2","2.4","2.6","2.8","2.10"],
  Kada: ["2.2","2.4","2.6","2.8","2.10"],
  Bracelet: ['6"','7"','8"','9"'],
  Necklace: ['16"','18"','20"','22"','24"'],
  Chains: ['16"','18"','20"','22"','24"'],
  "Mangal Sutra": ['16"','18"','20"','22"'],
  default: ["Standard","Custom"],
};

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [metalSelection, setMetalSelection] = useState("");
  const [metalPurity, setMetalPurity] = useState("");
  const [stoneSelection, setStoneSelection] = useState("");
  const [diamondQuality, setDiamondQuality] = useState("");
  const [diamondColor, setDiamondColor] = useState("");
  const [size, setSize] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(res => setProduct(res.data.product))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [productId, api]);

  const handlePurityChange = (val) => {
    setMetalPurity(val);
    if (val === "22KT") setMetalSelection("Yellow Gold");
  };

  const getCustomizations = () => ({
    metal_selection: metalSelection, metal_purity: metalPurity,
    stone_selection: stoneSelection, diamond_quality: diamondQuality,
    diamond_color: diamondColor, size: size,
  });

  const addToCart = async () => {
    if (!metalSelection || !metalPurity) { toast.error("Please select metal options"); return; }
    setSubmitting(true);
    try {
      await api.post("/cart", {
        product_id: product.product_id, category: product.category,
        image: product.images[0], customizations: getCustomizations(), notes,
      });
      toast.success("Added to enquiry cart!");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add to cart");
    } finally { setSubmitting(false); }
  };

  const placeOrder = async () => {
    if (!metalSelection || !metalPurity) { toast.error("Please select metal options"); return; }
    setSubmitting(true);
    try {
      await api.post("/cart", {
        product_id: product.product_id, category: product.category,
        image: product.images[0], customizations: getCustomizations(), notes,
      });
      await api.post("/enquiries", { notes: `Direct order for ${product.product_id}. ${notes}` });
      toast.success("Order enquiry submitted! We will contact you shortly.");
      navigate("/catalogue");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to place order");
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#359E58] border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!product) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p>Product not found</p></div>;
  }

  const sizes = SIZE_OPTIONS[product.category] || SIZE_OPTIONS.default;
  const resolveImg = (img) => img?.startsWith("/api/") ? `${process.env.REACT_APP_BACKEND_URL}${img}` : img;

  return (
    <div data-testid="product-detail-page" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <Link to={`/catalogue/${product.category_slug}`} className="inline-flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#359E58] mb-8 font-body" data-testid="back-to-category">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />Back to {product.category}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Images */}
          <div>
            <div className="aspect-square bg-[#FAFAFA] border border-[#E5E7EB] overflow-hidden mb-4" data-testid="product-main-image">
              <img src={resolveImg(product.images[activeImg])} alt={product.product_id} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 border overflow-hidden transition-all shrink-0 ${activeImg === i ? "border-[#359E58] ring-1 ring-[#359E58]" : "border-[#E5E7EB]"}`}
                  data-testid={`product-thumbnail-${i}`}>
                  <img src={resolveImg(img)} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Details & Customization */}
          <div>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-2 font-body">{product.category}</p>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A] mb-3">{product.product_id}</h1>
            <div className="flex items-center gap-1 mb-8">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 fill-[#359E58] text-[#359E58]" />)}
            </div>

            <div className="space-y-5">
              {/* Metal Selection */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Metal Selection</label>
                <Select value={metalSelection} onValueChange={setMetalSelection} disabled={metalPurity === "22KT"}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-metal">
                    <SelectValue placeholder="Select Metal" />
                  </SelectTrigger>
                  <SelectContent>
                    {metalPurity === "22KT" ? (
                      <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="White Gold">White Gold</SelectItem>
                        <SelectItem value="Yellow Gold">Yellow Gold</SelectItem>
                        <SelectItem value="Rose Gold">Rose Gold</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {metalPurity === "22KT" && <p className="text-xs text-[#359E58] mt-1 font-body">Locked to Yellow Gold for 22KT</p>}
              </div>

              {/* Metal Purity */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Metal Purity</label>
                <Select value={metalPurity} onValueChange={handlePurityChange}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-purity">
                    <SelectValue placeholder="Select Purity" />
                  </SelectTrigger>
                  <SelectContent>
                    {["9KT","14KT","18KT","22KT"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Stone Selection */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Stone Selection</label>
                <Select value={stoneSelection} onValueChange={setStoneSelection}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-stone">
                    <SelectValue placeholder="Select Stone" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Natural Diamond / Lab Grown","Polki","Color Stone","Pearl","Moti"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Diamond Quality */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Diamond Quality</label>
                <Select value={diamondQuality} onValueChange={setDiamondQuality}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-diamond-quality">
                    <SelectValue placeholder="Select Quality" />
                  </SelectTrigger>
                  <SelectContent>
                    {["VVS-VS","VS","VS-SI","SI","SI2-3","I1","I2-I3","PK","OW-VS","OW-SI"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Diamond Color */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Diamond Color</label>
                <Select value={diamondColor} onValueChange={setDiamondColor}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-diamond-color">
                    <SelectValue placeholder="Select Color" />
                  </SelectTrigger>
                  <SelectContent>
                    {["D","E","F","G","GH","H","I","J","K","L","M"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Size */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Size</label>
                <Select value={size} onValueChange={setSize}>
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]" data-testid="select-size">
                    <SelectValue placeholder="Select Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {sizes.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">Special Notes</label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  className="rounded-sm border-[#E5E7EB] min-h-[80px]"
                  placeholder="Any special requirements..." data-testid="product-notes" />
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button onClick={addToCart} disabled={submitting}
                className="flex-1 bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 gap-2 text-sm"
                data-testid="product-add-to-cart">
                <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />Add to Cart
              </Button>
              <Button onClick={placeOrder} disabled={submitting}
                variant="outline" className="flex-1 border-[#359E58] text-[#359E58] hover:bg-[#359E58]/5 rounded-sm py-6 gap-2 text-sm"
                data-testid="product-place-order">
                <Send className="w-4 h-4" strokeWidth={1.5} />Place Order
              </Button>
            </div>

            {/* WhatsApp Enquiry */}
            <a
              href={getProductWhatsAppUrl(product.product_id, product.category)}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 mt-3 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-sm py-4 text-sm font-medium transition-colors w-full"
              data-testid="product-whatsapp-enquiry"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.5} />Enquire via WhatsApp
            </a>

            {/* Customisation link */}
            <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
              <Link to={`/customisation?product=${product.product_id}`}
                className="text-sm text-[#359E58] font-medium hover:underline font-body"
                data-testid="product-request-customisation">
                Need further customisation? Request Custom Design &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
