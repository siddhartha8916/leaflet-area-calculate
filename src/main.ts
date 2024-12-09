//@ts-nocheck
import { tileLayerOffline, savetiles, SaveStatus } from 'leaflet.offline';
import { Control, DivIcon, Map, Point } from 'leaflet';
import debounce from 'debounce';
import storageLayer from './storageLayer';
import './style.css';
import * as turf from '@turf/turf';
import 'leaflet-draw';

const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const leafletMap = new Map('map');

// offline baselayer, will use offline source if available
const baseLayer = tileLayerOffline(urlTemplate, {
  attribution: 'Map data {attribution.OpenStreetMap}',
  subdomains: 'abc',
  minZoom: 13,
  maxZoom: 18,
}).addTo(leafletMap);

// add buttons to save tiles in area viewed
const saveControl = savetiles(baseLayer, {
  zoomlevels: [13, 14, 15, 16, 17, 18], // optional zoomlevels to save, default current zoomlevel
  alwaysDownload: false,
  confirm(status: SaveStatus, successCallback: Function) {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Save ${status._tilesforSave.length}`)) {
      successCallback();
    }
  },
  confirmRemoval(status: SaveStatus, successCallback: Function) {
    // eslint-disable-next-line no-alert
    if (window.confirm('Remove all the tiles?')) {
      successCallback();
    }
  },
  saveText:
    '<i  title="Save tiles"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></i>',
  rmText:
    '<i title="Remove tiles"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></i>',
});
saveControl.addTo(leafletMap);

leafletMap.setView(
  {
    lat: 8.998864614865049,
    lng: 38.75666524993486
  },
  16,
);
// layer switcher control
const layerswitcher = new Control.Layers(
  {
    'osm (offline)': baseLayer,
  },
  undefined,
  { collapsed: false },
).addTo(leafletMap);
// add storage overlay
storageLayer(baseLayer, layerswitcher);

// events while saving a tile layer
let progress: number;
let total: number;
const showProgress = debounce(() => {
  document.getElementById('progressbar')!.style.width = `${
    (progress / total) * 100
  }%`;
  document.getElementById('progressbar')!.innerHTML = progress.toString();
  if (progress === total) {
    setTimeout(
      () =>
        document.getElementById('progress-wrapper')!.classList.remove('show'),
      1000,
    );
  }
}, 10);

baseLayer.on('savestart', (e) => {
  progress = 0;
  // @ts-ignore
  total = e._tilesforSave.length;
  document.getElementById('progress-wrapper')!.classList.add('show');
  document.getElementById('progressbar')!.style.width = '0%';
});
baseLayer.on('loadtileend', () => {
  progress += 1;
  showProgress();
});

const editableLayers = new L.FeatureGroup();
leafletMap.addLayer(editableLayers);

const options = {
  position: 'topright',
  draw: {
    polyline: false,
    circle: false,
    circlemarker: false,
    polygon: {
      // shapeOptions: {
      //   color: "#bada55",
      // },
      showArea: true,
      edit: true,
      icon: new DivIcon({
        iconSize: new Point(10, 10),
        className: 'leaflet-div-icon leaflet-editing-icon',
      }),
    },
    rectangle: false,
    marker: false,
  },
  edit: {
    featureGroup: editableLayers, //REQUIRED!!
    remove: true,
  },
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const L: any; // --> Works

const drawControl = new L.Control.Draw(options);
leafletMap.addControl(drawControl);

leafletMap.on(L.Draw.Event.CREATED, function (e) {
  const type = e.layerType,
    layer = e.layer;

  // If the drawn object is a polygon
  if (type === 'polygon') {
    const polygonLayer = layer.toGeoJSON();

    console.log('polygonLayer :>> ', polygonLayer); // For debugging

    const latlngs = polygonLayer.geometry.coordinates;
    const polygon = turf.polygon(latlngs);
    const area = turf.area(polygon);
    console.log('Area in square meters :>> ', area); // Log the area
    var popup = L.popup().setContent(`Area: ${area.toFixed(2)} m²`);
    layer.bindPopup(popup).openPopup();
  }

  editableLayers.addLayer(layer);
});

// Listening to draw:edited event
leafletMap.on(L.Draw.Event.EDITED, function (e) {
  const layers = e.layers;

  layers.eachLayer(function (layer) {
    // You can access each edited layer here
    console.log('Layer edited:', layer);
    const polygonLayer = layer.toGeoJSON();
    const latlngs = polygonLayer.geometry.coordinates;
    const polygon = turf.polygon(latlngs);
    const area = turf.area(polygon);
    console.log('Area in square meters :>> ', area); // Log the area
    var popup = L.popup().setContent(`Area: ${area.toFixed(2)} m²`);
    layer.bindPopup(popup).openPopup();
  });
});

// If you need to listen to when layers are deleted
leafletMap.on(L.Draw.Event.DELETED, function (e) {
  const layers = e.layers;

  layers.eachLayer(function (layer) {
    // Handle layer deletion
    console.log('Layer deleted:', layer);
  });
});
