// ============================================================
// VOZZ CRM — Dashboard + Pipeline screens
// ============================================================

const Dashboard = ({ t, lang, onOpenAccount }) => {
  const inactiveAccounts = ACCOUNTS.filter(a => a.inactive).slice(0, 4);

  const pipelineTotal = DEALS.filter(d => d.stage !== "won" && d.stage !== "lost")
    .reduce((s, d) => s + d.value, 0);
  const weightedForecast = DEALS.filter(d => d.stage !== "lost")
    .reduce((s, d) => s + d.value * (d.probability / 100), 0);
  const closingThisMonth = DEALS.filter(d => d.closeIn <= 30 && d.closeIn >= 0)
    .reduce((s, d) => s + d.value, 0);

  return (
    <div>
      {/* Banner */}
      <div className="brand-banner mb-4">
        <svg className="dots" viewBox="0 0 200 200" fill="none">
          <g fill="white" opacity="0.3">
            <circle cx="100" cy="50" r="14"/>
            <circle cx="60"  cy="100" r="11"/>
            <circle cx="140" cy="100" r="11"/>
            <circle cx="40"  cy="150" r="9"/>
            <circle cx="100" cy="140" r="13"/>
            <circle cx="160" cy="150" r="9"/>
          </g>
          <g stroke="white" opacity="0.25" strokeWidth="1.2">
            <path d="M60 100 100 50 140 100"/>
            <path d="M40 150 100 140 160 150"/>
            <path d="M60 100 100 140 140 100"/>
          </g>
        </svg>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3>{t.banner_title}</h3>
          <p>{t.banner_sub}</p>
          <div className="row gap-2 mt-4">
            <button className="btn btn-sm" style={{ background: "rgba(255,255,255,.18)", borderColor: "transparent", color: "white", backdropFilter: "blur(4px)" }}>
              <Icon name="chart" size={14}/> {t.revenue_forecast}
            </button>
            <button className="btn btn-sm btn-ghost" style={{ color: "rgba(255,255,255,.85)" }}>
              {t.open_record} <Icon name="arrow_right" size={14}/>
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KpiCard label={t.pipeline_value} value={fmtBRL(pipelineTotal, { abbr: true })} delta="+18.4%" up
                 spark={[12, 15, 14, 18, 22, 24, 28]} color="#2EBFC5"/>
        <KpiCard label={t.revenue_forecast} value={fmtBRL(weightedForecast, { abbr: true })} delta="+12%" up
                 spark={[8, 10, 11, 14, 17, 22, 26]} color="#3F5BA8"/>
        <KpiCard label={t.closing_this_month} value={fmtBRL(closingThisMonth, { abbr: true })} delta="−4%" down
                 spark={[18, 22, 20, 17, 14, 16, 13]} color="#D88514"/>
        <KpiCard label={t.avg_cycle} value={"38"} unit={t.avg_cycle_unit} delta="−6 d" up
                 spark={[44, 42, 41, 40, 38, 38, 38]} color="#16A07C"/>
      </div>

      {/* Meta vs Realizado */}
      <MetaCard pipelineTotal={pipelineTotal} weightedForecast={weightedForecast}/>

      {/* Sales Velocity + Pipeline Coverage */}
      <VelocityCoverage pipelineTotal={pipelineTotal}/>

      {/* Forecast chart + activity */}
      <div className="dash-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t.revenue_forecast}</div>
              <div className="card-sub">{t.revenue_forecast_sub}</div>
            </div>
            <div className="row gap-2" style={{ marginLeft: "auto" }}>
              <span className="badge"><span className="dot" style={{background:"#2EBFC5"}}/> Realizado</span>
              <span className="badge"><span className="dot" style={{background:"#3F5BA8"}}/> Previsto</span>
            </div>
          </div>
          <div className="chart-wrap">
            <RevenueChart series={REVENUE_SERIES}/>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t.activity}</div>
              <div className="card-sub">Últimas 24h</div>
            </div>
          </div>
          <div style={{ maxHeight: 312, overflowY: "auto" }}>
            {ACTIVITIES.map(a => {
              const acc = ACCOUNTS.find(x => x.id === a.accountId);
              const u = REPS.find(r => r.id === a.ownerId);
              const iconMap = { call: "phone", email: "mail", meeting: "calendar", stage: "layers", note: "document", won: "award" };
              const isBrand = a.type === "won";
              return (
                <div key={a.id} className="feed-item">
                  <div className={"feed-icon " + (isBrand ? "brand" : "")}>
                    <Icon name={iconMap[a.type]} size={14}/>
                  </div>
                  <div className="flex-1">
                    <div className="feed-text">
                      <b>{u.name.split(" ")[0]}</b> · <a onClick={() => onOpenAccount(acc.id)} style={{cursor:"pointer", color:"var(--brand-blue)"}}><b>{acc.name}</b></a>
                      <div className="text-2 mt-0" style={{ fontSize: 12.5 }}>{a.text}</div>
                    </div>
                    <div className="feed-time">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Funnel + segment + inactivity */}
      <div className="dash-grid-3">
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.funnel}</div>
            <span className="badge badge-brand" style={{ marginLeft: "auto" }}>
              <Icon name="trend" size={11}/> 7.6% taxa
            </span>
          </div>
          <div style={{ padding: 16 }}>
            <Funnel data={FUNNEL} t={t}/>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.by_segment}</div>
          </div>
          <div style={{ padding: 12 }}>
            {SEGMENT_PERF.map(s => {
              const ind = INDUSTRIES.find(i => i.id === s.id);
              const max = Math.max(...SEGMENT_PERF.map(p => p.revenue));
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "6px 8px" }}>
                  <div style={{ width: 96, fontSize: 12.5, fontWeight: 600 }}>{ind[lang]}</div>
                  <HBar value={s.revenue} max={max}/>
                  <div style={{ width: 56, textAlign: "right", fontSize: 12.5, fontWeight: 700 }}>R$ {s.revenue}M</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">{t.inactivity_alerts}</div>
              <div className="card-sub">{t.inactivity_sub}</div>
            </div>
            <span className="badge badge-warning" style={{ marginLeft: "auto" }}>
              <Icon name="bell" size={11}/> {inactiveAccounts.length}
            </span>
          </div>
          <div>
            {inactiveAccounts.map(a => (
              <div key={a.id} className="feed-item" style={{ padding: "12px 16px" }}>
                <div className="account-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>
                  {a.name.split(" ").slice(0,2).map(w=>w[0]).join("")}
                </div>
                <div className="flex-1">
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{a.name}</div>
                  <div className="text-3" style={{ fontSize: 12 }}>
                    <Icon name="clock" size={10}/> {a.lastContact} {t.days_silent}
                  </div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={() => onOpenAccount(a.id)}>
                  {t.reactivate}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KpiCard = ({ label, value, unit, delta, up, down, spark, color }) => (
  <div className="kpi">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">
      {value}{unit && <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-3)", marginLeft: 4 }}>{unit}</span>}
    </div>
    <div className={"kpi-delta " + (up ? "up" : down ? "down" : "")}>
      <Icon name={up ? "arrow_up" : "arrow_down"} size={12}/> {delta}
    </div>
    <div className="kpi-spark">
      <Sparkline values={spark} color={color}/>
    </div>
  </div>
);

// ============================================================
// Pipeline (Kanban)
// ============================================================
const Pipeline = ({ t, lang, onOpenAccount, density }) => {
  const [deals, setDeals] = React.useState(DEALS);
  const [stages, setStages] = React.useState(STAGES);
  const [dragId, setDragId] = React.useState(null);
  const [hoverStage, setHoverStage] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [fVendedor, setFVendedor] = React.useState("");
  const [fRegiao, setFRegiao] = React.useState("");
  const [fSetor, setFSetor]   = React.useState("");
  const [fValor, setFValor]   = React.useState("");

  const addColumn = async () => {
    const name = await vozzPrompt("Como vai se chamar a nova coluna do pipeline?", "", "Nova coluna");
    if (!name) return;
    const id = "col_" + Date.now();
    const palette = ["#2EBFC5", "#3F5BA8", "#D88514", "#16A07C", "#7B5BC8", "#D63B5C"];
    setStages(s => [...s, { id, color: palette[s.length % palette.length] }]);
    if (t.stages) t.stages[id] = name;
  };
  const removeColumn = async (id) => {
    if (!(await vozzConfirm("Os deals desta coluna voltarão para a 1ª coluna. Continuar?", "Remover coluna"))) return;
    const firstId = stages[0]?.id;
    setDeals(ds => ds.map(d => d.stage === id ? { ...d, stage: firstId } : d));
    setStages(s => s.filter(x => x.id !== id));
  };
  const addCardTo = async (stageId) => {
    const name = await vozzPrompt("Qual o nome do novo negócio?", "", "Novo deal");
    if (!name) return;
    const acc = ACCOUNTS[Math.floor(Math.random() * ACCOUNTS.length)];
    setDeals(ds => [...ds, {
      id: "d_" + Date.now(), name, stage: stageId, accountId: acc.id,
      ownerId: REPS[0]?.id || "u1", value: 50000, probability: 30, closeIn: 30,
    }]);
  };

  const filtered = React.useMemo(() => {
    let out = deals;
    if (filter === "mine") out = out.filter(d => d.ownerId === "u1" || d.ownerId === "u2");
    if (filter === "hot")  out = out.filter(d => d.probability >= 50);
    if (fVendedor) out = out.filter(d => d.ownerId === fVendedor);
    if (fRegiao || fSetor) {
      out = out.filter(d => {
        const a = ACCOUNTS.find(x => x.id === d.accountId);
        if (!a) return false;
        if (fRegiao && a.region !== fRegiao) return false;
        if (fSetor && a.industry !== fSetor) return false;
        return true;
      });
    }
    if (fValor) {
      const [min, max] = fValor.split("-").map(Number);
      out = out.filter(d => d.value >= min && d.value <= max);
    }
    return out;
  }, [deals, filter, fVendedor, fRegiao, fSetor, fValor]);

  const regioesUnicas = [...new Set(ACCOUNTS.map(a => a.region))];

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, stage) => { e.preventDefault(); setHoverStage(stage); };
  const onDrop = (stage) => {
    if (!dragId) return;
    setDeals(ds => ds.map(d => d.id === dragId ? { ...d, stage } : d));
    setDragId(null);
    setHoverStage(null);
  };

  return (
    <>
      <div className="filters">
        <div className="toggle-group">
          {["all", "mine", "hot"].map(f => (
            <button key={f} aria-current={filter === f} onClick={() => setFilter(f)}>
              {f === "all" ? "Todos" : f === "mine" ? "Meus" : "Hot deals"}
            </button>
          ))}
        </div>
        <select className="input" style={{ height: 30, width: 150 }} value={fVendedor} onChange={e => setFVendedor(e.target.value)}>
          <option value="">👤 Vendedor</option>
          {REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 130 }} value={fRegiao} onChange={e => setFRegiao(e.target.value)}>
          <option value="">📍 Região</option>
          {regioesUnicas.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 140 }} value={fSetor} onChange={e => setFSetor(e.target.value)}>
          <option value="">🏭 Setor</option>
          {INDUSTRIES.map(i => <option key={i.id} value={i.id}>{i[lang]}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 150 }} value={fValor} onChange={e => setFValor(e.target.value)}>
          <option value="">💰 Valor</option>
          <option value="0-50000">Até R$ 50k</option>
          <option value="50000-150000">R$ 50k – 150k</option>
          <option value="150000-500000">R$ 150k – 500k</option>
          <option value="500000-99999999">Acima R$ 500k</option>
        </select>
        {(fVendedor || fRegiao || fSetor || fValor) && (
          <button className="btn btn-sm" onClick={() => { setFVendedor(""); setFRegiao(""); setFSetor(""); setFValor(""); }}>
            <Icon name="x" size={12}/> Limpar
          </button>
        )}
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <button className="btn btn-sm" onClick={addColumn}><Icon name="plus" size={13}/> Nova coluna</button>
          <button className="btn btn-sm btn-primary" onClick={() => addCardTo(stages[0]?.id)}><Icon name="plus" size={13}/> {t.new_deal}</button>
        </div>
      </div>

      <div className="kanban" data-density={density}>
        {stages.map(stage => {
          const stageDeals = filtered.filter(d => d.stage === stage.id);
          const stageSum = stageDeals.reduce((s, d) => s + d.value, 0);
          const isHover = hoverStage === stage.id;
          return (
            <div key={stage.id} className="kanban-col"
                 onDragOver={(e) => onDragOver(e, stage.id)}
                 onDrop={() => onDrop(stage.id)}
                 style={isHover ? { background: "var(--brand-grad-soft)" } : {}}>
              <div className="kanban-col-header">
                <span className="swatch" style={{ background: stage.color }}/>
                <span className="kanban-col-title" style={{ color: stage.color }}>
                  {t.stages[stage.id] || stage.id}
                </span>
                <span className="kanban-col-count">{stageDeals.length}</span>
                <span className="kanban-col-sum">{fmtBRL(stageSum, { abbr: true })}</span>
                {!STAGES.find(s => s.id === stage.id) && (
                  <button className="icon-btn" title="Remover coluna" onClick={() => removeColumn(stage.id)} style={{ marginLeft: 4 }}>
                    <Icon name="x" size={12}/>
                  </button>
                )}
              </div>
              <div className="kanban-body">
                {stageDeals.map(d => {
                  const acc = ACCOUNTS.find(a => a.id === d.accountId);
                  const owner = REPS.find(r => r.id === d.ownerId);
                  // Aging derivado deterministicamente do id (mock)
                  const aging = ((d.id.charCodeAt(d.id.length - 1) * 7) % 45) + 1;
                  // Deal Health Score: probabilidade + recência (aging penaliza)
                  const health = Math.max(0, Math.min(100, Math.round(d.probability * 0.7 + (40 - Math.min(aging, 40)) * 0.75)));
                  const healthCor = health >= 70 ? "#16A07C" : health >= 45 ? "#D88514" : "#D63B5C";
                  const agingCor = aging <= 7 ? "#16A07C" : aging <= 21 ? "#D88514" : "#D63B5C";
                  return (
                    <div key={d.id}
                         className={"kanban-card " + (dragId === d.id ? "dragging" : "")}
                         draggable
                         onDragStart={() => onDragStart(d.id)}
                         onClick={() => onOpenAccount(acc.id)}>
                      <div className="row" style={{ gap: 4, marginBottom: 6 }}>
                        <span className="badge" title={`Aging — ${aging} dias no estágio atual`}
                              style={{ background: agingCor + "22", color: agingCor, fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                          <Icon name="clock" size={9}/> {aging}d
                        </span>
                        <span className="badge" title={`Health Score — saúde do deal baseada em probabilidade e atividade`}
                              style={{ background: healthCor + "22", color: healthCor, fontSize: 10, fontWeight: 700, padding: "2px 6px" }}>
                          ❤ {health}
                        </span>
                        {aging > 30 && <span style={{ fontSize: 11 }} title="Deal parado">🚨</span>}
                      </div>
                      <div className="kanban-card-co">{acc.name}</div>
                      <div className="kanban-card-deal">{d.name}</div>
                      <div className="kanban-card-meta">
                        <span className="kanban-card-value">{fmtBRL(d.value, { abbr: true })}</span>
                        <span className="badge" style={{
                          background: d.probability >= 70 ? "var(--success-soft)" : d.probability >= 40 ? "var(--brand-grad-soft)" : "var(--surface-2)",
                          color: d.probability >= 70 ? "var(--success)" : d.probability >= 40 ? "var(--brand-blue)" : "var(--text-2)",
                        }}>{d.probability}%</span>
                      </div>
                      <div className="kanban-card-foot">
                        <Avatar user={owner} size={20}/>
                        <span className="text-3" style={{ fontSize: 11.5 }}>
                          <Icon name="clock" size={10}/> {d.closeIn < 0 ? "fechado" : `${d.closeIn}d`}
                        </span>
                        <span style={{ marginLeft: "auto" }} className="badge badge-brand">
                          <Icon name="layers" size={10}/> {INDUSTRIES.find(i => i.id === acc.industry)[lang]}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <button className="kanban-add" onClick={() => addCardTo(stage.id)}>{t.add_card}</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ============================================================
// Meta vs Realizado — barra de progresso com projeção e gap
// ============================================================
const MetaCard = ({ pipelineTotal, weightedForecast }) => {
  const meta = 2400000;
  const realizado = Math.round(meta * 0.62);
  const projetado = realizado + Math.round(weightedForecast * 0.35);
  const pct = (realizado / meta) * 100;
  const pctProj = (projetado / meta) * 100;
  const gap = Math.max(0, meta - projetado);
  const hoje = new Date();
  const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diasRest = Math.max(0, ultimoDia - hoje.getDate());
  const ritmoNecessario = diasRest > 0 ? Math.round((meta - realizado) / diasRest) : 0;
  const onTrack = projetado >= meta;
  const cor = onTrack ? "#16A07C" : pctProj >= 85 ? "#D88514" : "#D63B5C";
  const fmt = (n) => "R$ " + (n / 1000000).toFixed(2) + "M";

  return (
    <div className="card mb-4" style={{ padding: 20, borderLeft: `4px solid ${cor}` }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
            🎯 Meta do mês
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
            {fmt(realizado)} <span className="text-3" style={{ fontSize: 14, fontWeight: 500 }}>de {fmt(meta)}</span>
          </div>
          <div className="text-2" style={{ fontSize: 12.5, marginTop: 2 }}>
            <b style={{ color: cor }}>{pct.toFixed(1)}%</b> realizado · projeção fim de mês: <b>{fmt(projetado)}</b> ({pctProj.toFixed(0)}%)
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span className="badge" style={{ background: cor + "22", color: cor, fontWeight: 700, fontSize: 12 }}>
            {onTrack ? "✅ No ritmo" : pctProj >= 85 ? "⚠️ Risco moderado" : "🚨 Fora do ritmo"}
          </span>
          <div className="text-3" style={{ fontSize: 11, marginTop: 6 }}>{diasRest} dias úteis restantes</div>
        </div>
      </div>
      <div style={{ position: "relative", background: "var(--surface-2)", height: 28, borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, width: Math.min(100, pctProj) + "%", background: cor + "44", transition: "width .4s" }}/>
        <div style={{ position: "absolute", inset: 0, width: Math.min(100, pct) + "%", background: cor, transition: "width .4s",
                      display: "flex", alignItems: "center", paddingLeft: 12, color: "#fff", fontWeight: 700, fontSize: 12 }}>
          {pct >= 12 ? pct.toFixed(0) + "%" : ""}
        </div>
        <div style={{ position: "absolute", left: Math.min(100, pctProj) + "%", top: 0, bottom: 0, width: 2, background: "var(--text)" }}/>
      </div>
      <div className="row gap-3 mt-3" style={{ fontSize: 12, flexWrap: "wrap" }}>
        <div><span className="text-3">Gap para meta:</span> <b style={{ color: gap > 0 ? "#D63B5C" : "#16A07C" }}>{gap > 0 ? fmt(gap) : "Bateu! ✨"}</b></div>
        <div><span className="text-3">Ritmo necessário:</span> <b>R$ {(ritmoNecessario / 1000).toFixed(0)}k/dia</b></div>
        <div><span className="text-3">Pipeline ponderado:</span> <b>{fmt(weightedForecast)}</b></div>
      </div>
    </div>
  );
};

// ============================================================
// Sales Velocity + Pipeline Coverage Ratio
// ============================================================
const VelocityCoverage = ({ pipelineTotal }) => {
  const open = DEALS.filter(d => d.stage !== "won" && d.stage !== "lost");
  const qualified = open.filter(d => d.probability >= 30);
  const won = DEALS.filter(d => d.stage === "won");
  const ticketMedio = won.length ? won.reduce((s, d) => s + d.value, 0) / won.length : 0;
  const winRate = DEALS.length ? (won.length / DEALS.filter(d => d.stage === "won" || d.stage === "lost").length) : 0;
  const ciclo = 38; // dias (mesma fonte do KPI ciclo médio)
  const velocity = ciclo > 0 ? (qualified.length * ticketMedio * winRate) / ciclo : 0;

  const metaRest = 2400000 - Math.round(2400000 * 0.62); // gap restante p/ meta
  const coverage = metaRest > 0 ? pipelineTotal / metaRest : 99;
  const covStatus = coverage >= 4 ? { cor: "#16A07C", txt: "Excelente" }
                  : coverage >= 3 ? { cor: "#22C77E", txt: "Saudável" }
                  : coverage >= 2 ? { cor: "#D88514", txt: "Apertado" }
                  :                 { cor: "#D63B5C", txt: "Crítico" };
  const fmt = (n) => "R$ " + (n / 1000000).toFixed(2) + "M";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
      <div className="card" style={{ padding: 18, borderLeft: "4px solid #2EBFC5" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>⚡ Sales Velocity</div>
          <span className="badge badge-brand">por dia</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>R$ {(velocity / 1000).toFixed(1)}k<span className="text-3" style={{ fontSize: 13, fontWeight: 500 }}>/dia</span></div>
        <div className="text-2" style={{ fontSize: 12, marginTop: 4 }}>
          {qualified.length} qualificados × {fmt(ticketMedio)} × {(winRate*100).toFixed(0)}% win rate ÷ {ciclo}d ciclo
        </div>
        <div className="text-3 mt-2" style={{ fontSize: 11 }}>Quanto $ a equipe gera por dia — métrica única que combina volume, valor, qualidade e velocidade.</div>
      </div>

      <div className="card" style={{ padding: 18, borderLeft: `4px solid ${covStatus.cor}` }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>📊 Pipeline Coverage Ratio</div>
          <span className="badge" style={{ background: covStatus.cor + "22", color: covStatus.cor, fontWeight: 700 }}>{covStatus.txt}</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: covStatus.cor }}>{coverage.toFixed(1)}x</div>
        <div className="text-2" style={{ fontSize: 12, marginTop: 4 }}>
          {fmt(pipelineTotal)} de pipeline aberto / {fmt(metaRest)} de gap para meta
        </div>
        <div className="text-3 mt-2" style={{ fontSize: 11 }}>
          Ideal: <b>≥ 3x</b>. Indicador antecedente nº 1 de bater a quota — abaixo disso, prospectar mais.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Dashboard, Pipeline });
