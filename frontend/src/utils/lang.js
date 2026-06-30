// English / Kiswahili toggle — stored in localStorage
import { useState, useEffect, createContext, useContext } from "react";
import React from "react";

const translations = {
  sw: {
    // Nav
    "Dashboard":"Dashibodi","Marketplace":"Soko","Farm Inputs":"Vifaa vya Shamba",
    "My Produce":"Mazao Yangu","Orders":"Maagizo","Farm Diary":"Diary ya Shamba",
    "Ratings & Reviews":"Maoni na Ukadiriaji","Certification":"Uhakiki",
    "Messages":"Ujumbe","Support":"Msaada","Transport":"Usafirishaji",
    "E-Learning":"Elimu","Farm Map":"Ramani ya Shamba","Weather":"Hali ya Hewa",
    "Market Prices":"Bei za Soko","Traceability":"Ufuatiliaji","M-Pesa Pay":"Malipo ya M-Pesa",
    "Delivery Track":"Ufuatiliaji wa Uwasilishaji","PDF Reports":"Ripoti za PDF",
    "Analytics":"Uchambuzi","Users":"Watumiaji","Farmers":"Wakulima",
    "Certifications":"Vyeti","Invite Users":"Alika Watumiaji",
    "Support Inbox":"Kikasha cha Msaada","Verify Produce":"Thibitisha Mazao",
    "My Orders":"Maagizo Yangu","My Products":"Bidhaa Zangu",
    // Common
    "Search":"Tafuta","Filter":"Chujio","Submit":"Wasilisha","Cancel":"Ghairi",
    "Save":"Hifadhi","Delete":"Futa","Edit":"Hariri","Add":"Ongeza",
    "Loading...":"Inapakia...","Error":"Hitilafu","Success":"Imefaulu",
    "Yes":"Ndio","No":"Hapana","Close":"Funga","Back":"Rudi",
    "Name":"Jina","Phone":"Simu","Email":"Barua pepe","Location":"Mahali",
    "Price":"Bei","Quantity":"Kiasi","Status":"Hali","Date":"Tarehe",
    "Description":"Maelezo","Category":"Kategoria","County":"Kaunti",
    "Subcounty":"Kaunti Ndogo","Ward":"Kata","Village":"Kijiji",
  }
};

const LangContext = createContext({ lang:"en", setLang:()=>{}, t:k=>k });

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("ac_lang") || "en");
  const setLang = (l) => { setLangState(l); localStorage.setItem("ac_lang", l); };
  const t = (key) => (lang === "sw" && translations.sw[key]) ? translations.sw[key] : key;
  return React.createElement(LangContext.Provider, { value:{ lang, setLang, t } }, children);
}

export function useLang() { return useContext(LangContext); }
