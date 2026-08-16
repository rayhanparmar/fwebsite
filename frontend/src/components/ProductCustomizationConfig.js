const selectField = (key, label, options = [], extra = {}) => ({
    key,
    label,
    type: "select",
    options,
    ...extra,
  });
  
  const textField = (key, label, extra = {}) => ({
    key,
    label,
    type: "text",
    ...extra,
  });
  
  const radioField = (key, label, options = [], extra = {}) => ({
    key,
    label,
    type: "radio",
    options,
    ...extra,
  });
  
  const dateField = (key, label, extra = {}) => ({
    key,
    label,
    type: "date",
    ...extra,
  });
  
  const textareaField = (key, label, extra = {}) => ({
    key,
    label,
    type: "textarea",
    ...extra,
  });
  
  const COMMON_FIELDS = [
    selectField("metal", "Metal", [
      "Gold",
      "Platinum",
      "Gold + Platinum",
    ]),
  
    selectField("gold_kt", "Gold Purity (KT)", [
      "9KT",
      "14KT",
      "18KT",
      "22KT",
    ], {
      showWhen: { metal: "Gold" },
    }),
  
    selectField("gold_colour", "Gold Colour", [
      "Yellow",
      "White",
      "Rose",
      "Yellow + White",
      "Rose + White",
      "Rose + Yellow",
      "Rose + White + Yellow",
      "Green",
      "Green + White",
      "Green + Yellow",
      "Green + Rose",
      "Other",
    ], {
      showWhen: { metal: "Gold" },
    }),
  
    textField("gold_colour_other", "Specify Gold Colour", {
      showWhen: {
        metal: "Gold",
        gold_colour: "Other",
      },
    }),
  
    selectField("platinum_purity", "Platinum Purity", [
      "95 Platinum",
    ], {
      showWhen: { metal: "Platinum" },
      autoSelect: "95 Platinum",
    }),
  
    selectField("metal_colour_platinum", "Metal Colour", [
      "White",
    ], {
      showWhen: { metal: "Platinum" },
      autoSelect: "White",
    }),
  
    selectField("metal_purity_combo", "Metal Purity", [
      "95(P) + 9KT",
      "95(P) + 14KT",
      "95(P) + 18KT",
    ], {
      showWhen: { metal: "Gold + Platinum" },
    }),
  
    selectField("metal_colour_combo", "Metal Colour", [
      "White",
      "Yellow + White",
      "Rose + White",
      "Green + White",
      "Rose + White + Yellow",
    ], {
      showWhen: { metal: "Gold + Platinum" },
    }),
  
    textField("metal_colour_combo_other", "Specify Metal Colour", {
      showWhen: {
        metal: "Gold + Platinum",
        metal_colour_combo: "Other",
      },
    }),
  
    selectField("stone_type", "Stone Type", [
      "Natural Diamond",
      "Lab Grown Diamond",
      "CZ",
      "Colour Stone",
      "Precious Stone",
      "Other",
    ]),
  
    textField("stone_type_other", "Specify Stone Type", {
      showWhen: {
        stone_type: "Other",
      },
    }),
  
    selectField("finish_type", "Finish Type", [
      "High Polish",
      "Matt",
      "Sandblast",
      "Matt + High Polish",
      "Other",
    ]),
  
    textField("finish_type_other", "Specify Finish Type", {
      showWhen: {
        finish_type: "Other",
      },
    }),
  
    radioField("hallmark_required", "Hallmark Required", [
      "Yes",
      "No",
    ]),
  
    radioField("need_call", "Call Required?", [
      "Yes",
      "No",
    ]),
  
    dateField("due_date", "Due Date"),
  
    textareaField("remarks", "Remarks"),
  
    textField("approx_weight", "Weight (g)"),
  ];
  
  const CATEGORY_FIELDS = {
    "Bali": [
      textField("bali_size", "Bali Size"),
    ],
  
    "Bangle/Kada": [
      selectField("bangle_kada_size1", "Size 1", [
        "2 Anna",
        "2/1 Anna",
        "2/2 Anna",
        "2/3 Anna",
        "2/4 Anna",
        "2/5 Anna",
        "2/6 Anna",
        "2/7 Anna",
        "3 Anna",
      ]),
  
      selectField("bangle_kada_size2", "Size 2", [
        "2 Anna",
        "2/1 Anna",
        "2/2 Anna",
        "2/3 Anna",
        "2/4 Anna",
        "2/5 Anna",
        "2/6 Anna",
        "2/7 Anna",
        "3 Anna",
      ]),
    ],
  
    "Bracelet": [
      selectField("bracelet_size", "Bracelet Size", [
        "6.00 inch",
        "6.25 inch",
        "6.50 inch",
        "6.75 inch",
        "7.00 inch",
        "7.25 inch",
        "7.50 inch",
        "7.75 inch",
        "8.00 inch",
        "8.25 inch",
        "8.50 inch",
      ]),
    ],
  
    "Chain + Multilayer": [
      radioField("need_multilayer", "Need Multilayer Chain?", [
        "Yes",
        "No",
      ]),
  
      selectField("multilayer_chain_size", "Multilayer Chain Size", [
        "14 - 15.5 - 17 inch",
        "14.5 - 16 - 17.5 inch",
        "14 - 15.5 inch",
        "14.5 - 16 inch",
      ], {
        showWhen: {
          need_multilayer: "Yes",
        },
      }),
  
      selectField("chain_size", "Chain Size", [
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ], {
        showWhen: {
          need_multilayer: "No",
        },
      }),
    ],
  
    "Cufflink": [
      textField("cufflink_size", "Cufflink Size"),
    ],
  
    "Brooch": [
      textField("brooch_size", "Brooch Size"),
    ],
  
    "Earring": [
      textField("earring_size", "Earring Size"),
    ],
  
    "Haathpaan": [
      textField("haathpaan_size", "Haathpaan Size"),
    ],
  
    "Maang Tikka": [
      textField("maang_tikka_size", "Maang Tikka Size"),
    ],
  
    "Mangal Sutra": [
      selectField("mangalsutra_size", "Mangal Sutra Size", [
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ]),
    ],
  
    "Necklace": [
      selectField("necklace_size", "Necklace Size", [
        "14 inch",
        "15 inch",
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ]),
    ],
  
    "Nose Pin": [
      textField("nose_pin_size", "Nose Pin Size"),
    ],
  
    "Pendant + Dancing Stone": [
      selectField("pendant_chain_size", "Chain Size", [
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ]),
  
      textField("pendant_size_optional", "Pendant Size"),
    ],
  
    "Ring + Titanium Ring": [
      selectField("ring_size", "Ring Size", [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
      ]),
    ],
  
    "Tops": [
      textField("tops_size", "Tops Size"),
    ],
  
    "Watch Belt": [
      selectField("watch_belt_size", "Watch Belt Size", [
        "6.00 inch",
        "6.25 inch",
        "6.50 inch",
        "6.75 inch",
        "7.00 inch",
        "7.25 inch",
        "7.50 inch",
        "7.75 inch",
        "8.00 inch",
        "8.25 inch",
        "8.50 inch",
      ]),
    ],
  
    "Full Set": [
      radioField("full_set_choice_1", "Do you need?", [
        "Chain",
        "Necklace",
      ]),
  
      radioField("full_set_choice_2", "Do you need?", [
        "Tops",
        "Earring",
      ]),
  
      selectField("full_set_chain_size", "Chain Size", [
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ], {
        showWhen: {
          full_set_choice_1: "Chain",
        },
      }),
  
      selectField("full_set_necklace_size", "Necklace Size", [
        "14 inch",
        "15 inch",
        "16 inch",
        "17 inch",
        "18 inch",
        "19 inch",
        "20 inch",
        "21 inch",
        "22 inch",
        "23 inch",
        "24 inch",
      ], {
        showWhen: {
          full_set_choice_1: "Necklace",
        },
      }),
  
      textField("full_set_tops_size", "Tops Size", {
        showWhen: {
          full_set_choice_2: "Tops",
        },
      }),
  
      textField("full_set_earring_size", "Earring Size", {
        showWhen: {
          full_set_choice_2: "Earring",
        },
      }),
    ],
  };
  
  const CATEGORY_NAMES = [
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
    "Full Set",
  ];
  
  export const PRODUCT_CUSTOMIZATION_CONFIG = Object.fromEntries(
    CATEGORY_NAMES.map((category) => [
      category,
      {
        fields: [
          ...COMMON_FIELDS,
          ...(CATEGORY_FIELDS[category] || []),
        ],
      },
    ])
  );