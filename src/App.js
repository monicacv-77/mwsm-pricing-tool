import { useState, useEffect, useCallback } from "react";

const fmt = (n) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
const today = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
let nextId = 1000;

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f2ede6; --surf: #ffffff; --surf2: #f7f3ee;
    --navy: #1a2e44; --or: #d46e1a; --or-lt: #f5e6d3;
    --txt: #1a2e44; --mut: #7a8a9a; --bdr: #ddd8d0;
    --red: #c0392b; --green: #1a7a4a; --radius: 10px;
    --shadow: 0 2px 8px rgba(26,46,68,0.10);
  }
  body { background: var(--bg); font-family: 'Barlow', sans-serif; color: var(--txt); min-height: 100vh; }
  .hdr { background: var(--navy); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
  .hdr-brand { display: flex; align-items: center; gap: 10px; }
  .hdr-logo { width: 32px; height: 32px; background: var(--or); border-radius: 6px; display: flex; align-items: center; justify-content: center; }
  .hdr-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; color: white; letter-spacing: 0.04em; text-transform: uppercase; }
  .hdr-sub { font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 0.08em; text-transform: uppercase; }
  .settings-bar { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.08); padding: 10px 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .settings-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
  .settings-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: white; font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600; padding: 5px 10px; width: 80px; outline: none; }
  .settings-input:focus { border-color: var(--or); }
  .settings-pct { font-size: 13px; color: var(--or); font-weight: 700; }
  .settings-hint { font-size: 11px; color: rgba(255,255,255,0.3); margin-left: auto; }
  .tabs { background: var(--navy); display: flex; padding: 0 20px; gap: 2px; }
  .tab { padding: 10px 18px; border: none; background: none; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.15s; }
  .tab.active { color: white; border-bottom-color: var(--or); }
  .tab:hover:not(.active) { color: rgba(255,255,255,0.7); }
  .main { padding: 20px; max-width: 760px; margin: 0 auto; }
  .card { background: var(--surf); border: 1px solid var(--bdr); border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 16px; overflow: hidden; }
  .card-hdr { background: var(--surf2); border-bottom: 1px solid var(--bdr); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); }
  .card-body { padding: 16px; }
  .field { margin-bottom: 14px; }
  .field:last-child { margin-bottom: 0; }
  .lbl { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mut); margin-bottom: 5px; }
  .inp { width: 100%; padding: 9px 12px; border: 1.5px solid var(--bdr); border-radius: 7px; background: white; color: var(--txt); font-family: 'Barlow', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s; }
  .inp:focus { border-color: var(--or); }
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 16px; border: none; border-radius: 7px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; }
  .btn-primary { background: var(--or); color: white; }
  .btn-primary:hover { background: #b85c10; }
  .btn-primary:disabled { background: var(--bdr); color: var(--mut); cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--bdr); }
  .btn-outline:hover { border-color: var(--navy); }
  .btn-danger { background: transparent; color: var(--red); border: 1.5px solid #f0d0ce; }
  .btn-danger:hover { background: #fdf0ef; }
  .btn-sm { padding: 5px 10px; font-size: 11px; }
  .btn-full { width: 100%; }
  .type-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
  .type-tab { flex: 1; padding: 8px; border: 1.5px solid var(--bdr); border-radius: 7px; background: white; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mut); cursor: pointer; text-align: center; transition: all 0.15s; }
  .type-tab.active { border-color: var(--or); background: var(--or-lt); color: var(--or); }
  .calc-result { background: var(--or-lt); border: 1.5px solid var(--or); border-radius: 8px; padding: 14px 16px; margin-top: 14px; display: flex; align-items: center; justify-content: space-between; }
  .calc-price { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; color: var(--or); }
  .calc-detail { font-size: 12px; color: var(--mut); line-height: 1.6; text-align: right; }
  .ql { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--bdr); }
  .ql:last-child { border-bottom: none; }
  .ql-num { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; color: var(--mut); width: 20px; padding-top: 2px; flex-shrink: 0; }
  .ql-info { flex: 1; }
  .ql-name { font-size: 14px; font-weight: 600; }
  .ql-desc { font-size: 12px; color: var(--mut); margin-top: 2px; }
  .ql-price { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; white-space: nowrap; padding-top: 1px; }
  .qt { background: var(--navy); border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; margin-top: 4px; }
  .qt-label { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
  .qt-price { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 800; color: white; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 700; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
  .badge-linear { background: var(--or-lt); color: var(--or); }
  .badge-piece { background: #e8eef5; color: var(--navy); }
  .badge-fixed { background: #e8f5ee; color: var(--green); }
  .badge-own { background: #f0eef5; color: #6a4a9a; }
  .metal-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--bdr); }
  .metal-row:last-child { border-bottom: none; }
  .metal-row-name { flex: 1; font-size: 13px; }
  .metal-row-cost { font-size: 12px; color: var(--mut); width: 100px; text-align: right; font-variant-numeric: tabular-nums; }
  .metal-row-date { font-size: 11px; color: var(--mut); width: 90px; text-align: right; }
  .grp-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--or); margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid var(--or-lt); }
  .grp-label:first-child { margin-top: 0; }
  .empty { text-align: center; padding: 40px 20px; color: var(--mut); }
  .empty-icon { font-size: 32px; margin-bottom: 8px; }
  .stale { color: #b85c10; font-weight: 700; }
  .date-fresh { color: var(--green); }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .print-wrap { background: white; border: 1px solid var(--bdr); border-radius: 8px; padding: 24px; margin-top: 16px; }
  .print-co { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: var(--navy); letter-spacing: 0.04em; text-transform: uppercase; }
  .print-meta { display: flex; justify-content: space-between; margin: 16px 0; padding: 12px 0; border-top: 2px solid var(--navy); border-bottom: 1px solid var(--bdr); flex-wrap: wrap; gap: 12px; }
  .print-meta-lbl { font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); }
  .print-meta-val { font-size: 14px; font-weight: 600; margin-top: 2px; }
  .pt { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .pt th { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); padding: 6px 10px; text-align: left; border-bottom: 2px solid var(--or); }
  .pt td { font-size: 13px; padding: 10px; border-bottom: 1px solid var(--bdr); vertical-align: top; }
  .pt tr:last-child td { border-bottom: none; }
  .pt-total td { font-weight: 700; font-size: 15px; border-top: 2px solid var(--navy) !important; }
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--navy); color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 16px rgba(0,0,0,0.2); z-index: 999; animation: fadeIn 0.2s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @media print { .no-print { display: none !important; } body { background: white; } }
`;

export default function App() {
  const [metals, setMetals] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [fixedItems, setFixedItems] = useState([]);
  const [markup, setMarkup] = useState(1.20);
  const [laborRate, setLaborRate] = useState(25);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("quote");
  const [toast, setToast] = useState("");
  const [savingMarkup, setSavingMarkup] = useState(false);

  // Calculator
  const [calcType, setCalcType] = useState("linear");
  const [selMetal, setSelMetal] = useState("");
  const [selProduct, setSelProduct] = useState("");
  const [soIn, setSoIn] = useState("");
  const [lenFt, setLenFt] = useState("");
  const [pieceL, setPieceL] = useState("");
  const [pieceW, setPieceW] = useState("");
  const [selFixed, setSelFixed] = useState("");
  const [fixedQty, setFixedQty] = useState("1");
  const [lineNote, setLineNote] = useState("");

  // Quote
  const [lines, setLines] = useState([]);
  const [customer, setCustomer] = useState("");
  const [woNum, setWoNum] = useState("");
  const [showPrint, setShowPrint] = useState(false);

  // Manage metals
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [newCustomGroup, setNewCustomGroup] = useState("");
  const [newCost, setNewCost] = useState("");
  const [editId, setEditId] = useState(null);
  const [editCost, setEditCost] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  // Load all data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, ptRes, fiRes, sRes] = await Promise.all([
        fetch("/api/metals"),
        fetch("/api/product-types"),
        fetch("/api/fixed-items"),
        fetch("/api/settings"),
      ]);
      const [m, pt, fi, s] = await Promise.all([mRes.json(), ptRes.json(), fiRes.json(), sRes.json()]);
      if (Array.isArray(m)) setMetals(m);
      if (Array.isArray(pt)) setProductTypes(pt);
      if (Array.isArray(fi)) setFixedItems(fi);
      if (s && s.Markup) setMarkup(s.Markup);
      if (s && s.LaborRate) setLaborRate(s.LaborRate);
      if (Array.isArray(pt) && pt.length > 0 && !newGroup) setNewGroup(pt[0]?.name || "");
    } catch (e) {
      console.error("Load error:", e);
      showToast("Error loading data — check API configuration");
    }
    setLoading(false);
  }, [newGroup]);

  useEffect(() => { loadData(); }, []);

  // Auto-set calc type based on product type selection
  useEffect(() => {
    if (!selProduct) return;
    const pt = productTypes.find(p => p.id === Number(selProduct));
    if (pt) setCalcType(pt.defaultPricingMethod);
  }, [selProduct, productTypes]);

  const allGroups = [...new Set(metals.map(m => m.group))];

  // Date staleness check (> 30 days = stale)
  const isStale = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
    return diff > 30;
  };

  const dateDisplay = (dateStr) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Calculation
  // Core formula: price = (sheetCost / (sheetWidth * 120)) * SO_in * (feet * 12) * markup
  // 120 = sheet length in inches (10 feet standard)
  // sheetWidth = 36 (3' sheet) or 48 (4' sheet)
  const calcPrice = (metal, soInches, lengthFeet) => {
    const costPerSqIn = metal.sheetCost / (metal.sheetWidth * 120);
    return costPerSqIn * soInches * (lengthFeet * 12) * markup;
  };

  const calcResult = (() => {
    if (calcType === "linear") {
      const metal = metals.find(m => m.id === Number(selMetal));
      const so = parseFloat(soIn), ft = parseFloat(lenFt);
      if (!metal || isNaN(so) || isNaN(ft) || so <= 0 || ft <= 0) return null;
      const price = calcPrice(metal, so, ft);
      const pt = productTypes.find(p => p.id === Number(selProduct));
      return {
        price, type: "linear",
        label: `${pt ? pt.name + " — " : ""}${metal.name}`,
        desc: `${so}" S.O. × ${ft} LF`,
      };
    }
    if (calcType === "piece") {
      const metal = metals.find(m => m.id === Number(selMetal));
      const l = parseFloat(pieceL), w = parseFloat(pieceW);
      if (!metal || isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null;
      // Per piece: treat width as SO, length in inches converted to feet
      const price = calcPrice(metal, w, l / 12);
      const pt = productTypes.find(p => p.id === Number(selProduct));
      return {
        price, type: "piece",
        label: `${pt ? pt.name + " — " : ""}${metal.name}`,
        desc: `${l}" × ${w}"`,
      };
    }
    if (calcType === "fixed") {
      const item = fixedItems.find(f => f.id === Number(selFixed));
      const qty = parseInt(fixedQty) || 1;
      if (!item || !item.price) return null;
      return {
        price: item.price * qty, type: "fixed",
        label: item.name,
        desc: qty > 1 ? `${qty} × ${fmt(item.price)}` : "Fixed price item",
      };
    }
    if (calcType === "own") {
      const ft = parseFloat(lenFt);
      if (isNaN(ft) || ft <= 0) return null;
      return { price: ft * laborRate, type: "own", label: "Own Metal — Labor", desc: `${ft} LF × $${laborRate}/ft` };
    }
    return null;
  })();

  function addToQuote() {
    if (!calcResult) return;
    setLines(prev => [...prev, {
      id: nextId++,
      label: calcResult.label,
      desc: lineNote.trim() || calcResult.desc,
      price: calcResult.price,
      type: calcResult.type,
    }]);
    setSoIn(""); setLenFt(""); setPieceL(""); setPieceW(""); setFixedQty("1"); setLineNote(""); setSelFixed("");
  }

  const quoteTotal = lines.reduce((s, l) => s + l.price, 0);
  const markupPct = (markup).toFixed(2);

  async function saveMarkup(val) {
    setSavingMarkup(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "Markup", value: val }),
      });
      showToast("Markup saved");
    } catch { showToast("Error saving markup"); }
    setSavingMarkup(false);
  }

  async function handleUpdateMetal(id) {
    const cost = parseFloat(editCost);
    if (isNaN(cost) || cost <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/metals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, sheetCost: cost }),
      });
      const data = await res.json();
      setMetals(prev => prev.map(m => m.id === id
        ? { ...m, sheetCost: cost, dateUpdated: data.dateUpdated }
        : m));
      setEditId(null);
      showToast("Price updated");
    } catch { showToast("Error updating price"); }
    setSaving(false);
  }

  const [newWidth, setNewWidth] = useState("48");

  async function handleAddMetal() {
    const cost = parseFloat(newCost);
    if (!newName.trim() || isNaN(cost) || cost <= 0) { setAddMsg("Enter a valid name and sheet cost."); return; }
    const group = newGroup === "__custom__" ? (newCustomGroup.trim() || "Other") : newGroup;
    setSaving(true);
    try {
      const res = await fetch("/api/metals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), group, sheetCost: cost, sheetWidth: parseInt(newWidth) }),
      });
      const data = await res.json();
      setMetals(prev => [...prev, {
        id: data.id, name: newName.trim(), group,
        sheetCost: cost, sheetWidth: parseInt(newWidth), dateUpdated: data.dateUpdated,
      }]);
      setNewName(""); setNewCost(""); setAddMsg("✓ Added.");
      setTimeout(() => setAddMsg(""), 2000);
    } catch { setAddMsg("Error adding metal."); }
    setSaving(false);
  }

  async function handleDeleteMetal(id) {
    if (!window.confirm("Remove this metal?")) return;
    try {
      await fetch("/api/metals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMetals(prev => prev.filter(m => m.id !== id));
      showToast("Metal removed");
    } catch { showToast("Error removing metal"); }
  }

  async function handleAddProductType(name) {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/product-types", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), defaultPricingMethod: "linear" }),
      });
      const data = await res.json();
      setProductTypes(prev => [...prev, { id: data.id, name: name.trim(), defaultPricingMethod: "linear" }]);
      showToast(`"${name}" added to product types`);
    } catch { showToast("Error adding product type"); }
  }

  const metalSelect = (val, set) => (
    <select value={val} onChange={e => set(e.target.value)} className="inp">
      <option value="">— Select metal —</option>
      {allGroups.map(g => (
        <optgroup key={g} label={g}>
          {metals.filter(m => m.group === g).map(m => (
            <option key={m.id} value={m.id}>
              {m.name}{isStale(m.dateUpdated) ? " ⚠" : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  const [newPTName, setNewPTName] = useState("");

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16, background: "var(--bg)" }}>
      <style>{css}</style>
      <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderColor: "rgba(26,46,68,0.2)", borderTopColor: "var(--navy)" }} />
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: "var(--mut)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Loading pricing data…</div>
    </div>
  );

  return (
    <div>
      <style>{css}</style>

      {/* Header */}
      <div className="hdr">
        <div className="hdr-brand">
          <div className="hdr-logo">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5-4h2v11H9V8zm5-5h2v16h-2V3zm5 8h2v8h-2v-8z"/></svg>
          </div>
          <div>
            <div className="hdr-title">MWSM Pricing Tool</div>
            <div className="hdr-sub">Materials Calculator</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="btn btn-sm" style={{ background: "rgba(255,255,255,0.1)", color: "white", border: "none" }} onClick={loadData}>↺ Refresh</button>
        </div>
      </div>

      {/* Settings bar */}
      <div className="settings-bar">
        <span className="settings-label">Markup / COB</span>
        <input
          type="number" step="0.01" min="1" value={markup}
          onChange={e => setMarkup(parseFloat(e.target.value) || 1)}
          onBlur={e => saveMarkup(parseFloat(e.target.value) || 1)}
          className="settings-input"
        />
        <span className="settings-pct">×{markupPct}</span>
        {savingMarkup && <span className="spinner" />}
        <span className="settings-hint">Current default: ~2.68 · Adjust as costs change</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${tab === "quote" ? " active" : ""}`} onClick={() => setTab("quote")}>Quote Builder</button>
        <button className={`tab${tab === "manage" ? " active" : ""}`} onClick={() => setTab("manage")}>Manage Metals</button>
      </div>

      <div className="main">

        {/* ── QUOTE BUILDER ── */}
        {tab === "quote" && (<>
          <div className="card">
            <div className="card-hdr"><span className="card-title">Calculate Line Item</span></div>
            <div className="card-body">

              {/* Pricing type tabs */}
              <div className="type-tabs">
                {[["linear","Linear Feet"],["piece","Per Piece"],["fixed","Fixed Price"],["own","Own Metal"]].map(([t,l]) => (
                  <button key={t} className={`type-tab${calcType === t ? " active" : ""}`} onClick={() => setCalcType(t)}>{l}</button>
                ))}
              </div>

              {/* Product type — shown for linear, piece, own */}
              {(calcType === "linear" || calcType === "piece" || calcType === "own") && (
                <div className="field">
                  <label className="lbl">Product Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <select value={selProduct} onChange={e => {
                      const val = e.target.value;
                      if (val === "__new__") {
                        const name = window.prompt("New product type name:");
                        if (name) handleAddProductType(name);
                      } else {
                        setSelProduct(val);
                      }
                    }} className="inp">
                      <option value="">— Select product type —</option>
                      {productTypes.filter(p => p.defaultPricingMethod !== "fixed").map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                      <option value="__new__">+ Add new type…</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Metal — linear and piece only */}
              {(calcType === "linear" || calcType === "piece") && (
                <div className="field">
                  <label className="lbl">Metal Type {selMetal && isStale(metals.find(m=>m.id===Number(selMetal))?.dateUpdated) && <span className="stale">⚠ Price may be outdated</span>}</label>
                  {metalSelect(selMetal, setSelMetal)}
                  {selMetal && (
                    <div style={{ fontSize: 11, color: "var(--mut)", marginTop: 4 }}>
                      Last updated: <span className={isStale(metals.find(m=>m.id===Number(selMetal))?.dateUpdated) ? "stale" : "date-fresh"}>
                        {dateDisplay(metals.find(m=>m.id===Number(selMetal))?.dateUpdated)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Dimensions */}
              {calcType === "linear" && (
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Stretch-Out (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 6" value={soIn} onChange={e => setSoIn(e.target.value)} className="inp" />
                  </div>
                  <div className="field">
                    <label className="lbl">Length (feet)</label>
                    <input type="number" min="0" placeholder="e.g. 30" value={lenFt} onChange={e => setLenFt(e.target.value)} className="inp" />
                  </div>
                </div>
              )}
              {calcType === "piece" && (
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Length (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 24" value={pieceL} onChange={e => setPieceL(e.target.value)} className="inp" />
                  </div>
                  <div className="field">
                    <label className="lbl">Width (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 18" value={pieceW} onChange={e => setPieceW(e.target.value)} className="inp" />
                  </div>
                </div>
              )}
              {calcType === "fixed" && (
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Item</label>
                    <select value={selFixed} onChange={e => setSelFixed(e.target.value)} className="inp">
                      <option value="">— Select item —</option>
                      {fixedItems.map(f => (
                        <option key={f.id} value={f.id}>{f.name} — {fmt(f.price)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label className="lbl">Quantity</label>
                    <input type="number" min="1" value={fixedQty} onChange={e => setFixedQty(e.target.value)} className="inp" />
                  </div>
                </div>
              )}
              {calcType === "own" && (
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Linear Feet</label>
                    <input type="number" min="0" placeholder="e.g. 8" value={lenFt} onChange={e => setLenFt(e.target.value)} className="inp" />
                  </div>
                  <div className="field">
                    <label className="lbl">Labor Rate ($/ft)</label>
                    <input type="number" min="0" step="0.50" value={laborRate} onChange={e => setLaborRate(e.target.value)} className="inp" />
                  </div>
                </div>
              )}

              {/* Line description */}
              <div className="field" style={{ marginTop: 4 }}>
                <label className="lbl">Line Description (optional)</label>
                <input placeholder="e.g. Z-bar at entry, window head detail…" value={lineNote} onChange={e => setLineNote(e.target.value)} className="inp" />
              </div>

              {/* Result */}
              {calcResult && (
                <div className="calc-result">
                  <div>
                    <div style={{ fontSize: 11, color: "var(--or)", fontWeight: 700, marginBottom: 2, fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>Calculated Price</div>
                    <div className="calc-price">{fmt(calcResult.price)}</div>
                  </div>
                  <div className="calc-detail">
                    {calcResult.sqIn && <div>{calcResult.sqIn.toFixed(0)} sq in</div>}
                    {calcResult.raw && <div>Material: {fmt(calcResult.raw)}</div>}
                    {calcType !== "fixed" && calcType !== "own" && <div>Markup: ×{markupPct}</div>}
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-full" style={{ marginTop: 14 }} disabled={!calcResult} onClick={addToQuote}>
                + Add to Quote
              </button>
            </div>
          </div>

          {/* Quote card */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Quote — {lines.length} item{lines.length !== 1 ? "s" : ""}</span>
              {lines.length > 0 && <button className="btn btn-outline btn-sm" onClick={() => setLines([])}>Clear All</button>}
            </div>
            <div className="card-body">
              <div className="g2" style={{ marginBottom: 14 }}>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="lbl">Customer / Job</label>
                  <input placeholder="e.g. Smith Residence" value={customer} onChange={e => setCustomer(e.target.value)} className="inp" />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="lbl">Work Order #</label>
                  <input placeholder="e.g. WO-2026-041" value={woNum} onChange={e => setWoNum(e.target.value)} className="inp" />
                </div>
              </div>

              {lines.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>
                  <div>No items yet — calculate a price above and add it to the quote.</div>
                </div>
              ) : (<>
                {lines.map((l, i) => (
                  <div key={l.id} className="ql">
                    <div className="ql-num">{i + 1}.</div>
                    <div className="ql-info">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="ql-name">{l.label}</span>
                        <span className={`badge badge-${l.type}`}>{l.type === "own" ? "Own Metal" : l.type === "fixed" ? "Fixed" : l.type === "piece" ? "Per Piece" : "Linear Ft"}</span>
                      </div>
                      <div className="ql-desc">{l.desc}</div>
                    </div>
                    <div className="ql-price">{fmt(l.price)}</div>
                    <button className="btn btn-danger btn-sm" onClick={() => setLines(prev => prev.filter(x => x.id !== l.id))}>✕</button>
                  </div>
                ))}
                <div className="qt" style={{ marginTop: 12 }}>
                  <span className="qt-label">Total</span>
                  <span className="qt-price">{fmt(quoteTotal)}</span>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }} className="no-print">
                  <button className="btn btn-primary" onClick={() => setShowPrint(!showPrint)}>{showPrint ? "Hide" : "Print / Export"}</button>
                  <button className="btn btn-outline" onClick={() => {
                    const rows = [["#","Description","Details","Price"],...lines.map((l,i)=>[i+1,l.label,l.desc,l.price.toFixed(2)]),["","","TOTAL",quoteTotal.toFixed(2)]];
                    const csv = rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
                    const a = document.createElement("a"); a.href = "data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download=`quote-${woNum||"draft"}.csv`; a.click();
                  }}>Download CSV</button>
                </div>

                {showPrint && (
                  <div className="print-wrap">
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div className="print-co">Montie Wayne Sheet Metal</div>
                        <div style={{ fontSize:12,color:"var(--mut)",marginTop:2 }}>Materials Quote</div>
                      </div>
                      <div style={{ textAlign:"right",fontSize:12,color:"var(--mut)" }}>
                        <div>{today()}</div>
                        {woNum && <div style={{ fontWeight:700,color:"var(--txt)" }}>WO: {woNum}</div>}
                      </div>
                    </div>
                    <div className="print-meta">
                      {customer && <div><div className="print-meta-lbl">Customer / Job</div><div className="print-meta-val">{customer}</div></div>}
                      <div><div className="print-meta-lbl">Items</div><div className="print-meta-val">{lines.length}</div></div>
                      <div><div className="print-meta-lbl">Markup</div><div className="print-meta-val">×{markupPct}</div></div>
                    </div>
                    <table className="pt">
                      <thead><tr><th>#</th><th>Description</th><th>Details</th><th style={{textAlign:"right"}}>Price</th></tr></thead>
                      <tbody>
                        {lines.map((l,i) => (
                          <tr key={l.id}>
                            <td style={{color:"var(--mut)"}}>{i+1}</td>
                            <td>{l.label}</td>
                            <td style={{color:"var(--mut)"}}>{l.desc}</td>
                            <td style={{textAlign:"right"}}>{fmt(l.price)}</td>
                          </tr>
                        ))}
                        <tr className="pt-total">
                          <td colSpan={3} style={{textAlign:"right"}}>Total</td>
                          <td style={{textAlign:"right",color:"var(--or)"}}>{fmt(quoteTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{fontSize:11,color:"var(--mut)",marginTop:16,paddingTop:12,borderTop:"1px solid var(--bdr)"}}>Materials pricing estimate. Final invoice issued through QuickBooks.</div>
                    <div style={{marginTop:12,display:"flex",gap:8}} className="no-print">
                      <button className="btn btn-primary btn-sm" onClick={() => window.print()}>🖨 Print</button>
                    </div>
                  </div>
                )}
              </>)}
            </div>
          </div>
        </>)}

        {/* ── MANAGE METALS ── */}
        {tab === "manage" && (<>
          <div className="card">
            <div className="card-hdr"><span className="card-title">Add Metal Type</span></div>
            <div className="card-body">
              <div className="field">
                <label className="lbl">Metal Name</label>
                <input placeholder="e.g. Galvanized — 18 ga" value={newName} onChange={e => setNewName(e.target.value)} className="inp" />
              </div>
              <div className="g2">
                <div className="field">
                  <label className="lbl">Group</label>
                  <select value={newGroup} onChange={e => setNewGroup(e.target.value)} className="inp">
                    {allGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    <option value="__custom__">+ New group…</option>
                  </select>
                </div>
                <div className="g2">
                  <div className="field">
                    <label className="lbl">Sheet Cost ($)</label>
                    <input type="number" min="0" step="0.01" placeholder="e.g. 35.00" value={newCost} onChange={e => setNewCost(e.target.value)} className="inp" />
                    <div style={{fontSize:11,color:"var(--mut)",marginTop:4}}>What Paul pays per sheet</div>
                  </div>
                  <div className="field">
                    <label className="lbl">Sheet Width</label>
                    <select value={newWidth} onChange={e => setNewWidth(e.target.value)} className="inp">
                      <option value="48">4' wide (48")</option>
                      <option value="36">3' wide (36")</option>
                      <option value="60">5' wide (60")</option>
                    </select>
                    <div style={{fontSize:11,color:"var(--mut)",marginTop:4}}>All sheets are 10' long</div>
                  </div>
                </div>
              </div>
              {newGroup === "__custom__" && (
                <div className="field">
                  <label className="lbl">New Group Name</label>
                  <input placeholder="e.g. Specialty Coated" value={newCustomGroup} onChange={e => setNewCustomGroup(e.target.value)} className="inp" />
                </div>
              )}
              <button className="btn btn-primary" onClick={handleAddMetal} disabled={saving}>
                {saving ? <span className="spinner" /> : "Add Metal"}
              </button>
              {addMsg && <span style={{ marginLeft:12,fontSize:12,color:"var(--green)" }}>{addMsg}</span>}
            </div>
          </div>

          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Metal List — {metals.length} types</span>
              <div style={{ fontSize:11,color:"var(--mut)" }}>⚠ = price not updated in 30+ days</div>
            </div>
            <div className="card-body">
              {allGroups.map(g => (
                <div key={g}>
                  <div className="grp-label">{g}</div>
                  {metals.filter(m => m.group === g).map(m => (
                    <div key={m.id} className="metal-row">
                      <div className="metal-row-name">
                        {isStale(m.dateUpdated) && <span style={{marginRight:4}}>⚠</span>}
                        {m.name}
                      </div>
                      {editId === m.id ? (<>
                        <input type="number" step="0.01" value={editCost} onChange={e => setEditCost(e.target.value)}
                          className="inp" style={{ width:100,padding:"4px 8px",fontSize:12 }} />
                        <span style={{ fontSize:10,color:"var(--mut)" }}>$/sheet</span>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateMetal(m.id)} disabled={saving}>
                          {saving ? <span className="spinner" /> : "Save"}
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditId(null)}>✕</button>
                      </>) : (<>
                        <div style={{fontSize:11,color:"var(--mut)",width:50}}>{m.sheetWidth === 36 ? "3' sheet" : m.sheetWidth === 60 ? "5' sheet" : "4' sheet"}</div>
                        <div className="metal-row-cost">${(m.sheetCost || 0).toFixed(2)}</div>
                        <div className={`metal-row-date ${isStale(m.dateUpdated) ? "stale" : "date-fresh"}`}>{dateDisplay(m.dateUpdated)}</div>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditId(m.id); setEditCost((m.sheetCost||0).toFixed(2)); }}>Update Price</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMetal(m.id)}>✕</button>
                      </>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
