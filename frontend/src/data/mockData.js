export const MOCK_PRODUCTS = [
  { id:1, name:"Organic Tomatoes",   farmer:"James Mwangi",   price:80,  unit:"kg",    qty:500,  category:"Vegetables", certified:true,  img:"🍅", location:"Murang'a",    posted:"2 hrs ago" },
  { id:2, name:"Fresh Maize",        farmer:"Grace Wanjiku",  price:45,  unit:"kg",    qty:2000, category:"Grains",     certified:true,  img:"🌽", location:"Eldoret",   posted:"4 hrs ago" },
  { id:3, name:"Irish Potatoes",     farmer:"Peter Kamau",    price:60,  unit:"kg",    qty:800,  category:"Vegetables", certified:false, img:"🥔", location:"Nyandarua", posted:"1 day ago" },
  { id:4, name:"Avocados (Hass)",    farmer:"Mary Achieng",   price:120, unit:"kg",    qty:300,  category:"Fruits",     certified:true,  img:"🥑", location:"Murang'a",  posted:"3 hrs ago" },
  { id:5, name:"Spinach",            farmer:"John Odhiambo",  price:30,  unit:"bunch", qty:200,  category:"Vegetables", certified:false, img:"🥬", location:"Kisumu",    posted:"5 hrs ago" },
  { id:6, name:"Mango (Apple)",      farmer:"Rose Mutua",     price:150, unit:"kg",    qty:450,  category:"Fruits",     certified:true,  img:"🥭", location:"Makueni",   posted:"2 days ago"},
];

export const MOCK_AGRO_INPUTS = [
  { id:1, name:"CAN Fertilizer 50kg", supplier:"AgriVet Plus", price:3200, category:"Fertilizers", certified:true,  img:"🌿", stock:120, quality:"Grade A", badge:"✅ Approved" },
  { id:2, name:"Hybrid Maize Seeds",  supplier:"SeedMaster Co.",price:850,  category:"Seeds",       certified:true,  img:"🌱", stock:500, quality:"Grade A", badge:"✅ Approved" },
  { id:3, name:"DAP Fertilizer 50kg", supplier:"AgroSupply Ltd",price:3800, category:"Fertilizers", certified:true,  img:"🌿", stock:80,  quality:"Grade A", badge:"✅ Approved" },
  { id:4, name:"Pesticide (Dursban)", supplier:"AgriVet Plus", price:1200, category:"Pesticides",   certified:true,  img:"🧪", stock:60,  quality:"Grade A", badge:"✅ Approved" },
  { id:5, name:"Dairy Meal 70kg",     supplier:"FeedMasters",  price:2800, category:"Animal Feeds", certified:true,  img:"🐄", stock:200, quality:"Grade A", badge:"✅ Approved" },
  { id:6, name:"Garden Hoe (Jembe)",  supplier:"ToolsKE Ltd",  price:450,  category:"Farm Tools",   certified:false, img:"⛏️", stock:300, quality:"Standard", badge:"⚠️ Pending" },
];

// Agrovet's own product listings (what they sell)
export const MOCK_AGROVET_PRODUCTS = [
  { id:1, name:"CAN Fertilizer 50kg",  price:3200, category:"Fertilizers",  stock:120, unit:"bag",   status:"approved", sales:48,  img:"🌿", desc:"High-quality Calcium Ammonium Nitrate for top-dressing" },
  { id:2, name:"Pesticide (Dursban)",  price:1200, category:"Pesticides",    stock:60,  unit:"litre", status:"approved", sales:31,  img:"🧪", desc:"Broad-spectrum insecticide for crop protection" },
  { id:3, name:"Organic Compost 20kg", price:650,  category:"Fertilizers",  stock:200, unit:"bag",   status:"pending",  sales:0,   img:"🌱", desc:"Certified organic compost, awaiting admin approval" },
  { id:4, name:"Herbicide (Roundup)",  price:980,  category:"Pesticides",    stock:45,  unit:"litre", status:"approved", sales:22,  img:"🧴", desc:"Post-emergent weed control" },
  { id:5, name:"Dairy Meal 70kg",      price:2800, category:"Animal Feeds",  stock:200, unit:"bag",   status:"approved", sales:15,  img:"🐄", desc:"High-protein dairy feed blend" },
  { id:6, name:"Garden Spray Pump",   price:1800, category:"Farm Tools",    stock:30,  unit:"piece", status:"rejected", sales:0,   img:"💧", desc:"Rejected — missing safety certification" },
];
// ─── RATINGS & REVIEWS ─────────────────────────────────────────────────────────
export const MOCK_RATINGS = [
  { id:1, from:"FreshMart Ltd",   role:"Buyer",   target:"James Mwangi",  targetRole:"Farmer",  score:5, comment:"Excellent quality tomatoes, well-packed and delivered on time. Highly recommend!", date:"18 May 2026", order:"ORD-003", produce:"Avocados (Hass)" },
  { id:2, from:"Unga Mills",      role:"Buyer",   target:"Grace Wanjiku", targetRole:"Farmer",  score:4, comment:"Good maize, certified and fresh. Slight delay in delivery but overall satisfied.", date:"17 May 2026", order:"ORD-002", produce:"Fresh Maize" },
  { id:3, from:"James Mwangi",    role:"Farmer",  target:"AgriVet Plus",  targetRole:"Agrovet", score:5, comment:"Great quality CAN fertilizer, exactly as described. Fast delivery to the farm.", date:"16 May 2026", order:"AVO-001", produce:"CAN Fertilizer" },
  { id:4, from:"Grace Wanjiku",   role:"Farmer",  target:"AgriVet Plus",  targetRole:"Agrovet", score:3, comment:"Fertilizer quality was okay but the bags arrived torn. Packaging needs improvement.", date:"14 May 2026", order:"AVO-002", produce:"DAP Fertilizer" },
  { id:5, from:"Zucasa Export",   role:"Buyer",   target:"James Mwangi",  targetRole:"Farmer",  score:5, comment:"James is a reliable farmer. Produce is consistently certified and high quality.", date:"12 May 2026", order:"ORD-B03", produce:"Avocados (Hass)" },
];
export const PENDING_RATINGS = [
  { orderId:"ORD-001", product:"Organic Tomatoes", counterpart:"FreshMart Ltd",   counterpartRole:"Buyer",   date:"19 May 2026" },
  { orderId:"ORD-B01", product:"Organic Tomatoes", counterpart:"James Mwangi",    counterpartRole:"Farmer",  date:"20 May 2026" },
];

