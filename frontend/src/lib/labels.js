// ============================================================
// FLOW OPTION LABELS
// ------------------------------------------------------------
// Mirrors backend/pdf_service.py -> OPTION_LABELS + display_value
// so the Admin Dashboard, PDF and Excel all show identical text.
//
// If you add a new option to the WhatsApp Flow, add it here AND
// in backend/pdf_service.py.
// ============================================================

export const OPTION_LABELS = {

    // ---------------- ORDER TYPE ----------------
    catalogue: "Catalogue Order",
    custom: "Custom Jewellery Order",
  
    // ---------------- METAL ----------------
    gold: "Gold",
    platinum: "Platinum",
    gold_platinum: "Gold + Platinum",
  
    // ---------------- GOLD PURITY ----------------
    "9kt": "9KT",
    "14kt": "14KT",
    "18kt": "18KT",
    "22kt": "22KT",
  
    // ---------------- GOLD / METAL COLOUR ----------------
    yellow: "Yellow",
    white: "White",
    rose: "Rose",
    yellow_white: "Yellow + White",
    rose_white: "Rose + White",
    rose_yellow: "Rose + Yellow",
    rose_white_yellow: "Rose + White + Yellow",
    green: "Green",
    green_white: "Green + White",
    green_yellow: "Green + Yellow",
    green_rose: "Green + Rose",
  
    // ---------------- OTHER ----------------
    other: "Other",
  
    // ---------------- PLATINUM ----------------
    "95_platinum": "95 Platinum",
  
    // ---------------- GOLD + PLATINUM PURITY ----------------
    "95p_9kt": "95(P) + 9KT",
    "95p_14kt": "95(P) + 14KT",
    "95p_18kt": "95(P) + 18KT",
  
    // ---------------- PRODUCT CATEGORY ----------------
    bali: "Bali",
    bangle_kada: "Bangle/Kada",
    bracelet: "Bracelet",
    chain_multilayer: "Chain + Multilayer",
    cufflink: "Cufflink",
    brooch: "Brooch",
    earring: "Earring",
    haathpaan: "Haathpaan",
    maang_tikka: "Maang Tikka",
    mangalsutra: "Mangal Sutra",
    necklace: "Necklace",
    nose_pin: "Nose Pin",
    pendant_dancing_stone: "Pendant + Dancing Stone",
    ring_titanium: "Ring + Titanium Ring",
    tops: "Tops",
    watch_belt: "Watch Belt",
    full_set: "Full Set",
  
    // ---------------- YES / NO ----------------
    yes: "Yes",
    no: "No",
  
    // ---------------- STONE TYPE ----------------
    natural_diamond: "Natural Diamond",
    lab_grown_diamond: "Lab Grown Diamond",
    cz: "CZ",
    colour_stone: "Colour Stone",
    precious_stone: "Precious Stone",
  
    // ---------------- FINISH TYPE ----------------
    high_polish: "High Polish",
    matt: "Matt",
    sandblast: "Sandblast",
    matt_high_polish: "Matt + High Polish",
  
    // ---------------- FULL SET ----------------
    chain: "Chain",
  };
  
  const INCH_SIZE_FIELDS = new Set([
    "chain_size",
    "mangalsutra_size",
    "necklace_size",
    "pendant_chain_size",
    "full_set_chain_size",
    "full_set_necklace_size",
  ]);
  
  const INCH_SIZE_PREFIXES = [
    "ch_",
    "ms_",
    "nk_",
    "pdch_",
    "fsch_",
    "fsnk_",
  ];
  
  const MULTILAYER_LABELS = {
    ml_1: "14 - 15.5 - 17 inch",
    ml_2: "14.5 - 16 - 17.5 inch",
    ml_3: "14 - 15.5 inch",
    ml_4: "14.5 - 16 inch",
  };
  
  // ============================================================
  // DISPLAY VALUE
  // ------------------------------------------------------------
  // Converts the internal value stored in MongoDB into the exact
  // customer-facing text used by the WhatsApp Flow.
  //
  //   displayValue("product_category", "bangle_kada")    -> "Bangle/Kada"
  //   displayValue("bangle_kada_size1", "anna_2_2")      -> "2/2 Anna"
  //   displayValue("bracelet_size", "br_6_00")           -> "6.00 inch"
  //   displayValue("ring_size", "r12")                   -> "12"
  //
  // Anything unknown is returned unchanged, so nothing can break.
  // ============================================================
  
  export function displayValue(fieldName, value) {
  
    if (value === null || value === undefined) {
      return "";
    }
  
    const raw = String(value).trim();
  
    if (!raw) {
      return "";
    }
  
    // ---------------- DIRECT FLOW OPTION ----------------
    if (Object.prototype.hasOwnProperty.call(OPTION_LABELS, raw)) {
      return OPTION_LABELS[raw];
    }
  
    // ---------------- BANGLE / KADA SIZE ----------------
    // anna_2 -> 2 Anna        anna_2_7 -> 2/7 Anna
    if (
      fieldName === "bangle_kada_size1" ||
      fieldName === "bangle_kada_size2"
    ) {
      if (raw.startsWith("anna_")) {
        let size = raw.slice("anna_".length);
  
        if (size.includes("_")) {
          const parts = size.split("_");
  
          if (parts.length === 2) {
            size = `${parts[0]}/${parts[1]}`;
          }
        }
  
        return `${size} Anna`;
      }
    }
  
    // ---------------- BRACELET SIZE ----------------
    // br_6_00 -> 6.00 inch
    if (fieldName === "bracelet_size") {
      if (raw.startsWith("br_")) {
        const size = raw.slice("br_".length).split("_").join(".");
        return `${size} inch`;
      }
    }
  
    // ---------------- CHAIN / NECKLACE SIZES ----------------
    // ch_16 -> 16 inch
    if (INCH_SIZE_FIELDS.has(fieldName)) {
      for (const prefix of INCH_SIZE_PREFIXES) {
        if (raw.startsWith(prefix)) {
          return `${raw.slice(prefix.length)} inch`;
        }
      }
    }
  
    // ---------------- WATCH BELT SIZE ----------------
    // wb_6_00 -> 6.00 inch
    if (fieldName === "watch_belt_size") {
      if (raw.startsWith("wb_")) {
        const size = raw.slice("wb_".length).split("_").join(".");
        return `${size} inch`;
      }
    }
  
    // ---------------- RING SIZE ----------------
    // r12 -> 12
    if (fieldName === "ring_size") {
      const rest = raw.slice(1);
  
      if (raw.startsWith("r") && rest.length > 0 && /^\d+$/.test(rest)) {
        return rest;
      }
    }
  
    // ---------------- MULTILAYER CHAIN ----------------
    if (fieldName === "multilayer_chain_size") {
      if (Object.prototype.hasOwnProperty.call(MULTILAYER_LABELS, raw)) {
        return MULTILAYER_LABELS[raw];
      }
    }
  
    // ---------------- NORMAL TEXT / NUMBERS ----------------
    return raw;
  }
  
  export default displayValue;