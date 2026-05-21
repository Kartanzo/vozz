// ============================================================
// 3LACKD CRM — Icons + shared UI primitives
// ============================================================

// Lightweight inline SVG icons (1.5 stroke, currentColor)
const Icon = ({ name, size = 16, className = "ico" }) => {
 const paths = {
 home: <><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></>,
 pipeline: <><rect x="3" y="5" width="4" height="14" rx="1"/><rect x="10" y="5" width="4" height="10" rx="1"/><rect x="17" y="5" width="4" height="7" rx="1"/></>,
 users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 19c0-3 3-5 6-5s6 2 6 5"/><path d="M15 19c0-2 1.5-3.5 4-3.5s3 1 3 2.5"/></>,
 user: <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></>,
 calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
 chart: <><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 15l3-4 3 3 5-7"/></>,
 settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-1.11-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.04H3a2 2 0 1 1 0-4h.08A1.7 1.7 0 0 0 4.6 8.94 1.7 1.7 0 0 0 4.27 7.07L4.2 7a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10.04 3.04V3a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.56 1.04H21a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-1.52 1.06z"/></>,
 search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
 plus: <><path d="M12 5v14M5 12h14"/></>,
 filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
 sort: <><path d="M7 4v16M3 8l4-4 4 4M17 4v16M13 16l4 4 4-4"/></>,
 bell: <><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></>,
 inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5l-3 7v6a2 2 0 0 0 2 2h15a2 2 0 0 0 2-2v-6l-3-7a2 2 0 0 0-1.8-1H7.3a2 2 0 0 0-1.8 1z"/></>,
 arrow_up: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
 arrow_down: <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
 arrow_right: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
 arrow_left: <><path d="M19 12H5M11 5l-7 7 7 7"/></>,
 phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.91.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></>,
 mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
 message: <><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 8.5 8.5 0 0 1-4-1L3 21l2-5a8.5 8.5 0 0 1 7-13 8.38 8.38 0 0 1 9 8.5z"/></>,
 check: <><path d="M5 13l4 4L19 7"/></>,
 x: <><path d="M18 6L6 18M6 6l12 12"/></>,
 more: <><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></>,
 target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
 trend: <><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></>,
 file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></>,
 map: <><path d="m3 6 6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v16M15 6v16"/></>,
 flag: <><path d="M4 21V4M4 4h14l-2 4 2 4H4"/></>,
 bolt: <><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></>,
 pause: <><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>,
 money: <><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 10v4M18 10v4"/></>,
 layers: <><path d="m12 2 10 6-10 6L2 8z"/><path d="m2 14 10 6 10-6"/></>,
 handshake:<><path d="M11 13l3-3 4 4 3-3"/><path d="m3 14 4-4 3 3"/><path d="M13 11l-2 2-3-3"/></>,
 clipboard:<><rect x="6" y="4" width="12" height="18" rx="2"/><path d="M9 4h6a1 1 0 0 1 1 1v2H8V5a1 1 0 0 1 1-1z"/></>,
 star: <><path d="m12 2 3.1 6.5 7 1-5 5 1.2 7L12 18l-6.3 3.5L7 14.5 2 9.5l7-1z"/></>,
 award: <><circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/></>,
 clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
 document: <><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></>,
 sparkles: <><path d="M12 3v6M12 15v6M3 12h6M15 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M5 19l4-4"/></>,
 globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>,
 sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
 moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
 image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
 };
 return (
 <svg className={className} width={size} height={size} viewBox="0 0 24 24"
 fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
 {paths[name] || <circle cx="12" cy="12" r="3"/>}
 </svg>
 );
};

// Brand mark — the cluster of dots from the 3lackd logo
const BlackdMark = ({ size = 24 }) => (
 <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
 <defs>
 <linearGradient id="vg" x1="0" x2="1" y1="0" y2="1">
 <stop offset="0%" stopColor="#2EBFC5"/>
 <stop offset="55%" stopColor="#4A8BC8"/>
 <stop offset="100%" stopColor="#3F5BA8"/>
 </linearGradient>
 </defs>
 <circle cx="16" cy="6" r="3" fill="url(#vg)"/>
 <circle cx="9" cy="13" r="2.4" fill="url(#vg)"/>
 <circle cx="23" cy="13" r="2.4" fill="url(#vg)"/>
 <circle cx="6" cy="22" r="2" fill="url(#vg)"/>
 <circle cx="16" cy="20" r="2.6" fill="url(#vg)"/>
 <circle cx="26" cy="22" r="2" fill="url(#vg)"/>
 <path d="M9 13 16 6 23 13 M6 22 16 20 26 22 M9 13 16 20 23 13" stroke="url(#vg)" strokeWidth="0.9" strokeLinecap="round" opacity="0.55"/>
 </svg>
);