// Officer review notes visible to farmers// Add this to your mockdata.js file
export const MOCK_REVIEW_NOTES = [
  { id:1, farmerId:1, officer:"Dr. Samuel Otieno", date:"14 May 2026", type:"field-visit",
    note:"Conducted field visit to James Mwangi's farm in Murang'a. Farm is 5 acres, well-maintained with proper row spacing. Organic practices confirmed. Soil appears healthy with good drainage. All crops disease-free. Recommending APPROVAL.", status:"positive" },
  { id:2, farmerId:2, officer:"Amara K.", date:"19 May 2026", type:"document-review",
    note:"Grace Wanjiku's application is under review. National ID verified. Still awaiting farm photos and training certificate upload. Please upload remaining documents to proceed. Farm visit scheduled for next week.", status:"neutral" },
  { id:3, farmerId:3, officer:"Njeri W.", date:"20 May 2026", type:"field-visit",
    note:"Field visit completed for Peter Kamau. Farm conditions are generally good. However, soil report is missing — this is mandatory. Additionally, one section of the farm was observed using non-organic pesticides. Please provide soil report and address pesticide use before we can proceed.", status:"warning" },
];
export const TICKET_CATEGORIES = [
  {
    key: "Certification",
    label: "Certification",
    icon: "🏅",
    color: "#1D9E75",
    bg: "#E1F5EE",
    description: "Organic & farm certification applications, status, field visits",
    assignTo: "Extension Officer",
    examples: ["Certification pending", "Field visit scheduling", "Document upload issues"],
  },
  {
    key: "Farm Inputs",
    label: "Farm Inputs",
    icon: "🌿",
    color: "#BA7517",
    bg: "#FAEEDA",
    description: "Fertilizers, seeds, pesticides — quality, supply & counterfeit concerns",
    assignTo: "Admin",
    examples: ["Substandard fertilizer", "Counterfeit seeds", "Delivery issues"],
  },
  {
    key: "Weather & Crops",
    label: "Weather & Crops",
    icon: "🌦️",
    color: "#378ADD",
    bg: "#E6F1FB",
    description: "Crop disease, pest attack, weather damage, agronomic advice",
    assignTo: "Extension Officer",
    examples: ["Leaf yellowing", "Pest infestation", "Drought stress", "Flooding damage"],
  },
  {
    key: "Market & Pricing",
    label: "Market & Pricing",
    icon: "📈",
    color: "#7F77DD",
    bg: "#EEEDFE",
    description: "Unfair pricing, market access, buyer disputes, payment issues",
    assignTo: "Admin",
    examples: ["Buyer not paying", "Price manipulation", "Market listing rejected"],
  },
  {
    key: "Payments & Orders",
    label: "Payments & Orders",
    icon: "💳",
    color: "#E24B4A",
    bg: "#FCEBEB",
    description: "M-Pesa issues, order cancellations, refunds, missing payments",
    assignTo: "Admin",
    examples: ["Payment not received", "Order cancelled", "Wrong amount charged"],
  },
  {
    key: "Transport & Logistics",
    label: "Transport & Logistics",
    icon: "🚚",
    color: "#0F6E56",
    bg: "#E1F5EE",
    description: "Delivery delays, damaged goods in transit, driver issues",
    assignTo: "Admin",
    examples: ["Late delivery", "Produce damaged in transit", "Driver not showing up"],
  },
  {
    key: "Account & Access",
    label: "Account & Access",
    icon: "🔐",
    color: "#888780",
    bg: "#F1EFE8",
    description: "Login problems, account suspension, profile update issues",
    assignTo: "Admin",
    examples: ["Cannot log in", "Account suspended", "Phone number change"],
  },
  {
    key: "Training & Extension",
    label: "Training & Extension",
    icon: "🎓",
    color: "#7F77DD",
    bg: "#EEEDFE",
    description: "Request for training, field demos, extension officer visits",
    assignTo: "Extension Officer",
    examples: ["Request farm visit", "Training workshop", "E-learning access"],
  },
  {
    key: "Other",
    label: "Other",
    icon: "📝",
    color: "#888780",
    bg: "#F1EFE8",
    description: "Any issue not covered by the above categories",
    assignTo: "Admin",
    examples: ["General feedback", "Feature request", "Bug report"],
  },
];


// Support tickets (shared between farmer, extension officer, admin)
export const INITIAL_TICKETS = [
  { id:"TKT-001", farmerId:"james@farm.ke", farmerName:"James Mwangi", county:"Murang'a",
    category:"Certification", subject:"My application has been pending for 2 weeks",
    message:"I submitted my certification application on 5th May and uploaded all documents but haven't received any update. Please advise on the status.",
    status:"open", priority:"high", assignedTo:"Extension Officer", createdAt:"10 May 2026 9:14 AM",
    replies:[
      { from:"Dr. Samuel Otieno", role:"Extension Officer", text:"Hello James, I have received your application and will conduct a field visit to your farm next week. Please ensure your farm is accessible on Monday 19th May.", time:"12 May 2026 11:02 AM", isStaff:true },
      { from:"James Mwangi", role:"Farmer", text:"Thank you officer. The farm will be ready. Please call me on 0712 345 678 when you arrive.", time:"12 May 2026 2:45 PM", isStaff:false },
    ]
  },
  { id:"TKT-002", farmerId:"james@farm.ke", farmerName:"James Mwangi", county:"Murang'a",
    category:"Farm Inputs", subject:"Fertilizer supplier delivering substandard products",
    message:"I ordered DAP fertilizer from AgriVet Plus but the bags I received look different from certified ones. The color is wrong and the granules are smaller than usual. I suspect it may be counterfeit.",
    status:"in-progress", priority:"urgent", assignedTo:"Admin", createdAt:"18 May 2026 3:30 PM",
    replies:[
      { from:"Platform Admin", role:"Admin", text:"Thank you for reporting this James. We have flagged AgriVet Plus for immediate investigation. Please do not use the fertilizer until we confirm its safety. We will update you within 24 hours.", time:"18 May 2026 5:10 PM", isStaff:true },
    ]
  },
  { id:"TKT-003", farmerId:"james@farm.ke", farmerName:"James Mwangi", county:"Murang'a",
    category:"Weather & Crops", subject:"Maize leaves turning yellow after recent rains",
    message:"After the heavy rains last week, I noticed my maize leaves are turning yellow starting from the tips. Some plants are also showing dark spots. Is this a disease or nutrient deficiency? What should I do?",
    status:"resolved", priority:"medium", assignedTo:"Extension Officer", createdAt:"20 May 2026 8:00 AM",
    replies:[
      { from:"Dr. Samuel Otieno", role:"Extension Officer", text:"Hello James. Based on your description, this sounds like Northern Corn Leaf Blight combined with possible nitrogen deficiency caused by waterlogging from the rains. Recommended action: (1) Apply Mancozeb 80WP fungicide, (2) Top-dress with CAN fertilizer once the soil dries, (3) Improve drainage in affected rows.", time:"20 May 2026 10:30 AM", isStaff:true },
      { from:"James Mwangi", role:"Farmer", text:"Thank you doctor. I have applied the fungicide and will wait for the soil to dry before fertilizing. Really appreciate the quick response!", time:"20 May 2026 1:00 PM", isStaff:false },
      { from:"Dr. Samuel Otieno", role:"Extension Officer", text:"Great! Please monitor over the next 5 days. If symptoms persist or worsen, contact us immediately. Marking this ticket as resolved.", time:"21 May 2026 9:00 AM", isStaff:true },
    ]
  },
];

