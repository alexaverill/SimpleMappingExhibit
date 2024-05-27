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
  mapTitle,
  baseLayers = [],
  startCoordinates = [44.9377, -93.1007],
  maxZoomLevel = 15,
  minZoomLevel = 13,
  mapBounds = null,
  zoomPosition = "bottomright"
) => {
  if (mapTitle && mapTitle.length > 0) {
    document.querySelector("#mapTitle").innerText = mapTitle;
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
  });
  document.addEventListener("mapCredits", () => {
    let credits = baseLayers.map((layer) => {
      return { name: layer.name, credit: layer.options.attribution };
    });
    document.querySelector("map-credits").setCredits(credits);
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
    var marker = L.marker([point.latitude, point.longitude]).addTo(map);
    marker.on("click", () => {
      poiClicked(point.id);
    });
  });
};
const handleBackgroundClick = () => {
  closeDialog();
};
const closeDialog = () => {
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
};
const setDialogContent = (id) => {
  currentImage = 0;
  content = pointsOfInterest.find((element) => element.id === id);
  dialogTitle.innerText = content.title[currentLanguage].title;

  dialogDescription.innerText =
    content.description[currentLanguage].description;
  document
    .querySelector("image-viewer")
    .setImages(content.images.map((image) => image.image));
};
const load = async () => {
  let data = await fetch("./data.json");
  let json = await data.json();
  pointsOfInterest = json.pointsOfInterest;
  languages = json.languages;
  currentLanguage = 0;
  populateLanguageSelector();
  initializeMap(
    json.mapTitle,
    json.baseLayers,
    json.mapCenter,
    json.maxZoom,
    json.minZoom,
    json.mapBounds
  );
  initializePointsOfInterest(pointsOfInterest);
};
load();
