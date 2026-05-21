// ============================================================
// VOZZ CRM — Insights RFV (Recência · Frequência · Valor)
// Implementa o cálculo do dashboard RFV de Vendas Internas:
// Score RFV, categorias (Ativo/Alerta/Inativo/First Buy), carteira livre,
// e a Matriz RFV com as 5 personas (Estrelas, Vacas Leiteiras,
// Pintinhos, Borboletas, Caracóis).
// ============================================================

// ----- Helpers de cálculo (espelha o script de produção) -----
const _hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };

// Deriva dados RFV sintéticos por conta a partir do `lastContact` (recência)
// e de um hash determinístico do id (frequência e valor estáveis entre renders)
// Distribui clientes em todas as faixas (1-30, 31-60, 61-90, 91-120, 121-365, 366-752, +752)
// para que TODAS as categorias tenham representantes na demo.
const _faixas = [15, 45, 75, 105, 200, 500, 900];
const buildRfvDataset = () => ACCOUNTS.map((a, idx) => {
  const h = _hash(a.id);
  const faixa = _faixas[idx % _faixas.length];
  const recencia = faixa + (h % 10);              // distribui em todas as bandas
  const qtdPedidos = (h % 18);                    // 0..17 pedidos
  const valor = ((h >> 3) % 600) + 20;            // R$ 20k .. 620k
  const qtdProdutos = (h % 12) + 1;
  // First Buy = ~1 a cada 7 clientes (1ª compra recente)
  const primeiraCompraDias = (idx % 7 === 0) ? (h % 40) + 5 : recencia + ((h >> 5) % 600);
  return { ...a, recencia, qtdPedidos, valor, qtdProdutos, primeiraCompraDias };
});

// Nota R (Recência) — quanto mais recente, melhor
const notaR = (d) => d == null ? 0 : d <= 30 ? 5 : d <= 60 ? 4 : d <= 90 ? 3 : d <= 120 ? 2 : 1;
// Nota F (Frequência) — número de pedidos no período
const notaF = (p) => p > 12 ? 5 : p >= 7 ? 4 : p >= 4 ? 3 : p >= 2 ? 2 : 1;
// Nota V (Valor) — comparado aos percentis da base
const percentis = (vals) => {
  const s = vals.filter(v => v > 0).sort((a, b) => a - b);
  const at = (p) => s[Math.floor(s.length * p)] || 0;
  return { p10: at(0.10), p40: at(0.40), p70: at(0.70), p90: at(0.90) };
};
const notaV = (v, p) => v >= p.p90 ? 5 : v >= p.p70 ? 4 : v >= p.p40 ? 3 : v >= p.p10 ? 2 : 1;

// Categoria de ciclo de vida
const categoria = (d, primeiraDias) => {
  if (d == null) return "Prospect";
  if (primeiraDias != null && primeiraDias <= 45) return "Novos (First Buy)";
  if (d <= 90)  return "Ativos Fidelizados";
  if (d <= 120) return "Em Alerta (Amarelo)";
  if (d <= 365) return "Inativo - Livre A";
  if (d <= 752) return "Inativo - Livre B";
  return "Inativo - Livre Z";
};

// Status da carteira (carteira livre = quem pode ser pego por outro vendedor)
const statusCarteira = (d) => {
  if (d == null) return "Prospect";
  if (d <= 90)  return "Fidelizado";
  if (d <= 120) return "Fidelizado · alerta";
  if (d <= 365) return "Carteira Livre A";
  if (d <= 752) return "Carteira Livre B";
  return "Carteira Livre Z";
};

// Matriz RFV — combina notas em 5 personas
const classifyPersona = (r, f, v) => {
  if (r === 5 && f === 5 && v === 5)               return { nome: "Estrelas",        emoji: "⭐", cor: "#D88514" };
  if (r === 5 && f === 5 && (v === 3 || v === 4)) return { nome: "Vacas Leiteiras", emoji: "🐄", cor: "#16A07C" };
  if (r === 5 && f <= 2)                          return { nome: "Pintinhos",       emoji: "🐣", cor: "#3F5BA8" };
  if (r === 2 && f === 5 && v === 5)              return { nome: "Borboletas",      emoji: "🦋", cor: "#F97316" };
  if (r <= 2 && f <= 2 && v <= 2)                 return { nome: "Caracóis",        emoji: "🐌", cor: "#6B7280" };
  if (r >= 4 && f >= 4 && v <= 4)                 return { nome: "Vacas Leiteiras", emoji: "🐄", cor: "#16A07C" };
  if (r >= 4 && f >= 4 && v >= 4)                 return { nome: "Estrelas",        emoji: "⭐", cor: "#D88514" };
  if (r >= 4 && f <= 3)                           return { nome: "Pintinhos",       emoji: "🐣", cor: "#3F5BA8" };
  if (r <= 3 && (f >= 3 || v >= 3))               return { nome: "Borboletas",      emoji: "🦋", cor: "#F97316" };
  return { nome: "Caracóis", emoji: "🐌", cor: "#6B7280" };
};