export const MOCK_ORDERS_FARMER = [
  { id:"ORD-001", product:"Organic Tomatoes", buyer:"FreshMart Ltd",  qty:100, total:8000,  status:"pending",   date:"19 May 2026", logistics:null },
  { id:"ORD-002", product:"Fresh Maize",      buyer:"Unga Mills",     qty:500, total:22500, status:"confirmed", date:"18 May 2026", logistics:"Swifthaul Logistics" },
  { id:"ORD-003", product:"Avocados (Hass)",  buyer:"Zucasa Export",  qty:200, total:24000, status:"delivered", date:"17 May 2026", logistics:"GreenRoute Express" },
];

export const MOCK_ORDERS_BUYER = [
  { id:"ORD-B01", product:"Organic Tomatoes", farmer:"James Mwangi", qty:50,  total:4000,  status:"pending",   date:"20 May 2026" },
  { id:"ORD-B02", product:"Fresh Maize",      farmer:"Grace Wanjiku",qty:200, total:9000,  status:"confirmed", date:"18 May 2026" },
  { id:"ORD-B03", product:"Avocados (Hass)",  farmer:"Mary Achieng", qty:100, total:12000, status:"delivered", date:"15 May 2026" },
];

export const MOCK_ORDERS_AGROVET = [
  { id:"AVO-001", product:"Fertilizer 50kg",  buyer:"James Mwangi",  qty:10, total:15000, status:"pending",   date:"20 May 2026", logistics:null },
  { id:"AVO-002", product:"Herbicide 1L",     buyer:"Grace Wanjiku", qty:20, total:8000,  status:"confirmed", date:"19 May 2026", logistics:"Swifthaul Logistics" },
];

// ─── PRIVATE MESSAGING THREADS ────────────────────────────────────────────────
// Each thread declares which two roles can see it.
// Agrovet CANNOT see Farmer↔Buyer threads, Buyer CANNOT see Farmer↔Agrovet threads, etc.
export const PRIVATE_THREADS = {
  "th-farmer-freshmart": {
    participants: ["Farmer", "Buyer"],
    label: { Farmer:"FreshMart Ltd", Buyer:"James Mwangi (Farmer)" },
    avatar: { Farmer:"🏪", Buyer:"👨‍🌾" },
    lastMsg: "Can you deliver to Nairobi by Friday?",
    lastTime: "10:27 AM",
    unread: { Farmer:1, Buyer:0 },
    messages: [
      { id:1, sender:"Buyer",  text:"Hi James, are the tomatoes still available?",       time:"10:23 AM" },
      { id:2, sender:"Farmer", text:"Yes, we still have 400kg ready.",                   time:"10:25 AM" },
      { id:3, sender:"Buyer",  text:"Can you deliver to Nairobi by Friday?",             time:"10:27 AM" },
    ],
  },
  "th-farmer-ungamills": {
    participants: ["Farmer", "Buyer"],
    label: { Farmer:"Unga Mills", Buyer:"Grace Wanjiku (Farmer)" },
    avatar: { Farmer:"🏭", Buyer:"👩‍🌾" },
    lastMsg: "Yes, fully certified. I'll send the docs.",
    lastTime: "Yesterday",
    unread: { Farmer:0, Buyer:0 },
    messages: [
      { id:1, sender:"Buyer",  text:"Interested in 500kg maize, is it certified?",      time:"Yesterday" },
      { id:2, sender:"Farmer", text:"Yes, fully certified. I'll send the docs.",         time:"Yesterday" },
    ],
  },
  "th-farmer-agrivet": {
    participants: ["Farmer", "Agrovet"],
    label: { Farmer:"AgriVet Plus (Agrovet)", Agrovet:"James Mwangi (Farmer)" },
    avatar: { Farmer:"🌿", Agrovet:"👨‍🌾" },
    lastMsg: "Yes, we have 120 bags of CAN in stock.",
    lastTime: "9:05 AM",
    unread: { Farmer:2, Agrovet:0 },
    messages: [
      { id:1, sender:"Farmer",  text:"Do you have CAN fertilizer in stock? Need urgently.", time:"8:50 AM" },
      { id:2, sender:"Agrovet", text:"Yes, we have 120 bags of CAN in stock.",              time:"9:05 AM" },
      { id:3, sender:"Farmer",  text:"Great, I'll place an order today.",                   time:"9:10 AM" },
    ],
  },
  "th-farmer-agrivet2": {
    participants: ["Farmer", "Agrovet"],
    label: { Farmer:"SeedMaster Co. (Agrovet)", Agrovet:"Grace Wanjiku (Farmer)" },
    avatar: { Farmer:"🌱", Agrovet:"👩‍🌾" },
    lastMsg: "Hybrid maize seeds are on special this week.",
    lastTime: "Yesterday",
    unread: { Farmer:0, Agrovet:1 },
    messages: [
      { id:1, sender:"Agrovet", text:"Hybrid maize seeds are on special this week.", time:"Yesterday" },
    ],
  },
  "th-agrovet-buyer": {
    participants: ["Agrovet", "Buyer"],
    label: { Agrovet:"FreshMart Ltd (Buyer)", Buyer:"AgriVet Plus (Agrovet)" },
    avatar: { Agrovet:"🏪", Buyer:"🌿" },
    lastMsg: "Sure, let's discuss bulk supply terms.",
    lastTime: "Yesterday",
    unread: { Agrovet:0, Buyer:1 },
    messages: [
      { id:1, sender:"Buyer",   text:"Can we set up a bulk supply agreement for pesticides?", time:"Yesterday" },
      { id:2, sender:"Agrovet", text:"Sure, let's discuss bulk supply terms.",               time:"Yesterday" },
    ],
  },
  "th-ext-farmer": {
    participants: ["Extension Officer", "Farmer"],
    label: { "Extension Officer":"James Mwangi (Farmer)", Farmer:"Dr. Samuel Otieno (Extension)" },
    avatar: { "Extension Officer":"👨‍🌾", Farmer:"🎓" },
    lastMsg: "Query about certification documents",
    lastTime: "11:00 AM",
    unread: { "Extension Officer":1, Farmer:0 },
    messages: [
      { id:1, sender:"Farmer", text:"Good morning Dr. Otieno, I have a query about my certification documents.", time:"11:00 AM" },
    ],
  },
  "th-admin-farmer": {
    participants: ["Admin", "Farmer"],
    label: { Admin:"James Mwangi (Farmer)", Farmer:"Platform Admin" },
    avatar: { Admin:"👨‍🌾", Farmer:"🛡️" },
    lastMsg: "Your account issue has been escalated.",
    lastTime: "2 hrs ago",
    unread: { Admin:1, Farmer:0 },
    messages: [
      { id:1, sender:"Farmer", text:"I cannot access my dashboard after the update.",      time:"3 hrs ago" },
      { id:2, sender:"Admin",  text:"Your account issue has been escalated to the team.", time:"2 hrs ago" },
    ],
  },
};

