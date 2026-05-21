// ============================================================
// VOZZ CRM — Catálogo de produtos / Ficha técnica / Gerador PDF
// ============================================================

// Persistência de imagens no localStorage (base64)
const IMG_KEY = "vozz_product_images";
const loadImages = () => { try { return JSON.parse(localStorage.getItem(IMG_KEY) || "{}"); } catch { return {}; } };
const saveImages = (m) => { try { localStorage.setItem(IMG_KEY, JSON.stringify(m)); } catch {} };

const Catalog = ({ t, lang }) => {
  const [selected, setSelected] = React.useState(new Set(PRODUCTS.slice(0, 4).map(p => p.id)));
  const [detail, setDetail] = React.useState(null); // product object
  const [pdfOpen, setPdfOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [images, setImages] = React.useState(loadImages);

  const uploadImage = (productId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const next = { ...images, [productId]: e.target.result };
      setImages(next);
      saveImages(next);
    };
    reader.readAsDataURL(file);
  };
  const removeImage = (productId) => {
    const next = { ...images };
    delete next[productId];
    setImages(next);
    saveImages(next);
  };

  const categories = ["all", ...Array.from(new Set(PRODUCTS.map(p => p.category)))];
  const filtered = PRODUCTS.filter(p => categoryFilter === "all" || p.category === categoryFilter);

  const toggle = (id) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };

  const selectedProducts = PRODUCTS.filter(p => selected.has(p.id));

  return (
    <div>
      <div className="section-title">
        <div>
          <h2>{t.catalog}</h2>
          <div className="sub">Selecione os produtos para gerar um catálogo em PDF personalizado.</div>
        </div>
        <div className="row gap-2">
          <button className="btn btn-sm" onClick={() => vozzAlert("Em breve: cadastro de novos produtos. Por enquanto, edite data.js.", "Novo produto")}><Icon name="plus" size={13}/> Novo produto</button>
          <button className="btn btn-sm" onClick={() => setSelected(new Set(PRODUCTS.map(p => p.id)))}>
            Selecionar todos
          </button>
          <button className="btn btn-sm btn-brand" disabled={selected.size === 0} onClick={() => setPdfOpen(true)}>
            <Icon name="file" size={13}/> {t.generate_pdf} ({selected.size})
          </button>
        </div>
      </div>

      <div className="filters" style={{ borderRadius: "var(--r-lg)", border: "1px solid var(--border)", marginBottom: 16 }}>
        <span className="text-3" style={{ fontSize: 12, fontWeight: 600 }}>Categoria:</span>
        {categories.map(c => (
          <button key={c} className="filter-chip"
                  style={{
                    background: categoryFilter === c ? "var(--brand-grad-soft)" : "transparent",
                    borderColor: categoryFilter === c ? "var(--brand-teal)" : "var(--border-strong)",
                    borderStyle: "solid",
                    color: categoryFilter === c ? "var(--text)" : "var(--text-2)",
                  }}
                  onClick={() => setCategoryFilter(c)}>
            {c === "all" ? "Todas" : c}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }} className="row gap-2">
          <span className="badge badge-brand">{selected.size} no catálogo</span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
        {filtered.map(p => {
          const img = images[p.id] || p.image;
          return (
          <div key={p.id} className={"product-card " + (selected.has(p.id) ? "selected" : "")}
               onClick={() => toggle(p.id)}>
            <div className="check"><Icon name="check" size={12}/></div>
            <div style={{ position: "relative", marginBottom: 10 }}>
              {img ? (
                <img src={img} alt={p.name} style={{
                  width: "100%", height: 140, objectFit: "cover",
                  borderRadius: "var(--r-md)", display: "block",
                  border: "1px solid var(--border)",
                }}/>
              ) : (
                <div style={{
                  width: "100%", height: 140, borderRadius: "var(--r-md)",
                  background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                  color: "#fff", display: "grid", placeItems: "center",
                }}>
                  <Icon name={iconForCategory(p.category)} size={38}/>
                </div>
              )}
              <label className="icon-btn"
                     onClick={(e) => e.stopPropagation()}
                     style={{
                       position: "absolute", top: 8, right: 8,
                       background: "rgba(255,255,255,.92)", cursor: "pointer",
                     }}
                     title="Trocar imagem">
                <Icon name="image" size={13}/>
                <input type="file" accept="image/*" style={{ display: "none" }}
                       onChange={(e) => { uploadImage(p.id, e.target.files?.[0]); e.target.value = ""; }}/>
              </label>
              {images[p.id] && (
                <button className="icon-btn"
                        onClick={(e) => { e.stopPropagation(); removeImage(p.id); }}
                        style={{ position: "absolute", top: 8, right: 44, background: "rgba(255,255,255,.92)" }}
                        title="Remover imagem">
                  <Icon name="x" size={13}/>
                </button>
              )}
            </div>
            <div className="row gap-2" style={{ marginBottom: 4, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>{p.name}</div>
              {p.tag && <span className="badge badge-brand" style={{ fontSize: 10 }}>{p.tag}</span>}
            </div>
            <div className="text-2" style={{ fontSize: 12, lineHeight: 1.45, minHeight: 50 }}>{p.summary}</div>
            <div className="divider"/>
            <div className="row gap-2" style={{ fontSize: 11.5 }}>
              <span className="text-3" style={{ fontFamily: "var(--font-mono)" }}>{p.sku}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700 }}>{p.price.split("/")[0].trim()}</span>
            </div>
            <button className="btn btn-sm mt-2" style={{ width: "100%", justifyContent: "center" }}
                    onClick={(e) => { e.stopPropagation(); setDetail(p); }}>
              <Icon name="document" size={12}/> Ver ficha técnica
            </button>
          </div>
        );})}
      </div>

      {/* Detail modal */}
      {detail && <ProductDetailModal product={detail} onClose={() => setDetail(null)}
                                     selected={selected.has(detail.id)} onToggle={() => toggle(detail.id)}/>}

      {/* PDF preview */}
      {pdfOpen && <CatalogPdfModal products={selectedProducts} onClose={() => setPdfOpen(false)}/>}
    </div>
  );
};

