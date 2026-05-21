// ============================================================
// VOZZ CRM — Check-in de Visitas (web)
// Registra início, observações, resultado e próximos passos.
// ============================================================

const CHECKIN_KEY = "vozz_checkins";
const loadCheckins = () => { try { return JSON.parse(localStorage.getItem(CHECKIN_KEY) || "[]"); } catch { return []; } };
const saveCheckins = (l) => { try { localStorage.setItem(CHECKIN_KEY, JSON.stringify(l)); } catch {} };

const RESULTADOS = [
  { id: "venda",      label: "✅ Vendeu",                color: "#16A07C" },
  { id: "proposta",   label: "📄 Enviou proposta",       color: "#3F5BA8" },
  { id: "retorno",    label: "🔁 Agendou retorno",       color: "#D88514" },
  { id: "sem_int",    label: "❌ Sem interesse",         color: "#D63B5C" },
  { id: "ausente",    label: "🚪 Cliente ausente",       color: "#8A8899" },
];

const CheckIn = ({ t, lang }) => {
  const [checkins, setCheckins] = React.useState(loadCheckins);
  const [active, setActive] = React.useState(null); // visita em check-in
  const [filter, setFilter] = React.useState("all"); // all | hoje | semana

  // Pegamos as contas que o vendedor "tem na rua" — usa ROUTE_CLIENTS + ACCOUNTS
  const visitas = React.useMemo(() => {
    return ROUTE_CLIENTS.map(c => {
      const last = checkins.filter(k => k.accountId === c.id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      return { ...c, lastCheckin: last };
    });
  }, [checkins]);

  const doneCount = checkins.length;
  const todayKey = new Date().toDateString();
  const todayCount = checkins.filter(c => new Date(c.timestamp).toDateString() === todayKey).length;

  const start = (visita) => setActive({
    accountId: visita.id,
    account: visita.account,
    addr: visita.addr,
    arrived: new Date().toISOString(),
    notas: "",
    resultado: "",
    proximos: "",
  });

  const saveActive = () => {
    if (!active.resultado) { vozzAlert("Selecione um resultado antes de salvar.", "Faltou um campo"); return; }
    const next = [...checkins, { ...active, id: "ck_" + Date.now(), timestamp: Date.now() }];
    setCheckins(next); saveCheckins(next); setActive(null);
  };

  return (
    <div>
      <div className="section-title">
        <div>
          <h2>Check-in de Visitas</h2>
          <div className="sub">Registre cada visita feita: hora, resultado, próximos passos. Histórico salvo no navegador.</div>
        </div>
        <div className="row gap-2">
          <span className="badge badge-success"><span className="dot"/> {todayCount} hoje</span>
          <span className="badge"><span className="dot"/> {doneCount} no total</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
        {/* Lista de visitas planejadas */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-header">
            <Icon name="map" size={14}/>
            <div className="card-title">Visitas planejadas hoje ({visitas.length})</div>
            <div className="toggle-group" style={{ marginLeft: "auto" }}>
              <button aria-current={filter === "all"}    onClick={() => setFilter("all")}>Todas</button>
              <button aria-current={filter === "abertas"} onClick={() => setFilter("abertas")}>Pendentes</button>
              <button aria-current={filter === "feitas"}  onClick={() => setFilter("feitas")}>Já visitadas</button>
            </div>
          </div>
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {visitas
              .filter(v => filter === "all" || (filter === "feitas" ? v.lastCheckin : !v.lastCheckin))
              .map(v => {
                const done = !!v.lastCheckin;
                const res = done && RESULTADOS.find(r => r.id === v.lastCheckin.resultado);
                return (
                  <div key={v.id} className="card" style={{
                    padding: 14, borderLeft: `4px solid ${done ? (res?.color || "#16A07C") : "#3F5BA8"}`,
                  }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="flex-1">
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{v.account}</div>
                        <div className="text-3" style={{ fontSize: 12 }}>{v.addr}</div>
                        {done && (
                          <div className="text-2 mt-2" style={{ fontSize: 12 }}>
                            <span className="badge" style={{ background: res.color + "22", color: res.color, fontWeight: 600 }}>{res.label}</span>
                            <span className="text-3" style={{ marginLeft: 8, fontSize: 11 }}>
                              · {new Date(v.lastCheckin.timestamp).toLocaleString("pt-BR")}
                            </span>
                          </div>
                        )}
                      </div>
                      <button className="btn btn-sm btn-primary" onClick={() => start(v)}>
                        <Icon name="target" size={12}/> {done ? "Novo check-in" : "Iniciar"}
                      </button>
                    </div>
                  </div>
                );
              })}
            {visitas.length === 0 && (
              <div className="text-3" style={{ padding: 20, textAlign: "center" }}>Nenhuma visita planejada.</div>
            )}
          </div>
        </div>

        {/* Sidebar — histórico */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Histórico recente</div>
            {checkins.length > 0 && (
              <button className="icon-btn" style={{ marginLeft: "auto" }}
                      onClick={async () => { if (await vozzConfirm("Apagar todo o histórico de check-ins?", "Limpar histórico")) { setCheckins([]); saveCheckins([]); } }}
                      title="Limpar histórico"><Icon name="x" size={13}/></button>
            )}
          </div>
          <div style={{ padding: "4px 0", maxHeight: 600, overflowY: "auto" }}>
            {checkins.slice().reverse().slice(0, 20).map(c => {
              const res = RESULTADOS.find(r => r.id === c.resultado);
              return (
                <div key={c.id} className="feed-item" style={{ alignItems: "flex-start" }}>
                  <div className="feed-icon" style={{ background: (res?.color || "#3F5BA8") + "22", color: res?.color || "#3F5BA8" }}>
                    <Icon name="check" size={13}/>
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{c.account}</div>
                    <div className="text-3" style={{ fontSize: 11 }}>
                      {res?.label} · {new Date(c.timestamp).toLocaleString("pt-BR")}
                    </div>
                    {c.proximos && <div className="text-2" style={{ fontSize: 11.5, marginTop: 4 }}>→ {c.proximos}</div>}
                  </div>
                </div>
              );
            })}
            {checkins.length === 0 && (
              <div className="text-3" style={{ padding: 20, textAlign: "center", fontSize: 12 }}>Nenhum check-in ainda.</div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de check-in */}
      {active && (
        <div onClick={() => setActive(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
          zIndex: 100, display: "grid", placeItems: "center", padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: "min(560px, 95vw)", padding: 0 }}>
            <div className="card-header">
              <Icon name="target" size={14}/>
              <div className="flex-1">
                <div className="card-title">Check-in · {active.account}</div>
                <div className="card-sub">{active.addr}</div>
              </div>
              <button className="icon-btn" onClick={() => setActive(null)}><Icon name="x" size={14}/></button>
            </div>
            <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="text-3" style={{ fontSize: 12 }}>
                <Icon name="clock" size={11}/> Chegada registrada às <b>{new Date(active.arrived).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</b>
              </div>

              <div>
                <label className="label">Resultado da visita</label>
                <div className="row gap-2" style={{ flexWrap: "wrap" }}>
                  {RESULTADOS.map(r => (
                    <button key={r.id} className="filter-chip"
                            onClick={() => setActive(a => ({ ...a, resultado: r.id }))}
                            style={{
                              background: active.resultado === r.id ? r.color + "22" : "transparent",
                              borderColor: active.resultado === r.id ? r.color : "var(--border)",
                              color: active.resultado === r.id ? r.color : "var(--text-2)",
                              fontWeight: 600,
                            }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Observações da visita</label>
                <textarea className="input" rows={3} value={active.notas}
                          placeholder="Quem te recebeu, principais pontos, objeções..."
                          onChange={e => setActive(a => ({ ...a, notas: e.target.value }))}/>
              </div>

              <div>
                <label className="label">Próximos passos</label>
                <input className="input" value={active.proximos}
                       placeholder="Ex.: enviar proposta até sexta · marcar nova visita em 15 dias"
                       onChange={e => setActive(a => ({ ...a, proximos: e.target.value }))}/>
              </div>

              <div className="row gap-2" style={{ marginTop: 4 }}>
                <button className="btn btn-sm flex-1" onClick={() => setActive(null)}>Cancelar</button>
                <button className="btn btn-sm btn-primary flex-1" onClick={saveActive}>
                  <Icon name="check" size={12}/> Salvar check-in
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { CheckIn });