export const CERTIFICATIONS = [
  { id:1, farmer:"James Mwangi", status:"approved",  officer:"Otieno S.", date:"12 May 2026", produce:"Vegetables",
    docs:{ nationalId:true, farmPhotos:true, trainingCert:true, soilReport:true },
    certId:"AGC-2026-00123", issued:"12 May 2026", expiry:"12 May 2028", level:"Gold Farmer" },
  { id:2, farmer:"Grace Wanjiku", status:"pending",  officer:"Amara K.",  date:"18 May 2026", produce:"Grains",
    docs:{ nationalId:true, farmPhotos:false, trainingCert:false, soilReport:false },
    certId:null, issued:null, expiry:null, level:null },
  { id:3, farmer:"Peter Kamau",  status:"in-review", officer:"Njeri W.",  date:"19 May 2026", produce:"Vegetables",
    docs:{ nationalId:true, farmPhotos:true, trainingCert:true, soilReport:false },
    certId:null, issued:null, expiry:null, level:null },
];

export const TUTORIALS_DATA = [
  {
    id:1, title:"Introduction to Organic Farming", duration:"12 min",
    category:"Farming Basics", completed:true, uploadedBy:"Amara K.", date:"01 May 2026",
    subtopics:["What is Organic Farming?","Principles of Organic Farming","Benefits for Soil & Health","Getting Certified Organic"],
    questions:[
      { q:"What does organic farming primarily avoid using?", options:["A. Rainwater","B. Synthetic pesticides and fertilizers","C. Manual labour","D. Native seeds"], answer:"B", explanation:"Organic farming avoids synthetic chemicals, relying on natural inputs." },
      { q:"Which of the following is a key principle of organic farming?", options:["A. Maximising synthetic inputs","B. Monoculture cropping only","C. Maintaining biodiversity and ecological balance","D. Using only imported seeds"], answer:"C", explanation:"Organic farming promotes biodiversity and works with natural ecosystems." },
      { q:"What is the main benefit of organic farming for soil?", options:["A. Kills all microorganisms","B. Increases soil acidity","C. Improves soil structure and microbial activity","D. Reduces water retention"], answer:"C", explanation:"Organic matter and compost feed soil microbes and improve texture." },
      { q:"Which certification body oversees organic farming in Kenya?", options:["A. KEBS","B. KEPHIS","C. Kenya Organic Agriculture Network (KOAN)","D. NEMA"], answer:"C", explanation:"KOAN coordinates organic farming standards and certification in Kenya." },
      { q:"How long does organic transition period typically take for a farm?", options:["A. 1 month","B. 2–3 years","C. 10 years","D. 6 months"], answer:"B", explanation:"Farms must go 2–3 years without prohibited substances before certification." },
      { q:"Which input is allowed in certified organic farming?", options:["A. Urea fertilizer","B. Glyphosate herbicide","C. Compost manure","D. DDT pesticide"], answer:"C", explanation:"Compost is a natural, approved organic input that improves soil health." },
    ],
  },
  {
    id:2, title:"Pest Management Without Chemicals", duration:"18 min",
    category:"Crop Protection", completed:true, uploadedBy:"Otieno S.", date:"05 May 2026",
    subtopics:["Integrated Pest Management (IPM)","Biological Controls","Companion Planting","Physical & Cultural Controls"],
    questions:[
      { q:"What does IPM stand for?", options:["A. International Pest Monitoring","B. Integrated Pest Management","C. Internal Plant Monitoring","D. Irrigated Pest Method"], answer:"B", explanation:"IPM combines multiple strategies to manage pests with minimal chemical use." },
      { q:"Which insect is a natural predator of aphids used in biological control?", options:["A. Whitefly","B. Thrips","C. Ladybird beetle","D. Cutworm"], answer:"C", explanation:"Ladybirds (ladybugs) are natural predators that eat aphids." },
      { q:"Which plant is commonly used as a companion to repel pests from tomatoes?", options:["A. Sugarcane","B. Marigold","C. Wheat","D. Eucalyptus"], answer:"B", explanation:"Marigolds release chemicals that repel nematodes and other pests." },
      { q:"What is 'crop rotation' used for in pest management?", options:["A. Increasing irrigation","B. Breaking pest and disease cycles","C. Improving rainfall","D. Reducing labour"], answer:"B", explanation:"Rotating crops disrupts the habitat and lifecycle of crop-specific pests." },
      { q:"Which of these is a cultural control method for pests?", options:["A. Spraying malathion","B. Releasing parasitic wasps","C. Timely planting to avoid pest peaks","D. Using genetically modified crops"], answer:"C", explanation:"Adjusting planting dates to avoid peak pest seasons is a cultural control." },
      { q:"Pheromone traps are used in pest management to:", options:["A. Kill pests with poison","B. Monitor and capture adult insects","C. Repel birds from crops","D. Mark farm boundaries"], answer:"B", explanation:"Pheromone traps attract and trap insects using their natural mating chemicals." },
    ],
  },
  {
    id:3, title:"Soil Health & Composting", duration:"22 min",
    category:"Soil Science", completed:false, uploadedBy:"Njeri W.", date:"10 May 2026",
    subtopics:["Soil pH & Nutrient Cycles","Making Compost at Home","Vermicomposting","Cover Crops & Green Manure"],
    questions:[
      { q:"What is the ideal soil pH range for most vegetable crops?", options:["A. 3.0–4.5","B. 5.5–7.0","C. 8.0–9.5","D. 2.0–3.0"], answer:"B", explanation:"Most vegetables grow best in slightly acidic to neutral soil (pH 5.5–7.0)." },
      { q:"Which material is a 'green' ingredient in composting?", options:["A. Dry leaves","B. Cardboard","C. Fresh grass clippings","D. Wood ash"], answer:"C", explanation:"Green materials are nitrogen-rich, like fresh grass, kitchen scraps, or manure." },
      { q:"What organism is central to vermicomposting?", options:["A. Butterflies","B. Earthworms","C. Beetles","D. Ants"], answer:"B", explanation:"Earthworms break down organic matter into nutrient-rich worm castings." },
      { q:"Cover crops are planted primarily to:", options:["A. Sell at the market","B. Shade other crops","C. Protect and improve soil between main crop seasons","D. Attract pollinators only"], answer:"C", explanation:"Cover crops prevent erosion, fix nitrogen, and add organic matter." },
      { q:"Which micronutrient deficiency causes yellowing between leaf veins (interveinal chlorosis)?", options:["A. Nitrogen","B. Phosphorus","C. Iron","D. Calcium"], answer:"C", explanation:"Iron deficiency causes interveinal chlorosis — yellowing between green veins." },
      { q:"How long does a compost pile typically take to mature?", options:["A. 1 week","B. 1 month","C. 3–6 months","D. 2 years"], answer:"C", explanation:"With proper turning and moisture, compost matures in 3–6 months." },
      { q:"What is the Carbon-to-Nitrogen (C:N) ratio recommended for a healthy compost?", options:["A. 5:1","B. 25–30:1","C. 100:1","D. 1:1"], answer:"B", explanation:"A 25–30:1 C:N ratio ensures proper decomposition and prevents odour." },
    ],
  },
  {
    id:4, title:"Post-Harvest Handling", duration:"15 min",
    category:"Storage", completed:false, uploadedBy:"Amara K.", date:"12 May 2026",
    subtopics:["Harvesting at Right Maturity","Sorting & Grading","Cold Storage Basics","Reducing Post-Harvest Losses"],
    questions:[
      { q:"When is the best time to harvest most vegetables to reduce heat-related spoilage?", options:["A. Midday when sun is highest","B. Early morning or late evening","C. After heavy rain","D. Any time is equally fine"], answer:"B", explanation:"Harvesting in cool hours reduces field heat and slows respiration and spoilage." },
      { q:"What is the purpose of sorting and grading produce?", options:["A. To reduce farm size","B. To separate produce by quality for better pricing","C. To remove irrigation water","D. To package soil"], answer:"B", explanation:"Grading ensures uniform quality, improves presentation, and fetches higher prices." },
      { q:"At what temperature range should most fresh vegetables be cold-stored?", options:["A. 20–25°C","B. 10–15°C","C. 0–8°C","D. -10°C"], answer:"C", explanation:"0–8°C slows microbial growth and enzymatic activity to extend shelf life." },
      { q:"What percentage of harvested food is lost post-harvest in sub-Saharan Africa?", options:["A. 5%","B. 10%","C. 30–40%","D. 80%"], answer:"C", explanation:"Sub-Saharan Africa loses 30–40% of produce between harvest and consumption." },
      { q:"Ethylene gas emitted by which fruit accelerates ripening of nearby produce?", options:["A. Watermelon","B. Lettuce","C. Bananas","D. Avocado"], answer:"C", explanation:"Bananas release high amounts of ethylene, which ripens and spoils nearby fruits faster." },
      { q:"Which packaging material best maintains moisture for leafy vegetables in transit?", options:["A. Open mesh bags","B. Perforated plastic film","C. Sealed metal tins","D. Dry paper bags"], answer:"B", explanation:"Perforated film maintains humidity while allowing gas exchange to prevent condensation." },
    ],
  },
  {
    id:5, title:"Market Pricing Strategies", duration:"10 min",
    category:"Business", completed:false, uploadedBy:"Otieno S.", date:"15 May 2026",
    subtopics:["Understanding Market Prices","Cost of Production","Negotiation Skills","Selling Through Cooperatives"],
    questions:[
      { q:"What is the 'break-even price' for a product?", options:["A. The highest possible price","B. The price at which total revenue equals total cost","C. The government-set maximum price","D. The price charged by competitors"], answer:"B", explanation:"Break-even price is where you cover all costs — profit begins above this price." },
      { q:"Which factor most directly affects farm gate prices in Kenya?", options:["A. Weather in other countries","B. Supply and demand in local markets","C. Number of farm workers","D. Farmer's age"], answer:"B", explanation:"Local supply (harvest volumes) and demand (buyer need) drive farm gate prices." },
      { q:"What is the benefit of selling produce through a farmer cooperative?", options:["A. Higher individual farm costs","B. Reduced negotiating power","C. Access to bulk prices and shared transport costs","D. Less government oversight"], answer:"C", explanation:"Cooperatives aggregate produce to negotiate better prices and share logistics costs." },
      { q:"What does 'value addition' mean for a farmer?", options:["A. Adding more water to produce","B. Processing or packaging produce to increase its selling price","C. Planting more acreage","D. Hiring more workers"], answer:"B", explanation:"Value addition transforms raw produce (e.g. drying, packaging) to earn higher prices." },
      { q:"Which negotiation approach works best for long-term buyer relationships?", options:["A. Always take the highest offer immediately","B. Refuse all first offers","C. Win-win negotiation that considers both parties' needs","D. Only negotiate on price, not quality"], answer:"C", explanation:"Win-win negotiation builds trust and repeat business for sustainable income." },
    ],
  },
  {
    id:6, title:"Dairy Farming Best Practices", duration:"25 min",
    category:"Dairy Farming", completed:false, uploadedBy:"Njeri W.", date:"18 May 2026",
    subtopics:["Breeds & Selection","Feeding & Nutrition","Milking Hygiene","Common Cattle Diseases"],
    questions:[
      { q:"Which dairy breed is most common in Kenya's highlands and known for high milk yield?", options:["A. Boran","B. Friesian (Holstein)","C. Zebu","D. Ankole"], answer:"B", explanation:"Friesians are the dominant dairy breed in Kenya, producing 20–40 litres/day." },
      { q:"What is the recommended number of milking sessions per day for maximum yield?", options:["A. Once daily","B. Twice daily","C. Four times daily","D. Once weekly"], answer:"B", explanation:"Milking twice daily (morning and evening) maximises yield and udder health." },
      { q:"What disease is caused by Brucella bacteria and can spread to humans through raw milk?", options:["A. Foot and Mouth Disease","B. East Coast Fever","C. Brucellosis","D. Lumpy Skin Disease"], answer:"C", explanation:"Brucellosis affects cattle reproduction and is zoonotic — transmissible to humans." },
      { q:"Which mineral deficiency commonly causes milk fever (hypocalcaemia) in dairy cows?", options:["A. Iron","B. Potassium","C. Calcium","D. Sodium"], answer:"C", explanation:"Milk fever occurs when calcium drops too low, especially at calving time." },
      { q:"What is the correct temperature for storing fresh raw milk?", options:["A. 25°C (room temp)","B. 15°C","C. Below 4°C","D. 37°C"], answer:"C", explanation:"Milk must be cooled below 4°C within 2 hours to prevent bacterial growth." },
      { q:"What is the purpose of Total Mixed Ration (TMR) feeding for dairy cows?", options:["A. Reduce water intake","B. Provide a balanced combination of roughage and concentrates in one feed","C. Feed only high-energy concentrates","D. Eliminate the need for pasture"], answer:"B", explanation:"TMR combines all feed components to ensure balanced daily nutrition per cow." },
    ],
  },
  {
    id:7, title:"Poultry Management Basics", duration:"20 min",
    category:"Poultry", completed:false, uploadedBy:"Amara K.", date:"20 May 2026",
    subtopics:["Housing & Biosecurity","Breeds & Production","Vaccination Schedule","Feed & Water Management"],
    questions:[
      { q:"What is biosecurity in poultry farming?", options:["A. Using chemical feed additives","B. Measures to prevent disease entry and spread in a flock","C. Building expensive housing","D. Selling chickens only at certified markets"], answer:"B", explanation:"Biosecurity includes controlled access, disinfection, and isolation of sick birds." },
      { q:"Which poultry disease is prevented by the Newcastle Disease vaccination?", options:["A. Salmonella","B. Marek's Disease","C. Newcastle Disease (NDV)","D. Avian Influenza"], answer:"C", explanation:"Newcastle Disease Vaccine (NDV) specifically prevents Newcastle Disease in poultry." },
      { q:"At what age should broiler chickens typically be ready for market?", options:["A. 6 months","B. 4–6 weeks","C. 1 year","D. 2 weeks"], answer:"B", explanation:"Improved broiler breeds reach market weight (2+ kg) in just 4–6 weeks." },
      { q:"What is the recommended water-to-feed ratio for growing broilers?", options:["A. 1:1","B. 5:1 (5 litres water per 1 kg feed)","C. Water only in the morning","D. 0.5:1"], answer:"B", explanation:"Poultry need approximately 2–5 litres of water per kg of feed consumed." },
      { q:"What does 'all-in all-out' management mean in poultry farming?", options:["A. Letting chickens roam freely","B. Filling and emptying an entire house at the same time to allow cleaning","C. Only one breed per farm","D. Selling all chickens in one market"], answer:"B", explanation:"All-in all-out prevents disease carryover between batches by allowing full house cleanout." },
      { q:"Which vitamin deficiency causes 'rickets' (weak bones) in poultry?", options:["A. Vitamin A","B. Vitamin C","C. Vitamin D3","D. Vitamin K"], answer:"C", explanation:"Vitamin D3 is essential for calcium absorption; its lack causes soft, deformed bones." },
    ],
  },
  {
    id:8, title:"Drip Irrigation Techniques", duration:"30 min",
    category:"Irrigation", completed:false, uploadedBy:"Otieno S.", date:"21 May 2026",
    subtopics:["Why Drip Irrigation?","System Components","Installation & Maintenance","Water Scheduling & Fertigation"],
    questions:[
      { q:"What is the main advantage of drip irrigation over flood irrigation?", options:["A. Cheaper to install","B. Waters more land area at once","C. Delivers water directly to the root zone with minimal wastage","D. Requires no maintenance"], answer:"C", explanation:"Drip irrigation reduces water use by up to 60% by targeting root zones precisely." },
      { q:"What component controls water pressure in a drip irrigation system?", options:["A. Emitter","B. Pressure regulator","C. Filter","D. Mainline pipe"], answer:"B", explanation:"Pressure regulators maintain optimal pressure (usually 10–15 psi) for emitters." },
      { q:"How often should drip emitters be inspected for blockages?", options:["A. Once a year","B. Never — they are self-cleaning","C. At least once per growing season or monthly","D. Only when the crop wilts"], answer:"C", explanation:"Regular inspection catches clogged emitters early, preventing crop stress." },
      { q:"What is 'fertigation' in drip irrigation?", options:["A. Planting fertilizer in the soil before irrigation","B. Applying dissolved fertilizers through the drip irrigation system","C. Buying fertilizer from certified agrovets","D. Removing fertilizer residues from soil"], answer:"B", explanation:"Fertigation delivers nutrients directly to roots via irrigation water, improving efficiency." },
      { q:"Which soil type requires more frequent drip irrigation cycles?", options:["A. Clay soil","B. Loam soil","C. Sandy soil","D. Peat soil"], answer:"C", explanation:"Sandy soils have low water-holding capacity and drain fast, requiring shorter frequent cycles." },
      { q:"What is the ideal time of day to run drip irrigation for water conservation?", options:["A. Midday when evaporation is highest","B. Early morning or evening when evaporation is lowest","C. Only at night","D. Any time is the same"], answer:"B", explanation:"Irrigating in cooler periods minimises evaporation losses from the soil surface." },
      { q:"Which crop in Murang'a County would benefit most from drip irrigation?", options:["A. Maize grown in high rainfall areas","B. Avocados grown on hillsides with dry spells","C. Cassava in wetlands","D. Rice in paddy fields"], answer:"B", explanation:"Avocados on Murang'a hillsides face dry spells; drip irrigation ensures consistent moisture." },
    ],
  },
];
export const MOCK_TRANSPORT = [
  { id:"TRP-001", company:"Swifthaul Logistics", contact:"Benson Korir",  phone:"0711 200 300", counties:["Nairobi","Nakuru","Eldoret"],         vehicles:12, status:"active",   rating:4.7 },
  { id:"TRP-002", company:"FreshRun Transport",  contact:"Amina Yusuf",   phone:"0722 300 400", counties:["Mombasa","Malindi","Kwale"],           vehicles:8,  status:"active",   rating:4.4 },
  { id:"TRP-003", company:"AgroMove Ltd",        contact:"Paul Njoroge",  phone:"0733 400 500", counties:["Kisumu","Siaya","Homabay"],            vehicles:5,  status:"inactive", rating:3.9 },
  { id:"TRP-004", company:"GreenRoute Express",  contact:"Cynthia Mutua", phone:"0755 600 700", counties:["Nairobi","Machakos","Makueni"],        vehicles:15, status:"active",   rating:4.8 },
];

