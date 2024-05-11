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
const setBaseLayers = (baseLayers) => {
  map.eachLayer((layer) => {
    map.removeLayer(layer);
  });
  if (mapLayerControl) {
    map.removeControl(mapLayerControl);
  }
  let tileNames = {};
  for (let layer of baseLayers) {
    console.log(layer);
    let tileLayer = L.tileLayer(layer.tileUrl, layer.options);
    tileLayer.addTo(map);
    tileNames[layer.name] = tileLayer;
  }
  mapLayerControl = L.control
    .layers(tileNames, {}, { position: "bottomright" })
    .addTo(map);
};
const initializeMap = (
  baseLayers = [],
  startCoordinates = [44.9377, -93.1007],
  maxZoomLevel = 15,
  minZoomLevel = 13,
  mapBounds = null,
  zoomPosition = "bottomright"
) => {
  map = L.map("map").setView(startCoordinates, minZoomLevel);

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
  console.log(mapBounds);
  if (mapBounds) {
    let bounds = L.latLngBounds(mapBounds._northEast, mapBounds._southWest);
    map.setMaxBounds(bounds);
    map.fitBounds(bounds);
  }
  setBaseLayers(baseLayers);
  map.on("click", (e) => {
    console.log(`Clicked at ${e.latlng}`);
    if (isClicked) {
      console.log("Reset map bounds");
    } else {
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
const handlePreviousImage = () => {
  if (!content) {
    return;
  }
  currentImage =
    currentImage > 0 ? currentImage - 1 : content.images.length - 1;
  console.log(content.images.length);
  dialogImage.opacity = 0;
  dialogImage.src = content.images[currentImage].image;
  dialogImage.opacity = 1;
};
const handleNextImage = () => {
  if (!content) {
    return;
  }
  currentImage = (currentImage + 1) % content.images.length;
  dialogImage.opacity = 0;
  dialogImage.src = content.images[currentImage].image;
  dialogImage.opacity = 1;
};
const closeDialog = () => {
  document
    .getElementById("dialogBackground")
    .classList.remove("dialogBackgroundVisible");
  document.getElementById("dialog").classList.remove("visible");
};
const poiClicked = (id) => {
  setDialogContent(id);
  document
    .getElementById("dialogBackground")
    .classList.add("dialogBackgroundVisible");
  document.getElementById("dialog").classList.toggle("visible");
  console.log(`Clicked ${id}`);
};
const setDialogContent = (id) => {
  currentImage = 0;
  content = pointsOfInterest.find((element) => element.id === id);
  let previousImgBtn = document.getElementById("previous");
  let nextImgBtn = document.getElementById("next");
  if (content.images.length <= 1) {
    if (!previousImgBtn.classList.contains("hide")) {
      previousImgBtn.classList.add("hide");
    }
    if (!nextImgBtn.classList.contains("hide")) {
      nextImgBtn.classList.add("hide");
    }
  } else {
    nextImgBtn.classList.remove("hide");
    previousImgBtn.classList.remove("hide");
  }
  dialogTitle.innerText = content.title;
  dialogDescription.innerText = content.description;
  dialogImage.src = content.images[currentImage].image;
  console.log(dialogImage.src);
};
const load = async () => {
  let data = await fetch("./data.json");
  let json = await data.json();
  pointsOfInterest = json.pointsOfInterest;
  console.log(json);
  initializeMap(
    json.baseLayers,
    json.mapCenter,
    json.maxZoom,
    json.minZoom,
    json.mapBounds
  );
  initializePointsOfInterest(pointsOfInterest);
};
load();
