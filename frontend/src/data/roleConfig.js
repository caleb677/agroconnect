import { MURANGA_SUBCOUNTIES } from "./mockData.js";
import { SUBCOUNTIES, getWards, getLocations } from "./hierarchy.js";

export // Murang'a County sub-counties
const _SUBCOUNTY_FIELDS = [
  "Kandara","Gatanga","Kigumo","Kiharu","Mathioya","Kahuro","Murang'a South",
];

export const SUBCOUNTY_FIELD = { 
  key:"subcounty", 
  label:"Sub-County (Murang\'a)", 
  type:"select", 
  options: SUBCOUNTIES
};
export const WARD_FIELD    = { key:"ward",     label:"Ward",     type:"select", options:[], dynamic:"ward" };
export const LOCATION_FIELD= { key:"location", label:"Location/Village", type:"select", options:[], dynamic:"location" };
export const ROLE_CONFIG = {
  Farmer: {
    icon:"👨‍🌾", color:"#1D9E75", bg:"#E1F5EE",
    tagline:"Sell your produce directly to buyers",
    fields:[
      { key:"name",     label:"Full Name",        type:"text",     placeholder:"e.g. James Mwangi" },
      { key:"phone",    label:"Phone Number",      type:"tel",      placeholder:"e.g. 0712 345 678" },
      SUBCOUNTY_FIELD,
      WARD_FIELD,
      LOCATION_FIELD,
      { key:"farmSize", label:"Farm Size (acres)", type:"number",   placeholder:"e.g. 5" },
      { key:"produce",  label:"Main Produce",      type:"text",     placeholder:"e.g. Tomatoes, Maize" },
      { key:"email",    label:"Email Address",     type:"email",    placeholder:"you@example.com" },
      { key:"password", label:"Password",          type:"password", placeholder:"Min 8 characters" },
    ],
  },
  Buyer: {
    icon:"🏢", color:"#378ADD", bg:"#E6F1FB",
    tagline:"Source quality produce from certified farmers",
    fields:[
      { key:"name",     label:"Company / Full Name", type:"text",     placeholder:"e.g. FreshMart Ltd" },
      { key:"phone",    label:"Phone Number",         type:"tel",      placeholder:"e.g. 0722 111 222" },
      SUBCOUNTY_FIELD,
      WARD_FIELD,
      LOCATION_FIELD,
      { key:"bizType",  label:"Business Type",        type:"select",   options:["Retailer","Wholesaler","Exporter","Processor","Restaurant"] },
      { key:"kraPin",   label:"KRA PIN (optional)",   type:"text",     placeholder:"e.g. A123456789B" },
      { key:"email",    label:"Email Address",        type:"email",    placeholder:"you@company.com" },
      { key:"password", label:"Password",             type:"password", placeholder:"Min 8 characters" },
    ],
  },
  Agrovet: {
    icon:"💊", color:"#BA7517", bg:"#FAEEDA",
    tagline:"Supply agro-inputs and connect with farmers",
    fields:[
      { key:"name",       label:"Business Name",   type:"text",     placeholder:"e.g. AgriVet Plus" },
      { key:"phone",      label:"Phone Number",    type:"tel",      placeholder:"e.g. 0733 444 555" },
      SUBCOUNTY_FIELD,
      WARD_FIELD,
      LOCATION_FIELD,
      { key:"license",    label:"APC License No.", type:"text",     placeholder:"License number" },
      { key:"speciality", label:"Speciality",      type:"select",   options:["Veterinary","Crop Protection","Fertilizers","Seeds","General"] },
      { key:"email",      label:"Email Address",   type:"email",    placeholder:"you@agrovet.com" },
      { key:"password",   label:"Password",        type:"password", placeholder:"Min 8 characters" },
    ],
  },
  "Extension Officer": {
    icon:"🎓", color:"#7F77DD", bg:"#EEEDFE",
    tagline:"Support farmers with training & certification",
    fields:[
      { key:"name",    label:"Full Name",           type:"text",     placeholder:"e.g. Dr. Samuel Otieno" },
      { key:"phone",   label:"Phone Number",        type:"tel",      placeholder:"e.g. 0744 666 777" },
      SUBCOUNTY_FIELD,
      WARD_FIELD,
      LOCATION_FIELD,
      { key:"staffId", label:"Staff / Ministry ID", type:"text",     placeholder:"e.g. MOA-2024-001" },
      { key:"dept",    label:"Department",          type:"select",   options:["Crop Production","Livestock","Irrigation","Horticulture","Agribusiness"] },
      { key:"email",   label:"Official Email",      type:"email",    placeholder:"you@agriculture.go.ke" },
      { key:"password",label:"Password",            type:"password", placeholder:"Min 8 characters" },
    ],
  },
  Admin: {
    icon:"🛡️", color:"#E24B4A", bg:"#FCEBEB",
    tagline:"Manage the entire AgroConnect platform",
    fields:[
      { key:"name",      label:"Full Name",         type:"text",     placeholder:"e.g. Platform Admin" },
      { key:"phone",     label:"Phone Number",      type:"tel",      placeholder:"e.g. 0700 000 001" },
      SUBCOUNTY_FIELD,
      WARD_FIELD,
      LOCATION_FIELD,
      { key:"adminCode", label:"Admin Access Code", type:"password", placeholder:"Provided by platform" },
      { key:"email",     label:"Email Address",     type:"email",    placeholder:"admin@agro.ke" },
      { key:"password",  label:"Password",          type:"password", placeholder:"Min 12 characters" },
    ],
  },
};