export const MOCK_SHIPMENTS = [
  { id:"SHP-001", order:"ORD-001", company:"Swifthaul Logistics", from:"Nakuru",   to:"Nairobi", produce:"Tomatoes 100kg",  status:"in-transit", eta:"20 May 2026", driver:"John Kamau"    },
  { id:"SHP-002", order:"ORD-002", company:"AgroMove Ltd",        from:"Eldoret",  to:"Nairobi", produce:"Maize 500kg",     status:"delivered",  eta:"18 May 2026", driver:"Peter Otieno"  },
  { id:"SHP-003", order:"ORD-003", company:"GreenRoute Express",  from:"Murang'a", to:"Nairobi", produce:"Avocados 200kg",  status:"pending",    eta:"21 May 2026", driver:"Unassigned"    },
];

export const MOCK_USERS = [
  { id:1, name:"James Mwangi",    role:"Farmer",            location:"Nakuru",  status:"active",   joined:"Jan 2026", verified:true,  trustScore:87, trustLevel:"Gold Farmer"     },
  { id:2, name:"FreshMart Ltd",   role:"Buyer",             location:"Nairobi", status:"active",   joined:"Feb 2026", verified:true,  trustScore:92, trustLevel:"Verified Buyer"   },
  { id:3, name:"Grace Wanjiku",   role:"Farmer",            location:"Eldoret", status:"active",   joined:"Mar 2026", verified:false, trustScore:45, trustLevel:"Bronze Farmer"    },
  { id:4, name:"Dr. Otieno S.",   role:"Extension Officer", location:"Kisumu",  status:"active",   joined:"Jan 2026", verified:true,  trustScore:98, trustLevel:"Officer"          },
  { id:5, name:"AgriVet Plus",    role:"Agrovet",           location:"Nakuru",  status:"inactive", joined:"Apr 2026", verified:false, trustScore:30, trustLevel:"Unverified"       },
  { id:6, name:"Unga Mills",      role:"Buyer",             location:"Nairobi", status:"active",   joined:"Mar 2026", verified:true,  trustScore:88, trustLevel:"Trusted Buyer"    },
  { id:7, name:"Peter Kamau",     role:"Farmer",            location:"Nyandarua",status:"active",  joined:"Apr 2026", verified:false, trustScore:55, trustLevel:"Silver Farmer"    },
];

