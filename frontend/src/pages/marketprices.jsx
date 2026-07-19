import React from "react";
import { MARKET_PRICES } from "../data/mockData.js";

export default function MarketPricesPage() {
  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Market Prices</h2>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: 8 }}>Product</th>
              <th style={{ padding: 8 }}>Price (KES)</th>
              <th style={{ padding: 8 }}>Unit</th>
              <th style={{ padding: 8 }}>Market</th>
            </tr>
          </thead>
          <tbody>
            {(MARKET_PRICES || []).map((item, i) => (
              <tr key={item.id || i} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{item.product}</td>
                <td style={{ padding: 8 }}>{item.price}</td>
                <td style={{ padding: 8 }}>{item.unit}</td>
                <td style={{ padding: 8 }}>{item.market}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}