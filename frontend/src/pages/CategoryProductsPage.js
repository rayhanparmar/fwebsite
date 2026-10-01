import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Star, ArrowLeft, Search, X } from "lucide-react";

const CATEGORIES = [
  { name: "Bali", slug: "bali" },
  { name: "Bangle/Kada", slug: "bangle-kada" },
  { name: "Bracelet", slug: "bracelet" },
  { name: "Chain + Multilayer", slug: "chain-multilayer" },
  { name: "Cufflink", slug: "cufflink" },
  { name: "Brooch", slug: "brooch" },
  { name: "Earring", slug: "earring" },
  { name: "Haathpaan", slug: "haathpaan" },
  { name: "Maang Tikka", slug: "maang-tikka" },
  { name: "Mangal Sutra", slug: "mangal-sutra" },
  { name: "Necklace", slug: "necklace" },
  { name: "Nose Pin", slug: "nose-pin" },
  { name: "Pendant + Dancing Stone", slug: "pendant-dancing-stone" },
  { name: "Ring + Titanium Ring", slug: "ring-titanium-ring" },
  { name: "Tops", slug: "tops" },
  { name: "Watch Belt", slug: "watch-belt" },
  { name: "Full Set", slug: "full-set" },
];

export default function CategoryProductsPage() {
  const { slug } = useParams();
  const { api, user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const category = CATEGORIES.find(c => c.slug === slug);

  useEffect(() => {
    if (!category) return;
    api.get(`/products?category=${encodeURIComponent(category.name)}&limit=0`)
      .then(res => setProducts(res.data.products))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [slug, category, api]);

  useEffect(() => {
    setSearch("");
  }, [slug]);

  const query = search.trim().toLowerCase();
  const visibleProducts = isAdmin && query
    ? products.filter((p) => (p.product_id || "").toLowerCase().includes(query))
    : products;

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

        {isAdmin && (
          <div className="mb-10">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product ID"
                className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] focus:border-[#359E58] focus:outline-none text-sm font-body bg-white"
                data-testid="admin-category-search"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0A0A0A]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
            {query && (
              <p className="text-xs text-[#4B5563] font-body mt-2">
                {visibleProducts.length === 0
                  ? `No products match "${search.trim()}"`
                  : `${visibleProducts.length} of ${products.length} products`}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
          {visibleProducts.map((product) => (
            <div key={product.product_id}
              onClick={() => navigate(`/product/${product.product_id}`)}
              className="group product-card cursor-pointer" data-testid={`product-card-${product.product_id}`}
              role="link" tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/product/${product.product_id}`); }}>
              <div className="bg-white border border-transparent hover:border-[#6CC284]/30 transition-all duration-300 overflow-hidden">
                <div className="aspect-square overflow-hidden bg-[#FAFAFA]">
                  <img loading="lazy" decoding="async" src={(() => {
                    const imgs = product.images || [];
                    const i = imgs.findIndex(
                      (u) => u && !/\.(mp4|mov|webm|m4v)$/i.test(u)
                    );
                    if (i === -1) return "";
                    const t = (product.thumbnails || [])[i];
                    if (t) return t;
                    const img = imgs[i];
                    return img.startsWith("/api/")
                      ? `${process.env.REACT_APP_BACKEND_URL}${img}`
                      : img;
                  })()}
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
