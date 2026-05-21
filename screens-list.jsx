// ============================================================
// VOZZ CRM — Accounts list, Account Detail, Schedule
// ============================================================

const Accounts = ({ t, lang, onOpenAccount }) => {
  const [tab, setTab] = React.useState("all");
  const [selected, setSelected] = React.useState(new Set());
  const [q, setQ] = React.useState("");
  const [fInd, setFInd] = React.useState("");
  const [fReg, setFReg] = React.useState("");
  const [fOwn, setFOwn] = React.useState("");
  const [fInact, setFInact] = React.useState("");
  const regUnique = [...new Set(ACCOUNTS.map(a => a.region))];

  const tabs = [
    { id: "all",       label: t.all_accounts, count: ACCOUNTS.length },
    { id: "new_leads", label: t.new_leads,    count: ACCOUNTS.filter(a => !a.customer && !a.inactive).length },
    { id: "customers", label: t.customers,    count: ACCOUNTS.filter(a => a.customer).length },
    { id: "inactive",  label: t.inactive,     count: ACCOUNTS.filter(a => a.inactive).length },
  ];

  const filtered = ACCOUNTS.filter(a => {
    if (tab === "new_leads" && (a.customer || a.inactive)) return false;
    if (tab === "customers" && !a.customer) return false;
    if (tab === "inactive" && !a.inactive) return false;
    if (q && !a.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (fInd && a.industry !== fInd) return false;
    if (fReg && a.region !== fReg) return false;
    if (fOwn && a.owner !== fOwn) return false;
    if (fInact === "ativos" && a.inactive) return false;
    if (fInact === "inativos" && !a.inactive) return false;
    return true;
  });

  const toggle = (id) => {
    const s = new Set(selected);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelected(s);
  };

  return (
    <>
      <div className="subtabs">
        {tabs.map(tb => (
          <button key={tb.id} className="subtab" aria-current={tab === tb.id} onClick={() => setTab(tb.id)}>
            {tb.label}
            <span className="badge" style={{ marginLeft: 8, fontSize: 10.5 }}>{tb.count}</span>
          </button>
        ))}
      </div>
      <div className="filters">
        <div className="sidebar-search" style={{ margin: 0, flex: "0 0 280px" }}>
          <Icon name="search" size={14}/>
          <input placeholder={t.search_placeholder} value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <select className="input" style={{ height: 30, width: 140 }} value={fInd} onChange={e => setFInd(e.target.value)}>
          <option value="">🏭 {t.industry}</option>
          {INDUSTRIES.map(i => <option key={i.id} value={i.id}>{i[lang]}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 130 }} value={fReg} onChange={e => setFReg(e.target.value)}>
          <option value="">📍 {t.region}</option>
          {regUnique.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 150 }} value={fOwn} onChange={e => setFOwn(e.target.value)}>
          <option value="">👤 {t.owner}</option>
          {REPS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select className="input" style={{ height: 30, width: 130 }} value={fInact} onChange={e => setFInact(e.target.value)}>
          <option value="">⏰ {t.inactivity}</option>
          <option value="ativos">Apenas ativos</option>
          <option value="inativos">Apenas inativos</option>
        </select>
        {(fInd || fReg || fOwn || fInact) && (
          <button className="btn btn-sm" onClick={() => { setFInd(""); setFReg(""); setFOwn(""); setFInact(""); }}>
            <Icon name="x" size={12}/> Limpar
          </button>
        )}
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          {selected.size > 0 && (
            <span className="badge badge-brand">{selected.size} selecionados</span>
          )}
          <button className="btn btn-sm" onClick={() => {
            const rows = filtered;
            const csv = "nome,cidade,setor,regiao,funcionarios\n" + rows.map(a => `"${a.name}","${a.city}",${a.industry},${a.region},${a.employees}`).join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a"); link.href = url; link.download = "vozz_contas.csv"; link.click();
            URL.revokeObjectURL(url);
          }}><Icon name="export" size={13}/> {t.export}</button>
          <button className="btn btn-sm btn-primary" onClick={async () => {
            const name = await vozzPrompt("Nome da empresa ou contato:", "", "Novo lead");
            if (name) vozzAlert(`Lead "${name}" criado (mock). Em produção seria salvo no CRM.`, "✅ Criado");
          }}><Icon name="plus" size={13}/> {t.new_lead}</button>
        </div>
      </div>

      <div style={{ padding: 20 }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="table">
            <thead>
              <tr>
                <th className="table-checkbox">
                  <input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(a => a.id)) : new Set())}/>
                </th>
                <th>{t.company}</th>
                <th>{t.industry}</th>
                <th>{t.region}</th>
                <th>{t.owner}</th>
                <th style={{textAlign:"right"}}>{t.deal_value}</th>
                <th>{t.last_contact}</th>
                <th>{t.status}</th>
                <th style={{ width: 32 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const owner = REPS.find(r => r.id === a.owner);
                const ind = INDUSTRIES.find(i => i.id === a.industry);
                const accountDeals = DEALS.filter(d => d.accountId === a.id && d.stage !== "lost");
                const totalValue = accountDeals.reduce((s, d) => s + d.value, 0);
                return (
                  <tr key={a.id} onClick={() => onOpenAccount(a.id)}>
                    <td className="table-checkbox" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)}/>
                    </td>
                    <td>
                      <div className="table-name">
                        <div className="account-avatar">{a.name.split(" ").slice(0, 2).map(w => w[0]).join("")}</div>
                        <div>
                          <div>{a.name}</div>
                          <div className="text-3" style={{ fontSize: 11.5, fontWeight: 400 }}>{a.city} · {a.employees} colab.</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge">{ind[lang]}</span></td>
                    <td>{a.region}</td>
                    <td>
                      <div className="row gap-2">
                        <Avatar user={owner} size={22}/>
                        <span style={{ fontSize: 12.5 }}>{owner.name.split(" ")[0]}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>
                      {totalValue > 0 ? fmtBRL(totalValue, { abbr: true }) : <span className="text-3">—</span>}
                    </td>
                    <td>
                      <span className="text-2" style={{ fontSize: 12.5 }}>
                        {a.lastContact === 0 ? "hoje" : `há ${a.lastContact} d`}
                      </span>
                    </td>
                    <td>
                      {a.inactive ? <span className="badge badge-danger"><span className="dot"/> Inativo</span>
                       : a.customer ? <span className="badge badge-success"><span className="dot"/> Cliente</span>
                       : <span className="badge badge-info"><span className="dot"/> Lead</span>}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="icon-btn"><Icon name="more" size={14}/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// ============================================================
// Account detail
// ============================================================
const AccountDetail = ({ accountId, t, lang, onBack, onMessage }) => {
  const acc = ACCOUNTS.find(a => a.id === accountId);
  const owner = REPS.find(r => r.id === acc.owner);
  const ind = INDUSTRIES.find(i => i.id === acc.industry);
  const deals = DEALS.filter(d => d.accountId === acc.id);
  const totalValue = deals.filter(d => d.stage !== "lost").reduce((s, d) => s + d.value, 0);
  const [tab, setTab] = React.useState("overview");

  const tabs = [
    { id: "overview", label: t.overview, icon: "home" },
    { id: "activities", label: t.activities, icon: "calendar" },
    { id: "proposals", label: t.proposals, icon: "document" },
    { id: "behavior", label: t.buying_behavior, icon: "chart" },
    { id: "contract", label: t.contract, icon: "file" },
    { id: "contacts", label: t.contacts, icon: "users" },
    { id: "stakeholders", label: "Stakeholders", icon: "users" },
  ];

  return (
    <>
      <div className="detail-hero">
        <button className="btn btn-sm btn-ghost mb-2" onClick={onBack}>
          <Icon name="arrow_left" size={13}/> {t.accounts}
        </button>
        <div className="row gap-4" style={{ alignItems: "flex-start" }}>
          <div className="account-avatar" style={{ width: 64, height: 64, borderRadius: 16, fontSize: 22 }}>
            {acc.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
          </div>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="row gap-2 mb-2" style={{ flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em" }}>{acc.name}</h1>
              {acc.inactive
                ? <span className="badge badge-danger"><span className="dot"/> Inativo</span>
                : acc.customer
                  ? <span className="badge badge-success"><span className="dot"/> Cliente ativo</span>
                  : <span className="badge badge-info"><span className="dot"/> Lead qualificado</span>}
            </div>
            <div className="row gap-4 text-2" style={{ fontSize: 13, flexWrap: "wrap" }}>
              <span><Icon name="layers" size={12}/> {ind[lang]}</span>
              <span><Icon name="map" size={12}/> {acc.city}</span>
              <span><Icon name="users" size={12}/> {acc.employees} colaboradores</span>
              <span><Icon name="clock" size={12}/> {t.last_contact}: há {acc.lastContact} dias</span>
            </div>
          </div>
          <div className="row gap-2" style={{ flexShrink: 0 }}>
            <button className="btn btn-sm" onClick={() => onMessage({ accountName: acc.name, contactName: "Sandra Oliveira", initialChannel: "whatsapp" })}>
              <Icon name="message" size={13}/> WhatsApp
            </button>
            <button className="btn btn-sm" onClick={() => onMessage({ accountName: acc.name, contactName: "Sandra Oliveira", initialChannel: "email" })}>
              <Icon name="mail" size={13}/> Email
            </button>
            <button className="btn btn-sm"><Icon name="phone" size={13}/> Ligar</button>
            <button className="btn btn-sm btn-primary"><Icon name="plus" size={13}/> {t.new_deal}</button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="row gap-6 mt-6" style={{ fontSize: 12 }}>
          <Stat label="Pipeline aberto" value={fmtBRL(totalValue, { abbr: true })}/>
          <Stat label="Oportunidades" value={deals.length}/>
          <Stat label="Ticket médio" value={deals.length ? fmtBRL(totalValue / deals.length, { abbr: true }) : "—"}/>
          <Stat label="Probabilidade média" value={deals.length ? Math.round(deals.reduce((s,d)=>s+d.probability,0)/deals.length) + "%" : "—"}/>
          <Stat label={t.owner} value={
            <span className="row gap-2"><Avatar user={owner} size={18}/>{owner.name.split(" ")[0]}</span>
          }/>
        </div>
      </div>

      <div className="detail-tabs">
        {tabs.map(tb => (
          <button key={tb.id} className="detail-tab" aria-current={tab === tb.id} onClick={() => setTab(tb.id)}>
            <Icon name={tb.icon} size={13}/> {tb.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === "overview" && <DetailOverview acc={acc} deals={deals} owner={owner} t={t} lang={lang} onMessage={onMessage}/>}
        {tab === "activities" && <DetailActivities acc={acc} t={t}/>}
        {tab === "proposals" && <DetailProposals deals={deals} t={t}/>}
        {tab === "behavior" && <DetailBehavior acc={acc} t={t}/>}
        {tab === "contract" && <DetailContract acc={acc} t={t}/>}
        {tab === "contacts" && <DetailContacts acc={acc} t={t} onMessage={onMessage}/>}
        {tab === "stakeholders" && <DetailStakeholders acc={acc}/>}
      </div>
    </>
  );
};

const Stat = ({ label, value }) => (
  <div>
    <div className="text-3" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{value}</div>
  </div>
);

const DetailOverview = ({ acc, deals, owner, t, lang }) => (
  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
    <div className="col gap-4">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Oportunidades</div>
          <span className="text-3" style={{ marginLeft: "auto", fontSize: 12 }}>{deals.length} registros</span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Oportunidade</th>
              <th>{t.stage}</th>
              <th style={{textAlign:"right"}}>{t.deal_value}</th>
              <th>{t.probability}</th>
              <th>{t.expected_close}</th>
            </tr>
          </thead>
          <tbody>
            {deals.map(d => {
              const stage = STAGES.find(s => s.id === d.stage) || STAGES[0];
              return (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>
                    <span className="badge" style={{ background: "transparent", color: stage.color, padding: 0, fontWeight: 700 }}>
                      <span className={"dot " + stage.dotClass}/>{t.stages[d.stage]}
                    </span>
                  </td>
                  <td style={{textAlign:"right", fontWeight:700}}>{fmtBRL(d.value, { abbr: true })}</td>
                  <td>
                    <div className="row gap-2">
                      <div className="progress" style={{ width: 60 }}><span style={{ width: `${d.probability}%` }}/></div>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{d.probability}%</span>
                    </div>
                  </td>
                  <td className="text-2">{d.closeIn < 0 ? "fechado" : `em ${d.closeIn} dias`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Política comercial aplicada</div></div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <PolicyRow label="Abrangência" value={`Canal direto · ${acc.region}`}/>
          <PolicyRow label="Conflito c/ representante" value="Acordo de comissão 60/40"/>
          <PolicyRow label="Desconto máximo" value="12% (autorização sup.)"/>
          <PolicyRow label="Prazo de pagamento" value="30/60/90 dias"/>
          <PolicyRow label="Prazo de inatividade" value="21 dias sem contato"/>
          <PolicyRow label="SLA de proposta" value="48h após qualificação"/>
        </div>
      </div>
    </div>

    <div className="col gap-4">
      <div className="card">
        <div className="card-header"><div className="card-title">Próximas ações</div></div>
        <div style={{ padding: "8px 0" }}>
          <NextAction icon="phone" title="Ligar para Sandra (Compras)" when="Hoje, 14:30" rep={owner}/>
          <NextAction icon="mail" title="Enviar proposta revisada" when="Amanhã, 09:00" rep={owner}/>
          <NextAction icon="calendar" title="Demo técnica equipe TI" when="Sex, 15:00" rep={owner}/>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Detalhes</div></div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12, fontSize: 13 }}>
          <KeyValue k="Site" v="www.empresa.com.br"/>
          <KeyValue k="CNPJ" v="12.345.678/0001-90"/>
          <KeyValue k="Receita anual" v="R$ 240M"/>
          <KeyValue k="Origem" v="Indicação"/>
          <KeyValue k="Criado em" v="14/abr/2026"/>
          <KeyValue k={t.owner} v={<span className="row gap-2"><Avatar user={owner} size={18}/>{owner.name}</span>}/>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><div className="card-title">Equipe envolvida</div></div>
        <div style={{ padding: 16 }}>
          <AvatarStack users={REPS.slice(0, 4)} size={32}/>
        </div>
      </div>
    </div>
  </div>
);

const PolicyRow = ({ label, value }) => (
  <div>
    <div className="text-3" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{value}</div>
  </div>
);

const NextAction = ({ icon, title, when, rep }) => (
  <div className="feed-item" style={{ padding: "10px 16px" }}>
    <div className="feed-icon brand"><Icon name={icon} size={13}/></div>
    <div className="flex-1">
      <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
      <div className="text-3" style={{ fontSize: 11.5 }}>{when}</div>
    </div>
    <Avatar user={rep} size={22}/>
  </div>
);

const KeyValue = ({ k, v }) => (
  <div className="row" style={{ justifyContent: "space-between" }}>
    <span className="text-3">{k}</span>
    <span style={{ fontWeight: 600 }}>{v}</span>
  </div>
);

const DetailActivities = ({ acc, t }) => {
  const items = [
    { t:"meeting", title:"Reunião de descoberta com Diretor Comercial", d:"hoje, 10:00", desc:"Mapeamos o canal atual de representantes e dores de cobertura. Próximo passo: enviar diagnóstico." },
    { t:"call",    title:"Call de follow-up com Sandra (Compras)",       d:"ontem, 16:30", desc:"Cliente confirmou interesse na implantação de inside sales para a linha B2B." },
    { t:"email",   title:"Email: agenda para visita técnica",             d:"há 3 dias", desc:"Enviado para sandra@empresa.com.br · respondido em 2h." },
    { t:"note",    title:"Nota: necessidades identificadas",              d:"há 5 dias", desc:"Faturamento 2025: R$ 240M. Equipe comercial: 8 representantes. Sem time interno." },
    { t:"stage",   title:"Movido para Qualificado",                       d:"há 1 semana", desc:"Após validação BANT pelo Camila Reis." },
  ];
  const iconMap = { call: "phone", email: "mail", meeting: "calendar", stage: "layers", note: "document" };
  return (
    <div style={{ maxWidth: 720 }}>
      <div className="card mb-4">
        <div className="card-header"><div className="card-title">Nova atividade</div></div>
        <div style={{ padding: 16 }}>
          <div className="row gap-2 mb-2">
            <button className="btn btn-sm"><Icon name="phone" size={13}/> Ligação</button>
            <button className="btn btn-sm"><Icon name="mail" size={13}/> Email</button>
            <button className="btn btn-sm"><Icon name="calendar" size={13}/> Reunião</button>
            <button className="btn btn-sm"><Icon name="document" size={13}/> Nota</button>
          </div>
          <textarea className="input" rows={2} style={{ height: "auto", padding: 10, resize: "vertical" }}
                    placeholder="Registre o que aconteceu nesta interação..."/>
        </div>
      </div>
      {items.map((a, i) => (
        <div key={i} className="feed-item card mb-2" style={{ borderRadius: 12 }}>
          <div className="feed-icon brand"><Icon name={iconMap[a.t]} size={14}/></div>
          <div className="flex-1">
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{a.title}</div>
            <div className="text-3" style={{ fontSize: 11.5, marginTop: 2 }}>{a.d}</div>
            <div className="text-2 mt-2" style={{ fontSize: 13 }}>{a.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const DetailProposals = ({ deals }) => (
  <div style={{ maxWidth: 760 }}>
    {deals.map(d => (
      <div key={d.id} className="card mb-2" style={{ padding: 16 }}>
        <div className="row gap-3">
          <div className="feed-icon brand" style={{ width: 40, height: 40 }}><Icon name="file" size={18}/></div>
          <div className="flex-1">
            <div style={{ fontWeight: 700 }}>Proposta — {d.name}</div>
            <div className="text-3" style={{ fontSize: 12 }}>v2 · enviado em 14/mai · vista 6 vezes</div>
          </div>
          <div className="row gap-2">
            <span className="badge badge-brand">{fmtBRL(d.value, { abbr: true })}</span>
            <button className="btn btn-sm btn-ghost"><Icon name="more" size={13}/></button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DetailBehavior = ({ acc, t }) => {
  const max = Math.max(...BUYING_HISTORY.map(b => b.value));
  return (
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">{t.buying_behavior}</div>
            <div className="card-sub">Pedidos e ticket médio nos últimos 6 meses</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <svg viewBox="0 0 600 240" width="100%" style={{ height: "auto" }}>
            <defs>
              <linearGradient id="bb-bar" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#2EBFC5"/>
                <stop offset="100%" stopColor="#3F5BA8"/>
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(p => (
              <line key={p} x1="40" x2="600" y1={20 + p * 180} y2={20 + p * 180} stroke="var(--border)" strokeDasharray="2 4"/>
            ))}
            {BUYING_HISTORY.map((b, i) => {
              const w = 60;
              const x = 60 + i * 90;
              const h = (b.value / max) * 180;
              const y = 200 - h;
              return (
                <g key={b.month}>
                  <rect x={x} y={y} width={w} height={h} rx="6" fill="url(#bb-bar)"/>
                  <text x={x + w/2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">{b.value}k</text>
                  <text x={x + w/2} y={220} textAnchor="middle" fontSize="11" fill="var(--text-3)">{b.month}</text>
                  <text x={x + w/2} y={234} textAnchor="middle" fontSize="10" fill="var(--text-3)">{b.orders} ped.</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="col gap-3">
        <div className="card card-pad">
          <div className="text-3" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Padrão de compra</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>Mensal recorrente</div>
          <div className="text-2 mt-2" style={{ fontSize: 12.5 }}>Cliente compra todo mês, com pico em novembro/dezembro.</div>
        </div>
        <div className="card card-pad">
          <div className="text-3" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticket médio</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>R$ 118k</div>
          <div className="kpi-delta up" style={{ marginTop: 4 }}><Icon name="arrow_up" size={12}/> +24% YoY</div>
        </div>
        <div className="card card-pad">
          <div className="text-3" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risco de churn</div>
          <div className="row gap-2 mt-2">
            <div className="progress" style={{ flex: 1 }}><span style={{ width: "18%", background: "var(--success)" }}/></div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--success)" }}>Baixo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailContract = ({ acc }) => (
  <div style={{ maxWidth: 720 }}>
    <div className="card card-pad mb-4">
      <div className="row gap-3">
        <div className="feed-icon brand" style={{ width: 44, height: 44 }}><Icon name="file" size={20}/></div>
        <div className="flex-1">
          <div style={{ fontWeight: 700, fontSize: 15 }}>Contrato de Implantação — Canal Interno de Vendas</div>
          <div className="text-3" style={{ fontSize: 12, marginTop: 2 }}>vigência: 01/jan/2026 — 31/dez/2026 · renovação automática</div>
        </div>
        <span className="badge badge-success"><span className="dot"/> Ativo</span>
      </div>
      <div className="divider"/>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <KeyValue k="Valor mensal" v="R$ 38.500"/>
        <KeyValue k="Comissão variável" v="2,4% s/ faturamento"/>
        <KeyValue k="Reajuste" v="IPCA anual"/>
        <KeyValue k="Multa rescisória" v="3 mensalidades"/>
        <KeyValue k="Aviso prévio" v="60 dias"/>
        <KeyValue k="Exclusividade" v="Sim, vertical"/>
      </div>
    </div>
    <div className="card card-pad">
      <div style={{ fontWeight: 700, marginBottom: 12 }}>Histórico de aditivos</div>
      <div className="text-2" style={{ fontSize: 13, lineHeight: 1.7 }}>
        <div>• 18/mar/2026 — Inclusão de operação home office (3 SDRs)</div>
        <div>• 02/fev/2026 — Revisão de meta trimestral</div>
        <div>• 01/jan/2026 — Assinatura original</div>
      </div>
    </div>
  </div>
);

const DetailContacts = ({ acc, onMessage }) => {
  const contacts = [
    { name: "Sandra Oliveira",    role: "Gerente de Compras",    email: "sandra@empresa.com.br",  phone: "(11) 9.8132-4421", main: true,  color: "#3F5BA8" },
    { name: "Roberto Magalhães",  role: "Diretor Comercial",     email: "roberto@empresa.com.br", phone: "(11) 9.7011-8800", main: false, color: "#2EBFC5" },
    { name: "Patrícia Lemos",     role: "Coord. Operações",      email: "patricia@empresa.com.br",phone: "(11) 9.5520-1199", main: false, color: "#D88514" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14, maxWidth: 940 }}>
      {contacts.map(c => (
        <div key={c.name} className="card card-pad">
          <div className="row gap-3 mb-2">
            <div className="av" style={{
              width: 40, height: 40, borderRadius: "50%", background: c.color, color: "white",
              fontWeight: 700, fontSize: 14, display: "grid", placeItems: "center"
            }}>{c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
            <div className="flex-1">
              <div style={{ fontWeight: 700 }}>{c.name}</div>
              <div className="text-3" style={{ fontSize: 12 }}>{c.role}</div>
            </div>
            {c.main && <span className="badge badge-brand">Principal</span>}
          </div>
          <div className="col gap-1 text-2" style={{ fontSize: 13 }}>
            <div className="row gap-2"><Icon name="mail" size={12}/> {c.email}</div>
            <div className="row gap-2"><Icon name="phone" size={12}/> {c.phone}</div>
          </div>
          <div className="row gap-2 mt-2">
            <button className="btn btn-sm flex-1" style={{ justifyContent: "center" }}
                    onClick={() => onMessage && onMessage({ accountName: acc.name, contactName: c.name, phone: c.phone, email: c.email, initialChannel: "whatsapp" })}>
              <Icon name="message" size={12}/> WhatsApp
            </button>
            <button className="btn btn-sm flex-1" style={{ justifyContent: "center" }}
                    onClick={() => onMessage && onMessage({ accountName: acc.name, contactName: c.name, phone: c.phone, email: c.email, initialChannel: "email" })}>
              <Icon name="mail" size={12}/> Email
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// Schedule (week view)
// ============================================================
const Schedule = ({ t, lang }) => {
  const days = [
    { id: "seg", label: "SEG", date: 19 },
    { id: "ter", label: "TER", date: 20 },
    { id: "qua", label: "QUA", date: 21 },
    { id: "qui", label: "QUI", date: 22 },
    { id: "sex", label: "SEX", date: 23 },
  ];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
  // Cada evento ganha um id estável para podermos movê-lo
  const [events, setEvents] = React.useState(() => UPCOMING.map((e, i) => ({ ...e, id: e.id || "ev_" + i })));
  const [dragId, setDragId] = React.useState(null);
  const [hoverSlot, setHoverSlot] = React.useState(null);

  const onDragStart = (id) => setDragId(id);
  const onDragOver = (e, day, hour) => { e.preventDefault(); setHoverSlot(day + "_" + hour); };
  const onDrop = (day, hour) => {
    if (!dragId) return;
    setEvents(evs => evs.map(ev => ev.id === dragId
      ? { ...ev, day, time: hour.toString().padStart(2, "0") + ":00" }
      : ev));
    setDragId(null); setHoverSlot(null);
  };

  return (
    <>
      <div className="filters">
        <div className="row gap-2">
          <button className="btn btn-sm btn-ghost"><Icon name="arrow_left" size={13}/></button>
          <button className="btn btn-sm">{t.today}</button>
          <button className="btn btn-sm btn-ghost"><Icon name="arrow_right" size={13}/></button>
        </div>
        <div style={{ fontWeight: 700, marginLeft: 8 }}>Maio 2026 · Semana 21</div>
        <div className="toggle-group" style={{ marginLeft: 16 }}>
          <button>Dia</button>
          <button aria-current="true">{t.week}</button>
          <button>{t.month}</button>
        </div>
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <span className="badge"><span className="dot" style={{ background: "var(--brand-teal)" }}/> Ligação</span>
          <span className="badge"><span className="dot" style={{ background: "var(--brand-blue)" }}/> Reunião</span>
          <span className="badge"><span className="dot" style={{ background: "var(--success)" }}/> Fechamento</span>
          <span className="badge"><span className="dot" style={{ background: "var(--warning)" }}/> Reativação</span>
          <button className="btn btn-sm btn-primary"><Icon name="plus" size={13}/> Novo evento</button>
        </div>
      </div>

      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, height: "calc(100% - 56px)" }}>
        <div className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div className="cal-grid">
            <div className="cal-head"></div>
            {days.map(d => (
              <div key={d.id} className="cal-head" style={{ background: d.date === 21 ? "var(--brand-grad-soft)" : "transparent" }}>
                {d.label} <span style={{ fontWeight: 800, color: d.date === 21 ? "var(--brand-blue)" : "var(--text)" }}>{d.date}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div className="cal-grid">
              {hours.map(h => (
                <React.Fragment key={h}>
                  <div className="cal-time">{h.toString().padStart(2, "0")}:00</div>
                  {days.map(d => {
                    const slotEvents = events.filter(e => e.day === d.id && parseInt(e.time) === h);
                    const isHover = hoverSlot === d.id + "_" + h;
                    return (
                      <div key={d.id + h} className="cal-cell"
                           onDragOver={(e) => onDragOver(e, d.id, h)}
                           onDrop={() => onDrop(d.id, h)}
                           style={isHover ? { background: "var(--brand-grad-soft)", outline: "2px dashed var(--brand-teal)" } : {}}>
                        {slotEvents.map((e) => (
                          <div key={e.id} className={"cal-event " + (e.color || "")}
                               draggable
                               onDragStart={() => onDragStart(e.id)}
                               style={{ cursor: "grab", opacity: dragId === e.id ? 0.5 : 1 }}
                               title="Arraste para mover">
                            {e.time} · {e.title}
                            <small>{e.rep}</small>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="col gap-4" style={{ overflowY: "auto" }}>
          <div className="card">
            <div className="card-header"><div className="card-title">Hoje · 21 mai</div></div>
            <div>
              {events.filter(e => e.day === "qua").map((e, i) => (
                <div key={i} className="feed-item">
                  <div className={"feed-icon " + (e.color === "warn" ? "" : "brand")}>
                    <Icon name={e.type === "call" ? "phone" : "calendar"} size={13}/>
                  </div>
                  <div className="flex-1">
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{e.title}</div>
                    <div className="text-3" style={{ fontSize: 11.5 }}>{e.time} · {e.rep}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-header"><div className="card-title">Pendências</div></div>
            <div>
              {[
                { t: "Enviar proposta revisada", who: "QuímicaTech", overdue: true },
                { t: "Follow-up pós-demo", who: "PolyBrasil", overdue: false },
                { t: "Confirmar reunião quinta", who: "SulCarne", overdue: false },
                { t: "Reativar contato", who: "Cipriani", overdue: true },
              ].map((p, i) => (
                <div key={i} className="feed-item">
                  <input type="checkbox" style={{ accentColor: "var(--brand-teal)" }}/>
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.t}</div>
                    <div className="text-3" style={{ fontSize: 11.5 }}>{p.who}</div>
                  </div>
                  {p.overdue && <span className="badge badge-danger" style={{ fontSize: 10 }}>atrasado</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ============================================================
// Mapa de Stakeholders — papéis de decisão dentro da conta
// ============================================================
const DetailStakeholders = ({ acc }) => {
  const _h = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };
  const h = _h(acc.id);
  const NOMES = ["Carlos Mendes", "Mariana Souza", "Patrícia Lima", "Rafael Tavares", "Eduardo Mello", "Beatriz Costa", "Lucas Faria", "Ana Beatriz"];
  const CARGOS = ["Diretor Industrial", "Gerente de Compras", "CEO", "Coord. de Suprimentos", "Eng. de Processos", "Analista de Compras"];
  const PAPEIS = [
    { id: "campeao",   label: "🏆 Campeão",      cor: "#16A07C", desc: "Defende internamente sua solução" },
    { id: "decisor",   label: "👑 Decisor",      cor: "#3F5BA8", desc: "Assina o contrato" },
    { id: "tecnico",   label: "🔧 Avaliador Técnico", cor: "#2EBFC5", desc: "Valida especificações" },
    { id: "usuario",   label: "👤 Usuário Final", cor: "#7B5BC8", desc: "Vai operar a solução" },
    { id: "bloqueador",label: "🚧 Bloqueador",   cor: "#D63B5C", desc: "Resistente à mudança" },
  ];
  const SENTIMENTOS = ["😊 Apoia", "😐 Neutro", "😠 Resiste"];

  const stakeholders = Array.from({ length: 6 }, (_, i) => ({
    nome: NOMES[(h + i * 5) % NOMES.length],
    cargo: CARGOS[(h + i * 3) % CARGOS.length],
    papel: PAPEIS[i % PAPEIS.length],
    influencia: 30 + ((h >> i) % 70), // 30-100
    sentimento: SENTIMENTOS[(h + i * 2) % 3],
    lastTouch: ((h >> (i + 1)) % 60) + 1, // dias
  }));

  const apoiadores = stakeholders.filter(s => s.sentimento.includes("Apoia")).length;
  const resistentes = stakeholders.filter(s => s.sentimento.includes("Resiste")).length;
  const campeao = stakeholders.find(s => s.papel.id === "campeao");

  return (
    <div className="col gap-3">
      <div className="row gap-3" style={{ flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 14, flex: 1, minWidth: 200, borderLeft: "4px solid #16A07C" }}>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Apoiadores</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#16A07C" }}>{apoiadores}</div>
        </div>
        <div className="card" style={{ padding: 14, flex: 1, minWidth: 200, borderLeft: "4px solid #D63B5C" }}>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Resistentes</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#D63B5C" }}>{resistentes}</div>
        </div>
        <div className="card" style={{ padding: 14, flex: 2, minWidth: 240, borderLeft: "4px solid #3F5BA8" }}>
          <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>Campeão identificado</div>
          <div style={{ fontSize: 16, fontWeight: 800, marginTop: 2 }}>{campeao ? campeao.nome : "❌ Nenhum"}</div>
          {campeao && <div className="text-3" style={{ fontSize: 12 }}>{campeao.cargo}</div>}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <Icon name="users" size={14}/>
          <div className="card-title">Mapa de Decisão ({stakeholders.length} pessoas)</div>
          <button className="btn btn-sm" style={{ marginLeft: "auto" }}
                  onClick={() => vozzAlert("Em breve: cadastrar stakeholders manualmente.", "Adicionar stakeholder")}>
            <Icon name="plus" size={12}/> Adicionar
          </button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Pessoa</th>
              <th>Papel</th>
              <th>Sentimento</th>
              <th>Influência</th>
              <th>Último contato</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stakeholders.sort((a, b) => b.influencia - a.influencia).map((s, i) => (
              <tr key={i}>
                <td>
                  <div style={{ fontWeight: 700 }}>{s.nome}</div>
                  <div className="text-3" style={{ fontSize: 11 }}>{s.cargo}</div>
                </td>
                <td>
                  <span className="badge" style={{ background: s.papel.cor + "22", color: s.papel.cor, fontWeight: 700 }}>
                    {s.papel.label}
                  </span>
                  <div className="text-3" style={{ fontSize: 10.5, marginTop: 2 }}>{s.papel.desc}</div>
                </td>
                <td><span style={{ fontWeight: 600, fontSize: 13 }}>{s.sentimento}</span></td>
                <td style={{ width: 180 }}>
                  <div style={{ background: "var(--surface-2)", height: 8, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      width: s.influencia + "%", height: "100%",
                      background: s.influencia >= 70 ? "#D88514" : s.influencia >= 40 ? "#3F5BA8" : "#8A8899",
                    }}/>
                  </div>
                  <div className="text-3" style={{ fontSize: 11, marginTop: 2 }}>{s.influencia}/100</div>
                </td>
                <td className="text-2">{s.lastTouch}d atrás</td>
                <td>
                  <button className="btn btn-sm" onClick={() => vozzAlert(`Convite enviado para ${s.nome} (${s.cargo}).`, "📅 Reunião agendada")}>
                    <Icon name="calendar" size={12}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-3" style={{ padding: 12, fontSize: 11.5 }}>
          💡 Em B2B industrial, a média é de <b>6–10 decisores</b>. Identificar o Campeão e neutralizar Bloqueadores são os 2 movimentos mais importantes.
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Accounts, AccountDetail, Schedule });
