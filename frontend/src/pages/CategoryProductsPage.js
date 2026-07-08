import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Star, ArrowLeft } from "lucide-react";

const CATEGORIES = [
  { name: "Bali", slug: "bali" }, { name: "Bangle", slug: "bangle" }, { name: "Kada", slug: "kada" },
  { name: "Bracelet", slug: "bracelet" }, { name: "Chains", slug: "chains" }, { name: "Cufflinks", slug: "cufflinks" },
  { name: "Earrings", slug: "earrings" }, { name: "Hath Pan", slug: "hath-pan" }, { name: "Maang Tikka", slug: "maang-tikka" },
  { name: "Mangal Sutra", slug: "mangal-sutra" }, { name: "Necklace", slug: "necklace" }, { name: "Nose Pin", slug: "nose-pin" },
  { name: "Pendant", slug: "pendant" }, { name: "Rings", slug: "rings" }, { name: "Tops", slug: "tops" }, { name: "Watchbelts", slug: "watchbelts" },
];

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const category = CATEGORIES.find(c => c.slug === slug);

  useEffect(() => {
    if (!category) return;
    api.get(`/products?category=${encodeURIComponent(category.name)}&limit=30`)
      .then(res => setProducts(res.data.products))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [slug, category, api]);

  if (!category) {
    return <div className="min-h-[60vh] flex items-center justify-center"><p>Category not found</p></div>;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#359E58] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="category-products-page" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <Link to="/catalogue" className="inline-flex items-center gap-2 text-sm text-[#4B5563] hover:text-[#359E58] mb-8 font-body" data-testid="back-to-catalogue">
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />Back to Catalogue
        </Link>

        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] mb-2">{category.name}</h1>
          {/* <p className="text-[#4B5563] font-body">{products.length} products available</p> */}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {products.map((product) => (
            <div key={product.product_id}
              onClick={() => navigate(`/product/${product.product_id}`)}
              className="group product-card cursor-pointer" data-testid={`product-card-${product.product_id}`}
              role="link" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/product/${product.product_id}`); }}>
              <div className="bg-white border border-transparent hover:border-[#6CC284]/30 transition-all duration-300 overflow-hidden">
                <div className="aspect-square overflow-hidden bg-[#FAFAFA]">
                  <img src={product.images?.[0]?.startsWith("/api/") ? `${process.env.REACT_APP_BACKEND_URL}${product.images[0]}` : product.images?.[0]}
                    alt={product.product_id}
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-3 text-center">
                  <p className="text-xs sm:text-sm font-medium text-[#0A0A0A] font-body">{product.product_id}</p>
                  
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
