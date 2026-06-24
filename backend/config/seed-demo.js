// ── Seeds demo users for testing ─────────────────────────────────────────────
// Run ONCE: node config/seed-demo.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");
const db     = require("./db");

const DEMO_USERS = [
  { name:"Dr. Samuel Otieno",    email:"ext.kandara@agroconnect.co.ke",  phone:"0712111001", role:"Extension Officer", subcounty:"Kandara",  ward:"Muruka",     location:"Muruka Location"    },
  { name:"Dr. Grace Wanjiku",    email:"ext.kiharu@agroconnect.co.ke",   phone:"0712111002", role:"Extension Officer", subcounty:"Kiharu",   ward:"Township",   location:"Murang'a Town"      },
  { name:"Dr. Peter Kamau",      email:"ext.kigumo@agroconnect.co.ke",   phone:"0712111003", role:"Extension Officer", subcounty:"Kigumo",   ward:"Kangari",    location:"Kangari Location"   },
  { name:"Dr. Ann Mwangi",       email:"ext.mathioya@agroconnect.co.ke", phone:"0712111004", role:"Extension Officer", subcounty:"Mathioya", ward:"Gitugi",     location:"Gitugi Location"    },
  { name:"Dr. James Njoroge",    email:"ext.gatanga@agroconnect.co.ke",  phone:"0712111005", role:"Extension Officer", subcounty:"Gatanga",  ward:"Gatanga",    location:"Gatanga Location"   },
  { name:"Dr. Mary Kariuki",     email:"ext.maragwa@agroconnect.co.ke",  phone:"0712111006", role:"Extension Officer", subcounty:"Maragwa",  ward:"Makuyu",     location:"Makuyu Location"    },
  { name:"Dr. John Kigumo",      email:"ext.kangema@agroconnect.co.ke",  phone:"0712111007", role:"Extension Officer", subcounty:"Kangema",  ward:"Rwathia",    location:"Rwathia Location"   },
  // Farmers
  { name:"John Kamau",           email:"john@farmer.co.ke",              phone:"0722001001", role:"Farmer",           subcounty:"Kandara",  ward:"Muruka",     location:"Muruka Location",   farmSize:"2 acres", produce:"Maize, Beans" },
  { name:"Mary Wanjiru",         email:"mary@farmer.co.ke",              phone:"0722001002", role:"Farmer",           subcounty:"Kiharu",   ward:"Wangu",      location:"Wangu Location",    farmSize:"1.5 acres", produce:"Potatoes, Tomatoes" },
  { name:"Peter Njoroge",        email:"peter@farmer.co.ke",             phone:"0722001003", role:"Farmer",           subcounty:"Maragwa",  ward:"Makuyu",     location:"Makuyu Location",   farmSize:"3 acres", produce:"Avocado, Coffee" },
  { name:"Sarah Kimani",         email:"sarah@farmer.co.ke",             phone:"0722001004", role:"Farmer",           subcounty:"Gatanga",  ward:"Kariara",    location:"Kariara Location",  farmSize:"1 acre",  produce:"Tea, Vegetables" },
  { name:"David Mwangi",         email:"david@farmer.co.ke",             phone:"0722001005", role:"Farmer",           subcounty:"Kigumo",   ward:"Kangari",    location:"Kangari Location",  farmSize:"2 acres", produce:"Maize, Sunflower" },
  // Buyers
  { name:"Nairobi Fresh Ltd",    email:"buyer1@buy.co.ke",               phone:"0733001001", role:"Buyer",            subcounty:"Kiharu",   ward:"Township",   location:"Murang'a Town",     bizType:"Wholesale" },
  { name:"Grace Waweru Traders", email:"buyer2@buy.co.ke",               phone:"0733001002", role:"Buyer",            subcounty:"Kandara",  ward:"Muruka",     location:"Muruka Location",   bizType:"Retail" },
  // Agrovets
  { name:"Kandara Agrovet Shop", email:"agrovet1@vet.co.ke",             phone:"0744001001", role:"Agrovet",          subcounty:"Kandara",  ward:"Muruka",     location:"Muruka Location",   bizType:"Veterinary & Farm Supplies" },
  { name:"Kiharu Farm Supplies", email:"agrovet2@vet.co.ke",             phone:"0744001002", role:"Agrovet",          subcounty:"Kiharu",   ward:"Township",   location:"Murang'a Town",     bizType:"Crop Inputs & Chemicals" },
];

async function seed() {
  console.log("🌱 Seeding demo users...");
  const hash = await bcrypt.hash("password", 12);
  let created = 0, skipped = 0;

  for (const u of DEMO_USERS) {
    const { rows } = await db.query("SELECT id FROM users WHERE email=$1", [u.email]);
    if (rows[0]) { skipped++; continue; }
    await db.query(
      `INSERT INTO users (name,email,phone,role,password_hash,subcounty,ward,location,farm_size,produce,biz_type,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active')`,
      [u.name, u.email, u.phone, u.role, hash, u.subcounty, u.ward, u.location,
       u.farmSize||null, u.produce||null, u.bizType||null]
    );
    created++;
  }

  console.log(`✅ Done! Created: ${created}  Skipped (already exist): ${skipped}`);
  console.log("\nDemo login credentials (all use password: 'password'):");
  console.log("  Extension Officer (Kandara): ext.kandara@agroconnect.co.ke");
  console.log("  Extension Officer (Kiharu):  ext.kiharu@agroconnect.co.ke");
  console.log("  Farmer:                      john@farmer.co.ke");
  console.log("  Buyer:                       buyer1@buy.co.ke");
  console.log("  Agrovet:                     agrovet1@vet.co.ke");
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
