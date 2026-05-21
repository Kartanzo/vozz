// ============================================================
// 3LACKD CRM — Roteirização (Routing)
// ============================================================

// Haversine — distância (km) entre 2 coords
const haversineKm = (a, b) => {
 const R = 6371;
 const toRad = (d) => d * Math.PI / 180;
 const dLat = toRad(b.lat - a.lat);
 const dLng = toRad(b.lng - a.lng);
 const s = Math.sin(dLat/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
 return Math.round(2 * R * Math.asin(Math.sqrt(s)));
};

const Routes = ({ t, lang }) => {
 const [mode, setMode] = React.useState("auto"); // "auto" | "manual"
 const [origin, setOrigin] = React.useState(ROUTE_ORIGIN.label);
 const [radiusKm, setRadiusKm] = React.useState(150);
 const [routeInfo, setRouteInfo] = React.useState({ km: 0, min: 0, geometry: null });
 const originCoords = { lat: ROUTE_ORIGIN.lat, lng: ROUTE_ORIGIN.lng, label: origin };

 // Apenas clientes dentro do raio configurado a partir da origem
 const nearbyClients = React.useMemo(
 () => ROUTE_CLIENTS
 .map(c => ({ ...c, distKm: haversineKm(originCoords, c) }))
 .filter(c => c.distKm <= radiusKm)
 .sort((a, b) => a.distKm - b.distKm),
 [radiusKm, originCoords.lat, originCoords.lng]
 );
 const [included, setIncluded] = React.useState(() =>
 new Set(ROUTE_CLIENTS.filter(c => c.alert).map(c => c.id))
 );
 const [order, setOrder] = React.useState(() =>
 ROUTE_CLIENTS.filter(c => c.alert).map(c => c.id)
 );
 const [dragIdx, setDragIdx] = React.useState(null);

 // Quando o raio muda, remove ids que ficaram fora do raio
 React.useEffect(() => {
 const nearbyIds = new Set(nearbyClients.map(c => c.id));
 setIncluded(prev => {
 const n = new Set();
 prev.forEach(id => { if (nearbyIds.has(id)) n.add(id); });
 return n;
 });
 setOrder(prev => prev.filter(id => nearbyIds.has(id)));
 }, [radiusKm]);

 // Apply auto-suggestion when switching to auto
 const applyAuto = () => {
 const alerts = nearbyClients
 .filter(c => c.alert || c.inactive >= 21)
 .sort((a, b) => b.inactive - a.inactive);
 setIncluded(new Set(alerts.map(c => c.id)));
 setOrder(alerts.map(c => c.id));
 };

 const toggleClient = (id) => {
 const n = new Set(included);
 if (n.has(id)) {
 n.delete(id);
 setOrder(o => o.filter(x => x !== id));
 } else {
 n.add(id);
 setOrder(o => [...o, id]);
 }
 setIncluded(n);
 };

 const onDragStart = (idx) => setDragIdx(idx);
 const onDrop = (idx) => {
 if (dragIdx == null || dragIdx === idx) return;
 setOrder(o => {
 const n = [...o];
 const [moved] = n.splice(dragIdx, 1);
 n.splice(idx, 0, moved);
 return n;
 });
 setDragIdx(null);
 };

 const stops = order.map(id => ROUTE_CLIENTS.find(c => c.id === id)).filter(Boolean);
 const totalValue = stops.reduce((s, c) => s + c.value, 0);

 // Consulta OSRM (rota real por estrada — gratuita, sem API key)
 React.useEffect(() => {
 if (!stops.length) { setRouteInfo({ km: 0, min: 0, geometry: null, legs: [] }); return; }
 const coords = [originCoords, ...stops]
 .map(p => `${p.lng},${p.lat}`).join(";");
 const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
 let cancel = false;
 fetch(url)
 .then(r => r.json())
 .then(j => {
 if (cancel || !j.routes || !j.routes[0]) return;
 const r = j.routes[0];
 setRouteInfo({
 km: Math.round(r.distance / 1000),
 min: Math.round(r.duration / 60),
 geometry: r.geometry,
 legs: (r.legs || []).map(l => ({
 km: Math.round(l.distance / 1000),
 min: Math.round(l.duration / 60),
 })),
 });
 })
 .catch(() => {
 // fallback haversine
 let km = 0, prev = originCoords;
 const legs = stops.map(c => { const d = haversineKm(prev, c); km += d; prev = c; return { km: d, min: Math.round(d/70*60) }; });
 setRouteInfo({ km, min: Math.round(km/70*60), geometry: null, legs });
 });
 return () => { cancel = true; };
 }, [order.join(","), originCoords.lat, originCoords.lng]);

 const totalKm = routeInfo.km;
 const totalMin = routeInfo.min;
 const legs = (routeInfo.legs || []).map(l => l.km);

 return (
 <div>
 <div className="section-title">
 <div>
 <h2>{t.routing}</h2>
 <div className="sub">Sugestões inteligentes a partir de alertas de inatividade ou rotas montadas manualmente.</div>
 </div>
 <div className="row gap-2">
 <div className="toggle-group">
 <button aria-current={mode === "auto"} onClick={() => { setMode("auto"); applyAuto(); }}>
 <Icon name="sparkles" size={12}/> Sugerida
 </button>
 <button aria-current={mode === "manual"} onClick={() => setMode("manual")}>
 <Icon name="bolt" size={12}/> Manual
 </button>
 </div>
 <button className="btn btn-sm" onClick={() => {
 const csv = "ordem,cliente,endereco,lat,lng\n" + stops.map((c, i) => `${i+1},"${c.account}","${c.addr}",${c.lat},${c.lng}`).join("\n");
 const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
 const url = URL.createObjectURL(blob);
 const a = document.createElement("a"); a.href = url; a.download = "3lackd_rota.csv"; a.click();
 URL.revokeObjectURL(url);
 }}><Icon name="export" size={13}/> Exportar rota</button>
 <button className="btn btn-sm btn-primary" onClick={() => {
 if (!stops.length) { blackdAlert("Adicione paradas à rota antes de salvar.", "Rota vazia"); return; }
 blackdAlert(`${stops.length} paradas · ${totalKm} km · ${Math.floor(totalMin/60)}h${totalMin%60}min`, " Rota salva na agenda");
 }}><Icon name="calendar" size={13}/> Salvar na agenda</button>
 </div>
 </div>

 <div className="route-stats">
 <RouteStat label="Paradas" value={stops.length}/>
 <RouteStat label="Distância est." value={`${totalKm} km`}/>
 <RouteStat label="Tempo de trânsito" value={`${Math.floor(totalMin / 60)}h ${totalMin % 60}min`}/>
 <RouteStat label="Pipeline na rota" value={`R$ ${totalValue}k`}/>
 </div>

 <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 380px", gap: 16, alignItems: "start" }}>
 <div className="card" style={{ padding: 0, overflow: "hidden" }}>
 <div className="card-header">
 <Icon name="map" size={14}/>
 <div>
 <div className="card-title">Mapa da rota</div>
 <div className="card-sub">Sul + Sudeste do Brasil · cálculo via integração Google Maps</div>
 </div>
 <div className="row gap-2" style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-3)" }}>
 <span>tráfego atual: <b style={{ color: "var(--warning)" }}>moderado</b></span>
 </div>
 </div>
 <RouteMap stops={stops} all={nearbyClients} included={included} origin={originCoords} geometry={routeInfo.geometry}/>
 <div className="row gap-2" style={{ padding: 12, borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
 <a
 className="btn btn-sm btn-primary"
 href={buildGoogleMapsUrl(originCoords, stops) || "#"}
 target="_blank" rel="noopener"
 onClick={(e) => { if (!stops.length) e.preventDefault(); }}
 style={{ opacity: stops.length ? 1 : 0.5, pointerEvents: stops.length ? "auto" : "none" }}>
 <Icon name="map" size={13}/> Abrir no Google Maps
 </a>
 <a
 className="btn btn-sm"
 href={buildWazeUrl(stops[0]) || "#"}
 target="_blank" rel="noopener"
 onClick={(e) => { if (!stops.length) e.preventDefault(); }}
 style={{ opacity: stops.length ? 1 : 0.5, pointerEvents: stops.length ? "auto" : "none" }}>
 <Icon name="bolt" size={13}/> Abrir no Waze (1ª parada)
 </a>
 <span className="text-3" style={{ fontSize: 11, marginLeft: "auto" }}>
 No celular, abre direto no app instalado.
 </span>
 </div>
 </div>

 <div className="col gap-3">
 <div className="card">
 <div className="card-header">
 <div className="card-title">Origem</div>
 </div>
 <div style={{ padding: 14 }}>
 <label className="label">Ponto de partida</label>
 <div className="row gap-2">
 <input className="input" value={origin} onChange={(e) => setOrigin(e.target.value)}/>
 <button className="btn btn-sm" title="Usar minha localização atual">
 <Icon name="target" size={13}/>
 </button>
 </div>
 <div className="text-3 mt-2" style={{ fontSize: 11.5 }}>
 <Icon name="clock" size={10}/> Início estimado: hoje 08:30
 </div>
 <label className="label mt-3">Raio máximo da rota</label>
 <select className="input" value={radiusKm} onChange={e => setRadiusKm(Number(e.target.value))}>
 <option value={50}>50 km (local)</option>
 <option value={100}>100 km (região)</option>
 <option value={150}>150 km (estado)</option>
 <option value={250}>250 km (estendido)</option>
 <option value={500}>500 km (multi-estado)</option>
 </select>
 <div className="text-3 mt-2" style={{ fontSize: 11.5 }}>
 {nearbyClients.length} clientes dentro de {radiusKm} km da origem.
 </div>
 </div>
 </div>

 {mode === "auto" && (
 <div className="card" style={{ background: "var(--brand-grad-soft)", borderColor: "transparent" }}>
 <div style={{ padding: 16 }}>
 <div className="row gap-2 mb-2">
 <Icon name="sparkles" size={14}/>
 <span style={{ fontWeight: 700, fontSize: 13 }}>Sugestão 3lackd IA</span>
 </div>
 <div className="text-2" style={{ fontSize: 12.5 }}>
 Selecionamos automaticamente as {included.size} contas com inatividade acima de 21 dias na sua região,
 priorizando o maior tempo sem contato.
 </div>
 <button className="btn btn-sm mt-4" onClick={applyAuto}>
 <Icon name="bolt" size={12}/> Recalcular sugestão
 </button>
 </div>
 </div>
 )}

 <div className="card">
 <div className="card-header">
 <div className="card-title">Paradas ({stops.length})</div>
 <span className="text-3" style={{ marginLeft: "auto", fontSize: 11 }}>arraste para reordenar</span>
 </div>
 <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, maxHeight: 320, overflowY: "auto" }}>
 {stops.map((c, idx) => (
 <div key={c.id}
 className={"route-stop " + (dragIdx === idx ? "dragging" : "")}
 draggable
 onDragStart={() => onDragStart(idx)}
 onDragOver={(e) => e.preventDefault()}
 onDrop={() => onDrop(idx)}>
 <div className="route-stop-number">{idx + 1}</div>
 <div className="flex-1" style={{ minWidth: 0 }}>
 <div style={{ fontWeight: 700, fontSize: 13 }}>{c.account}</div>
 <div className="text-3" style={{ fontSize: 11.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.addr}</div>
 <div className="row gap-2 mt-2" style={{ fontSize: 11 }}>
 <span className="badge" style={{ fontSize: 10.5 }}>{c.category}</span>
 <span className="text-3"><Icon name="clock" size={10}/> {routeInfo.legs?.[idx]?.km ?? "—"} km · {routeInfo.legs?.[idx]?.min ?? "—"} min</span>
 {c.alert && <span className="badge badge-warning" style={{ fontSize: 10.5 }}><Icon name="bell" size={9}/> alerta</span>}
 </div>
 </div>
 <button className="icon-btn" onClick={() => toggleClient(c.id)} title="Remover">
 <Icon name="x" size={13}/>
 </button>
 </div>
 ))}
 {stops.length === 0 && (
 <div className="text-3" style={{ fontSize: 12, padding: 20, textAlign: "center" }}>
 Selecione clientes na lista abaixo para montar sua rota.
 </div>
 )}
 </div>
 </div>
 </div>
 </div>

 <div className="card mt-4">
 <div className="card-header">
 <div>
 <div className="card-title">Clientes disponíveis na região</div>
 <div className="card-sub">Sugestões de visita técnica e oportunidades em aberto</div>
 </div>
 <span className="text-3" style={{ marginLeft: "auto", fontSize: 12 }}>
 {nearbyClients.length} contas em até {radiusKm} km
 </span>
 </div>
 <table className="table">
 <thead>
 <tr>
 <th style={{ width: 36 }}></th>
 <th>Cliente</th>
 <th>Endereço</th>
 <th>Motivo</th>
 <th style={{ textAlign: "right" }}>Pipeline</th>
 <th>Último contato</th>
 <th style={{ textAlign: "right" }}>Distância</th>
 </tr>
 </thead>
 <tbody>
 {nearbyClients.map(c => (
 <tr key={c.id}>
 <td onClick={() => toggleClient(c.id)} style={{ cursor: "pointer" }}>
 <input type="checkbox" checked={included.has(c.id)} readOnly style={{ accentColor: "var(--brand-teal)" }}/>
 </td>
 <td style={{ fontWeight: 600 }}>{c.account}</td>
 <td className="text-2" style={{ fontSize: 12.5 }}>{c.addr}</td>
 <td>
 {c.alert
 ? <span className="badge badge-warning"><Icon name="bell" size={10}/> {c.category}</span>
 : <span className="badge">{c.category}</span>}
 </td>
 <td style={{ textAlign: "right", fontWeight: 700 }}>
 {c.value > 0 ? `R$ ${c.value}k` : <span className="text-3">—</span>}
 </td>
 <td className="text-2" style={{ fontSize: 12.5 }}>{c.last}</td>
 <td style={{ textAlign: "right" }} className="text-2">{c.distKm} km</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 );
};

const RouteStat = ({ label, value }) => (
 <div className="route-stat">
 <div className="l">{label}</div>
 <div className="v">{value}</div>
 </div>
);

// Leaflet route map: origin → stops, with deeplinks to Google Maps / Waze
const RouteMap = ({ stops, all, included, origin, geometry }) => {
 const containerRef = React.useRef(null);
 const mapRef = React.useRef(null);
 const layersRef = React.useRef([]);

 // Init
 React.useEffect(() => {
 if (!containerRef.current || mapRef.current) return;
 const map = L.map(containerRef.current, {
 center: [origin.lat, origin.lng], zoom: 6, zoomControl: true,
 });
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
 maxZoom: 19, attribution: "© OpenStreetMap",
 }).addTo(map);
 mapRef.current = map;
 setTimeout(() => map.invalidateSize(), 80);
 return () => { map.remove(); mapRef.current = null; };
 }, []);

 // Redraw markers + line whenever route changes
 React.useEffect(() => {
 const map = mapRef.current;
 if (!map) return;
 layersRef.current.forEach(l => map.removeLayer(l));
 layersRef.current = [];

 // Origin marker
 const originIcon = L.divIcon({
 className: "route-leaflet-origin",
 html: '<div style="background:#1a1a2e;color:#fff;border:3px solid #fff;border-radius:50%;width:24px;height:24px;display:grid;place-items:center;font-size:11px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.35)">S</div>',
 iconSize: [24, 24], iconAnchor: [12, 12],
 });
 const oM = L.marker([origin.lat, origin.lng], { icon: originIcon }).addTo(map);
 oM.bindTooltip("Saída · " + origin.label, { direction: "top" });
 layersRef.current.push(oM);

 // Stop markers (numbered)
 stops.forEach((c, i) => {
 const icon = L.divIcon({
 className: "route-leaflet-stop",
 html: `<div style="background:${c.alert ? "#D88514" : "#2EBFC5"};color:#fff;border:3px solid #fff;border-radius:50%;width:28px;height:28px;display:grid;place-items:center;font-size:12px;font-weight:800;box-shadow:0 2px 6px rgba(0,0,0,.35)">${i + 1}</div>`,
 iconSize: [28, 28], iconAnchor: [14, 14],
 });
 const m = L.marker([c.lat, c.lng], { icon }).addTo(map);
 m.bindTooltip(`${i + 1}. ${c.account}`, { direction: "top" });
 layersRef.current.push(m);
 });

 // Excluded stops (small grey dots)
 all.forEach(c => {
 if (included.has(c.id)) return;
 const dot = L.circleMarker([c.lat, c.lng], {
 radius: 5, color: "#fff", weight: 1.5, fillColor: "#8A8899", fillOpacity: 0.85,
 }).addTo(map);
 dot.bindTooltip(c.account, { direction: "top" });
 layersRef.current.push(dot);
 });

 // Linha: usa geometria real do OSRM (estradas) quando disponível, senão fallback reto
 let line = null;
 if (geometry && geometry.coordinates && geometry.coordinates.length > 1) {
 const pts = geometry.coordinates.map(([lng, lat]) => [lat, lng]);
 line = L.polyline(pts, {
 color: "#2EBFC5", weight: 5, opacity: 0.9, lineCap: "round", lineJoin: "round",
 }).addTo(map);
 } else if (stops.length) {
 const pts = [[origin.lat, origin.lng], ...stops.map(c => [c.lat, c.lng])];
 line = L.polyline(pts, {
 color: "#2EBFC5", weight: 4, opacity: 0.7,
 dashArray: "8 6", lineCap: "round", lineJoin: "round",
 }).addTo(map);
 }
 if (line) {
 layersRef.current.push(line);
 map.fitBounds(line.getBounds(), { padding: [30, 30] });
 } else {
 map.setView([origin.lat, origin.lng], 8);
 }
 }, [stops, all, included, origin, geometry]);

 return (
 <div
 ref={containerRef}
 style={{
 position: "relative", height: 480,
 borderTop: "1px solid var(--border)", overflow: "hidden",
 }}
 />
 );
};

// Build deeplinks
const buildGoogleMapsUrl = (origin, stops) => {
 if (!stops.length) return null;
 const base = "https://www.google.com/maps/dir/?api=1";
 const o = `${origin.lat},${origin.lng}`;
 const dest = stops[stops.length - 1];
 const d = `${dest.lat},${dest.lng}`;
 const waypoints = stops.slice(0, -1).map(s => `${s.lat},${s.lng}`).join("|");
 let url = `${base}&origin=${encodeURIComponent(o)}&destination=${encodeURIComponent(d)}&travelmode=driving`;
 if (waypoints) url += `&waypoints=${encodeURIComponent(waypoints)}`;
 return url;
};
const buildWazeUrl = (stop) => stop
 ? `https://www.waze.com/ul?ll=${stop.lat}%2C${stop.lng}&navigate=yes`
 : null;

Object.assign(window, { buildGoogleMapsUrl, buildWazeUrl });

Object.assign(window, { Routes });
