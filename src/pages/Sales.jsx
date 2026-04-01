import { useState, useEffect } from "react";
import { getMedicines } from "../services/inventoryService";
import { createSale } from "../services/salesService";
import { getPatients } from "../services/patientService";

export default function Sales() {
  const [medicines, setMedicines] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [customer, setCustomer] = useState("");
  const [patientId, setPatientId] = useState("");        // ← new
  const [patientSearch, setPatientSearch] = useState(""); // ← new
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const res = await getMedicines();
      setMedicines(res.data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchMedicines();
    fetchPatients();
  }, []);

  const filtered = medicines.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) && m.stock > 0
  );

  // Filter patients for dropdown
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 5);

  const selectPatient = (patient) => {
    setPatientId(patient.id);
    setCustomer(patient.name);
    setPatientSearch(patient.name);
  };

  const addToCart = (med) => {
    setCart(prev => {
      const exists = prev.find(i => i.medicine_id === med.id);
      if (exists) return prev.map(i => i.medicine_id === med.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { medicine_id: med.id, medicine_name: med.name, unit_price: parseFloat(med.price), quantity: 1 }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart(prev => prev.map(i => i.medicine_id === id ? { ...i, quantity: qty } : i));
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.medicine_id !== id));

  const subtotal = cart.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  const tax = subtotal * 0.16;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty.");
    setProcessing(true);
    try {
      const user = JSON.parse(localStorage.getItem("pharma_user") || "{}");
      const res = await createSale({
        customer_name: customer || "Walk-in Customer",
        payment_method: payMethod,
        cashier_id: user.id || 1,
        patient_id: patientId || 0,   // ← send patient_id for SMS
        items: cart,
      });
      setReceipt({
        ...res.data.data,
        customer_name: customer || "Walk-in Customer",
        payment_method: payMethod,
        subtotal, tax, total,
        items: cart,
        date: new Date().toLocaleString("en-KE"),
      });
      setCart([]);
      setCustomer("");
      setPatientId("");
      setPatientSearch("");
      await fetchMedicines();
    } catch (e) { alert(e.response?.data?.message || "Checkout failed."); }
    finally { setProcessing(false); }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${receipt.sale_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 13px; padding: 20px; width: 300px; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .large { font-size: 18px; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; margin: 6px 0; }
            .footer { text-align: center; margin-top: 16px; font-size: 11px; color: #555; }
          </style>
        </head>
        <body>
          <div class="center bold large">PharmaSys</div>
          <div class="center" style="font-size:11px;margin-top:2px;">Pharmacy Management System</div>
          <div class="center" style="font-size:11px;">Nairobi, Kenya</div>
          <div class="divider"></div>
          <div class="row"><span>Receipt #</span><span>${receipt.sale_number}</span></div>
          <div class="row"><span>Date</span><span>${receipt.date}</span></div>
          <div class="row"><span>Customer</span><span>${receipt.customer_name}</span></div>
          <div class="row"><span>Payment</span><span>${receipt.payment_method}</span></div>
          <div class="divider"></div>
          <div class="bold" style="margin-bottom:6px;">Items</div>
          ${receipt.items.map(item => `
            <div class="row"><span>${item.medicine_name}</span></div>
            <div class="row" style="color:#555;font-size:12px;">
              <span>  x${item.quantity} @ KES ${item.unit_price.toFixed(2)}</span>
              <span>KES ${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          `).join("")}
          <div class="divider"></div>
          <div class="row"><span>Subtotal</span><span>KES ${receipt.subtotal.toFixed(2)}</span></div>
          <div class="row"><span>VAT (16%)</span><span>KES ${receipt.tax.toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="total-row"><span>TOTAL</span><span>KES ${receipt.total.toFixed(2)}</span></div>
          <div class="divider"></div>
          <div class="footer">
            <div>Thank you for your purchase!</div>
            <div style="margin-top:4px;">Powered by PharmaSys</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 62px)", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#f4f7fb", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .patient-dropdown { position: absolute; top: 100%; left: 0; right: 0; background: #1a2235; border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; z-index: 100; margin-top: 4px; overflow: hidden; }
        .patient-option { padding: 9px 12px; cursor: pointer; font-size: 12px; color: #fff; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .patient-option:hover { background: rgba(0,229,192,0.1); color: #00e5c0; }
        .patient-option:last-child { border-bottom: none; }
      `}</style>

      {/* LEFT — Medicine Grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 20px 24px 28px", overflow: "hidden" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#0d1b2a", letterSpacing: "-0.6px", marginBottom: 12 }}>Sales / POS</div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", fontSize: 13 }}>🔍</span>
            <input
              style={{ width: "100%", padding: "10px 13px 10px 36px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", border: "1.5px solid #e3eaf2", outline: "none", color: "#0d1b2a", background: "#fff", boxSizing: "border-box" }}
              placeholder="Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 11 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ borderRadius: 13, height: 110, background: "linear-gradient(90deg,#f0f4f8 25%,#e8eef5 50%,#f0f4f8 75%)", backgroundSize: "200% 100%" }} />
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(155px,1fr))", gap: 11, overflowY: "auto", flex: 1, paddingRight: 4 }}>
            {filtered.map(med => {
              const inCart = cart.some(i => i.medicine_id === med.id);
              return (
                <div key={med.id}
                  onClick={() => addToCart(med)}
                  style={{
                    background: inCart ? "#f0fdf9" : "#fff",
                    borderRadius: 13, padding: 15,
                    border: `1.5px solid ${inCart ? "#00e5c0" : "#e8eef5"}`,
                    cursor: "pointer", transition: "all 0.18s",
                    boxShadow: inCart ? "0 4px 16px rgba(0,229,192,0.15)" : "0 1px 4px rgba(0,0,0,0.04)",
                    height: "fit-content",
                  }}
                  onMouseEnter={e => { if (!inCart) { e.currentTarget.style.borderColor = "#00e5c0"; e.currentTarget.style.transform = "translateY(-2px)"; }}}
                  onMouseLeave={e => { if (!inCart) { e.currentTarget.style.borderColor = "#e8eef5"; e.currentTarget.style.transform = "translateY(0)"; }}}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0d1b2a", marginBottom: 4, lineHeight: 1.3 }}>{med.name}</div>
                  <div style={{ fontSize: 11, color: "#8a9ab5", marginBottom: 8 }}>{med.category || "General"}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#00b89c" }}>KES {parseFloat(med.price).toFixed(2)}</span>
                    <span style={{ fontSize: 10, color: med.stock <= 10 ? "#f43f5e" : "#8a9ab5", fontWeight: 600 }}>{med.stock} left</span>
                  </div>
                  {inCart && (
                    <div style={{ marginTop: 8, fontSize: 10, fontWeight: 700, color: "#00b89c", background: "rgba(0,229,192,0.1)", padding: "3px 8px", borderRadius: 6, textAlign: "center" }}>✓ In Cart</div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#8a9ab5" }}>No medicines found</div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT — Cart */}
      <div style={{ width: 340, background: "#0b0f1a", display: "flex", flexDirection: "column", padding: "24px 20px", height: "calc(100vh - 62px)", overflow: "hidden" }}>

        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 4 }}>🛒 Cart</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>{cart.length} item(s)</div>

        {/* Patient Search — with dropdown */}
        <div style={{ position: "relative", marginBottom: 14 }}>
          <input
            style={{ width: "100%", padding: "9px 12px", borderRadius: 10, fontSize: 12, fontFamily: "inherit", border: `1.5px solid ${patientId ? "#00e5c0" : "rgba(255,255,255,0.1)"}`, outline: "none", color: "#fff", background: "rgba(255,255,255,0.06)", boxSizing: "border-box" }}
            placeholder="Search patient for SMS receipt..."
            value={patientSearch}
            onChange={e => {
              setPatientSearch(e.target.value);
              setCustomer(e.target.value);
              setPatientId("");
            }}
          />
          {patientId && (
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#00e5c0" }}>✓ SMS</span>
          )}
          {/* Dropdown */}
          {patientSearch && !patientId && filteredPatients.length > 0 && (
            <div className="patient-dropdown">
              {filteredPatients.map(p => (
                <div key={p.id} className="patient-option" onClick={() => selectPatient(p)}>
                  👤 {p.name} {p.phone ? `· ${p.phone}` : "· no phone"}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: "auto", marginBottom: 14 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
              <div style={{ fontSize: 12 }}>Click a medicine to add</div>
            </div>
          ) : cart.map(item => (
            <div key={item.medicine_id} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 11, padding: "11px 12px", marginBottom: 8, border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", flex: 1, marginRight: 8 }}>{item.medicine_name}</div>
                <button onClick={() => removeFromCart(item.medicine_id)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", fontSize: 14, padding: 0 }}>✕</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => updateQty(item.medicine_id, item.quantity - 1)} style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid rgba(255,255,255,0.15)", background: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", minWidth: 20, textAlign: "center" }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.medicine_id, item.quantity + 1)} style={{ width: 26, height: 26, borderRadius: 7, border: "1.5px solid rgba(255,255,255,0.15)", background: "none", color: "#fff", cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#00e5c0" }}>KES {(item.unit_price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14, marginBottom: 14 }}>
          {[
            { label: "Subtotal", val: `KES ${subtotal.toFixed(2)}` },
            { label: "VAT (16%)", val: `KES ${tax.toFixed(2)}` },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 6, fontWeight: 600 }}>
              <span>{r.label}</span><span>{r.val}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 10 }}>
            <span>Total</span><span style={{ color: "#00e5c0" }}>KES {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {["Cash", "M-Pesa", "Card"].map(p => (
            <button key={p} onClick={() => setPayMethod(p)} style={{ flex: 1, padding: "8px 4px", borderRadius: 9, border: `1.5px solid ${payMethod === p ? "#00e5c0" : "rgba(255,255,255,0.1)"}`, background: payMethod === p ? "rgba(0,229,192,0.15)" : "none", color: payMethod === p ? "#00e5c0" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{p}</button>
          ))}
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || processing}
          style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: cart.length === 0 ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg,#00e5c0,#0080ff)", color: cart.length === 0 ? "rgba(255,255,255,0.2)" : "#fff", fontSize: 14, fontWeight: 800, cursor: cart.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {processing ? "Processing..." : `Checkout · KES ${total.toFixed(2)}`}
        </button>

        {/* SMS hint */}
        {patientId ? (
          <div style={{ textAlign: "center", fontSize: 11, color: "#00e5c0", marginTop: 8 }}>📱 SMS receipt will be sent to patient</div>
        ) : (
          <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>Search a patient above to send SMS receipt</div>
        )}
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(13,27,42,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 380, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg,#00e5c0,#0080ff)", padding: "24px", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Sale Complete!</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>#{receipt.sale_number}</div>
            </div>
            <div style={{ padding: "20px 24px", maxHeight: 300, overflowY: "auto" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9ab5", textTransform: "uppercase", marginBottom: 10 }}>Items</div>
              {receipt.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span style={{ color: "#374151" }}>{item.medicine_name} ×{item.quantity}</span>
                  <span style={{ fontWeight: 700 }}>KES {(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #f0f4f8", marginTop: 12, paddingTop: 12 }}>
                {[
                  { label: "Subtotal", val: `KES ${receipt.subtotal.toFixed(2)}` },
                  { label: "VAT (16%)", val: `KES ${receipt.tax.toFixed(2)}` },
                  { label: "Total", val: `KES ${receipt.total.toFixed(2)}`, bold: true },
                  { label: "Payment", val: receipt.payment_method },
                  { label: "Customer", val: receipt.customer_name },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, fontWeight: r.bold ? 800 : 500 }}>
                    <span>{r.label}</span>
                    <span style={{ color: r.bold ? "#00b89c" : "#0d1b2a" }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "0 24px 22px", display: "flex", gap: 10 }}>
              <button onClick={handlePrint} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #e3eaf2", background: "#fff", color: "#0d1b2a", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>🖨️ Print</button>
              <button onClick={() => setReceipt(null)} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00e5c0,#0080ff)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>New Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}