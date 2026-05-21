// ============================================================
// 3LACKD CRM — Mapa de Classificação de Contatos
// Fidelização por Contatos (LGPD-compliant lock system)
// ============================================================

const CLASSIFICACAO_LOCKS_KEY = "blackd_client_locks";

// 4 grandes grupos, cada um com seus subgrupos e período de fidelização
const CLASSIFICACAO_GRUPOS = [
  {
    id: "sem-contato",
    titulo: "Sem Contato Efetivo",
    cor: "#8A8899",
    desc: "Houve a tentativa de contatar o decisor, porém sem retorno.",
    fidelizacaoHoras: 48,
    fidelizacaoLabel: "48h",
    acao: "Este tipo de contato gera 48h de fidelização para quem está gerando a tentativa de contato, após este período volta a ficar disponível para os demais vendedores. Pode ser renovado mais 2 vezes pelo mesmo vendedor.",
    renovavel: true,
    renovacoesMax: 2,
    renovacaoDias: 15,
    subgrupos: [
      "Agendar para colega",
      "Transferência",
      "Compra por outro CNPJ - Grupo Econômico (?)",
      "Comprador não estava/Não pode atender",
      "Não responde",
    ],
  },
  {
    id: "conversa-iniciada",
    titulo: "Contato | Conversa iniciada",
    cor: "#4A8BC8",
    desc: "Iniciada conversação com decisor.",
    fidelizacaoHoras: 24 * 7,
    fidelizacaoLabel: "7 dias",
    acao: "Este tipo de registro de contato gera 7 dias corridos de fidelização. Pode ser renovado por até 15 dias. Gera também a possibilidade de agendar um contato futuro em até 15 dias. Pode ser renovado mais 2 vezes.",
    renovavel: true,
    renovacoesMax: 2,
    renovacaoDias: 15,
    subgrupos: [
      "Cliente ainda tem estoque",
      "Cliente fazendo levantamento de estoque",
      "Cliente Novo - Primeiro Contato",
      "Efetuou pedido com representante recentemente",
      "Enviado Catálogo por e-mail/whatsapp",
      "Enviar Amostra",
    ],
  },
  {
    id: "negociacao",
    titulo: "Negociação",
    cor: "#D88514",
    desc: "Progressão da conversação para possível fechamento de pedido.",
    fidelizacaoHoras: 24 * 7,
    fidelizacaoLabel: "7 dias",
    acao: "Este tipo de registro de contato, gera 7 dias corridos de fidelização. Pode ser renovado mais 2 vezes.",
    renovavel: true,
    renovacoesMax: 2,
    renovacaoDias: 15,
    subgrupos: [
      "Analisando Cotação",
      "Cliente ficou de enviar pedido",
      "Enviado Cotação para o cliente",
      "Pedido Fechado",
    ],
  },
  {
    id: "excluir",
    titulo: "Excluir",
    cor: "#D63B5C",
    desc: "Não deve ser priorizado para contatos.",
    fidelizacaoHoras: -1, // permanente
    fidelizacaoLabel: "permanente",
    acao: "Este tipo de contato visa respeitar a LGPD e promover a limpeza de carteira. O Registro de Telefone errado deve gerar um backlog para atualização Cadastral.",
    renovavel: false,
    renovacoesMax: 0,
    renovacaoDias: 0,
    subgrupos: [
      "Fechou a empresa",
      "Pediu para não contactar novamente",
      "Telefone Incorreto",
    ],
  },
];

