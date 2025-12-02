import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";

interface MapControllerProps {
  bounds: LatLngBounds;
  minZoom: number;
}

export const MapController = ({ bounds, minZoom }: MapControllerProps) => {
  const map = useMap();

  useEffect(() => {
    map.setMinZoom(minZoom);
    map.setMaxBounds(bounds);

    const handleMove = () => {
      const center = map.getCenter();
      const currentZoom = map.getZoom();
      
      if (!bounds.contains(center)) {
        const lat = Math.max(bounds.getSouth(), Math.min(bounds.getNorth(), center.lat));
        const lng = Math.max(bounds.getWest(), Math.min(bounds.getEast(), center.lng));
        map.setView([lat, lng], currentZoom, { animate: false });
      }
    };

    map.on("move", handleMove);
    map.on("moveend", handleMove);

    return () => {
      map.off("move", handleMove);
      map.off("moveend", handleMove);
    };
  }, [map, bounds, minZoom]);

  return null;
};

