import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Palette, Ruler, Gem, FileUp, X, FileText } from "lucide-react";

const PROCESS_STEPS = [
  { icon: Upload, title: "Share Your Vision", desc: "Upload sketches, CAD files, reference images, or describe your design idea in detail" },
  { icon: Palette, title: "CAD Design", desc: "Our team creates a precise CAD rendering of your design within 24-48 hours" },
  { icon: Gem, title: "Refinement", desc: "Review the CAD design and request modifications until it's perfect" },
  { icon: Ruler, title: "Production", desc: "Your approved design goes into production with precision craftsmanship" },
];

export default function CustomisationPage() {
  const { api } = useAuth();
  const [form, setForm] = useState({
    metal_type: "", stone_changes: "", size_changes: "",
    special_notes: "", reference_description: "",
  });
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) {
      toast.error("File size must be under 25MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setUploadedFile({ path: res.data.path, filename: res.data.filename, size: res.data.size });
      toast.success(`File "${file.name}" uploaded successfully`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "File upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = () => setUploadedFile(null);

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.metal_type) { toast.error("Please select a metal type"); return; }
    setLoading(true);
    try {
      const payload = {
        ...form,
        file_url: uploadedFile?.path || "",
        file_name: uploadedFile?.filename || "",
      };
      const res = await api.post("/customisation", payload);
      toast.success(res.data.message);
      setForm({ metal_type: "", stone_changes: "", size_changes: "", special_notes: "", reference_description: "" });
      setUploadedFile(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit request");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="customisation-page">
      {/* Process Section */}
      <section className="py-16 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">Custom Design</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] mb-4">CAD to Final Product</h1>
          <p className="text-[#4B5563] mb-16 max-w-lg font-body">Our expert team transforms your vision into precision-crafted jewellery</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-8" data-testid={`custom-step-${i}`}>
                <div className="w-10 h-10 bg-[#359E58] flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">{s.title}</h3>
                <p className="text-sm text-[#4B5563] font-body">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 md:px-12">
          <h2 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A] mb-8">Submit Custom Request</h2>
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="customisation-form">

            {/* File Upload */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">
                Upload CAD File / Sketch / Reference Image
              </Label>
              {!uploadedFile ? (
                <label
                  className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-[#E5E7EB] hover:border-[#4AB868] transition-colors cursor-pointer p-8 bg-[#FAFAFA]"
                  data-testid="custom-file-upload"
                >
                  <FileUp className="w-8 h-8 text-[#4B5563] mb-3" strokeWidth={1.5} />
                  <p className="text-sm text-[#4B5563] font-body mb-1">
                    {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-400 font-body">
                    CAD files, images, PDFs, sketches (max 25MB)
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    accept=".dwg,.dxf,.step,.stp,.iges,.igs,.stl,.3dm,.obj,.pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.ai,.psd,.cdr,.svg"
                    data-testid="custom-file-input"
                  />
                </label>
              ) : (
                <div className="mt-1 flex items-center gap-3 border border-[#6CC284]/30 bg-[#359E58]/5 p-4" data-testid="custom-file-preview">
                  <FileText className="w-8 h-8 text-[#359E58] shrink-0" strokeWidth={1.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0A0A0A] truncate font-body">{uploadedFile.filename}</p>
                    <p className="text-xs text-[#4B5563] font-body">{formatFileSize(uploadedFile.size)}</p>
                  </div>
                  <button type="button" onClick={removeFile} className="text-[#4B5563] hover:text-red-500 p-1" data-testid="custom-file-remove">
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Metal Type</Label>
              <Select value={form.metal_type} onValueChange={(v) => setForm({...form, metal_type: v})}>
                <SelectTrigger className="mt-1 rounded-sm border-[#E5E7EB]" data-testid="custom-metal-type">
                  <SelectValue placeholder="Select Metal Type" />
                </SelectTrigger>
                <SelectContent>
                  {["White Gold","Yellow Gold","Rose Gold","Platinum","Silver"].map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Stone Changes</Label>
              <Textarea name="stone_changes" value={form.stone_changes} onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]" placeholder="Describe desired stone changes..." data-testid="custom-stone-changes" />
            </div>

            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Size Changes</Label>
              <Input name="size_changes" value={form.size_changes} onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]" placeholder="Specify size requirements" data-testid="custom-size-changes" />
            </div>

            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">
                Reference Description / Image URL <span className="normal-case tracking-normal font-normal text-gray-400">(Optional)</span>
              </Label>
              <Textarea name="reference_description" value={form.reference_description} onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]" placeholder="Paste image URL or describe your reference design..." data-testid="custom-reference" />
            </div>

            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563] font-body">Special Notes</Label>
              <Textarea name="special_notes" value={form.special_notes} onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]" placeholder="Any additional instructions..." data-testid="custom-special-notes" />
            </div>

            <Button type="submit" disabled={loading}
              className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium"
              data-testid="customisation-submit-button">
              {loading ? "Submitting..." : "Submit Custom Request"}
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
