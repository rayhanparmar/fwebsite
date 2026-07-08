import { FaWhatsapp } from "react-icons/fa";

const WA_NUMBER = "917045927391";

export function getWhatsAppUrl(message = "") {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WA_NUMBER}?text=${encoded}`;
}

export function getEnquiryWhatsAppUrl(enquiryId, itemCount) {
  return getWhatsAppUrl(
    `Hi, I just submitted enquiry ${enquiryId} with ${itemCount} item(s) on Shree Mother Gold B2B platform. Please confirm and share pricing details.`
  );
}

export function getProductWhatsAppUrl(productId, category) {
  return getWhatsAppUrl(
    `Hi, I'm interested in product ${productId} (${category}) from your B2B catalogue. Could you share more details and pricing?`
  );
}

export default function FloatingWhatsApp() {
  return (
    <a
      href={getWhatsAppUrl("Hi, I'm interested in your B2B jewellery manufacturing services. Please share more details.")}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="floating-whatsapp"
      className="fixed bottom-20 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20BD5A] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8 text-white" />
      <span className="absolute right-full mr-3 bg-white text-[#0A0A0A] text-xs font-medium px-3 py-2 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none font-body hidden sm:block">
        Chat with us
      </span>
    </a>
  );
}
