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
const initializeMap = (
  startCoordinates = [44.9377, -93.1007],
  zoomLevel = 13,
  maxZoomLevel = 15,
  minZoomLevel = 13,
  zoomPosition = "bottomright"
) => {
  map = L.map("map").setView(startCoordinates, zoomLevel);

  map.zoomControl.remove();
  if (minZoomLevel !== maxZoomLevel) {
    L.control
      .zoom({
        position: zoomPosition,
      })
      .addTo(map);
  }
  let osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 15,
    minZoom: 1,
    zoomControl: false,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  });
  let openTopo = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 17,
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }
  );
  let openSatellite = L.tileLayer(
    "https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}",
    {
      minZoom: 0,
      maxZoom: 20,
      attribution:
        '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ext: "jpg",
    }
  );
  osm.addTo(map);
  var baseMaps = {
    "Open Street Map": osm,
    "Open Topography": openTopo,
    Satellite: openSatellite,
  };
  var overlays = {};
  L.control.layers(baseMaps, overlays, { position: "bottomright" }).addTo(map);
  map.on("click", (e) => {
    console.log(`Clicked at ${e.latlng}`);
    if (isClicked) {
      console.log("Reset map bounds");
    } else {
      startPos = e.latlng;
    }
    isClicked = !isClicked;
  });
  map.on("mousemove", (e) => {
    if (isClicked) {
      console.log(`Moved: ${e.latlng}`);
      let bounds = L.latLngBounds(startPos, e.latlng);
      endPos = e.latlng;
      let previousRects = document.getElementsByClassName("zoomRect");
      if (previousRects) {
        for (let element of previousRects) {
          console.log(element);
          element.remove();
        }
      }
      L.rectangle(bounds, {
        color: "#FFFF00",
        weight: 1,
        className: "zoomRect",
      }).addTo(map);
    }
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
  dialogTitle.innerText = content.name;
  dialogDescription.innerText = content.description;
  dialogImage.src = content.images[currentImage].image;
  console.log(dialogImage.src);
};
const load = async () => {
  let data = await fetch("./data.json");
  let json = await data.json();
  pointsOfInterest = json.pointsOfInterest;
  initializePointsOfInterest(pointsOfInterest);
};
initializeMap();
load();