const iconForCategory = (c) => ({
  "Implantação": "layers",
  "Operação":    "bolt",
  "Consultoria": "trend",
  "Treinamento": "award",
})[c] || "document";

// ============================================================
// Product detail (technical sheet)
// ============================================================
const ProductDetailModal = ({ product, onClose, selected, onToggle }) => {
  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="product-icon" style={{ background: `linear-gradient(135deg, ${product.color}, ${product.color}cc)`, marginBottom: 0 }}>
            <Icon name={iconForCategory(product.category)} size={22}/>
          </div>
          <div className="flex-1">
            <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>
              {product.category} · {product.sku}
            </div>
            <div className="modal-title">{product.name}</div>
          </div>
          {product.tag && <span className="badge badge-brand">{product.tag}</span>}
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Sobre este produto</h3>
              <p className="text-2" style={{ fontSize: 13.5, lineHeight: 1.65, margin: 0 }}>{product.summary}</p>

              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 8px" }}>O que está incluído</h3>
              <div className="col gap-2">
                {product.deliverables.map((d, i) => (
                  <div key={i} className="row gap-2" style={{ fontSize: 13 }}>
                    <span className="feed-icon brand" style={{ width: 22, height: 22 }}>
                      <Icon name="check" size={12}/>
                    </span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>

              <h3 style={{ fontSize: 15, fontWeight: 700, margin: "20px 0 8px" }}>Recomendação de utilização</h3>
              <div className="card card-pad" style={{ background: "var(--brand-grad-soft)", borderColor: "transparent", padding: 14 }}>
                <div className="row gap-2" style={{ alignItems: "flex-start" }}>
                  <Icon name="sparkles" size={14}/>
                  <div style={{ fontSize: 13, lineHeight: 1.55 }}>{product.recommendation}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{ boxShadow: "none" }}>
                <div className="card-header"><div className="card-title">Ficha técnica</div></div>
                <div style={{ padding: "4px 16px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <SpecRow k="Preço"            v={product.price}/>
                  <SpecRow k="Modalidade"       v={product.unit}/>
                  <SpecRow k="Duração"          v={product.duration}/>
                  <SpecRow k="Equipe alocada"   v={product.team}/>
                  <SpecRow k="Abrangência"      v={product.coverage}/>
                  <SpecRow k="Porte alvo"       v={product.targetSize}/>
                  <SpecRow k="SKU"              v={product.sku} mono/>
                </div>
              </div>
              <div className="row gap-2 mt-4">
                <button className={"btn btn-sm flex-1 " + (selected ? "btn-primary" : "btn-brand")}
                        onClick={onToggle}>
                  <Icon name={selected ? "check" : "plus"} size={13}/>
                  {selected ? "No catálogo" : "Incluir no catálogo"}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Fechar</button>
          <button className="btn btn-sm btn-primary" onClick={async () => {
            const email = await vozzPrompt("Para qual e-mail enviar a ficha técnica?", "", "Enviar ficha por email");
            if (email) { window.location.href = `mailto:${email}?subject=Ficha técnica - ${product.name}&body=Segue ficha técnica do produto ${product.name} (${product.sku}).`; }
          }}><Icon name="mail" size={13}/> Enviar ficha por email</button>
        </div>
      </div>
    </div>
  );
};

const SpecRow = ({ k, v, mono }) => (
  <div>
    <div className="text-3" style={{ fontSize: 10.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>{k}</div>
    <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{v}</div>
  </div>
);

// ============================================================
// PDF preview modal — stylized A4 pages
// ============================================================
const CatalogPdfModal = ({ products, onClose }) => {
  const images = loadImages();
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()} style={{ width: "min(820px, 94vw)" }}>
        <div className="modal-header">
          <Icon name="file" size={18}/>
          <div className="flex-1">
            <div className="modal-title">Catálogo Vozz — preview</div>
            <div className="text-3" style={{ fontSize: 12 }}>{products.length + 1} páginas · A4 · estilo Vozz</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>
        <div className="modal-body">
          <div className="pdf-shell">
            {/* COVER */}
            <div className="pdf-page pdf-cover">
              <svg className="pdf-cover-dots" viewBox="0 0 100 100" fill="none">
                <g fill="white" opacity="0.65">
                  <circle cx="50" cy="22" r="7"/>
                  <circle cx="30" cy="44" r="5.5"/>
                  <circle cx="70" cy="44" r="5.5"/>
                  <circle cx="20" cy="68" r="4.5"/>
                  <circle cx="50" cy="62" r="6.5"/>
                  <circle cx="80" cy="68" r="4.5"/>
                </g>
                <g stroke="white" opacity="0.45" strokeWidth="0.5">
                  <path d="M 30 44 L 50 22 L 70 44"/>
                  <path d="M 20 68 L 50 62 L 80 68"/>
                  <path d="M 30 44 L 50 62 L 70 44"/>
                </g>
              </svg>
              <div className="pdf-cover-content">
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.75, fontWeight: 600 }}>
                  Catálogo de Soluções · {today}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.95 }}>
                    Vozz
                  </div>
                  <div style={{ fontSize: 14, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.85, fontWeight: 600, marginTop: 4 }}>
                    The Sales Journey
                  </div>
                  <div style={{ width: 56, height: 3, background: "#2EBFC5", borderRadius: 2, marginTop: 22 }}/>
                  <div style={{ fontSize: 22, fontWeight: 700, marginTop: 18, maxWidth: "70%", lineHeight: 1.25 }}>
                    Implantamos e reestruturamos canais internos de vendas para a indústria.
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 18 }}>
                    Porto Alegre/RS · atuação em todo o Brasil · desde 2015
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, opacity: 0.6, marginTop: 18 }}>
                  <span>(51) 3516-2287</span>
                  <span>vozz.com.br</span>
                </div>
              </div>
            </div>

            {/* PRODUCT PAGES */}
            {products.map((p, i) => (
              <div key={p.id} className="pdf-page pdf-product-page">
                <div className="pdf-product-header">
                  <div style={{
                    width: 54, height: 54, borderRadius: 12,
                    background: `linear-gradient(135deg, ${p.color}, ${p.color}cc)`,
                    color: "white", display: "grid", placeItems: "center"
                  }}>
                    <Icon name={iconForCategory(p.category)} size={24}/>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: "#8A8899", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {p.category} · {p.sku}
                    </div>
                    <div className="pdf-h1">{p.name}</div>
                  </div>
                  {p.tag && (
                    <div style={{
                      fontSize: 9, fontWeight: 700, padding: "4px 10px",
                      background: "rgba(46,191,197,0.15)", color: "#3F5BA8",
                      borderRadius: 99
                    }}>{p.tag}</div>
                  )}
                </div>

                {(images[p.id] || p.image) && (
                  <img src={images[p.id] || p.image} alt={p.name}
                       style={{
                         width: "100%", height: 200, objectFit: "cover",
                         borderRadius: 8, margin: "10px 0 14px",
                         border: "1px solid #E5E5EA",
                       }}/>
                )}
                <div style={{ fontSize: 13, lineHeight: 1.55, color: "#4A4860" }}>{p.summary}</div>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginTop: 14 }}>
                  <div>
                    <h3 className="pdf-h2">O que está incluído</h3>
                    <ul style={{ margin: 0, padding: 0, listStyle: "none", fontSize: 11.5, lineHeight: 1.65, color: "#16142A" }}>
                      {p.deliverables.map((d, j) => (
                        <li key={j} style={{ paddingLeft: 14, position: "relative", marginBottom: 3 }}>
                          <span style={{ position: "absolute", left: 0, top: 7, width: 6, height: 6, borderRadius: 99, background: "#2EBFC5" }}/>
                          {d}
                        </li>
                      ))}
                    </ul>

                    <h3 className="pdf-h2">Recomendação de utilização</h3>
                    <div style={{
                      fontSize: 11.5, lineHeight: 1.55,
                      padding: 12, borderLeft: "3px solid #2EBFC5",
                      background: "rgba(46,191,197,0.06)",
                      color: "#16142A"
                    }}>{p.recommendation}</div>
                  </div>
                  <div>
                    <h3 className="pdf-h2">Ficha técnica</h3>
                    <dl className="pdf-spec">
                      <dt>Preço</dt><dd>{p.price}</dd>
                      <dt>Modalidade</dt><dd>{p.unit}</dd>
                      <dt>Duração</dt><dd>{p.duration}</dd>
                      <dt>Equipe</dt><dd>{p.team}</dd>
                      <dt>Abrangência</dt><dd>{p.coverage}</dd>
                      <dt>Porte alvo</dt><dd>{p.targetSize}</dd>
                    </dl>
                  </div>
                </div>

                <div className="pdf-footer">
                  <span>Vozz · The Sales Journey · {today}</span>
                  <span>Página {i + 2} de {products.length + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <span className="text-3" style={{ marginRight: "auto", fontSize: 12 }}>
            <Icon name="check" size={12}/> {products.length} produtos · ~{products.length + 1} páginas A4
          </span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-sm"><Icon name="mail" size={13}/> Enviar por email</button>
          <button className="btn btn-sm btn-brand"
                  onClick={() => { window.print(); }}>
            <Icon name="file" size={13}/> Baixar PDF
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Catalog });
