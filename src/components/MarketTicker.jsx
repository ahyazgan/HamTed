import { useState, useEffect } from "react";
import { getMarketPrices, getCurrencies } from "../data/market";

function TickerItem({ name, price, unit, change, changePercent, icon }) {
  const up = change >= 0;
  return (
    <div className="ticker-item">
      <span className="ticker-icon">{icon}</span>
      <span className="ticker-name">{name}</span>
      <span className="ticker-price">{typeof price === "number" ? price.toLocaleString("tr-TR", { maximumFractionDigits: 2 }) : price} <span className="ticker-unit">{unit}</span></span>
      <span className={`ticker-change ${up ? "ticker-up" : "ticker-down"}`}>
        {up ? "\u25B2" : "\u25BC"} {Math.abs(changePercent).toFixed(2)}%
      </span>
    </div>
  );
}

export default function MarketTicker() {
  const [prices, setPrices] = useState(() => getMarketPrices());
  const [currencies, setCurrencies] = useState(() => getCurrencies());

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(getMarketPrices());
      setCurrencies(getCurrencies());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    ...currencies.map(c => ({ ...c, icon: c.icon })),
    ...prices.slice(0, 6).map(p => ({ ...p, icon: p.icon })),
  ];

  return (
    <div className="ticker-bar">
      <div className="ticker-scroll">
        {items.map(item => (
          <TickerItem key={item.id} {...item} />
        ))}
        {/* Duplicate for seamless scroll */}
        {items.map(item => (
          <TickerItem key={item.id + "_dup"} {...item} />
        ))}
      </div>
    </div>
  );
}
