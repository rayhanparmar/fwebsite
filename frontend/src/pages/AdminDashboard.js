import { useState, useEffect, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Plus, Trash2, Users, Package, MessageSquare, Palette, BarChart3, FileUp, Image } from "lucide-react";
import { PRODUCT_CUSTOMIZATION_CONFIG } from "../components/ProductCustomizationConfig";
import { displayValue } from "@/lib/labels";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Validated categorical palette — colourblind-safe, checked for CVD separation
const ANALYSIS_COLORS = ["#359E58", "#2563EB", "#D97706", "#7C3AED", "#0D9488"];

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
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [products, setProducts] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [customisations, setCustomisations] = useState([]);
  const [selectedCustomisation, setSelectedCustomisation] = useState(null);
  const downloadCustomisationFile = async (fileUrl, fileName) => {
    try {
      if (!fileUrl) {
        throw new Error("File URL is missing");
      }
  
      const s3Url = new URL(fileUrl);
      const filePath = s3Url.pathname;
  
      const backendUrl =
        `${process.env.REACT_APP_BACKEND_URL}/api/files${filePath}`;
  
      console.log("Downloading through backend:", backendUrl);
  
      const response = await fetch(backendUrl);
  
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }
  
      const blob = await response.blob();
  
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
  
      link.href = blobUrl;
      link.download = fileName || "customisation-file";
  
      document.body.appendChild(link);
      link.click();
      link.remove();
  
      window.URL.revokeObjectURL(blobUrl);
  
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("File download error:", error);
      toast.error("Unable to download file");
    }
  };
  const [whatsappOrders, setWhatsappOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // =========================
// ANALYSIS
// =========================
const [analysisFromDate, setAnalysisFromDate] = useState("");
const [analysisToDate, setAnalysisToDate] = useState("");


const [analysisChannel, setAnalysisChannel] = useState("all");
const [analysisRetailer, setAnalysisRetailer] = useState("all");
const [analysisCategory, setAnalysisCategory] = useState("all");
const [analysisProduct, setAnalysisProduct] = useState("all");
const [analysisOrderType, setAnalysisOrderType] = useState("all");
const [analysisMetal, setAnalysisMetal] = useState("all");
const [analysisPurity, setAnalysisPurity] = useState("all");
const [analysisStone, setAnalysisStone] = useState("all");

const [analysisData, setAnalysisData] = useState({
  overview: {
    total_orders: 0,
    combined_orders: 0,
    website_orders: 0,
    whatsapp_orders: 0,
    total_products: 0,
    average_orders_per_day: 0,
  },

  category: [],
  category_monthly: [],

  products: [],

  product_intelligence: {
    best_sellers: [],
    underperforming: [],
    never_ordered: [],
  },

  retailers: [],

  metal: [],
  purity: [],
  gold_colour: [],
  stone: [],

  status: [],
  due_dates: {},

  filters: {},
});


const [selectedAnalysisCategories, setSelectedAnalysisCategories] =
  useState([]);
const [expandedAnalysisRetailer, setExpandedAnalysisRetailer] =
  useState(null);

const [retailerAnalysisSort, setRetailerAnalysisSort] =
  useState("orders_desc");

const [analysisView, setAnalysisView] = useState("overview");
const [showAnalysisFilters, setShowAnalysisFilters] = useState(false);
const [showAllInsights, setShowAllInsights] = useState(false);
const [expandedAnalysisCategory, setExpandedAnalysisCategory] = useState(null);

const [productPerformanceSort, setProductPerformanceSort] =
  useState("orders_desc");
const [filteredOrders, setFilteredOrders] = useState([]);
const [statusFilter, setStatusFilter] = useState("All");
const [urgentFromDate, setUrgentFromDate] = useState("");
const [urgentToDate, setUrgentToDate] = useState("");
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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [categoryImages, setCategoryImages] = useState([]);
const [selectedProduct, setSelectedProduct] = useState(null);
const [productDetails, setProductDetails] = useState({});
const [savingProductDetails, setSavingProductDetails] = useState(false);
const [selectedCategoryImage, setSelectedCategoryImage] = useState(null);
const [categoryImageUploading, setCategoryImageUploading] = useState(false);

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

  const shouldShowProductField = (field, values) => {
    if (!field.showWhen) {
      return true;
    }
  
    return Object.entries(field.showWhen).every(
      ([key, expectedValue]) => values[key] === expectedValue
    );
  };
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


  const loadWhatsappAnalysis = useCallback(async () => {
    try {
      const params = new URLSearchParams();
  
      if (analysisFromDate) {
        params.append("from_date", analysisFromDate);
      }
  
      if (analysisToDate) {
        params.append("to_date", analysisToDate);
      }

      if (analysisChannel !== "all") {
        params.append("channel", analysisChannel);
      }

      if (analysisRetailer !== "all") {
        params.append("retailer_id", analysisRetailer);
      }

      if (analysisCategory !== "all") {
        params.append("category", analysisCategory);
      }

      if (analysisProduct !== "all") {
        params.append("product_id", analysisProduct);
      }

      if (analysisOrderType !== "all") {
        params.append("order_type", analysisOrderType);
      }

      if (analysisMetal !== "all") {
        params.append("metal", analysisMetal);
      }

      if (analysisPurity !== "all") {
        params.append("purity", analysisPurity);
      }

      if (analysisStone !== "all") {
        params.append("stone", analysisStone);
      }
  
      const query = params.toString();
  
      const response = await api.get(
        `/admin/analysis${query ? `?${query}` : ""}`
      );
  
      setAnalysisData(response.data || {});
  
    } catch (error) {
      console.error(
        "Combined Analysis API error:",
        error
      );
  
      toast.error(
        "Failed to load business analysis"
      );
    }
  }, [
    api,
    analysisFromDate,
    analysisToDate,
    analysisChannel,
    analysisRetailer,
    analysisCategory,
    analysisProduct,
    analysisOrderType,
    analysisMetal,
    analysisPurity,
    analysisStone,
  ]);




  useEffect(() => {

    let filtered = whatsappOrders;

    // Search Filter
    if (searchTerm.trim()) {

        const search = searchTerm.toLowerCase();

        filtered = filtered.filter((order) =>

            order.orderId?.toLowerCase().includes(search) ||

            order.customer_name?.toLowerCase().includes(search) ||

            displayValue("product_category", order.product_category)?.toLowerCase().includes(search) ||
            order.product_category?.toLowerCase().includes(search) ||

            order.status?.toLowerCase().includes(search)

        );

    }

        // Status / Priority Filter
        if (statusFilter === "Urgent") {

          filtered = filtered.filter(
              (order) => order.priority === "Urgent"
          );
  
      } else if (statusFilter !== "All") {
  
          filtered = filtered.filter(
              (order) => order.status === statusFilter
          );
  
      }

          // Urgent Date Filter
    if (statusFilter === "Urgent" && urgentFromDate) {
      filtered = filtered.filter((order) => {
          const dueDate = order.due_date?.slice(0, 10);
          return dueDate >= urgentFromDate;
      });
  }

  if (statusFilter === "Urgent" && urgentToDate) {
      filtered = filtered.filter((order) => {
          const dueDate = order.due_date?.slice(0, 10);
          return dueDate <= urgentToDate;
      });
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

  }, [searchTerm, statusFilter, whatsappOrders, urgentFromDate, urgentToDate, api]);

  useEffect(() => { loadStats(); }, [loadStats]);
  

  // Load data for whichever tab the URL points at
  useEffect(() => {
    if (activeTab === "overview") loadStats();
    if (activeTab === "retailers") loadRetailers();
    if (activeTab === "products") loadProducts();
    if (activeTab === "enquiries") loadEnquiries();
    if (activeTab === "customisations") loadCustomisations();
    if (activeTab === "whatsapp") loadWhatsappOrders();
  }, [activeTab]);
  useEffect(() => { if (retailers.length > 0 || retailerFilter !== "all") loadRetailers(); }, [retailerFilter]);
  // Auto-load products when category or page changes
  useEffect(() => { if (productsLoaded) loadProducts(); }, [productCategory, productPage]);

  useEffect(() => {
    loadWhatsappAnalysis();
  }, [loadWhatsappAnalysis]);

  const approveRetailer = async (id) => {
    try { await api.put(`/admin/retailers/${id}/approve`); toast.success("Retailer approved"); loadRetailers(); loadStats(); }
    catch { toast.error("Failed to approve"); }
  };

  const removeRetailer = async (id, name) => {
    if (!window.confirm(
      `Permanently remove ${name || "this retailer"}?\n\n` +
      "They will lose access and will have to register again.\n\n" +
      "This cannot be undone."
    )) return;

    try {
      await api.delete(`/admin/retailers/${id}`);
      toast.success("Retailer removed");
      loadRetailers();
      loadStats();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to remove retailer"
      );
    }
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

  const deleteCustomisation = async (customId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this customisation request?\n\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`/admin/customisations/${customId}`);
      toast.success("Customisation deleted successfully");
      loadCustomisations();
      loadStats();
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Failed to delete customisation"
      );
    }
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
  const files = Array.from(e.target.files || []);

  if (files.length === 0) return;

  if (files.length > 5) {
    toast.error("You can select a maximum of 5 files at a time");
    e.target.value = "";
    return;
  }

  const tooBig = files.find((f) => f.size > 25 * 1024 * 1024);

  if (tooBig) {
    toast.error(`"${tooBig.name}" is over 25MB`);
    e.target.value = "";
    return;
  }

  setSelectedFiles(files);
  e.target.value = "";
};

