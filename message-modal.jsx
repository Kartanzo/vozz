// ============================================================
// VOZZ CRM — Message composer (WhatsApp + Email)
// ============================================================

const MessageModal = ({ accountName, contactName = "Sandra Oliveira", phone = "(11) 9.8132-4421",
                       email = "sandra@empresa.com.br", initialChannel = "whatsapp", onClose }) => {
  const [channel, setChannel] = React.useState(initialChannel);
  const [templateId, setTemplateId] = React.useState(MSG_TEMPLATES[channel][0].id);
  const [text, setText] = React.useState(() => fillTemplate(MSG_TEMPLATES[channel][0].text, accountName, contactName));
  const [subject, setSubject] = React.useState("Vozz — Próximos passos");
  const [sent, setSent] = React.useState(false);

  function fillTemplate(tpl, empresa, nome) {
    return tpl
      .replaceAll("{nome}", nome.split(" ")[0])
      .replaceAll("{empresa}", empresa)
      .replaceAll("{dias}", "21");
  }

  const switchChannel = (c) => {
    setChannel(c);
    const tpl = MSG_TEMPLATES[c][0];
    setTemplateId(tpl.id);
    setText(fillTemplate(tpl.text, accountName, contactName));
  };

  const useTemplate = (id) => {
    setTemplateId(id);
    const tpl = MSG_TEMPLATES[channel].find(t => t.id === id);
    setText(fillTemplate(tpl.text, accountName, contactName));
  };

  const send = () => {
    setSent(true);
    setTimeout(() => { onClose(); }, 1100);
  };

  if (sent) {
    return (
      <div className="modal-backdrop open">
        <div className="modal" style={{ width: 360 }}>
          <div className="modal-body" style={{ textAlign: "center", padding: 36 }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "var(--success)", color: "white",
              display: "grid", placeItems: "center", margin: "0 auto 14px"
            }}>
              <Icon name="check" size={26}/>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Mensagem enviada</div>
            <div className="text-3 mt-2" style={{ fontSize: 13 }}>
              Registrada como atividade no histórico de {accountName}.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="feed-icon brand" style={{ width: 40, height: 40 }}>
            <Icon name={channel === "whatsapp" ? "message" : "mail"} size={18}/>
          </div>
          <div className="flex-1">
            <div className="modal-title">Mensagem para {contactName}</div>
            <div className="text-3" style={{ fontSize: 12 }}>{accountName}</div>
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="x" size={16}/></button>
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <div className="toggle-group" style={{ width: "100%" }}>
            <button aria-current={channel === "whatsapp"} onClick={() => switchChannel("whatsapp")} style={{ flex: 1, padding: "6px 12px" }}>
              <Icon name="message" size={12}/> WhatsApp
            </button>
            <button aria-current={channel === "email"} onClick={() => switchChannel("email")} style={{ flex: 1, padding: "6px 12px" }}>
              <Icon name="mail" size={12}/> Email
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ paddingTop: 16 }}>
          <label className="label">Template</label>
          <div className="row gap-2" style={{ flexWrap: "wrap", marginBottom: 14 }}>
            {MSG_TEMPLATES[channel].map(tpl => (
              <button key={tpl.id} className="filter-chip"
                      onClick={() => useTemplate(tpl.id)}
                      style={{
                        background: templateId === tpl.id ? "var(--brand-grad-soft)" : "transparent",
                        borderColor: templateId === tpl.id ? "var(--brand-teal)" : "var(--border-strong)",
                        borderStyle: "solid",
                        color: "var(--text)",
                      }}>
                {tpl.title}
              </button>
            ))}
          </div>

          <div className="row gap-3 mb-2">
            <div className="flex-1">
              <label className="label">{channel === "whatsapp" ? "Para" : "Destinatário"}</label>
              <input className="input" value={channel === "whatsapp" ? phone : email} readOnly/>
            </div>
            {channel === "email" && (
              <div className="flex-1">
                <label className="label">Assunto</label>
                <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)}/>
              </div>
            )}
          </div>

          <label className="label">Mensagem</label>
          <textarea className="input"
                    style={{ height: 140, padding: 12, resize: "vertical", lineHeight: 1.55 }}
                    value={text} onChange={(e) => setText(e.target.value)}/>

          <label className="label mt-4">Preview</label>
          {channel === "whatsapp" ? (
            <div className="wp-chat">
              <div className="text-3 mb-2" style={{ fontSize: 11, textAlign: "center" }}>
                Hoje, {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="wp-preview">
                {text}
                <div className="wp-preview-meta">enviado · <Icon name="check" size={9}/></div>
              </div>
            </div>
          ) : (
            <div className="em-preview">
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{subject}</div>
              <div className="text-3" style={{ fontSize: 11.5, marginBottom: 12 }}>
                De: camila@vozz.com.br · Para: {email}
              </div>
              <div className="divider" style={{ margin: "0 0 12px" }}/>
              {text}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span className="text-3" style={{ marginRight: "auto", fontSize: 12 }}>
            <Icon name="document" size={12}/> Será registrado como atividade na conta
          </span>
          <button className="btn btn-sm btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-sm btn-brand" onClick={send}>
            <Icon name="message" size={13}/> Enviar via {channel === "whatsapp" ? "WhatsApp" : "Email"}
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MessageModal });