// ---------- Persistência ----------
const loadLocks = () => {
  try {
    const raw = localStorage.getItem(CLASSIFICACAO_LOCKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (_) { return []; }
};
const saveLocks = (locks) => localStorage.setItem(CLASSIFICACAO_LOCKS_KEY, JSON.stringify(locks));

// Retorna o lock ATIVO para uma conta (ou null se livre)
const getActiveLock = (locks, accountId, now = Date.now()) => {
  const candidates = (locks || []).filter(l => l.accountId === accountId);
  for (const l of candidates) {
    if (l.expiresAt === -1) return l; // permanente (Excluir)
    if (l.expiresAt > now) return l;
  }
  return null;
};

const fmtRestante = (expiresAt, now = Date.now()) => {
  if (expiresAt === -1) return "permanente";
  const ms = expiresAt - now;
  if (ms <= 0) return "expirado";
  const h = Math.floor(ms / 3600000);
  if (h < 48) return `${h}h restantes`;
  return `${Math.floor(h / 24)}d restantes`;
};

// Helper exportado para o kanban exibir badge de fidelização
window.getActiveLock = getActiveLock;
window.loadLocks = loadLocks;
window.fmtRestante = fmtRestante;
window.CLASSIFICACAO_GRUPOS = CLASSIFICACAO_GRUPOS;

// ---------- Seeds dummy ----------
// IDs precisam bater com ACCOUNTS de data.js + as novas contas dummy
const seedDummyLocks = (locks) => {
  if (locks.length > 0) return locks; // só semeia se vazio
  const now = Date.now();
  const HOUR = 3600000, DAY = 24 * HOUR;
  return [
    // Fidelizado por 48h (em curso) - Camila
    { accountId: "a13", vendorId: "u1", grupoId: "sem-contato", subgrupo: "Não responde",
      lockedAt: now - 6 * HOUR, expiresAt: now + 42 * HOUR, renovacoes: 0 },
    // Fidelizado por 7 dias (em curso) - Diego
    { accountId: "a14", vendorId: "u2", grupoId: "conversa-iniciada", subgrupo: "Enviado Catálogo por e-mail/whatsapp",
      lockedAt: now - 2 * DAY, expiresAt: now + 5 * DAY, renovacoes: 0 },
    // Em negociação (5 dias restantes) - Júlia
    { accountId: "a15", vendorId: "u3", grupoId: "negociacao", subgrupo: "Enviado Cotação para o cliente",
      lockedAt: now - 2 * DAY, expiresAt: now + 5 * DAY, renovacoes: 0 },
    // Excluído permanente - LGPD
    { accountId: "a16", vendorId: "u4", grupoId: "excluir", subgrupo: "Pediu para não contactar novamente",
      lockedAt: now - 30 * DAY, expiresAt: -1, renovacoes: 0 },
    // Renovado 1x - Rafael
    { accountId: "a17", vendorId: "u4", grupoId: "conversa-iniciada", subgrupo: "Cliente fazendo levantamento de estoque",
      lockedAt: now - 10 * DAY, expiresAt: now + 12 * DAY, renovacoes: 1 },
  ];
};

// ---------- Componente principal ----------
const ClassificacaoModal = ({ onClose, currentUserId = "u1" }) => {
  const [locks, setLocks] = React.useState(() => {
    const stored = loadLocks();
    if (stored.length === 0) {
      const seeded = seedDummyLocks(stored);
      saveLocks(seeded);
      return seeded;
    }
    return stored;
  });
  const [grupoSelecionado, setGrupoSelecionado] = React.useState(null);
  const [subgrupoSelecionado, setSubgrupoSelecionado] = React.useState(null);
  const [contaSelecionada, setContaSelecionada] = React.useState("");

  const now = Date.now();

  // contas que NÃO estão bloqueadas, ou bloqueadas pelo próprio usuário
  const contasDisponiveis = (window.ACCOUNTS || []).filter(a => {
    const lock = getActiveLock(locks, a.id, now);
    if (!lock) return true;
    return lock.vendorId === currentUserId;
  });

  const aplicarClassificacao = () => {
    if (!grupoSelecionado || !subgrupoSelecionado || !contaSelecionada) {
      blackdAlert("Selecione um cliente, um grupo e um subgrupo antes de aplicar.", "Faltam campos");
      return;
    }
    const grupo = CLASSIFICACAO_GRUPOS.find(g => g.id === grupoSelecionado);
    const expiresAt = grupo.fidelizacaoHoras === -1 ? -1 : now + grupo.fidelizacaoHoras * 3600000;
    const novos = [...locks.filter(l => l.accountId !== contaSelecionada), {
      accountId: contaSelecionada,
      vendorId: currentUserId,
      grupoId: grupoSelecionado,
      subgrupo: subgrupoSelecionado,
      lockedAt: now,
      expiresAt,
      renovacoes: 0,
    }];
    setLocks(novos);
    saveLocks(novos);
    const acc = (window.ACCOUNTS || []).find(a => a.id === contaSelecionada);
    blackdAlert(`Cliente "${acc?.name}" classificado como "${subgrupoSelecionado}". Fidelização: ${grupo.fidelizacaoLabel}.`, "Classificação aplicada");
    setGrupoSelecionado(null);
    setSubgrupoSelecionado(null);
    setContaSelecionada("");
  };

  const renovar = (lock) => {
    const grupo = CLASSIFICACAO_GRUPOS.find(g => g.id === lock.grupoId);
    if (!grupo.renovavel) { blackdAlert("Este tipo de contato não pode ser renovado.", "Não renovável"); return; }
    if (lock.renovacoes >= grupo.renovacoesMax) { blackdAlert(`Limite de ${grupo.renovacoesMax} renovações atingido.`, "Sem renovações"); return; }
    const novos = locks.map(l => l === lock ? {
      ...l,
      expiresAt: now + grupo.renovacaoDias * 24 * 3600000,
      renovacoes: l.renovacoes + 1,
    } : l);
    setLocks(novos); saveLocks(novos);
  };

  const liberar = async (lock) => {
    if (!(await blackdConfirm("Liberar este cliente da carteira? Outros vendedores poderão entrá-lo em contato.", "Liberar cliente"))) return;
    const novos = locks.filter(l => l !== lock);
    setLocks(novos); saveLocks(novos);
  };

  return (
    <div className="modal-backdrop open" onClick={onClose} style={{ alignItems: "flex-start", paddingTop: 80, zIndex: 60 }}>
      <div className="modal modal-large" onClick={e => e.stopPropagation()} style={{ width: "min(1200px, 96vw)", maxHeight: "85vh", overflow: "auto" }}>
        <div className="modal-header" style={{ position: "sticky", top: 0, background: "var(--surface)", zIndex: 2 }}>
          <Icon name="layers" size={18}/>
          <div className="flex-1">
            <div className="modal-title">Mapa de Classificação de Contatos</div>
            <div className="text-3" style={{ fontSize: 12 }}>Fidelização por Contatos · LGPD-compliant</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>

        <div className="modal-body" style={{ padding: 16 }}>
          {/* 4 colunas do mapa */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
            {CLASSIFICACAO_GRUPOS.map(g => {
              const ativo = grupoSelecionado === g.id;
              return (
                <div key={g.id} style={{
                  border: ativo ? `2px solid ${g.cor}` : "1px solid var(--border)",
                  borderRadius: 10,
                  background: ativo ? g.cor + "10" : "var(--surface)",
                  padding: 12,
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  <div style={{ background: g.cor, color: "white", padding: "6px 10px", borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
                    {g.titulo}
                  </div>
                  <div className="text-3" style={{ fontSize: 11.5, lineHeight: 1.4 }}>{g.desc}</div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                    {g.subgrupos.map(sg => (
                      <button key={sg}
                        className="btn btn-sm"
                        onClick={() => { setGrupoSelecionado(g.id); setSubgrupoSelecionado(sg); }}
                        style={{
                          justifyContent: "flex-start", textAlign: "left", fontSize: 12,
                          background: subgrupoSelecionado === sg ? g.cor + "30" : "var(--surface-2)",
                          borderColor: subgrupoSelecionado === sg ? g.cor : "var(--border)",
                          color: "var(--text-1)",
                        }}>
                        {sg}
                      </button>
                    ))}
                  </div>

                  <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px dashed var(--border)", fontSize: 11, color: "var(--text-3)" }}>
                    <b style={{ color: g.cor }}>Fidelização: {g.fidelizacaoLabel}</b>
                    <div style={{ marginTop: 4, lineHeight: 1.4 }}>{g.acao}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aplicar classificação a um cliente */}
          <div className="card" style={{ padding: 14, marginBottom: 16 }}>
            <div className="row" style={{ alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Icon name="user" size={16}/>
              <b style={{ fontSize: 13 }}>Aplicar classificação:</b>
              <select className="input" style={{ height: 32, minWidth: 260 }} value={contaSelecionada} onChange={e => setContaSelecionada(e.target.value)}>
                <option value="">— Selecione o cliente —</option>
                {contasDisponiveis.map(a => <option key={a.id} value={a.id}>{a.name} · {a.city}</option>)}
              </select>
              <span className="text-3" style={{ fontSize: 12 }}>
                {grupoSelecionado && subgrupoSelecionado
                  ? <>→ <b>{subgrupoSelecionado}</b> ({CLASSIFICACAO_GRUPOS.find(g => g.id === grupoSelecionado).fidelizacaoLabel})</>
                  : "Escolha um subgrupo acima"}
              </span>
              <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }} onClick={aplicarClassificacao}>
                <Icon name="check" size={13}/> Aplicar
              </button>
            </div>
          </div>

          {/* Lista de contas em fidelização */}
          <div>
            <div className="row" style={{ alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <b style={{ fontSize: 13 }}>Carteira em fidelização ({locks.length})</b>
              <span className="text-3" style={{ fontSize: 11 }}>Clientes liberados voltam para carteira livre — qualquer vendedor pode contatá-los.</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 8 }}>
              {locks.length === 0 && <div className="text-3" style={{ fontSize: 12, padding: 12 }}>Nenhuma conta fidelizada no momento.</div>}
              {locks.map((l, i) => {
                const acc = (window.ACCOUNTS || []).find(a => a.id === l.accountId);
                const grupo = CLASSIFICACAO_GRUPOS.find(g => g.id === l.grupoId);
                const owner = (window.REPS || []).find(r => r.id === l.vendorId);
                if (!acc || !grupo) return null;
                return (
                  <div key={i} className="card" style={{ padding: 10, borderLeft: `3px solid ${grupo.cor}` }}>
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{acc.name}</div>
                        <div className="text-3" style={{ fontSize: 11 }}>{l.subgrupo}</div>
                      </div>
                      <span className="badge" style={{ background: grupo.cor + "22", color: grupo.cor, fontSize: 10, fontWeight: 700 }}>
                        {grupo.titulo}
                      </span>
                    </div>
                    <div className="row" style={{ gap: 6, fontSize: 11, color: "var(--text-3)", marginTop: 4, alignItems: "center" }}>
                      {owner && <><Avatar user={owner} size={16}/> <span>{owner.name}</span></>}
                      <span style={{ marginLeft: "auto" }}>{fmtRestante(l.expiresAt, now)}</span>
                      {grupo.renovavel && <span>· Renov. {l.renovacoes}/{grupo.renovacoesMax}</span>}
                    </div>
                    <div className="row gap-1" style={{ marginTop: 8 }}>
                      {grupo.renovavel && l.renovacoes < grupo.renovacoesMax && l.expiresAt !== -1 && (
                        <button className="btn btn-sm" onClick={() => renovar(l)}><Icon name="refresh" size={11}/> Renovar 15d</button>
                      )}
                      <button className="btn btn-sm btn-ghost" onClick={() => liberar(l)}>
                        <Icon name="x" size={11}/> Liberar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <span className="text-3" style={{ marginRight: "auto", fontSize: 11.5 }}>
            <Icon name="info" size={12}/> Clientes ficam bloqueados para outros vendedores durante a fidelização. Após o período, voltam para carteira livre.
          </span>
          <button className="btn btn-sm" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

window.ClassificacaoModal = ClassificacaoModal;