const uploadProduct = async (e) => {
  e.preventDefault();

  if (!newProductId.trim()) { toast.error("Product ID is required"); return; }
  if (!newProductCategory) { toast.error("Please select a category"); return; }
  if (selectedFiles.length === 0) { toast.error("Please select at least one file"); return; }

  setUploading(true);

  let done = 0;

  try {
    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append("product_id", newProductId.trim());
      formData.append("category", newProductCategory);
      formData.append("file", file);

      await api.post("/admin/products/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      done += 1;
    }

    toast.success(`${done} image${done !== 1 ? "s" : ""} uploaded successfully`);
    setSelectedFiles([]);
    loadProducts();
    loadStats();
  } catch (err) {
    toast.error(
      err.response?.data?.detail ||
      `Upload stopped after ${done} of ${selectedFiles.length} images`
    );
    loadProducts();
  } finally {
    setUploading(false);
  }
};

  const saveProductDetails = async () => {
    if (!selectedProduct) {
      toast.error("No product selected");
      return;
    }
  
    setSavingProductDetails(true);
  
    try {
      const res = await api.put(
        `/admin/products/${selectedProduct.product_id}/details`,
        productDetails
      );
  
      setSelectedProduct((currentProduct) => {
        if (!currentProduct) {
          return currentProduct;
        }
  
        return {
          ...currentProduct,
          product_details: productDetails,
        };
      });
  
      toast.success(
        res.data.message || "Product details saved successfully"
      );
  
      await loadProducts();
    } catch (err) {
      console.error("Save product details error:", err);
  
      toast.error(
        err.response?.data?.detail ||
          "Failed to save product details"
      );
    } finally {
      setSavingProductDetails(false);
    }
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
    if (!selectedProduct || selectedFiles.length === 0) {
      toast.error("Please select at least one file");
      return;
    }

    let done = 0;

    try {
      for (const file of selectedFiles) {
        const formData = new FormData();

        formData.append("product_id", selectedProduct.product_id);
        formData.append("category", selectedProduct.category);
        formData.append("file", file);

        await api.post("/admin/products/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        done += 1;
      }

      toast.success(`${done} image${done !== 1 ? "s" : ""} uploaded successfully`);
      setSelectedFiles([]);

      const refreshed = await api.get(`/admin/products?page=1&limit=1&category=${encodeURIComponent(selectedProduct.category)}`);
      void refreshed;

      await loadProducts();
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.detail || `Upload stopped after ${done} images`
      );
      await loadProducts();
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

  const uploadCategoryImage = async (slug, file) => {
    if (!file) return;
  
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
  
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Image must be under 25MB");
      return;
    }
  
    setCategoryImageUploading(true);
  
    try {
      const formData = new FormData();
      formData.append("file", file);
  
      const res = await api.post(
        `/admin/category-images/${slug}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      toast.success(
        res.data.message || "Collection image updated successfully"
      );
  
      const updated = await api.get("/admin/category-images");
  
      setCategoryImages(
        updated.data.category_images || []
      );
  
      setSelectedCategoryImage(null);
  
    } catch (err) {
      console.error("Category image upload error:", err);
  
      toast.error(
        err.response?.data?.detail ||
        "Failed to update Collection image"
      );
    } finally {
      setCategoryImageUploading(false);
    }
  };
  
  
  const deleteCategoryImage = async (slug) => {
    if (
      !window.confirm(
        "Delete this custom Collection image?\n\nThe website will use the default image again."
      )
    ) {
      return;
    }
  
    try {
      const res = await api.delete(
        `/admin/category-images/${slug}`
      );
  
      toast.success(
        res.data.message || "Collection image deleted"
      );
  
      const updated = await api.get("/admin/category-images");
  
      setCategoryImages(
        updated.data.category_images || []
      );
  
    } catch (err) {
      console.error("Category image delete error:", err);
  
      toast.error(
        err.response?.data?.detail ||
        "Failed to delete Collection image"
      );
    }
  };

  const resetForm = () => {
    setNewProductId("");
    setNewProductCategory("");
    setSelectedFiles([]);
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


// ======================================================
// ANALYSIS EXPORT — CSV
// ======================================================

const exportAnalysisCSV = () => {
  try {
    const rows = [];

    // OVERVIEW
    rows.push(["ANALYSIS OVERVIEW"]);
    rows.push(["Metric", "Value"]);

    rows.push([
      "Total Orders",
      analysisData?.overview?.total_orders ?? 0
    ]);

    rows.push([
      "Website Orders",
      analysisData?.overview?.website_orders ?? 0
    ]);

    rows.push([
      "WhatsApp Orders",
      analysisData?.overview?.whatsapp_orders ?? 0
    ]);

    rows.push([
      "Total Products",
      analysisData?.overview?.total_products ?? 0
    ]);

    rows.push([
      "Average Orders/Day",
      analysisData?.overview?.average_orders_per_day ?? 0
    ]);

    rows.push([]);

    // SELECTED FILTERS
    rows.push(["SELECTED FILTERS"]);
    rows.push(["From Date", analysisFromDate || "All"]);
    rows.push(["To Date", analysisToDate || "All"]);
    rows.push(["Channel", analysisChannel]);
    rows.push(["Retailer", analysisRetailer]);
    rows.push(["Category", analysisCategory]);
    rows.push(["Product/Design", analysisProduct]);
    rows.push(["Custom/Stock", analysisOrderType]);
    rows.push(["Metal", analysisMetal]);
    rows.push(["Purity", analysisPurity]);
    rows.push(["Stone", analysisStone]);

    rows.push([]);

    // CATEGORY PERFORMANCE
    rows.push(["CATEGORY PERFORMANCE"]);
    rows.push(["Category", "Orders", "Order %"]);

    (analysisByCategory || []).forEach((item) => {

      const category =
        item?.category ||
        item?.name ||
        "Unknown";

      const orders =
        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        );

      const percentage =
        Number(
          item?.percentage ||
          item?.order_percentage ||
          0
        );

      rows.push([
        category,
        orders,
        percentage
      ]);

    });

    rows.push([]);

    // PRODUCT PERFORMANCE
    rows.push(["PRODUCT PERFORMANCE"]);
    rows.push(["Product/Design", "Category", "Orders"]);

    (analysisByProducts || []).forEach((item) => {

      const product =
        item?.design_number ||
        item?.product_id ||
        item?.name ||
        "Unknown";

      const category =
        item?.category ||
        "Unknown";

      const orders =
        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        );

      rows.push([
        product,
        category,
        orders
      ]);

    });

    rows.push([]);

    // RETAILER PERFORMANCE
    rows.push(["RETAILER PERFORMANCE"]);
    rows.push([
      "Retailer",
      "Total Orders",
      "Custom Orders",
      "Stock Orders"
    ]);

    (analysisByRetailer || []).forEach((item) => {

      const retailer =
        item?.retailer_name ||
        item?.name ||
        "Unknown";

      const total =
        Number(item?.total_orders || 0);

      const custom =
        Number(
          item?.custom_orders ||
          item?.custom ||
          0
        );

      const stock =
        Number(
          item?.stock_orders ||
          item?.stock ||
          0
        );

      rows.push([
        retailer,
        total,
        custom,
        stock
      ]);

    });

    rows.push([]);

    // METAL
    rows.push(["METAL ANALYSIS"]);
    rows.push(["Metal", "Orders"]);

    (analysisByMetal || []).forEach((item) => {

      const metal =
        item?.metal ||
        item?.name ||
        item?.value ||
        "Unknown";

      const orders =
        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        );

      rows.push([
        metal,
        orders
      ]);

    });

    rows.push([]);

    // STONE
    rows.push(["STONE ANALYSIS"]);
    rows.push(["Stone", "Orders"]);

    (analysisByStone || []).forEach((item) => {

      const stone =
        item?.stone ||
        item?.stone_type ||
        item?.name ||
        item?.value ||
        "Unknown";

      const orders =
        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        );

      rows.push([
        stone,
        orders
      ]);

    });

    rows.push([]);

    // ORDER STATUS
    rows.push(["ORDER STATUS"]);
    rows.push(["Status", "Orders"]);

    Object.entries(
      analysisByStatus || {}
    ).forEach(([status, value]) => {

      const orders =
        typeof value === "object"
          ? Number(
              value?.orders ||
              value?.count ||
              0
            )
          : Number(value || 0);

      rows.push([
        status,
        orders
      ]);

    });

    // CSV CREATION
    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const text =
              value === null ||
              value === undefined
                ? ""
                : String(value);

            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    const from =
      analysisFromDate || "all";

    const to =
      analysisToDate || "all";

    link.download =
      `Business_Analysis_${from}_to_${to}.csv`;

    document.body.appendChild(link);

    link.click();

    link.remove();

    window.URL.revokeObjectURL(url);

    toast.success(
      "Analysis CSV downloaded successfully"
    );

  } catch (error) {

    console.error(
      "Analysis CSV export error:",
      error
    );

    toast.error(
      "Failed to export analysis CSV"
    );

  }
};

// ======================================================
// ANALYSIS EXPORT — EXCEL
// ======================================================

const exportAnalysisExcel = () => {
  try {
    const workbook = XLSX.utils.book_new();

    // OVERVIEW
    const overviewRows = [
      ["ANALYSIS OVERVIEW"],
      ["Metric", "Value"],
      [
        "Total Orders",
        analysisData?.overview?.total_orders ?? 0
      ],
      [
        "Website Orders",
        analysisData?.overview?.website_orders ?? 0
      ],
      [
        "WhatsApp Orders",
        analysisData?.overview?.whatsapp_orders ?? 0
      ],
      [
        "Total Products",
        analysisData?.overview?.total_products ?? 0
      ],
      [
        "Average Orders/Day",
        analysisData?.overview?.average_orders_per_day ?? 0
      ],
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(overviewRows),
      "Overview"
    );


    // FILTERS
    const filterRows = [
      ["SELECTED FILTERS"],
      ["From Date", analysisFromDate || "All"],
      ["To Date", analysisToDate || "All"],
      ["Channel", analysisChannel],
      ["Retailer", analysisRetailer],
      ["Category", analysisCategory],
      ["Product/Design", analysisProduct],
      ["Custom/Stock", analysisOrderType],
      ["Metal", analysisMetal],
      ["Purity", analysisPurity],
      ["Stone", analysisStone],
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(filterRows),
      "Filters"
    );


    // CATEGORY
    const categoryRows = [
      ["CATEGORY PERFORMANCE"],
      ["Category", "Orders", "Order %"],
    ];

    (analysisByCategory || []).forEach((item) => {
      categoryRows.push([
        item?.category ||
          item?.name ||
          "Unknown",

        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        ),

        Number(
          item?.percentage ||
          item?.order_percentage ||
          0
        ),
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(categoryRows),
      "Categories"
    );


    // PRODUCTS
    const productRows = [
      ["PRODUCT PERFORMANCE"],
      ["Product/Design", "Category", "Orders"],
    ];

    (analysisByProducts || []).forEach((item) => {
      productRows.push([
        item?.design_number ||
          item?.product_id ||
          item?.name ||
          "Unknown",

        item?.category ||
          "Unknown",

        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        ),
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(productRows),
      "Products"
    );


    // RETAILERS
    const retailerRows = [
      [
        "RETAILER PERFORMANCE"
      ],
      [
        "Retailer",
        "Total Orders",
        "Custom Orders",
        "Stock Orders",
      ],
    ];

    (analysisByRetailer || []).forEach((item) => {
      retailerRows.push([
        item?.retailer_name ||
          item?.name ||
          "Unknown",

        Number(
          item?.total_orders ||
          0
        ),

        Number(
          item?.custom_orders ||
          item?.custom ||
          0
        ),

        Number(
          item?.stock_orders ||
          item?.stock ||
          0
        ),
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(retailerRows),
      "Retailers"
    );


    // METAL
    const metalRows = [
      ["METAL ANALYSIS"],
      ["Metal", "Orders"],
    ];

    (analysisByMetal || []).forEach((item) => {
      metalRows.push([
        item?.metal ||
          item?.name ||
          item?.value ||
          "Unknown",

        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        ),
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(metalRows),
      "Metal"
    );


    // STONE
    const stoneRows = [
      ["STONE ANALYSIS"],
      ["Stone", "Orders"],
    ];

    (analysisByStone || []).forEach((item) => {
      stoneRows.push([
        item?.stone ||
          item?.stone_type ||
          item?.name ||
          item?.value ||
          "Unknown",

        Number(
          item?.orders ||
          item?.order_count ||
          item?.count ||
          0
        ),
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(stoneRows),
      "Stone"
    );


    // STATUS
    const statusRows = [
      ["ORDER STATUS"],
      ["Status", "Orders"],
    ];

    Object.entries(
      analysisByStatus || {}
    ).forEach(([status, value]) => {

      const orders =
        typeof value === "object"
          ? Number(
              value?.orders ||
              value?.count ||
              0
            )
          : Number(value || 0);

      statusRows.push([
        status,
        orders
      ]);
    });

    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet(statusRows),
      "Status"
    );


    // DOWNLOAD
    const from =
      analysisFromDate || "all";

    const to =
      analysisToDate || "all";

    XLSX.writeFile(
      workbook,
      `Business_Analysis_${from}_to_${to}.xlsx`
    );

    toast.success(
      "Analysis Excel downloaded successfully"
    );

  } catch (error) {

    console.error(
      "Analysis Excel export error:",
      error
    );

    toast.error(
      "Failed to export analysis Excel"
    );

  }
};

// ======================================================
// ANALYSIS EXPORT — PDF
// ======================================================

const exportAnalysisPDF = () => {
  try {
    const doc = new jsPDF();

    const fromDate = analysisFromDate || "All";
    const toDate = analysisToDate || "All";

    // TITLE
    doc.setFontSize(18);
    doc.text("Business Analysis Report", 14, 18);

    doc.setFontSize(9);
    doc.text(
      `Period: ${fromDate} to ${toDate}`,
      14,
      25
    );

    // SELECTED FILTERS
    doc.setFontSize(12);
    doc.text("Selected Filters", 14, 36);

    const filterRows = [
      ["From Date", fromDate],
      ["To Date", toDate],
      ["Channel", analysisChannel || "All"],
      ["Retailer", analysisRetailer || "All"],
      ["Category", analysisCategory || "All"],
      ["Product / Design", analysisProduct || "All"],
      ["Custom / Stock", analysisOrderType || "All"],
      ["Metal", analysisMetal || "All"],
      ["Purity", analysisPurity || "All"],
      ["Stone", analysisStone || "All"],
    ];

    autoTable(doc, {
      startY: 40,
      head: [["Filter", "Selected Value"]],
      body: filterRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // OVERVIEW
    let y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Overview", 14, y);

    const overviewRows = [
      [
        "Total Orders",
        analysisData?.overview?.total_orders ?? 0,
      ],
      [
        "Website Orders",
        analysisData?.overview?.website_orders ?? 0,
      ],
      [
        "WhatsApp Orders",
        analysisData?.overview?.whatsapp_orders ?? 0,
      ],
      [
        "Total Products",
        analysisData?.overview?.total_products ?? 0,
      ],
      [
        "Average Orders / Day",
        analysisData?.overview?.average_orders_per_day ?? 0,
      ],
    ];

    autoTable(doc, {
      startY: y + 4,
      head: [["Metric", "Value"]],
      body: overviewRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // CATEGORY PERFORMANCE
    y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Category Performance", 14, y);

    const categoryRows =
      (analysisByCategory || []).map(
        (item) => [
          item?.category ||
            item?.name ||
            "Unknown",

          Number(
            item?.orders ||
            item?.order_count ||
            item?.count ||
            0
          ),

          Number(
            item?.percentage ||
            item?.order_percentage ||
            0
          ),
        ]
      );

    autoTable(doc, {
      startY: y + 4,
      head: [
        ["Category", "Orders", "Order %"],
      ],
      body: categoryRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // PRODUCT PERFORMANCE
    y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Product Performance", 14, y);

    const productRows =
      (analysisByProducts || []).map(
        (item) => [
          item?.design_number ||
            item?.product_id ||
            item?.name ||
            "Unknown",

          item?.category ||
            "Unknown",

          Number(
            item?.orders ||
            item?.order_count ||
            item?.count ||
            0
          ),
        ]
      );

    autoTable(doc, {
      startY: y + 4,
      head: [
        [
          "Product / Design",
          "Category",
          "Orders",
        ],
      ],
      body: productRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // RETAILER PERFORMANCE
    y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Retailer Performance", 14, y);

    const retailerRows =
      (analysisByRetailer || []).map(
        (item) => [
          item?.retailer_name ||
            item?.name ||
            "Unknown",

          Number(
            item?.total_orders || 0
          ),

          Number(
            item?.custom_orders ||
            item?.custom ||
            0
          ),

          Number(
            item?.stock_orders ||
            item?.stock ||
            0
          ),
        ]
      );

    autoTable(doc, {
      startY: y + 4,
      head: [
        [
          "Retailer",
          "Total Orders",
          "Custom",
          "Stock",
        ],
      ],
      body: retailerRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // METAL
    y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Metal Analysis", 14, y);

    const metalRows =
      (analysisByMetal || []).map(
        (item) => [
          item?.metal ||
            item?.name ||
            item?.value ||
            "Unknown",

          Number(
            item?.orders ||
            item?.order_count ||
            item?.count ||
            0
          ),
        ]
      );

    autoTable(doc, {
      startY: y + 4,
      head: [["Metal", "Orders"]],
      body: metalRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // STONE
    y =
      doc.lastAutoTable.finalY + 12;

    doc.setFontSize(12);
    doc.text("Stone Analysis", 14, y);

    const stoneRows =
      (analysisByStone || []).map(
        (item) => [
          item?.stone ||
            item?.stone_type ||
            item?.name ||
            item?.value ||
            "Unknown",

          Number(
            item?.orders ||
            item?.order_count ||
            item?.count ||
            0
          ),
        ]
      );

    autoTable(doc, {
      startY: y + 4,
      head: [["Stone", "Orders"]],
      body: stoneRows,
      theme: "grid",
      styles: {
        fontSize: 8,
      },
    });

    // SAVE
    doc.save(
      `Business_Analysis_${fromDate}_to_${toDate}.pdf`
    );

    toast.success(
      "Analysis PDF downloaded successfully"
    );

  } catch (error) {

    console.error(
      "Analysis PDF export error:",
      error
    );

    toast.error(
      "Failed to export analysis PDF"
    );

  }
};


// ======================================================
// WHATSAPP ORDER ANALYSIS
// ======================================================


{/* =====================================================
    AUTOMATIC BUSINESS INSIGHTS
===================================================== */}

{/* =====================================================
    OVERVIEW
===================================================== */}

const toArray = (value) =>
  Array.isArray(value) ? value : [];

const analysisTotalOrders =
  Number(
    analysisData?.overview?.total_orders ??
    analysisData?.total_orders ??
    0
  );

const analysisCustomOrders =
  Number(
    analysisData?.overview?.custom_orders ??
    analysisData?.custom_orders ??
    0
  );

const analysisCatalogueOrders =
  Number(
    analysisData?.overview?.catalogue_orders ??
    analysisData?.catalogue_orders ??
    0
  );

const analysisByStatus =
  toArray(analysisData?.status);

const analysisByCategory =
  toArray(analysisData?.category);

const analysisByCategoryMonthly =
  toArray(analysisData?.category_monthly);

const analysisByProducts =
  toArray(analysisData?.products);

const analysisProductIntelligence =
  analysisData?.product_intelligence || {
    best_sellers: [],
    underperforming: [],
    never_ordered: [],
  };

const analysisByRetailer =
  toArray(analysisData?.retailers);

const analysisByMetal =
  toArray(analysisData?.metal);

const analysisByPurity =
  toArray(analysisData?.purity);

const analysisByGoldKT =
  analysisByPurity;

const analysisByGoldColour =
  toArray(analysisData?.gold_colour);

const analysisByStone =
  toArray(analysisData?.stone);

const analysisByCustomer =
  toArray(analysisData?.customers);

const analysisByDate =
  toArray(
    analysisData?.by_date ??
    analysisData?.daily_trend
  );

const maxAnalysisStatusCount = Math.max(
  ...analysisByStatus.map((item) =>
    Number(item?.count ?? item?.orders ?? item?.order_count ?? 0)
  ),
  1
);

const maxAnalysisDateCount = Math.max(
  ...analysisByDate.map((item) =>
    Number(item?.count ?? item?.orders ?? item?.order_count ?? 0)
  ),
  1
);

const maxAnalysisCustomerCount = Math.max(
  ...analysisByCustomer.map((item) =>
    Number(item?.count ?? item?.orders ?? item?.order_count ?? 0)
  ),
  1
);

const analysisDueDates =
  analysisData?.due_dates || {};

const categoryMonthlyChartData = useMemo(() => {
  const months = analysisByCategoryMonthly || [];

  return months.map((monthData) => {
    const row = {
      month: monthData?.month || "",
    };

    Object.entries(monthData?.categories || {}).forEach(
      ([categoryName, categoryInfo]) => {
        row[categoryName] = Number(
          categoryInfo?.orders || 0
        );
      }
    );

    return row;
  });
}, [analysisByCategoryMonthly]);


// ======================================================
// AUTOMATIC BUSINESS INSIGHTS
// ======================================================

const automaticInsights = useMemo(() => {
  const insights = [];

  // ------------------------------------------
  // 1. TOP CATEGORY
  // ------------------------------------------

  if (analysisByCategory?.length > 0) {
    const sortedCategories = [...analysisByCategory].sort(
      (a, b) =>
        Number(b?.orders || b?.order_count || b?.count || 0) -
        Number(a?.orders || a?.order_count || a?.count || 0)
    );

    const topCategory = sortedCategories[0];

    const categoryName =
      topCategory?.category ||
      topCategory?.name ||
      "Unknown";

    const categoryOrders =
      Number(
        topCategory?.orders ||
        topCategory?.order_count ||
        topCategory?.count ||
        0
      );

    const categoryPercentage =
      Number(
        topCategory?.percentage ||
        topCategory?.order_percentage ||
        0
      );

    if (categoryOrders > 0) {
      insights.push({
        type: "positive",
        text: `${categoryName} is your top category with ${categoryOrders} orders (${categoryPercentage.toFixed(1)}% of total category orders).`,
      });
    }
  }


  // ------------------------------------------
  // 2. TOP PRODUCT
  // ------------------------------------------

  if (analysisByProducts?.length > 0) {
    const sortedProducts = [...analysisByProducts].sort(
      (a, b) =>
        Number(b?.orders || b?.order_count || b?.count || 0) -
        Number(a?.orders || a?.order_count || a?.count || 0)
    );

    const topProduct = sortedProducts[0];

    const productName =
      topProduct?.design_number ||
      topProduct?.product_number ||
      topProduct?.product_name ||
      topProduct?.name ||
      topProduct?.product_id ||
      "Unknown";

    const productOrders =
      Number(
        topProduct?.orders ||
        topProduct?.order_count ||
        topProduct?.count ||
        0
      );

    if (productOrders > 0) {
      insights.push({
        type: "positive",
        text: `${productName} is currently your best-performing design with ${productOrders} orders.`,
      });
    }
  }


  // ------------------------------------------
  // 3. RETAILER
  // ------------------------------------------

  if (analysisByRetailer?.length > 0) {
    const sortedRetailers = [...analysisByRetailer].sort(
      (a, b) =>
        Number(b?.total_orders || 0) -
        Number(a?.total_orders || 0)
    );

    const topRetailer = sortedRetailers[0];

    const retailerName =
      topRetailer?.retailer_name ||
      topRetailer?.name ||
      "Unknown";

    const retailerOrders =
      Number(topRetailer?.total_orders || 0);

    if (retailerOrders > 0) {
      insights.push({
        type: "info",
        text: `${retailerName} is your highest-ordering retailer with ${retailerOrders} orders.`,
      });
    }
  }


  // ------------------------------------------
  // 4. PRODUCT CATALOGUE
  // ------------------------------------------

  const neverOrdered =
    analysisProductIntelligence?.never_ordered?.length || 0;

  if (neverOrdered > 0) {
    insights.push({
      type: "warning",
      text: `${neverOrdered} catalogue design${neverOrdered === 1 ? "" : "s"} have never been ordered.`,
    });
  }


  // ------------------------------------------
  // 5. MONTHLY GROWTH / DECLINE
  // ------------------------------------------

  if (analysisByCategoryMonthly?.length > 0) {
    const latestMonth =
      analysisByCategoryMonthly[
        analysisByCategoryMonthly.length - 1
      ];

    const categories =
      latestMonth?.categories || {};

    const growthCategories = [];
    const declineCategories = [];

    Object.entries(categories).forEach(
      ([categoryName, categoryInfo]) => {
        const growth =
          Number(
            categoryInfo?.growth_percentage || 0
          );

        const status =
          categoryInfo?.growth_status ||
          "unchanged";

        if (status === "growth" && growth > 0) {
          growthCategories.push({
            categoryName,
            growth,
          });
        }

        if (status === "decline" && growth < 0) {
          declineCategories.push({
            categoryName,
            growth,
          });
        }
      }
    );


    if (growthCategories.length > 0) {
      growthCategories.sort(
        (a, b) => b.growth - a.growth
      );

      const strongest =
        growthCategories[0];

      insights.push({
        type: "positive",
        text: `${strongest.categoryName} showed the strongest growth in the latest month at ${strongest.growth.toFixed(1)}%.`,
      });
    }


    if (declineCategories.length > 0) {
      declineCategories.sort(
        (a, b) => a.growth - b.growth
      );

      const weakest =
        declineCategories[0];

      insights.push({
        type: "warning",
        text: `${weakest.categoryName} declined ${Math.abs(weakest.growth).toFixed(1)}% in the latest month.`,
      });
    }
  }


  // ------------------------------------------
  // 6. CHANNEL MIX
  // ------------------------------------------

  const totalOrders =
    Number(
      analysisData?.overview?.total_orders || 0
    );

  const websiteOrders =
    Number(
      analysisData?.overview?.website_orders || 0
    );

  const whatsappOrders =
    Number(
      analysisData?.overview?.whatsapp_orders || 0
    );

  if (totalOrders > 0) {
    const whatsappPercentage =
      (whatsappOrders / totalOrders) * 100;

    const websitePercentage =
      (websiteOrders / totalOrders) * 100;

    if (whatsappPercentage > websitePercentage) {
      insights.push({
        type: "info",
        text: `WhatsApp is currently the larger order channel at ${whatsappPercentage.toFixed(1)}% of total orders.`,
      });
    } else if (websitePercentage > whatsappPercentage) {
      insights.push({
        type: "info",
        text: `Website is currently the larger order channel at ${websitePercentage.toFixed(1)}% of total orders.`,
      });
    }
  }


  return insights.slice(0, 6);

}, [
  analysisByCategory,
  analysisByProducts,
  analysisByRetailer,
  analysisProductIntelligence,
  analysisByCategoryMonthly,
  analysisData,
]);



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

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setSearchParams({ tab: value }, { replace: true })
          }
          className="space-y-6"
        >
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
            <TabsTrigger
  value="collection-images"
  className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0"
  data-testid="admin-collection-images-tab"
>
  <Image className="w-4 h-4" />
  Collection Images
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

<TabsTrigger
  value="analysis"
  onClick={loadWhatsappAnalysis}
  className="gap-2 data-[state=active]:bg-[#359E58] data-[state=active]:text-white rounded-sm shrink-0"
  data-testid="admin-analysis-tab"
>
  <BarChart3 className="w-4 h-4" />
  Analysis
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

{/* Filter buttons */}
<div className="flex gap-2 mb-5 flex-wrap">
  {["all", "pending", "approved"].map((f) => (
    <Button
      key={f}
      variant={retailerFilter === f ? "default" : "outline"}
      size="sm"
      onClick={() => setRetailerFilter(f)}
      className={
        retailerFilter === f
          ? "bg-[#359E58] hover:bg-[#2e884c] text-white"
          : "border-[#E5E7EB]"
      }
    >
      {f.charAt(0).toUpperCase() + f.slice(1)}
    </Button>
  ))}
</div>

{/* Retailer list */}
<div className="space-y-3">

  {retailers.map((r) => (
    <div
      key={r._id}
      onClick={() => setSelectedRetailer(r)}
      className="
        group
        flex flex-col sm:flex-row
        sm:items-center
        justify-between
        p-5
        border border-[#E5E7EB]
        bg-white
        gap-4
        cursor-pointer
        hover:border-[#359E58]
        hover:shadow-md
        transition-all
      "
      data-testid={`retailer-${r._id}`}
    >

      {/* Retailer summary */}
      <div className="min-w-0 flex-1">

        <div className="flex items-center gap-3 mb-2">
          <p className="font-medium text-[#0A0A0A] font-body text-base">
            {r.name || "-"}
          </p>

          <span
            className={
              r.approved
                ? "text-xs bg-[#359E58]/10 text-[#359E58] px-2.5 py-1 font-body font-medium"
                : "text-xs bg-yellow-50 text-yellow-700 px-2.5 py-1 font-body font-medium"
            }
          >
            {r.approved ? "Approved" : "Pending"}
          </span>
        </div>

        <p className="text-sm text-[#4B5563] font-body mb-1">
          {r.business_name || "-"}
        </p>

        <p className="text-xs text-[#6B7280] font-body">
          {r.email || "-"} &nbsp;|&nbsp; {r.phone || "-"}
        </p>

        <p className="text-xs text-[#6B7280] font-body mt-1">
          {r.city || "-"}, {r.state || "-"} &nbsp;|&nbsp; GST: {r.gst_number || "-"}
        </p>

        <p className="text-xs text-[#359E58] font-body mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view complete details →
        </p>

      </div>

      {/* Actions */}
      <div
        className="flex gap-2 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >

        {!r.approved ? (
          <>
            <Button
              size="sm"
              onClick={() => approveRetailer(r._id)}
              className="bg-[#359E58] hover:bg-[#2e884c] text-white gap-1"
              data-testid={`admin-approve-${r._id}`}
            >
              <Check className="w-3 h-3" />
              Approve
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => rejectRetailer(r._id)}
              className="border-red-300 text-red-500 gap-1"
              data-testid={`admin-reject-${r._id}`}
            >
              <X className="w-3 h-3" />
              Reject
            </Button>
          </>
                ) : (
                  <>
                    <span className="text-xs bg-[#359E58]/10 text-[#359E58] px-3 py-2 font-body font-medium">
                      Approved
                    </span>
        
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeRetailer(r._id, r.name)}
                      className="border-red-300 text-red-500 hover:bg-red-50 gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remove
                    </Button>
                  </>
                )}

      </div>

    </div>
  ))}

  {retailers.length === 0 && (
    <p className="text-[#4B5563] text-sm py-8 text-center font-body">
      No retailers found
    </p>
  )}

</div>

</TabsContent>

{/* Retailer Details Popup */}
{selectedRetailer && (
  <div
    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onClick={() => setSelectedRetailer(null)}
  >
    <div
      className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Header */}
      <div className="flex items-start justify-between px-6 py-5 border-b border-[#E5E7EB]">

        <div>
          <h2 className="text-xl font-semibold text-[#0A0A0A] font-heading">
            Retailer Details
          </h2>

          <p className="text-sm text-[#6B7280] mt-1 font-body">
            Complete retailer application information
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedRetailer(null)}
          className="text-2xl text-gray-400 hover:text-black leading-none"
          aria-label="Close"
        >
          ×
        </button>

      </div>


      {/* Content */}
      <div className="p-6 space-y-7">

        {/* Personal Information */}
        <section>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#359E58] mb-4">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Full Name
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Contact Number
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.phone || "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-gray-500 mb-1">
                Email
              </p>
              <p className="text-sm font-medium text-[#0A0A0A] break-all">
                {selectedRetailer.email || "-"}
              </p>
            </div>

          </div>

        </section>


        {/* Business Information */}
        <section>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#359E58] mb-4">
            Business Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Business Name
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.business_name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                GST Number
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.gst_number || "-"}
              </p>
            </div>

          </div>

        </section>


        {/* Business Address */}
        <section>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#359E58] mb-4">
            Business Address
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <div>
              <p className="text-xs text-gray-500 mb-1">
                State
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.state || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                City
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.city || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Pincode
              </p>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.pincode || "-"}
              </p>
            </div>

            <div className="sm:col-span-3">
              <p className="text-xs text-gray-500 mb-1">
                Complete Business Address
              </p>

              <div className="bg-gray-50 border border-[#E5E7EB] p-4 rounded-md">
                <p className="text-sm text-[#0A0A0A] leading-relaxed">
                  {selectedRetailer.business_address || "-"}
                </p>
              </div>
            </div>

          </div>

        </section>


        {/* Application Information */}
        <section>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#359E58] mb-4">
            Application Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Application Status
              </p>

              <span
                className={
                  selectedRetailer.approved
                    ? "inline-flex text-xs bg-[#359E58]/10 text-[#359E58] px-3 py-1.5 font-medium"
                    : "inline-flex text-xs bg-yellow-50 text-yellow-700 px-3 py-1.5 font-medium"
                }
              >
                {selectedRetailer.approved ? "Approved" : "Pending Approval"}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">
                Applied On
              </p>

              <p className="text-sm font-medium text-[#0A0A0A]">
                {selectedRetailer.created_at
                  ? new Date(selectedRetailer.created_at).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"
                }
              </p>
            </div>

          </div>

        </section>

      </div>


      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB] bg-gray-50">

        {!selectedRetailer.approved && (
          <>
            <Button
              onClick={async () => {
                await approveRetailer(selectedRetailer._id);
                setSelectedRetailer(null);
              }}
              className="bg-[#359E58] hover:bg-[#2e884c] text-white gap-2"
            >
              <Check className="w-4 h-4" />
              Approve Retailer
            </Button>

            <Button
              variant="outline"
              onClick={async () => {
                await rejectRetailer(selectedRetailer._id);
                setSelectedRetailer(null);
              }}
              className="border-red-300 text-red-500 hover:bg-red-50 gap-2"
            >
              <X className="w-4 h-4" />
              Reject Retailer
            </Button>
          </>
        )}

        <Button
          variant="outline"
          onClick={() => setSelectedRetailer(null)}
          className="border-[#E5E7EB]"
        >
          Close
        </Button>

      </div>

    </div>
  </div>
)}

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
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Product Images</Label>

                  <label className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] hover:border-[#4AB868] transition-colors cursor-pointer p-6 bg-white" data-testid="admin-product-file-upload">
                    <FileUp className="w-6 h-6 text-[#4B5563] mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-[#4B5563] font-body">
                      {uploading ? "Uploading..." : "Click to select images"}
                    </p>
                    <p className="text-xs text-gray-400 font-body mt-1">
                      Up to 5 at a time &middot; JPG, PNG, WebP, MP4, MOV (max 100MB each)
                    </p>
                    <input type="file" multiple className="hidden" onChange={handleFileSelect} disabled={uploading}
                      accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.mp4,.mov,.webm,.m4v" data-testid="admin-product-file-input" />
                  </label>

                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 border border-[#6CC284]/30 bg-white p-3">
                          <Image className="w-5 h-5 text-[#359E58] shrink-0" strokeWidth={1.5} />
                          <span className="text-sm text-[#0A0A0A] font-body flex-1 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => setSelectedFiles((prev) => prev.filter((_, i) => i !== index))}
                            className="text-[#4B5563] hover:text-red-500 p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
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
                  setProductDetails(p.product_details || {});
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


          {/* Collection Images */}
<TabsContent value="collection-images">
  <div className="space-y-6">

    <div>
      <h2 className="text-2xl font-semibold text-[#0A0A0A]">
        Collection Images
      </h2>

      <p className="text-sm text-[#4B5563] font-body mt-1">
        Manage the 17 category images displayed on the Our Collection page.
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {categoryImages.map((category) => (

        <div
          key={category.slug}
          className="border border-[#E5E7EB] bg-white rounded-lg overflow-hidden"
        >

          {/* Image */}
          <div className="aspect-square bg-[#FAFAFA] overflow-hidden">

            {category.image ? (
              <img
                src={
                  category.image.startsWith("/api/")
                    ? `${process.env.REACT_APP_BACKEND_URL}${category.image}`
                    : category.image
                }
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                No Image
              </div>
            )}

          </div>

          {/* Details */}
          <div className="p-4">

            <h3 className="font-medium text-[#0A0A0A]">
              {category.name}
            </h3>

            <p className="text-xs text-gray-500 mt-1">
              {category.custom_image
                ? "Custom image"
                : "Default image"}
            </p>

            <div className="flex gap-2 mt-4">

              {/* Replace / Upload */}
              <label
                className={`flex-1 cursor-pointer text-center px-3 py-2 rounded-md text-sm text-white ${
                  categoryImageUploading
                    ? "bg-gray-400"
                    : "bg-[#359E58] hover:bg-[#2e884c]"
                }`}
              >

                {category.custom_image
                  ? "Replace"
                  : "Upload"}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={categoryImageUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) {
                      uploadCategoryImage(
                        category.slug,
                        file
                      );
                    }

                    e.target.value = "";
                  }}
                />

              </label>

              {/* Delete custom image */}
              {category.custom_image && (
                <button
                  type="button"
                  onClick={() =>
                    deleteCategoryImage(category.slug)
                  }
                  disabled={categoryImageUploading}
                  className="px-3 py-2 rounded-md border border-red-200 text-red-500 hover:bg-red-50 text-sm"
                >
                  Delete
                </button>
              )}

            </div>

          </div>

        </div>

      ))}

    </div>

  </div>
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

  {customisations.map((c) => (

    <div
      key={c.custom_id}
      onClick={() => setSelectedCustomisation(c)}
      className="border border-[#E5E7EB] bg-white rounded-xl p-4 sm:p-5 cursor-pointer hover:border-[#359E58] hover:shadow-md transition-all group"
      data-testid={`custom-${c.custom_id}`}
    >

      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <p className="font-medium text-[#0A0A0A] font-body">
              {c.custom_id}
            </p>

            <span
              className={
                c.channel === "WhatsApp"
                  ? "text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700"
                  : "text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700"
              }
            >
              {c.channel || "Website"}
            </span>

          </div>

          <p className="text-xs text-[#4B5563] font-body mt-1">
            {c.customer_name || c.user_name || "Customer"}
          </p>

          <p className="text-xs text-gray-500 font-body">
            {c.user_email}
          </p>

          <p className="text-xs text-gray-500 font-body">
            {c.customer_whatsapp || c.user_phone}
          </p>

        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            deleteCustomisation(c.custom_id);
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm shrink-0"
        >
          Delete
        </button>

      </div>

      <div className="p-3 bg-[#FAFAFA] rounded-lg text-sm">

        <p className="font-medium font-body truncate">
          {displayValue("product_category", c.product_category) || "Customisation Request"}
        </p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">

          {c.metal && (
            <span className="text-xs text-[#4B5563] font-body">
              metal: {displayValue("metal", c.metal)}
            </span>
          )}

          {c.gold_kt && (
            <span className="text-xs text-[#4B5563] font-body">
              purity: {displayValue("gold_kt", c.gold_kt)}
            </span>
          )}

          {c.stone_type && (
            <span className="text-xs text-[#4B5563] font-body">
              stone: {displayValue("stone_type", c.stone_type)}
            </span>
          )}

          {c.finish_type && (
            <span className="text-xs text-[#4B5563] font-body">
              finish: {displayValue("finish_type", c.finish_type)}
            </span>
          )}

          {c.approx_weight && (
            <span className="text-xs text-[#4B5563] font-body">
              weight: {c.approx_weight}
            </span>
          )}

          {c.due_date && (
            <span className="text-xs text-[#4B5563] font-body">
              due: {c.due_date}
            </span>
          )}

        </div>

      </div>

      <div className="flex items-center justify-between mt-2">

        <p className="text-xs text-gray-400 font-body">
          {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
        </p>

        <p className="text-xs text-[#359E58] font-body opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view complete details
        </p>

      </div>

    </div>

  ))}

  {customisations.length === 0 && (
    <p className="text-[#4B5563] text-sm py-12 text-center font-body">
      No customisation requests yet
    </p>
  )}

</div>

</TabsContent>

{/* Customisation Details Popup */}
{selectedCustomisation && (

<div
className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
onClick={() => setSelectedCustomisation(null)}
>

<div
className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
onClick={(e) => e.stopPropagation()}
>

{/* HEADER */}
<div className="flex items-start justify-between px-6 py-5 border-b">

<div>

<div className="flex flex-wrap items-center gap-2">

<h2 className="text-xl font-semibold text-[#0A0A0A]">
  Customisation Request
</h2>

<span
  className={
    selectedCustomisation.channel === "WhatsApp"
      ? "text-xs px-2 py-1 rounded-full bg-green-50 text-green-700"
      : "text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700"
  }
>
  {selectedCustomisation.channel || "Website"}
</span>

<span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full">
  {selectedCustomisation.status || "Pending"}
</span>

</div>

<p className="text-sm text-[#4B5563] mt-1">
{selectedCustomisation.custom_id}
</p>

</div>

<button
type="button"
onClick={() => setSelectedCustomisation(null)}
className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-black text-xl leading-none"
>
X
</button>

</div>

{/* CUSTOMER AND ORDER DETAILS */}
<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
Customer & Order Details
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Customer Name
</p>
<p className="text-sm text-gray-700 mt-1">
  {selectedCustomisation.customer_name ||
    selectedCustomisation.user_name ||
    "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  WhatsApp / Phone
</p>
<p className="text-sm text-gray-700 mt-1">
  {selectedCustomisation.customer_whatsapp ||
    selectedCustomisation.user_phone ||
    "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Email
</p>
<p className="text-sm text-gray-700 mt-1 break-all">
  {selectedCustomisation.user_email || "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Product Category
</p>
<p className="text-sm text-gray-700 mt-1">
  {displayValue(
    "product_category",
    selectedCustomisation.product_category
  ) || "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Order Date
</p>
<p className="text-sm text-gray-700 mt-1">
  {selectedCustomisation.order_date || "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Due Date
</p>
<p className="text-sm text-gray-700 mt-1">
  {selectedCustomisation.due_date || "-"}
</p>
</div>

<div>
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Party Reference Order ID
</p>
<p className="text-sm text-gray-700 mt-1">
  {selectedCustomisation.party_reference_order_id || "-"}
</p>
</div>

</div>

</div>

{["metal", "gold_kt", "gold_colour", "gold_colour_other", "platinum_purity", "metal_colour_platinum", "metal_purity_combo", "metal_colour_combo"].some(
(f) => selectedCustomisation[f]
) && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
  Metal Details
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

  {[
    ["Metal", "metal"],
    ["Gold Purity", "gold_kt"],
    ["Gold Colour", "gold_colour"],
    ["Other Gold Colour", "gold_colour_other"],
    ["Platinum Purity", "platinum_purity"],
    ["Platinum Colour", "metal_colour_platinum"],
    ["Metal Purity", "metal_purity_combo"],
    ["Metal Colour", "metal_colour_combo"],
  ]
    .filter((pair) => selectedCustomisation[pair[1]])
    .map((pair) => (

      <div key={pair[1]}>

        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {pair[0]}
        </p>

        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
          {displayValue(pair[1], selectedCustomisation[pair[1]])}
        </p>

      </div>

    ))}

</div>

</div>
)}

{["bali_size", "bangle_kada_size1", "bangle_kada_size2", "bracelet_size", "need_multilayer", "multilayer_chain_size", "chain_size", "cufflink_size", "brooch_size", "earring_size", "haathpaan_size", "maang_tikka_size", "mangalsutra_size", "necklace_size", "nose_pin_size", "pendant_chain_size", "pendant_size_optional", "ring_size", "tops_size", "watch_belt_size", "full_set_choice_1", "full_set_chain_size", "full_set_necklace_size", "full_set_choice_2", "full_set_tops_size", "full_set_earring_size", "approx_weight"].some(
(f) => selectedCustomisation[f]
) && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
  Product Specifications
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

  {[
    ["Bali Size", "bali_size"],
    ["Bangle/Kada Size 1", "bangle_kada_size1"],
    ["Bangle/Kada Size 2", "bangle_kada_size2"],
    ["Bracelet Size", "bracelet_size"],
    ["Need Multilayer", "need_multilayer"],
    ["Multilayer Chain Size", "multilayer_chain_size"],
    ["Chain Size", "chain_size"],
    ["Cufflink Size", "cufflink_size"],
    ["Brooch Size", "brooch_size"],
    ["Earring Size", "earring_size"],
    ["Haathpaan Size", "haathpaan_size"],
    ["Maang Tikka Size", "maang_tikka_size"],
    ["Mangal Sutra Size", "mangalsutra_size"],
    ["Necklace Size", "necklace_size"],
    ["Nose Pin Size", "nose_pin_size"],
    ["Pendant Chain Size", "pendant_chain_size"],
    ["Pendant Size", "pendant_size_optional"],
    ["Ring Size", "ring_size"],
    ["Tops Size", "tops_size"],
    ["Watch Belt Size", "watch_belt_size"],
    ["Full Set - Chain / Necklace", "full_set_choice_1"],
    ["Full Set Chain Size", "full_set_chain_size"],
    ["Full Set Necklace Size", "full_set_necklace_size"],
    ["Full Set - Tops / Earring", "full_set_choice_2"],
    ["Full Set Tops Size", "full_set_tops_size"],
    ["Full Set Earring Size", "full_set_earring_size"],
    ["Weight (g)", "approx_weight"],
  ]
    .filter((pair) => selectedCustomisation[pair[1]])
    .map((pair) => (

      <div key={pair[1]}>

        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {pair[0]}
        </p>

        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
          {displayValue(pair[1], selectedCustomisation[pair[1]])}
        </p>

      </div>

    ))}

</div>

</div>
)}

{["stone_type", "stone_type_other", "finish_type", "finish_type_other", "hallmark_required", "need_call"].some(
(f) => selectedCustomisation[f]
) && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
  Stone &amp; Finish
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

  {[
    ["Stone Type", "stone_type"],
    ["Other Stone", "stone_type_other"],
    ["Finish Type", "finish_type"],
    ["Other Finish", "finish_type_other"],
    ["Hallmark Required", "hallmark_required"],
    ["Call Required", "need_call"],
  ]
    .filter((pair) => selectedCustomisation[pair[1]])
    .map((pair) => (

      <div key={pair[1]}>

        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {pair[0]}
        </p>

        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
          {displayValue(pair[1], selectedCustomisation[pair[1]])}
        </p>

      </div>

    ))}

</div>

</div>
)}

{["metal_type", "stone_changes", "size_changes", "reference_description"].some(
(f) => selectedCustomisation[f]
) && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
  Customisation Details
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

  {[
    ["Metal Type", "metal_type"],
    ["Stone Changes", "stone_changes"],
    ["Size Changes", "size_changes"],
    ["Reference Description", "reference_description"],
  ]
    .filter((pair) => selectedCustomisation[pair[1]])
    .map((pair) => (

      <div key={pair[1]}>

        <p className="text-xs text-gray-400 uppercase tracking-wider">
          {pair[0]}
        </p>

        <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
          {displayValue(pair[1], selectedCustomisation[pair[1]])}
        </p>

      </div>

    ))}

</div>

</div>
)}

{/* REMARKS AND NOTES */}
{(selectedCustomisation.remarks ||
selectedCustomisation.special_notes ||
selectedCustomisation.reference_link) && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
Additional Information
</h3>

{selectedCustomisation.remarks && (
<div className="mb-5">
  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
    Remarks
  </p>
  <div className="bg-[#FAFAFA] border border-gray-100 rounded-lg p-4">
    <p className="text-sm text-[#374151] whitespace-pre-wrap">
      {selectedCustomisation.remarks}
    </p>
  </div>
</div>
)}

{selectedCustomisation.special_notes && (
<div className="mb-5">
  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
    Special Notes
  </p>
  <div className="bg-[#FAFAFA] border border-gray-100 rounded-lg p-4">
    <p className="text-sm text-[#374151] whitespace-pre-wrap">
      {selectedCustomisation.special_notes}
    </p>
  </div>
</div>
)}

{selectedCustomisation.reference_link && (
<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
    Reference Link
  </p>
  <a
    href={selectedCustomisation.reference_link}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-[#359E58] hover:underline break-all"
  >
    {selectedCustomisation.reference_link}
  </a>
</div>
)}

</div>
)}

{/* ATTACHED FILE */}
{selectedCustomisation.file_name && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-4">
Attached File
</h3>

<button
type="button"
onClick={() =>
  downloadCustomisationFile(
    selectedCustomisation.file_url,
    selectedCustomisation.file_name
  )
}
className="w-full flex items-center gap-3 bg-[#359E58]/5 border border-[#359E58]/20 rounded-lg p-4 hover:bg-[#359E58]/10 transition-colors text-left"
>

<FileUp className="w-5 h-5 text-[#359E58] shrink-0" />

<div className="flex-1 min-w-0">
  <p className="text-sm font-medium text-[#359E58] truncate">
    {selectedCustomisation.file_name}
  </p>
  <p className="text-xs text-gray-500 mt-1">
    Click to download file
  </p>
</div>

<span className="text-sm font-medium text-[#359E58]">
  Download
</span>

</button>

</div>
)}

{/* REFERENCE IMAGES */}
{Array.isArray(selectedCustomisation.design_images) &&
selectedCustomisation.design_images.length > 0 && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-4">
Reference Images
</h3>

<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

{selectedCustomisation.design_images.map((image, index) => (

  <a
    key={index}
    href={typeof image === "string" ? image : image.url}
    target="_blank"
    rel="noopener noreferrer"
    className="block border border-[#E5E7EB] rounded-lg overflow-hidden bg-gray-50"
  >
    <img
      src={typeof image === "string" ? image : image.url}
      alt={`Reference ${index + 1}`}
      className="w-full h-40 object-cover hover:scale-105 transition-transform"
    />
    <p className="text-xs text-gray-500 p-2">
      Reference {index + 1}
    </p>
  </a>

))}

</div>

</div>
)}

{/* RETAILER DETAILS */}
{selectedCustomisation.retailer && (

<div className="p-6 border-b">

<h3 className="text-base font-semibold mb-5">
Retailer Details
</h3>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    Business Name
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.business_name || "-"}
  </p>
</div>

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    GST Number
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.gst_number || "-"}
  </p>
</div>

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    Contact Number
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.phone || "-"}
  </p>
</div>

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    City
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.city || "-"}
  </p>
</div>

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    State
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.state || "-"}
  </p>
</div>

<div>
  <p className="text-xs text-gray-400 uppercase tracking-wider">
    Pincode
  </p>
  <p className="text-sm text-gray-700 mt-1">
    {selectedCustomisation.retailer.pincode || "-"}
  </p>
</div>

</div>

<div className="mt-5">
<p className="text-xs text-gray-400 uppercase tracking-wider">
  Business Address
</p>
<p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
  {selectedCustomisation.retailer.business_address || "-"}
</p>
</div>

</div>
)}

{/* FOOTER */}
<div className="px-6 py-4 bg-[#FAFAFA] flex flex-col sm:flex-row justify-between items-center gap-3">

<p className="text-xs text-gray-500">
Submitted:{" "}
<span className="font-medium text-gray-700">
{selectedCustomisation.created_at
  ? new Date(selectedCustomisation.created_at).toLocaleString()
  : "-"}
</span>
</p>

<button
type="button"
onClick={() => setSelectedCustomisation(null)}
className="px-5 py-2 bg-[#359E58] text-white rounded-lg hover:bg-[#2e8b4d] text-sm"
>
Close
</button>

</div>

</div>

</div>
)}
          <TabsContent value="whatsapp">
          <div className="space-y-4">

<div className="grid grid-cols-2 lg:grid-cols-8 gap-4">

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
    onClick={() => setStatusFilter("Normal")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Normal"
            ? "bg-blue-200 border-blue-600"
            : "bg-blue-50"
    }`}
>
    <p className="text-xs text-gray-500">Normal</p>
    <h2 className="text-3xl font-bold text-blue-700">
        {
            whatsappOrders.filter(
                o => (o.priority || "Normal") === "Normal"
            ).length
        }
    </h2>
</div>

<div
    onClick={() => setStatusFilter("Urgent")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Urgent"
            ? "bg-red-200 border-red-600"
            : "bg-red-50"
    }`}
>
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
    onClick={() => setStatusFilter("Approved")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Approved"
            ? "bg-green-200 border-green-600"
            : "bg-green-50"
    }`}
>
    <p className="text-xs text-gray-500">Approved</p>
    <h2 className="text-3xl font-bold text-green-700">
        {
            whatsappOrders.filter(
                o => o.status === "Approved"
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
    <p className="text-xs text-gray-500">In Production</p>
    <h2 className="text-3xl font-bold text-purple-700">
        {
            whatsappOrders.filter(
                o => o.status === "In Production"
            ).length
        }
    </h2>
</div>


<div
    onClick={() => setStatusFilter("Ready")}
    className={`border rounded-lg p-4 text-center cursor-pointer transition hover:shadow-md ${
        statusFilter === "Ready"
            ? "bg-orange-200 border-orange-600"
            : "bg-orange-50"
    }`}
>
    <p className="text-xs text-gray-500">Ready</p>
    <h2 className="text-3xl font-bold text-orange-700">
        {
            whatsappOrders.filter(
                o => o.status === "Ready"
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
    <p className="text-xs text-gray-500">Delivered</p>
    <h2 className="text-3xl font-bold text-green-700">
        {
            whatsappOrders.filter(
                o => o.status === "Delivered"
            ).length
        }
    </h2>
</div>



</div>

{statusFilter === "Urgent" && (
    <div className="flex flex-col sm:flex-row gap-3 items-end bg-red-50 border border-red-200 rounded-lg p-4">
        
        <div>
            <label className="block text-xs text-gray-600 mb-1">
                From Date
            </label>
            <input
                type="date"
                value={urgentFromDate}
                onChange={(e) => setUrgentFromDate(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white"
            />
        </div>

        <div>
            <label className="block text-xs text-gray-600 mb-1">
                To Date
            </label>
            <input
                type="date"
                value={urgentToDate}
                onChange={(e) => setUrgentToDate(e.target.value)}
                className="border rounded-md px-3 py-2 bg-white"
            />
        </div>

        <button
            type="button"
            onClick={() => {
                setUrgentFromDate("");
                setUrgentToDate("");
            }}
            className="border rounded-md px-4 py-2 bg-white hover:bg-gray-50"
        >
            Clear Dates
        </button>

    </div>
)}

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



</div>

{filteredOrders.map((order) => (

<div
    key={order.orderId}
    onClick={() => navigate(`/admin/whatsapp-orders/${order.orderId}`)}
        className="border border-[#E5E7EB] bg-white px-5 py-3 rounded-sm hover:border-[#359E58] hover:shadow-md transition-all relative cursor-pointer"
>

<div className="flex justify-between items-start mb-2">

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

<div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2 text-sm">

<div>
  <strong>Customer</strong><br />
  {order.customer_name}
</div>

<div>
  <strong>Product</strong><br />
  {displayValue("product_category", order.product_category)}
</div>

<div>
  <strong>Metal</strong><br />
  {displayValue("metal", order.metal)}
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
    className={`inline-block mt-0.5 px-3 py-1 rounded-full text-xs font-semibold ${
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

{/* =====================================================
    ANALYSIS
===================================================== */}

<TabsContent value="analysis">

  <div className="space-y-4">

    {/* ============================================================
        HEADER  +  FILTERS  +  EXPORT
    ============================================================ */}

    <div className="bg-white border border-[#E5E7EB] rounded-lg">

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">

        <div>
          <h2 className="font-heading font-semibold text-lg text-[#0A0A0A]">
            Business Analysis
          </h2>
          <p className="text-xs text-gray-500">
            {analysisFromDate || analysisToDate
              ? `${analysisFromDate || "start"} to ${analysisToDate || "today"}`
              : "All time"}
            {" · "}
            {analysisChannel === "all" ? "Website + WhatsApp" : analysisChannel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          <button
            type="button"
            onClick={() => setShowAnalysisFilters(!showAnalysisFilters)}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Filters {showAnalysisFilters ? "▲" : "▼"}
          </button>

          <button
            type="button"
            onClick={exportAnalysisCSV}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            CSV
          </button>

          <button
            type="button"
            onClick={exportAnalysisExcel}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={exportAnalysisPDF}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            PDF
          </button>

          <button
            type="button"
            onClick={loadWhatsappAnalysis}
            className="bg-[#359E58] hover:bg-[#2e884c] text-white px-3 py-1.5 rounded-md text-sm"
          >
            Refresh
          </button>

        </div>

      </div>

      {showAnalysisFilters && (

        <div className="border-t border-[#E5E7EB] px-4 py-3">

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">

            <select
              value={analysisChannel}
              onChange={(e) => setAnalysisChannel(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">Website + WhatsApp</option>
              <option value="website">Website only</option>
              <option value="whatsapp">WhatsApp only</option>
            </select>

            <select
              value={analysisRetailer}
              onChange={(e) => setAnalysisRetailer(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Retailers</option>
              {(analysisData?.retailers || []).map((r) => (
                <option
                  key={r.retailer_id || r.retailer_name}
                  value={r.retailer_id || r.retailer_name}
                >
                  {r.retailer_name || "Unknown"}
                </option>
              ))}
            </select>

            <select
              value={analysisCategory}
              onChange={(e) => setAnalysisCategory(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Categories</option>
              {(analysisData?.categories || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={analysisProduct}
              onChange={(e) => setAnalysisProduct(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Designs</option>
              {(analysisData?.products || []).map((p) => {
                const id = p.product_id || p.design_number;
                return (
                  <option key={id} value={id}>
                    {p.design_number || p.product_id}
                  </option>
                );
              })}
            </select>

            <select
              value={analysisOrderType}
              onChange={(e) => setAnalysisOrderType(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">Custom + Stock</option>
              <option value="custom">Custom only</option>
              <option value="stock">Stock only</option>
            </select>

            <select
              value={analysisMetal}
              onChange={(e) => setAnalysisMetal(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Metals</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="gold_platinum">Gold + Platinum</option>
            </select>

            <select
              value={analysisPurity}
              onChange={(e) => setAnalysisPurity(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Purity</option>
              <option value="24kt">24KT</option>
              <option value="22kt">22KT</option>
              <option value="18kt">18KT</option>
              <option value="14kt">14KT</option>
              <option value="9kt">9KT</option>
            </select>

            <select
              value={analysisStone}
              onChange={(e) => setAnalysisStone(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 bg-white text-sm"
            >
              <option value="all">All Stones</option>
              <option value="Natural Diamond">Natural Diamond</option>
              <option value="Lab Grown Diamond">Lab Grown Diamond</option>
              <option value="CZ">CZ</option>
              <option value="Colour Stone">Colour Stone</option>
              <option value="Precious Stone">Precious Stone</option>
            </select>

            <input
              type="date"
              value={analysisFromDate}
              onChange={(e) => setAnalysisFromDate(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white"
            />

            <input
              type="date"
              value={analysisToDate}
              onChange={(e) => setAnalysisToDate(e.target.value)}
              className="border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white"
            />

          </div>

          <button
            type="button"
            onClick={() => {
              setAnalysisChannel("all");
              setAnalysisRetailer("all");
              setAnalysisCategory("all");
              setAnalysisProduct("all");
              setAnalysisOrderType("all");
              setAnalysisMetal("all");
              setAnalysisPurity("all");
              setAnalysisStone("all");
              setAnalysisFromDate("");
              setAnalysisToDate("");
            }}
            className="mt-2 text-xs text-gray-500 hover:text-[#359E58]"
          >
            Clear all filters
          </button>

        </div>
      )}

    </div>


    {/* ============================================================
        KPI STRIP
    ============================================================ */}

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">

      {[
        ["Orders", analysisData?.overview?.total_orders || 0],
        ["Website", analysisData?.overview?.website_orders || 0],
        ["WhatsApp", analysisData?.overview?.whatsapp_orders || 0],
        ["Custom", analysisData?.overview?.custom_orders || 0],
        ["Stock", analysisData?.overview?.catalogue_orders || 0],
        ["Orders / day", analysisData?.overview?.average_orders_per_day || 0],
      ].map(([label, value]) => (
        <div key={label} className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-2">
          <p className="text-[11px] text-gray-500 truncate">{label}</p>
          <p className="text-xl font-semibold text-[#111827] leading-tight">{value}</p>
        </div>
      ))}

    </div>


    {/* ============================================================
        INSIGHTS  (collapsed to 2 lines)
    ============================================================ */}

    {automaticInsights.length > 0 && (

      <div className="bg-white border border-[#E5E7EB] rounded-lg px-4 py-3">

        <div className="space-y-1.5">
          {(showAllInsights
            ? automaticInsights
            : automaticInsights.slice(0, 2)
          ).map((insight, index) => (
            <div key={index} className="flex items-start gap-2">
              <span
                className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                  insight.type === "positive"
                    ? "bg-[#359E58]"
                    : insight.type === "warning"
                    ? "bg-red-500"
                    : "bg-[#2563EB]"
                }`}
              />
              <p className="text-sm text-gray-700 leading-snug">{insight.text}</p>
            </div>
          ))}
        </div>

        {automaticInsights.length > 2 && (
          <button
            type="button"
            onClick={() => setShowAllInsights(!showAllInsights)}
            className="mt-2 text-xs text-[#359E58] hover:underline"
          >
            {showAllInsights
              ? "Show less"
              : `Show ${automaticInsights.length - 2} more insights`}
          </button>
        )}

      </div>
    )}


    {/* ============================================================
        SUB-TAB NAV
    ============================================================ */}

    <div className="flex gap-1 border-b border-[#E5E7EB] overflow-x-auto no-scrollbar">

      {[
        ["overview", "Overview"],
        ["categories", "Categories"],
        ["products", "Products"],
        ["retailers", "Retailers"],
        ["materials", "Metal & Stone"],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setAnalysisView(key)}
          className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px transition ${
            analysisView === key
              ? "border-[#359E58] text-[#359E58] font-medium"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          {label}
        </button>
      ))}

    </div>


    {/* ============================================================
        OVERVIEW
    ============================================================ */}

    {analysisView === "overview" && (

      <div className="space-y-4">

        {/* ORDER TREND */}
        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

          <h3 className="font-medium text-sm mb-3">Order Trend</h3>

          {analysisByDate.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">
              No order data for this period.
            </p>
          ) : (
            <div className="w-full h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analysisByDate.map((d) => ({
                    date: String(d.date).slice(5),
                    orders: Number(d.count || 0),
                  }))}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EF" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="#359E58"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 0, fill: "#359E58" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* STATUS */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

            <h3 className="font-medium text-sm mb-3">Orders by Status</h3>

            {analysisByStatus.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              <div className="space-y-2">
                {analysisByStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 w-28 truncate">{item.name}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#359E58] rounded-full"
                        style={{ width: `${(item.count / maxAnalysisStatusCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-6 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

          {/* DUE DATES */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

            <h3 className="font-medium text-sm mb-3">Due Dates</h3>

            <div className="space-y-2">
              {[
                ["Due this week", "due_this_week"],
                ["Due next week", "due_next_week"],
                ["Overdue", "overdue"],
                ["Completed on time", "completed_on_time"],
                ["Delayed", "delayed"],
              ].map(([label, key]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{label}</span>
                  <span
                    className={`text-sm font-semibold ${
                      (key === "overdue" || key === "delayed") &&
                      Number(analysisDueDates?.[key] || 0) > 0
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {Number(analysisDueDates?.[key] || 0)}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* TOP CUSTOMERS */}
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

            <h3 className="font-medium text-sm mb-3">Top Customers</h3>

            {analysisByCustomer.length === 0 ? (
              <p className="text-sm text-gray-500">No data.</p>
            ) : (
              <div className="space-y-2">
                {analysisByCustomer.slice(0, 5).map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-4">{index + 1}</span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
                    <span className="text-sm font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    )}


    {/* ============================================================
        CATEGORIES
    ============================================================ */}

    {analysisView === "categories" && (

      <div className="space-y-4">

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

          <h3 className="font-medium text-sm mb-1">Category Performance</h3>
          <p className="text-xs text-gray-500 mb-3">
            Click a category to see its designs
          </p>

          {analysisByCategory.length === 0 ? (
            <p className="text-sm text-gray-500">No category data.</p>
          ) : (
            <div className="space-y-1">

              {[...analysisByCategory]
                .sort((a, b) => Number(b.count || 0) - Number(a.count || 0))
                .map((item) => {

                  const drilldown =
                    (analysisData?.category_product_drilldown || {})[item.name] || [];

                  const isOpen = expandedAnalysisCategory === item.name;

                  return (
                    <div key={item.name} className="border-b border-gray-50 last:border-0">

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedAnalysisCategory(isOpen ? null : item.name)
                        }
                        className="w-full flex items-center gap-3 py-2 text-left hover:bg-gray-50 rounded px-1"
                      >
                        <span className="text-sm text-gray-800 w-40 truncate">
                          {item.name}
                        </span>

                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#359E58] rounded-full"
                            style={{
                              width: `${Math.min(Math.max(Number(item.percentage || 0), 0), 100)}%`,
                            }}
                          />
                        </div>

                        <span className="text-xs text-gray-500 w-12 text-right">
                          {Number(item.percentage || 0).toFixed(0)}%
                        </span>

                        <span className="text-sm font-semibold w-8 text-right">
                          {item.count}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pl-4 pb-3">
                          {drilldown.length === 0 ? (
                            <p className="text-xs text-gray-400 py-2">
                              No design-level data for this category.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1">
                              {drilldown.slice(0, 12).map((p, i) => (
                                <div
                                  key={`${item.name}-${i}`}
                                  className="flex justify-between text-xs"
                                >
                                  <span className="truncate text-gray-600">
                                    {p.design_number || p.product_id}
                                  </span>
                                  <span className="font-medium">{p.orders}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}

            </div>
          )}

        </div>

        {/* MONTHLY TREND */}
        {categoryMonthlyChartData.length > 0 && (

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-medium text-sm">Category Orders Over Time</h3>
              <span className="text-xs text-gray-500">
                {selectedAnalysisCategories.length === 0
                  ? "Showing top 5"
                  : `${selectedAnalysisCategories.length} selected`}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">

              <button
                type="button"
                onClick={() => setSelectedAnalysisCategories([])}
                className="px-2 py-1 rounded-full text-[11px] border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400"
              >
                Reset
              </button>

              {analysisByCategory.slice(0, 10).map((c) => {
                const name = c?.name;
                if (!name) return null;
                const on = selectedAnalysisCategories.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() =>
                      setSelectedAnalysisCategories((cur) =>
                        cur.includes(name)
                          ? cur.filter((n) => n !== name)
                          : [...cur, name]
                      )
                    }
                    className={`px-2 py-1 rounded-full text-[11px] border transition ${
                      on
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {name}
                  </button>
                );
              })}

            </div>

            <div className="w-full h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={categoryMonthlyChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EF" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 11 }} />

                  {(selectedAnalysisCategories.length === 0
                    ? analysisByCategory.slice(0, 5).map((c) => c?.name)
                    : selectedAnalysisCategories
                  )
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((name, i) => (
                      <Line
                        key={name}
                        type="monotone"
                        dataKey={name}
                        stroke={ANALYSIS_COLORS[i % ANALYSIS_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    ))}

                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}

        {/* MONTHLY GROWTH TABLE */}
        {analysisByCategoryMonthly.length > 0 && (

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

            <h3 className="font-medium text-sm mb-3">
              Latest Month Growth
              <span className="ml-2 text-xs font-normal text-gray-500">
                {analysisByCategoryMonthly[analysisByCategoryMonthly.length - 1]?.month}
              </span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1.5">

              {Object.entries(
                analysisByCategoryMonthly[analysisByCategoryMonthly.length - 1]?.categories || {}
              )
                .filter(([, info]) => Number(info?.orders || 0) > 0 || info?.growth_status === "decline")
                .map(([name, info]) => {

                  const growth = Number(info?.growth_percentage || 0);
                  const status = info?.growth_status || "unchanged";

                  return (
                    <div key={name} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 truncate">{name}</span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-medium">{info?.orders || 0}</span>
                        <span
                          className={`text-[11px] ${
                            status === "growth"
                              ? "text-[#359E58]"
                              : status === "decline"
                              ? "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {status === "growth"
                            ? `↑${growth.toFixed(0)}%`
                            : status === "decline"
                            ? `↓${Math.abs(growth).toFixed(0)}%`
                            : status === "new"
                            ? "new"
                            : "—"}
                        </span>
                      </span>
                    </div>
                  );
                })}

            </div>

          </div>
        )}

      </div>
    )}


    {/* ============================================================
        PRODUCTS
    ============================================================ */}

    {analysisView === "products" && (

      <div className="space-y-4">

        <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

          <h3 className="font-medium text-sm mb-3">
            Top Designs
            <span className="ml-2 text-xs font-normal text-gray-500">
              {analysisByProducts.filter((p) => Number(p.orders || 0) > 0).length} ordered
              {" · "}
              {analysisByProducts.length} in catalogue
            </span>
          </h3>

          {analysisByProducts.filter((p) => Number(p.orders || 0) > 0).length === 0 ? (
            <p className="text-sm text-gray-500">No orders in this period.</p>
          ) : (
            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[...analysisByProducts]
                    .filter((p) => Number(p.orders || 0) > 0)
                    .sort((a, b) => Number(b.orders || 0) - Number(a.orders || 0))
                    .slice(0, 10)
                    .map((p) => ({
                      name: p.design_number || p.product_id || "Unknown",
                      orders: Number(p.orders || 0),
                    }))}
                  margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EF" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "#F7F9F8" }} />
                  <Bar dataKey="orders" name="Orders" fill="#359E58" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {[
            ["Best Sellers", analysisProductIntelligence.best_sellers || [], true],
            ["Underperforming", analysisProductIntelligence.underperforming || [], true],
            ["Never Ordered", analysisProductIntelligence.never_ordered || [], false],
          ].map(([title, list, showOrders]) => (

            <div key={title} className="bg-white border border-[#E5E7EB] rounded-lg p-4">

              <h4 className="font-medium text-sm mb-1">{title}</h4>
              <p className="text-xs text-gray-500 mb-3">{list.length} designs</p>

              {list.length === 0 ? (
                <p className="text-xs text-gray-400">None.</p>
              ) : (
                <div className="space-y-1.5">
                  {list.slice(0, 5).map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">
                          {p.design_number || p.product_id || "Unknown"}
                        </p>
                        <p className="text-[11px] text-gray-400 truncate">
                          {p.category || "—"}
                        </p>
                      </div>
                      {showOrders && (
                        <span className="text-xs font-semibold shrink-0">
                          {Number(p.orders || 0)}
                        </span>
                      )}
                    </div>
                  ))}
                  {list.length > 5 && (
                    <p className="text-[11px] text-gray-400 pt-1">
                      + {list.length - 5} more
                    </p>
                  )}
                </div>
              )}

            </div>
          ))}

        </div>

      </div>
    )}


    {/* ============================================================
        RETAILERS
    ============================================================ */}

    {analysisView === "retailers" && (

      <div className="space-y-4">

        {analysisByRetailer.length === 0 ? (

          <div className="bg-white border border-[#E5E7EB] rounded-lg p-8 text-center">
            <p className="text-sm text-gray-500">No retailer data.</p>
          </div>

        ) : (

          <>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

              <h3 className="font-medium text-sm mb-3">Orders by Retailer</h3>

              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[...analysisByRetailer]
                      .sort((a, b) => Number(b.total_orders || 0) - Number(a.total_orders || 0))
                      .slice(0, 8)
                      .map((r) => ({
                        name: r.retailer_name || "Unknown",
                        Custom: Number(r.custom_orders || 0),
                        Stock: Number(r.stock_orders || 0),
                      }))}
                    margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF0EF" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#6B7280" }} tickLine={false} axisLine={{ stroke: "#E5E7EB" }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "#F7F9F8" }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="Custom" stackId="o" fill="#359E58" barSize={14} />
                    <Bar dataKey="Stock" stackId="o" fill="#2563EB" barSize={14} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>

            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4">

              <h3 className="font-medium text-sm mb-1">Retailer Detail</h3>
              <p className="text-xs text-gray-500 mb-3">
                Click a retailer to see categories and designs
              </p>

              <div className="space-y-1">

                {[...analysisByRetailer]
                  .sort((a, b) => Number(b.total_orders || 0) - Number(a.total_orders || 0))
                  .map((retailer, index) => {

                    const name = retailer.retailer_name || "Unknown Retailer";
                    const key = retailer.retailer_id || name;
                    const isOpen = expandedAnalysisRetailer === key;

                    return (
                      <div key={`${key}-${index}`} className="border-b border-gray-50 last:border-0">

                        <button
                          type="button"
                          onClick={() => setExpandedAnalysisRetailer(isOpen ? null : key)}
                          className="w-full flex items-center gap-3 py-2 px-1 text-left hover:bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-800 flex-1 truncate">{name}</span>
                          <span className="text-[11px] text-gray-500">
                            {Number(retailer.custom_orders || 0)} custom · {Number(retailer.stock_orders || 0)} stock
                          </span>
                          <span className="text-sm font-semibold w-8 text-right">
                            {Number(retailer.total_orders || 0)}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="pl-4 pb-3 space-y-2">
                            {Object.entries(retailer.category_details || {}).length === 0 ? (
                              <p className="text-xs text-gray-400">No category detail.</p>
                            ) : (
                              Object.entries(retailer.category_details || {})
                                .sort((a, b) => Number(b[1]?.orders || 0) - Number(a[1]?.orders || 0))
                                .map(([categoryName, info]) => (
                                  <div key={categoryName}>
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-medium text-gray-700">
                                        {categoryName}
                                      </span>
                                      <span className="text-[11px] text-gray-500">
                                        {Number(info?.orders || 0)} orders
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 mt-1">
                                      {(info?.products || []).slice(0, 8).map((p, i) => (
                                        <div key={i} className="flex justify-between text-[11px]">
                                          <span className="truncate text-gray-500">
                                            {p.design_number || p.product_id || "Unknown"}
                                          </span>
                                          <span className="font-medium">{Number(p.orders || 0)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })}

              </div>

            </div>

            {/* HEATMAP */}
            <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 overflow-x-auto">

              <h3 className="font-medium text-sm mb-3">Retailer × Category</h3>

              <table className="text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium sticky left-0 bg-white">
                      Retailer
                    </th>
                    {[...new Set(
                      analysisByRetailer.flatMap((r) => Object.keys(r.categories || {}))
                    )].map((c) => (
                      <th key={c} className="px-2 py-1.5 font-medium text-center whitespace-nowrap text-gray-500">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysisByRetailer.map((retailer, ri) => {

                    const name = retailer.retailer_name || "Unknown";
                    const cats = retailer.categories || {};

                    const max = Math.max(
                      1,
                      ...analysisByRetailer.flatMap((r) =>
                        Object.values(r.categories || {}).map(Number)
                      )
                    );

                    return (
                      <tr key={`${name}-${ri}`}>
                        <td className="px-2 py-1.5 whitespace-nowrap sticky left-0 bg-white text-gray-700">
                          {name}
                        </td>
                        {[...new Set(
                          analysisByRetailer.flatMap((r) => Object.keys(r.categories || {}))
                        )].map((c) => {

                          const orders = Number(cats[c] || 0);
                          const ratio = orders / max;

                          const bg =
                            orders === 0
                              ? "#FFFFFF"
                              : ratio > 0.75
                              ? "#1F6B3B"
                              : ratio > 0.5
                              ? "#359E58"
                              : ratio > 0.25
                              ? "#8ACBA4"
                              : "#DCEFE3";

                          return (
                            <td
                              key={c}
                              className="text-center px-2 py-1.5 border border-white"
                              style={{
                                backgroundColor: bg,
                                color: ratio > 0.5 ? "#FFFFFF" : "#374151",
                              }}
                            >
                              {orders || ""}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>

          </>
        )}

      </div>
    )}


    {/* ============================================================
        METAL & STONE
    ============================================================ */}

    {analysisView === "materials" && (

      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {[
            ["Metal", analysisByMetal],
            ["Gold Purity", analysisByPurity],
            ["Gold Colour", analysisByGoldColour],
            ["Stone", analysisByStone],
          ].map(([title, rows]) => (

            <div key={title} className="bg-white border border-[#E5E7EB] rounded-lg p-4">

              <h3 className="font-medium text-sm mb-3">{title}</h3>

              {(!rows || rows.length === 0) ? (
                <p className="text-xs text-gray-400">No data.</p>
              ) : (
                <div className="space-y-1.5">
                  {rows.slice(0, 8).map((item, i) => (
                    <div key={`${item.name}-${i}`} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-600 truncate">
                        {item.name || item.value || "Unknown"}
                      </span>
                      <span className="text-xs font-semibold">
                        {Number(item.count ?? item.orders ?? 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}

        </div>

        {/* CROSS ANALYSIS */}
        {[
          ["Category × Metal", analysisData?.cross_analysis?.category_metal],
          ["Category × Stone", analysisData?.cross_analysis?.category_stone],
        ].map(([title, data]) => {

          const rows = Object.entries(data || {});

          if (rows.length === 0) return null;

          const columns = [
            ...new Set(rows.flatMap(([, v]) => Object.keys(v || {}))),
          ];

          return (
            <div key={title} className="bg-white border border-[#E5E7EB] rounded-lg p-4 overflow-x-auto">

              <h3 className="font-medium text-sm mb-3">{title}</h3>

              <table className="w-full text-xs">
                <thead className="border-b border-gray-100">
                  <tr>
                    <th className="text-left px-2 py-1.5 font-medium text-gray-500">Category</th>
                    {columns.map((c) => (
                      <th key={c} className="text-right px-2 py-1.5 font-medium text-gray-500 whitespace-nowrap">
                        {c}
                      </th>
                    ))}
                    <th className="text-right px-2 py-1.5 font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {rows.map(([categoryName, values]) => {

                    const total = columns.reduce(
                      (sum, c) => sum + Number(values?.[c]?.orders || 0),
                      0
                    );

                    return (
                      <tr key={categoryName} className="hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-gray-700">{categoryName}</td>
                        {columns.map((c) => (
                          <td key={c} className="text-right px-2 py-1.5">
                            {Number(values?.[c]?.orders || 0) || ""}
                          </td>
                        ))}
                        <td className="text-right px-2 py-1.5 font-semibold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

            </div>
          );
        })}

      </div>
    )}


    {/* EMPTY STATE */}
    {analysisTotalOrders === 0 && (
      <div className="bg-white border border-[#E5E7EB] rounded-lg p-10 text-center">
        <BarChart3 className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <h3 className="font-medium text-sm">No orders found</h3>
        <p className="text-xs text-gray-500 mt-1">
          Try widening the date range or clearing filters.
        </p>
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

      {/* PRODUCT DETAILS */}
<div className="mb-8 border border-[#E5E7EB] rounded-md p-5 bg-[#FAFAFA]">
  <div className="flex items-center justify-between mb-5">
    <div>
      <h3 className="text-sm font-semibold text-[#0A0A0A]">
        Product Details
      </h3>

      <p className="text-xs text-[#6B7280] mt-1">
        Fill in the specifications for this product.
      </p>
    </div>
  </div>

  {PRODUCT_CUSTOMIZATION_CONFIG[selectedProduct.category] ? (
    <div className="space-y-5">

      {PRODUCT_CUSTOMIZATION_CONFIG[
        selectedProduct.category
      ].fields.map((field) => {

        if (!shouldShowProductField(field, productDetails)) {
          return null;
        }

        const value = productDetails[field.key] || "";

        return (
          <div key={field.key}>

            <label className="block text-xs font-semibold tracking-wider uppercase text-[#4B5563] mb-2">
              {field.label}
            </label>

            {/* SELECT */}
            {field.type === "select" && (
              <select
                value={value}
                onChange={(e) =>
                  setProductDetails((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm bg-white"
              >
                <option value="">
                  Select {field.label}
                </option>

                {(field.options || []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {/* RADIO */}
            {field.type === "radio" && (
              <div className="flex flex-wrap gap-4">
                {(field.options || []).map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`${selectedProduct.product_id}-${field.key}`}
                      value={option}
                      checked={value === option}
                      onChange={(e) =>
                        setProductDetails((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                    />

                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {/* TEXT */}
            {field.type === "text" && (
              <input
                type="text"
                value={value}
                onChange={(e) =>
                  setProductDetails((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm bg-white"
                placeholder={`Enter ${field.label}`}
              />
            )}

            {/* DATE */}
            {field.type === "date" && (
              <input
                type="date"
                value={value}
                onChange={(e) =>
                  setProductDetails((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm bg-white"
              />
            )}

            {/* TEXTAREA */}
            {field.type === "textarea" && (
              <textarea
                value={value}
                onChange={(e) =>
                  setProductDetails((prev) => ({
                    ...prev,
                    [field.key]: e.target.value,
                  }))
                }
                rows={3}
                className="w-full border border-[#E5E7EB] rounded-sm px-3 py-2 text-sm bg-white resize-none"
                placeholder={`Enter ${field.label}`}
              />
            )}

          </div>
        );
      })}

      <div className="flex justify-end pt-3">
        <Button
          type="button"
          onClick={saveProductDetails}
          disabled={savingProductDetails}
          className="bg-[#359E58] hover:bg-[#2e884c] text-white"
        >
          {savingProductDetails
            ? "Saving..."
            : "Save Product Details"}
        </Button>
      </div>

    </div>
  ) : (
    <p className="text-sm text-gray-500">
      No product configuration found for this category.
    </p>
  )}
</div>

        <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">
          Product Images
        </h3>

        <div className="mb-5">
          <input
            type="file"
            accept="image/*"
            multiple
            id="product-image-upload"
            className="hidden"
            onChange={handleFileSelect}
          />

          <label
            htmlFor="product-image-upload"
            className="inline-flex items-center justify-center px-4 py-2 bg-[#359E58] hover:bg-[#2e884c] text-white text-sm rounded-sm cursor-pointer"
          >
            {selectedFiles.length > 0 ? "Change Selection" : "Add Images"}
          </label>

          {selectedFiles.length > 0 && (
            <>
              <span className="ml-3 text-sm text-[#4B5563]">
                {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
              </span>

              <Button
                type="button"
                onClick={uploadProductImage}
                className="ml-3 bg-[#359E58] hover:bg-[#2e884c] text-white"
              >
                Upload
              </Button>
            </>
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