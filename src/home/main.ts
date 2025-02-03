import { tileLayerOffline, savetiles, SaveStatus } from "leaflet.offline";
import { Control, DivIcon, Map, Point } from "leaflet";
import * as L from "leaflet";
import debounce from "debounce";
import storageLayer from "./storageLayer";
import * as turf from "@turf/turf";
import "leaflet-draw";
import "../style.css";
import "../main.css";

// const setCoordinatesBtn = document.getElementById(
//   "set-coordinates"
// ) as HTMLElement;
// const resetBtn = document.getElementById("reset") as HTMLElement;
// const areaResult = document.getElementById("area-result") as HTMLElement;

// const urlTemplate = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
// const urlTemplate = "http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
const urlTemplate = "https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}";
// const urlTemplate = "http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}";

let currentMarker: L.Marker | null = null;

export const leafletMap = new Map("map");

// offline baselayer, will use offline source if available
const baseLayer = tileLayerOffline(urlTemplate, {
  attribution: "Map data Google Maps",
  minZoom: 17,
  maxZoom: 22,
  subdomains: ["mt0", "mt1", "mt2", "mt3"],
}).addTo(leafletMap);

// add buttons to save tiles in area viewed
const saveControl = savetiles(baseLayer, {
  zoomlevels: [17, 18, 19, 20, 21, 22], // optional zoomlevels to save, default current zoomlevel
  alwaysDownload: false,
  confirm(status: SaveStatus, successCallback: Function) {
    // eslint-disable-next-line no-alert
    if (window.confirm(`Save ${status._tilesforSave.length}`)) {
      successCallback();
    }
  },
  confirmRemoval(status: SaveStatus, successCallback: Function) {
    console.log({ status });
    if (window.confirm("Remove all the tiles?")) {
      successCallback();
    }
  },
  saveText:
    '<i  title="Save tiles"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg></i>',
  rmText:
    '<i title="Remove tiles"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></i>',
});

// Create a custom SVG icon for the marker
const customIcon = L.icon({
  iconUrl: "location.svg",
  iconSize: [38, 95], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62], // the same for the shadow
  popupAnchor: [-3, -76], // point from which the popup should open relative to the iconAnchor
});

saveControl.addTo(leafletMap);

