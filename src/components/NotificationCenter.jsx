import { useState } from "react";

const DEMO_NOTIFS = [
  { id: 1, type: "price", title: "Fiyat Degisikligi", desc: "HRP Sac fiyati %3 dustu. Yeni fiyat: \u20BA18.500/ton", time: "2 saat once", read: false },
  { id: 2, type: "stock", title: "Stok Uyarisi", desc: "Galvanizli Sac Rulo stoku azaliyor. Kalan: 15 ton", time: "5 saat once", read: false },
  { id: 3, type: "order", title: "Siparis Guncelleme", desc: "SIP-2026-001 numarali siparisizin kargoya verildi.", time: "1 gun once", read: true },
  { id: 4, type: "price", title: "Fiyat Degisikligi", desc: "Portland Cimento fiyati guncellendi.", time: "2 gun once", read: true },
];

export default function NotificationCenter({ onClose, t }) {
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);

  const markRead = (id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const typeIcon = { price: "\uD83D\uDCC9", stock: "\uD83D\uDCE6", order: "\uD83D\uDE9A" };

  return (
    <div className="notif-panel">
      <div className="notif-header">
        <h3>{t.notifications.title}</h3>
        <button onClick={onClose} className="modal-close-sm">{"\u2715"}</button>
      </div>

      {notifs.length === 0 ? (
        <div className="cart-empty">
          <div className="cart-empty-text">{t.notifications.empty}</div>
        </div>
      ) : (
        notifs.map(n => (
          <div key={n.id} className={`notif-item ${n.read ? "" : "notif-unread"}`} onClick={() => markRead(n.id)}>
            <div className="notif-icon">{typeIcon[n.type] || "\uD83D\uDD14"}</div>
            <div className="notif-body">
              <div className="notif-title">{n.title}</div>
              <div className="notif-desc">{n.desc}</div>
              <div className="notif-time">{n.time}</div>
            </div>
            {!n.read && <div className="notif-dot" />}
          </div>
        ))
      )}
    </div>
  );
}