export const MOCK_NOTIFICATIONS = [
  { id:1, type:"order", text:"New order received: 100kg Tomatoes from FreshMart Ltd", time:"2 min ago", read:false },
  { id:2, type:"cert",  text:"Your certification has been approved by Officer Otieno", time:"1 hr ago",  read:false },
  { id:3, type:"price", text:"Maize prices have risen 15% in Eldoret market",         time:"3 hrs ago", read:true  },
  { id:4, type:"alert", text:"Your produce listing expires in 2 days",                time:"5 hrs ago", read:true  },
  { id:5, type:"weather",text:"Rain expected in Murang'a this weekend — prepare farm", time:"6 hrs ago", read:true  },
  { id:6, type:"fraud", text:"⚠️ Fraud alert: Unverified seller flagged in marketplace", time:"8 hrs ago", read:true },
];

export const MURANGA_SUBCOUNTIES = [
  { id:"kangema",  name:"Kangema",  lat:-0.7500, lng:36.9800, farmers:142, certified:98  },
  { id:"kigumo",   name:"Kigumo",   lat:-0.8000, lng:37.0500, farmers:189, certified:134 },
  { id:"gatanga",  name:"Gatanga",  lat:-0.9500, lng:37.1000, farmers:210, certified:167 },
  { id:"mathioya", name:"Mathioya", lat:-0.7200, lng:37.0200, farmers:155, certified:112 },
  { id:"kandara",  name:"Kandara",  lat:-0.9000, lng:37.1500, farmers:198, certified:145 },
  { id:"maragua",  name:"Maragua",  lat:-0.7300, lng:37.1300, farmers:176, certified:128 },
];
export const murangaWards = {
  Gatanga: ['Ithanga', 'Kakuzi/Mitubiri', 'Mugumo-ini', 'Kihumbu-ini', 'Gatanga', 'Kariara'],
  Kandara: ["Ng'araria", 'Muruka', 'Kagundu-ini', 'Gaichanjiru', 'Ithiru', 'Ruchu'],
  Kangema: ['Kanyenya-ini', 'Muguru', 'Rwathia'],
  Kigumo: ['Kahumbu', 'Muthithi', 'Kigumo', 'Kangari', 'Kinyona'],
  Kiharu: ['Township Ward', 'Wangu Ward', 'Mugoiri Ward', 'Mbiri Ward', 'Murarandia Ward', 'Gaturi Ward'],
  Mathioya: ['Gitugi', 'Kiru', 'Kamacharia'],
  Maragwa: ['Kimorori/Wempa Ward', 'Makuyu Ward', 'Kambiti Ward', 'Kamahuha Ward', 'Ichagaki Ward', 'Nginda Ward']
};
export const MARKET_PRICES = [
  { produce:"Maize",     unit:"90kg bag", price:3200, change:+8.2,  market:"Murang'a",  date:"Today"     },
  { produce:"Avocado",   unit:"kg",       price:85,   change:+12.5, market:"Nairobi",   date:"Today"     },
  { produce:"Tomatoes",  unit:"kg",       price:72,   change:-3.1,  market:"Nakuru",    date:"Today"     },
  { produce:"Bananas",   unit:"bunch",    price:120,  change:+2.0,  market:"Kisumu",    date:"Today"     },
  { produce:"Milk",      unit:"litre",    price:55,   change:0,     market:"Murang'a",  date:"Today"     },
  { produce:"Potatoes",  unit:"50kg bag", price:1800, change:-5.5,  market:"Nyandarua", date:"Today"     },
  { produce:"Beans",     unit:"90kg bag", price:8500, change:+15.2, market:"Eldoret",   date:"Today"     },
  { produce:"Cabbage",   unit:"head",     price:45,   change:-1.2,  market:"Kiambu",    date:"Today"     },
];