// Avatar (text-based, by user id)
const Avatar = ({ user, size = 24 }) => {
 if (!user) return null;
 return (
 <div className="av" style={{
 width: size, height: size, borderRadius: "50%",
 background: user.color, color: "white",
 display: "grid", placeItems: "center",
 fontWeight: 700, fontSize: Math.max(9, size * 0.42),
 flexShrink: 0,
 }}>{user.initials}</div>
 );
};

const AvatarStack = ({ users, size = 22, max = 4 }) => (
 <div className="avstack">
 {users.slice(0, max).map(u => (
 <div key={u.id} className="av" style={{
 width: size, height: size, background: u.color
 }}>{u.initials}</div>
 ))}
 {users.length > max && (
 <div className="av" style={{
 width: size, height: size, background: "var(--surface-3)", color: "var(--text-2)"
 }}>+{users.length - max}</div>
 )}
 </div>
);

// Currency formatter (Brazilian)
const fmtBRL = (v, opts = {}) => {
 const abbr = opts.abbr ?? false;
 if (abbr) {
 if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
 if (v >= 1_000) return `R$ ${(v / 1000).toFixed(0)}k`;
 return `R$ ${v}`;
 }
 return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const fmtN = (v) => v.toLocaleString("pt-BR");

// Sparkline component
const Sparkline = ({ values, w = 90, h = 32, color = "#2EBFC5" }) => {
 const min = Math.min(...values);
 const max = Math.max(...values);
 const range = max - min || 1;
 const pts = values.map((v, i) => {
 const x = (i / (values.length - 1)) * w;
 const y = h - ((v - min) / range) * h;
 return [x, y];
 });
 const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
 const dArea = `${d} L${w} ${h} L0 ${h} Z`;
 const id = "sg" + Math.random().toString(36).slice(2, 7);
 return (
 <svg className="spark-svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
 <defs>
 <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
 <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
 <stop offset="100%" stopColor={color} stopOpacity="0"/>
 </linearGradient>
 </defs>
 <path d={dArea} fill={`url(#${id})`}/>
 <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
 </svg>
 );
};

// Bar / line chart for revenue
const RevenueChart = ({ series, w = 720, h = 240 }) => {
 const pad = { l: 36, r: 12, t: 16, b: 28 };
 const W = w - pad.l - pad.r;
 const H = h - pad.t - pad.b;
 const all = series.flatMap(d => [d.actual, d.forecast].filter(v => v != null));
 const max = Math.ceil(Math.max(...all) + 1);
 const xStep = W / (series.length - 1);
 const yFor = v => pad.t + H - (v / max) * H;

 const actualPts = series.filter(d => d.actual != null).map((d, i) => [pad.l + i * xStep, yFor(d.actual)]);
 const startForecastIdx = series.findIndex(d => d.forecast != null);
 const forecastPts = series.map((d, i) => d.forecast != null ? [pad.l + i * xStep, yFor(d.forecast)] : null).filter(Boolean);
 // Connect last actual to first forecast
 if (startForecastIdx > 0) {
 const lastActual = series[startForecastIdx - 1];
 forecastPts.unshift([pad.l + (startForecastIdx - 1) * xStep, yFor(lastActual.actual)]);
 }

 const lineD = (pts) => pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
 const areaD = (pts) => `${lineD(pts)} L${pts[pts.length - 1][0]} ${pad.t + H} L${pts[0][0]} ${pad.t + H} Z`;

 // y-axis ticks
 const ticks = [0, max * 0.5, max].map(v => ({ v, y: yFor(v) }));

 return (
 <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
 <defs>
 <linearGradient id="rev-grad" x1="0" x2="0" y1="0" y2="1">
 <stop offset="0%" stopColor="#2EBFC5" stopOpacity="0.35"/>
 <stop offset="100%" stopColor="#2EBFC5" stopOpacity="0"/>
 </linearGradient>
 <linearGradient id="rev-line" x1="0" x2="1">
 <stop offset="0%" stopColor="#2EBFC5"/>
 <stop offset="100%" stopColor="#3F5BA8"/>
 </linearGradient>
 </defs>
 {/* grid */}
 {ticks.map((t, i) => (
 <g key={i}>
 <line x1={pad.l} x2={w - pad.r} y1={t.y} y2={t.y} stroke="var(--border)" strokeDasharray="2 4"/>
 <text x={pad.l - 8} y={t.y + 4} fontSize="10" fill="var(--text-3)" textAnchor="end">{t.v.toFixed(1)}M</text>
 </g>
 ))}
 {/* actual area + line */}
 <path d={areaD(actualPts)} fill="url(#rev-grad)"/>
 <path d={lineD(actualPts)} stroke="url(#rev-line)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
 {/* forecast dashed line */}
 <path d={lineD(forecastPts)} stroke="#3F5BA8" strokeWidth="2" fill="none" strokeDasharray="4 4" strokeLinecap="round" opacity="0.7"/>
 {/* points */}
 {actualPts.map((p, i) => (
 <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#2EBFC5" stroke="var(--surface)" strokeWidth="2"/>
 ))}
 {forecastPts.slice(1).map((p, i) => (
 <circle key={"f" + i} cx={p[0]} cy={p[1]} r="3" fill="var(--surface)" stroke="#3F5BA8" strokeWidth="2"/>
 ))}
 {/* x labels */}
 {series.map((d, i) => (
 <text key={i} x={pad.l + i * xStep} y={h - 8} fontSize="10.5" fill="var(--text-3)" textAnchor="middle">{d.m}</text>
 ))}
 </svg>
 );
};

// Horizontal bar (for segment perf)
const HBar = ({ value, max, color = "var(--brand-grad)" }) => (
 <div style={{
 height: 8, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden", flex: 1, minWidth: 60
 }}>
 <div style={{
 height: "100%", width: `${(value / max) * 100}%`, background: color, borderRadius: 99
 }}/>
 </div>
);

// Conversion funnel viz
const Funnel = ({ data, t }) => {
 const max = Math.max(...data.map(d => d.value));
 return (
 <div>
 {data.map((s, i) => {
 const stage = STAGES.find(st => st.id === s.stage) || STAGES[0];
 return (
 <div key={s.stage} className="funnel-stage">
 <div className="label">
 <span className={"badge"} style={{
 background: "transparent", padding: 0, color: stage.color, fontWeight: 700
 }}>
 <span className={"dot " + stage.dotClass}/>
 {t.stages[s.stage]}
 </span>
 </div>
 <div className="funnel-bar" style={{ width: `${(s.value / max) * 100}%` }}/>
 <div className="value">{s.count}</div>
 <div className="pct">R$ {s.value.toFixed(1)}M</div>
 </div>
 );
 })}
 </div>
 );
};

// BR map (very stylized)
const BrazilMap = ({ pins, t }) => (
 <div className="map-wrap">
 <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
 style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
 <defs>
 <linearGradient id="mg" x1="0" x2="1" y1="0" y2="1">
 <stop offset="0%" stopColor="rgba(46,191,197,0.15)"/>
 <stop offset="100%" stopColor="rgba(63,91,168,0.18)"/>
 </linearGradient>
 </defs>
 {/* Very simplified Brazil silhouette */}
 <path d="
 M 38 18
 Q 50 14, 62 18
 Q 74 22, 78 32
 Q 82 42, 76 50
 Q 78 60, 70 65
 Q 66 72, 60 70
 Q 58 80, 50 82
 Q 42 86, 38 80
 Q 30 78, 28 70
 Q 22 62, 26 54
 Q 24 44, 30 38
 Q 28 28, 38 18 Z
 " fill="url(#mg)" stroke="var(--border-strong)" strokeWidth="0.4"/>
 </svg>
 {pins.map(p => (
 <div key={p.region} className="map-pin" style={{
 left: `${p.x}%`, top: `${p.y}%`
 }} title={`${p.region}: ${p.accounts} contas`}/>
 ))}
 {pins.map(p => (
 <div key={p.region + "l"} style={{
 position: "absolute",
 left: `${p.x + 3}%`, top: `${p.y - 1}%`,
 fontSize: 11, fontWeight: 700,
 color: "var(--text-2)",
 textShadow: "0 0 6px var(--surface)",
 pointerEvents: "none",
 }}>{p.region}<br/>
 <span style={{ fontWeight: 500, color: "var(--text-3)" }}>{p.accounts} contas · R$ {p.revenue}M</span>
 </div>
 ))}
 </div>
);

// ============================================================
// Sistema de diálogos customizados (substitui alert/prompt/confirm)
// API: blackdAlert(msg) · blackdConfirm(msg) · blackdPrompt(msg, default)
// Todas retornam Promise.
// ============================================================
const _dialogListeners = [];
window.blackdDialog = (opts) => new Promise(resolve => {
 if (!_dialogListeners.length) { resolve(opts.type === "confirm" ? false : opts.type === "prompt" ? null : undefined); return; }
 _dialogListeners.forEach(fn => fn({ ...opts, resolve }));
});
window.blackdAlert = (message, title) => window.blackdDialog({ type: "alert", title: title || "Aviso", message });
window.blackdConfirm = (message, title) => window.blackdDialog({ type: "confirm", title: title || "Confirmar", message });
window.blackdPrompt = (message, defaultValue, title) => window.blackdDialog({ type: "prompt", title: title || "Entrada", message, defaultValue: defaultValue || "" });

const DialogHost = () => {
 const [d, setD] = React.useState(null);
 const [inp, setInp] = React.useState("");
 const inputRef = React.useRef(null);

 React.useEffect(() => {
 const fn = (opts) => { setD(opts); setInp(opts.defaultValue || ""); };
 _dialogListeners.push(fn);
 return () => { const i = _dialogListeners.indexOf(fn); if (i >= 0) _dialogListeners.splice(i, 1); };
 }, []);

 React.useEffect(() => {
 if (d && d.type === "prompt" && inputRef.current) {
 setTimeout(() => inputRef.current?.focus(), 50);
 }
 }, [d]);

 if (!d) return null;

 const close = (val) => { const r = d.resolve; setD(null); r(val); };
 const onKey = (e) => {
 if (e.key === "Escape") close(d.type === "confirm" ? false : d.type === "prompt" ? null : undefined);
 if (e.key === "Enter" && d.type === "prompt") close(inp);
 if (e.key === "Enter" && d.type === "alert") close();
 };

 const icon = d.type === "alert" ? "ℹ️" : d.type === "confirm" ? "️" : "️";
 const color = d.type === "alert" ? "#3F5BA8" : d.type === "confirm" ? "#D88514" : "#2EBFC5";

 return (
 <div onKeyDown={onKey} tabIndex={-1}
 onClick={() => close(d.type === "confirm" ? false : d.type === "prompt" ? null : undefined)}
 style={{
 position: "fixed", inset: 0, background: "rgba(15,15,30,.55)",
 backdropFilter: "blur(4px)", zIndex: 200,
 display: "grid", placeItems: "center", padding: 20,
 animation: "fadeIn .15s ease",
 }}>
 <div onClick={e => e.stopPropagation()} className="card"
 style={{
 width: "min(440px, 95vw)", padding: 0, overflow: "hidden",
 boxShadow: "0 24px 64px rgba(0,0,0,.4)",
 borderTop: `4px solid ${color}`,
 animation: "popIn .2s ease",
 }}>
 <div style={{ padding: "18px 22px 6px", display: "flex", alignItems: "center", gap: 12 }}>
 <div style={{ fontSize: 26 }}>{icon}</div>
 <div style={{ fontWeight: 800, fontSize: 16 }}>{d.title}</div>
 </div>
 <div style={{ padding: "8px 22px 18px" }}>
 <div className="text-2" style={{ fontSize: 13.5, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{d.message}</div>
 {d.type === "prompt" && (
 <input ref={inputRef} className="input" style={{ marginTop: 14, width: "100%" }}
 value={inp} onChange={e => setInp(e.target.value)}
 placeholder="Digite aqui..."/>
 )}
 </div>
 <div style={{
 padding: "12px 22px", background: "var(--surface-2)",
 display: "flex", gap: 8, justifyContent: "flex-end",
 borderTop: "1px solid var(--border)",
 }}>
 {d.type !== "alert" && (
 <button className="btn btn-sm"
 onClick={() => close(d.type === "confirm" ? false : null)}>
 Cancelar
 </button>
 )}
 <button className="btn btn-sm btn-primary"
 onClick={() => close(d.type === "confirm" ? true : d.type === "prompt" ? inp : undefined)}>
 {d.type === "alert" ? "OK" : d.type === "confirm" ? "Confirmar" : "OK"}
 </button>
 </div>
 </div>
 <style>{`
 @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
 @keyframes popIn { from { opacity: 0; transform: scale(.94) } to { opacity: 1; transform: scale(1) } }
 `}</style>
 </div>
 );
};

Object.assign(window, {
 Icon, BlackdMark, Avatar, AvatarStack, DialogHost,
 fmtBRL, fmtN, Sparkline, RevenueChart, HBar, Funnel, BrazilMap
});
