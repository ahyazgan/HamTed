import { useState, useEffect } from "react";
import { PRODUCTS } from "../data/products";

const CITIES = ["Istanbul", "Ankara", "Izmir", "Bursa", "Antalya", "Konya", "Gaziantep", "Kayseri", "Eskisehir", "Trabzon", "Adana", "Mersin"];
const COMPANIES = ["ABC Insaat", "XYZ Metal", "Ozkan Yapi", "Dogan Celik", "Yildiz Kimya", "Anadolu Polimer", "Ege Beton", "Trakya Gida", "Marmara Enerji", "Karadeniz Insaat"];

function generateOrder() {
  const p = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
  const city = CITIES[Math.floor(Math.random() * CITIES.length)];
  const company = COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
  const qty = p.minQty * (1 + Math.floor(Math.random() * 5));
  const mins = Math.floor(Math.random() * 30) + 1;
  return { product: p.name, city, company, qty, unit: p.unit, time: `${mins} dk once` };
}

export default function LiveOrderFeed() {
  const [orders, setOrders] = useState(() => Array.from({ length: 3 }, generateOrder));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setOrders(prev => [generateOrder(), ...prev.slice(0, 4)]);
    }, 15000);
    return () => clearInterval(iv);
  }, []);

  if (!visible) return null;

  return (
    <div className="live-feed">
      <div className="live-feed-header">
        <span className="live-dot" /> Canli Siparis Akisi
        <button onClick={() => setVisible(false)} className="live-feed-close">{"\u2715"}</button>
      </div>
      {orders.slice(0, 3).map((o, i) => (
        <div key={i} className="live-feed-item" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="live-feed-text">
            <strong>{o.company}</strong> ({o.city}) — {o.qty} {o.unit} <strong>{o.product}</strong>
          </div>
          <div className="live-feed-time">{o.time}</div>
        </div>
      ))}
    </div>
  );
}
