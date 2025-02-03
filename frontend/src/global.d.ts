import { Layer, LeafletEvent } from "leaflet";

interface LeafletLayer extends Layer {
  clearLayers(): void;
  addData(data: FeatureCollection<Polygon, GeoJsonProperties>): void;
}

interface LeafletEvent {
    storagesize: string
}