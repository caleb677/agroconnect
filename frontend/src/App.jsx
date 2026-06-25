import React, { useState, useEffect } from "react";
import { C, DARK } from "./utils/constants.js";
import { MOCK_NOTIFICATIONS, INITIAL_TICKETS, MOCK_ORDERS_BUYER, MOCK_ORDERS_FARMER, MOCK_ORDERS_AGROVET } from "./data/mockData.js";

import AuthScreen from "./auth/Authscreen.jsx";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import AIAdvisoryChat from "./components/AIAdvisoryChat.jsx";

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
import MpesaPage from "./pages/mpesa.jsx";
import DeliveryPage from "./pages/delivery.jsx";
import PDFReportsPage from "./pages/pdfreports.jsx";

import { UserDB } from "./data/userDB.js";
import { LangProvider } from "./utils/lang.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [darkMode, setDarkMode] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  const [globalNotifs, setGlobalNotifs] = useState(MOCK_NOTIFICATIONS);
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  const [globalOrders, setGlobalOrders] = useState([
    ...MOCK_ORDERS_FARMER.map(o => ({ ...o, _type: "produce" })),
    ...MOCK_ORDERS_BUYER.map(o => ({ ...o, _type: "produce" })),
    ...MOCK_ORDERS_AGROVET.map(o => ({ ...o, _type: "input" }))
  ]);

  const role = user?.role || "Farmer";

  const pushNotification = (notif) => {
    setGlobalNotifs((prev) => [
      { id: Date.now(), ...notif, read: false, time: "Just now" },
      ...prev
    ]);
  };

  const pushOrder = (order) => {
    setGlobalOrders((prev) => [order, ...prev]);
  };

  useEffect(() => {
    if (!user) return;

    UserDB.getProfile(user.email)
      .then((p) => {
        if (!p) return;
        setUser((prev) =>
          prev
            ? {
                ...prev,
                dashboardUnlocked: p.dashboardUnlocked,
                certStatus: p.certStatus,
                docsMeta: p.docsMeta
              }
            : prev
        );
      })
      .catch(() => {});
  }, [page]);

  if (!user) {
    return (
      <LangProvider>
        <AuthScreen
          onLogin={async (acct) => {
            try {
              const full = await UserDB.getProfile(acct.email);
              setUser(full ? { ...acct, ...full } : acct);
            } catch {
              setUser(acct);
            }
            setPage("dashboard");
          }}
        />
      </LangProvider>
    );
  }

  const pageMap = {
    dashboard: <DashboardPage role={role} setPage={setPage} notifs={globalNotifs} user={user} orders={globalOrders} />,
    users: <UsersPage role={role} user={user} pushNotification={pushNotification} />,
    farmers: <UsersPage role={role} user={user} pushNotification={pushNotification} />,
    marketplace: <MarketplacePage role={role} />,
    products: <AgrovetProductsPage role={role} />,
    "farm-inputs": <FarmInputsPage role={role} />,
    orders: <OrdersPage role={role} orders={globalOrders} setOrders={setGlobalOrders} pushOrder={pushOrder} />,
    "farm-diary": <FarmDiaryPage />,
    ratings: <RatingsPage role={role} />,
    certification: (
      <CertificationPage
        role={role}
        user={user}
        onCertComplete={async (patch) => {
          const updated = { ...user, ...patch };
          setUser(updated);
          try {
            await UserDB.updateProfile(user.email, patch);
          } catch {}
        }}
      />
    ),
    messages: <MessagesPage role={role} />,
    tutorials: <TutorialsPage role={role} />,
    transport: <TransportPage role={role} />,
    analytics: <AnalyticsPage />,
    map: <FarmMapPage role={role} />,
    weather: <WeatherPage />,
    "market-prices": <MarketPricesPage />,
    traceability: <TraceabilityPage />,
    support: <SupportPage user={user} tickets={tickets} setTickets={setTickets} />,
    "support-inbox": <SupportInboxPage user={user} tickets={tickets} setTickets={setTickets} />,
    mpesa: <MpesaPage role={role} />,
    delivery: <DeliveryPage />,
    "pdf-reports": <PDFReportsPage role={role} />
  };

  return (
    <LangProvider>
      <div style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
        background: darkMode ? DARK.bg : "#f8f8f6",
        color: darkMode ? DARK.text : C.dark
      }}>

        {!isOnline && (
          <div style={{
            position: "fixed",
            top: 0,
            width: "100%",
            background: "#92400E",
            color: "#fff",
            textAlign: "center",
            padding: 8,
            fontSize: 13
          }}>
            📶 Offline mode
          </div>
        )}

        {showAIChat && <AIAdvisoryChat onClose={() => setShowAIChat(false)} />}

        <Sidebar
          role={role}
          page={page}
          setPage={setPage}
          unread={globalNotifs.filter(n => !n.read).length}
          supportBadge={tickets.filter(t => t.status !== "closed").length}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <TopBar
            role={role}
            user={user}
            onLogout={() => {
              setUser(null);
              setPage("dashboard");
            }}
            darkMode={darkMode}
            toggleDark={() => setDarkMode(!darkMode)}
            onAIChat={() => setShowAIChat(true)}
            notifs={globalNotifs}
            setNotifs={setGlobalNotifs}
            pushNotification={pushNotification}
          />

          <div style={{ flex: 1, overflowY: "auto" }}>
            {pageMap[page] || <DashboardPage role={role} setPage={setPage} />}
          </div>
        </div>
      </div>
    </LangProvider>
  );
}