import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload,
  Palette,
  Ruler,
  Gem,
  X,
  Image as ImageIcon,
} from "lucide-react";

const PROCESS_STEPS = [
  {
    icon: Upload,
    title: "Share Your Vision",
    desc: "Upload sketches, CAD files, reference images, or describe your design idea in detail",
  },
  {
    icon: Palette,
    title: "CAD Design",
    desc: "Our team creates a precise CAD rendering of your design within 24-48 hours",
  },
  {
    icon: Gem,
    title: "Refinement",
    desc: "Review the CAD design and request modifications until it's perfect",
  },
  {
    icon: Ruler,
    title: "Production",
    desc: "Your approved design goes into production with precision craftsmanship",
  },
];

const BANGLE_OPTIONS = [
  { value: "anna_2", label: "2 Anna" },
  { value: "anna_2_1", label: "2/1 Anna" },
  { value: "anna_2_2", label: "2/2 Anna" },
  { value: "anna_2_3", label: "2/3 Anna" },
  { value: "anna_2_4", label: "2/4 Anna" },
  { value: "anna_2_5", label: "2/5 Anna" },
  { value: "anna_2_6", label: "2/6 Anna" },
  { value: "anna_2_7", label: "2/7 Anna" },
  { value: "anna_3", label: "3 Anna" },
];

const BRACELET_OPTIONS = [
  { value: "br_6_00", label: "6.00 inch" },
  { value: "br_6_25", label: "6.25 inch" },
  { value: "br_6_50", label: "6.50 inch" },
  { value: "br_6_75", label: "6.75 inch" },
  { value: "br_7_00", label: "7.00 inch" },
  { value: "br_7_25", label: "7.25 inch" },
  { value: "br_7_50", label: "7.50 inch" },
  { value: "br_7_75", label: "7.75 inch" },
  { value: "br_8_00", label: "8.00 inch" },
  { value: "br_8_25", label: "8.25 inch" },
  { value: "br_8_50", label: "8.50 inch" },
];

const CHAIN_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: `ch_${16 + i}`,
  label: `${16 + i} inch`,
}));

const MULTILAYER_OPTIONS = [
  { value: "ml_1", label: "14 - 15.5 - 17 inch" },
  { value: "ml_2", label: "14.5 - 16 - 17.5 inch" },
  { value: "ml_3", label: "14 - 15.5 inch" },
  { value: "ml_4", label: "14.5 - 16 inch" },
];

const MANGALSUTRA_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: `ms_${16 + i}`,
  label: `${16 + i} inch`,
}));

const NECKLACE_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: `nk_${14 + i}`,
  label: `${14 + i} inch`,
}));

const PENDANT_CHAIN_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: `pdch_${16 + i}`,
  label: `${16 + i} inch`,
}));

const RING_OPTIONS = Array.from({ length: 30 }, (_, i) => ({
  value: `r${i + 1}`,
  label: `${i + 1}`,
}));

const WATCH_BELT_OPTIONS = [
  { value: "wb_6_00", label: "6.00 inch" },
  { value: "wb_6_25", label: "6.25 inch" },
  { value: "wb_6_50", label: "6.50 inch" },
  { value: "wb_6_75", label: "6.75 inch" },
  { value: "wb_7_00", label: "7.00 inch" },
  { value: "wb_7_25", label: "7.25 inch" },
  { value: "wb_7_50", label: "7.50 inch" },
  { value: "wb_7_75", label: "7.75 inch" },
  { value: "wb_8_00", label: "8.00 inch" },
  { value: "wb_8_25", label: "8.25 inch" },
  { value: "wb_8_50", label: "8.50 inch" },
];

const FULL_SET_CHAIN_OPTIONS = Array.from({ length: 9 }, (_, i) => ({
  value: `fsch_${16 + i}`,
  label: `${16 + i} inch`,
}));

const FULL_SET_NECKLACE_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: `fsnk_${14 + i}`,
  label: `${14 + i} inch`,
}));

const STONE_OPTIONS = [
  { value: "natural_diamond", label: "Natural Diamond" },
  { value: "lab_grown_diamond", label: "Lab Grown Diamond" },
  { value: "cz", label: "CZ" },
  { value: "colour_stone", label: "Colour Stone" },
  { value: "precious_stone", label: "Precious Stone" },
  { value: "other", label: "Other" },
];

