// ============================================================
// 3LACKD CRM — Simulador de Pedidos / Quote Builder
// Monta uma proposta com produtos do catálogo, quantidades,
// desconto, calcula totais e salva o orçamento.
// ============================================================

const QUOTES_KEY = "blackd_quotes";
const loadQuotes = () => { try { return JSON.parse(localStorage.getItem(QUOTES_KEY) || "[]"); } catch { return []; } };
const saveQuotes = (l) => { try { localStorage.setItem(QUOTES_KEY, JSON.stringify(l)); } catch {} };

// Extrai valor numérico do campo "price" do produto (ex.: "R$ 48.500 / projeto" → 48500)
const parsePrice = (str) => {
 if (!str) return 0;
 const m = str.match(/R\$\s*([\d.]+)/);
 if (!m) return 0;
 return parseInt(m[1].replace(/\./g, ""), 10) || 0;
};

const fmt = (n) => "R$ " + Math.round(n).toLocaleString("pt-BR");

const Quote = ({ t, lang }) => {
 const [tab, setTab] = React.useState("novo"); // novo | historico
 const [accountId, setAccountId] = React.useState(ACCOUNTS[0]?.id || "");
 const [items, setItems] = React.useState([]);
 const [globalDiscount, setGlobalDiscount] = React.useState(0);
 const [validity, setValidity] = React.useState(30);
 const [notas, setNotas] = React.useState("");
 const [quotes, setQuotes] = React.useState(loadQuotes);
 const [pickerOpen, setPickerOpen] = React.useState(false);

 const account = ACCOUNTS.find(a => a.id === accountId);

 const addProduct = (p) => {
 if (items.find(i => i.productId === p.id)) { setPickerOpen(false); return; }
 setItems(arr => [...arr, {
 productId: p.id, name: p.name, sku: p.sku, unitPrice: parsePrice(p.price),
 qty: 1, discount: 0,
 }]);
 setPickerOpen(false);
 };
 const updateItem = (idx, patch) => setItems(arr => arr.map((it, i) => i === idx ? { ...it, ...patch } : it));
 const removeItem = (idx) => setItems(arr => arr.filter((_, i) => i !== idx));

 // Totais
 const subtotal = items.reduce((s, it) => s + it.unitPrice * it.qty, 0);
 const descItens = items.reduce((s, it) => s + it.unitPrice * it.qty * (it.discount / 100), 0);
 const apósItens = subtotal - descItens;
 const descGlobal = apósItens * (globalDiscount / 100);
 const total = apósItens - descGlobal;
 const descTotal = descItens + descGlobal;

 const saveQuote = () => {
 if (!items.length) { blackdAlert("Adicione pelo menos um produto antes de salvar.", "Pedido vazio"); return; }
 const q = {
 id: "q_" + Date.now(),
 accountId, accountName: account?.name,
 items, globalDiscount, validity, notas,
 subtotal, descTotal, total,
 createdAt: new Date().toISOString(),
 status: "rascunho",
 };
 const next = [q, ...quotes];
 setQuotes(next); saveQuotes(next);
 blackdAlert("Pedido simulado salvo! Veja na aba 'Histórico'.", " Salvo");
 setItems([]); setGlobalDiscount(0); setNotas("");
 };

 const sendQuote = (q, status) => {
 const next = quotes.map(x => x.id === q.id ? { ...x, status } : x);
 setQuotes(next); saveQuotes(next);
 };

 return (
 <div>
 <div className="section-title">
 <div>
 <h2>Simulador de Pedidos</h2>
 <div className="sub">Monte um orçamento com produtos do catálogo, simule descontos e envie ao cliente.</div>
 </div>
 <div className="toggle-group">
 <button aria-current={tab === "novo"} onClick={() => setTab("novo")}> Novo pedido</button>
 <button aria-current={tab === "historico"} onClick={() => setTab("historico")}> Histórico ({quotes.length})</button>
 </div>
 </div>

 {tab === "novo" && (
 <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, alignItems: "start" }}>
 {/* Coluna esquerda: cliente + itens */}
 <div className="col gap-3">
 <div className="card">
 <div className="card-header"><div className="card-title">Cliente</div></div>
 <div style={{ padding: 14 }}>
 <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)}>
 {ACCOUNTS.map(a => <option key={a.id} value={a.id}>{a.name} — {a.city}</option>)}
 </select>
 {account && (
 <div className="text-3 mt-2" style={{ fontSize: 12 }}>
 {account.city} · {INDUSTRIES.find(i => i.id === account.industry)?.[lang]} · {account.employees} colaboradores
 </div>
 )}
 </div>
 </div>

 <div className="card" style={{ padding: 0 }}>
 <div className="card-header">
 <div className="card-title">Itens do pedido</div>
 <button className="btn btn-sm btn-primary" style={{ marginLeft: "auto" }} onClick={() => setPickerOpen(true)}>
 <Icon name="plus" size={12}/> Adicionar produto
 </button>
 </div>
 {items.length === 0 ? (
 <div className="text-3" style={{ padding: 30, textAlign: "center", fontSize: 13 }}>
 Nenhum item ainda. Clique em <b>"Adicionar produto"</b>.
 </div>
 ) : (
 <table className="table">
 <thead>
 <tr>
 <th>Produto</th>
 <th style={{ width: 80 }}>Qtd</th>
 <th style={{ width: 140, textAlign: "right" }}>Preço unit.</th>
 <th style={{ width: 90 }}>Desc %</th>
 <th style={{ width: 140, textAlign: "right" }}>Subtotal</th>
 <th style={{ width: 36 }}></th>
 </tr>
 </thead>
 <tbody>
 {items.map((it, idx) => {
 const sub = it.unitPrice * it.qty * (1 - it.discount / 100);
 return (
 <tr key={it.productId}>
 <td>
 <div style={{ fontWeight: 600 }}>{it.name}</div>
 <div className="text-3" style={{ fontSize: 11 }}>{it.sku}</div>
 </td>
 <td><input type="number" min={1} className="input" style={{ height: 30, width: 60 }} value={it.qty}
 onChange={e => updateItem(idx, { qty: Math.max(1, +e.target.value || 1) })}/></td>
 <td style={{ textAlign: "right" }}>
 <input type="number" className="input" style={{ height: 30, width: 120, textAlign: "right" }} value={it.unitPrice}
 onChange={e => updateItem(idx, { unitPrice: +e.target.value || 0 })}/>
 </td>
 <td><input type="number" min={0} max={100} className="input" style={{ height: 30, width: 70 }} value={it.discount}
 onChange={e => updateItem(idx, { discount: Math.min(100, Math.max(0, +e.target.value || 0)) })}/></td>
 <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(sub)}</td>
 <td><button className="icon-btn" onClick={() => removeItem(idx)}><Icon name="x" size={13}/></button></td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>

 <div className="card">
 <div className="card-header"><div className="card-title">Observações</div></div>
 <div style={{ padding: 14 }}>
 <textarea className="input" rows={3} placeholder="Condições especiais, prazo de entrega, observações comerciais..."
 value={notas} onChange={e => setNotas(e.target.value)}/>
 </div>
 </div>
 </div>

 {/* Coluna direita: totais */}
 <div className="card" style={{ position: "sticky", top: 16 }}>
 <div className="card-header"><div className="card-title">Resumo do pedido</div></div>
 <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
 <Linha k="Subtotal" v={fmt(subtotal)}/>
 <Linha k="Desconto nos itens" v={"− " + fmt(descItens)}/>
 <div>
 <label className="label">Desconto adicional global (%)</label>
 <input type="number" min={0} max={100} className="input" value={globalDiscount}
 onChange={e => setGlobalDiscount(Math.min(100, Math.max(0, +e.target.value || 0)))}/>
 </div>
 <Linha k="Desconto global" v={"− " + fmt(descGlobal)}/>
 <hr style={{ border: "none", borderTop: "1px solid var(--border)" }}/>
 <Linha k="Desconto total" v={"− " + fmt(descTotal)} color="#D63B5C"/>
 <Linha k="TOTAL" v={fmt(total)} big/>
 <div>
 <label className="label">Validade da proposta (dias)</label>
 <input type="number" min={1} className="input" value={validity}
 onChange={e => setValidity(Math.max(1, +e.target.value || 30))}/>
 </div>
 <button className="btn btn-sm btn-primary" onClick={saveQuote} disabled={!items.length}>
 <Icon name="check" size={12}/> Salvar simulação
 </button>
 </div>
 </div>
 </div>
 )}

 {tab === "historico" && (
 <div className="card" style={{ padding: 0 }}>
 <div className="card-header">
 <div className="card-title">Simulações salvas</div>
 {quotes.length > 0 && (
 <button className="btn btn-sm" style={{ marginLeft: "auto" }}
 onClick={async () => { if (await blackdConfirm("Apagar todo o histórico de simulações?", "Limpar histórico")) { setQuotes([]); saveQuotes([]); } }}>
 <Icon name="x" size={12}/> Limpar tudo
 </button>
 )}
 </div>
 {quotes.length === 0 ? (
 <div className="text-3" style={{ padding: 40, textAlign: "center" }}>
 Nenhuma simulação salva. Crie uma na aba "Novo pedido".
 </div>
 ) : (
 <table className="table">
 <thead>
 <tr>
 <th>Cliente</th><th>Data</th><th>Itens</th><th style={{ textAlign: "right" }}>Total</th>
 <th>Status</th><th></th>
 </tr>
 </thead>
 <tbody>
 {quotes.map(q => (
 <tr key={q.id}>
 <td style={{ fontWeight: 600 }}>{q.accountName}</td>
 <td className="text-2">{new Date(q.createdAt).toLocaleDateString("pt-BR")}</td>
 <td>{q.items.length}</td>
 <td style={{ textAlign: "right", fontWeight: 700 }}>{fmt(q.total)}</td>
 <td>
 <span className="badge" style={{
 background: q.status === "enviado" ? "#3F5BA822" : q.status === "aceito" ? "#16A07C22" : q.status === "recusado" ? "#D63B5C22" : "#8A889922",
 color: q.status === "enviado" ? "#3F5BA8" : q.status === "aceito" ? "#16A07C" : q.status === "recusado" ? "#D63B5C" : "#8A8899",
 fontWeight: 600,
 }}>{q.status}</span>
 </td>
 <td style={{ whiteSpace: "nowrap" }}>
 {q.status === "rascunho" && <button className="btn btn-sm" onClick={() => sendQuote(q, "enviado")}> Enviar</button>}
 {q.status === "enviado" && <>
 <button className="btn btn-sm" onClick={() => sendQuote(q, "aceito")}></button>
 <button className="btn btn-sm" onClick={() => sendQuote(q, "recusado")} style={{ marginLeft: 4 }}></button>
 </>}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 )}

 {/* Picker de produtos */}
 {pickerOpen && (
 <div onClick={() => setPickerOpen(false)} style={{
 position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
 zIndex: 100, display: "grid", placeItems: "center", padding: 20,
 }}>
 <div onClick={e => e.stopPropagation()} className="card" style={{ width: "min(700px, 95vw)", maxHeight: "85vh", overflow: "auto", padding: 0 }}>
 <div className="card-header">
 <div className="card-title">Selecionar produto</div>
 <button className="icon-btn" onClick={() => setPickerOpen(false)} style={{ marginLeft: "auto" }}><Icon name="x" size={14}/></button>
 </div>
 <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
 {PRODUCTS.map(p => (
 <button key={p.id} className="card" onClick={() => addProduct(p)}
 style={{ padding: 12, textAlign: "left", cursor: "pointer", border: "1px solid var(--border)", background: "var(--surface)" }}>
 <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
 <div className="text-3" style={{ fontSize: 11, marginTop: 4 }}>{p.category} · {p.sku}</div>
 <div style={{ fontWeight: 700, fontSize: 13, marginTop: 6, color: "var(--brand-blue)" }}>{p.price}</div>
 </button>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

const Linha = ({ k, v, big, color }) => (
 <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
 <span className="text-3" style={{ fontSize: big ? 13 : 12, fontWeight: big ? 700 : 500 }}>{k}</span>
 <span style={{ fontSize: big ? 22 : 13, fontWeight: 800, color: color || (big ? "var(--brand-teal)" : "var(--text)") }}>{v}</span>
 </div>
);

Object.assign(window, { Quote });
