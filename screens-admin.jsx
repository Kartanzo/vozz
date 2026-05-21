// ============================================================
// 3LACKD CRM — Reports, Team, Settings
// ============================================================

const Reports = ({ t, lang }) => {
 const [period, setPeriod] = React.useState("90d");
 const totalRevenue = REP_PERF.reduce((s, r) => s + r.closed, 0);
 const totalQuota = REP_PERF.reduce((s, r) => s + r.quota, 0);
 const attainment = Math.round((totalRevenue / totalQuota) * 100);

 return (
 <div>
 <div className="section-title">
 <div>
 <h2>{t.reports}</h2>
 <div className="sub">Projeções, conversão e abrangência de canais</div>
 </div>
 <div className="row gap-2">
 <div className="toggle-group">
 {["30d", "90d", "ano", "custom"].map(p => (
 <button key={p} aria-current={period === p} onClick={() => setPeriod(p)}>{p.toUpperCase()}</button>
 ))}
 </div>
 <button className="btn btn-sm"><Icon name="export" size={13}/> {t.export}</button>
 </div>
 </div>

 <div className="kpi-grid mb-4">
 <KpiCard label="Receita realizada" value={`R$ ${(totalRevenue / 1000).toFixed(1)}M`} delta="+22%" up
 spark={[2.1, 2.4, 2.6, 2.8, 3.1, 3.4, 3.6]} color="#2EBFC5"/>
 <KpiCard label={t.quota_attainment} value={`${attainment}%`} delta="+8 pp" up
 spark={[88, 92, 94, 98, 102, 108, 112]} color="#3F5BA8"/>
 <KpiCard label={t.win_rate} value="34%" delta="+3 pp" up
 spark={[28, 29, 31, 30, 32, 33, 34]} color="#16A07C"/>
 <KpiCard label="Ticket médio" value="R$ 218k" delta="+11%" up
 spark={[185, 192, 196, 204, 210, 215, 218]} color="#D88514"/>
 </div>

 <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.revenue} · Realizado vs. Previsto</div>
 <div className="card-sub">Próximos 90 dias com projeção ponderada</div>
 </div>
 <div className="row gap-2" style={{ marginLeft: "auto" }}>
 <span className="badge"><span className="dot" style={{background:"#2EBFC5"}}/> Realizado</span>
 <span className="badge"><span className="dot" style={{background:"#3F5BA8"}}/> Previsto</span>
 </div>
 </div>
 <div className="chart-wrap"><RevenueChart series={REVENUE_SERIES}/></div>
 </div>

 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.territory}</div>
 <div className="card-sub">Distribuição por região</div>
 </div>
 </div>
 <div style={{ padding: 16 }}>
 <WorldMap pins={GLOBAL_PINS} heat={HEAT_REGIONS} showHeat={true} height={360}/>
 </div>
 </div>
 </div>

 <div className="dash-grid-3" style={{ marginTop: 16 }}>
 <div className="card">
 <div className="card-header"><div className="card-title">{t.conversion}</div></div>
 <div style={{ padding: 16 }}>
 <Funnel data={FUNNEL} t={t}/>
 </div>
 </div>

 <div className="card">
 <div className="card-header"><div className="card-title">Pipeline por setor</div></div>
 <div style={{ padding: 16 }}>
 {SEGMENT_PERF.map(s => {
 const ind = INDUSTRIES.find(i => i.id === s.id);
 const max = Math.max(...SEGMENT_PERF.map(p => p.revenue));
 return (
 <div key={s.id} className="row gap-3 mb-2" style={{ padding: "4px 0" }}>
 <div style={{ width: 80, fontSize: 12, fontWeight: 600 }}>{ind[lang]}</div>
 <HBar value={s.revenue} max={max}/>
 <div style={{ width: 50, textAlign: "right", fontSize: 12, fontWeight: 700 }}>R$ {s.revenue}M</div>
 </div>
 );
 })}
 </div>
 </div>

 <div className="card">
 <div className="card-header"><div className="card-title">Origem dos leads</div></div>
 <div style={{ padding: 16 }}>
 <DonutChart data={[
 { label: "Indicação", value: 38, color: "#2EBFC5" },
 { label: "Outbound", value: 28, color: "#3F5BA8" },
 { label: "Inbound", value: 18, color: "#7B5BC8" },
 { label: "Eventos", value: 10, color: "#D88514" },
 { label: "Parceiros", value: 6, color: "#16A07C" },
 ]}/>
 </div>
 </div>
 </div>
 </div>
 );
};