const FINISH_OPTIONS = [
  { value: "high_polish", label: "High Polish" },
  { value: "matt", label: "Matt" },
  { value: "sandblast", label: "Sandblast" },
  { value: "matt_high_polish", label: "Matt + High Polish" },
  { value: "other", label: "Other" },
];

const CATEGORY_OPTIONS = [
  { value: "bali", label: "Bali" },
  { value: "bangle_kada", label: "Bangle/Kada" },
  { value: "bracelet", label: "Bracelet" },
  { value: "chain_multilayer", label: "Chain + Multilayer" },
  { value: "cufflink", label: "Cufflink" },
  { value: "brooch", label: "Brooch" },
  { value: "earring", label: "Earring" },
  { value: "haathpaan", label: "Haathpaan" },
  { value: "maang_tikka", label: "Maang Tikka" },
  { value: "mangalsutra", label: "Mangal Sutra" },
  { value: "necklace", label: "Necklace" },
  { value: "nose_pin", label: "Nose Pin" },
  {
    value: "pendant_dancing_stone",
    label: "Pendant + Dancing Stone",
  },
  {
    value: "ring_titanium",
    label: "Ring + Titanium Ring",
  },
  { value: "tops", label: "Tops" },
  { value: "watch_belt", label: "Watch Belt" },
  { value: "full_set", label: "Full Set" },
];

const initialForm = {
  order_type: "custom",
  customer_name: "",

  metal: "",
  gold_kt: "",
  gold_colour: "",
  gold_colour_other: "",

  platinum_purity: "",
  metal_colour_platinum: "",

  metal_purity_combo: "",
  metal_colour_combo: "",
  metal_colour_combo_other: "",

  order_date: "",
  party_reference_order_id: "",

  product_category: "",

  bali_size: "",
  bangle_kada_size1: "",
  bangle_kada_size2: "",
  bracelet_size: "",

  need_multilayer: "",
  multilayer_chain_size: "",
  chain_size: "",

  cufflink_size: "",
  brooch_size: "",
  earring_size: "",
  haathpaan_size: "",
  maang_tikka_size: "",

  mangalsutra_size: "",
  necklace_size: "",
  nose_pin_size: "",

  pendant_chain_size: "",
  pendant_size_optional: "",

  ring_size: "",
  tops_size: "",
  watch_belt_size: "",

  full_set_choice_1: "",
  full_set_choice_2: "",
  full_set_chain_size: "",
  full_set_necklace_size: "",
  full_set_tops_size: "",
  full_set_earring_size: "",

  approx_weight: "",

  stone_type: "",
  stone_type_other: "",

  finish_type: "",
  finish_type_other: "",

  hallmark_required: "",
  need_call: "",
  due_date: "",
  remarks: "",
  reference_link: "",
};

