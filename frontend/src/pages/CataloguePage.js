import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function CataloguePage() {
  const { api } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories")
      .then(res => setCategories(res.data.categories))
      .catch(() => toast.error("Failed to load categories"))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#359E58] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div data-testid="catalogue-page" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">Our Collection</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] mb-3">Product Catalogue</h1>
          <p className="text-[#4B5563] font-body">Browse our premium jewellery categories</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/catalogue/${cat.slug}`}
              className="group product-card" data-testid={`category-card-${cat.slug}`}>
              <div className="bg-[#FAFAFA] border border-transparent hover:border-[#6CC284]/30 transition-all duration-300 overflow-hidden">
                <div className="aspect-square overflow-hidden bg-white">
                  <img src={cat.image} alt={cat.name}
                    className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-heading text-lg font-medium text-[#0A0A0A] group-hover:text-[#359E58] transition-colors">
                    {cat.name}
                  </h3>
                  {/* <p className="text-xs text-[#4B5563] mt-1 font-body">{cat.product_count} Products</p> */}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
