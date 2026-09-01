import { useState, useEffect, useCallback, useMemo } from "react";
// import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Check, X, Plus, Trash2, Users, Package, MessageSquare, Palette, BarChart3, FileUp, Image } from "lucide-react";
import { PRODUCT_CUSTOMIZATION_CONFIG } from "../components/ProductCustomizationConfig";
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
by_date: [],

products: [],

  product_intelligence: {
    best_sellers: [],
    underperforming: [],
    never_ordered: [],
  },

  retailers: [],

  metal: [],
  category_metal: [],
  purity: [],
  gold_colour: [],
  stone: [],

  status: [],
  due_dates: {},

  filters: {},
});


const [selectedAnalysisCategories, setSelectedAnalysisCategories] =
  useState([]);

const [selectedCategoryDrilldown, setSelectedCategoryDrilldown] =
  useState(null);
const [expandedAnalysisRetailer, setExpandedAnalysisRetailer] =
  useState(null);

const [retailerAnalysisSort, setRetailerAnalysisSort] =
  useState("orders_desc");

const [productPerformanceSort, setProductPerformanceSort] =
  useState("orders_desc");
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
        const metalValue =
            analysisMetal === "gold_platinum"
                ? "Gold + Platinum"
                : analysisMetal;
    
        params.append("metal", metalValue);
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
  
      setAnalysisData({
        overview: {
          total_orders: response.data.overview?.total_orders || 0,
          combined_orders:
            response.data.overview?.combined_orders || 0,
          website_orders: response.data.overview?.website_orders || 0,
          whatsapp_orders: response.data.overview?.whatsapp_orders || 0,
          total_products: response.data.overview?.total_products || 0,
          average_orders_per_day:
            response.data.overview?.average_orders_per_day || 0,
        },
      
        category: response.data.category || [],

category_monthly:
  response.data.category_monthly || [],

by_date:
  response.data.by_date || [],

products:
  response.data.products || [],
      
        product_intelligence:
          response.data.product_intelligence || {
            best_sellers: [],
            underperforming: [],
            never_ordered: [],
          },
      
        retailers:
          response.data.retailers || [],
      
          metal:
          response.data.metal || [],

        category_metal:
          response.data.category_metal || [],

        purity:
          response.data.purity || [],
      
        gold_colour:
          response.data.gold_colour || [],
      
        stone:
          response.data.stone || [],
      
        status:
          response.data.status || {},
      
        due_dates:
          response.data.due_dates || {},
      
        filters:
          response.data.filters || {},
      });
  
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

  useEffect(() => {
    loadWhatsappAnalysis();
  }, [loadWhatsappAnalysis]);

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

