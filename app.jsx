// ============================================================
// VOZZ CRM — App shell
// ============================================================

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "radius": 14,
  "density": "comfortable",
  "lang": "pt"
}/*EDITMODE-END*/;

function App() {
  const [t0, setTweak] = (typeof useTweaks === "function")
    ? useTweaks(TWEAK_DEFAULTS)
    : [TWEAK_DEFAULTS, () => {}];

  const [route, setRoute] = React.useState("dashboard");
  const [accountId, setAccountId] = React.useState(null);
  const [lang, setLang] = React.useState(t0.lang || "pt");
  const [msgContext, setMsgContext] = React.useState(null);
  const [showNotif, setShowNotif] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const NOTIFICATIONS = [
    { id: "n1", title: "MetalForma Indústria", desc: "Proposta aceita — agendar kickoff", time: "agora" },
    { id: "n2", title: "Tecidos Cipriani",    desc: "28 dias sem contato — risco de churn", time: "2h" },
    { id: "n3", title: "Calçados Novo Horizonte", desc: "Reunião confirmada para amanhã 14h", time: "hoje" },
    { id: "n4", title: "Frigorífico SulCarne", desc: "Pagamento da fatura #4821 confirmado", time: "ontem" },
  ];
  const T = I18N[lang];
  const openMessage = (ctx) => setMsgContext(ctx || { accountName: "Lead Vozz" });

  // Theme + radius (sync to <html>)
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", t0.theme);
    const r = t0.radius;
    document.documentElement.style.setProperty("--r-lg", `${r}px`);
    document.documentElement.style.setProperty("--r-md", `${Math.max(4, r - 4)}px`);
    document.documentElement.style.setProperty("--r-xl", `${r + 6}px`);
    document.documentElement.style.setProperty("--r-2xl", `${r + 14}px`);
  }, [t0.theme, t0.radius]);

  React.useEffect(() => { if (setTweak) setTweak("lang", lang); }, [lang]);

  const navItems = [
    { id: "dashboard", icon: "home",     label: T.dashboard },
    { id: "pipeline",  icon: "pipeline", label: T.pipeline,  count: DEALS.filter(d=>d.stage!=="won"&&d.stage!=="lost").length },
    { id: "accounts",  icon: "inbox",    label: T.accounts,  count: ACCOUNTS.length },
    { id: "schedule",  icon: "calendar", label: T.schedule,  count: 7 },
    { id: "routes",    icon: "map",      label: T.routing,   count: ACCOUNTS.filter(a => a.inactive).length },
  ];
  const insightItems = [
    { id: "reports",  icon: "chart",    label: T.reports },
    { id: "rfv",      icon: "sparkles", label: "RFV · Carteira" },
    { id: "channel",  icon: "handshake",label: "Canal Misto" },
    { id: "coverage", icon: "globe",    label: T.coverage },
    { id: "team",     icon: "users",    label: T.team },
  ];
  const opsItems = [
    { id: "catalog",  icon: "layers",   label: T.catalog,   count: PRODUCTS.length },
    { id: "quote",    icon: "file",     label: "Simulador de Pedidos" },
    { id: "checkin",  icon: "target",   label: "Check-in de Visitas" },
    { id: "settings", icon: "settings", label: T.settings },
  ];

  const openAccount = (id) => {
    setAccountId(id);
    setRoute("detail");
  };

  const renderScreen = () => {
    switch (route) {
      case "dashboard": return <Dashboard t={T} lang={lang} onOpenAccount={openAccount}/>;
      case "pipeline":  return <Pipeline  t={T} lang={lang} onOpenAccount={openAccount} density={t0.density}/>;
      case "accounts":  return <Accounts  t={T} lang={lang} onOpenAccount={openAccount}/>;
      case "schedule":  return <Schedule  t={T} lang={lang}/>;
      case "reports":   return <Reports   t={T} lang={lang}/>;
      case "team":      return <Team      t={T}/>;
      case "coverage":  return <Coverage  t={T} lang={lang}/>;
      case "rfv":       return <InsightsRFV t={T} lang={lang}/>;
      case "checkin":   return <CheckIn t={T} lang={lang}/>;
      case "quote":     return <Quote   t={T} lang={lang}/>;
      case "channel":   return <Channel t={T} lang={lang}/>;
      case "routes":    return <Routes    t={T} lang={lang}/>;
      case "catalog":   return <Catalog   t={T} lang={lang}/>;
      case "settings":  return <Settings  t={T}/>;
      case "detail":    return <AccountDetail accountId={accountId} t={T} lang={lang} onBack={() => setRoute("accounts")} onMessage={openMessage}/>;
      default:          return null;
    }
  };

  // Topbar title
  const titleByRoute = {
    dashboard: T.dashboard,
    pipeline: T.pipeline,
    accounts: T.accounts,
    schedule: T.schedule,
    reports: T.reports,
    coverage: T.coverage,
    rfv:      "RFV · Carteira",
    checkin:  "Check-in de Visitas",
    quote:    "Simulador de Pedidos",
    channel:  "Canal Misto",
    routes: T.routing,
    catalog: T.catalog,
    team: T.team,
    settings: T.settings,
    detail: T.accounts,
  };

  // Routes with their own internal padding/scroll
  const flushRoutes = ["pipeline", "accounts", "schedule", "detail"];

  const flush = flushRoutes.includes(route);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ justifyContent: "center", padding: "20px 14px 18px" }}>
          <img src="assets/vozz-logo.png" alt="Vozz — The Sales Journey"
               style={{ height: 76, width: "auto", display: "block", margin: "0 auto" }}/>
        </div>
        <div className="sidebar-search">
          <Icon name="search" size={14}/>
          <input placeholder={T.search_placeholder}/>
          <kbd>⌘K</kbd>
        </div>
        <div className="sidebar-section-label">{T.main}</div>
        <nav className="sidebar-nav">
          {navItems.map(n => (
            <button key={n.id} className="sidebar-nav-item" aria-current={route === n.id}
                    onClick={() => setRoute(n.id)}>
              <Icon name={n.icon}/> {n.label}
              {n.count != null && <span className="count">{n.count}</span>}
            </button>
          ))}
          <div className="sidebar-section-label">{T.insights}</div>
          {insightItems.map(n => (
            <button key={n.id} className="sidebar-nav-item" aria-current={route === n.id}
                    onClick={() => setRoute(n.id)}>
              <Icon name={n.icon}/> {n.label}
            </button>
          ))}
          <div className="sidebar-section-label">{T.operation}</div>
          {opsItems.map(n => (
            <button key={n.id} className="sidebar-nav-item" aria-current={route === n.id}
                    onClick={() => setRoute(n.id)}>
              <Icon name={n.icon}/> {n.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">CR</div>
            <div className="flex-1">
              <div className="sidebar-user-name">Camila Reis</div>
              <div className="sidebar-user-role">Coord. Comercial</div>
            </div>
            <button className="icon-btn" title="Sair"
                    onClick={() => { window.location.href = "Login.html"; }}>
              <Icon name="more" size={14}/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div className="topbar-crumbs">
            <span>Workspace</span>
            <span className="sep">/</span>
            <span style={{ color: "var(--text)", fontWeight: 600 }}>{titleByRoute[route]}</span>
            {route === "detail" && accountId && (
              <>
                <span className="sep">/</span>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>
                  {ACCOUNTS.find(a => a.id === accountId)?.name}
                </span>
              </>
            )}
          </div>
          <div className="topbar-actions">
            <div className="toggle-group">
              <button aria-current={lang === "pt"} onClick={() => setLang("pt")}>PT</button>
              <button aria-current={lang === "en"} onClick={() => setLang("en")}>EN</button>
            </div>
            <button className="icon-btn"
                    title={t0.theme === "dark" ? "Modo claro" : "Modo escuro"}
                    onClick={() => setTweak && setTweak("theme", t0.theme === "dark" ? "light" : "dark")}>
              <Icon name={t0.theme === "dark" ? "sun" : "moon"} size={16}/>
            </button>
            <div style={{ position: "relative" }}>
              <button className="icon-btn" onClick={() => setShowNotif(s => !s)} title="Notificações">
                <Icon name="bell" size={16}/>
                <span style={{
                  position: "absolute", top: 4, right: 4,
                  background: "#D63B5C", color: "#fff", borderRadius: 99,
                  fontSize: 9, fontWeight: 800, padding: "1px 5px", lineHeight: 1.2,
                }}>{NOTIFICATIONS.length}</span>
              </button>
              {showNotif && (
                <>
                  <div onClick={() => setShowNotif(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }}/>
                  <div className="card" style={{
                    position: "absolute", right: 0, top: "calc(100% + 8px)",
                    width: 340, zIndex: 50, padding: 0,
                    boxShadow: "0 12px 40px rgba(0,0,0,.18)",
                  }}>
                    <div className="card-header"><div className="card-title">Notificações</div></div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {NOTIFICATIONS.map(n => (
                        <div key={n.id} className="feed-item" style={{ alignItems: "flex-start" }}>
                          <div className="feed-icon brand"><Icon name="bell" size={13}/></div>
                          <div className="flex-1">
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div>
                            <div className="text-3" style={{ fontSize: 12 }}>{n.desc}</div>
                            <div className="text-3" style={{ fontSize: 11, marginTop: 2 }}>{n.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
            <button className="icon-btn" onClick={() => setRoute("settings")} title="Configurações">
              <Icon name="settings" size={16}/>
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setShowNew(true)}>
              <Icon name="plus" size={13}/> {T.new}
            </button>
          </div>
        </header>
        <section className={"content " + (flush ? "flush" : "")}>
          {renderScreen()}
        </section>
      </main>

      <DialogHost/>

      {msgContext && (
        <MessageModal {...msgContext} onClose={() => setMsgContext(null)}/>
      )}

      {showNew && (
        <div onClick={() => setShowNew(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
          zIndex: 100, display: "grid", placeItems: "center",
        }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ width: 420, padding: 0 }}>
            <div className="card-header"><div className="card-title">Criar novo</div></div>
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { id: "accounts", icon: "inbox",    label: "Cliente / Conta" },
                { id: "pipeline", icon: "pipeline", label: "Negócio" },
                { id: "schedule", icon: "calendar", label: "Atividade" },
                { id: "routes",   icon: "map",      label: "Rota do dia" },
              ].map(opt => (
                <button key={opt.id} className="btn"
                        onClick={() => { setShowNew(false); setRoute(opt.id); }}
                        style={{ flexDirection: "column", height: 90, gap: 6 }}>
                  <Icon name={opt.icon} size={20}/>
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tweaks panel */}
      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Aparência">
            <TweakRadio
              label="Tema"
              value={t0.theme}
              onChange={(v) => setTweak("theme", v)}
              options={[
                { value: "light", label: "Claro" },
                { value: "dark", label: "Escuro" },
              ]}
            />
            <TweakSlider
              label="Raio"
              value={t0.radius}
              min={4} max={24} step={2}
              unit="px"
              onChange={(v) => setTweak("radius", v)}
            />
          </TweakSection>
          <TweakSection label="Pipeline">
            <TweakRadio
              label="Densidade"
              value={t0.density}
              onChange={(v) => setTweak("density", v)}
              options={[
                { value: "compact", label: "Compacto" },
                { value: "comfortable", label: "Padrão" },
                { value: "cozy", label: "Amplo" },
              ]}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App/>);