const PERSONAS = ["Estrelas", "Vacas Leiteiras", "Pintinhos", "Borboletas", "Caracóis"];

// ============================================================
// Tela principal
// ============================================================
const InsightsRFV = ({ t, lang }) => {
  const [tab, setTab] = React.useState("visao");
  const [activeFilters, setActiveFilters] = React.useState(new Set());
  const [detail, setDetail] = React.useState(null);

  const toggleFilter = (cat) => {
    const n = new Set(activeFilters);
    n.has(cat) ? n.delete(cat) : n.add(cat);
    setActiveFilters(n);
  };
  const clearFilters = () => setActiveFilters(new Set());

  const dataset = React.useMemo(() => {
    const base = buildRfvDataset();
    const p = percentis(base.map(c => c.valor));
    return base.map(c => {
      const nR = notaR(c.recencia);
      const nF = notaF(c.qtdPedidos);
      const nV = notaV(c.valor, p);
      const score = nR + nF + nV;
      const cat = categoria(c.recencia, c.primeiraCompraDias);
      return {
        ...c,
        notaR: nR, notaF: nF, notaV: nV, score,
        categoria: cat,
        carteira: statusCarteira(c.recencia),
        persona: classifyPersona(nR, nF, nV),
      };
    });
  }, []);

  const counts = (cat) => dataset.filter(c => c.categoria === cat).length;
  const stats = {
    total: dataset.length,
    firstBuy: counts("Novos (First Buy)"),
    ativos: counts("Ativos Fidelizados"),
    alerta: counts("Em Alerta (Amarelo)"),
    livreA: counts("Inativo - Livre A"),
    livreB: counts("Inativo - Livre B"),
    livreZ: counts("Inativo - Livre Z"),
  };
  stats.livres = stats.livreA + stats.livreB + stats.livreZ;
  const ativosAlerta = dataset.filter(c => c.recencia != null && c.recencia <= 120);
  stats.scoreMedio = ativosAlerta.length
    ? Math.round(ativosAlerta.reduce((s, c) => s + c.score, 0) / ativosAlerta.length)
    : 0;

  const byPersona = (nome) => dataset.filter(c => c.persona.nome === nome);

  return (
    <div>
      <div className="section-title">
        <div>
          <h2>Insights RFV</h2>
          <div className="sub">Segmentação por Recência, Frequência e Valor — score, carteira livre e personas estratégicas.</div>
        </div>
        <div className="toggle-group">
          <button aria-current={tab === "visao"}  onClick={() => setTab("visao")}>📊 Visão Geral</button>
          <button aria-current={tab === "matriz"} onClick={() => setTab("matriz")}>🐾 Matriz RFV</button>
        </div>
      </div>

      {tab === "visao" && <VisaoGeral dataset={dataset} stats={stats}
                                       activeFilters={activeFilters}
                                       toggleFilter={toggleFilter}
                                       clearFilters={clearFilters}
                                       onOpenDetail={setDetail}/>}
      {tab === "matriz" && <MatrizRFV dataset={dataset} byPersona={byPersona} onOpenDetail={setDetail}/>}
      {detail && <ClientDetailModal client={detail} onClose={() => setDetail(null)}/>}
    </div>
  );
};