const DonutChart = ({ data }) => {
 const total = data.reduce((s, d) => s + d.value, 0);
 const R = 60, C = 80, sw = 22;
 let offset = 0;
 const circ = 2 * Math.PI * R;
 return (
 <div className="row gap-4" style={{ alignItems: "center" }}>
 <svg width={C * 2} height={C * 2} viewBox={`0 0 ${C * 2} ${C * 2}`}>
 <circle cx={C} cy={C} r={R} fill="none" stroke="var(--surface-3)" strokeWidth={sw}/>
 {data.map((d, i) => {
 const pct = d.value / total;
 const dash = pct * circ;
 const el = (
 <circle key={i}
 cx={C} cy={C} r={R} fill="none"
 stroke={d.color} strokeWidth={sw}
 strokeDasharray={`${dash} ${circ}`}
 strokeDashoffset={-offset}
 transform={`rotate(-90 ${C} ${C})`}
 strokeLinecap="butt"
 />
 );
 offset += dash;
 return el;
 })}
 <text x={C} y={C - 4} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">{total}</text>
 <text x={C} y={C + 14} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-3)">LEADS</text>
 </svg>
 <div className="col gap-2 flex-1">
 {data.map(d => (
 <div key={d.label} className="row gap-2" style={{ fontSize: 12 }}>
 <span className="dot" style={{ background: d.color, width: 8, height: 8, borderRadius: 99, display: "inline-block" }}/>
 <span style={{ flex: 1 }}>{d.label}</span>
 <span style={{ fontWeight: 700 }}>{d.value}%</span>
 </div>
 ))}
 </div>
 </div>
 );
};

