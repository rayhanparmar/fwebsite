import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Star, ArrowLeft, ShoppingCart, Send, MessageCircle } from "lucide-react";
import { getProductWhatsAppUrl } from "@/components/FloatingWhatsApp";
import { PRODUCT_CUSTOMIZATION_CONFIG } from "@/components/ProductCustomizationConfig";


const CATEGORY_CONFIG_MAP = {
  "Bali": "Bali",

  "Bangle": "Bangle/Kada",
  "Kada": "Bangle/Kada",

  "Bracelet": "Bracelet",

  "Chains": "Chain + Multilayer",

  "Cufflinks": "Cufflink",

  "Brooch": "Brooch",

  "Earrings": "Earring",

  "Hath Pan": "Haathpaan",

  "Maang Tikka": "Maang Tikka",

  "Mangal Sutra": "Mangal Sutra",

  "Necklace": "Necklace",

  "Nose Pin": "Nose Pin",

  "Pendant": "Pendant + Dancing Stone",

  "Rings": "Ring + Titanium Ring",

  "Tops": "Tops",

  "Watchbelts": "Watch Belt",

  "Full Set": "Full Set",
};

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
  const [customizations, setCustomizations] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(res => setProduct(res.data.product))
      .catch(() => toast.error("Product not found"))
      .finally(() => setLoading(false));
  }, [productId, api]);

  const customizationCategory = product
  ? CATEGORY_CONFIG_MAP[product.category] || product.category
  : null;

const customizationConfig = customizationCategory
  ? PRODUCT_CUSTOMIZATION_CONFIG[customizationCategory]
  : null;

const shouldShowField = (field) => {
  if (!field.showWhen) return true;

  return Object.entries(field.showWhen).every(
    ([key, expectedValue]) => customizations[key] === expectedValue
  );
};

useEffect(() => {
  if (!product || !customizationConfig) return;

  const updates = {};

  customizationConfig.fields?.forEach((field) => {
    if (
      field.autoSelect &&
      shouldShowField(field) &&
      customizations[field.key] !== field.autoSelect
    ) {
      updates[field.key] = field.autoSelect;
    }
  });

  if (Object.keys(updates).length > 0) {
    setCustomizations((prev) => ({
      ...prev,
      ...updates,
    }));
  }
}, [product, customizationConfig, customizations]);

  const handlePurityChange = (val) => {
    setMetalPurity(val);
    if (val === "22KT") setMetalSelection("Yellow Gold");
  };

  const getCustomizations = () => ({
    ...customizations,
  });

  const addToCart = async () => {
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
  

const resolveImg = (img) =>
  img?.startsWith("/api/")
    ? `${process.env.REACT_APP_BACKEND_URL}${img}`
    : img;

const handleZoomMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  const y = ((e.clientY - rect.top) / rect.height) * 100;
  
  setZoomPosition({
    x: Math.max(0, Math.min(100, x)),
    y: Math.max(0, Math.min(100, y)),
  });
};




  return (
    <div data-testid="product-detail-page" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <Link to={`/catalogue/${product.category_slug}`} className="inline-flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#359E58] mb-8 font-body" data-testid="back-to-category">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />Back to {product.category}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left - Images */}
          <div>
          <div
  className="relative aspect-square bg-[#FAFAFA] border border-[#E5E7EB] overflow-hidden mb-4 cursor-crosshair"
  data-testid="product-main-image"
  onMouseEnter={() => setShowZoom(true)}
  onMouseLeave={() => setShowZoom(false)}
  onMouseMove={handleZoomMove}
>
  <img
    src={resolveImg(product.images[activeImg])}
    alt={product.product_id}
    className="w-full h-full object-cover"
  />

  {showZoom && (
    <div
      className="absolute w-40 h-40 border-2 border-white shadow-xl pointer-events-none z-20 bg-no-repeat"
      style={{
        left: `${Math.max(0, Math.min(100, zoomPosition.x))}%`,
        top: `${Math.max(0, Math.min(100, zoomPosition.y))}%`,
        transform: "translate(-50%, -50%)",
        backgroundImage: `url("${resolveImg(product.images[activeImg])}")`,
        backgroundSize: "250%",
        backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
      }}
    />
  )}
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
            {customizationConfig?.fields
              ?.filter(shouldShowField)
              ?.map((field) => (
              <div key={field.key}>
                <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-1.5 block font-body">
                  {field.label}
                </label>

              {field.type === "select" && (
                <Select
                  value={customizations[field.key] || ""}
                  onValueChange={(value) =>
                    setCustomizations((prev) => ({
                      ...prev,
                      [field.key]: value,
                    }))
                  }
                >
                  <SelectTrigger className="rounded-sm border-[#E5E7EB]">
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>

                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === "radio" && (
              <div className="flex flex-wrap gap-2">
                {field.options?.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setCustomizations((prev) => ({
                        ...prev,
                        [field.key]: option,
                      }))
                    }
                    className={`px-4 py-2 border rounded-sm text-sm transition ${
                      customizations[field.key] === option
                        ? "border-[#359E58] bg-[#359E58] text-white"
                        : "border-[#E5E7EB] bg-white text-[#111827]"
                    }`}
                  > 
                    {option}
                  </button>
                ))}
              </div>
            )}

            {field.type === "text" && (
              <input
                type="text"
                value={customizations[field.key] || ""}
                onChange={(e) =>
                  setCustomizations((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                }))
              }
              className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#359E58]"
              placeholder={`Enter ${field.label}`}
            />
          )}

          {field.type === "date" && (
            <input
            type="date"
            value={customizations[field.key] || ""}
            onChange={(e) =>
              setCustomizations((prev) => ({
              ...prev,
              [field.key]: e.target.value,
            }))
          }
          className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-[#359E58]"
        />
      )}

      {field.type === "textarea" && (
        <Textarea
          value={customizations[field.key] || ""}
          onChange={(e) =>
            setCustomizations((prev) => ({
              ...prev,
              [field.key]: e.target.value,
            }))
          }
          className="rounded-sm border-[#E5E7EB] min-h-[80px]"
          placeholder={`Enter ${field.label}`}
        />
      )}
    </div>
  ))}
                      
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