export default function CustomisationPage() {
  const { api } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelect = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (uploadedFiles.length + files.length > 4) {
      toast.error("You can upload a maximum of 4 images.");
      e.target.value = "";
      return;
    }

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`"${file.name}" is larger than 10MB.`);
        e.target.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image.`);
        e.target.value = "";
        return;
      }
    }

    setUploading(true);

    try {
      const newUploads = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await api.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        newUploads.push({
          path: res.data.path,
          filename: res.data.filename,
          size: res.data.size,
          original_name: file.name,
        });
      }

      setUploadedFiles((prev) => [...prev, ...newUploads]);

      toast.success(
        `${newUploads.length} image${
          newUploads.length > 1 ? "s" : ""
        } uploaded successfully`
      );
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Image upload failed"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const validateForm = () => {
    if (!form.customer_name.trim()) {
      toast.error("Please enter customer name");
      return false;
    }

    if (!form.metal) {
      toast.error("Please select a metal");
      return false;
    }

    if (form.metal === "gold") {
      if (!form.gold_kt) {
        toast.error("Please select Gold Purity");
        return false;
      }

      if (!form.gold_colour) {
        toast.error("Please select Gold Colour");
        return false;
      }

      if (
        form.gold_colour === "other" &&
        !form.gold_colour_other.trim()
      ) {
        toast.error("Please specify Gold Colour");
        return false;
      }
    }

    if (form.metal === "platinum") {
      if (!form.platinum_purity) {
        toast.error("Please select Platinum Purity");
        return false;
      }

      if (!form.metal_colour_platinum) {
        toast.error("Please select Platinum Colour");
        return false;
      }
    }

    if (form.metal === "gold_platinum") {
      if (!form.metal_purity_combo) {
        toast.error("Please select Metal Purity");
        return false;
      }

      if (!form.metal_colour_combo) {
        toast.error("Please select Metal Colour");
        return false;
      }
    }

    if (!form.order_date) {
      toast.error("Please select Order Date");
      return false;
    }

    if (!form.product_category) {
      toast.error("Please select Product Category");
      return false;
    }

    if (
      form.product_category === "chain_multilayer" &&
      !form.need_multilayer
    ) {
      toast.error("Please select whether you need Multilayer Chain");
      return false;
    }

    if (
      form.product_category === "chain_multilayer" &&
      form.need_multilayer === "yes" &&
      !form.multilayer_chain_size
    ) {
      toast.error("Please select Multilayer Chain Size");
      return false;
    }

    if (
      form.product_category === "chain_multilayer" &&
      form.need_multilayer === "no" &&
      !form.chain_size
    ) {
      toast.error("Please select Chain Size");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      !form.full_set_choice_1
    ) {
      toast.error("Please select Chain or Necklace");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      !form.full_set_choice_2
    ) {
      toast.error("Please select Tops or Earring");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      form.full_set_choice_1 === "chain" &&
      !form.full_set_chain_size
    ) {
      toast.error("Please select Full Set Chain Size");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      form.full_set_choice_1 === "necklace" &&
      !form.full_set_necklace_size
    ) {
      toast.error("Please select Full Set Necklace Size");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      form.full_set_choice_2 === "tops" &&
      !form.full_set_tops_size.trim()
    ) {
      toast.error("Please enter Full Set Tops Size");
      return false;
    }

    if (
      form.product_category === "full_set" &&
      form.full_set_choice_2 === "earring" &&
      !form.full_set_earring_size.trim()
    ) {
      toast.error("Please enter Full Set Earring Size");
      return false;
    }

    if (!form.approx_weight.trim()) {
      toast.error("Please enter Weight (g)");
      return false;
    }

    if (!form.stone_type) {
      toast.error("Please select Stone Type");
      return false;
    }

    if (
      form.stone_type === "other" &&
      !form.stone_type_other.trim()
    ) {
      toast.error("Please specify Stone Type");
      return false;
    }

    if (!form.finish_type) {
      toast.error("Please select Finish Type");
      return false;
    }

    if (
      form.finish_type === "other" &&
      !form.finish_type_other.trim()
    ) {
      toast.error("Please specify Finish Type");
      return false;
    }

    if (!form.hallmark_required) {
      toast.error("Please select Hallmark Required");
      return false;
    }

    if (!form.need_call) {
      toast.error("Please select Call Required");
      return false;
    }

    if (!form.due_date) {
      toast.error("Please select Due Date");
      return false;
    }

    if (uploadedFiles.length < 1) {
      toast.error("Please upload at least 1 reference image");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        ...form,
        design_images: uploadedFiles,
      };

      const res = await api.post(
        "/customisation",
        payload
      );

      toast.success(
        res.data.message ||
          "Customisation request submitted successfully!"
      );

      setForm(initialForm);
      setUploadedFiles([]);
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Failed to submit request"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSelect = (
    name,
    placeholder,
    options
  ) => (
    <Select
      value={form[name]}
      onValueChange={(value) =>
        handleSelect(name, value)
      }
    >
      <SelectTrigger className="mt-1 rounded-sm border-[#E5E7EB]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div data-testid="customisation-page">

      {/* PROCESS SECTION */}
      <section className="py-16 md:py-24 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#359E58] mb-3 font-body">
            Custom Design
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium text-[#0A0A0A] mb-4">
            CAD to Final Product
          </h1>

          <p className="text-[#4B5563] mb-16 max-w-lg font-body">
            Our expert team transforms your vision into precision-crafted jewellery
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROCESS_STEPS.map((s, i) => (
              <div
                key={i}
                className="bg-white border border-[#E5E7EB] p-8"
                data-testid={`custom-step-${i}`}
              >
                <div className="w-10 h-10 bg-[#359E58] flex items-center justify-center mb-4">
                  <s.icon
                    className="w-5 h-5 text-white"
                    strokeWidth={1.5}
                  />
                </div>

                <h3 className="text-lg font-medium text-[#0A0A0A] mb-2">
                  {s.title}
                </h3>

                <p className="text-sm text-[#4B5563] font-body">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="py-16 md:py-24">
        <div className="max-w-2xl mx-auto px-6 md:px-12">

          <h2 className="text-2xl sm:text-3xl font-medium text-[#0A0A0A] mb-8">
            Submit Custom Request
          </h2>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
            data-testid="customisation-form"
          >

            {/* CUSTOMER NAME */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Customer Name
              </Label>

              <Input
                name="customer_name"
                value={form.customer_name}
                onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]"
                placeholder="Enter customer name"
              />
            </div>

            {/* METAL */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Metal
              </Label>

              {renderSelect(
                "metal",
                "Select Metal",
                [
                  { value: "gold", label: "Gold" },
                  {
                    value: "platinum",
                    label: "Platinum",
                  },
                  {
                    value: "gold_platinum",
                    label: "Gold + Platinum",
                  },
                ]
              )}
            </div>

            {/* GOLD */}
            {form.metal === "gold" && (
              <>
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Gold Purity (KT)
                  </Label>

                  {renderSelect(
                    "gold_kt",
                    "Select Gold KT",
                    [
                      {
                        value: "9KT",
                        label: "9KT",
                      },
                      {
                        value: "14KT",
                        label: "14KT",
                      },
                      {
                        value: "18KT",
                        label: "18KT",
                      },
                      {
                        value: "22KT",
                        label: "22KT",
                      },
                    ]
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Gold Colour
                  </Label>

                  {renderSelect(
                    "gold_colour",
                    "Select Gold Colour",
                    [
                      {
                        value: "yellow",
                        label: "Yellow",
                      },
                      {
                        value: "white",
                        label: "White",
                      },
                      {
                        value: "rose",
                        label: "Rose",
                      },
                      {
                        value: "yellow_white",
                        label: "Yellow + White",
                      },
                      {
                        value: "rose_white",
                        label: "Rose + White",
                      },
                      {
                        value: "rose_yellow",
                        label: "Rose + Yellow",
                      },
                      {
                        value: "rose_white_yellow",
                        label:
                          "Rose + White + Yellow",
                      },
                      {
                        value: "green",
                        label: "Green",
                      },
                      {
                        value: "green_white",
                        label: "Green + White",
                      },
                      {
                        value: "green_yellow",
                        label: "Green + Yellow",
                      },
                      {
                        value: "green_rose",
                        label: "Green + Rose",
                      },
                      {
                        value: "other",
                        label: "Other",
                      },
                    ]
                  )}
                </div>

                {form.gold_colour === "other" && (
                  <div>
                    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                      Specify Gold Colour
                    </Label>

                    <Input
                      name="gold_colour_other"
                      value={form.gold_colour_other}
                      onChange={handleChange}
                      className="mt-1 rounded-sm border-[#E5E7EB]"
                      placeholder="Specify Gold Colour"
                    />
                  </div>
                )}
              </>
            )}

            {/* PLATINUM */}
            {form.metal === "platinum" && (
              <>
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Platinum Purity
                  </Label>

                  {renderSelect(
                    "platinum_purity",
                    "Select Platinum Purity",
                    [
                      {
                        value: "95_platinum",
                        label: "95 Platinum",
                      },
                    ]
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Platinum Colour
                  </Label>

                  {renderSelect(
                    "metal_colour_platinum",
                    "Select Metal Colour",
                    [
                      {
                        value: "white",
                        label: "White",
                      },
                    ]
                  )}
                </div>
              </>
            )}

            {/* GOLD + PLATINUM */}
            {form.metal === "gold_platinum" && (
              <>
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Metal Purity
                  </Label>

                  {renderSelect(
                    "metal_purity_combo",
                    "Select Metal Purity",
                    [
                      {
                        value: "95p_9kt",
                        label: "95(P) + 9KT",
                      },
                      {
                        value: "95p_14kt",
                        label: "95(P) + 14KT",
                      },
                      {
                        value: "95p_18kt",
                        label: "95(P) + 18KT",
                      },
                    ]
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Metal Colour
                  </Label>

                  {renderSelect(
                    "metal_colour_combo",
                    "Select Metal Colour",
                    [
                      {
                        value: "white",
                        label: "White",
                      },
                      {
                        value: "yellow_white",
                        label: "Yellow + White",
                      },
                      {
                        value: "rose_white",
                        label: "Rose + White",
                      },
                      {
                        value: "green_white",
                        label: "Green + White",
                      },
                      {
                        value: "rose_white_yellow",
                        label:
                          "Rose + White + Yellow",
                      },
                    ]
                  )}
                </div>
              </>
            )}

            {/* ORDER DATE */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Order Date
              </Label>

              <Input
                type="date"
                name="order_date"
                value={form.order_date}
                onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]"
              />
            </div>

            {/* PARTY REFERENCE */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Party Reference Order ID
              </Label>

              <Input
                name="party_reference_order_id"
                value={form.party_reference_order_id}
                onChange={handleChange}
                className="mt-1 rounded-sm border-[#E5E7EB]"
                placeholder="Enter Party Reference Order ID"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Product Category
              </Label>

              {renderSelect(
                "product_category",
                "Select Product Category",
                CATEGORY_OPTIONS
              )}
            </div>

            {/* BALI */}
            {form.product_category === "bali" && (
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                  Bali Size
                </Label>

                <Input
                  name="bali_size"
                  value={form.bali_size}
                  onChange={handleChange}
                  className="mt-1 rounded-sm border-[#E5E7EB]"
                  placeholder="Enter Bali Size"
                />
              </div>
            )}

            {/* BANGLE / KADA */}
            {form.product_category === "bangle_kada" && (
              <>
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Size 1
                  </Label>

                  {renderSelect(
                    "bangle_kada_size1",
                    "Select Size 1",
                    BANGLE_OPTIONS
                  )}
                </div>

                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Size 2
                  </Label>

                  {renderSelect(
                    "bangle_kada_size2",
                    "Select Size 2",
                    BANGLE_OPTIONS
                  )}
                </div>
              </>
            )}

            {/* BRACELET */}
            {form.product_category === "bracelet" && (
              <div>
                <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                  Bracelet Size
                </Label>

                {renderSelect(
                  "bracelet_size",
                  "Select Bracelet Size",
                  BRACELET_OPTIONS
                )}
              </div>
            )}

            {/* CHAIN + MULTILAYER */}
            {form.product_category === "chain_multilayer" && (
              <>
                <div>
                  <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                    Need Multilayer Chain?
                  </Label>

                  {renderSelect(
                    "need_multilayer",
                    "Select",
                    [
                      {
                        value: "yes",
                        label: "Yes",
                      },
                      {
                        value: "no",
                        label: "No",
                      },
                    ]
                  )}
                </div>

                {form.need_multilayer === "yes" && (
                  <div>
                    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                      Multilayer Chain Size
                    </Label>

                    {renderSelect(
                      "multilayer_chain_size",
                      "Select Multilayer Chain Size",
                      MULTILAYER_OPTIONS
                    )}
                  </div>
                )}

                {form.need_multilayer === "no" && (
                  <div>
                    <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                      Chain Size
                    </Label>

                    {renderSelect(
                      "chain_size",
                      "Select Chain Size",
                      CHAIN_OPTIONS
                    )}
                  </div>
                )}
              </>
            )}

            {/* CUFFLINK */}
            {form.product_category === "cufflink" && (
              <div>
                <Label>Cufflink Size</Label>

                <Input
                  name="cufflink_size"
                  value={form.cufflink_size}
                  onChange={handleChange}
                  placeholder="Enter Cufflink Size"
                />
              </div>
            )}

            {/* BROOCH */}
            {form.product_category === "brooch" && (
              <div>
                <Label>Brooch Size</Label>

                <Input
                  name="brooch_size"
                  value={form.brooch_size}
                  onChange={handleChange}
                  placeholder="Enter Brooch Size"
                />
              </div>
            )}

            {/* EARRING */}
            {form.product_category === "earring" && (
              <div>
                <Label>Earring Size</Label>

                <Input
                  name="earring_size"
                  value={form.earring_size}
                  onChange={handleChange}
                  placeholder="Enter Earring Size"
                />
              </div>
            )}

            {/* HAATHPAAN */}
            {form.product_category === "haathpaan" && (
              <div>
                <Label>Haathpaan Size</Label>

                <Input
                  name="haathpaan_size"
                  value={form.haathpaan_size}
                  onChange={handleChange}
                  placeholder="Enter Haathpaan Size"
                />
              </div>
            )}

            {/* MAANG TIKKA */}
            {form.product_category === "maang_tikka" && (
              <div>
                <Label>Maang Tikka Size</Label>

                <Input
                  name="maang_tikka_size"
                  value={form.maang_tikka_size}
                  onChange={handleChange}
                  placeholder="Enter Maang Tikka Size"
                />
              </div>
            )}

            {/* MANGAL SUTRA */}
            {form.product_category === "mangalsutra" && (
              <div>
                <Label>Mangal Sutra Size</Label>

                {renderSelect(
                  "mangalsutra_size",
                  "Select Mangal Sutra Size",
                  MANGALSUTRA_OPTIONS
                )}
              </div>
            )}

            {/* NECKLACE */}
            {form.product_category === "necklace" && (
              <div>
                <Label>Necklace Size</Label>

                {renderSelect(
                  "necklace_size",
                  "Select Necklace Size",
                  NECKLACE_OPTIONS
                )}
              </div>
            )}

            {/* NOSE PIN */}
            {form.product_category === "nose_pin" && (
              <div>
                <Label>Nose Pin Size</Label>

                <Input
                  name="nose_pin_size"
                  value={form.nose_pin_size}
                  onChange={handleChange}
                  placeholder="Enter Nose Pin Size"
                />
              </div>
            )}

            {/* PENDANT */}
            {form.product_category ===
              "pendant_dancing_stone" && (
              <>
                <div>
                  <Label>Chain Size</Label>

                  {renderSelect(
                    "pendant_chain_size",
                    "Select Chain Size",
                    PENDANT_CHAIN_OPTIONS
                  )}
                </div>

                <div>
                  <Label>Pendant Size</Label>

                  <Input
                    name="pendant_size_optional"
                    value={form.pendant_size_optional}
                    onChange={handleChange}
                    placeholder="Enter Pendant Size"
                  />
                </div>
              </>
            )}

            {/* RING */}
            {form.product_category === "ring_titanium" && (
              <div>
                <Label>Ring Size</Label>

                {renderSelect(
                  "ring_size",
                  "Select Ring Size",
                  RING_OPTIONS
                )}
              </div>
            )}

            {/* TOPS */}
            {form.product_category === "tops" && (
              <div>
                <Label>Tops Size</Label>

                <Input
                  name="tops_size"
                  value={form.tops_size}
                  onChange={handleChange}
                  placeholder="Enter Tops Size"
                />
              </div>
            )}

            {/* WATCH BELT */}
            {form.product_category === "watch_belt" && (
              <div>
                <Label>Watch Belt Size</Label>

                {renderSelect(
                  "watch_belt_size",
                  "Select Watch Belt Size",
                  WATCH_BELT_OPTIONS
                )}
              </div>
            )}

            {/* FULL SET */}
            {form.product_category === "full_set" && (
              <>
                <div>
                  <Label>Do you need?</Label>

                  {renderSelect(
                    "full_set_choice_1",
                    "Select",
                    [
                      {
                        value: "chain",
                        label: "Chain",
                      },
                      {
                        value: "necklace",
                        label: "Necklace",
                      },
                    ]
                  )}
                </div>

                {form.full_set_choice_1 === "chain" && (
                  <div>
                    <Label>Chain Size</Label>

                    {renderSelect(
                      "full_set_chain_size",
                      "Select Chain Size",
                      FULL_SET_CHAIN_OPTIONS
                    )}
                  </div>
                )}

                {form.full_set_choice_1 === "necklace" && (
                  <div>
                    <Label>Necklace Size</Label>

                    {renderSelect(
                      "full_set_necklace_size",
                      "Select Necklace Size",
                      FULL_SET_NECKLACE_OPTIONS
                    )}
                  </div>
                )}

                <div>
                  <Label>Do you need?</Label>

                  {renderSelect(
                    "full_set_choice_2",
                    "Select",
                    [
                      {
                        value: "tops",
                        label: "Tops",
                      },
                      {
                        value: "earring",
                        label: "Earring",
                      },
                    ]
                  )}
                </div>

                {form.full_set_choice_2 === "tops" && (
                  <div>
                    <Label>Tops Size</Label>

                    <Input
                      name="full_set_tops_size"
                      value={form.full_set_tops_size}
                      onChange={handleChange}
                      placeholder="Enter Tops Size"
                    />
                  </div>
                )}

                {form.full_set_choice_2 === "earring" && (
                  <div>
                    <Label>Earring Size</Label>

                    <Input
                      name="full_set_earring_size"
                      value={form.full_set_earring_size}
                      onChange={handleChange}
                      placeholder="Enter Earring Size"
                    />
                  </div>
                )}
              </>
            )}

            {/* WEIGHT */}
            <div>
              <Label>Weight (g)</Label>

              <Input
                name="approx_weight"
                value={form.approx_weight}
                onChange={handleChange}
                placeholder="Enter approximate weight"
              />
            </div>

            {/* STONE TYPE */}
            <div>
              <Label>Stone Type</Label>

              {renderSelect(
                "stone_type",
                "Select Stone Type",
                STONE_OPTIONS
              )}
            </div>

            {/* OTHER STONE */}
            {form.stone_type === "other" && (
              <div>
                <Label>Specify Stone Type</Label>

                <Input
                  name="stone_type_other"
                  value={form.stone_type_other}
                  onChange={handleChange}
                  placeholder="Specify Stone Type"
                />
              </div>
            )}

            {/* FINISH */}
            <div>
              <Label>Finish Type</Label>

              {renderSelect(
                "finish_type",
                "Select Finish Type",
                FINISH_OPTIONS
              )}
            </div>

            {/* OTHER FINISH */}
            {form.finish_type === "other" && (
              <div>
                <Label>Specify Finish Type</Label>

                <Input
                  name="finish_type_other"
                  value={form.finish_type_other}
                  onChange={handleChange}
                  placeholder="Specify Finish Type"
                />
              </div>
            )}

            {/* HALLMARK */}
            <div>
              <Label>Hallmark Required</Label>

              {renderSelect(
                "hallmark_required",
                "Hallmark Required?",
                [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ]
              )}
            </div>

            {/* CALL */}
            <div>
              <Label>Call Required?</Label>

              {renderSelect(
                "need_call",
                "Call Required?",
                [
                  {
                    value: "yes",
                    label: "Yes",
                  },
                  {
                    value: "no",
                    label: "No",
                  },
                ]
              )}
            </div>

            {/* DUE DATE */}
            <div>
              <Label>Due Date</Label>

              <Input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>

            {/* REMARKS */}
            <div>
              <Label>Remarks</Label>

              <Textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
              />
            </div>

            {/* REFERENCE LINK */}
            <div>
              <Label>
                Reference Image/Video Link
              </Label>

              <Input
                name="reference_link"
                value={form.reference_link}
                onChange={handleChange}
                placeholder="Reference link"
              />
            </div>

            {/* REFERENCE IMAGES */}
            <div>
              <Label className="text-xs font-semibold tracking-wider uppercase text-[#4B5563]">
                Reference Images (Upload 1–4 Images)
              </Label>

              <div className="mt-2 border border-dashed border-[#D1D5DB] rounded-sm p-6">

                <div className="flex flex-col items-center justify-center text-center">

                  <ImageIcon className="w-8 h-8 text-[#6B7280] mb-3" />

                  <p className="text-sm text-[#4B5563] mb-1">
                    Upload reference images
                  </p>

                  <p className="text-xs text-[#9CA3AF] mb-4">
                    Maximum 4 images · Maximum 10MB each
                  </p>

                  <label className="cursor-pointer">

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={
                        uploading ||
                        uploadedFiles.length >= 4
                      }
                    />

                    <span className="inline-flex items-center gap-2 bg-[#359E58] hover:bg-[#2e884c] text-white px-4 py-2 rounded-sm text-sm">
                      <Upload className="w-4 h-4" />
                      {uploading
                        ? "Uploading..."
                        : "Choose Images"}
                    </span>

                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-5 grid grid-cols-2 gap-3">

                    {uploadedFiles.map((file, index) => (
                      <div
                        key={`${file.path}-${index}`}
                        className="relative border border-[#E5E7EB] rounded-sm p-2 bg-white"
                      >

                        <div className="flex items-center gap-2">

                          <ImageIcon className="w-5 h-5 text-[#359E58]" />

                          <span className="text-xs text-[#4B5563] truncate flex-1">
                            {file.original_name ||
                              file.filename}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeFile(index)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>

                        </div>

                      </div>
                    ))}

                  </div>
                )}

              </div>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              disabled={loading || uploading}
              className="w-full bg-[#359E58] hover:bg-[#2e884c] text-white rounded-sm py-6 text-sm font-medium"
            >
              {loading
                ? "Submitting..."
                : "Submit Order"}
            </Button>

          </form>
        </div>
      </section>
    </div>
  );
}