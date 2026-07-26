import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Correctif connu : les icônes par défaut de Leaflet référencent des chemins
// d'assets qui n'existent pas une fois bundlés par Vite. On les remplace par
// les mêmes fichiers servis depuis unpkg (pas de gestion d'assets locaux à faire).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/** Recentre la carte quand la position change depuis l'extérieur (ex: géolocalisation). */
function RecenterOnChange({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom());
  }, [position]); // eslint-disable-line
  return null;
}

/** Capture les clics sur la carte pour déplacer le marqueur (mode édition uniquement). */
function ClickToMove({ editable, onMove }) {
  useMapEvents({
    click(e) {
      if (editable) onMove([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

/**
 * Carte affichant la position de l'agence et sa zone de couverture (rayon en km).
 * En mode édition, un clic sur la carte déplace le marqueur.
 */
const CoverageMap = ({ latitude, longitude, radiusKm, editable = false, onPositionChange }) => {
  const hasPosition = latitude != null && longitude != null && !Number.isNaN(latitude) && !Number.isNaN(longitude);
  const position = hasPosition ? [latitude, longitude] : [5.354722, -4.008256]; // Abidjan par défaut

  return (
    <div className={`rounded-lg overflow-hidden border border-slate-200 ${editable ? "cursor-crosshair" : ""}`} style={{ height: 280 }}>
      <MapContainer center={position} zoom={hasPosition ? 12 : 6} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPosition && (
          <>
            <Marker position={position} />
            {radiusKm > 0 && (
              <Circle
                center={position}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#4f46e5", fillColor: "#4f46e5", fillOpacity: 0.12 }}
              />
            )}
          </>
        )}
        <RecenterOnChange position={hasPosition ? position : null} />
        <ClickToMove editable={editable} onMove={onPositionChange} />
      </MapContainer>
    </div>
  );
};

export default CoverageMap;