// Function to set the map to the user's current location and add a marker
function setCurrentLocation() {
  // Check if geolocation is available in the browser
  if (navigator.geolocation) {
    // Get the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Extract latitude and longitude from the position object
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Set the map view to the user's current location
        leafletMap.setView([lat, lng], 16); // Adjust zoom level as needed

        // If a marker already exists, remove it
        if (currentMarker) {
          leafletMap.removeLayer(currentMarker);
        }

        // Create a new marker at the user's location
        currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(
          leafletMap
        );

        // Bind a popup showing the user's location
        currentMarker
          .bindPopup(`Current Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`)
          .openPopup();
      },
      (error) => {
        alert(
          "Unable to retrieve your location. Please make sure you have location permissions enabled."
        );
        console.log({ error });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Call the function to get the current location and plot the marker
setCurrentLocation();

// layer switcher control
const layerswitcher = new Control.Layers(
  {
    "osm (offline)": baseLayer,
  },
  undefined,
  { collapsed: false }
).addTo(leafletMap);
// add storage overlay
storageLayer(baseLayer, layerswitcher);

// events while saving a tile layer
let progress: number;
let total: number;
const showProgress = debounce(() => {
  document.getElementById("progressbar")!.style.width = `${
    (progress / total) * 100
  }%`;
  document.getElementById("progressbar")!.innerHTML = progress.toString();
  if (progress === total) {
    setTimeout(
      () =>
        document.getElementById("progress-wrapper")!.classList.remove("show"),
      1000
    );
  }
}, 10);

baseLayer.on("savestart", (e) => {
  progress = 0;
  // @ts-ignore
  total = e._tilesforSave.length;
  document.getElementById("progress-wrapper")!.classList.add("show");
  document.getElementById("progressbar")!.style.width = "0%";
});
baseLayer.on("loadtileend", () => {
  progress += 1;
  showProgress();
});

const editableLayers = new L.FeatureGroup();
leafletMap.addLayer(editableLayers);

const options = {
  position: "topright",
  draw: {
    polyline: false,
    circle: false,
    circlemarker: false,
    polygon: {
      shapeOptions: {
        color: "#E7000B",
      },
      showArea: true,
      edit: true,
      icon: new DivIcon({
        iconSize: new Point(10, 10),
        className: "leaflet-div-icon leaflet-editing-icon",
      }),
    },
    rectangle: false,
    marker: true,
  },
  edit: {
    featureGroup: editableLayers, //REQUIRED!!
    remove: true,
  },
};

const drawControl = new L.Control.Draw(options as any);
leafletMap.addControl(drawControl);

leafletMap.on(L.Draw.Event.CREATED, function (e) {
  const type = (e as L.DrawEvents.Created).layerType,
    layer = (e as L.DrawEvents.Created).layer;

  // If the drawn object is a polygon
  if (type === "polygon") {
    const polygonLayer = layer.toGeoJSON();

    console.log("polygonLayer :>> ", polygonLayer); // For debugging

    const latlngs = polygonLayer.geometry.coordinates;
    const polygon = turf.polygon(latlngs);
    const area = turf.area(polygon);
    console.log("Area in square meters :>> ", area); // Log the area
    var popup = L.popup().setContent(`Area: ${area.toFixed(2)} m²`);
    layer.bindPopup(popup).openPopup();
  }

  editableLayers.addLayer(layer);
});

// Listening to draw:edited event
leafletMap.on(L.Draw.Event.EDITED, function (e) {
  const layers = (e as L.DrawEvents.Edited).layers;

  layers.eachLayer(function (layer) {
    // You can access each edited layer here
    console.log("Layer edited:", layer);
    // @ts-ignore
    const polygonLayer = layer.toGeoJSON();
    const latlngs = polygonLayer.geometry.coordinates;
    const polygon = turf.polygon(latlngs);
    const area = turf.area(polygon);
    console.log("Area in square meters :>> ", area); // Log the area
    var popup = L.popup().setContent(`Area: ${area.toFixed(2)} m²`);
    layer.bindPopup(popup).openPopup();
  });
});

// If you need to listen to when layers are deleted
leafletMap.on(L.Draw.Event.DELETED, function (e) {
  const layers = (e as L.DrawEvents.Edited).layers;

  layers.eachLayer(function (layer) {
    // Handle layer deletion
    console.log("Layer deleted:", layer);
  });
});

// Function to set map location based on latitude and longitude input
function setMapLocation(lat: number, lng: number) {
  // Set the map's view to the new location
  leafletMap.setView([lat, lng], 16); // You can adjust the zoom level if needed

  // If a marker already exists, remove it
  if (currentMarker) {
    leafletMap.removeLayer(currentMarker);
  }

  // Create a new marker at the specified latitude and longitude
  currentMarker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap);
  currentMarker.bindPopup(`Location: ${lat}, ${lng}`).openPopup();
}

// Add event listener to the "Set Location" button
document.getElementById("set-location-btn")?.addEventListener("click", () => {
  // Get the latitude and longitude string from the input field
  const latlngInput = (
    document.getElementById("latlng-input") as HTMLInputElement
  ).value;

  // Split the input string by the comma to extract lat and lng
  const [latStr, lngStr] = latlngInput.split(",");

  // Parse the latitude and longitude strings into numbers
  const lat = parseFloat(latStr.trim());
  const lng = parseFloat(lngStr.trim());

  // Validate if the latitude and longitude are valid numbers
  if (!isNaN(lat) && !isNaN(lng)) {
    setMapLocation(lat, lng); // Call the function to update map view and add the marker
  } else {
    alert(
      'Please enter valid latitude and longitude in the format: "latitude, longitude"'
    );
  }
});

const setCoordinatesBtn = document.getElementById(
  "set-coordinates"
) as HTMLElement;
let userCoordinates: L.LatLng[] = []; // To store coordinates
let currentPolygon: L.Polygon | null = null; // For the polygon

// Function to handle the button click to set coordinates
setCoordinatesBtn.addEventListener("click", function () {
  const loadingSpinner = document.getElementById(
    "loading-spinner"
  ) as HTMLElement;
  const coordinatesText = document.getElementById("coordinates") as HTMLElement;
  const coordinatesList = document.getElementById(
    "coordinates-list"
  ) as HTMLElement;

  // Show the spinner and hide the coordinates text while fetching
  loadingSpinner.style.display = "inline-block";
  coordinatesText.style.display = "none";

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latlng = L.latLng(lat, lng);

        // Add the coordinate to the array
        userCoordinates.push(latlng);

        // Add a marker for the set coordinate
        L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap);

        // If the user has clicked enough times to form a polygon
        if (userCoordinates.length > 2) {
          // Remove the previous polygon if it exists
          if (currentPolygon) {
            leafletMap.removeLayer(currentPolygon);
          }

          // Create the polygon from the set coordinates
          currentPolygon = L.polygon(userCoordinates).addTo(leafletMap);

          // Calculate the area using Turf.js
          const polygonGeoJSON = currentPolygon.toGeoJSON();
          const area = turf.area(polygonGeoJSON); // area in square meters

          // Display the area in a popup
          currentPolygon.bindPopup(`Area: ${area.toFixed(2)} m²`).openPopup();
        }

        // Optionally, adjust the map view to center on the latest coordinate
        leafletMap.setView(latlng, 16);
        // Update the coordinates text
        coordinatesText.innerHTML = `Latitude: ${lat.toFixed(
          5
        )}, Longitude: ${lng.toFixed(5)}`;

        // Update the list of user coordinates
        const li = document.createElement("li");
        li.textContent = `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
        coordinatesList.appendChild(li);

        // Hide the spinner and show the coordinates text
        loadingSpinner.style.display = "none";
        coordinatesText.style.display = "block";
      },
      (error) => {
        // Handle errors (e.g., permission denied or location unavailable)
        alert("Error fetching location: " + error.message);

        // Hide the spinner and show an error message
        loadingSpinner.style.display = "none";
        coordinatesText.innerHTML = "Unable to retrieve location.";
        coordinatesText.style.display = "block";
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
    // Hide the spinner and show an error message
    loadingSpinner.style.display = "none";
    coordinatesText.innerHTML = "Unable to retrieve location.";
    coordinatesText.style.display = "block";
  }
});

const resetBtn = document.getElementById("reset") as HTMLElement;
resetBtn.addEventListener("click", function () {
  // Clear coordinates and polygon
  userCoordinates = [];
  if (currentPolygon) {
    leafletMap.removeLayer(currentPolygon);
  }
  currentPolygon = null;
  setCurrentLocation();
});

export default leafletMap;
