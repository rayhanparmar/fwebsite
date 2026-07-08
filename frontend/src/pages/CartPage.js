import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Trash2, Send, ShoppingCart, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getEnquiryWhatsAppUrl } from "@/components/FloatingWhatsApp";

export default function CartPage() {
  const { api } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const fetchCart = () => {
    api.get("/cart")
      .then(res => setItems(res.data.items || []))
      .catch(() => toast.error("Failed to load cart"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCart(); }, [api]);

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setItems(items.filter(i => i.item_id !== itemId));
      toast.success("Item removed");
    } catch { toast.error("Failed to remove item"); }
  };

  const submitEnquiry = async () => {
    setSubmitting(true);
    try {
      const itemCount = items.length;
      const res = await api.post("/enquiries", { notes });
      toast.success(res.data.message);
      setSubmitted({ enquiryId: res.data.enquiry_id, itemCount });
      setItems([]);
      setNotes("");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit enquiry");
    } finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#359E58] border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div data-testid="cart-page" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">Your Selection</p>
          <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">Enquiry Cart</h1>
          <p className="text-[#4B5563] font-body">{items.length} {items.length === 1 ? "item" : "items"} in your cart</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            {submitted ? (
              <>
                <div className="w-16 h-16 bg-[#359E58]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-[#359E58]" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-2xl font-medium text-[#0A0A0A] mb-2">Enquiry Submitted!</h3>
                <p className="text-[#4B5563] mb-2 font-body">Reference: <span className="font-medium text-[#0A0A0A]">{submitted.enquiryId}</span></p>
                <p className="text-[#4B5563] mb-6 font-body text-sm">We will review your enquiry and get back to you shortly.</p>
                <a
                  href={getEnquiryWhatsAppUrl(submitted.enquiryId, submitted.itemCount)}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20BD5A] text-white px-8 py-4 text-sm font-medium transition-colors rounded-sm mb-4"
                  data-testid="cart-whatsapp-confirm"
                >
                  <MessageCircle className="w-5 h-5" strokeWidth={1.5} />Confirm via WhatsApp for Faster Response
                </a>
                <div className="mt-4">
                  <Link to="/catalogue">
                    <Button variant="outline" className="border-[#359E58] text-[#359E58] rounded-sm px-8">Continue Shopping</Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" strokeWidth={1} />
                <p className="text-[#4B5563] mb-6 font-body">Your cart is empty</p>
                <Link to="/catalogue">
                  <Button className="bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-8">Browse Catalogue</Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div key={item.item_id} className="flex gap-4 p-4 border border-[#E5E7EB] bg-white" data-testid={`cart-item-${item.item_id}`}>
                  <div className="w-20 h-20 shrink-0 bg-[#FAFAFA] overflow-hidden">
                    <img src={item.image} alt={item.product_id} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-[#0A0A0A] font-body">{item.product_id}</p>
                        <p className="text-xs text-[#4B5563] font-body">{item.category}</p>
                      </div>
                      <button onClick={() => removeItem(item.item_id)} className="text-red-400 hover:text-red-600 p-1" data-testid={`cart-remove-${item.item_id}`}>
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(item.customizations || {}).filter(([,v]) => v).map(([k, v]) => (
                        <span key={k} className="text-xs bg-[#FAFAFA] border border-[#E5E7EB] px-2 py-0.5 text-[#4B5563] font-body">
                          {k.replace(/_/g, " ")}: {v}
                        </span>
                      ))}
                    </div>
                    {item.notes && <p className="text-xs text-[#4B5563] mt-1 font-body">Note: {item.notes}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E5E7EB] pt-6">
              <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-2 block font-body">Additional Notes for Enquiry</label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                className="rounded-sm border-[#E5E7EB] mb-4" placeholder="Any additional notes for this enquiry..." data-testid="cart-notes" />
              <Button onClick={submitEnquiry} disabled={submitting}
                className="w-full sm:w-auto bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm px-10 py-6 gap-2"
                data-testid="cart-submit-enquiry">
                <Send className="w-4 h-4" strokeWidth={1.5} />{submitting ? "Submitting..." : "Submit Enquiry"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
