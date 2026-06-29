import React, { useState, useEffect } from 'react';
import {C , DARK, inp, sel } from "./utils/constants.js";
import { MOCK_NOTIFICATIONS, INITIAL_TICKETS, MOCK_PRODUCTS, MOCK_AGROVET_PRODUCTS, MOCK_AGRO_INPUTS, MOCK_RATINGS, PENDING_RATINGS , MOCK_REVIEW_NOTES, MOCK_ORDERS_BUYER,MOCK_ORDERS_FARMER, MOCK_ORDERS_AGROVET, PRIVATE_THREADS, TUTORIALS_DATA, MOCK_SHIPMENTS, MOCK_TRANSPORT, MOCK_USERS, MURANGA_SUBCOUNTIES, MARKET_PRICES, TRACEABILITY_BATCHES, WEATHER_DATA ,ACTIVITY_TYPES, DIARY_ACTIVITIES, MOCK_AUTH_SERVER} from "./data/mockData.js";
import AuthScreen from "./auth/loginscreen.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/navbar.jsx";
import AIAdvisoryChat from "./components/aichat.jsx";
import DashboardPage from "./pages/dashboard.jsx";
import MarketplacePage from "./pages/marketplace.jsx";
import AgrovetProductsPage from "./pages/agrovetproduct.jsx";
import FarmInputsPage from "./pages/farminput.jsx";
import OrdersPage from "./pages/orders.jsx";
import FarmDiaryPage from "./pages/farmdiary.jsx";
import RatingsPage from "./pages/ratings.jsx";
import CertificationPage from "./pages/certification.jsx";
import MessagesPage from "./pages/messages.jsx";
import TutorialsPage from "./pages/tutorials.jsx";
import TransportPage from "./pages/transport.jsx";
import UsersPage from "./pages/users.jsx";
import AnalyticsPage from "./pages/analytics.jsx";
import FarmMapPage from "./pages/farmmap.jsx";
import WeatherPage from "./pages/weather.jsx";
import MarketPricesPage from "./pages/marketprices.jsx";
import TraceabilityPage from "./pages/traceability.jsx";
import SupportPage from "./pages/support.jsx";
import SupportInboxPage from "./pages/supportinbox.jsx";
import AdminUserViewer from "./pages/admin.jsx";
import MpesaPage from "./pages/mpesa.jsx";
import DeliveryPage from "./pages/delivery.jsx";
import PDFReportsPage from "./pages/pdfreports.jsx";
import { UserDB ,SEED_ACCOUNTS} from "./data/userDB.js";
import { LangProvider } from "./utils/lang.js";

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [globalNotifs, setGlobalNotifs] = useState(MOCK_NOTIFICATIONS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [isOnline, setIsOnline]   = useState(navigator.onLine);
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    const goOnline  = () => { setIsOnline(true); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline); };
  }, []);

  const [globalOrders, setGlobalOrders] = useState([
    ...MOCK_ORDERS_FARMER.map(o=>({...o, _type:"produce"})),
    ...MOCK_ORDERS_BUYER.map(o=>({...o, _type:"produce"})),
    ...MOCK_ORDERS_AGROVET.map(o=>({...o, _type:"input"})),
  ]);
  const role = user?.role || "Farmer";

  const pushNotification = (notif) => {
    setGlobalNotifs(prev => [{ id:Date.now(), ...notif, read:false, time:"Just now" }, ...prev]);
    // Browser push notification if permitted
    if (window.Notification && Notification.permission === "granted") {
      try { new Notification("AgroConnect — " + notif.title, { body: notif.desc, icon: "/maize.png" }); } catch{}
    }
  };

  const pushOrder = (order) => {
    setGlobalOrders(prev => [order, ...prev]);
    pushNotification({
      title:"New Order Received",
      desc:`Order ${order.id} for ${order.product} (${order.qty}kg) has been placed.`,
      icon:"📦",
    });
  };

  // Request notification permission on login
  useEffect(() => {
    if (user && window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

  useEffect(() => {
    if (!user?.email) return;
    UserDB.getProfile(user.email).then(p => {
      if (!p) return;
      setUser(prev => prev ? {
        ...prev,
        dashboardUnlocked: p.dashboardUnlocked ?? prev.dashboardUnlocked,
        certStatus:        p.certStatus        ?? prev.certStatus,
        docsMeta:          p.docsMeta          ?? prev.docsMeta,
      } : prev);
    }).catch(()=>{});
  }, [page]);

  if (!user) return (
    <LangProvider>
      <AuthScreen onLogin={async (acct) => {
        try {
          const fullProfile = await UserDB.getProfile(acct.email);
          setUser(fullProfile ? { ...acct, ...fullProfile } : acct);
        } catch { setUser(acct); }
        setPage("dashboard");
      }} />
    </LangProvider>
  );

  const pageMap = {
    dashboard:    <DashboardPage role={role} setPage={setPage} notifs={globalNotifs} user={user} orders={globalOrders} />,
    users:        <UsersPage role={role} user={user} pushNotification={pushNotification} />,
    farmers:      <UsersPage role={role} user={user} pushNotification={pushNotification} />,
    marketplace:  <MarketplacePage role={role} />,
    "my-produce": <MarketplacePage role={role} />,
    products:     <AgrovetProductsPage role={role} />,
    "farm-inputs":<FarmInputsPage role={role} />,
    orders:       <OrdersPage role={role} orders={globalOrders} setOrders={setGlobalOrders} pushOrder={pushOrder} />,
    "farm-diary": <FarmDiaryPage />,
    ratings:      <RatingsPage role={role} />,
    certification:<CertificationPage role={role} user={user} onCertComplete={async (patch) => {
      const updated = { ...user, ...patch };
      setUser(updated);
      try { await UserDB.updateProfile(user.email, patch); } catch {}
    }} />,
    messages:     <MessagesPage role={role} />,
    tutorials:    <TutorialsPage role={role} />,
    transport:    <TransportPage role={role} />,
    analytics:    <AnalyticsPage />,
    map:          <FarmMapPage role={role} />,
    weather:      <WeatherPage />,
    "market-prices": <MarketPricesPage />,
    traceability: <TraceabilityPage />,
    support:       <SupportPage user={user} tickets={tickets} setTickets={setTickets} />,
    "support-inbox": <SupportInboxPage user={user} tickets={tickets} setTickets={setTickets} />,
    mpesa:        <MpesaPage role={role} />,
    delivery:     <DeliveryPage />,
    "pdf-reports": <PDFReportsPage role={role} />,
  };

  return (
    <LangProvider>
      <div style={{ display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI', system-ui, sans-serif", background: darkMode ? DARK.bg : "#f8f8f6", color: darkMode ? DARK.text : C.dark }}>
        {!isOnline && (
          <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:9999, background:"#92400E", color:"#fff", textAlign:"center", padding:"8px", fontSize:13, fontWeight:600, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            📶 You're offline — data is cached locally and will sync when you reconnect
          </div>
        )}
        {showAIChat && <AIAdvisoryChat onClose={()=>setShowAIChat(false)} />}
        <Sidebar role={role} page={page} setPage={setPage} unread={globalNotifs.filter(n=>!n.read).length} supportBadge={tickets.filter(t=>(t.status==="open"||t.status==="in-progress")).length||undefined} />
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <TopBar
            role={role} user={user}
            onLogout={() => { setUser(null); setPage("dashboard"); }}
            setPage={setPage}
            darkMode={darkMode}
            toggleDark={()=>setDarkMode(!darkMode)}
            onAIChat={()=>setShowAIChat(true)}
            notifs={globalNotifs}
            setNotifs={setGlobalNotifs}
            pushNotification={pushNotification}
          />
          <div style={{ flex:1, overflowY:"auto" }}>
            {pageMap[page] || <DashboardPage role={role} setPage={setPage} notifs={globalNotifs} user={user} />}
          </div>
        </div>
      </div>
    </LangProvider>
  );
}
