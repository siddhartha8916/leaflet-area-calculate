import { Control, geoJSON } from "leaflet";
import {
  getStorageInfo,
  getStoredTilesAsJson,
  TileLayerOffline,
} from "leaflet.offline";
import { LeafletLayer } from "../global";

const urlTemplate = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

export default function storageLayer(
  baseLayer: TileLayerOffline,
  layerswitcher: Control.Layers
) {
  let layer: LeafletLayer;

  const getGeoJsonData = async () => {
    const tiles = await getStorageInfo(urlTemplate);
    return getStoredTilesAsJson(baseLayer.getTileSize(), tiles);
  };

  const addStorageLayer = async () => {
    const geojson = await getGeoJsonData();
    layer = geoJSON(geojson).bindPopup(
      // @ts-ignore
      (clickedLayer) => clickedLayer.feature.properties.key
    );
    layerswitcher.addOverlay(layer, "offline tiles");
  };

  addStorageLayer();

  baseLayer.on("storagesize", (e) => {
    const storageElement = document?.getElementById("storage");
    if (storageElement) {
       // @ts-ignore
      storageElement.innerHTML = e.storagesize;
    }
    if (layer) {
      layer.clearLayers();
      getGeoJsonData().then((data) => {
        layer?.addData(data);
      });
    }
  });
}
