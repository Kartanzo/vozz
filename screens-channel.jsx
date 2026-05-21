// ============================================================
// 3LACKD CRM — Canal Misto · Interno × Representante Externo
// Gestão do conflito clássico de indústria: split de comissão,
// proteção de território, deal registration.
// ============================================================

const _ch = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

// Representantes externos fictícios
const EXTERNAL_REPS = [
 { id: "ext1", name: "Rep. Sulina Ltda", region: "Sul", deals: 12, commission: 4.5 },
 { id: "ext2", name: "Comercial Bandeirante", region: "Sudeste", deals: 18, commission: 5.0 },
 { id: "ext3", name: "Nordeste Vendas", region: "Nordeste", deals: 8, commission: 5.5 },
 { id: "ext4", name: "Cerrado Reps", region: "Centro-O.", deals: 4, commission: 5.0 },
];

const CANAIS = [
 { id: "interno", label: " Interno", cor: "#3F5BA8" },
 { id: "externo", label: " Representante", cor: "#D88514" },
 { id: "misto", label: "️ Misto (split)", cor: "#7B5BC8" },
];

const Channel = ({ t, lang }) => {
 // Atribui canal a cada conta deterministicamente
 const dataset = React.useMemo(() => ACCOUNTS.map((a, idx) => {
 const h = _ch(a.id);
 const canalId = idx % 5 === 0 ? "misto" : idx % 3 === 0 ? "externo" : "interno";
 const repExt = EXTERNAL_REPS[(h) % EXTERNAL_REPS.length];
 const splitInt = canalId === "misto" ? 30 + (h % 40) : canalId === "interno" ? 100 : 0;
 const conflito = idx % 7 === 0 && canalId !== "interno"; // ~14% têm conflito
 return {
 ...a,
 canal: canalId,
 repExterno: canalId === "interno" ? null : repExt,
 splitInterno: splitInt,
 splitExterno: 100 - splitInt,
 pedidos12m: 4 + (h % 30),
 conflito,
 };
 }), []);

 const [filtroCanal, setFiltroCanal] = React.useState("all");
 const [showConflitos, setShowConflitos] = React.useState(false);

 const visible = dataset.filter(d => {
 if (filtroCanal !== "all" && d.canal !== filtroCanal) return false;
 if (showConflitos && !d.conflito) return false;
 return true;
 });

 const stats = {
 total: dataset.length,
 interno: dataset.filter(d => d.canal === "interno").length,
 externo: dataset.filter(d => d.canal === "externo").length,
 misto: dataset.filter(d => d.canal === "misto").length,
 conflitos: dataset.filter(d => d.conflito).length,
 };

 // Performance por representante externo
 const repPerf = EXTERNAL_REPS.map(r => {
 const contas = dataset.filter(d => d.repExterno?.id === r.id);
 const ativas = contas.filter(c => !c.inactive).length;
 const churnRate = contas.length ? ((contas.length - ativas) / contas.length) * 100 : 0;
 return { ...r, contas: contas.length, ativas, churnRate };
 });

 return (
 <div>
 <div className="section-title">
 <div>
 <h2>Canal Misto · Interno × Representante</h2>
 <div className="sub">Gestão do clássico conflito da indústria: territórios, splits de comissão e deal registration.</div>
 </div>
 </div>

 {/* KPIs por canal */}
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
 <CanalCard label="Total de contas" value={stats.total} cor="#2EBFC5" icon=""/>
 <CanalCard label="Canal Interno" value={stats.interno} sub={`${((stats.interno/stats.total)*100).toFixed(0)}%`} cor="#3F5BA8" icon=""
 active={filtroCanal === "interno"} onClick={() => setFiltroCanal(filtroCanal === "interno" ? "all" : "interno")}/>
 <CanalCard label="Representantes" value={stats.externo} sub={`${EXTERNAL_REPS.length} reps`} cor="#D88514" icon=""
 active={filtroCanal === "externo"} onClick={() => setFiltroCanal(filtroCanal === "externo" ? "all" : "externo")}/>
 <CanalCard label="Misto (split)" value={stats.misto} sub="Comissão dividida" cor="#7B5BC8" icon="️"
 active={filtroCanal === "misto"} onClick={() => setFiltroCanal(filtroCanal === "misto" ? "all" : "misto")}/>
 <CanalCard label=" Conflitos abertos" value={stats.conflitos} sub="Atenção urgente" cor="#D63B5C" icon=""
 active={showConflitos} onClick={() => setShowConflitos(!showConflitos)}/>
 </div>

 {(filtroCanal !== "all" || showConflitos) && (
 <button className="btn btn-sm mb-3" onClick={() => { setFiltroCanal("all"); setShowConflitos(false); }}>
 <Icon name="x" size={12}/> Limpar filtros
 </button>
 )}

 <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, alignItems: "start" }}>
 {/* Tabela de contas com canal */}
 <div className="card" style={{ padding: 0 }}>
 <div className="card-header">
 <Icon name="users" size={14}/>
 <div className="card-title">Contas por canal ({visible.length})</div>
 </div>
 <table className="table">
 <thead>
 <tr>
 <th>Cliente</th>
 <th>Região</th>
 <th>Canal</th>
 <th>Split comissão</th>
 <th>Pedidos 12m</th>
 <th></th>
 </tr>
 </thead>
 <tbody>
 {visible.map(d => {
 const c = CANAIS.find(x => x.id === d.canal);
 return (
 <tr key={d.id} style={d.conflito ? { background: "#D63B5C11" } : {}}>
 <td>
 <div style={{ fontWeight: 600 }}>
 {d.name} {d.conflito && <span style={{ marginLeft: 6 }} title="Conflito de território detectado"></span>}
 </div>
 <div className="text-3" style={{ fontSize: 11 }}>{d.city}</div>
 </td>
 <td className="text-2">{d.region}</td>
 <td>
 <span className="badge" style={{ background: c.cor + "22", color: c.cor, fontWeight: 600 }}>{c.label}</span>
 {d.repExterno && <div className="text-3" style={{ fontSize: 11, marginTop: 3 }}>{d.repExterno.name}</div>}
 </td>
 <td style={{ width: 180 }}>
 {d.canal === "interno" ? (
 <span className="text-3">100% interno</span>
 ) : d.canal === "externo" ? (
 <span className="text-3">100% representante</span>
 ) : (
 <>
 <div style={{ display: "flex", height: 10, borderRadius: 4, overflow: "hidden", background: "var(--surface-2)" }}>
 <div style={{ width: d.splitInterno + "%", background: "#3F5BA8" }} title={`Interno: ${d.splitInterno}%`}/>
 <div style={{ width: d.splitExterno + "%", background: "#D88514" }} title={`Rep: ${d.splitExterno}%`}/>
 </div>
 <div className="text-3" style={{ fontSize: 10.5, marginTop: 3 }}>
 <span style={{ color: "#3F5BA8" }}>● {d.splitInterno}% int.</span> · <span style={{ color: "#D88514" }}>● {d.splitExterno}% rep.</span>
 </div>
 </>
 )}
 </td>
 <td>{d.pedidos12m}</td>
 <td>
 {d.conflito && (
 <button className="btn btn-sm" onClick={() => blackdAlert(`Disputa: canal interno e ${d.repExterno?.name} reivindicam essa conta.\n\nAção: aplicar regra de deal registration — quem cadastrou primeiro fica com a comissão integral por 90 dias.`, `️ Mediação · ${d.name}`)}>
 ️ Mediar
 </button>
 )}
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Performance por rep externo */}
 <div className="col gap-3">
 <div className="card" style={{ padding: 0 }}>
 <div className="card-header">
 <Icon name="award" size={14}/>
 <div className="card-title">Representantes externos</div>
 </div>
 <div style={{ padding: 6 }}>
 {repPerf.sort((a, b) => b.contas - a.contas).map(r => (
 <div key={r.id} className="card" style={{ padding: 12, marginBottom: 8, borderLeft: "3px solid #D88514" }}>
 <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
 <div>
 <div style={{ fontWeight: 700, fontSize: 13 }}>{r.name}</div>
 <div className="text-3" style={{ fontSize: 11 }}>{r.region} · {r.commission}% comissão</div>
 </div>
 <div style={{ textAlign: "right" }}>
 <div style={{ fontWeight: 800, fontSize: 18 }}>{r.contas}</div>
 <div className="text-3" style={{ fontSize: 10 }}>contas</div>
 </div>
 </div>
 <div className="row gap-2 mt-2" style={{ fontSize: 11.5 }}>
 <span className="badge badge-success">{r.ativas} ativas</span>
 {r.churnRate > 0 && <span className="badge badge-danger">{r.churnRate.toFixed(0)}% churn</span>}
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="card" style={{ padding: 14, background: "var(--brand-grad-soft)", borderColor: "transparent" }}>
 <div className="row gap-2 mb-2"><Icon name="sparkles" size={14}/><b style={{ fontSize: 13 }}>Regra 3lackd de Deal Registration</b></div>
 <div className="text-2" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
 Quem <b>cadastra primeiro</b> a oportunidade no CRM fica com a comissão integral
 por <b>90 dias</b>. Após isso, se o deal não fechar, abre para todos os canais.
 Conflitos vão para mediação automática do gerente comercial.
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

const CanalCard = ({ label, value, sub, cor, icon, active, onClick }) => (
 <div className="card" onClick={onClick}
 style={{
 padding: 14, borderLeft: `4px solid ${cor}`,
 cursor: onClick ? "pointer" : "default",
 background: active ? cor + "15" : undefined,
 outline: active ? `2px solid ${cor}` : "none",
 transition: "all .15s",
 }}>
 <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
 <div>
 <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
 {label} {active && <span style={{ color: cor }}></span>}
 </div>
 <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{value}</div>
 {sub && <div className="text-3" style={{ fontSize: 11 }}>{sub}</div>}
 </div>
 <div style={{ fontSize: 22 }}>{icon}</div>
 </div>
 </div>
);

Object.assign(window, { Channel });
