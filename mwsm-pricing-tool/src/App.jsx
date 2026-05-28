import { useState, useEffect, useRef } from "react";

const fmt = (n) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });
const nextLineId = { v: 1000 };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #f2ede6;
    --surf: #ffffff;
    --surf2: #f7f3ee;
    --navy: #1a2e44;
    --or: #d46e1a;
    --or-lt: #f5e6d3;
    --txt: #1a2e44;
    --mut: #7a8a9a;
    --bdr: #ddd8d0;
    --red: #c0392b;
    --green: #1a7a4a;
    --green-lt: #e8f5ee;
    --radius: 10px;
    --shadow: 0 2px 8px rgba(26,46,68,0.10);
  }
  body { background: var(--bg); font-family: 'Barlow', sans-serif; color: var(--txt); }
  .app { min-height: 100vh; }

  /* Header */
  .hdr { background: var(--navy); padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 56px; }
  .hdr-brand { display: flex; align-items: center; gap: 10px; }
  .hdr-logo { width: 34px; height: 34px; background: var(--or); border-radius: 7px; display: flex; align-items: center; justify-content: center; }
  .hdr-logo svg { width: 18px; height: 18px; fill: white; }
  .hdr-title { font-family: 'Barlow Condensed', sans-serif; font-size: 20px; font-weight: 800; color: white; letter-spacing: 0.04em; text-transform: uppercase; }
  .hdr-sub { font-size: 11px; color: rgba(255,255,255,0.45); letter-spacing: 0.08em; text-transform: uppercase; }

  /* Settings bar */
  .settings-bar { background: var(--navy); border-top: 1px solid rgba(255,255,255,0.08); padding: 10px 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
  .settings-label { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.45); }
  .settings-input { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 6px; color: white; font-family: 'Barlow', sans-serif; font-size: 14px; font-weight: 600; padding: 5px 10px; width: 80px; outline: none; transition: border-color 0.15s; }
  .settings-input:focus { border-color: var(--or); }
  .settings-pct { font-size: 13px; color: var(--or); font-weight: 700; }
  .settings-hint { font-size: 11px; color: rgba(255,255,255,0.25); margin-left: auto; }
  .settings-save { background: var(--or); border: none; border-radius: 6px; color: white; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 5px 12px; cursor: pointer; }

  /* Tabs */
  .tabs { background: var(--navy); display: flex; padding: 0 20px; gap: 2px; }
  .tab { padding: 10px 18px; border: none; background: none; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.45); cursor: pointer; border-bottom: 3px solid transparent; transition: all 0.15s; }
  .tab.active { color: white; border-bottom-color: var(--or); }
  .tab:hover:not(.active) { color: rgba(255,255,255,0.7); }

  /* Main */
  .main { padding: 20px; max-width: 780px; margin: 0 auto; }

  /* Cards */
  .card { background: var(--surf); border: 1px solid var(--bdr); border-radius: var(--radius); box-shadow: var(--shadow); margin-bottom: 16px; overflow: hidden; }
  .card-hdr { background: var(--surf2); border-bottom: 1px solid var(--bdr); padding: 12px 16px; display: flex; align-items: center; justify-content: space-between; }
  .card-title { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); }
  .card-body { padding: 16px; }

  /* Form */
  .field { margin-bottom: 14px; }
  .field:last-child { margin-bottom: 0; }
  .field-label { display: block; font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mut); margin-bottom: 5px; }
  .field-hint { font-size: 11px; color: var(--mut); margin-top: 3px; }
  .field-input { width: 100%; padding: 9px 12px; border: 1.5px solid var(--bdr); border-radius: 7px; background: white; color: var(--txt); font-family: 'Barlow', sans-serif; font-size: 14px; outline: none; transition: border-color 0.15s; }
  .field-input:focus { border-color: var(--or); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 16px; border: none; border-radius: 7px; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
  .btn-primary { background: var(--or); color: white; }
  .btn-primary:hover { background: #b85c10; }
  .btn-primary:disabled { background: var(--bdr); color: var(--mut); cursor: not-allowed; }
  .btn-outline { background: transparent; color: var(--navy); border: 1.5px solid var(--bdr); }
  .btn-outline:hover { border-color: var(--navy); }
  .btn-danger { background: transparent; color: var(--red); border: 1.5px solid #f0d0ce; }
  .btn-danger:hover { background: #fdf0ef; }
  .btn-sm { padding: 5px 10px; font-size: 11px; }
  .btn-full { width: 100%; }

  /* Type toggle */
  .type-tabs { display: flex; gap: 8px; margin-bottom: 14px; }
  .type-tab { flex: 1; padding: 8px; border: 1.5px solid var(--bdr); border-radius: 7px; background: white; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--mut); cursor: pointer; text-align: center; transition: all 0.15s; }
  .type-tab.active { border-color: var(--or); background: var(--or-lt); color: var(--or); }

  /* Result */
  .calc-result { background: var(--or-lt); border: 1.5px solid var(--or); border-radius: 8px; padding: 14px 16px; margin-top: 14px; display: flex; align-items: center; justify-content: space-between; }
  .calc-result-price { font-family: 'Barlow Condensed', sans-serif; font-size: 32px; font-weight: 800; color: var(--or); }
  .calc-result-detail { font-size: 12px; color: var(--mut); line-height: 1.6; text-align: right; }

  /* Quote lines */
  .quote-line { display: flex; align-items: flex-start; gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--bdr); }
  .quote-line:last-child { border-bottom: none; }
  .quote-line-num { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 700; color: var(--mut); width: 22px; padding-top: 2px; flex-shrink: 0; }
  .quote-line-info { flex: 1; min-width: 0; }
  .quote-line-name { font-size: 14px; font-weight: 600; color: var(--txt); }
  .quote-line-desc { font-size: 12px; color: var(--mut); margin-top: 2px; }
  .quote-line-price { font-family: 'Barlow Condensed', sans-serif; font-size: 18px; font-weight: 800; color: var(--txt); white-space: nowrap; padding-top: 2px; }

  /* Quote total */
  .quote-total { background: var(--navy); border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
  .quote-total-label { font-family: 'Barlow Condensed', sans-serif; font-size: 14px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
  .quote-total-price { font-family: 'Barlow Condensed', sans-serif; font-size: 28px; font-weight: 800; color: white; }

  /* Badge */
  .badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 10px; font-weight: 700; font-family: 'Barlow Condensed', sans-serif; letter-spacing: 0.06em; text-transform: uppercase; }
  .badge-linear { background: var(--or-lt); color: var(--or); }
  .badge-piece { background: #e8eef5; color: var(--navy); }
  .badge-own { background: var(--green-lt); color: var(--green); }
  .badge-fixed { background: #f0ebf5; color: #6a3a9a; }

  /* Date updated pill */
  .date-pill { display: inline-flex; align-items: center; gap: 4px; font-size: 10px; color: var(--mut); background: var(--surf2); border: 1px solid var(--bdr); border-radius: 20px; padding: 2px 8px; }
  .date-pill.stale { color: #c0392b; background: #fdf0ef; border-color: #f0d0ce; }

  /* Metal rows */
  .group-label { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; color: var(--or); margin: 16px 0 8px; padding-bottom: 4px; border-bottom: 2px solid var(--or-lt); }
  .group-label:first-child { margin-top: 0; }
  .metal-row { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--bdr); }
  .metal-row:last-child { border-bottom: none; }
  .metal-row-name { flex: 1; font-size: 13px; }
  .metal-row-price { font-size: 12px; color: var(--mut); font-variant-numeric: tabular-nums; min-width: 90px; text-align: right; }

  /* Print */
  .print-preview { background: white; border: 1px solid var(--bdr); border-radius: 8px; padding: 24px; margin-top: 16px; }
  .print-co { font-family: 'Barlow Condensed', sans-serif; font-size: 22px; font-weight: 800; color: var(--navy); letter-spacing: 0.04em; text-transform: uppercase; }
  .print-meta { display: flex; justify-content: space-between; margin: 14px 0; padding: 12px 0; border-top: 2px solid var(--navy); border-bottom: 1px solid var(--bdr); gap: 16px; }
  .print-meta-item { }
  .print-meta-label { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); }
  .print-meta-val { font-size: 14px; font-weight: 600; margin-top: 2px; }
  .print-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  .print-table th { font-family: 'Barlow Condensed', sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mut); padding: 6px 10px; text-align: left; border-bottom: 2px solid var(--or); }
  .print-table td { font-size: 13px; padding: 10px; border-bottom: 1px solid var(--bdr); vertical-align: top; }
  .print-table tr:last-child td { border-bottom: none; }
  .print-total-row td { font-weight: 700; font-size: 15px; border-top: 2px solid var(--navy) !important; padding-top: 12px; }
  .print-note { font-size: 11px; color: var(--mut); margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--bdr); }

  /* Loading / error */
  .loading { text-align: center; padding: 60px 20px; color: var(--mut); font-family: 'Barlow Condensed', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
  .error-bar { background: #fdf0ef; border: 1px solid #f0d0ce; border-radius: 8px; padding: 12px 16px; color: var(--red); font-size: 13px; margin-bottom: 16px; }
  .empty { text-align: center; padding: 40px 20px; color: var(--mut); }
  .empty-icon { font-size: 32px; margin-bottom: 8px; }
  .empty-text { font-size: 14px; }

  /* Select date warning */
  .warn { color: #b85c10; font-size: 11px; margin-top: 3px; }

  @media print {
    .no-print { display: none !important; }
    .hdr, .settings-bar, .tabs, .main > .card:first-child { display: none !important; }
    .print-preview { border: none; padding: 0; margin: 0; }
    body { background: white; }
  }

  @media (max-width: 560px) {
    .grid-2, .grid-3 { grid-template-columns: 1fr; }
    .type-tabs { flex-wrap: wrap; }
    .hdr-title { font-size: 16px; }
  }
`;

const DEFAULT_PRODUCT_TYPES = [
  { id: "1", name: "Z-Bar", defaultMethod: "linear" },
  { id: "2", name: "L-Metal", defaultMethod: "linear" },
  { id: "3", name: "J-Channel", defaultMethod: "linear" },
  { id: "4", name: "U-Channel", defaultMethod: "linear" },
  { id: "5", name: "Drip Edge", defaultMethod: "linear" },
  { id: "6", name: "Coping", defaultMethod: "linear" },
  { id: "7", name: "Flat Pan", defaultMethod: "piece" },
  { id: "8", name: "Custom", defaultMethod: "linear" },
];

// Days since a date string
function daysSince(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function DatePill({ date }) {
  if (!date) return <span className="date-pill">Not updated</span>;
  const days = daysSince(date);
  const stale = days !== null && days > 30;
  return <span className={`date-pill${stale ? " stale" : ""}`}>📅 {date}{stale ? ` · ${days}d ago` : ""}</span>;
}

export default function App() {
  const [metals, setMetals] = useState([]);
  const [productTypes, setProductTypes] = useState(DEFAULT_PRODUCT_TYPES);
  const [markup, setMarkup] = useState(1.20);
  const [laborRate, setLaborRate] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [tab, setTab] = useState("quote");

  // Calculator
  const [calcType, setCalcType] = useState("linear");
  const [selMetal, setSelMetal] = useState("");
  const [selProduct, setSelProduct] = useState("");
  const [soIn, setSoIn] = useState("");
  const [lenFt, setLenFt] = useState("");
  const [pieceL, setPieceL] = useState("");
  const [pieceW, setPieceW] = useState("");
  const [ownFt, setOwnFt] = useState("");
  const [lineNote, setLineNote] = useState("");

  // Quote
  const [lines, setLines] = useState([]);
  const [customer, setCustomer] = useState("");
  const [woNumber, setWoNumber] = useState("");
  const [showPrint, setShowPrint] = useState(false);

  // Manage metals
  const [newMetalName, setNewMetalName] = useState("");
  const [newMetalGroup, setNewMetalGroup] = useState("");
  const [newMetalCost, setNewMetalCost] = useState("");
  const [metalMsg, setMetalMsg] = useState("");
  const [editMetalId, setEditMetalId] = useState(null);
  const [editMetalCost, setEditMetalCost] = useState("");
  const [saving, setSaving] = useState(false);

  // Manage product types
  const [newPTName, setNewPTName] = useState("");
  const [newPTMethod, setNewPTMethod] = useState("linear");
  const [ptMsg, setPtMsg] = useState("");

  const allGroups = [...new Set(metals.map(m => m.group))];

  // Load data
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [mRes, ptRes, sRes] = await Promise.all([
          fetch("/api/metals"),
          fetch("/api/product-types"),
          fetch("/api/settings"),
        ]);
        const mData = await mRes.json();
        const ptData = await ptRes.json();
        const sData = await sRes.json();

        if (mData.metals?.length) setMetals(mData.metals);
        if (ptData.productTypes?.length) setProductTypes(ptData.productTypes);
        if (sData.markup) setMarkup(sData.markup);
        if (sData.laborRate) setLaborRate(sData.laborRate);
      } catch (e) {
        setError("Could not load data from Google Sheets. Check your connection.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // When product selected, auto-set calc type
  useEffect(() => {
    const pt = productTypes.find(p => p.id === selProduct);
    if (pt) setCalcType(pt.defaultMethod === "piece" ? "piece" : "linear");
  }, [selProduct, productTypes]);

  // Calculation
  const selectedMetal = metals.find(m => String(m.id) === String(selMetal));
  const selectedProduct = productTypes.find(p => String(p.id) === String(selProduct));

  const calcResult = (() => {
    if (calcType === "own") {
      const ft = parseFloat(ownFt), rate = parseFloat(laborRate);
      if (isNaN(ft) || ft <= 0) return null;
      return {
        price: ft * rate,
        label: selectedProduct ? `${selectedProduct.name} — Own Metal` : "Own Metal — Labor",
        desc: `${ft} LF × $${rate}/ft labor`,
        type: "own",
      };
    }
    if (!selectedMetal) return null;
    if (calcType === "linear") {
      const so = parseFloat(soIn), ft = parseFloat(lenFt);
      if (isNaN(so) || isNaN(ft) || so <= 0 || ft <= 0) return null;
      const sqIn = so * (ft * 12);
      const raw = selectedMetal.costPerSqIn * sqIn;
      return {
        price: raw * markup,
        label: selectedProduct ? `${selectedProduct.name} — ${selectedMetal.name}` : selectedMetal.name,
        desc: `${so}" S.O. × ${ft} LF  ·  ${sqIn.toFixed(0)} sq in`,
        sqIn, raw, type: "linear",
      };
    }
    if (calcType === "piece") {
      const l = parseFloat(pieceL), w = parseFloat(pieceW);
      if (isNaN(l) || isNaN(w) || l <= 0 || w <= 0) return null;
      const sqIn = l * w;
      const raw = selectedMetal.costPerSqIn * sqIn;
      return {
        price: raw * markup,
        label: selectedProduct ? `${selectedProduct.name} — ${selectedMetal.name}` : selectedMetal.name,
        desc: `${l}" × ${w}"  ·  ${sqIn.toFixed(0)} sq in`,
        sqIn, raw, type: "piece",
      };
    }
    return null;
  })();

  function addToQuote() {
    if (!calcResult) return;
    setLines(prev => [...prev, {
      id: nextLineId.v++,
      ...calcResult,
      desc: lineNote.trim() || calcResult.desc,
      calcDesc: calcResult.desc,
    }]);
    setSoIn(""); setLenFt(""); setPieceL(""); setPieceW(""); setOwnFt(""); setLineNote("");
    setSelProduct(""); setSelMetal("");
  }

  const quoteTotal = lines.reduce((s, l) => s + l.price, 0);
  const markupPct = ((markup - 1) * 100).toFixed(1);

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markup, laborRate }),
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2000);
    } catch { setError("Failed to save settings."); }
    setSaving(false);
  }

  async function handleUpdateMetal(id) {
    const cost = parseFloat(editMetalCost);
    if (isNaN(cost) || cost <= 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/update-metal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, sheetCost: cost }),
      });
      const data = await res.json();
      setMetals(prev => prev.map(m => String(m.id) === String(id)
        ? { ...m, sheetCost: cost, costPerSqIn: data.costPerSqIn, dateUpdated: data.dateUpdated }
        : m
      ));
      setEditMetalId(null);
    } catch { setError("Failed to update metal price."); }
    setSaving(false);
  }

  async function handleAddMetal() {
    const cost = parseFloat(newMetalCost);
    if (!newMetalName.trim() || !newMetalGroup.trim() || isNaN(cost) || cost <= 0) {
      setMetalMsg("Please fill in all fields."); return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/add-metal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newMetalName.trim(), group: newMetalGroup.trim(), sheetCost: cost }),
      });
      const data = await res.json();
      setMetals(prev => [...prev, {
        id: data.id, name: newMetalName.trim(), group: newMetalGroup.trim(),
        sheetCost: cost, costPerSqIn: data.costPerSqIn, dateUpdated: data.dateUpdated,
      }]);
      setNewMetalName(""); setNewMetalGroup(""); setNewMetalCost("");
      setMetalMsg("✓ Metal added.");
      setTimeout(() => setMetalMsg(""), 2500);
    } catch { setMetalMsg("Failed to add metal."); }
    setSaving(false);
  }

  async function handleAddProductType() {
    if (!newPTName.trim()) { setPtMsg("Enter a name."); return; }
    try {
      const res = await fetch("/api/product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPTName.trim(), defaultMethod: newPTMethod }),
      });
      const data = await res.json();
      setProductTypes(prev => [...prev, { id: String(data.id), name: newPTName.trim(), defaultMethod: newPTMethod }]);
      setNewPTName(""); setPtMsg("✓ Added.");
      setTimeout(() => setPtMsg(""), 2000);
    } catch { setPtMsg("Failed to add product type."); }
  }

  const typeBadge = { linear: "badge-linear", piece: "badge-piece", own: "badge-own", fixed: "badge-fixed" };
  const typeLabel = { linear: "Linear Ft", piece: "Per Piece", own: "Own Metal", fixed: "Fixed" };

  const metalSelect = (
    <select value={selMetal} onChange={e => setSelMetal(e.target.value)} className="field-input">
      <option value="">— Select metal type —</option>
      {allGroups.map(g => (
        <optgroup key={g} label={g}>
          {metals.filter(m => m.group === g).map(m => (
            <option key={m.id} value={m.id}>
              {m.name}{m.dateUpdated ? ` · updated ${m.dateUpdated}` : ""}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  if (loading) return (
    <div className="app"><style>{css}</style>
      <div className="hdr"><div className="hdr-brand"><div className="hdr-logo"><svg viewBox="0 0 24 24"><path d="M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5-4h2v11H9V8zm5-5h2v16h-2V3zm5 8h2v8h-2v-8z"/></svg></div><div><div className="hdr-title">MWSM Shop Pricing</div></div></div></div>
      <div className="loading">Loading pricing data…</div>
    </div>
  );

  return (
    <div className="app">
      <style>{css}</style>

      {/* Header */}
      <div className="hdr">
        <div className="hdr-brand">
          <div className="hdr-logo">
            <svg viewBox="0 0 24 24"><path d="M2 20h20v2H2v-2zm2-8h2v7H4v-7zm5-4h2v11H9V8zm5-5h2v16h-2V3zm5 8h2v8h-2v-8z"/></svg>
          </div>
          <div>
            <div className="hdr-title">MWSM Shop Pricing</div>
            <div className="hdr-sub">Materials Calculator</div>
          </div>
        </div>
      </div>

      {/* Settings bar */}
      <div className="settings-bar">
        <span className="settings-label">Markup / COB</span>
        <input type="number" step="0.01" min="1" value={markup}
          onChange={e => setMarkup(parseFloat(e.target.value) || 1)}
          className="settings-input" />
        <span className="settings-pct">+{markupPct}%</span>
        <span className="settings-label" style={{marginLeft:16}}>Labor Rate</span>
        <input type="number" step="0.50" min="0" value={laborRate}
          onChange={e => setLaborRate(parseFloat(e.target.value) || 0)}
          className="settings-input" />
        <span className="settings-pct">/ft</span>
        <button className="settings-save" onClick={saveSettings} disabled={saving}>
          {settingsSaved ? "✓ Saved" : "Save"}
        </button>
        <span className="settings-hint">Changes apply to all future quotes</span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab${tab === "quote" ? " active" : ""}`} onClick={() => setTab("quote")}>Quote Builder</button>
        <button className={`tab${tab === "manage" ? " active" : ""}`} onClick={() => setTab("manage")}>Manage Metals</button>
      </div>

      <div className="main">
        {error && <div className="error-bar">⚠ {error} <button style={{float:"right",background:"none",border:"none",cursor:"pointer",color:"var(--red)"}} onClick={() => setError("")}>✕</button></div>}

        {/* ── QUOTE BUILDER ── */}
        {tab === "quote" && (<>

          {/* Calculator */}
          <div className="card">
            <div className="card-hdr"><span className="card-title">Calculate Line Item</span></div>
            <div className="card-body">

              {/* Type toggle */}
              <div className="type-tabs">
                {[["linear","Linear Feet"],["piece","Per Piece"],["own","Own Metal"]].map(([t,l]) => (
                  <button key={t} className={`type-tab${calcType === t ? " active" : ""}`} onClick={() => setCalcType(t)}>{l}</button>
                ))}
              </div>

              {/* Product type */}
              <div className="field">
                <label className="field-label">Product Type</label>
                <select value={selProduct} onChange={e => setSelProduct(e.target.value)} className="field-input">
                  <option value="">— Select product type —</option>
                  {productTypes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Metal (not for own metal) */}
              {calcType !== "own" && (
                <div className="field">
                  <label className="field-label">Metal Type</label>
                  {metalSelect}
                  {selectedMetal?.dateUpdated && (
                    <div style={{marginTop:5}}><DatePill date={selectedMetal.dateUpdated} /></div>
                  )}
                </div>
              )}

              {/* Linear */}
              {calcType === "linear" && (
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Stretch-Out (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 6" value={soIn} onChange={e => setSoIn(e.target.value)} className="field-input" />
                  </div>
                  <div className="field">
                    <label className="field-label">Length (feet)</label>
                    <input type="number" min="0" placeholder="e.g. 30" value={lenFt} onChange={e => setLenFt(e.target.value)} className="field-input" />
                  </div>
                </div>
              )}

              {/* Per piece */}
              {calcType === "piece" && (
                <div className="grid-2">
                  <div className="field">
                    <label className="field-label">Length (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 24" value={pieceL} onChange={e => setPieceL(e.target.value)} className="field-input" />
                  </div>
                  <div className="field">
                    <label className="field-label">Width (inches)</label>
                    <input type="number" min="0" placeholder="e.g. 18" value={pieceW} onChange={e => setPieceW(e.target.value)} className="field-input" />
                  </div>
                </div>
              )}

              {/* Own metal */}
              {calcType === "own" && (
                <div className="field" style={{maxWidth:200}}>
                  <label className="field-label">Linear Feet</label>
                  <input type="number" min="0" placeholder="e.g. 8" value={ownFt} onChange={e => setOwnFt(e.target.value)} className="field-input" />
                  <div className="field-hint">Labor rate: ${laborRate}/ft</div>
                </div>
              )}

              {/* Line description */}
              <div className="field">
                <label className="field-label">Line Description <span style={{fontWeight:400,textTransform:"none",letterSpacing:0}}>(optional — overrides auto-description)</span></label>
                <input placeholder="e.g. Z-bar at entry, window head..." value={lineNote} onChange={e => setLineNote(e.target.value)} className="field-input" />
              </div>

              {/* Result */}
              {calcResult && (
                <div className="calc-result">
                  <div>
                    <div style={{fontSize:11,color:"var(--or)",fontWeight:700,marginBottom:2,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.08em",textTransform:"uppercase"}}>Calculated Price</div>
                    <div className="calc-result-price">{fmt(calcResult.price)}</div>
                  </div>
                  <div className="calc-result-detail">
                    {calcResult.sqIn && <div>{calcResult.sqIn.toFixed(0)} sq in</div>}
                    {calcResult.raw && <div>Material: {fmt(calcResult.raw)}</div>}
                    <div>Markup: +{markupPct}%</div>
                  </div>
                </div>
              )}

              <button className="btn btn-primary btn-full" style={{marginTop:14}} disabled={!calcResult} onClick={addToQuote}>
                + Add to Quote
              </button>
            </div>
          </div>

          {/* Quote */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Quote — {lines.length} item{lines.length !== 1 ? "s" : ""}</span>
              {lines.length > 0 && <button className="btn btn-outline btn-sm" onClick={() => setLines([])}>Clear All</button>}
            </div>
            <div className="card-body">
              <div className="grid-2" style={{marginBottom:14}}>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-label">Customer / Job Name</label>
                  <input placeholder="e.g. Smith Residence" value={customer} onChange={e => setCustomer(e.target.value)} className="field-input" />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-label">Work Order #</label>
                  <input placeholder="e.g. WO-2026-041" value={woNumber} onChange={e => setWoNumber(e.target.value)} className="field-input" />
                </div>
              </div>

              {lines.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">📋</div>
                  <div className="empty-text">No items yet. Calculate a price above and add it to the quote.</div>
                </div>
              ) : (<>
                {lines.map((l, i) => (
                  <div key={l.id} className="quote-line">
                    <div className="quote-line-num">{i + 1}.</div>
                    <div className="quote-line-info">
                      <div style={{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
                        <span className="quote-line-name">{l.label}</span>
                        <span className={`badge ${typeBadge[l.type]}`}>{typeLabel[l.type]}</span>
                      </div>
                      <div className="quote-line-desc">{l.desc}</div>
                    </div>
                    <div className="quote-line-price">{fmt(l.price)}</div>
                    <button className="btn btn-danger btn-sm" onClick={() => setLines(prev => prev.filter(x => x.id !== l.id))}>✕</button>
                  </div>
                ))}

                <div className="quote-total">
                  <span className="quote-total-label">Total</span>
                  <span className="quote-total-price">{fmt(quoteTotal)}</span>
                </div>

                <div style={{display:"flex",gap:10,marginTop:14,flexWrap:"wrap"}}>
                  <button className="btn btn-primary" onClick={() => setShowPrint(!showPrint)}>
                    {showPrint ? "Hide Preview" : "🖨 Print / Export"}
                  </button>
                  <button className="btn btn-outline" onClick={() => {
                    const rows = [["#","Product","Description","Price"],
                      ...lines.map((l,i) => [i+1, l.label, l.desc, l.price.toFixed(2)]),
                      ["","","TOTAL", quoteTotal.toFixed(2)]];
                    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
                    const a = document.createElement("a");
                    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
                    a.download = `quote-${woNumber || "draft"}-${new Date().toISOString().slice(0,10)}.csv`;
                    a.click();
                  }}>⬇ Download CSV</button>
                </div>

                {showPrint && (
                  <div className="print-preview">
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div className="print-co">Montie Wayne Sheet Metal</div>
                        <div style={{fontSize:12,color:"var(--mut)",marginTop:2}}>Materials Estimate</div>
                      </div>
                      <div style={{textAlign:"right",fontSize:12,color:"var(--mut)"}}>
                        <div>{new Date().toLocaleDateString()}</div>
                        {woNumber && <div style={{fontWeight:700,color:"var(--txt)"}}>WO: {woNumber}</div>}
                      </div>
                    </div>
                    <div className="print-meta">
                      {customer && <div className="print-meta-item"><div className="print-meta-label">Customer / Job</div><div className="print-meta-val">{customer}</div></div>}
                      <div className="print-meta-item"><div className="print-meta-label">Items</div><div className="print-meta-val">{lines.length}</div></div>
                      <div className="print-meta-item"><div className="print-meta-label">Markup</div><div className="print-meta-val">+{markupPct}%</div></div>
                      <div className="print-meta-item"><div className="print-meta-label">Total</div><div className="print-meta-val" style={{color:"var(--or)"}}>{fmt(quoteTotal)}</div></div>
                    </div>
                    <table className="print-table">
                      <thead>
                        <tr><th>#</th><th>Product / Material</th><th>Description</th><th style={{textAlign:"right"}}>Price</th></tr>
                      </thead>
                      <tbody>
                        {lines.map((l,i) => (
                          <tr key={l.id}>
                            <td style={{color:"var(--mut)"}}>{i+1}</td>
                            <td>{l.label}</td>
                            <td style={{color:"var(--mut)"}}>{l.desc}</td>
                            <td style={{textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{fmt(l.price)}</td>
                          </tr>
                        ))}
                        <tr className="print-total-row">
                          <td colSpan={3} style={{textAlign:"right"}}>Total</td>
                          <td style={{textAlign:"right",color:"var(--or)"}}>{fmt(quoteTotal)}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="print-note">Materials estimate only. Final invoice issued through QuickBooks.</div>
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

          {/* Add metal */}
          <div className="card">
            <div className="card-hdr"><span className="card-title">Add Metal Type</span></div>
            <div className="card-body">
              <div className="grid-3">
                <div className="field">
                  <label className="field-label">Metal Name</label>
                  <input placeholder="e.g. Galvanized — 18 ga" value={newMetalName} onChange={e => setNewMetalName(e.target.value)} className="field-input" />
                </div>
                <div className="field">
                  <label className="field-label">Group</label>
                  <input placeholder="e.g. Galvanized" list="groups-list" value={newMetalGroup} onChange={e => setNewMetalGroup(e.target.value)} className="field-input" />
                  <datalist id="groups-list">{allGroups.map(g => <option key={g} value={g} />)}</datalist>
                </div>
                <div className="field">
                  <label className="field-label">Sheet Cost ($)</label>
                  <input type="number" min="0" step="0.01" placeholder="e.g. 77.00" value={newMetalCost} onChange={e => setNewMetalCost(e.target.value)} className="field-input" />
                  <div className="field-hint">48" × 96" sheet price</div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <button className="btn btn-primary" onClick={handleAddMetal} disabled={saving}>Add Metal</button>
                {metalMsg && <span style={{fontSize:12,color:metalMsg.startsWith("✓") ? "var(--green)" : "var(--red)"}}>{metalMsg}</span>}
              </div>
            </div>
          </div>

          {/* Add product type */}
          <div className="card">
            <div className="card-hdr"><span className="card-title">Product Types</span></div>
            <div className="card-body">
              <div style={{marginBottom:14}}>
                {productTypes.map(p => (
                  <span key={p.id} style={{display:"inline-block",background:"var(--surf2)",border:"1px solid var(--bdr)",borderRadius:20,padding:"3px 10px",fontSize:12,marginRight:6,marginBottom:6}}>
                    {p.name} <span style={{color:"var(--mut)",fontSize:10}}>({p.defaultMethod})</span>
                  </span>
                ))}
              </div>
              <div className="grid-2" style={{maxWidth:420}}>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-label">New Product Type</label>
                  <input placeholder="e.g. Reveal Bead" value={newPTName} onChange={e => setNewPTName(e.target.value)} className="field-input" />
                </div>
                <div className="field" style={{marginBottom:0}}>
                  <label className="field-label">Default Method</label>
                  <select value={newPTMethod} onChange={e => setNewPTMethod(e.target.value)} className="field-input">
                    <option value="linear">Linear Feet</option>
                    <option value="piece">Per Piece</option>
                  </select>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
                <button className="btn btn-primary" onClick={handleAddProductType}>Add Product Type</button>
                {ptMsg && <span style={{fontSize:12,color:ptMsg.startsWith("✓") ? "var(--green)" : "var(--red)"}}>{ptMsg}</span>}
              </div>
            </div>
          </div>

          {/* Metal list */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">Metal List — {metals.length} types</span>
              <span style={{fontSize:11,color:"var(--mut)"}}>🔴 = price older than 30 days</span>
            </div>
            <div className="card-body">
              {metals.length === 0 ? (
                <div className="empty"><div className="empty-text">No metals found. Check your Google Sheet connection.</div></div>
              ) : allGroups.map(g => (
                <div key={g}>
                  <div className="group-label">{g}</div>
                  {metals.filter(m => m.group === g).map(m => (
                    <div key={m.id} className="metal-row">
                      <div className="metal-row-name">{m.name}</div>
                      <DatePill date={m.dateUpdated} />
                      {editMetalId === String(m.id) ? (<>
                        <input type="number" step="0.01" value={editMetalCost}
                          onChange={e => setEditMetalCost(e.target.value)}
                          className="field-input" style={{width:110,padding:"5px 8px",fontSize:12}} />
                        <span style={{fontSize:10,color:"var(--mut)"}}>sheet $</span>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateMetal(m.id)} disabled={saving}>Save</button>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditMetalId(null)}>✕</button>
                      </>) : (<>
                        <div className="metal-row-price">${Number(m.sheetCost).toFixed(2)}/sheet</div>
                        <button className="btn btn-outline btn-sm" onClick={() => { setEditMetalId(String(m.id)); setEditMetalCost(Number(m.sheetCost).toFixed(2)); }}>
                          Update Price
                        </button>
                      </>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>)}
      </div>
    </div>
  );
}
