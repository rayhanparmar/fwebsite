import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Plus, Trash2, Users, Package, MessageSquare, Palette, BarChart3, FileUp, Image } from "lucide-react";

const CATEGORIES = ["Bali","Bangle","Kada","Bracelet","Chains","Cufflinks","Earrings","Hath Pan","Maang Tikka","Mangal Sutra","Necklace","Nose Pin","Pendant","Rings","Tops","Watchbelts"];

export default function AdminDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [customisations, setCustomisations] = useState([]);
  const [retailerFilter, setRetailerFilter] = useState("all");
  const [productCategory, setProductCategory] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const loadStats = useCallback(() => { api.get("/admin/stats").then(r => setStats(r.data)).catch(() => {}); }, [api]);
  const loadRetailers = useCallback(() => {
    const q = retailerFilter === "all" ? "" : `?status=${retailerFilter}`;
    api.get(`/admin/retailers${q}`).then(r => setRetailers(r.data.retailers)).catch(() => {});
  }, [api, retailerFilter]);
  const loadProducts = useCallback(() => {
    const q = productCategory ? `?category=${encodeURIComponent(productCategory)}&page=${productPage}&limit=30` : `?page=${productPage}&limit=30`;
    api.get(`/admin/products${q}`).then(r => { setProducts(r.data.products); setProductTotal(r.data.total); setProductsLoaded(true); }).catch(() => {});
  }, [api, productCategory, productPage]);
  const loadEnquiries = useCallback(() => { api.get("/admin/enquiries").then(r => setEnquiries(r.data.enquiries)).catch(() => {}); }, [api]);
  const loadCustomisations = useCallback(() => { api.get("/admin/customisations").then(r => setCustomisations(r.data.customisations)).catch(() => {}); }, [api]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { if (retailers.length > 0 || retailerFilter !== "all") loadRetailers(); }, [retailerFilter]);
  // Auto-load products when category or page changes
  useEffect(() => { if (productsLoaded) loadProducts(); }, [productCategory, productPage]);

  const approveRetailer = async (id) => {
    try { await api.put(`/admin/retailers/${id}/approve`); toast.success("Retailer approved"); loadRetailers(); loadStats(); }
    catch { toast.error("Failed to approve"); }
  };
  const rejectRetailer = async (id) => {
    try { await api.put(`/admin/retailers/${id}/reject`); toast.success("Retailer rejected"); loadRetailers(); loadStats(); }
    catch { toast.error("Failed to reject"); }
  };
  const deleteProduct = async (pid) => {
    if (!window.confirm(`Delete product ${pid} and all its images?`)) return;
    try { await api.delete(`/admin/products/${pid}`); toast.success("Product deleted"); loadProducts(); loadStats(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { toast.error("File must be under 25MB"); return; }
      setSelectedFile(file);
    }
  };

  const uploadProduct = async (e) => {
    e.preventDefault();
    if (!newProductId.trim()) { toast.error("Product ID is required"); return; }
    if (!newProductCategory) { toast.error("Please select a category"); return; }
    if (!selectedFile) { toast.error("Please select an image file"); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("product_id", newProductId.trim());
      formData.append("category", newProductCategory);
      formData.append("file", selectedFile);
      const res = await api.post("/admin/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(res.data.message);
      setSelectedFile(null);
      // Don't clear product_id and category so user can upload more images to same product
      loadProducts();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Upload failed");
    } finally { setUploading(false); }
  };

  const resetForm = () => {
    setNewProductId("");
    setNewProductCategory("");
    setSelectedFile(null);
    setShowAddProduct(false);
  };

  return (
    <div data-testid="admin-dashboard" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-medium text-[#0A0A0A] mb-2">Admin Panel</h1>
          <p className="text-[#4B5563] font-body">Manage your B2B jewellery platform</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-[#FAFAFA] border border-[#E5E7EB] p-1 h-auto flex overflow-x-auto w-full justify-start gap-1 no-scrollbar">
            <TabsTrigger value="overview" onClick={loadStats} className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0" data-testid="admin-overview-tab">
              <BarChart3 className="w-4 h-4" />Overview
            </TabsTrigger>
            <TabsTrigger value="retailers" onClick={loadRetailers} className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0" data-testid="admin-retailers-tab">
              <Users className="w-4 h-4" />Retailers
            </TabsTrigger>
            <TabsTrigger value="products" onClick={loadProducts} className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0" data-testid="admin-products-tab">
              <Package className="w-4 h-4" />Products
            </TabsTrigger>
            <TabsTrigger value="enquiries" onClick={loadEnquiries} className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0" data-testid="admin-enquiries-tab">
              <MessageSquare className="w-4 h-4" />Enquiries
            </TabsTrigger>
            <TabsTrigger value="customisations" onClick={loadCustomisations} className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0" data-testid="admin-customisations-tab">
              <Palette className="w-4 h-4" />Customisations
            </TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Total Products", value: stats.total_products, color: "bg-[#359E58]" },
                  { label: "Total Retailers", value: stats.total_retailers, color: "bg-[#4AB868]" },
                  { label: "Pending Approvals", value: stats.pending_approvals, color: "bg-yellow-500" },
                  { label: "Total Enquiries", value: stats.total_enquiries, color: "bg-[#6CC284]" },
                  { label: "Customisations", value: stats.total_customisations, color: "bg-[#359E58]" },
                ].map((s, i) => (
                  <div key={i} className="bg-white border border-[#E5E7EB] p-6" data-testid={`admin-stat-${i}`}>
                    <div className={`w-2 h-2 rounded-full ${s.color} mb-3`} />
                    <p className="text-2xl font-heading font-semibold text-[#0A0A0A]">{s.value}</p>
                    <p className="text-xs text-[#4B5563] font-body mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Retailers */}
          <TabsContent value="retailers">
            <div className="flex gap-2 mb-4 flex-wrap">
              {["all","pending","approved"].map(f => (
                <Button key={f} variant={retailerFilter === f ? "default" : "outline"} size="sm"
                  onClick={() => setRetailerFilter(f)}
                  className={retailerFilter === f ? "bg-[#359E58] text-white" : "border-[#E5E7EB]"}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            <div className="space-y-3">
              {retailers.map(r => (
                <div key={r._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#E5E7EB] bg-white gap-3" data-testid={`retailer-${r._id}`}>
                  <div>
                    <p className="font-medium text-[#0A0A0A] font-body">{r.name}</p>
                    <p className="text-xs text-[#4B5563] font-body">{r.email} | {r.phone} | {r.business_name}</p>
                    <p className="text-xs text-[#4B5563] font-body">GST: {r.gst_number} | {r.location}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!r.approved ? (
                      <>
                        <Button size="sm" onClick={() => approveRetailer(r._id)} className="bg-[#359E58] hover:bg-[#2e884c] text-white gap-1" data-testid={`admin-approve-${r._id}`}>
                          <Check className="w-3 h-3" />Approve
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectRetailer(r._id)} className="border-red-300 text-red-500 gap-1" data-testid={`admin-reject-${r._id}`}>
                          <X className="w-3 h-3" />Reject
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs bg-[#359E58]/10 text-[#359E58] px-3 py-1 font-body font-medium">Approved</span>
                    )}
                  </div>
                </div>
              ))}
              {retailers.length === 0 && <p className="text-[#4B5563] text-sm py-8 text-center font-body">No retailers found</p>}
            </div>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products">
            <div className="flex flex-wrap gap-3 mb-4 items-center">
              <Select value={productCategory || "all"} onValueChange={v => { setProductCategory(v === "all" ? "" : v); setProductPage(1); }}>
                <SelectTrigger className="w-48 rounded-sm border-[#E5E7EB]" data-testid="admin-product-category-filter">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={() => setShowAddProduct(!showAddProduct)} className="bg-[#359E58] hover:bg-[#2e884c] text-white gap-1" data-testid="admin-add-product-btn">
                <Plus className="w-4 h-4" />Add Product
              </Button>
              <span className="text-sm text-[#4B5563] font-body ml-auto">{productTotal} products{productCategory ? ` in ${productCategory}` : ""}</span>
            </div>

            {/* Add Product Form with File Upload */}
            {showAddProduct && (
              <form onSubmit={uploadProduct} className="border border-[#6CC284]/30 bg-[#359E58]/5 p-6 mb-6 space-y-4" data-testid="admin-add-product-form">
                <h3 className="font-heading text-lg font-medium text-[#0A0A0A] mb-2">Add Product / Upload Image</h3>
                <p className="text-xs text-[#4B5563] font-body mb-4">
                  Enter a product ID and upload an image. If the product ID already exists, the image will be added to that product.
                  You can upload multiple images to the same product by keeping the same ID.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Product ID</Label>
                    <Input value={newProductId} onChange={e => setNewProductId(e.target.value)}
                      className="mt-1 rounded-sm" placeholder="e.g. RN-999001" required data-testid="admin-new-product-id" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Category</Label>
                    <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                      <SelectTrigger className="mt-1 rounded-sm" data-testid="admin-new-product-category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Product Image</Label>
                  {!selectedFile ? (
                    <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] hover:border-[#4AB868] transition-colors cursor-pointer p-6 bg-white" data-testid="admin-product-file-upload">
                      <FileUp className="w-6 h-6 text-[#4B5563] mb-2" strokeWidth={1.5} />
                      <p className="text-sm text-[#4B5563] font-body">{uploading ? "Uploading..." : "Click to select image"}</p>
                      <p className="text-xs text-gray-400 font-body mt-1">JPG, PNG, WebP (max 25MB)</p>
                      <input type="file" className="hidden" onChange={handleFileSelect} disabled={uploading}
                        accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff" data-testid="admin-product-file-input" />
                    </label>
                  ) : (
                    <div className="mt-1 flex items-center gap-3 border border-[#6CC284]/30 bg-white p-3">
                      <Image className="w-6 h-6 text-[#359E58] shrink-0" strokeWidth={1.5} />
                      <span className="text-sm text-[#0A0A0A] font-body flex-1 truncate">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-[#4B5563] hover:text-red-500 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button type="submit" disabled={uploading} className="bg-[#359E58] hover:bg-[#2e884c] text-white gap-1" data-testid="admin-save-product">
                    <FileUp className="w-4 h-4" />{uploading ? "Uploading..." : "Upload & Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>Close</Button>
                </div>
              </form>
            )}

            {/* Product List */}
            <div className="space-y-2">
              {products.map(p => (
                <div key={p.product_id} className="flex items-center gap-4 p-3 border border-[#E5E7EB] bg-white" data-testid={`admin-product-${p.product_id}`}>
                  <div className="flex gap-1 shrink-0">
                    {(p.images || []).slice(0, 3).map((img, i) => (
                      <div key={i} className="w-12 h-12 bg-[#FAFAFA] overflow-hidden border border-[#E5E7EB]">
                        <img src={img.startsWith("/api/") ? `${process.env.REACT_APP_BACKEND_URL}${img}` : img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {(p.images || []).length > 3 && (
                      <div className="w-12 h-12 bg-[#FAFAFA] border border-[#E5E7EB] flex items-center justify-center">
                        <span className="text-xs text-[#4B5563] font-body">+{p.images.length - 3}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#0A0A0A] font-body">{p.product_id}</p>
                    <p className="text-xs text-[#4B5563] font-body">{p.category} &middot; {(p.images || []).length} image{(p.images || []).length !== 1 ? "s" : ""}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteProduct(p.product_id)} className="text-red-400 hover:text-red-600 shrink-0" data-testid={`admin-delete-${p.product_id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {products.length === 0 && productsLoaded && (
                <p className="text-[#4B5563] text-sm py-8 text-center font-body">
                  {productCategory ? `No products found in ${productCategory}` : "No products found"}
                </p>
              )}
            </div>

            {productTotal > 30 && (
              <div className="flex gap-2 mt-4 justify-center">
                <Button variant="outline" size="sm" disabled={productPage <= 1} onClick={() => setProductPage(p => p - 1)}>Previous</Button>
                <span className="text-sm text-[#4B5563] self-center font-body">Page {productPage} of {Math.ceil(productTotal / 30)}</span>
                <Button variant="outline" size="sm" disabled={productPage * 30 >= productTotal} onClick={() => setProductPage(p => p + 1)}>Next</Button>
              </div>
            )}
          </TabsContent>

          {/* Enquiries */}
          <TabsContent value="enquiries">
            <div className="space-y-4">
              {enquiries.map(enq => (
                <div key={enq.enquiry_id} className="border border-[#E5E7EB] bg-white p-4 sm:p-5" data-testid={`enquiry-${enq.enquiry_id}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2">
                    <div>
                      <p className="font-medium text-[#0A0A0A] font-body">{enq.enquiry_id}</p>
                      <p className="text-xs text-[#4B5563] font-body">{enq.user_name} | {enq.user_email} | {enq.user_phone}</p>
                    </div>
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 font-body shrink-0">{enq.status}</span>
                  </div>
                  <div className="space-y-2">
                    {enq.items?.map((item, i) => (
                      <div key={i} className="flex gap-3 p-2 bg-[#FAFAFA] text-sm">
                        <img src={item.image} alt="" className="w-10 h-10 object-cover shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium font-body truncate">{item.product_id} - {item.category}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.customizations || {}).filter(([,v]) => v).map(([k,v]) => (
                              <span key={k} className="text-xs text-[#4B5563] font-body">{k.replace(/_/g," ")}: {v}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {enq.notes && <p className="text-xs text-[#4B5563] mt-2 font-body">Notes: {enq.notes}</p>}
                  <p className="text-xs text-gray-400 mt-2 font-body">{new Date(enq.created_at).toLocaleString()}</p>
                </div>
              ))}
              {enquiries.length === 0 && <p className="text-[#4B5563] text-sm py-8 text-center font-body">No enquiries yet</p>}
            </div>
          </TabsContent>

          {/* Customisations */}
          <TabsContent value="customisations">
            <div className="space-y-4">
              {customisations.map(c => (
                <div key={c.custom_id} className="border border-[#E5E7EB] bg-white p-4 sm:p-5" data-testid={`custom-${c.custom_id}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                      <p className="font-medium text-[#0A0A0A] font-body">{c.custom_id}</p>
                      <p className="text-xs text-[#4B5563] font-body">{c.user_name} | {c.user_email}</p>
                    </div>
                    <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 font-body shrink-0">{c.status}</span>
                  </div>
                  {c.product_id && <p className="text-sm text-[#4B5563] font-body">Product: {c.product_id}</p>}
                  {c.file_name && <p className="text-sm text-[#359E58] font-body">Attached File: {c.file_name}</p>}
                  <p className="text-sm text-[#4B5563] font-body">Metal: {c.metal_type}</p>
                  <p className="text-sm text-[#4B5563] font-body">Stone: {c.stone_changes}</p>
                  <p className="text-sm text-[#4B5563] font-body">Size: {c.size_changes}</p>
                  {c.special_notes && <p className="text-sm text-[#4B5563] font-body">Notes: {c.special_notes}</p>}
                  <p className="text-xs text-gray-400 mt-2 font-body">{new Date(c.created_at).toLocaleString()}</p>
                </div>
              ))}
              {customisations.length === 0 && <p className="text-[#4B5563] text-sm py-8 text-center font-body">No customisation requests yet</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