// ============================================================
// Team
// ============================================================
const Team = ({ t }) => {
 const top = [...REP_PERF].sort((a, b) => b.closed - a.closed);
 return (
 <div>
 <div className="section-title">
 <div>
 <h2>{t.team}</h2>
 <div className="sub">Performance individual e ritmo de atividades</div>
 </div>
 <div className="row gap-2">
 <button className="btn btn-sm"><Icon name="filter" size={13}/> Filtrar</button>
 <button className="btn btn-sm"><Icon name="export" size={13}/> {t.export}</button>
 <button className="btn btn-sm btn-primary"><Icon name="plus" size={13}/> Adicionar vendedor</button>
 </div>
 </div>

 {/* Leaderboard cards */}
 <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 18 }}>
 {top.slice(0, 3).map((r, i) => (
 <div key={r.id} className="card" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
 <div style={{ position: "absolute", top: 10, right: 14, opacity: 0.12, fontSize: 64, fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em", pointerEvents: "none" }}>#{i + 1}</div>
 <div className="row gap-3 mb-4" style={{ position: "relative", paddingRight: 56 }}>
 <Avatar user={r} size={48}/>
 <div style={{ minWidth: 0 }}>
 <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
 <div className="text-3" style={{ fontSize: 12 }}>{r.role}</div>
 </div>
 </div>
 <div className="row gap-4">
 <div>
 <div className="text-3" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em" }}>FECHADO</div>
 <div style={{ fontSize: 20, fontWeight: 800, whiteSpace: "nowrap" }}>R$ {r.closed}k</div>
 </div>
 <div>
 <div className="text-3" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em" }}>META</div>
 <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text-2)", whiteSpace: "nowrap" }}>R$ {r.quota}k</div>
 </div>
 </div>
 <div className="progress mt-4">
 <span style={{ width: `${Math.min(100, Math.round((r.closed / r.quota) * 100))}%` }}/>
 </div>
 <div className="row gap-2 mt-2" style={{ fontSize: 12 }}>
 <span className="badge badge-success" style={{ fontSize: 11 }}>
 {Math.round((r.closed / r.quota) * 100)}% da meta
 </span>
 <span style={{ marginLeft: "auto" }} className="text-3">{r.winRate}% win rate</span>
 </div>
 </div>
 ))}
 </div>

 <div className="card">
 <div className="card-header">
 <div className="card-title">Time completo</div>
 <span className="text-3" style={{ marginLeft: "auto", fontSize: 12 }}>{REPS.length} vendedores</span>
 </div>
 <table className="table">
 <thead>
 <tr>
 <th>{t.rep}</th>
 <th style={{textAlign:"right"}}>{t.quota}</th>
 <th style={{textAlign:"right"}}>{t.closed}</th>
 <th>Atingimento</th>
 <th style={{textAlign:"right"}}>{t.calls}</th>
 <th style={{textAlign:"right"}}>{t.meetings}</th>
 <th style={{textAlign:"right"}}>{t.win_rate}</th>
 </tr>
 </thead>
 <tbody>
 {REP_PERF.map(r => {
 const pct = Math.round((r.closed / r.quota) * 100);
 return (
 <tr key={r.id}>
 <td>
 <div className="table-name">
 <Avatar user={r} size={32}/>
 <div>
 <div>{r.name}</div>
 <div className="text-3" style={{ fontSize: 11.5, fontWeight: 400 }}>{r.role}</div>
 </div>
 </div>
 </td>
 <td style={{ textAlign: "right", fontWeight: 600 }}>R$ {r.quota}k</td>
 <td style={{ textAlign: "right", fontWeight: 700 }}>R$ {r.closed}k</td>
 <td>
 <div className="row gap-2">
 <div className="progress" style={{ flex: 1, maxWidth: 120 }}>
 <span style={{
 width: `${Math.min(100, pct)}%`,
 background: pct >= 100 ? "var(--success)" : pct >= 80 ? "var(--brand-grad)" : "var(--warning)"
 }}/>
 </div>
 <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 ? "var(--success)" : "var(--text-2)" }}>
 {pct}%
 </span>
 </div>
 </td>
 <td style={{textAlign:"right"}}>{r.calls}</td>
 <td style={{textAlign:"right"}}>{r.meetings}</td>
 <td style={{textAlign:"right", fontWeight:700}}>{r.winRate}%</td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 );
};

// ============================================================
// Settings
// ============================================================
const Settings = ({ t }) => {
 const [section, setSection] = React.useState("policy");
 const sections = [
 { id: "policy", label: t.commercial_policy, icon: "clipboard" },
 { id: "stages", label: t.pipeline_stages, icon: "pipeline" },
 { id: "inactivity", label: t.inactivity, icon: "clock" },
 { id: "contracts", label: t.contracts, icon: "file" },
 { id: "team", label: t.team_perms, icon: "users" },
 ];

 return (
 <div className="settings-grid">
 <div>
 <div className="text-3 mb-2" style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", padding: "0 12px" }}>
 Configurações
 </div>
 <div className="col gap-1">
 {sections.map(s => (
 <button key={s.id} className="settings-nav-item" aria-current={section === s.id} onClick={() => setSection(s.id)}>
 <Icon name={s.icon} size={14}/> <span style={{ marginLeft: 8 }}>{s.label}</span>
 </button>
 ))}
 </div>
 </div>
 <div>
 {section === "policy" && <PolicySettings t={t}/>}
 {section === "stages" && <StagesSettings t={t}/>}
 {section === "inactivity" && <InactivitySettings t={t}/>}
 {section === "contracts" && <ContractSettings t={t}/>}
 {section === "team" && <TeamSettings t={t}/>}
 </div>
 </div>
 );
};

const PolicySettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.commercial_policy}</div>
 <div className="card-sub">Regras que se aplicam por padrão a todos os negócios. Sobreposições por conta no detalhe.</div>
 </div>
 </div>
 <div style={{ padding: "0 20px" }}>
 <FieldRow label="Política de descontos"
 desc="Define a faixa de desconto que cada nível pode autorizar sem aprovação.">
 <div className="col gap-2">
 <DiscountRow level="Vendedor" min={0} max={5}/>
 <DiscountRow level="Coordenador" min={5} max={12}/>
 <DiscountRow level="Diretor" min={12} max={25}/>
 </div>
 </FieldRow>

 <FieldRow label="Conflito canal x representante"
 desc="Como dividir comissão quando o lead foi originado por canal mas atendido pelo representante.">
 <div className="row gap-2">
 <input className="input" defaultValue="60% canal" style={{ width: 130 }}/>
 <input className="input" defaultValue="40% representante" style={{ width: 160 }}/>
 <button className="btn btn-sm">Salvar regra</button>
 </div>
 </FieldRow>

 <FieldRow label="SLA de proposta"
 desc="Tempo máximo entre qualificação e envio de proposta formal.">
 <div className="row gap-2">
 <input className="input" defaultValue="48" style={{ width: 80 }}/>
 <select className="input" defaultValue="h" style={{ width: 100 }}>
 <option value="h">horas</option>
 <option value="d">dias</option>
 </select>
 </div>
 </FieldRow>

 <FieldRow label="Política de exclusividade"
 desc="Define se o canal interno tem exclusividade por vertical ou território.">
 <div className="col gap-2">
 <label className="row gap-2"><input type="radio" name="excl" defaultChecked/> Por vertical (setor industrial)</label>
 <label className="row gap-2"><input type="radio" name="excl"/> Por território (UF / região)</label>
 <label className="row gap-2"><input type="radio" name="excl"/> Sem exclusividade</label>
 </div>
 </FieldRow>

 <FieldRow label="Compliance"
 desc="Cláusulas obrigatórias de acordo com a atividade da indústria atendida.">
 <div className="col gap-2">
 <ToggleRow label="LGPD — consentimento explícito em formulários" defaultOn/>
 <ToggleRow label="Nota fiscal eletrônica obrigatória" defaultOn/>
 <ToggleRow label="Auditoria trimestral de contratos" defaultOn={false}/>
 </div>
 </FieldRow>
 </div>
 </div>
);

const StagesSettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.pipeline_stages}</div>
 <div className="card-sub">Define como cada oportunidade flui pelo canal interno.</div>
 </div>
 <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }}><Icon name="plus" size={13}/> Estágio</button>
 </div>
 <div style={{ padding: 20 }}>
 <div className="col gap-2">
 {STAGES.map((s, i) => (
 <div key={s.id} className="card card-pad row gap-3" style={{ boxShadow: "none" }}>
 <div style={{ width: 28, color: "var(--text-3)", fontWeight: 700 }}>{(i + 1).toString().padStart(2, "0")}</div>
 <span className="swatch" style={{ width: 10, height: 10, borderRadius: 99, background: s.color }}/>
 <div className="flex-1">
 <div style={{ fontWeight: 700 }}>{t.stages[s.id]}</div>
 <div className="text-3" style={{ fontSize: 12 }}>Probabilidade padrão: {[15, 40, 60, 75, 100][i]}%</div>
 </div>
 <span className="badge">{DEALS.filter(d => d.stage === s.id).length} ativos</span>
 <button className="icon-btn"><Icon name="more" size={14}/></button>
 </div>
 ))}
 </div>
 </div>
 </div>
);

const InactivitySettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.inactivity}</div>
 <div className="card-sub">Regras de alerta para contas sem contato. Definidas por estágio e setor.</div>
 </div>
 </div>
 <div style={{ padding: "0 20px" }}>
 <FieldRow label="Prazo padrão"
 desc="Após este tempo sem contato, a conta entra em alerta e aparece no Dashboard.">
 <div className="row gap-2">
 <input className="input" defaultValue="21" style={{ width: 80 }}/>
 <select className="input" defaultValue="d" style={{ width: 100 }}>
 <option value="d">dias</option>
 <option value="w">semanas</option>
 </select>
 </div>
 </FieldRow>
 <FieldRow label="Prazos por estágio"
 desc="Estágios mais avançados exigem cadência mais curta.">
 <div className="col gap-2">
 {STAGES.map((s, i) => (
 <div key={s.id} className="row gap-3">
 <span className="dot" style={{ width: 8, height: 8, borderRadius: 99, background: s.color }}/>
 <div style={{ width: 110, fontWeight: 600, fontSize: 13 }}>{t.stages[s.id]}</div>
 <input className="input" defaultValue={[30, 14, 7, 3, 30][i]} style={{ width: 80 }}/>
 <span className="text-3" style={{ fontSize: 12 }}>dias</span>
 </div>
 ))}
 </div>
 </FieldRow>
 <FieldRow label="Notificações"
 desc="Como alertar a equipe quando uma conta entra em inatividade.">
 <div className="col gap-2">
 <ToggleRow label="Notificação por email para o responsável" defaultOn/>
 <ToggleRow label="Card automático na agenda" defaultOn/>
 <ToggleRow label="Reatribuição automática após 60 dias" defaultOn={false}/>
 </div>
 </FieldRow>
 </div>
 </div>
);

const ContractSettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.contracts}</div>
 <div className="card-sub">Templates e cláusulas reutilizáveis para o canal interno.</div>
 </div>
 <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }}><Icon name="plus" size={13}/> Novo template</button>
 </div>
 <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
 {[
 { name: "Implantação Canal Interno Completo", v: "v3.2", parts: 12 },
 { name: "Diagnóstico + Pesquisa de Mercado", v: "v2.1", parts: 8 },
 { name: "Operação Home Office (3 SDRs)", v: "v1.4", parts: 10 },
 { name: "Treinamento In-Company", v: "v2.0", parts: 6 },
 ].map(c => (
 <div key={c.name} className="card card-pad" style={{ boxShadow: "none" }}>
 <div className="row gap-3 mb-2">
 <div className="feed-icon brand"><Icon name="file" size={14}/></div>
 <div className="flex-1">
 <div style={{ fontWeight: 700 }}>{c.name}</div>
 <div className="text-3" style={{ fontSize: 12 }}>{c.v} · {c.parts} cláusulas</div>
 </div>
 </div>
 <div className="row gap-2">
 <button className="btn btn-sm">{t.edit}</button>
 <button className="btn btn-sm btn-ghost">Duplicar</button>
 </div>
 </div>
 ))}
 </div>
 </div>
);

const TeamSettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.team_perms}</div>
 <div className="card-sub">Permissões por papel. Vendedores só veem seus negócios; coordenadores veem todo o time.</div>
 </div>
 </div>
 <table className="table">
 <thead>
 <tr>
 <th>Membro</th>
 <th>Papel</th>
 <th>Permissões</th>
 <th>Última atividade</th>
 </tr>
 </thead>
 <tbody>
 {REPS.map((r, i) => (
 <tr key={r.id}>
 <td>
 <div className="table-name">
 <Avatar user={r} size={28}/>
 <div>
 <div>{r.name}</div>
 <div className="text-3" style={{ fontSize: 11.5, fontWeight: 400 }}>{r.name.toLowerCase().split(" ")[0]}@3lackd.com.br</div>
 </div>
 </div>
 </td>
 <td>
 <select className="input" defaultValue={r.role} style={{ width: 180 }}>
 <option>Inside Sales</option>
 <option>Sales Rep</option>
 <option>Sr. Sales Rep</option>
 <option>Coord. Comercial</option>
 <option>Diretor</option>
 </select>
 </td>
 <td>
 <span className="badge badge-brand">{i === 0 ? "Admin total" : "Ver e editar"}</span>
 </td>
 <td className="text-2" style={{ fontSize: 12.5 }}>há {[2, 14, 38, 6, 22, 90][i]} min</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
);

const IntegrationSettings = ({ t }) => (
 <div className="card">
 <div className="card-header">
 <div>
 <div className="card-title">{t.integrations}</div>
 <div className="card-sub">Conexões com ERPs, telefonia e ferramentas de comunicação.</div>
 </div>
 </div>
 <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
 {[
 { name: "ERP TOTVS Protheus", desc: "Pedidos e faturamento", on: true, icon: "layers" },
 { name: "Telefonia 3CX", desc: "Click-to-call e gravações", on: true, icon: "phone" },
 { name: "WhatsApp Business", desc: "Mensageria com leads", on: true, icon: "message" },
 { name: "RD Station Marketing", desc: "Sincronização de leads", on: false, icon: "trend" },
 { name: "Google Calendar", desc: "Sincronização de agenda", on: true, icon: "calendar" },
 { name: "Microsoft 365", desc: "Email e SSO", on: false, icon: "mail" },
 ].map(it => (
 <div key={it.name} className="card card-pad row gap-3" style={{ boxShadow: "none" }}>
 <div className="feed-icon brand" style={{ width: 40, height: 40 }}><Icon name={it.icon} size={18}/></div>
 <div className="flex-1">
 <div style={{ fontWeight: 700 }}>{it.name}</div>
 <div className="text-3" style={{ fontSize: 12 }}>{it.desc}</div>
 </div>
 <div className={"switch " + (it.on ? "on" : "")} onClick={(e) => e.currentTarget.classList.toggle("on")}/>
 </div>
 ))}
 </div>
 </div>
);

// helpers
const FieldRow = ({ label, desc, children }) => (
 <div className="field-row">
 <div className="field-label">
 <h4>{label}</h4>
 <p>{desc}</p>
 </div>
 <div>{children}</div>
 </div>
);

const ToggleRow = ({ label, defaultOn = false }) => {
 const [on, setOn] = React.useState(defaultOn);
 return (
 <label className="row gap-3" style={{ cursor: "pointer", padding: "4px 0" }}>
 <div className={"switch " + (on ? "on" : "")} onClick={(e) => { e.preventDefault(); setOn(o => !o); }}/>
 <span style={{ fontSize: 13 }}>{label}</span>
 </label>
 );
};

const DiscountRow = ({ level, min, max }) => (
 <div className="row gap-3">
 <div style={{ width: 110, fontWeight: 600, fontSize: 13 }}>{level}</div>
 <input className="input" defaultValue={min} style={{ width: 70 }}/>
 <span className="text-3">—</span>
 <input className="input" defaultValue={max} style={{ width: 70 }}/>
 <span className="text-3" style={{ fontSize: 12 }}>%</span>
 </div>
);

Object.assign(window, { Reports, Team, Settings });