export const TRACEABILITY_BATCHES = [
  { id:"BATCH-001", produce:"Organic Tomatoes", farmer:"James Mwangi", farmerCert:"AGC-2026-00123",
    stages:[
      { stage:"🌱 Farm",     date:"10 May 2026", location:"Nakuru Farm", status:"done",     note:"Harvested — certified organic plot" },
      { stage:"📦 Storage",  date:"11 May 2026", location:"Nakuru Cold Storage", status:"done",  note:"Stored at 8°C, humidity 85%" },
      { stage:"🚛 Transport",date:"13 May 2026", location:"Swifthaul Logistics", status:"done",  note:"In transit to Nairobi" },
      { stage:"🏪 Buyer",    date:"14 May 2026", location:"FreshMart Ltd, Nairobi", status:"done", note:"Received and inspected" },
    ], qrHash:"0xA3F2B1C4D5E6" },
  { id:"BATCH-002", produce:"Avocados (Hass)", farmer:"Mary Achieng", farmerCert:"AGC-2026-00456",
    stages:[
      { stage:"🌱 Farm",     date:"15 May 2026", location:"Murang'a Farm", status:"done",    note:"Harvested — export grade" },
      { stage:"📦 Storage",  date:"16 May 2026", location:"Murang'a Warehouse", status:"done", note:"Sorted and graded" },
      { stage:"🚛 Transport",date:"18 May 2026", location:"GreenRoute Express", status:"active", note:"In transit" },
      { stage:"🏪 Buyer",    date:"21 May 2026", location:"Zucasa Export, Nairobi", status:"pending", note:"Awaiting delivery" },
    ], qrHash:"0xB7C3D2E1F4A5" },
];