// ============================================================
// Aba 1 — Visão Geral
// ============================================================
const KpiCard = ({ label, value, sub, color, icon, active, filterCats, onClick }) => (
  <div className="card" onClick={onClick}
       style={{
         padding: 16, borderLeft: `4px solid ${color}`,
         cursor: onClick ? "pointer" : "default",
         outline: active ? `2px solid ${color}` : "none",
         background: active ? `${color}15` : undefined,
         transition: "all .15s",
       }}>
    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
      <div>
        <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em" }}>
          {label} {active && <span style={{ color, marginLeft: 4 }}>✓</span>}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
        {sub && <div className="text-3" style={{ fontSize: 11 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: 22 }}>{icon}</div>
    </div>
  </div>
);

const VisaoGeral = ({ dataset, stats, activeFilters, toggleFilter, clearFilters, onOpenDetail }) => {
  // Mapeamento card → categorias filtráveis
  const cardCats = {
    ativos:   ["Ativos Fidelizados"],
    alerta:   ["Em Alerta (Amarelo)"],
    firstBuy: ["Novos (First Buy)"],
    livres:   ["Inativo - Livre A", "Inativo - Livre B", "Inativo - Livre Z"],
  };
  const isCardActive = (key) => cardCats[key].every(c => activeFilters.has(c));
  const toggleCard = (key) => {
    const allOn = isCardActive(key);
    cardCats[key].forEach(c => {
      if (allOn || !activeFilters.has(c)) toggleFilter(c);
    });
  };

  const visible = activeFilters.size === 0
    ? dataset
    : dataset.filter(c => activeFilters.has(c.categoria));

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12, marginBottom: 12 }}>
        <KpiCard label="Total" value={stats.total} sub="Base completa" color="#3F5BA8" icon="👥"/>
        <KpiCard label="Ativos" value={stats.ativos} sub={`${((stats.ativos/stats.total)*100).toFixed(0)}% da base`}
                 color="#16A07C" icon="✅" active={isCardActive("ativos")} onClick={() => toggleCard("ativos")}/>
        <KpiCard label="Em Alerta" value={stats.alerta} sub="91–120 dias · ligar hoje"
                 color="#D88514" icon="🚨" active={isCardActive("alerta")} onClick={() => toggleCard("alerta")}/>
        <KpiCard label="Novos (First Buy)" value={stats.firstBuy} sub="1ª compra ≤ 45 dias"
                 color="#3F5BA8" icon="🆕" active={isCardActive("firstBuy")} onClick={() => toggleCard("firstBuy")}/>
        <KpiCard label="Carteira Livre" value={stats.livres} sub={`${stats.livreA} A · ${stats.livreB} B · ${stats.livreZ} Z`}
                 color="#D63B5C" icon="🔓" active={isCardActive("livres")} onClick={() => toggleCard("livres")}/>
        <KpiCard label="Score Médio RFV" value={`${stats.scoreMedio}/15`} sub="Apenas ativos + alerta" color="#2EBFC5" icon="⭐"/>
      </div>

      {activeFilters.size > 0 && (
        <div className="row gap-2" style={{ marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span className="text-3" style={{ fontSize: 12, fontWeight: 700 }}>Filtros ativos:</span>
          {[...activeFilters].map(f => (
            <span key={f} className="badge" style={{ background: catColor(f) + "22", color: catColor(f), fontWeight: 600 }}>
              {f} <button onClick={() => toggleFilter(f)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", marginLeft: 4 }}>×</button>
            </span>
          ))}
          <button className="btn btn-sm" onClick={clearFilters} style={{ marginLeft: "auto" }}>
            <Icon name="x" size={12}/> Limpar filtros
          </button>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <div className="card-header">
          <Icon name="users" size={14}/>
          <div className="card-title">Clientes & Score</div>
          <span className="text-3" style={{ marginLeft: "auto", fontSize: 11 }}>
            {visible.length} de {dataset.length} contas · clique duplo para detalhes
          </span>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Cidade</th>
              <th>Recência</th>
              <th>Pedidos</th>
              <th style={{ textAlign: "right" }}>Valor</th>
              <th>Notas R · F · V</th>
              <th style={{ textAlign: "center" }}>Score</th>
              <th>Categoria</th>
              <th>Carteira</th>
              <th>Persona</th>
            </tr>
          </thead>
          <tbody>
            {visible.slice().sort((a, b) => b.score - a.score).map(c => (
              <tr key={c.id} onDoubleClick={() => onOpenDetail(c)} style={{ cursor: "pointer" }} title="Duplo clique para ver detalhes">
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td className="text-2" style={{ fontSize: 12.5 }}>{c.city}</td>
                <td className="text-2">{c.recencia}d</td>
                <td>{c.qtdPedidos}</td>
                <td style={{ textAlign: "right", fontWeight: 700 }}>R$ {c.valor}k</td>
                <td>
                  <ScoreBadge n={c.notaR} prefix="R"/> <ScoreBadge n={c.notaF} prefix="F"/> <ScoreBadge n={c.notaV} prefix="V"/>
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge" style={{
                    background: scoreColor(c.score), color: "#fff", fontWeight: 700,
                  }}>{c.score}/15</span>
                </td>
                <td><span className="badge" style={{ background: catColor(c.categoria) + "22", color: catColor(c.categoria), fontWeight: 600 }}>{c.categoria}</span></td>
                <td className="text-2" style={{ fontSize: 12 }}>{c.carteira}</td>
                <td><span style={{ color: c.persona.cor, fontWeight: 700 }}>{c.persona.emoji} {c.persona.nome}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ScoreBadge = ({ n, prefix }) => {
  const colors = ["#6B7280", "#D63B5C", "#F97316", "#D88514", "#22C77E", "#16A07C"];
  return <span className="badge" style={{ background: colors[n] || "#6B7280", color: "#fff", fontSize: 10, fontWeight: 700 }}>{prefix}:{n}</span>;
};
const scoreColor = (s) => s >= 13 ? "#16A07C" : s >= 10 ? "#22C77E" : s >= 7 ? "#D88514" : s >= 4 ? "#F97316" : "#D63B5C";
const catColor = (c) => ({
  "Novos (First Buy)":    "#3F5BA8",
  "Ativos Fidelizados":   "#16A07C",
  "Em Alerta (Amarelo)":  "#D88514",
  "Inativo - Livre A":    "#F97316",
  "Inativo - Livre B":    "#D63B5C",
  "Inativo - Livre Z":    "#6B7280",
  "Prospect":             "#8A8899",
}[c] || "#8A8899");

// ============================================================
// Aba 2 — Matriz RFV (Personas)
// ============================================================
const PERSONA_INFO = {
  "Estrelas":        { emoji: "⭐", cor: "#D88514", desc: "O melhor da carteira: compram muito, sempre e recentemente.",            perfil: "R≥4 · F≥4 · V≥4", acao: "Tratamento VIP, exclusividade, antecipar novidades." },
  "Vacas Leiteiras": { emoji: "🐄", cor: "#16A07C", desc: "Fiéis e constantes. Garantem o sustento com compras regulares.",         perfil: "R≥4 · F≥4 · V≤4", acao: "Upsell e cross-sell para aumentar o ticket médio." },
  "Pintinhos":       { emoji: "🐣", cor: "#3F5BA8", desc: "Novos compradores com potencial. Acabaram de chegar.",                    perfil: "R≥4 · F≤3",       acao: "Onboarding ativo, descoberta de catálogo." },
  "Borboletas":      { emoji: "🦋", cor: "#F97316", desc: "Em risco de sair. Eram ativos e valiosos, mas estão se afastando.",       perfil: "R≤3 · F≥3 ou V≥3", acao: "Reativação URGENTE. Cada dia conta." },
  "Caracóis":        { emoji: "🐌", cor: "#6B7280", desc: "Baixa prioridade. Compram pouco, raramente e sem retorno significativo.", perfil: "R≤2 · F≤2 · V≤2", acao: "Campanhas de massa ou desativação da carteira." },
};

const MatrizRFV = ({ dataset, byPersona, onOpenDetail }) => {
  const total = dataset.length;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 12, marginBottom: 16 }}>
        {PERSONAS.map(nome => {
          const info = PERSONA_INFO[nome];
          const list = byPersona(nome);
          const pct = total > 0 ? ((list.length / total) * 100).toFixed(1) : "0";
          return (
            <div key={nome} className="card" style={{ padding: 16, borderLeft: `4px solid ${info.cor}` }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div>
                  <div className="text-3" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{info.emoji} {nome}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{list.length}</div>
                  <div className="text-3" style={{ fontSize: 11 }}>{pct}% · {info.perfil}</div>
                </div>
                <div style={{ fontSize: 30 }}>{info.emoji}</div>
              </div>
            </div>
          );
        })}
      </div>

      {PERSONAS.map(nome => {
        const info = PERSONA_INFO[nome];
        const list = byPersona(nome).sort((a, b) => b.score - a.score);
        if (!list.length) return null;
        return (
          <div key={nome} className="card mb-3" style={{ padding: 0, borderLeft: `4px solid ${info.cor}` }}>
            <div className="card-header">
              <div>
                <div className="card-title">{info.emoji} {nome} <span className="badge" style={{ marginLeft: 8 }}>{list.length}</span></div>
                <div className="card-sub">{info.desc} · <b>Ação:</b> {info.acao}</div>
              </div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th><th>Cidade</th><th>Recência</th><th>Pedidos</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th>Notas</th><th style={{ textAlign: "center" }}>Score</th><th>Categoria</th>
                </tr>
              </thead>
              <tbody>
                {list.map(c => (
                  <tr key={c.id} onDoubleClick={() => onOpenDetail && onOpenDetail(c)} style={{ cursor: "pointer" }} title="Duplo clique para detalhes">
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td className="text-2" style={{ fontSize: 12.5 }}>{c.city}</td>
                    <td>{c.recencia}d</td>
                    <td>{c.qtdPedidos}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>R$ {c.valor}k</td>
                    <td><ScoreBadge n={c.notaR} prefix="R"/> <ScoreBadge n={c.notaF} prefix="F"/> <ScoreBadge n={c.notaV} prefix="V"/></td>
                    <td style={{ textAlign: "center" }}><span className="badge" style={{ background: scoreColor(c.score), color: "#fff", fontWeight: 700 }}>{c.score}</span></td>
                    <td className="text-2" style={{ fontSize: 12 }}>{c.categoria}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

// ============================================================
// Aba 3 — Como é calculado
// ============================================================
const ComoCalculado = () => (
  <div className="card" style={{ padding: 20 }}>
    <h3 style={{ marginTop: 0 }}>📐 Documentação dos cálculos RFV</h3>
    <p className="text-2">RFV = <b>Recência</b> (quão recente foi a última compra) · <b>Frequência</b> (quantos pedidos no período) · <b>Valor</b> (faturamento relativo à base). Cada dimensão recebe nota de 1 a 5. O Score é a soma (máx. 15).</p>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginTop: 12 }}>
      <div className="card" style={{ padding: 14 }}>
        <h4 style={{ marginTop: 0 }}>R — Recência (dias)</h4>
        <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
          <li>≤ 30 dias → <b>5</b></li>
          <li>31–60 → <b>4</b></li>
          <li>61–90 → <b>3</b></li>
          <li>91–120 → <b>2</b></li>
          <li>+120 → <b>1</b></li>
        </ul>
      </div>
      <div className="card" style={{ padding: 14 }}>
        <h4 style={{ marginTop: 0 }}>F — Frequência (pedidos)</h4>
        <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
          <li>{">"} 12 → <b>5</b></li>
          <li>7–12 → <b>4</b></li>
          <li>4–6 → <b>3</b></li>
          <li>2–3 → <b>2</b></li>
          <li>0–1 → <b>1</b></li>
        </ul>
      </div>
      <div className="card" style={{ padding: 14 }}>
        <h4 style={{ marginTop: 0 }}>V — Valor (percentis)</h4>
        <ul style={{ fontSize: 13, lineHeight: 1.7, paddingLeft: 18 }}>
          <li>≥ P90 → <b>5</b></li>
          <li>P70–P89 → <b>4</b></li>
          <li>P40–P69 → <b>3</b></li>
          <li>P10–P39 → <b>2</b></li>
          <li>{"<"} P10 → <b>1</b></li>
        </ul>
      </div>
    </div>

    <h4 style={{ marginTop: 20 }}>📊 Categorias de ciclo de vida (pela Recência)</h4>
    <ul style={{ fontSize: 13, lineHeight: 1.8 }}>
      <li><b>Novos (First Buy):</b> 1ª compra ≤ 45 dias — foco em onboarding.</li>
      <li><b>Ativos Fidelizados:</b> R ≤ 90d — manter relacionamento.</li>
      <li><b>Em Alerta:</b> 91–120d — <b>ligar hoje!</b></li>
      <li><b>Inativo Livre A:</b> 121–365d — recuperação prioritária.</li>
      <li><b>Inativo Livre B:</b> 366–752d — disponível para consulta geral.</li>
      <li><b>Inativo Livre Z:</b> +752d — recuperação ou descarte.</li>
    </ul>

    <h4 style={{ marginTop: 20 }}>🔓 Carteira Livre</h4>
    <p className="text-2" style={{ fontSize: 13 }}>
      Clientes com recência {">"} 120 dias entram em <b>Carteira Livre</b> e podem ser trabalhados por outros vendedores.
      As bandas A/B/Z indicam quanto tempo o cliente está sem comprar. Quanto mais antiga, menor a chance de recuperação.
    </p>

    <h4 style={{ marginTop: 20 }}>🐾 Matriz RFV — 5 Personas</h4>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {PERSONAS.map(p => {
        const i = PERSONA_INFO[p];
        return (
          <div key={p} className="card" style={{ padding: 12, borderLeft: `4px solid ${i.cor}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{i.emoji} {p} <span className="text-3" style={{ fontSize: 11, fontWeight: 500 }}>· {i.perfil}</span></div>
            <div className="text-2" style={{ fontSize: 12, marginTop: 4 }}>{i.desc}</div>
            <div style={{ fontSize: 12, marginTop: 6 }}><b>Ação:</b> {i.acao}</div>
          </div>
        );
      })}
    </div>

    <h4 style={{ marginTop: 20 }}>📌 Fonte dos dados nesta demo</h4>
    <p className="text-2" style={{ fontSize: 13 }}>
      Esta página deriva R/F/V dos clientes existentes em <code>ACCOUNTS</code>: <b>R</b> = <code>lastContact</code> (dias),
      <b> F/V/MIX</b> são gerados por hash determinístico do <code>id</code> para que os números fiquem estáveis a cada render.
      Em produção, esses campos viriam direto da query do ERP (como no script original).
    </p>
  </div>
);

// ============================================================
// Modal de detalhe do cliente (duplo clique na linha)
// ============================================================
const PRODUTOS_DUMMY = [
  "Implantação de Canal", "Operação Home Office", "Diagnóstico de Mercado",
  "Treinamento In-Company", "Reestruturação de Canal", "Mentoria de Gestores",
  "Auditoria de Pipeline", "Telefonia 3CX", "Pacote Enterprise",
];

const ClientDetailModal = ({ client, onClose }) => {
  const h = _hash(client.id);
  // Histórico de compras sintético — 5 últimas, intercaladas
  const compras = Array.from({ length: 5 }, (_, i) => {
    const daysAgo = client.recencia + i * (15 + (h >> i) % 40);
    const d = new Date(Date.now() - daysAgo * 86400000);
    return {
      data: d.toLocaleDateString("pt-BR"),
      produto: PRODUTOS_DUMMY[(h + i) % PRODUTOS_DUMMY.length],
      valor: ((h >> (i + 1)) % 80) + 8,
      qtd: ((h >> i) % 4) + 1,
    };
  });
  const topProduto = PRODUTOS_DUMMY[h % PRODUTOS_DUMMY.length];
  const vendedor = REPS.find(r => r.id === client.owner) || { name: "—", role: "" };
  // Contatos sintéticos
  const NOMES = ["Camila Reis", "Bruno Salles", "Ana Beatriz", "Rafael Lima", "Patrícia Oliveira", "Eduardo Tavares"];
  const CARGOS = ["Diretor Comercial", "Gerente de Compras", "Sócio-Diretor", "Coord. de Suprimentos", "CEO", "Analista de Compras"];
  const contatos = Array.from({ length: 3 }, (_, i) => {
    const idx = (h + i * 7) % NOMES.length;
    const nome = NOMES[idx];
    const primeiroNome = nome.split(" ")[0].toLowerCase();
    const dominio = client.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12) + ".com.br";
    const ddd = 11 + ((h >> i) % 80);
    const num = 90000 + ((h >> (i + 2)) % 9999);
    return {
      nome,
      cargo: CARGOS[(h + i * 3) % CARGOS.length],
      email: `${primeiroNome}@${dominio}`,
      telefone: `(${ddd}) 9${num.toString().slice(0, 4)}-${num.toString().slice(4) || "0000"}`,
      principal: i === 0,
    };
  });
  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(client.city)}&output=embed`;

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.55)",
      zIndex: 100, display: "grid", placeItems: "center", padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} className="card" style={{
        width: "min(880px, 96vw)", maxHeight: "92vh", overflowY: "auto", padding: 0,
      }}>
        <div className="card-header" style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <div className="flex-1">
            <div className="card-title">{client.name}</div>
            <div className="card-sub">{client.city} · {client.industry}</div>
          </div>
          <span className="badge" style={{ background: scoreColor(client.score), color: "#fff", fontWeight: 700 }}>Score {client.score}/15</span>
          <span style={{ color: client.persona.cor, fontWeight: 700, marginLeft: 8 }}>{client.persona.emoji} {client.persona.nome}</span>
          <button className="icon-btn" onClick={onClose} style={{ marginLeft: 8 }}><Icon name="x" size={16}/></button>
        </div>

        <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Coluna esquerda */}
          <div className="col gap-3">
            <div className="card" style={{ padding: 14 }}>
              <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>👤 Vendedor responsável</div>
              <div className="row gap-2">
                <Avatar user={vendedor} size={36}/>
                <div>
                  <div style={{ fontWeight: 700 }}>{vendedor.name}</div>
                  <div className="text-3" style={{ fontSize: 12 }}>{vendedor.role || "Comercial"}</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>⭐ Produto mais comprado</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{topProduto}</div>
              <div className="text-3" style={{ fontSize: 12, marginTop: 4 }}>
                {client.qtdProdutos} SKUs distintos · {client.qtdPedidos} pedidos totais
              </div>
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>📊 RFV</div>
              <div className="row gap-2">
                <ScoreBadge n={client.notaR} prefix="R"/>
                <ScoreBadge n={client.notaF} prefix="F"/>
                <ScoreBadge n={client.notaV} prefix="V"/>
              </div>
              <div className="text-3" style={{ fontSize: 12, marginTop: 8 }}>
                Recência: <b>{client.recencia} dias</b> · Categoria: <b>{client.categoria}</b><br/>
                Carteira: <b>{client.carteira}</b>
              </div>
            </div>
          </div>

          {/* Coluna direita — Mapa */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div className="card-header"><div className="card-title" style={{ fontSize: 13 }}>📍 Localização</div></div>
            <iframe src={mapUrl} style={{ width: "100%", height: 280, border: 0 }} loading="lazy"/>
            <div style={{ padding: 10, fontSize: 12 }} className="text-2">{client.city}</div>
          </div>

          {/* Contatos full-width */}
          <div className="card" style={{ padding: 0, gridColumn: "1 / -1" }}>
            <div className="card-header"><div className="card-title" style={{ fontSize: 13 }}>📇 Contatos da empresa</div></div>
            <table className="table">
              <thead>
                <tr><th>Nome</th><th>Cargo</th><th>E-mail</th><th>Telefone</th><th></th></tr>
              </thead>
              <tbody>
                {contatos.map((ct, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>
                      {ct.nome} {ct.principal && <span className="badge badge-brand" style={{ fontSize: 10, marginLeft: 6 }}>Principal</span>}
                    </td>
                    <td className="text-2">{ct.cargo}</td>
                    <td><a href={`mailto:${ct.email}`} style={{ color: "var(--brand-blue)" }}>{ct.email}</a></td>
                    <td><a href={`tel:${ct.telefone.replace(/\D/g, "")}`} style={{ color: "var(--brand-blue)" }}>{ct.telefone}</a></td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <a className="btn btn-sm" href={`https://wa.me/55${ct.telefone.replace(/\D/g, "")}`} target="_blank" rel="noopener" title="WhatsApp">
                        <Icon name="message" size={12}/>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Histórico full-width */}
          <div className="card" style={{ padding: 0, gridColumn: "1 / -1" }}>
            <div className="card-header"><div className="card-title" style={{ fontSize: 13 }}>🧾 Últimas compras</div></div>
            <table className="table">
              <thead>
                <tr><th>Data</th><th>Produto</th><th>Qtd</th><th style={{ textAlign: "right" }}>Valor</th></tr>
              </thead>
              <tbody>
                {compras.map((c, i) => (
                  <tr key={i}>
                    <td className="text-2">{c.data}</td>
                    <td style={{ fontWeight: 600 }}>{c.produto}</td>
                    <td>{c.qtd}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>R$ {c.valor}k</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { InsightsRFV });
