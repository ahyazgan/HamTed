import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { loadCart, saveCart, loadShip, saveShip, loadFavs, saveFavs, loadTheme, saveTheme, loadLang, saveLang, loadCompare, saveCompare, loadOrders, saveOrders } from "./utils/storage";
import { getTranslations } from "./utils/i18n";
import { ToastProvider, useToast } from "./components/Toast";
import { ErrorBoundary, NotFoundPage } from "./components/ErrorBoundary";
import { SkeletonGrid } from "./components/Skeleton";
import PageTransition from "./components/PageTransition";

import Header from "./components/Header";
import Footer from "./components/Footer";
import CartPanel from "./components/CartPanel";
import ProductModal from "./components/ProductModal";
import QuoteModal from "./components/QuoteModal";
import LoginModal from "./components/LoginModal";
import WhatsAppButton from "./components/WhatsAppButton";
import ChatWidget from "./components/ChatWidget";
import InvoiceModal from "./components/InvoiceModal";
import AddressBook from "./components/AddressBook";
import BulkOrderModal from "./components/BulkOrderModal";
import CostCalculator from "./components/CostCalculator";
import MarketTicker from "./components/MarketTicker";

// Lazy loaded pages
const HomePage = lazy(() => import("./pages/HomePage"));
const NasilCalisirPage = lazy(() => import("./pages/NasilCalisirPage"));
const TedarikciPage = lazy(() => import("./pages/TedarikciPage"));
const HakkimizdaPage = lazy(() => import("./pages/HakkimizdaPage"));
const IletisimPage = lazy(() => import("./pages/IletisimPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage"));
const ComparePage = lazy(() => import("./pages/ComparePage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const OrderConfirmPage = lazy(() => import("./pages/OrderConfirmPage"));
const OrderTrackPage = lazy(() => import("./pages/OrderTrackPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const MarketPage = lazy(() => import("./pages/MarketPage"));
const EncyclopediaPage = lazy(() => import("./pages/EncyclopediaPage"));
const NewsPage = lazy(() => import("./pages/NewsPage"));
const SeasonalPage = lazy(() => import("./pages/SeasonalPage"));
const RFQPage = lazy(() => import("./pages/RFQPage"));
const InventoryPage = lazy(() => import("./pages/InventoryPage"));
const ContractsPage = lazy(() => import("./pages/ContractsPage"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function PageLoader() {
  return <div className="page-content"><SkeletonGrid count={6} /></div>;
}

function AppShell() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Cart
  const [cart, setCart] = useState(() => loadCart());
  const [ship, setShip] = useState(() => loadShip());
  useEffect(() => { saveCart(cart); }, [cart]);
  useEffect(() => { saveShip(ship); }, [ship]);

  // Favorites
  const [favs, setFavs] = useState(() => loadFavs());
  useEffect(() => { saveFavs(favs); }, [favs]);
  const toggleFav = (id) => {
    setFavs(prev => {
      if (prev.includes(id)) { toast("Favorilerden cikarildi", "info"); return prev.filter(f => f !== id); }
      toast("Favorilere eklendi", "success"); return [...prev, id];
    });
  };

  // Compare
  const [compareIds, setCompareIds] = useState(() => loadCompare());
  useEffect(() => { saveCompare(compareIds); }, [compareIds]);
  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) { toast("Karsilastirmadan cikarildi", "info"); return prev.filter(f => f !== id); }
      if (prev.length >= 3) { toast("En fazla 3 urun karsilastirilabilir", "error"); return prev; }
      toast("Karsilastirmaya eklendi", "success"); return [...prev, id];
    });
  };
  const removeCompare = (id) => setCompareIds(prev => prev.filter(f => f !== id));

  // Theme
  const [darkMode, setDarkMode] = useState(() => loadTheme() === "dark");
  useEffect(() => { document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light"); saveTheme(darkMode ? "dark" : "light"); }, [darkMode]);

  // Language
  const [lang, setLang] = useState(() => loadLang());
  useEffect(() => { saveLang(lang); }, [lang]);
  const t = getTranslations(lang);

  // UI
  const [showCart, setShowCart] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [modal, setModal] = useState(null);
  const [quoteModal, setQuoteModal] = useState(null);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [showAddress, setShowAddress] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const handleOpenProduct = (product) => {
    if (product.pt === "quote") setQuoteModal(product);
    else setModal(product);
  };

  const handleAddCart = (product, qty) => {
    setCart(prev => {
      const ex = prev.find(c => c.id === product.id);
      if (ex) return prev.map(c => c.id === product.id ? { ...c, qty: c.qty + qty } : c);
      return [...prev, { ...product, qty }];
    });
    toast(t.product.addToCart + ": " + product.name);
  };

  const handleBulkAdd = (items) => {
    setCart(prev => {
      let updated = [...prev];
      for (const item of items) {
        const ex = updated.find(c => c.id === item.id);
        if (ex) updated = updated.map(c => c.id === item.id ? { ...c, qty: c.qty + item.qty } : c);
        else updated.push(item);
      }
      return updated;
    });
  };

  const handleRepeatOrder = (order) => {
    setCart(order.items.map(it => ({ ...it })));
    toast("Gecmis siparis sepete eklendi", "success");
    setShowCart(true);
  };

  const handleOrder = (total, shippingCost) => {
    const orderId = "SIP-" + Date.now().toString(36).toUpperCase();
    const order = { id: orderId, date: new Date().toISOString(), items: [...cart], total, shipping: shippingCost, status: "processing" };
    const orders = loadOrders();
    saveOrders([order, ...orders]);
    setCart([]);
    setShowCart(false);
    toast(t.order.confirmed, "success");
    navigate(`/siparis/${orderId}`);
  };

  return (
    <div className="app-root">
      <ScrollToTop />
      <MarketTicker />

      <Header cart={cart} showCart={showCart} setShowCart={setShowCart}
        admin={admin} setAdmin={setAdmin} onLoginClick={() => setLoginModal(true)}
        darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)}
        favCount={favs.length} compareCount={compareIds.length}
        lang={lang} setLang={setLang} t={t}
        onShowCalc={() => setShowCalc(true)} />

      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageTransition><HomePage admin={admin} onOpenProduct={handleOpenProduct} favs={favs} toggleFav={toggleFav} compareIds={compareIds} toggleCompare={toggleCompare} t={t} /></PageTransition>} />
                <Route path="/nasil-calisir" element={<PageTransition><NasilCalisirPage /></PageTransition>} />
                <Route path="/tedarikci" element={<PageTransition><TedarikciPage /></PageTransition>} />
                <Route path="/hakkimizda" element={<PageTransition><HakkimizdaPage /></PageTransition>} />
                <Route path="/iletisim" element={<PageTransition><IletisimPage /></PageTransition>} />
                <Route path="/urun/:id" element={<PageTransition><ProductDetailPage admin={admin} onAddCart={handleAddCart} onOpenQuote={p => setQuoteModal(p)} favs={favs} toggleFav={toggleFav} compareIds={compareIds} toggleCompare={toggleCompare} t={t} /></PageTransition>} />
                <Route path="/favoriler" element={<PageTransition><FavoritesPage admin={admin} onOpenProduct={handleOpenProduct} favs={favs} toggleFav={toggleFav} /></PageTransition>} />
                <Route path="/karsilastir" element={<PageTransition><ComparePage compareIds={compareIds} removeCompare={removeCompare} t={t} /></PageTransition>} />
                <Route path="/kayit" element={<PageTransition><RegisterPage t={t} /></PageTransition>} />
                <Route path="/siparis/:orderId" element={<PageTransition><OrderConfirmPage t={t} /></PageTransition>} />
                <Route path="/siparis-takip/:orderId" element={<PageTransition><OrderTrackPage t={t} /></PageTransition>} />
                <Route path="/admin" element={<PageTransition><AdminPage t={t} /></PageTransition>} />
                <Route path="/piyasa" element={<PageTransition><MarketPage /></PageTransition>} />
                <Route path="/ansiklopedi" element={<PageTransition><EncyclopediaPage /></PageTransition>} />
                <Route path="/haberler" element={<PageTransition><NewsPage /></PageTransition>} />
                <Route path="/sezonsal" element={<PageTransition><SeasonalPage /></PageTransition>} />
                <Route path="/talep-tahtasi" element={<PageTransition><RFQPage /></PageTransition>} />
                <Route path="/stok-takip" element={<PageTransition><InventoryPage /></PageTransition>} />
                <Route path="/kontratlar" element={<PageTransition><ContractsPage /></PageTransition>} />
                <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
              </Routes>
            </AnimatePresence>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <WhatsAppButton />
      <ChatWidget t={t} />

      {showCart && <CartPanel cart={cart} setCart={setCart} ship={ship} setShip={setShip} admin={admin} onClose={() => setShowCart(false)} onOrder={handleOrder} onShowAddress={() => setShowAddress(true)} onShowBulk={() => { setShowCart(false); setShowBulk(true); }} onRepeatOrder={handleRepeatOrder} t={t} />}
      {modal && <ProductModal product={modal} admin={admin} onClose={() => setModal(null)} onAddCart={(p, q) => { handleAddCart(p, q); setModal(null); }} />}
      {quoteModal && <QuoteModal product={quoteModal} admin={admin} onClose={() => setQuoteModal(null)} />}
      {loginModal && <LoginModal onClose={() => setLoginModal(false)} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} t={t} />}
      {showAddress && <AddressBook onClose={() => setShowAddress(false)} />}
      {showBulk && <BulkOrderModal onAddItems={handleBulkAdd} onClose={() => setShowBulk(false)} />}
      {showCalc && <CostCalculator onClose={() => setShowCalc(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </BrowserRouter>
  );
}