export const WEATHER_DATA = {
  current: { temp:22, feels:20, humidity:78, wind:12, condition:"Partly Cloudy", icon:"⛅" },
  forecast:[
    { day:"Today",    icon:"⛅", high:24, low:16, rain:20, desc:"Partly cloudy" },
    { day:"Fri",      icon:"🌧️", high:19, low:14, rain:85, desc:"Heavy rain expected" },
    { day:"Sat",      icon:"🌧️", high:17, low:13, rain:90, desc:"Continued rain" },
    { day:"Sun",      icon:"🌤️", high:21, low:15, rain:30, desc:"Clearing up" },
    { day:"Mon",      icon:"☀️", high:25, low:16, rain:10, desc:"Sunny" },
    { day:"Tue",      icon:"☀️", high:26, low:17, rain:5,  desc:"Clear and warm" },
    { day:"Wed",      icon:"⛅", high:23, low:15, rain:25, desc:"Some clouds" },
  ],
  alerts:[
    { type:"warning", msg:"Heavy rainfall alert for Murang'a county this weekend. Secure crops and drainage channels.", icon:"🌧️" },
    { type:"info",    msg:"Best planting window: Next Monday–Wednesday (low rainfall, good temperature).", icon:"🌱" },
  ],
};


export const DIARY_ACTIVITIES = [
  { id:1, date:"2026-05-20", type:"planting",    crop:"Maize",          note:"Planted DK8031 hybrid, spacing 75x25cm. Basal DAP applied.", weather:"☀️ Sunny",    qty:"2 acres" },
  { id:2, date:"2026-05-18", type:"irrigation",  crop:"Tomatoes",       note:"Drip irrigation run for 2 hours. Soil moisture looking good.", weather:"🌤️ Partly Cloudy", qty:"1 acre" },
  { id:3, date:"2026-05-15", type:"fertilizing", crop:"Maize",          note:"Top-dressed with CAN fertilizer at 6-week stage.", weather:"☀️ Sunny",    qty:"50kg CAN" },
  { id:4, date:"2026-05-12", type:"spraying",    crop:"Tomatoes",       note:"Applied Mancozeb 80WP for blight prevention. Mixed at 40g/20L.", weather:"🌥️ Cloudy",   qty:"20L mix" },
  { id:5, date:"2026-05-08", type:"harvesting",  crop:"Avocados (Hass)",note:"Harvested 280kg. Grade A: 200kg, Grade B: 80kg. Stored in coolroom.", weather:"☀️ Sunny",    qty:"280 kg" },
  { id:6, date:"2026-05-05", type:"planting",    crop:"Spinach",        note:"Nursery seedlings transplanted. 30cm row spacing.", weather:"🌦️ Light Rain", qty:"0.5 acres" },
];

export const ACTIVITY_TYPES = [
  { key:"planting",    label:"Planting",    icon:"🌱", color:"#1D9E75", bg:"#E1F5EE" },
  { key:"irrigation",  label:"Irrigation",  icon:"💧", color:"#378ADD", bg:"#E6F1FB" },
  { key:"fertilizing", label:"Fertilizing", icon:"🌿", color:"#BA7517", bg:"#FAEEDA" },
  { key:"spraying",    label:"Spraying",    icon:"🧪", color:"#7F77DD", bg:"#EEEDFE" },
  { key:"harvesting",  label:"Harvesting",  icon:"🌾", color:"#E24B4A", bg:"#FCEBEB" },
  { key:"other",       label:"Other",       icon:"📝", color:"#888780", bg:"#F1EFE8" },
];
export const MOCK_AUTH_SERVER = {
  currentUser: null,
  isAuthenticated: false,
  users: [
    { id:1, email:"farmer@test.com", role:"Farmer", name:"Test Farmer" },
    // ... rest of your users
  ]
};
