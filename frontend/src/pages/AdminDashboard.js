import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Plus, Trash2, Users, Package, MessageSquare, Palette, BarChart3, FileUp, Image } from "lucide-react";


const CATEGORIES = [
  "Bali",
  "Bangle/Kada",
  "Bracelet",
  "Chain + Multilayer",
  "Cufflink",
  "Brooch",
  "Earring",
  "Haathpaan",
  "Maang Tikka",
  "Mangal Sutra",
  "Necklace",
  "Nose Pin",
  "Pendant + Dancing Stone",
  "Ring + Titanium Ring",
  "Tops",
  "Watch Belt",
  "Full Set"
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [customisations, setCustomisations] = useState([]);
  const [whatsappOrders, setWhatsappOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

const [filteredOrders, setFilteredOrders] = useState([]);
const [statusFilter, setStatusFilter] = useState("All");
const [showExcelMenu, setShowExcelMenu] = useState(false);
const [selectedExcelDate, setSelectedExcelDate] = useState("");
const [downloadByDate, setDownloadByDate] = useState(false);
const [showDateDialog, setShowDateDialog] = useState(false);
const [dateSelectionMode, setDateSelectionMode] = useState("single");
const [singleOrderDate, setSingleOrderDate] = useState("");
const [fromOrderDate, setFromOrderDate] = useState("");
const [toOrderDate, setToOrderDate] = useState("");
const [customerExcelName, setCustomerExcelName] = useState("");
const [showCustomerDialog, setShowCustomerDialog] = useState(false);
const [customerDateMode, setCustomerDateMode] = useState(false);
const [showDateCustomerDialog, setShowDateCustomerDialog] = useState(false);
const [selectedDateCustomers, setSelectedDateCustomers] = useState([]);
const [dateCustomerSelectionMode, setDateCustomerSelectionMode] = useState("single");
const [dateCustomerSingleDate, setDateCustomerSingleDate] = useState("");
const [dateCustomerFromDate, setDateCustomerFromDate] = useState("");
const [dateCustomerToDate, setDateCustomerToDate] = useState("");
  const [retailerFilter, setRetailerFilter] = useState("all");
  const [productCategory, setProductCategory] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [productTotal, setProductTotal] = useState(0);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProductId, setNewProductId] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categoryImages, setCategoryImages] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    api.get("/admin/category-images")
      .then((res) => {
        setCategoryImages(res.data.category_images || {});
      })
      .catch((err) => {
        console.error("Failed to load category images:", err);
      });
  }, [api]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");


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
  const loadWhatsappOrders = useCallback(() => {
    api
      .get("/admin/whatsapp-orders")
      .then((r) => setWhatsappOrders(r.data.orders))
      .catch(() => {
        toast.error("Failed to load WhatsApp orders");
      });
  }, [api]);


  useEffect(() => {

    let filtered = whatsappOrders;

    // Search Filter
    if (searchTerm.trim()) {

        const search = searchTerm.toLowerCase();

        filtered = filtered.filter((order) =>

            order.orderId?.toLowerCase().includes(search) ||

            order.customer_name?.toLowerCase().includes(search) ||

            order.product_category?.toLowerCase().includes(search) ||

            order.status?.toLowerCase().includes(search)

        );

    }

    // Status Filter
    if (statusFilter !== "All") {

        filtered = filtered.filter(
            (order) => order.status === statusFilter
        );

    }

    setFilteredOrders(filtered);


    const uniqueCustomers = [
      ...new Set(
        whatsappOrders
          .map((order) => order.customer_name)
          .filter(Boolean)
      ),
    ];
    
    setCustomers(uniqueCustomers);

}, [searchTerm, statusFilter, whatsappOrders, api]);

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

  const deleteWhatsappOrder = async (orderId) => {

    const confirmDelete = window.confirm(
        "Are you sure you want to permanently delete this order?\n\nThis will delete:\n\n• MongoDB record\n• Cloudinary images\n• Cloudinary videos\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {

        await api.delete(`/admin/whatsapp-orders/${orderId}`);

        toast.success("Order deleted successfully");

        loadWhatsappOrders();
        loadStats();

    } catch (err) {

        toast.error(
            err.response?.data?.detail || "Failed to delete order"
        );

    }

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

  const saveProductId = async () => {
    if (!selectedProduct) return;
  
    const newId = editingProductId.trim();
  
    if (!newId) {
      toast.error("Product ID cannot be empty");
      return;
    }
  
    if (newId === selectedProduct.product_id) {
      toast.info("Product ID is already the same");
      return;
    }
  
    try {
      await api.put(`/admin/products/${selectedProduct.product_id}`, {
        product_id: newId,
      });
  
      toast.success("Product ID updated successfully");
  
      setSelectedProduct({
        ...selectedProduct,
        product_id: newId,
      });
  
      setEditingProductId(newId);
  
      loadProducts();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to update Product ID"
      );
    }
  };


  const setFrontImage = async (productId, imageUrl) => {
    try {
      const formData = new FormData();
      formData.append("image_url", imageUrl);

      const res = await api.put(
        `/admin/products/${productId}/front-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success(res.data.message || "Front image updated");

      loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || "Failed to update front image"
      );
    }
  };

  const deleteProductImage = async (productId, imageUrl) => {
    if (!window.confirm("Are you sure you want to delete this image?")) {
      return;
    }
  
    try {
      const res = await api.delete(
        `/admin/products/${productId}/image`,
        {
          params: {
            image_url: imageUrl,
          },
        }
      );
  
      toast.success(
        res.data.message || "Image deleted successfully"
      );
  
      // Remove the deleted image from the currently opened product
      setSelectedProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }
  
        return {
          ...currentProduct,
          images: (currentProduct.images || []).filter(
            (img) => img !== imageUrl
          ),
        };
      });
  
      // Refresh the product list in the background
      await loadProducts();
  
    } catch (err) {
      console.error("Delete image error:", err);
  
      toast.error(
        err.response?.data?.detail ||
        "Failed to delete image"
      );
    }
  };

  const uploadProductImage = async () => {
    if (!selectedProduct || !selectedFile) {
      toast.error("Please select an image");
      return;
    }
  
    try {
      const formData = new FormData();
  
      formData.append("product_id", selectedProduct.product_id);
      formData.append("category", selectedProduct.category);
      formData.append("file", selectedFile);
  
      const res = await api.post(
        "/admin/products/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      toast.success(res.data.message || "Image uploaded successfully");
  
      setSelectedFile(null);
  
      // Reload the products from the backend
      await loadProducts();
  
    } catch (err) {
      console.error(err);
  
      toast.error(
        err.response?.data?.detail || "Failed to upload image"
      );
    }
  };

  const replaceProductImage = async (oldImageUrl, file) => {
    if (!selectedProduct || !file) return;
  
    try {
      const formData = new FormData();
  
      formData.append("old_image_url", oldImageUrl);
      formData.append("category", selectedProduct.category);
      formData.append("file", file);
  
      const res = await api.put(
        `/admin/products/${selectedProduct.product_id}/replace-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      toast.success(
        res.data.message || "Image replaced successfully"
      );
  
      // Update the currently opened product immediately
      setSelectedProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }
  
        return {
          ...currentProduct,
          images: res.data.images || currentProduct.images,
        };
      });
  
      // Refresh product list in the background
      await loadProducts();
  
    } catch (err) {
      console.error("Replace image error:", err);
  
      toast.error(
        err.response?.data?.detail ||
        "Failed to replace image"
      );
    }
  };

  const resetForm = () => {
    setNewProductId("");
    setNewProductCategory("");
    setSelectedFile(null);
    setShowAddProduct(false);
  };


  const downloadCustomerDateOrders = async () => {
    if (selectedDateCustomers.length === 0) {
        toast.error("Please select at least one customer");
        return;
    }

    if (dateSelectionMode === "single" && !singleOrderDate) {
        toast.error("Please select a date");
        return;
    }

    if (
        dateSelectionMode === "range" &&
        (!fromOrderDate || !toOrderDate)
    ) {
        toast.error("Please select both From and To dates");
        return;
    }

    if (
        dateSelectionMode === "range" &&
        fromOrderDate > toOrderDate
    ) {
        toast.error("From date cannot be after To date");
        return;
    }

    try {
        const params = new URLSearchParams();

        selectedDateCustomers.forEach((customer) => {
            params.append("customer_names", customer);
        });

        if (dateSelectionMode === "single") {
            params.append("order_date", singleOrderDate);
        } else {
            params.append("from_date", fromOrderDate);
            params.append("to_date", toOrderDate);
        }

        const response = await api.get(
            `/admin/whatsapp-orders/excel/customers-date?${params.toString()}`,
            {
                responseType: "blob",
            }
        );

        const url = window.URL.createObjectURL(
            new Blob([response.data])
        );

        const link = document.createElement("a");

        link.href = url;

        link.download =
            dateSelectionMode === "single"
                ? `Orders_${singleOrderDate}.xlsx`
                : `Orders_${fromOrderDate}_to_${toOrderDate}.xlsx`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        window.URL.revokeObjectURL(url);

        setShowDateCustomerDialog(false);

        setSelectedDateCustomers([]);
        setDateSelectionMode("single");
        setSingleOrderDate("");
        setFromOrderDate("");
        setToOrderDate("");

        toast.success("Excel downloaded successfully");

    } catch (err) {
        console.error(err);

        toast.error(
            err.response?.data?.detail ||
            "No matching orders found."
        );
    }
};

  const downloadOrdersByDate = async () => {
    if (dateSelectionMode === "single") {
        if (!singleOrderDate) {
            toast.error("Please select a date");
            return;
        }

        try {
            const response = await api.get(
                `/admin/whatsapp-orders/excel/date/${singleOrderDate}`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");
            link.href = url;
            link.download = `Orders_${singleOrderDate}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.URL.revokeObjectURL(url);

            setShowDateDialog(false);
            setSingleOrderDate("");

            toast.success("Excel downloaded successfully");
        } catch (err) {
            console.error(err);
            toast.error("Unable to download orders for this date.");
        }

        return;
    }

    // From & To date
    if (!fromOrderDate || !toOrderDate) {
        toast.error("Please select both From and To dates");
        return;
    }

    if (fromOrderDate > toOrderDate) {
        toast.error("From date cannot be after To date");
        return;
    }

    try {
        const response = await api.get(
            `/admin/whatsapp-orders/excel/date-range?from_date=${fromOrderDate}&to_date=${toOrderDate}`,
            {
                responseType: "blob",
            }
        );

        const url = window.URL.createObjectURL(
            new Blob([response.data])
        );

        const link = document.createElement("a");
        link.href = url;
        link.download = `Orders_${fromOrderDate}_to_${toOrderDate}.xlsx`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        setShowDateDialog(false);
        setFromOrderDate("");
        setToOrderDate("");

        toast.success("Excel downloaded successfully");
    } catch (err) {
        console.error(err);
        toast.error("Unable to download orders for this date range.");
    }
};

  return (
    <>
  
      {showCustomerDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
  
            <h2 className="text-xl font-semibold mb-5">
              Download Orders by Customer
            </h2>
  
            <div className="space-y-4">
  
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name
                </label>
  
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">
                    Select Customer
                  </option>
  
                  {customers.map((customer, index) => (
                    <option key={index} value={customer}>
                      {customer}
                    </option>
                  ))}
                </select>
              </div>
  
              <div className="flex justify-end gap-3 pt-4">
  
                <button
                  onClick={() => {
                    setShowCustomerDialog(false);
                    setSelectedCustomer("");
                  }}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
  
                <button
                  onClick={async () => {
  
                    if (!selectedCustomer) {
                      toast.error("Please select a customer");
                      return;
                    }
  
                    // const downloadAll = window.confirm(
                    //   "Press OK to download ALL orders.\n\nPress Cancel to choose a specific date."
                    // );
  
                    // if (!downloadAll) {
  
                    //   setCustomerExcelName(selectedCustomer);
                    //   setCustomerDateMode(true);
                    //   setShowCustomerDialog(false);
  
                    //   setTimeout(() => {
                    //     document
                    //       .getElementById("excel-date-picker")
                    //       ?.showPicker();
                    //   }, 100);
  
                    //   return;
                    // }
  
                    try {
  
                      const response = await api.get(
                        `/admin/whatsapp-orders/excel/customer/${encodeURIComponent(
                          selectedCustomer
                        )}`,
                        {
                          responseType: "blob",
                        }
                      );
  
                      const url = window.URL.createObjectURL(
                        new Blob([response.data])
                      );
  
                      const link = document.createElement("a");
  
                      link.href = url;
                      link.download = `${selectedCustomer}_Orders.xlsx`;
  
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
  
                      window.URL.revokeObjectURL(url);
  
                      setShowCustomerDialog(false);
                      setSelectedCustomer("");
  
                      toast.success("Excel downloaded successfully");
  
                    } catch (err) {
  
                      console.error(err);
  
                      toast.error(
                        "No orders found for this customer."
                      );
                    }
  
                  }}
                  className="bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                  Continue
                </button>
  
              </div>
  
            </div>
  
          </div>
        </div>
      )}


{showDateDialog && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100]">
        <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">

            <h2 className="text-xl font-semibold mb-5">
                Download Orders by Date
            </h2>

            {/* Selection Type */}
            <div className="flex gap-3 mb-5">

                <button
                    onClick={() => setDateSelectionMode("single")}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                        dateSelectionMode === "single"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700"
                    }`}
                >
                    Particular Date
                </button>

                <button
                    onClick={() => setDateSelectionMode("range")}
                    className={`flex-1 px-4 py-2 rounded-lg border ${
                        dateSelectionMode === "range"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-gray-700"
                    }`}
                >
                    From & To Date
                </button>

            </div>

            {/* Particular Date */}
            {dateSelectionMode === "single" && (
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Select Date
                    </label>

                    <input
                        type="date"
                        value={singleOrderDate}
                        onChange={(e) =>
                            setSingleOrderDate(e.target.value)
                        }
                        className="w-full border rounded-lg px-3 py-2"
                    />
                </div>
            )}

            {/* Date Range */}
            {dateSelectionMode === "range" && (
                <div className="space-y-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            From Date
                        </label>

                        <input
                            type="date"
                            value={fromOrderDate}
                            onChange={(e) =>
                                setFromOrderDate(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            To Date
                        </label>

                        <input
                            type="date"
                            value={toOrderDate}
                            onChange={(e) =>
                                setToOrderDate(e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2"
                        />
                    </div>

                </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-6">

                <button
                    onClick={() => {
                        setShowDateDialog(false);
                        setSingleOrderDate("");
                        setFromOrderDate("");
                        setToOrderDate("");
                    }}
                    className="px-4 py-2 border rounded-lg"
                >
                    Cancel
                </button>

                <button
                    onClick={downloadOrdersByDate}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                    Continue
                </button>

            </div>

        </div>
    </div>
)}
  
      {showDateCustomerDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[420px] p-6">
    
                <h2 className="text-xl font-semibold mb-5">
                    Download Orders by Date & Customer
                </h2>
    
                <div className="space-y-4">
    
                <div>
    <label className="block text-sm font-medium mb-1">
        Customer Name
    </label>

    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
    {customers.length === 0 ? (
        <div className="text-sm text-gray-500">
            No customers found
        </div>
    ) : (
        customers.map((customer) => (
            <label
                key={customer}
                className="flex items-center gap-3 py-2 cursor-pointer"
            >
                <input
                    type="checkbox"
                    checked={selectedDateCustomers.includes(customer)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            setSelectedDateCustomers((prev) => [
                                ...prev,
                                customer,
                            ]);
                        } else {
                            setSelectedDateCustomers((prev) =>
                                prev.filter((name) => name !== customer)
                            );
                        }
                    }}
                    className="w-4 h-4"
                />

                <span className="text-sm">
                    {customer}
                </span>
            </label>
        ))
    )}
</div>

    <p className="text-xs text-gray-500 mt-1">
        Hold Command (⌘) and click to select multiple customers.
    </p>
</div>
    
<div>
    <label className="block text-sm font-medium mb-2">
        Order Date
    </label>

    <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2">
            <input
                type="radio"
                name="dateMode"
                value="single"
                checked={dateSelectionMode === "single"}
                onChange={() => setDateSelectionMode("single")}
            />
            Particular Date
        </label>

        <label className="flex items-center gap-2">
            <input
                type="radio"
                name="dateMode"
                value="range"
                checked={dateSelectionMode === "range"}
                onChange={() => setDateSelectionMode("range")}
            />
            From & To
        </label>
    </div>

    {dateSelectionMode === "single" ? (
        <input
            type="date"
            value={singleOrderDate}
            onChange={(e) => setSingleOrderDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
        />
    ) : (
        <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="block text-xs text-gray-500 mb-1">
                    From Date
                </label>

                <input
                    type="date"
                    value={fromOrderDate}
                    onChange={(e) => setFromOrderDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />
            </div>

            <div>
                <label className="block text-xs text-gray-500 mb-1">
                    To Date
                </label>

                <input
                    type="date"
                    value={toOrderDate}
                    onChange={(e) => setToOrderDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                />
            </div>
        </div>
    )}
</div>
    
                    <div className="flex justify-end gap-3 pt-4">
    
                        <button
                            onClick={() => {
                              setShowDateCustomerDialog(false);
                              setSelectedDateCustomers([]);
                              setDateSelectionMode("single");
                              setSingleOrderDate("");
                              setFromOrderDate("");
                              setToOrderDate("");
                            }}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>
    
                        <button
    onClick={downloadCustomerDateOrders}
    className="bg-green-600 text-white px-5 py-2 rounded-lg"
>
    Download
</button>
    
                    </div>
    
                </div>
    
            </div>
        </div>
        
    )}
    
    
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
            <TabsTrigger
    value="whatsapp"
    onClick={loadWhatsappOrders}
    className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0"
>
    <MessageSquare className="w-4 h-4" />
    WhatsApp Orders
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
                    <p className="text-xs text-[#4B5563] font-body">
  GST: {r.gst_number}
</p>

<p className="text-xs text-[#4B5563] font-body">
  {r.city}, {r.state}
</p>

<p className="text-xs text-[#4B5563] font-body">
  {r.business_address}
</p>

<p className="text-xs text-[#4B5563] font-body">
  Pincode: {r.pincode}
</p>
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
                <div
                key={p.product_id}
                onClick={() => {
                  setSelectedProduct(p);
                  setEditingProductId(p.product_id);
                }}
                className="flex items-center gap-4 p-3 border border-[#E5E7EB] bg-white cursor-pointer hover:border-[#359E58] transition-colors"
                data-testid={`admin-product-${p.product_id}`}
              >
                  <div className="flex gap-2 shrink-0">
  {(p.images || []).slice(0, 3).map((img, i) => (
    <div key={i} className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 bg-[#FAFAFA] overflow-hidden border border-[#E5E7EB]">
        <img
          src={img.startsWith("/api/") ? `${process.env.REACT_APP_BACKEND_URL}${img}` : img}
          alt=""
          className="w-full h-full object-cover"
        />

        {i === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-[#359E58] text-white text-[8px] text-center py-0.5">
            FRONT
          </div>
        )}
      </div>

      {i !== 0 && (
        <button
          type="button"
          onClick={() => setFrontImage(p.product_id, img)}
          className="text-[9px] text-[#359E58] hover:underline whitespace-nowrap"
        >
          Set as Front
        </button>
      )}
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
  <div
    key={enq.enquiry_id}
    onClick={() => setSelectedEnquiry(enq)}
    className="border border-[#E5E7EB] bg-white p-4 sm:p-5 cursor-pointer hover:border-[#359E58] hover:shadow-md transition-all"
    data-testid={`enquiry-${enq.enquiry_id}`}
  >
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

{/* Enquiry Details Popup */}
{selectedEnquiry && (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl">

      {/* Popup Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A]">
            Enquiry Details
          </h2>
          <p className="text-sm text-[#4B5563] mt-1">
            {selectedEnquiry.enquiry_id}
          </p>
        </div>

        <button
          onClick={() => setSelectedEnquiry(null)}
          className="text-2xl text-gray-500 hover:text-black"
        >
          ×
        </button>
      </div>

      {/* Customer Details */}
      <div className="p-6 border-b">
        <h3 className="text-base font-semibold mb-4">
          Customer Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Customer Name</p>
            <p className="text-sm font-medium mt-1">
              {selectedEnquiry.user_name || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium mt-1 break-all">
              {selectedEnquiry.user_email || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium mt-1">
              {selectedEnquiry.user_phone || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Enquiry Information */}
      <div className="p-6 border-b">
        <h3 className="text-base font-semibold mb-4">
          Enquiry Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500">Enquiry ID</p>
            <p className="text-sm font-medium mt-1">
              {selectedEnquiry.enquiry_id}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-medium mt-1 capitalize">
              {selectedEnquiry.status || "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Date</p>
            <p className="text-sm font-medium mt-1">
              {selectedEnquiry.created_at
                ? new Date(selectedEnquiry.created_at).toLocaleString()
                : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-6">
        <h3 className="text-base font-semibold mb-4">
          Products
        </h3>

        <div className="space-y-5">
          {selectedEnquiry.items?.map((item, index) => (
            <div
              key={index}
              className="border rounded-lg p-4"
            >
              <div className="flex gap-4">

                {/* Product Image */}
                <div className="w-24 h-24 shrink-0 border rounded-lg overflow-hidden bg-[#FAFAFA]">
                  {item.image && (
                    <img
                      src={
                        item.image.startsWith("/api/")
                          ? `${process.env.REACT_APP_BACKEND_URL}${item.image}`
                          : item.image
                      }
                      alt={item.product_id || "Product"}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Product Basic Details */}
                <div className="min-w-0">
                  <p className="text-base font-semibold">
                    {item.product_id || "-"}
                  </p>

                  <p className="text-sm text-[#4B5563] mt-1">
                    Category: {item.category || "-"}
                  </p>
                </div>
              </div>

              {/* Customizations */}
              {item.customizations &&
                Object.keys(item.customizations).length > 0 && (
                  <div className="mt-5">
                    <h4 className="text-sm font-semibold mb-3">
                      Customization Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(item.customizations)
                        .filter(([, value]) => value !== "" && value !== null && value !== undefined)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="bg-[#FAFAFA] rounded-lg px-3 py-2"
                          >
                            <p className="text-xs text-gray-500 capitalize">
                              {key.replace(/_/g, " ")}
                            </p>

                            <p className="text-sm font-medium mt-1">
                              {String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      {selectedEnquiry.notes && (
        <div className="px-6 pb-6">
          <div className="border rounded-lg p-4 bg-[#FAFAFA]">
            <p className="text-xs text-gray-500 mb-1">
              Notes
            </p>

            <p className="text-sm">
              {selectedEnquiry.notes}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end px-6 py-4 border-t">
        <button
          onClick={() => setSelectedEnquiry(null)}
          className="px-5 py-2 bg-[#359E58] text-white rounded-lg hover:bg-[#2e8b4d]"
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}

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
          <TabsContent value="whatsapp">
          <div className="space-y-4">

<div className="grid grid-cols-2 lg:grid-cols-6 gap-4">

<div
    onClick={() => setStatusFilter("All")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "All"
            ? "bg-green-100 border-green-600"
            : "bg-white"
    }`}
>
        <p className="text-xs text-gray-500">Total</p>
        <h2 className="text-3xl font-bold">
            {whatsappOrders.length}
        </h2>
    </div>

    <div
    onClick={() => setStatusFilter("Pending")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Pending"
            ? "bg-yellow-200 border-yellow-600"
            : "bg-yellow-50"
    }`}
>
        <p className="text-xs text-gray-500">Pending</p>
        <h2 className="text-3xl font-bold text-yellow-700">
            {
                whatsappOrders.filter(
                    o => o.status === "Pending"
                ).length
            }
        </h2>
    </div>

    <div
    onClick={() => setStatusFilter("QC")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "QC"
            ? "bg-blue-200 border-blue-600"
            : "bg-blue-50"
    }`}
>
        <p className="text-xs text-gray-500">QC</p>
        <h2 className="text-3xl font-bold text-blue-700">
            {
                whatsappOrders.filter(
                    o => o.status === "QC"
                ).length
            }
        </h2>
    </div>

    <div
    onClick={() => setStatusFilter("In Production")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "In Production"
            ? "bg-purple-200 border-purple-600"
            : "bg-purple-50"
    }`}
>
        <p className="text-xs text-gray-500">
            Production
        </p>
        <h2 className="text-3xl font-bold text-purple-700">
            {
                whatsappOrders.filter(
                    o => o.status === "In Production"
                ).length
            }
        </h2>
    </div>

    <div
    onClick={() => setStatusFilter("Delivered")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Delivered"
            ? "bg-green-200 border-green-600"
            : "bg-green-50"
    }`}
>
        <p className="text-xs text-gray-500">
            Delivered
        </p>
        <h2 className="text-3xl font-bold text-green-700">
            {
                whatsappOrders.filter(
                    o => o.status === "Delivered"
                ).length
            }
        </h2>
    </div>

    <div className="bg-red-50 border rounded-lg p-4 text-center">
        <p className="text-xs text-gray-500">
            Urgent
        </p>
        <h2 className="text-3xl font-bold text-red-700">
            {
                whatsappOrders.filter(
                    o => o.priority === "Urgent"
                ).length
            }
        </h2>
    </div>

</div>

<div className="flex flex-col md:flex-row gap-4 mb-4">

<Input
    placeholder="Search by Order ID, Customer, Product or Status..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="flex-1"
/>

<div className="relative">

<input
    id="excel-date-picker"
    type="date"
    value={selectedExcelDate}
    onChange={async (e) => {
        const date = e.target.value;
        setSelectedExcelDate(date);

        if (!date) return;

        try {
            const response = await api.get(
              customerDateMode
              ? `/admin/whatsapp-orders/excel/customer-date?customer_name=${encodeURIComponent(customerExcelName)}&order_date=${date}`
              : `/admin/whatsapp-orders/excel/date/${date}`,
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));

            const link = document.createElement("a");
            link.href = url;
            link.download = customerDateMode
    ? `${customerExcelName}_Orders_${date}.xlsx`
    : `Orders_${date}.xlsx`;

            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            setCustomerDateMode(false);
            setCustomerExcelName("");

            toast.success("Excel downloaded successfully");
        } catch (err) {
            console.error(err);
            toast.error("Unable to download orders.");
        }
    }}
    style={{ display: "none" }}
/>

    <button
        onClick={() => setShowExcelMenu(!showExcelMenu)}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md"
    >
        Download Excel
    </button>

    {showExcelMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-50">

<button
    onClick={async () => {
        try {

            const response = await api.get(
                "/admin/whatsapp-orders/excel/today",
                {
                    responseType: "blob",
                }
            );

            const url = window.URL.createObjectURL(
                new Blob([response.data])
            );

            const link = document.createElement("a");

            link.href = url;

            link.setAttribute(
                "download",
                "Today_Orders.xlsx"
            );

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

            setShowExcelMenu(false);

        } catch (err) {

            console.error(err);

            toast.error("Unable to download today's orders.");

        }
    }}


    className="w-full text-left px-4 py-3 hover:bg-gray-100"
>
📆 Today's Orders
</button>


{/* 👇 ADD THIS DROPDOWN
<select
  value={selectedCustomer}
  onChange={(e) => setSelectedCustomer(e.target.value)}
  className="border px-3 py-2 rounded w-full mb-2"
>
  <option value="">Select Customer</option>
  {customers.map((c, i) => (
    <option key={i} value={c}>
      {c}
    </option>
  ))}
</select> */}


<button
  onClick={() => {
    setSelectedCustomer("");
    setShowCustomerDialog(true);
    setShowExcelMenu(false);
  }}
  className="w-full text-left px-4 py-3 hover:bg-gray-100"
>
  👤 Orders by Customer
</button>

<button
    onClick={() => {
        setDateSelectionMode("single");
        setSingleOrderDate("");
        setFromOrderDate("");
        setToOrderDate("");
        setShowDateDialog(true);
        setShowExcelMenu(false);
    }}
    className="w-full text-left px-4 py-3 hover:bg-gray-100"
>
    📅 Orders by Date
</button>

<button
    onClick={() => {
        setShowDateCustomerDialog(true);
        setShowExcelMenu(false);
    }}
    className="w-full text-left px-4 py-3 hover:bg-gray-100"
>
    📅👤 Orders by Date & Customer
</button>

        </div>
    )}

</div>

<select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded-md px-4 py-2 bg-white"
>
    <option value="All">All</option>
    <option value="Pending">Pending</option>
    <option value="Approved">Approved</option>
    <option value="Assigned">Assigned</option>
    <option value="In Production">In Production</option>
    <option value="Stone Setting">Stone Setting</option>
    <option value="Polishing">Polishing</option>
    <option value="QC">QC</option>
    <option value="Ready">Ready</option>
    <option value="Delivered">Delivered</option>
    <option value="Rejected">Rejected</option>
</select>

</div>

{filteredOrders.map((order) => (

<div
    key={order.orderId}
    onClick={() => navigate(`/admin/whatsapp-orders/${order.orderId}`)}
    className="border border-[#E5E7EB] bg-white p-5 rounded-sm hover:border-[#359E58] hover:shadow-md transition-all relative cursor-pointer"
>

<div className="flex justify-between items-start mb-3">

<div>

<h3 className="font-semibold text-lg hover:text-green-600">
        {order.orderId}
    </h3>

</div>

<div className="flex items-center gap-3">

    <button
        onClick={(e) => {
            e.stopPropagation();
            deleteWhatsappOrder(order.orderId);
        }}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
    >
        Delete
    </button>

    <span
        className={`text-sm px-3 py-1 rounded font-medium ${
            order.status === "Pending"
                ? "bg-yellow-100 text-yellow-800"
            : order.status === "Approved"
                ? "bg-green-100 text-green-800"
            : order.status === "Assigned"
                ? "bg-orange-100 text-orange-800"
            : order.status === "In Production"
                ? "bg-purple-100 text-purple-800"
            : order.status === "QC"
                ? "bg-blue-100 text-blue-800"
            : order.status === "Ready"
                ? "bg-emerald-100 text-emerald-800"
            : order.status === "Delivered"
                ? "bg-green-200 text-green-900"
            : order.status === "Rejected"
                ? "bg-red-100 text-red-800"
            : "bg-gray-100 text-gray-800"
        }`}
    >
        {order.status}
    </span>

</div>

</div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">

          <div>
            <strong>Customer</strong><br />
            {order.customer_name}
          </div>

          <div>
            <strong>Product</strong><br />
            {order.product_category}
          </div>

          <div>
            <strong>Metal</strong><br />
            {order.metal}
          </div>

          <div>
            <strong>Due Date</strong><br />
            {order.due_date}
          </div>

          <div>
            <strong>Weight</strong><br />
            {order.approx_weight}
          </div>

          <div>
          <strong>Priority</strong>

<br />

<span
    className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
        order.priority === "Low"
            ? "bg-green-100 text-green-800"

        : order.priority === "Normal"
            ? "bg-blue-100 text-blue-800"

        : order.priority === "High"
            ? "bg-orange-100 text-orange-800"

        : order.priority === "Urgent"
            ? "bg-red-100 text-red-800"

        : "bg-gray-100 text-gray-700"
    }`}
>
    {order.priority || "Normal"}
</span>
          </div>

        </div>

      </div>

    ))}

{filteredOrders.length === 0 && (
    <div className="text-center py-10 text-gray-500">
        No matching WhatsApp orders found.
    </div>
)}

  </div>
</TabsContent>
</Tabs>
</div>
</div>

{selectedProduct && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

      <div className="flex items-center justify-between p-5 border-b">
        <div>
        <div>
  <label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
    Product ID
  </label>

  <div className="flex items-center gap-2 mt-1">
    <Input
      value={editingProductId}
      onChange={(e) => setEditingProductId(e.target.value)}
      className="w-64"
    />

    <Button
      onClick={saveProductId}
      className="bg-[#359E58] hover:bg-[#2e884c] text-white"
    >
      Save
    </Button>
  </div>
</div>
          <p className="text-sm text-[#4B5563] mt-1">
            {selectedProduct.category}
          </p>
        </div>

        <button
          onClick={() => setSelectedProduct(null)}
          className="p-2 text-gray-500 hover:text-black"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5">

        <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">
          Product Images
        </h3>

        <div className="mb-5">
  <input
    type="file"
    accept="image/*"
    id="product-image-upload"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    }}
  />

  <label
    htmlFor="product-image-upload"
    className="inline-flex items-center justify-center px-4 py-2 bg-[#359E58] hover:bg-[#2e884c] text-white text-sm rounded-sm cursor-pointer"
  >
    {selectedFile ? "Change Selected Image" : "Add Image"}
  </label>

  {selectedFile && (
    <span className="ml-3 text-sm text-[#4B5563]">
      {selectedFile.name}
    </span>
  )}

{selectedFile && (
  <Button
    type="button"
    onClick={uploadProductImage}
    className="ml-3 bg-[#359E58] hover:bg-[#2e884c] text-white"
  >
    Upload
  </Button>
)}
</div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

          {(selectedProduct.images || []).map((img, index) => (
            <div
              key={index}
              className="border border-[#E5E7EB] bg-white p-2"
            >
              <div className="aspect-square overflow-hidden bg-[#FAFAFA]">
                <img
                  src={
                    img.startsWith("/api/")
                      ? `${process.env.REACT_APP_BACKEND_URL}${img}`
                      : img
                  }
                  alt={`${selectedProduct.product_id} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-2 space-y-2">
  <p className="text-xs text-center text-[#4B5563]">
    Image {index + 1}
  </p>

  {index === 0 ? (
  <div className="text-xs text-center text-white bg-[#359E58] py-1 rounded-sm">
    FRONT IMAGE
  </div>
) : (
  <Button
    type="button"
    size="sm"
    variant="outline"
    className="w-full text-xs border-[#359E58] text-[#359E58] hover:bg-[#359E58] hover:text-white"
    onClick={() => setFrontImage(selectedProduct.product_id, img)}
  >
    Set as Front
  </Button>
)}

<Button
  type="button"
  size="sm"
  variant="outline"
  className="w-full text-xs border-red-300 text-red-500 hover:bg-red-500 hover:text-white"
  onClick={() =>
    deleteProductImage(selectedProduct.product_id, img)
  }
>
  Delete Image
</Button>

<input
  type="file"
  accept="image/*"
  id={`replace-image-${index}`}
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0];

    if (file) {
      replaceProductImage(img, file);
    }

    e.target.value = "";
  }}
/>

<label
  htmlFor={`replace-image-${index}`}
  className="block w-full text-center text-xs border border-blue-300 text-blue-500 hover:bg-blue-500 hover:text-white py-2 rounded-sm cursor-pointer"
>
  Replace Image
</label>
</div>
            </div>
          ))}

        </div>

      </div>

      <div className="flex justify-end p-5 border-t">
        <Button
          variant="outline"
          onClick={() => setSelectedProduct(null)}
        >
          Close
        </Button>
      </div>

    </div>
  </div>
)}

</>

);
}