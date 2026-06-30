// ─── Murang'a County Complete Administrative Hierarchy ─────────────────────────
// Sub-County → Ward → Location (village level)

export const HIERARCHY = {
  "Kangema": {
    wards: {
      "Kanyenya-ini": ["Kanyenya-ini Location","Gatukuyu","Gitunduti","Muguti"],
      "Muguru":       ["Muguru Location","Kagumo-ini","Kihome","Kiruri"],
      "Rwathia":      ["Rwathia Location","Chinga","Giakanja","Kiahuria"],
    }
  },
  "Kigumo": {
    wards: {
      "Kahumbu":  ["Kahumbu Location","Kigumo Town","Gituru","Kambiti"],
      "Muthithi": ["Muthithi Location","Githiru","Kiri","Mugutha"],
      "Kigumo":   ["Kigumo Location","Kahatia","Ndunyu-Njeru","Kagumo"],
      "Kangari":  ["Kangari Location","Kiawamagira","Ngarariga","Kihara"],
      "Kinyona":  ["Kinyona Location","Kianja","Gitui","Kamirithu"],
    }
  },
  "Kiharu": {
    wards: {
      "Township":    ["Murang'a Town","Makongeni","Kiambugi","Gatumaini"],
      "Wangu":       ["Wangu Location","Kiguoya","Wangu Town","Nginda"],
      "Mugoiri":     ["Mugoiri Location","Kanyeki","Gichiche","Kiambiriri"],
      "Mbiri":       ["Mbiri Location","Ndundu","Maragua Bridge","Ndiara"],
      "Murarandia":  ["Murarandia Location","Gitinda","Kagundu","Ngatha"],
      "Gaturi":      ["Gaturi Location","Magutu","Kibirigwi","Gatundu"],
    }
  },
  "Mathioya": {
    wards: {
      "Gitugi":     ["Gitugi Location","Gaikuyu","Muthithi","Gacharage"],
      "Kiru":       ["Kiru Location","Githioro","Ndunyu","Ikumbi"],
      "Kamacharia": ["Kamacharia Location","Githithi","Kiawara","Njaini"],
    }
  },
  "Kandara": {
    wards: {
      "Ng'araria":    ["Ng'araria Location","Kiawamagira","Kagundu-ini","Gathanji"],
      "Muruka":       ["Muruka Location","Kiria-ini","Kagumo","Mung'etho"],
      "Kagundu-ini":  ["Kagundu-ini Location","Githumu","Kiambu-ini","Kambirwa"],
      "Gaichanjiru":  ["Gaichanjiru Location","Githumu","Kanjeru","Kiguoya"],
      "Ithiru":       ["Ithiru Location","Kiahuro","Kiguoya","Nginda"],
      "Ruchu":        ["Ruchu Location","Munyaka","Kiawara","Gituru"],
    }
  },
  "Gatanga": {
    wards: {
      "Ithanga":          ["Ithanga Location","Kihumbu-ini","Gatanga Town","Kariara"],
      "Kakuzi/Mitubiri":  ["Kakuzi Location","Mitubiri","Ngarariga","Kiganjo"],
      "Mugumo-ini":       ["Mugumo-ini Location","Thika Road Area","Kiangone","Kiawamagira"],
      "Kihumbu-ini":      ["Kihumbu-ini Location","Ngari","Gati","Gitwe"],
      "Gatanga":          ["Gatanga Location","Githumu","Kigumo","Kariara"],
      "Kariara":          ["Kariara Location","Gitama","Chaka","Ndunyu"],
    }
  },
  "Maragwa": {
    wards: {
      "Kimorori/Wempa": ["Kimorori","Wempa","Gatura","Ndarugu"],
      "Makuyu":         ["Makuyu Location","Githunguri","Kambiti","Gatundu"],
      "Kambiti":        ["Kambiti Location","Kamahuha","Ichagaki","Nginda"],
      "Kamahuha":       ["Kamahuha Location","Giakanja","Githiga","Kiburu"],
      "Ichagaki":       ["Ichagaki Location","Kihome","Nginda","Kigumo"],
      "Nginda":         ["Nginda Location","Mugutha","Gituru","Kamatwa"],
    }
  }
};

export const SUBCOUNTIES = Object.keys(HIERARCHY);

export function getWards(subcounty) {
  return subcounty ? Object.keys(HIERARCHY[subcounty]?.wards || {}) : [];
}

export function getLocations(subcounty, ward) {
  return (subcounty && ward) ? (HIERARCHY[subcounty]?.wards[ward] || []) : [];
}

// ─── Role permission matrix ───────────────────────────────────────────────────
// Returns true if `actorRole` at `actorScope` can perform `action` on `targetScope`
export function canPerform(actorRole, actorScope, action, targetRole, targetScope) {
  // Super Admin (platform owner) — can do everything
  if (actorRole === "Admin") return true;

  // Extension Officer — can delete farmers/buyers/agrovets in their own sub-county
  if (actorRole === "Extension Officer") {
    if (action === "delete" && ["Farmer","Buyer","Agrovet"].includes(targetRole)) {
      return actorScope.subcounty === targetScope.subcounty;
    }
    if (action === "view") {
      return actorScope.subcounty === targetScope.subcounty;
    }
    return false;
  }

  return false;
}

// Scope shape: { subcounty, ward, location }
export function scopeMatch(userScope, targetScope, actorRole) {
  if (actorRole === "Admin") return true;
  if (actorRole === "Extension Officer") return userScope.subcounty === targetScope.subcounty;
  // Regular users only see their own location
  return (
    userScope.subcounty === targetScope.subcounty &&
    userScope.ward      === targetScope.ward      &&
    userScope.location  === targetScope.location
  );
}
