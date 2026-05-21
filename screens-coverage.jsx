// ============================================================
// 3LACKD CRM — Coverage / Abrangência (world map)
// ============================================================

const Coverage = ({ t, lang }) => {
 const [repFilter, setRepFilter] = React.useState("all");
 const [segFilter, setSegFilter] = React.useState("all");
 const [statusFilter, setStatusFilter] = React.useState(new Set(["customer", "lead", "prospect", "inactive"]));
 const [showHeat, setShowHeat] = React.useState(true);
 const [selectedPin, setSelectedPin] = React.useState(null);

 const filteredPins = GLOBAL_PINS.filter(p => {
 if (repFilter !== "all" && p.rep !== repFilter) return false;
 if (segFilter !== "all" && p.segment !== segFilter) return false;
 if (!statusFilter.has(p.status)) return false;
 return true;
 });

 const stats = {
 customer: filteredPins.filter(p => p.status === "customer").length,
 lead: filteredPins.filter(p => p.status === "lead").length,
 prospect: filteredPins.filter(p => p.status === "prospect").length,
 inactive: filteredPins.filter(p => p.status === "inactive").length,
 };

 const toggleStatus = (s) => {
 const n = new Set(statusFilter);
 n.has(s) ? n.delete(s) : n.add(s);
 setStatusFilter(n);
 };

 const insights = [
 { title: "Cone Sul aquecendo", desc: "Buenos Aires e Asunción com leads ativos. Vale priorizar visita técnica este trimestre.", tag: "Oportunidade", color: "warning" },
 { title: "Norte do Brasil esfriando", desc: "Manaus inativa há 35d. Cobertura pode ser realocada para o Nordeste, que está em crescimento.", tag: "Atenção", color: "danger" },
 { title: "Sudeste segue dominante", desc: "Concentra 41% do faturamento. Considere abrir filial dedicada em Campinas.", tag: "Crescimento", color: "success" },
 ];

 return (
 <div>
 <div className="section-title">
 <div>
 <h2>{t.coverage}</h2>
 <div className="sub">Mapa de calor de canais e oportunidades — clique nos pins para detalhes</div>
 </div>
 <div className="row gap-2">
 <div className="toggle-group">
 <button aria-current={showHeat} onClick={() => setShowHeat(true)}>Heat</button>
 <button aria-current={!showHeat} onClick={() => setShowHeat(false)}>Pins</button>
 </div>
 <button className="btn btn-sm" onClick={() => {
 const csv = "city,status,segment,rep,value\n" + GLOBAL_PINS.map(p => `${p.city},${p.status},${p.segment},${p.rep},${p.value}`).join("\n");
 const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a"); a.href = url; a.download = "3lackd_abrangencia.csv"; a.click();
 URL.revokeObjectURL(url);
 }}><Icon name="export" size={13}/> Exportar mapa</button>
 </div>
 </div>

 <div className="filters" style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border)", marginBottom: 14 }}>
 <span className="text-3" style={{ fontSize: 12, fontWeight: 600 }}>Filtrar por:</span>
 <select className="input" style={{ width: 170, height: 30 }}
 value={repFilter} onChange={e => setRepFilter(e.target.value)}>
 <option value="all">Todos vendedores</option>
 {REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
 </select>
 <select className="input" style={{ width: 170, height: 30 }}
 value={segFilter} onChange={e => setSegFilter(e.target.value)}>
 <option value="all">Todos os setores</option>
 {INDUSTRIES.map(i => <option key={i.id} value={i.id}>{i[lang]}</option>)}
 </select>
 <div className="row gap-2" style={{ marginLeft: 8 }}>
 <StatusChip active={statusFilter.has("customer")} onClick={() => toggleStatus("customer")} color="#16A07C" label={`Clientes (${stats.customer})`}/>
 <StatusChip active={statusFilter.has("lead")} onClick={() => toggleStatus("lead")} color="#3F5BA8" label={`Leads (${stats.lead})`}/>
 <StatusChip active={statusFilter.has("prospect")} onClick={() => toggleStatus("prospect")} color="#8A8899" label={`Prospects (${stats.prospect})`}/>
 <StatusChip active={statusFilter.has("inactive")} onClick={() => toggleStatus("inactive")} color="#D63B5C" label={`Inativos (${stats.inactive})`}/>
 </div>
 <div style={{ marginLeft: "auto" }} className="heat-legend">
 <span className="item"><span className="sw hot"/> Quente</span>
 <span className="item"><span className="sw warm"/> Morna</span>
 <span className="item"><span className="sw cold"/> Fria</span>
 </div>
 </div>

 <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 16, alignItems: "start" }}>
 <div className="card" style={{ padding: 18 }}>
 <WorldMap pins={filteredPins} heat={HEAT_REGIONS} showHeat={showHeat}
 onPinClick={setSelectedPin} height={560}/>
 </div>

 <div className="col gap-3">
 {selectedPin ? (
 <PinDetail pin={selectedPin} onClose={() => setSelectedPin(null)}/>
 ) : (
 <div className="card">
 <div className="card-header">
 <div className="card-title">Insights de abrangência</div>
 </div>
 <div style={{ padding: "4px 0" }}>
 {insights.map((ins, i) => (
 <div key={i} className="feed-item" style={{ alignItems: "flex-start" }}>
 <div className="feed-icon brand"><Icon name="sparkles" size={14}/></div>
 <div className="flex-1">
 <div className="row gap-2 mb-2">
 <span style={{ fontWeight: 700, fontSize: 13 }}>{ins.title}</span>
 <span className={"badge badge-" + ins.color}>{ins.tag}</span>
 </div>
 <div className="text-2" style={{ fontSize: 12.5 }}>{ins.desc}</div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 <div className="card">
 <div className="card-header">
 <div className="card-title">Top regiões</div>
 </div>
 <div>
 {HEAT_REGIONS.slice().sort((a,b) => b.revenue - a.revenue).slice(0, 6).map(r => (
 <div key={r.id} className="feed-item" style={{ padding: "10px 16px" }}>
 <span className="dot" style={{
 width: 10, height: 10, borderRadius: 99,
 background: r.heat === "hot" ? "#D63B5C" : r.heat === "warm" ? "#D88514" : "#4A8BC8"
 }}/>
 <div className="flex-1">
 <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
 <div className="text-3" style={{ fontSize: 11.5 }}>
 {r.customers} clientes · {r.leads} leads · {r.prospects} prospects
 </div>
 </div>
 <div style={{ fontSize: 13, fontWeight: 700 }}>R$ {r.revenue}M</div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};

const StatusChip = ({ active, onClick, color, label }) => (
 <button
 onClick={onClick}
 className="filter-chip"
 style={{
 background: active ? "var(--surface)" : "transparent",
 borderStyle: "solid",
 borderColor: active ? color : "var(--border)",
 color: active ? "var(--text)" : "var(--text-3)",
 fontWeight: 600,
 }}>
 <span style={{ width: 8, height: 8, borderRadius: 99, background: color, display: "inline-block" }}/>
 {label}
 </button>
);

const PinDetail = ({ pin, onClose }) => {
 const seg = INDUSTRIES.find(i => i.id === pin.segment);
 const rep = REPS.find(r => r.id === pin.rep);
 return (
 <div className="card">
 <div className="card-header">
 <div className="card-title">{pin.city}</div>
 <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={onClose}>
 <Icon name="x" size={14}/>
 </button>
 </div>
 <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
 <div className="row gap-2">
 <span className={"badge " + (
 pin.status === "customer" ? "badge-success" :
 pin.status === "lead" ? "badge-info" :
 pin.status === "inactive" ? "badge-danger" : ""
 )}>
 <span className="dot"/>
 {pin.status === "customer" ? "Cliente ativo"
 : pin.status === "lead" ? "Lead qualificado"
 : pin.status === "inactive" ? "Inativo" : "Prospect"}
 </span>
 <span className="badge badge-brand">{seg.pt}</span>
 </div>
 <div className="col gap-2 mt-2" style={{ fontSize: 13 }}>
 <KeyValue k="Responsável" v={<span className="row gap-2"><Avatar user={rep} size={18}/>{rep.name}</span>}/>
 {pin.value > 0 && <KeyValue k="Pipeline" v={`R$ ${pin.value}k`}/>}
 </div>
 <div className="row gap-2 mt-2">
 <button className="btn btn-sm btn-primary flex-1"
 onClick={() => blackdAlert(`Responsável: ${rep.name}\nStatus: ${pin.status}\nSegmento: ${seg?.pt || "—"}`, `Contatar · ${pin.city}`)}>
 <Icon name="message" size={13}/> Contatar
 </button>
 <button className="btn btn-sm"
 onClick={() => window.open(`https://www.google.com/maps?q=${pin.lat},${pin.lng}`, "_blank")}>
 <Icon name="open_record" size={13}/> Abrir
 </button>
 </div>
 </div>
 </div>
 );
};

Object.assign(window, { Coverage });
