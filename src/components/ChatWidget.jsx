import { useState, useRef, useEffect } from "react";

const AUTO_REPLIES = [
  { match: /fiyat|ucret|maliyet/i, reply: "Guncel fiyat bilgisi icin urun sayfasini ziyaret edebilir veya teklif isteyebilirsiniz." },
  { match: /teslimat|kargo|gonderi/i, reply: "Standart teslimat 5-7, hizli teslimat 2-3 is gunudur. Fabrikadan teslim de mevcuttur." },
  { match: /iade|degisim/i, reply: "Kalite uygunsuzlugu durumunda 7 is gunu icinde iade/degisim yapilir." },
  { match: /odeme|kredi|havale/i, reply: "Kredi karti, havale/EFT ile odeme yapabilirsiniz. Vadeli odeme yakinda eklenecek." },
];

export default function ChatWidget({ t }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: t.chat.greeting, time: new Date() }
  ]);
  const [input, setInput] = useState("");
  const chatEnd = useRef(null);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const matched = AUTO_REPLIES.find(r => r.match.test(userMsg.text));
      const botReply = matched
        ? matched.reply
        : "Tesekkurler! Mesajiniz alindi. Ekibimiz en kisa surede size donus yapacak.";
      setMessages(prev => [...prev, { from: "bot", text: botReply, time: new Date() }]);
    }, 800);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="chat-fab" aria-label="Canli destek">
        {"\uD83D\uDCE8"}
      </button>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <div className="chat-title">{t.chat.title}</div>
          <div className="chat-status">Cevrimici</div>
        </div>
        <button onClick={() => setOpen(false)} className="modal-close-sm">{"\u2715"}</button>
      </div>
      <div className="chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.from === "user" ? "chat-msg-user" : "chat-msg-bot"}`}>
            <div className="chat-msg-text">{m.text}</div>
            <div className="chat-msg-time">{m.time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}</div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>
      <div className="chat-input-row">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder={t.chat.placeholder} className="chat-input" />
        <button onClick={sendMessage} className="chat-send">{"\u27A4"}</button>
      </div>
    </div>
  );
}
