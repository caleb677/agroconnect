import { C } from "../../utils/constants.js";
export default function Badge({ status }) {
  const map = {
    pending:   { bg:"#FAEEDA", color:"#854F0B", label:"Pending" },
    confirmed: { bg:"#E1F5EE", color:"#085041", label:"Confirmed" },
    delivered: { bg:"#EAF3DE", color:"#3B6D11", label:"Delivered" },
    approved:  { bg:"#EAF3DE", color:"#3B6D11", label:"Approved" },
    "in-review":{ bg:"#E6F1FB",color:"#185FA5", label:"In Review" },
    rejected:  { bg:"#FCEBEB", color:"#A32D2D", label:"Rejected" },
    active:    { bg:"#EAF3DE", color:"#3B6D11", label:"Active" },
    inactive:  { bg:"#F1EFE8", color:"#888780", label:"Inactive" },
    cancelled: { bg:"#FCEBEB", color:"#A32D2D", label:"Cancelled" },
    "in-transit":{ bg:"#E6F1FB",color:"#185FA5",label:"In Transit" },
    invited:   { bg:"#EEEDFE", color:"#5550B8", label:"Invited" },
    verified:  { bg:"#EAF3DE", color:"#3B6D11", label:"Verified" },
    unverified:{ bg:"#FAEEDA", color:"#854F0B", label:"Unverified" },
    done:      { bg:"#EAF3DE", color:"#3B6D11", label:"Done" },
    pending2:  { bg:"#F1EFE8", color:"#888780", label:"Pending" },
  };
  const s = map[status] || map.pending;
  return <span style={{ background:s.bg, color:s.color, borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:500 }}>{s.label}</span>;
}