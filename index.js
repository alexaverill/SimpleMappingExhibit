let map;
let currentImage = 0;
let content = null;
let dialogTitle = document.getElementById("dialogTitle");
let dialogImage = document.getElementById("dialogImage");
let dialogDescription = document.getElementById("dialogDescription");
let isClicked = false;
let startPos = null;
let endPos = null;
let rectangle = null;
let pointsOfInterest = null;
let mapLayerControl;
let languages;
let currentLanguage;
let selectedId = null;
let mapTitles;
let timeoutComponent = document.querySelector("timeout-component");

const setBaseLayers = (baseLayers) => {
  map.eachLayer((layer) => {
    map.removeLayer(layer);
  });
  if (mapLayerControl) {
    map.removeControl(mapLayerControl);
  }
  let tileNames = {};
  for (let layer of baseLayers) {
    let tileLayer = L.tileLayer(layer.tileUrl, layer.options);
    tileLayer.addTo(map);
    tileNames[layer.name] = tileLayer;
  }

  mapLayerControl = L.control
    .layers(tileNames, {}, { position: "bottomright" })
    .addTo(map);
};
const initializeMap = (
  mapTitles,
  baseLayers = [],
  startCoordinates = [44.9377, -93.1007],
  maxZoomLevel = 15,
  minZoomLevel = 13,
  mapBounds = null,
  customCredits = [],
  zoomPosition = "bottomright"
) => {
  if (mapTitles && mapTitles.length > 0) {
    document.querySelector("#mapTitle").innerText =
      mapTitles[currentLanguage].title;
  }
  map = L.map("map", { attributionControl: false }).setView(
    startCoordinates,
    minZoomLevel
  );
  var zoomHome = new L.Control.zoomHome();
  var creditsControl = new L.Control.creditsControl();
  creditsControl.addTo(map);
  zoomHome.addTo(map);
  document.addEventListener("mapRecenter", () => {
    map.setView(startCoordinates);
    map.setZoom(minZoomLevel);
  });
  document.addEventListener("mapCredits", () => {
    timeoutComponent.setAttribute("timeout-active", "true");
    let credits = baseLayers.map((layer) => {
      return { name: layer.name, credit: layer.options.attribution };
    });
    document.querySelector("map-credits").setCredits(credits, customCredits);
    document.querySelector("map-credits").show();
  });
  map.zoomControl.remove();
  if (minZoomLevel !== maxZoomLevel) {
    L.control
      .zoom({
        position: zoomPosition,
      })
      .addTo(map);
  }
  map.setZoom(minZoomLevel);
  map.setMinZoom(minZoomLevel);
  map.setMaxZoom(maxZoomLevel);
  if (mapBounds) {
    let bounds = L.latLngBounds(mapBounds._northEast, mapBounds._southWest);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }
  setBaseLayers(baseLayers);
  map.on("click", (e) => {
    if (!isClicked) {
      startPos = e.latlng;
    }
    isClicked = !isClicked;
  });
};
const initializePointsOfInterest = (points) => {
  points.map((point) => {
    let marker;
    if (point.marker) {
      console.log(point.marker);
      let icon = L.icon({
        iconUrl: point.marker.image,
        iconSize: point.marker.size,
        iconAnchor: point.marker.offset,
      });
      marker = L.marker([point.latitude, point.longitude], { icon }).addTo(map);
    } else {
      marker = L.marker([point.latitude, point.longitude]).addTo(map);
    }
    marker.on("click", () => {
      poiClicked(point.id);
    });
  });
};
const handleBackgroundClick = () => {
  closeDialog();
};
const closeDialog = () => {
  timeoutComponent.setAttribute("timeout-active", "false");
  selectedId = null;
  document
    .getElementById("dialogBackground")
    .classList.remove("dialogBackgroundVisible");
  document.getElementById("dialog").classList.remove("visible");
};
const poiClicked = (id) => {
  setDialogContent(id);
  selectedId = id;
  document
    .getElementById("dialogBackground")
    .classList.add("dialogBackgroundVisible");
  document.getElementById("dialog").classList.toggle("visible");
  timeoutComponent.setAttribute("timeout-active", true);
};
const populateLanguageSelector = () => {
  if (languages.length == 1) {
  }
  let languageSelector = document.getElementById("languageSelector");
  languageSelector.innerHTML = "";
  if (languages.length == 1) {
    languageSelector.hidden = true;
  }
  let languageOptions = [];
  for (var language of languages) {
    let option = document.createElement("option");
    option.value = language;
    option.innerText = language;
    languageSelector.appendChild(option);
  }
};
const handleLanguageSelection = (e) => {
  currentLanguage = languages.indexOf(e.value);
  if (selectedId) {
    setDialogContent(selectedId);
  }
  document.querySelector("#mapTitle").innerText =
    mapTitles[currentLanguage].title;
};
const setDialogContent = (id) => {
  currentImage = 0;
  content = pointsOfInterest.find((element) => element.id === id);
  dialogTitle.innerText = content.titles[currentLanguage].title;

  dialogDescription.innerText =
    content.descriptions[currentLanguage].description;
  document
    .querySelector("image-viewer")
    .setImages(content.images.map((image) => image.image));
};
const setMapTitle = () => {};
const load = async () => {
  //check if we want to override which data we are pulling
  const urlParams = new URL(window.location).searchParams;
  let data = urlParams.get("data");
  let jsonData;
  if (data === "moon") {
    json = apolloData;
  } else {
    json = mapData;
  }
  pointsOfInterest = json.pointsOfInterest;
  languages = json.languages;
  currentLanguage = 0;
  mapTitles = json.mapTitles;
  populateLanguageSelector();
  initializeMap(
    json.mapTitles,
    json.baseLayers,
    json.mapCenter,
    json.maxZoom,
    json.minZoom,
    json.mapBounds,
    json.customCredits
  );
  initializePointsOfInterest(pointsOfInterest);
};
const handleTimeout = () => {
  timeoutComponent.setAttribute("timeout-active", "false");
  document.dispatchEvent(new CustomEvent("mapRecenter"));
  document.querySelector("map-credits").closeDialog();
  closeDialog();
};
load();
document.addEventListener("timeout", handleTimeout);
