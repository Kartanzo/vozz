// ============================================================
// VOZZ CRM — World map (Leaflet + heatmap)
// ============================================================

const STATUS_COLOR = {
  customer: "#16A07C",
  lead:     "#3F5BA8",
  prospect: "#8A8899",
  inactive: "#D63B5C",
};

const HEAT_INTENSITY = { hot: 1.0, warm: 0.6, cold: 0.3 };

const WorldMap = ({ pins, heat, onPinClick, showHeat = true, height = 480 }) => {
  const containerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const heatLayerRef = React.useRef(null);
  const markersRef = React.useRef([]);

  // Init map once
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: [-14.5, -52],
      zoom: 4,
      worldCopyJump: true,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;

    // Force resize after layout settles
    setTimeout(() => map.invalidateSize(), 80);

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Heat layer
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }
    if (showHeat) {
      // Build heat points from pins + heat regions for richer density
      const pts = [];
      (pins || []).forEach(p => {
        if (p.lat != null && p.lng != null) {
          const w = p.status === "customer" ? 1.0
                  : p.status === "lead"     ? 0.7
                  : p.status === "inactive" ? 0.5 : 0.4;
          pts.push([p.lat, p.lng, w]);
        }
      });
      (heat || []).forEach(h => {
        if (h.lat != null && h.lng != null) {
          pts.push([h.lat, h.lng, HEAT_INTENSITY[h.heat] || 0.5]);
        }
      });
      heatLayerRef.current = L.heatLayer(pts, {
        radius: 28,
        blur: 22,
        minOpacity: 0.35,
        maxZoom: 10,
        gradient: {
          0.2: "#4A8BC8",
          0.4: "#16A07C",
          0.6: "#D88514",
          0.85: "#D63B5C",
        },
      }).addTo(map);
    }
  }, [pins, heat, showHeat]);

  // Markers
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    (pins || []).forEach(p => {
      if (p.lat == null || p.lng == null) return;
      const color = STATUS_COLOR[p.status] || "#3F5BA8";
      const marker = L.circleMarker([p.lat, p.lng], {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 0.95,
      }).addTo(map);
      marker.bindTooltip(p.city, { direction: "top", offset: [0, -6] });
      marker.on("click", () => onPinClick && onPinClick(p));
      markersRef.current.push(marker);
    });
  }, [pins, onPinClick]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative", width: "100%", height,
        borderRadius: "var(--r-lg)", overflow: "hidden",
        border: "1px solid var(--border)",
      }}
    />
  );
};

Object.assign(window, { WorldMap, STATUS_COLOR });