const exportAnalysisExcel = async () => {
  try {
    const XLSX = await import("xlsx");
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

const analysisTotalOrders =
  Number(
    analysisData?.overview?.total_orders || 0
  );

const analysisCustomOrders =
  Number(
    analysisData?.overview?.custom_orders || 0
  );

const analysisCatalogueOrders =
  Number(
    analysisData?.overview?.catalogue_orders || 0
  );

const analysisByStatus =
  analysisData?.status || [];

const maxAnalysisStatusCount =
  Math.max(
    ...analysisByStatus.map((item) =>
      Number(item?.count || item?.orders || 0)
    ),
    1
  );

const analysisByCustomer =
  analysisData?.customers || [];

const maxAnalysisCustomerCount =
  Math.max(
    ...analysisByCustomer.map((item) =>
      Number(item?.count || item?.orders || 0)
    ),
    1
  );



const analysisByCategory =
  analysisData?.category || [];

const analysisCategoryProductDrilldown =
  analysisData?.category_product_drilldown || {};

const analysisByCategoryMonthly =
  analysisData?.category_monthly || [];

const analysisByProducts =
  analysisData?.products || [];

const analysisByDate =
  analysisData?.by_date || [];

const maxAnalysisDateCount =
  Math.max(
    ...analysisByDate.map((item) =>
      Number(item?.count || 0)
    ),
    1
  );

const analysisProductIntelligence =
  analysisData?.product_intelligence || {
    best_sellers: [],
    underperforming: [],
    never_ordered: [],
  };

const analysisByRetailer =
  analysisData?.retailers || [];

const analysisByMetal =
  analysisData?.metal || [];

const analysisByCategoryMetal =
  analysisData?.category_metal || [];

const analysisByPurity =
  analysisData?.purity || [];

const analysisByGoldColour =
  analysisData?.gold_colour || [];

const analysisByStone =
  analysisData?.stone || [];

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
    {/* =====================================================
    AUTOMATIC BUSINESS INSIGHTS
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mb-6">

<div className="mb-5">
  <h3 className="font-semibold text-lg">
    Automatic Business Insights
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Key observations from your current analysis
  </p>
</div>

{automaticInsights.length === 0 ? (

  <p className="text-sm text-gray-500">
    No automatic insights available for the selected filters.
  </p>

) : (

  <div className="space-y-3">

    {automaticInsights.map((insight, index) => (

      <div
        key={`insight-${index}`}
        className="flex items-start gap-3 border border-gray-100 rounded-lg p-4"
      >

        <div
          className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
            insight.type === "positive"
              ? "bg-green-500"
              : insight.type === "warning"
              ? "bg-red-500"
              : "bg-blue-500"
          }`}
        />

        <p className="text-sm text-gray-700 leading-6">
          {insight.text}
        </p>

      </div>

    ))}

  </div>

)}

</div>

{/* =====================================================
    OVERVIEW
===================================================== */}

<div className="space-y-4">

  {/* DATE FILTER */}
<div className="flex flex-col sm:flex-row gap-3">

<div>
  <label className="block text-sm font-medium text-[#374151] mb-1">
    From Date
  </label>

  <input
    type="date"
    value={analysisFromDate}
    onChange={(e) => setAnalysisFromDate(e.target.value)}
    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
  />
</div>

<div>
  <label className="block text-sm font-medium text-[#374151] mb-1">
    To Date
  </label>

  <input
    type="date"
    value={analysisToDate}
    onChange={(e) => setAnalysisToDate(e.target.value)}
    className="border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm"
  />
</div>

</div>

<div>
  <h3 className="text-lg font-heading font-semibold text-[#0A0A0A]">
    Overview
  </h3>

  <p className="text-sm text-[#6B7280] mt-1">
    Combined Website + WhatsApp performance
  </p>

  <div className="flex justify-end mb-4">
  <div className="flex gap-2">

  <Button
    onClick={exportAnalysisCSV}
    className="bg-[#359E58] hover:bg-[#2e884c] text-white"
  >
    Export CSV
  </Button>

  <Button
    onClick={exportAnalysisExcel}
    className="bg-[#359E58] hover:bg-[#2e884c] text-white"
  >
    Export Excel
  </Button>

  <Button
    onClick={exportAnalysisPDF}
    className="bg-[#359E58] hover:bg-[#2e884c] text-white"
  >
    Export PDF
  </Button>

</div>
</div>
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

  {/* TOTAL ORDERS */}
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
    <p className="text-sm text-[#6B7280]">
      Total Orders
    </p>

    <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">
      {analysisData?.overview?.total_orders ?? 0}
    </p>

    <p className="text-xs text-[#9CA3AF] mt-1">
      Website + WhatsApp
    </p>
  </div>


  {/* WEBSITE ORDERS */}
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
    <p className="text-sm text-[#6B7280]">
      Website Orders
    </p>

    <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">
      {analysisData?.overview?.website_orders ?? 0}
    </p>

    <p className="text-xs text-[#9CA3AF] mt-1">
      Website channel
    </p>
  </div>


  {/* WHATSAPP ORDERS */}
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
    <p className="text-sm text-[#6B7280]">
      WhatsApp Orders
    </p>

    <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">
      {analysisData?.overview?.whatsapp_orders ?? 0}
    </p>

    <p className="text-xs text-[#9CA3AF] mt-1">
      WhatsApp channel
    </p>
  </div>


  {/* TOTAL PRODUCTS */}
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
    <p className="text-sm text-[#6B7280]">
      Total Products
    </p>

    <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">
      {analysisData?.overview?.total_products ?? 0}
    </p>

    <p className="text-xs text-[#9CA3AF] mt-1">
      Products ordered
    </p>
  </div>


  {/* AVERAGE ORDERS / DAY */}
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5">
    <p className="text-sm text-[#6B7280]">
      Average Orders/Day
    </p>

    <p className="text-3xl font-semibold text-[#0A0A0A] mt-2">
      {analysisData?.overview?.average_orders_per_day ?? 0}
    </p>

    <p className="text-xs text-[#9CA3AF] mt-1">
      Based on selected dates
    </p>
  </div>

</div>

</div>



    
  
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

{/* =====================================================
    ANALYSIS
===================================================== */}

<TabsContent value="analysis">

  <div className="space-y-6">

    {/* HEADER */}
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

      <div>
        <h2 className="text-2xl font-heading font-semibold text-[#0A0A0A]">
          WhatsApp Order Analysis
        </h2>

        <p className="text-sm text-[#4B5563] font-body mt-1">
          Analyse order trends, customers, products and production status.
        </p>
      </div>


      {/* DATE FILTER */}
      <div className="flex flex-wrap gap-2">
      <select
  value={analysisChannel}
  onChange={(e) => setAnalysisChannel(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">Combined</option>
  <option value="website">Website</option>
  <option value="whatsapp">WhatsApp</option>
</select>

<select
  value={analysisRetailer}
  onChange={(e) => setAnalysisRetailer(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Retailers</option>

  {(analysisData?.retailers || []).map((retailer) => (
    <option
      key={retailer.retailer_id || retailer.retailer_name}
      value={retailer.retailer_id || retailer.retailer_name}
    >
      {retailer.retailer_name || "Unknown"}
    </option>
  ))}
</select>


<select
  value={analysisCategory}
  onChange={(e) => setAnalysisCategory(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Categories</option>

  {(analysisData?.category || []).map((category) => {
    const categoryName =
      typeof category === "string"
        ? category
        : category.category;

    return (
      <option
        key={categoryName}
        value={categoryName}
      >
        {categoryName}
      </option>
    );
  })}
</select>

<select
  value={analysisProduct}
  onChange={(e) => setAnalysisProduct(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Products / Designs</option>

  {(analysisData?.products || []).map((product) => {
    const productId =
      product.product_id ||
      product.id ||
      product.design_number ||
      product.product_number;

    const productName =
      product.design_number ||
      product.product_number ||
      product.name ||
      product.product_name ||
      productId;

    return (
      <option
        key={productId}
        value={productId}
      >
        {productName}
      </option>
    );
  })}
</select>

<select
  value={analysisOrderType}
  onChange={(e) => setAnalysisOrderType(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">Custom + Stock</option>
  <option value="custom">Custom</option>
  <option value="stock">Stock</option>
</select>

<select
  value={analysisMetal}
  onChange={(e) => setAnalysisMetal(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Metals</option>
  <option value="gold">Gold</option>
  <option value="platinum">Platinum</option>
  <option value="gold_platinum">Gold + Platinum</option>
</select>

<select
  value={analysisPurity}
  onChange={(e) => setAnalysisPurity(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Purity</option>
  <option value="24K">24K</option>
  <option value="22K">22K</option>
  <option value="18K">18K</option>
  <option value="14K">14K</option>
  <option value="9K">9K</option>
</select>

<select
  value={analysisStone}
  onChange={(e) => setAnalysisStone(e.target.value)}
  className="border border-[#E5E7EB] rounded-md px-3 py-2 bg-white text-sm"
>
  <option value="all">All Stones</option>
  <option value="Natural Diamond">Natural Diamond</option>
  <option value="Lab Grown">Lab Grown</option>
  <option value="CZ">CZ</option>
  <option value="Colour Stones">Colour Stones</option>
  <option value="Precious Stones">Precious Stones</option>
</select>

      <div className="flex items-center gap-2">
  <span className="text-sm text-[#4B5563]">
    From
  </span>

  <input
    type="date"
    value={analysisFromDate}
    onChange={(e) => setAnalysisFromDate(e.target.value)}
    className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm bg-white"
  />

  <span className="text-sm text-[#4B5563]">
    To
  </span>

  <input
    type="date"
    value={analysisToDate}
    onChange={(e) => setAnalysisToDate(e.target.value)}
    className="border border-[#E5E7EB] rounded-md px-3 py-2 text-sm bg-white"
  />
</div>

<button
  onClick={loadWhatsappAnalysis}
  className="bg-[#359E58] hover:bg-[#2e884c] text-white px-4 py-2 rounded-md text-sm"
>
  Refresh
</button>

      </div>

    </div>


    {/* =================================================
        KPI CARDS
    ================================================= */}

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

<div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
  <p className="text-sm text-[#6B7280]">Total Orders</p>
  <p className="text-2xl font-semibold text-[#111827] mt-1">
    {analysisData?.overview?.total_orders || 0}
  </p>
</div>

<div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
  <p className="text-sm text-[#6B7280]">Website Orders</p>
  <p className="text-2xl font-semibold text-[#111827] mt-1">
    {analysisData?.overview?.website_orders || 0}
  </p>
</div>

<div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
  <p className="text-sm text-[#6B7280]">WhatsApp Orders</p>
  <p className="text-2xl font-semibold text-[#111827] mt-1">
    {analysisData?.overview?.whatsapp_orders || 0}
  </p>
</div>

<div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
  <p className="text-sm text-[#6B7280]">Total Products</p>
  <p className="text-2xl font-semibold text-[#111827] mt-1">
    {analysisData?.overview?.total_products || 0}
  </p>
</div>

<div className="bg-white border border-[#E5E7EB] rounded-lg p-4">
  <p className="text-sm text-[#6B7280]">Average Orders/Day</p>
  <p className="text-2xl font-semibold text-[#111827] mt-1">
    {analysisData?.overview?.average_orders_per_day || 0}
  </p>
</div>

</div>


    {/* =================================================
        ORDER TYPE
    ================================================= */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Order Type
        </h3>

        <div className="space-y-5">

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Custom Jewellery</span>
              <span className="font-semibold">
                {analysisCustomOrders}
              </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#359E58] rounded-full"
                style={{
                  width: `${
                    analysisTotalOrders
                      ? (analysisCustomOrders / analysisTotalOrders) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>


          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Catalogue</span>
              <span className="font-semibold">
                {analysisCatalogueOrders}
              </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-700 rounded-full"
                style={{
                  width: `${
                    analysisTotalOrders
                      ? (analysisCatalogueOrders / analysisTotalOrders) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>

        </div>

      </div>


      {/* STATUS */}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Orders by Status
        </h3>

        <div className="space-y-4">

          {analysisByStatus.length === 0 && (
            <p className="text-sm text-gray-500">
              No order data available.
            </p>
          )}

          {analysisByStatus.map((item) => (

            <div key={item.name}>

              <div className="flex justify-between text-sm mb-1">
                <span>{item.name}</span>
                <span className="font-semibold">
                  {item.count}
                </span>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#359E58] rounded-full"
                  style={{
                    width: `${
                      (item.count / maxAnalysisStatusCount) * 100
                    }%`
                  }}
                />

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>


    {/* =================================================
        DAILY TREND
    ================================================= */}

    <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h3 className="font-semibold text-lg">
            Order Trend
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            Last 14 order dates in the selected period
          </p>
        </div>

      </div>


      {analysisByDate.length === 0 ? (

        <div className="py-12 text-center text-sm text-gray-500">
          No order data available for this period.
        </div>

      ) : (

        <div className="flex items-end gap-3 h-64 overflow-x-auto">

          {analysisByDate.map((item) => {

            const height =
              (item.count / maxAnalysisDateCount) * 100;

            return (

              <div
                key={item.date}
                className="flex flex-col items-center justify-end min-w-[55px] h-full"
              >

                <span className="text-xs font-semibold mb-2">
                  {item.count}
                </span>

                <div
                  className="w-8 bg-[#359E58] rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(height, 5)}%`
                  }}
                />

                <span className="text-[10px] text-gray-500 mt-2 whitespace-nowrap">
                  {item.date.slice(5)}
                </span>

              </div>

            );

          })}

        </div>

      )}

    </div>


    {/* =================================================
        PRODUCT CATEGORY + CUSTOMER
    ================================================= */}

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


    {/* =====================================================
    PRODUCT CATALOGUE INTELLIGENCE
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

<div className="mb-6">
  <h3 className="font-semibold text-lg">
    Product Catalogue Intelligence
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Best sellers, underperforming and never-ordered designs
  </p>
</div>

{/* PRODUCT PERFORMANCE BAR CHART */}

{analysisByProducts?.length > 0 && (
  <div className="mb-8">

    <div className="mb-4">
      <h4 className="font-semibold text-base">
        Product / Design Orders
      </h4>

      <p className="text-sm text-gray-500 mt-1">
        Order volume across the catalogue
      </p>
    </div>

    <div className="w-full h-[380px]">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <BarChart
          data={[...analysisByProducts]
            .sort(
              (a, b) =>
                Number(
                  b?.orders ||
                  b?.order_count ||
                  b?.count ||
                  0
                ) -
                Number(
                  a?.orders ||
                  a?.order_count ||
                  a?.count ||
                  0
                )
            )
            .slice(0, 15)
            .map((item) => ({
              name:
                item?.design_number ||
                item?.product_number ||
                item?.product_id ||
                item?.name ||
                "Unknown",

              orders: Number(
                item?.orders ||
                item?.order_count ||
                item?.count ||
                0
              ),
            }))}

          layout="vertical"

          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            type="number"
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fontSize: 11 }}
          />

          <Tooltip />

          <Bar
            dataKey="orders"
            name="Orders"
            radius={[0, 4, 4, 0]}
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  </div>
)}

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* BEST SELLERS */}

  <div className="border border-gray-100 rounded-xl p-5">

    <h4 className="font-semibold text-base mb-4">
      Best Sellers
    </h4>

    {analysisProductIntelligence.best_sellers?.length === 0 ? (

      <p className="text-sm text-gray-500">
        No best-selling products found.
      </p>

    ) : (

      <div className="space-y-3">

        {analysisProductIntelligence.best_sellers.map(
          (product, index) => {

            const productName =
              product.design_number ||
              product.product_number ||
              product.product_name ||
              product.name ||
              product.product_id ||
              "Unknown";

            const category =
              product.category ||
              product.product_category ||
              "—";

            const orders =
              Number(
                product.orders ||
                product.order_count ||
                product.count ||
                0
              );

            return (
              <div
                key={`best-${productName}-${index}`}
                className="flex items-center justify-between gap-3"
              >

                <div className="min-w-0">

                  <p className="text-sm font-medium truncate">
                    {productName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {category}
                  </p>

                </div>

                <span className="text-sm font-semibold shrink-0">
                  {orders}
                </span>

              </div>
            );

          }
        )}

      </div>

    )}

  {/* =====================================================
    RETAILER ANALYSIS
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

<div className="mb-6">
  <h3 className="font-semibold text-lg">
    Retailer Analysis
  </h3>

  <p className="text-sm text-gray-500 mt-1">
    Understand who is buying what
  </p>

  <div className="flex items-center justify-between mt-4">
  <span className="text-xs text-gray-500">
    Sort retailers by
  </span>

  <select
    value={retailerAnalysisSort}
    onChange={(e) =>
      setRetailerAnalysisSort(e.target.value)
    }
    className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
  >
    <option value="orders_desc">
      Highest Orders
    </option>

    <option value="orders_asc">
      Lowest Orders
    </option>

    <option value="name_asc">
      Retailer Name
    </option>
  </select>
</div>
</div>

{/* RETAILER ORDER VOLUME BAR CHART */}

{analysisByRetailer?.length > 0 && (
  <div className="mb-8">

    <div className="mb-4">
      <h4 className="font-semibold text-base">
        Retailer Order Volume
      </h4>

      <p className="text-sm text-gray-500 mt-1">
        Total orders by retailer, split by Custom and Stock
      </p>
    </div>

    <div className="w-full h-[380px]">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <BarChart
          layout="vertical"
          data={[...(analysisByRetailer || [])]
            .sort(
              (a, b) =>
                Number(b?.total_orders || 0) -
                Number(a?.total_orders || 0)
            )
            .slice(0, 15)
            .map((retailer) => ({
              name:
                retailer?.retailer_name ||
                retailer?.name ||
                "Unknown Retailer",

              custom: Number(
                retailer?.custom_orders || 0
              ),

              stock: Number(
                retailer?.stock_orders || 0
              ),

              total: Number(
                retailer?.total_orders || 0
              ),
            }))}

          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            type="number"
            allowDecimals={false}
          />

          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11 }}
          />

          <Tooltip />

          <Legend />

          <Bar
            dataKey="custom"
            name="Custom Orders"
            stackId="orders"
          />

          <Bar
            dataKey="stock"
            name="Stock Orders"
            stackId="orders"
          />

        </BarChart>

      </ResponsiveContainer>

    </div>

  </div>
)}

{analysisByRetailer.length === 0 ? (

  <p className="text-sm text-gray-500">
    No retailer data available.
  </p>

) : (

  <div className="overflow-x-auto border border-gray-100 rounded-xl">

    <table className="w-full text-sm">

      <thead className="bg-gray-50 border-b border-gray-100">

        <tr>

          <th className="text-left px-4 py-3 font-semibold">
            Retailer
          </th>

          <th className="text-right px-4 py-3 font-semibold">
            Total Orders
          </th>

          <th className="text-right px-4 py-3 font-semibold">
            Custom
          </th>

          <th className="text-right px-4 py-3 font-semibold">
            Stock
          </th>

          <th className="text-left px-4 py-3 font-semibold">
            Top Categories
          </th>

        </tr>

      </thead>

      <tbody className="divide-y divide-gray-100">

      {[...analysisByRetailer]
  .sort((a, b) => {

    const aName =
      a.retailer_name ||
      a.name ||
      "";

    const bName =
      b.retailer_name ||
      b.name ||
      "";

    const aOrders =
      Number(a.total_orders || 0);

    const bOrders =
      Number(b.total_orders || 0);

    if (retailerAnalysisSort === "orders_asc") {
      return aOrders - bOrders;
    }

    if (retailerAnalysisSort === "name_asc") {
      return aName.localeCompare(bName);
    }

    return bOrders - aOrders;
  })
  .map((retailer, index) => {

          const retailerName =
            retailer.retailer_name ||
            retailer.name ||
            "Unknown Retailer";

          const totalOrders =
            Number(retailer.total_orders || 0);

          const customOrders =
            Number(retailer.custom_orders || 0);

          const stockOrders =
            Number(retailer.stock_orders || 0);

          const categories =
            retailer.categories || {};

          const topCategories =
            Object.entries(categories)
              .sort((a, b) => Number(b[1]) - Number(a[1]))
              .slice(0, 3);

              return (
                <>
                  <tr
                    key={`retailer-${retailer.retailer_id || retailerName}-${index}`}
                    onClick={() =>
                      setExpandedAnalysisRetailer(
                        expandedAnalysisRetailer ===
                          (retailer.retailer_id || retailerName)
                          ? null
                          : (retailer.retailer_id || retailerName)
                      )
                    }
                    className="hover:bg-gray-50 cursor-pointer"
                  >
              
                    ...YOUR EXISTING CELLS...
              
                  </tr>
              
                  {/* RETAILER CATEGORY + PRODUCT DRILL-DOWN */}
              
                  {expandedAnalysisRetailer ===
                    (retailer.retailer_id || retailerName) && (
              
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-5 bg-gray-50"
                      >
              
                        <div className="space-y-4">
              
                          {Object.entries(
                            retailer.category_details || {}
                          )
                            .sort(
                              (a, b) =>
                                Number(b[1]?.orders || 0) -
                                Number(a[1]?.orders || 0)
                            )
                            .map(
                              ([categoryName, categoryInfo]) => (
              
                                <div
  key={categoryName}
  onClick={(e) => {
    e.stopPropagation();
    setAnalysisCategory(categoryName);
  }}
  className="bg-white border border-gray-100 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
>
              
                                  <div className="flex items-center justify-between mb-3">
              
                                    <p className="font-medium text-sm">
                                      {categoryName}
                                    </p>
              
                                    <span className="text-xs text-gray-500">
                                      {Number(categoryInfo?.orders || 0)} orders
                                    </span>
              
                                  </div>
              
                                  <div className="space-y-2">
              
                                    {(categoryInfo?.products || []).map(
                                      (product, productIndex) => {
              
                                        const design =
                                          product.design_number ||
                                          product.product_id ||
                                          product.name ||
                                          "Unknown";
              
                                        return (
                                          <div
                                            key={`${categoryName}-${design}-${productIndex}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
              
                                              const productId =
                                                product.product_id ||
                                                product.design_number;
              
                                              if (productId) {
                                                setAnalysisProduct(
                                                  String(productId)
                                                );
                                              }
                                            }}
                                            className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer"
                                          >
              
                                            <div className="min-w-0">
              
                                              <p className="text-sm font-medium truncate">
                                                {design}
                                              </p>
              
                                              {product.name &&
                                                product.name !== design && (
                                                  <p className="text-xs text-gray-500 truncate">
                                                    {product.name}
                                                  </p>
                                                )}
              
                                            </div>
              
                                            <span className="text-sm font-semibold shrink-0">
                                              {Number(product.orders || 0)}
                                            </span>
              
                                          </div>
                                        );
                                      }
                                    )}
              
                                  </div>
              
                                </div>
                              )
                            )}
              
                        </div>
              
                      </td>
                    </tr>
                  )}
                </>
              );

        })}

      </tbody>

    </table>

  </div>

)}

</div>

{/* =====================================================
    RETAILER × CATEGORY
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

  <div className="mb-6">
    <h3 className="font-semibold text-lg">
      Retailer × Category
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Category purchasing pattern by retailer
    </p>
  </div>

  {analysisByRetailer.length === 0 ? (

    <p className="text-sm text-gray-500">
      No retailer/category data available.
    </p>

  ) : (

    <div className="overflow-x-auto">

      <table className="w-full text-sm border-collapse">

        <thead>

          <tr className="border-b border-gray-100">

            <th className="text-left px-3 py-3 font-semibold sticky left-0 bg-white">
              Retailer
            </th>

            {[
              ...new Set(
                analysisByRetailer.flatMap(
                  (retailer) =>
                    Object.keys(
                      retailer.categories || {}
                    )
                )
              ),
            ].map((categoryName) => (

              <th
                key={categoryName}
                className="px-3 py-3 font-semibold text-center whitespace-nowrap"
              >
                {categoryName}
              </th>

            ))}

          </tr>

        </thead>

        <tbody>

          {analysisByRetailer.map(
            (retailer, retailerIndex) => {

              const retailerName =
                retailer.retailer_name ||
                retailer.name ||
                "Unknown Retailer";

              const maxCategoryOrders = Math.max(
                  1,
                  ...analysisByRetailer.flatMap((r) =>
                    Object.values(r.categories || {}).map(
                      (value) => Number(value || 0)
                    )
                  )
              );

              

              const categories =
                retailer.categories || {};

              return (

                <tr
                  key={`heatmap-${retailer.retailer_id || retailerName}-${retailerIndex}`}
                  className="border-b border-gray-50"
                >

                  <td className="px-3 py-3 font-medium whitespace-nowrap sticky left-0 bg-white">
                    {retailerName}
                  </td>

                  {[
                    ...new Set(
                      analysisByRetailer.flatMap(
                        (r) =>
                          Object.keys(
                            r.categories || {}
                          )
                      )
                    ),
                  ].map((categoryName) => {

                    const orders =
                      Number(
                        categories[categoryName] || 0
                      );

                    return (

                      <td
                        key={`${retailerName}-${categoryName}`}
                        onClick={() => {
                          if (orders > 0) {
                            setAnalysisRetailer(
                              retailer.retailer_id ||
                              retailerName
                            );

                            setAnalysisCategory(
                              categoryName
                            );
                          }
                        }}
                        className={`px-3 py-3 text-center ${
                          orders > 0
                            ? "cursor-pointer hover:bg-gray-300"
                            : "bg-gray-50"
                        }`}
                        style={{
                          backgroundColor:
                            orders > 0
                              ? `rgba(0, 0, 0, ${0.05 + (orders / maxCategoryOrders) * 0.20})`
                              : undefined,
                        }}
                      >

                        <span className="font-medium">
                          {orders}
                        </span>

                      </td>

                    );

                  })}

                </tr>

              );

            }
          )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* =====================================================
    CATEGORY × METAL
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mt-6">

  <div className="mb-6">
    <h3 className="font-semibold text-lg">
      Category × Metal
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Metal preference across product categories
    </p>
  </div>

  {analysisByCategoryMetal.length === 0 ? (

    <p className="text-sm text-gray-500">
      No category data available.
    </p>

  ) : (

    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 border-b border-gray-100">

          <tr>

            <th className="text-left px-4 py-3 font-semibold">
              Category
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Gold
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Platinum
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Gold + Platinum
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Combined
            </th>

          </tr>

        </thead>

        <tbody className="divide-y divide-gray-100">

          {analysisByCategoryMetal.map(
            (categoryItem, index) => {

              const categoryName =
                categoryItem?.name ||
                categoryItem?.category ||
                "Unknown";

              const metalData =
                categoryItem?.metal ||
                categoryItem?.metals ||
                {};

              const gold =
                Number(
                  metalData?.Gold ||
                  metalData?.gold ||
                  0
                );

              const platinum =
                Number(
                  metalData?.Platinum ||
                  metalData?.platinum ||
                  0
                );

              const goldPlatinum =
                Number(
                  metalData?.["Gold + Platinum"] ||
                  metalData?.gold_platinum ||
                  0
                );

              const combined =
                gold +
                platinum +
                goldPlatinum;

              return (

                <tr
                  key={`category-metal-${categoryName}-${index}`}
                  className="hover:bg-gray-50"
                >

                  <td className="px-4 py-3 font-medium">
                    {categoryName}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {gold}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {platinum}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {goldPlatinum}
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    {combined}
                  </td>

                </tr>

              );

            }
          )}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* =====================================================
    GOLD PURITY + GOLD COLOUR
===================================================== */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

  {/* GOLD PURITY */}

  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

    <div className="mb-5">
      <h3 className="font-semibold text-lg">
        Gold Purity
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        Orders by gold purity
      </p>
    </div>

    {analysisByPurity.length === 0 ? (

      <p className="text-sm text-gray-500">
        No gold purity data available.
      </p>

    ) : (

      <div className="space-y-3">

        {analysisByPurity.map((item, index) => {

          const purity =
            item?.name ||
            item?.purity ||
            item?.value ||
            "Unknown";

          const orders =
            Number(
              item?.orders ||
              item?.order_count ||
              item?.count ||
              0
            );

          return (

            <div
              key={`purity-${purity}-${index}`}
              className="flex items-center justify-between"
            >

              <span className="text-sm">
                {purity}
              </span>

              <span className="text-sm font-semibold">
                {orders}
              </span>

            </div>

          );

        })}

      </div>

    )}

  </div>


  {/* GOLD COLOUR */}

  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

    <div className="mb-5">
      <h3 className="font-semibold text-lg">
        Gold Colour
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        Orders by gold colour
      </p>
    </div>

    {analysisByGoldColour.length === 0 ? (

      <p className="text-sm text-gray-500">
        No gold colour data available.
      </p>

    ) : (

      <div className="space-y-3">

        {analysisByGoldColour.map((item, index) => {

          const colour =
            item?.name ||
            item?.gold_colour ||
            item?.colour ||
            item?.value ||
            "Unknown";

          const orders =
            Number(
              item?.orders ||
              item?.order_count ||
              item?.count ||
              0
            );

          return (

            <div
              key={`gold-colour-${colour}-${index}`}
              className="flex items-center justify-between"
            >

              <span className="text-sm">
                {colour}
              </span>

              <span className="text-sm font-semibold">
                {orders}
              </span>

            </div>

          );

        })}

      </div>

    )}

  </div>

</div>


{/* =====================================================
    CATEGORY × STONE
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6 mt-6">

  <div className="mb-6">
    <h3 className="font-semibold text-lg">
      Category × Stone
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Stone preference across product categories
    </p>
  </div>

  {analysisByStone.length === 0 ? (

    <p className="text-sm text-gray-500">
      No stone data available.
    </p>

  ) : (

    <div className="overflow-x-auto">

      <table className="w-full text-sm">

        <thead className="bg-gray-50 border-b border-gray-100">

          <tr>

            <th className="text-left px-4 py-3 font-semibold">
              Stone
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Orders
            </th>

            <th className="text-right px-4 py-3 font-semibold">
              Order %
            </th>

          </tr>

        </thead>

        <tbody className="divide-y divide-gray-100">

          {[...analysisByStone]
            .sort(
              (a, b) =>
                Number(
                  b?.orders ||
                  b?.order_count ||
                  b?.count ||
                  0
                ) -
                Number(
                  a?.orders ||
                  a?.order_count ||
                  a?.count ||
                  0
                )
            )
            .map((stoneItem, index) => {

              const stoneName =
                stoneItem?.name ||
                stoneItem?.stone ||
                stoneItem?.stone_type ||
                stoneItem?.value ||
                "Unknown";

              const orders =
                Number(
                  stoneItem?.orders ||
                  stoneItem?.order_count ||
                  stoneItem?.count ||
                  0
                );

              const percentage =
                Number(
                  stoneItem?.percentage ||
                  stoneItem?.order_percentage ||
                  0
                );

              return (

                <tr
                  key={`stone-${stoneName}-${index}`}
                  onClick={() => {
                    setAnalysisStone(stoneName);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >

                  <td className="px-4 py-3 font-medium">
                    {stoneName}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {orders}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {percentage.toFixed(1)}%
                  </td>

                </tr>

              );

            })}

        </tbody>

      </table>

    </div>

  )}

</div>

{/* =====================================================
    DUE DATE + ORDER STATUS
===================================================== */}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

  {/* DUE DATE ANALYSIS */}

  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

    <div className="mb-5">
      <h3 className="font-semibold text-lg">
        Due Date Analysis
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        Orders based on due-date performance
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3">

      {[
        ["Due This Week", "due_this_week"],
        ["Due Next Week", "due_next_week"],
        ["Overdue", "overdue"],
        ["Completed On Time", "completed_on_time"],
        ["Delayed", "delayed"],
      ].map(([label, key]) => (

        <div
          key={key}
          className="border border-gray-100 rounded-lg p-4"
        >

          <p className="text-xs text-gray-500">
            {label}
          </p>

          <p className="text-2xl font-semibold mt-1">
            {Number(
              analysisDueDates?.[key] || 0
            )}
          </p>

        </div>

      ))}

    </div>

  </div>


  {/* ORDER STATUS */}

  <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

    <div className="mb-5">
      <h3 className="font-semibold text-lg">
        Order Status
      </h3>

      <p className="text-sm text-gray-500 mt-1">
        Statuses currently available in the database
      </p>
    </div>

    {Array.isArray(analysisByStatus) &&
    analysisByStatus.length > 0 ? (

      <div className="space-y-3">

        {analysisByStatus.map((item, index) => {

          const status =
            item?.status ||
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

          return (

            <div
              key={`${status}-${index}`}
              className="flex items-center justify-between border-b border-gray-100 pb-3"
            >

              <span className="text-sm font-medium">
                {status}
              </span>

              <span className="text-sm font-semibold">
                {orders}
              </span>

            </div>

          );

        })}

      </div>

    ) : (

      <p className="text-sm text-gray-500">
        No order status data available.
      </p>

    )}

  </div>

</div>

  {/* =====================================================
    FULL PRODUCT CATALOGUE
===================================================== */}

<div className="mt-8">

<div className="flex items-center justify-between mb-4">
  <div>
    <h4 className="font-semibold text-base">
      Full Product Catalogue
    </h4>

    <p className="text-sm text-gray-500 mt-1">
      Complete catalogue performance
    </p>
  </div>

  <span className="text-sm text-gray-500">
    {analysisByProducts.length} products
  </span>
</div>

<select
  value={productPerformanceSort}
  onChange={(e) =>
    setProductPerformanceSort(e.target.value)
  }
  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white"
>
  <option value="orders_desc">
    Highest Orders
  </option>

  <option value="orders_asc">
    Lowest Orders
  </option>

  <option value="name_asc">
    Product / Design
  </option>
</select>

{analysisByProducts.length === 0 ? (

  <p className="text-sm text-gray-500 py-6">
    No product data available.
  </p>

) : (

  <div className="overflow-x-auto border border-gray-100 rounded-xl">

    <table className="w-full text-sm">

      <thead className="bg-gray-50 border-b border-gray-100">

        <tr>

          <th className="text-left px-4 py-3 font-semibold">
            Product / Design
          </th>

          <th className="text-left px-4 py-3 font-semibold">
            Category
          </th>

          <th className="text-right px-4 py-3 font-semibold">
            Orders
          </th>

        </tr>

      </thead>

      <tbody className="divide-y divide-gray-100">

      {[...analysisByProducts]
  .sort((a, b) => {

    const aName =
      a.design_number ||
      a.product_number ||
      a.product_name ||
      a.name ||
      a.product_id ||
      "";

    const bName =
      b.design_number ||
      b.product_number ||
      b.product_name ||
      b.name ||
      b.product_id ||
      "";

    const aOrders =
      Number(
        a.orders ||
        a.order_count ||
        a.count ||
        0
      );

    const bOrders =
      Number(
        b.orders ||
        b.order_count ||
        b.count ||
        0
      );

    if (productPerformanceSort === "orders_asc") {
      return aOrders - bOrders;
    }

    if (productPerformanceSort === "name_asc") {
      return aName.localeCompare(bName);
    }

    return bOrders - aOrders;
  })
  .map((product, index) => {

          const productName =
            product.design_number ||
            product.product_number ||
            product.product_name ||
            product.name ||
            product.product_id ||
            "Unknown";

          const category =
            product.category ||
            product.product_category ||
            "—";

          const orders =
            Number(
              product.orders ||
              product.order_count ||
              product.count ||
              0
            );

          return (

            <tr
  key={`catalogue-${productName}-${index}`}
  onClick={() => {
    const productId =
      product.product_id ||
      product.id ||
      product.design_number ||
      product.product_number;

    if (productId) {
      setAnalysisProduct(String(productId));
    }
  }}
  className="hover:bg-gray-50 cursor-pointer"
>

              <td className="px-4 py-3 font-medium">
                {productName}
              </td>

              <td className="px-4 py-3 text-gray-600">
                {category}
              </td>

              <td className="px-4 py-3 text-right font-semibold">
                {orders}
              </td>

            </tr>

          );

        })}

      </tbody>

    </table>

  </div>

)}

</div>

  </div>


  {/* UNDERPERFORMING */}

  <div className="border border-gray-100 rounded-xl p-5">

    <h4 className="font-semibold text-base mb-4">
      Underperforming
    </h4>

    {analysisProductIntelligence.underperforming?.length === 0 ? (

      <p className="text-sm text-gray-500">
        No underperforming products found.
      </p>

    ) : (

      <div className="space-y-3">

        {analysisProductIntelligence.underperforming.map(
          (product, index) => {

            const productName =
              product.design_number ||
              product.product_number ||
              product.product_name ||
              product.name ||
              product.product_id ||
              "Unknown";

            const category =
              product.category ||
              product.product_category ||
              "—";

            const orders =
              Number(
                product.orders ||
                product.order_count ||
                product.count ||
                0
              );

            return (
              <div
                key={`under-${productName}-${index}`}
                className="flex items-center justify-between gap-3"
              >

                <div className="min-w-0">

                  <p className="text-sm font-medium truncate">
                    {productName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {category}
                  </p>

                </div>

                <span className="text-sm font-semibold shrink-0">
                  {orders}
                </span>

              </div>
            );

          }
        )}

      </div>

    )}

  </div>


  {/* NEVER ORDERED */}

  <div className="border border-gray-100 rounded-xl p-5">

    <h4 className="font-semibold text-base mb-4">
      Never Ordered
    </h4>

    {analysisProductIntelligence.never_ordered?.length === 0 ? (

      <p className="text-sm text-gray-500">
        No never-ordered products found.
      </p>

    ) : (

      <div className="space-y-3">

        {analysisProductIntelligence.never_ordered.map(
          (product, index) => {

            const productName =
              product.design_number ||
              product.product_number ||
              product.product_name ||
              product.name ||
              product.product_id ||
              "Unknown";

            const category =
              product.category ||
              product.product_category ||
              "—";

            return (
              <div
                key={`never-${productName}-${index}`}
                className="flex items-center justify-between gap-3"
              >

                <div className="min-w-0">

                  <p className="text-sm font-medium truncate">
                    {productName}
                  </p>

                  <p className="text-xs text-gray-500 truncate">
                    {category}
                  </p>

                </div>

                <span className="text-xs font-medium text-gray-500 shrink-0">
                  0 orders
                </span>

              </div>
            );

          }
        )}

      </div>

    )}

  </div>

</div>

</div>


      {/* =====================================================
    CATEGORY PERFORMANCE
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">

  <div>
    <h3 className="font-semibold text-lg">
      Category Performance
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Orders, share and monthly category growth
    </p>
  </div>

  <div className="text-sm text-gray-500">
    Combined Orders:{" "}
    <span className="font-semibold text-gray-900">
      {analysisData?.overview?.combined_orders ?? 0}
    </span>
  </div>

</div>


{/* CATEGORY SUMMARY */}

{analysisByCategory.length === 0 ? (

  <p className="text-sm text-gray-500">
    No category data available.
  </p>

) : (

  <div className="space-y-4">

    {analysisByCategory.map((item) => {

      const orderPercentage =
        Number(item.percentage || 0);

      const orderCount =
        Number(item.count || 0);

      return (

        <div
  key={item.name}
  onClick={() =>
    setSelectedCategoryDrilldown(
      selectedCategoryDrilldown === item.name
        ? null
        : item.name
    )
  }
  className="border border-gray-100 rounded-lg p-4 cursor-pointer hover:border-gray-300 transition"
>

          <div className="flex items-center justify-between gap-4 mb-2">

            <div className="min-w-0">

              <p className="font-medium text-sm truncate">
                {item.name}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {orderPercentage.toFixed(1)}% of orders
              </p>

            </div>

            <div className="text-right shrink-0">

              <p className="font-semibold text-sm">
                {orderCount}
              </p>

              <p className="text-xs text-gray-500">
                orders
              </p>

            </div>

          </div>


          {/* ORDER SHARE BAR */}

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

            <div
              className="h-full bg-[#359E58] rounded-full transition-all"
              style={{
                width: `${Math.min(
                  Math.max(orderPercentage, 0),
                  100
                )}%`
              }}
            />

          </div>

        </div>

      );

    })}

  </div>

)}

</div>

{selectedCategoryDrilldown && (
  <div className="mt-6 border border-gray-200 rounded-lg p-5">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h4 className="font-semibold text-base">
          {selectedCategoryDrilldown} — Designs / Products
        </h4>
        <p className="text-sm text-gray-500 mt-1">
          Orders by design/product
        </p>
      </div>

      <button
        type="button"
        onClick={() => setSelectedCategoryDrilldown(null)}
        className="text-sm text-gray-500 hover:text-gray-900"
      >
        Close
      </button>
    </div>

    <div className="space-y-2">
      {(analysisCategoryProductDrilldown[selectedCategoryDrilldown] || []).map(
        (product, index) => (
          <div
            key={product?.product_id || product?.design_number || index}
            className="flex items-center justify-between border-b border-gray-100 py-3"
          >
            <div>
              <p className="font-medium text-sm">
                {product?.design_number ||
                  product?.product_name ||
                  product?.name ||
                  "Unknown Design"}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-sm">
                {Number(product?.orders || product?.count || 0)}
              </p>
              <p className="text-xs text-gray-500">
                orders
              </p>
            </div>
          </div>
        )
      )}
    </div>
  </div>
)}

{/* CATEGORY PERFORMANCE LINE CHART */}

{categoryMonthlyChartData.length > 0 && (
  <div className="mb-8">

    <div className="mb-4">
      <h4 className="font-semibold text-base">
        Category Orders Over Time
      </h4>

      <p className="text-sm text-gray-500 mt-1">
        Monthly order performance by category
      </p>


      <div className="flex flex-wrap gap-2 mt-4">

        <button
  type="button"
  onClick={() => setSelectedAnalysisCategories([])}
  className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400 transition"
>
  Clear
</button>

{analysisByCategory.map((categoryItem) => {

  const categoryName =
    categoryItem?.name;

  if (!categoryName) {
    return null;
  }

  const isSelected =
    selectedAnalysisCategories.includes(
      categoryName
    );

  return (
    <button
      key={categoryName}
      type="button"
      onClick={() => {
        setSelectedAnalysisCategories((current) => {

          if (current.includes(categoryName)) {
            return current.filter(
              (name) => name !== categoryName
            );
          }

          return [
            ...current,
            categoryName
          ];
        });
      }}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
        isSelected
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
      }`}
    >
      {categoryName}
    </button>
  );
})}

</div>
    </div>

    <div className="w-full h-[380px]">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <LineChart
          data={categoryMonthlyChartData}
          margin={{
            top: 10,
            right: 20,
            left: 0,
            bottom: 10,
          }}
        >

          <CartesianGrid
            strokeDasharray="3 3"
          />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 12 }}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12 }}
          />

          <Tooltip />

          <Legend />

          {analysisByCategory
  .filter((categoryItem) => {
    const categoryName =
      categoryItem?.name;

    return (
      categoryName &&
      (
        selectedAnalysisCategories.length === 0 ||
        selectedAnalysisCategories.includes(categoryName)
      )
    );
  })
  .map((categoryItem) => {

    const categoryName =
      categoryItem?.name;

    return (
      <Line
        key={categoryName}
        type="monotone"
        dataKey={categoryName}
        strokeWidth={2}
        dot={{ r: 3 }}
        activeDot={{ r: 5 }}
      />
    );
  })}

        </LineChart>

      </ResponsiveContainer>

    </div>

  </div>
)}


{/* =====================================================
    MONTHLY CATEGORY PERFORMANCE
===================================================== */}

<div className="bg-white border border-[#E5E7EB] rounded-xl p-6">

  <div className="mb-6">
    <h3 className="font-semibold text-lg">
      Monthly Category Performance
    </h3>

    <p className="text-sm text-gray-500 mt-1">
      Month-by-month orders and growth / decline by category
    </p>
  </div>

  {analysisByCategoryMonthly.length === 0 ? (

    <p className="text-sm text-gray-500">
      No monthly category data available.
    </p>

  ) : (

    <div className="space-y-6">

      {analysisByCategoryMonthly.map((monthData) => {

        const month =
          monthData?.month || "";

        const categories =
          monthData?.categories || {};

        const categoryEntries =
          Object.entries(categories);

        return (

          <div
            key={month}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >

            {/* MONTH HEADER */}

            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">

              <p className="font-semibold text-sm text-gray-900">
                {month}
              </p>

              <p className="text-xs text-gray-500">
                {categoryEntries.length} categories
              </p>

            </div>


            {/* CATEGORY ROWS */}

            <div className="divide-y divide-gray-100">

              {categoryEntries.length === 0 ? (

                <div className="px-4 py-4 text-sm text-gray-500">
                  No category orders this month.
                </div>

              ) : (

                categoryEntries.map(
                  ([categoryName, categoryInfo]) => {

                    const orders =
                      Number(
                        categoryInfo?.orders || 0
                      );

                    const growth =
                      Number(
                        categoryInfo?.growth_percentage || 0
                      );

                    const status =
                      categoryInfo?.growth_status ||
                      "unchanged";

                    return (

                      <div
                        key={`${month}-${categoryName}`}
                        className="px-4 py-4 flex flex-col md:flex-row md:items-center gap-3"
                      >

                        {/* CATEGORY */}

                        <div className="flex-1 min-w-0">

                          <p className="text-sm font-medium truncate">
                            {categoryName}
                          </p>

                        </div>


                        {/* ORDERS */}

                        <div className="md:w-24">

                          <p className="text-sm font-semibold">
                            {orders}
                          </p>

                          <p className="text-xs text-gray-500">
                            orders
                          </p>

                        </div>


                        {/* GROWTH */}

                        <div className="md:w-32">

                          {status === "growth" ? (

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                              ↑ {growth.toFixed(1)}%
                            </span>

                          ) : status === "decline" ? (

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                              ↓ {Math.abs(growth).toFixed(1)}%
                            </span>

                          ) : status === "new" ? (

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                              New
                            </span>

                          ) : (

                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                              — 0%
                            </span>

                          )}

                        </div>

                      </div>

                    );

                  }
                )

              )}

            </div>

          </div>

        );

      })}

    </div>

  )}

</div>


      {/* TOP CUSTOMERS */}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Top Customers
        </h3>

        <div className="space-y-4">

          {analysisByCustomer.length === 0 && (
            <p className="text-sm text-gray-500">
              No customer data available.
            </p>
          )}

          {analysisByCustomer.map((item, index) => (

            <div
              key={item.name}
              className="flex items-center gap-3"
            >

              <div className="w-7 h-7 rounded-full bg-[#359E58]/10 text-[#359E58] flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">

                <div className="flex justify-between text-sm mb-1">

                  <span className="truncate">
                    {item.name}
                  </span>

                  <span className="font-semibold ml-2">
                    {item.count}
                  </span>

                </div>

                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="h-full bg-[#359E58] rounded-full"
                    style={{
                      width: `${
                        (item.count / maxAnalysisCustomerCount) * 100
                      }%`
                    }}
                  />

                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>


    {/* =================================================
        METAL / GOLD KT / STONE
    ================================================= */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


      {/* METAL */}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Metal
        </h3>

        <div className="space-y-3">

          {analysisByMetal.length === 0 && (
            <p className="text-sm text-gray-500">
              No metal data available.
            </p>
          )}

          {analysisByMetal.map((item) => (

            <div
              key={item.name}
              className="flex justify-between items-center border-b pb-2"
            >

              <span className="text-sm">
                {item.name}
              </span>

              <span className="font-semibold">
                {item.count}
              </span>

            </div>

          ))}

        </div>

      </div>


      {/* GOLD KT */}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Gold Purity
        </h3>

        <div className="space-y-3">

          {analysisByGoldKT.length === 0 && (
            <p className="text-sm text-gray-500">
              No gold KT data available.
            </p>
          )}

          {analysisByGoldKT.map((item) => (

            <div
              key={item.name}
              className="flex justify-between items-center border-b pb-2"
            >

              <span className="text-sm">
                {item.name}
              </span>

              <span className="font-semibold">
                {item.count}
              </span>

            </div>

          ))}

        </div>

      </div>


      {/* STONE */}

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-6">

        <h3 className="font-semibold text-lg mb-5">
          Stone Type
        </h3>

        <div className="space-y-3">

          {analysisByStone.length === 0 && (
            <p className="text-sm text-gray-500">
              No stone data available.
            </p>
          )}

          {analysisByStone.map((item) => (

            <div
              key={item.name}
              className="flex justify-between items-center border-b pb-2"
            >

              <span className="text-sm">
                {item.name}
              </span>

              <span className="font-semibold">
                {item.count}
              </span>

            </div>

          ))}

        </div>

      </div>

    </div>


    {/* =================================================
        EMPTY STATE
    ================================================= */}

    {analysisTotalOrders === 0 && (

      <div className="bg-white border border-[#E5E7EB] rounded-lg p-12 text-center">

        <BarChart3 className="w-10 h-10 mx-auto text-gray-300 mb-3" />

        <h3 className="font-semibold text-lg">
          No orders found
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          Try changing the date range or refresh the orders.
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