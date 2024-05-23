import {
  createLongInputElemeent,
  createInputElements,
  createZoomInput,
} from "./createInputs.js";
import {
  buildDeleteIcon,
  buildImagePreview,
  handleAddImage,
  cancelImageSelect,
  handleImagesSelected,
  setImageNavigationButtons,
} from "./imageviewer.js";
const steps = {
  Intro: 0,
  Language: 1,
  BaseLayer: 2,
  Center: 3,
  Points: 4,
  Editing: 5,
  Bounds: 6,
  MinZoomLevel: 7,
  MaxZoomLevel: 8,
  Complete: 9,
};
let baseLayers = [
  {
    name: "Satellite",
    tileUrl:
      "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
    options: {
      minZoomLevel: 1,
      maxZoomLevel: 20,
      attribution:
        'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
    },
  },
  {
    name: "Street Map",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      minZoomLevel: 1,
      maxZoomLevel: 15,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    },
  },
];
let currentStep = steps.Intro;
let previousStep = null;
let currentMapCenter = null;
let centerMarker = null;
let map;
let mapLayerControl;
let currentImage = 0;
let content = null;
//dialog pop ups
let introDialog = document.getElementById("intro");
let languageDialog = document.getElementById("languageDialog");
let imageDialog = document.getElementById("imageAdd");
let baseLayerDialog = document.getElementById("baseLayerSelection");
let zoomDialog = document.getElementById("zoomSelection");
let boundsDialog = document.getElementById("boundsSelectionDialog");

let dialogTitle = document.getElementById("dialogTitle");
let dialogImage = document.getElementById("dialogImage");
let dialogDescription = document.getElementById("dialogDescription");
let languageEntries = document.getElementById("languageEntries");
let isClicked = false;
let startPos = null;
let endPos = null;
let rectangle = null;
let pointsOfInterest = null;
let currentLanguage = "English";
let languages = ["English", "Spanish"];
let points = [];
let titles = []; //{language:"","title":""}
let descriptions = [];
let pointLatLng = null;
let newPointRef = null;
let imageList = [];
let bounds;
let originalZoomlevel = null;
let boundsRect = null;
let maxZoomLevel = null;
let minZoomLevel = null;
const disableInstructionContinue = () => {
  document.getElementById("continueBtn").disabled = true;
};
const enableInstructionContinue = () => {
  document.getElementById("continueBtn").disabled = true;
};
const getInstructionContinue = (text = "Continue") => {
  let button = document.createElement("button");
  button.id = "continueBtn";
  button.onclick = finishStep;
  button.appendChild(document.createTextNode(text));
  return button;
};
const imagesSelected = () => {
  imageList = handleImagesSelected();
  dialogImage.src = imageList[currentImage].image;
  setImageNavigationButtons(imageList.length);
};
//Intro Functionality
const showIntro = () => {
  document.getElementById("intro").showModal();
};
//Bounds Funtions
const handleResetBounds = () => {
  map.removeLayer(boundsRect);
  isClicked = false;
  document.getElementById("userInstructionButtons").innerHTML = "";
  map.setZoom(originalZoomlevel);
};
const addBoundsInstructionButtons = () => {
  let resetBtn = document.createElement("button");
  resetBtn.onclick = handleResetBounds;
  resetBtn.appendChild(document.createTextNode("Reset"));
  document.getElementById("userInstructionButtons").innerHTML = "";
  document.getElementById("userInstructionButtons").appendChild(resetBtn);
  document
    .getElementById("userInstructionButtons")
    .appendChild(getInstructionContinue());
};
const advanceToBounds = () => {
  isClicked = false;
  document.getElementById("boundsSelectionDialog").close();
  document.getElementById("userInstructionButtons").innerHTML = "";
  if (previousStep == steps.Complete) {
    addBoundsInstructionButtons();
  }
  setInstructions("Click to start drawing a boundary box.", "");
  currentStep = steps.Bounds;
};

//Map Center Point
const advanceToMapCenter = () => {
  currentStep = steps.Center;
  advanceProgress("baseLayerProgress", "mapCenterProgress");
  document.getElementById("userInstructions").classList.remove("hide");

  document.getElementById("intro").close();
  if (previousStep !== steps.Complete) {
    document.getElementById("userInstructionButtons").innerHTML = "";
  } else {
    document.getElementById("userInstructionButtons").innerHTML = "";
    document
      .getElementById("userInstructionButtons")
      .appendChild(getInstructionContinue());
  }
  setInstructions(
    "Select the center of your map.",
    "This controls your maps default location. You can search using the Magnifying Glass in the bottom right."
  );
};
const addCenterMarker = () => {
  if (centerMarker && map) {
    map.removeLayer(centerMarker);
  }
  var myIcon = L.icon({
    iconUrl: "assets/flag.svg",
    iconSize: [40, 40],
    iconAnchor: [11, 30],
    popupAnchor: [-3, -76],
    shadowSize: [68, 95],
    shadowAnchor: [22, 94],
  });

  centerMarker = L.marker(currentMapCenter, { icon: myIcon }).addTo(map);
};

//Zoom Levelts
const advanceToSelectZoom = () => {
  currentStep = steps.MinZoomLevel;
  document.getElementById("userInstructionButtons").innerHTML = "";
  document.getElementById("zoomSelection").close();
  let resetBtn = document.createElement("button");
  resetBtn.onclick = finishStep;
  resetBtn.appendChild(document.createTextNode("Set and Continue"));
  document.getElementById("userInstructionButtons").prepend(resetBtn);
  setInstructions(
    "Suggested minimum zoom level.",
    "Zoom in or out to modify.",
    ""
  );
};
const advanceToSelectMaxZoom = () => {
  minZoomLevel = map.getZoom();
  currentStep = steps.MaxZoomLevel;
  document.getElementById("zoomSelection").close();
  document.getElementById("userInstructionButtons").innerHTML = "";
  let resetBtn = document.createElement("button");
  resetBtn.onclick = finishStep;
  resetBtn.appendChild(document.createTextNode("Set and Continue"));
  document.getElementById("userInstructionButtons").prepend(resetBtn);
  map.setZoom(map.getMaxZoom());
  setInstructions("Suggested maximum zoom level.", "Zoom in or out to modify");
};

//Base Layer functions
const advanceToBaseLayers = () => {
  currentStep = steps.BaseLayer;
  document.getElementById("intro").close();
  document.getElementById("baseLayerSelection").showModal();
  document.getElementById("baseLayers").innerHTML = "";
  for (let layer of baseLayers) {
    buildBaseLayerInput(
      layer.name,
      layer.tileUrl,
      layer.options.attribution,
      layer.options.minZoomLevel,
      layer.options.maxZoomLevel
    );
  }
};
const updateBaseLayers = () => {
  let parent = document.getElementById("baseLayers");
  baseLayers = [];
  for (let child of parent.children) {
    console.log(child);
    let name = child.querySelector(".name").value;
    let tiles = child.querySelector(".tiles").value;
    let attribution = child.querySelector(".attribution").value;
    let minZoom = child.querySelector(".minZoom").value;
    let maxZoom = child.querySelector(".maxZoom").value;
    let mapLayer = {
      name,
      tileUrl: tiles,
      options: {
        minZoomLevel: minZoom,
        maxZoomLevel: maxZoom,
        attribution: attribution,
      },
    };
    baseLayers.push(mapLayer);
  }
};
const setBaseLayers = (shouldRefresh = false) => {
  if (shouldRefresh) {
    updateBaseLayers();
  }
  map.eachLayer((layer) => {
    if (layer._url) {
      map.removeLayer(layer);
    }
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
const addBaseLayerUI = () => {
  buildBaseLayerInput();
  let lastChild = document.getElementById("baseLayers").lastChild;
  lastChild.scrollIntoView({ block: "end", behavior: "smooth" });
  setDeleteButtonDisabled(false);
};
const setDeleteButtonDisabled = (state) => {
  let baseLayerList = document.getElementById("baseLayers").children;
  console.log(baseLayerList);
  for (let layer of baseLayerList) {
    let deleteButton = layer.querySelector(".deleteRow");
    deleteButton.disabled = state;
  }
};
const removeBaseLayer = (parent, container, layerName) => {
  parent.removeChild(container);
  let removeIndex = baseLayers.findIndex((layer) => layer.name == layerName);
  baseLayers.splice(removeIndex, 1);
  let currentLength = document.getElementById("baseLayers").children.length;
  if (currentLength <= 1) {
    setDeleteButtonDisabled(true);
  }
};
const buildBaseLayerInput = (
  layerName = "",
  layerTile = "",
  layerAttribution = "",
  layerMinZoom = 1,
  layerMaxZoom = 20
) => {
  let parent = document.getElementById("baseLayers");
  let container = document.createElement("div");
  container.className = "baseLayerInputRow";
  let deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteRow dialogActionButton";
  deleteBtn.onclick = () => removeBaseLayer(parent, container, layerName);
  deleteBtn.innerHTML = '<img src="./assets/delete.png">';
  let name = createInputElements("name", "Name", layerName);
  let tilesUrl = createLongInputElemeent("tiles", "Tiles Url", layerTile);
  let attribution = createLongInputElemeent(
    "attribution",
    "Attribution:",
    layerAttribution
  );
  let zoomDiv = document.createElement("div");
  zoomDiv.className = "zoomInputs";
  let minZoom = createZoomInput("minZoom", "Min Zoom ", layerMinZoom);
  let maxZoom = createZoomInput("maxZoom", "Max Zoom ", layerMaxZoom);
  zoomDiv.appendChild(minZoom);
  zoomDiv.appendChild(maxZoom);
  container.appendChild(deleteBtn);
  container.appendChild(name);
  container.appendChild(tilesUrl);
  container.appendChild(attribution);
  container.appendChild(zoomDiv);
  parent.appendChild(container);
};

const createLanguageEntry = (language) => {
  let div = document.createElement("div");
  div.className = "languageEntry";
  let languageName = document.createElement("p");
  languageName.innerText = language;
  div.appendChild(languageName);

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.appendChild(buildDeleteIcon());
  deleteBtn.onclick = () => removeLanguage(language);
  div.appendChild(deleteBtn);
  return div;
};
const displayLanguages = () => {
  let languageOptionDiv = document.getElementById("languageEntries");
  languageOptionDiv.innerHTML = [];
  for (let language of languages) {
    console.log(language);
    languageOptionDiv.appendChild(createLanguageEntry(language));
  }
};
const SaveLanguageText = () => {
  let titleInput = document.getElementById("title");
  let descriptionInput = document.getElementById("description");
  let title = titleInput.value;
  let description = descriptionInput.value;
  let titleObj = { language: currentLanguage, title };
  let descriptionObj = { language: currentLanguage, description };
  let titleIndex = titles.findIndex(
    (title) => title.language == currentLanguage
  );
  if (titleIndex >= 0) {
    titles.splice(titleIndex, 1, titleObj);
  } else {
    titles.push(titleObj);
  }
  let descriptionIndex = descriptions.findIndex(
    (description) => description.language == currentLanguage
  );
  if (descriptionIndex >= 0) {
    descriptions.splice(descriptionIndex, 1, descriptionObj);
  } else {
    descriptions.push(descriptionObj);
  }
};
const handleLanguageSelection = (e) => {
  let titleInput = document.getElementById("title");
  let descriptionInput = document.getElementById("description");
  SaveLanguageText();
  currentLanguage = e.value;
  let newTitle =
    titles.find((title) => title.language === currentLanguage) ?? "";
  let newDescription =
    descriptions.find((desc) => desc.language === currentLanguage) ?? "";

  titleInput.value = newTitle.title != undefined ? newTitle.title : "";
  descriptionInput.value =
    newDescription.description != undefined ? newDescription.description : "";
};
const populateLanguageSelector = () => {
  let languageSelector = document.getElementById("languageSelector");
  languageSelector.innerHTML = "";
  let languageOptions = [];
  for (language of languages) {
    let option = document.createElement("option");
    option.value = language;
    option.innerText = language;
    languageSelector.appendChild(option);
  }
};
const removeLanguage = (language) => {
  if (languages.length <= 1) {
    return;
  }
  languages.splice(languages.indexOf(language), 1);
  displayLanguages();
};
const addLanguage = (language) => {
  languages.push(language);
  displayLanguages();
  populateLanguageSelector();
  currentLanguage = languages?.at(0);
};
const addLanguageHandler = (e) => {
  let entry = document.getElementById("languageEntry");
  addLanguage(entry.value);
  entry.value = "";
};
//Content Dialog Setup
const addLinkedImage = () => {
  let link = document.getElementById("imageLink");
  if (link.value.length > 0 && link.value.indexOf("http") >= 0) {
    buildImagePreview(link.value);
  }
  link.value = "";
};
const handlePrevewImageSelect = (e) => {
  let files = document.getElementById("imageInput").files;
  console.log(files);
  let path = `./images/${files[0].name}`;
  buildImagePreview(path);
};
const deletePoint = () => {
  let currentid = document.getElementById("id").value;
  if (currentid === "null") {
    map.removeLayer(newPointRef);
  } else {
    let index = points.findIndex((point) => point.id == currentid);
    map.removeLayer(points[index].pointRef);
    points.splice(index, 1);
  }
  document
    .getElementById("dialogBackground")
    .classList.remove("dialogBackgroundVisible");
  document.getElementById("dialog").classList.remove("visible");
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("id").valu = "null";
  titles = [];
  descriptions = [];
  currentStep = steps.Points;
};
const closeDialog = () => {
  let currentid = document.getElementById("id").value;
  SaveLanguageText();
  if (currentid === "null") {
    console.log("Add New Point");
    let id = points.length;
    let newPoint = {
      titles,
      descriptions,
      id,
      latitude: pointLatLng.lat,
      longitude: pointLatLng.lng,
      pointRef: newPointRef,
      images: imageList,
    };
    console.log(newPoint);
    points.push(newPoint);
  } else {
    console.log(points);
    console.log(currentid);
    let index = points.findIndex((point) => point.id == currentid);
    console.log(index);
    points[index].titles = titles;
    points[index].descriptions = descriptions;
    points[index].images = imageList;
  }
  document
    .getElementById("dialogBackground")
    .classList.remove("dialogBackgroundVisible");
  document.getElementById("dialog").classList.remove("visible");
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("id").value = "null";
  newPointRef = null;
  imageList = [];
  dialogImage.src = "";
  titles = [];
  descriptions = [];
  currentStep = steps.Points;
};
const pointClicked = (lat, lng) => {
  if (currentStep != steps.Points) {
    return;
  }
  let point = points.find(
    (point) => point.latitude === lat && point.longitude === lng
  );
  setDialogContent(point);
  document.getElementById("dialog").classList.toggle("visible");
};

const setDialogContent = (point) => {
  currentImage = 0;
  imageList = [];
  content = point;
  imageList = content.images;
  console.log(point.titles);
  titles = point.titles;
  descriptions = point.descriptions;
  setImageNavigationButtons(imageList.length);
  document.getElementById("id").value = point.id;
  document.getElementById("title").value =
    point.titles.find((title) => title.language === currentLanguage)?.title ??
    "";
  document.getElementById("description").value =
    point.descriptions.find(
      (description) => description.language === currentLanguage
    )?.description ?? "";
  if (imageList.length > 0) {
    dialogImage.src = imageList[currentImage]?.image;
  }
};
const handleBackgroundClick = () => {
  closeDialog();
};
const handlePreviousImage = () => {
  currentImage = currentImage > 0 ? currentImage - 1 : imageList.length - 1;
  dialogImage.opacity = 0;
  dialogImage.src = imageList[currentImage].image;
  dialogImage.opacity = 1;
};
const handleNextImage = () => {
  currentImage = (currentImage + 1) % imageList.length;
  dialogImage.opacity = 0;
  dialogImage.src = imageList[currentImage].image;
  dialogImage.opacity = 1;
};

const setCurrentLatLang = () => {
  addCenterMarker();
  document.getElementById("userInstructionButtons").innerHTML = "";
  document
    .getElementById("userInstructionButtons")
    .appendChild(getInstructionContinue());
  map.setView(currentMapCenter);
};
const advanceToPoints = () => {
  currentStep = steps.Points;
  advanceProgress("mapCenterProgress", "pointsProgress");
  setInstructions("Add points", "Click to create points");
  document.getElementById("userInstructionButtons").innerHTML = "";
  document
    .getElementById("userInstructionButtons")
    .appendChild(getInstructionContinue());
};

const addNewPoint = (latlng) => {
  document.getElementById("id").value = "null";
  currentStep = steps.Editing;
  pointLatLng = latlng;
  console.log(pointLatLng);
  let point = L.marker(latlng).addTo(map);
  point.on("click", (e) => {
    console.log(e);
    pointClicked(e.latlng.lat, e.latlng.lng);
  });
  newPointRef = point;
  document.getElementById("dialog").classList.toggle("visible");
};

//State Management
const advanceProgress = (previousId, nextId) => {
  document.getElementById(previousId).classList.remove("active");
  document.getElementById(previousId).classList.add("completed");
  if (nextId && nextId.length > 0) {
    document.getElementById(nextId).classList.add("active");
  }
};
const setInstructions = (title, subtitle) => {
  document.getElementById("instructions").innerText = title;
  document.getElementById("subtitle").innerText = subtitle;
};
const advanceToLanguage = () => {
  currentStep = steps.Language;
  languageDialog.showModal();
  displayLanguages();
};
const handleProgressClick = (state) => {
  console.log(currentStep);
  if (currentStep != steps.Complete && previousStep !== steps.Complete) {
    return;
  }
  previousStep = steps.Complete;
  switch (state) {
    case "baselayer":
      console.log("open base layers");
      advanceToBaseLayers();
      break;
    case "center":
      advanceToMapCenter();
      break;
    case "points":
      advanceToPoints();
      break;
    case "bounds":
      advanceToBounds();
      break;
    case "zoom":
      advanceToSelectMaxZoom();
      break;
  }
};
const openMapCenterDialog = () => {
  document.getElementById("mapCenterDialog").showModal();
};

const finishStep = () => {
  if (previousStep && previousStep == steps.Complete) {
    switch (currentStep) {
      case steps.BaseLayer:
        document.getElementById("baseLayerSelection").close();
        currentStep = steps.Complete;
        setBaseLayers(true);
        advanceToMapCenter();
        break;
      case steps.Center:
        advanceToPoints();
        break;
      case steps.Points:
        advanceToBounds();
        break;
      case steps.Bounds:
        map.setMaxBounds(boundsRect);
        currentStep = steps.MinZoomLevel;
        advanceToSelectMaxZoom();
        break;
      case steps.MinZoomLevel:
        minZoomLevel = map.getZoom();
        advanceToSelectMaxZoom();
        break;
      case steps.MaxZoomLevel:
        maxZoomLevel = map.getZoom();
        currentStep = steps.Complete;
        handleComplete();
        break;
    }
    return;
  }
  switch (currentStep) {
    case steps.Intro:
      advanceToLanguage();
      break;
    case steps.Language:
      languageDialog.close();
      advanceToBaseLayers();
      break;
    case steps.BaseLayer:
      setBaseLayers(true);
      document.getElementById("baseLayerSelection").close();
      console.log("Opening Map Center Dialog");
      advanceToMapCenter();
      break;
    case steps.Center:
      advanceToPoints();
      break;
    case steps.Points:
      currentStep = steps.Bounds;
      advanceProgress("pointsProgress", "boundsProgress");
      document.getElementById("boundsSelectionDialog").showModal();
      break;
    case steps.Bounds:
      map.setMaxBounds(boundsRect);
      currentStep = steps.MinZoomLevel;
      document.getElementById("zoomSelection").showModal();
      break;
    case steps.MinZoomLevel:
      minZoomLevel = map.getZoom();
      currentStep = steps.MaxZoomLevel;
      advanceProgress("boundsProgress", "zoomProgress");
      advanceToSelectMaxZoom();
      break;
    case steps.MaxZoomLevel:
      maxZoomLevel = map.getZoom();
      handleComplete();
      break;
  }
};
const closeComplete = () => {
  setInstructions("Explore Your Map!", "You can now return to previous steps.");
  document.getElementById("userInstructionButtons").innerHTML = "";
  map.setZoom(minZoomLevel);
  document.getElementById("completedMap").close();
};
const createDownloadData = () => {
  let cleanedPoints = points.map((point) => {
    console.log(point);
    return {
      id: point.id,
      titles: point.titles,
      descriptions: point.descriptions,
      latitude: point.latitude,
      longitude: point.longitude,
      images: point.images,
    };
  });
  let mapObject = {
    mapCenter: currentMapCenter,
    baseLayers: baseLayers,
    minZoom: minZoomLevel,
    maxZoom: maxZoomLevel,
    mapBounds: boundsRect.getBounds(),
    pointsOfInterest: cleanedPoints,
  };
  let jsonString = JSON.stringify(mapObject);
  return new Blob([jsonString], { type: "application/json" });
};
const handleComplete = () => {
  currentStep = steps.Complete;
  advanceProgress("zoomProgress", "");

  let textFile = window.URL.createObjectURL(createDownloadData());
  //for some reason it was adding 3 links the normal way to deal with this
  let innerHtml = `<button onClick="closeComplete()">Explore Your Map</button>
        <a href="${textFile}" download="data.json" id="downloadLink" class="download" target="_blank"><img src="./assets/download.png"/>Download Data</a>`;
  document.getElementById("completeBtnBar").innerHTML = innerHtml;
  document.getElementById("completedMap").showModal();
  document.getElementById(
    "progress"
  ).innerHTML += `<a href="${textFile}" download="data.json" id="downloadLink" class="download downloadButton" target="_blank"><img src="./assets/download.png"/>Download Data</a>`;
};
const initializeMap = (
  startCoordinates = [0, 0],
  zoomLevel = 3,
  maxZoomLevel = 15,
  minZoomLevel = 3,
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
  setBaseLayers();
  map.on("click", (e) => {
    console.log(currentStep);
    if (currentStep == steps.Center) {
      currentMapCenter = e.latlng;
      setCurrentLatLang();

      return;
    }
    if (currentStep == steps.Points) {
      addNewPoint(e.latlng);
    }
    if (currentStep == steps.Bounds && !isClicked) {
      originalZoomlevel = map.getZoom();
      startPos = e.latlng;
    }
    if (currentStep == steps.Bounds && isClicked) {
      bounds = L.latLngBounds(startPos, e.latlng);
      console.log(bounds);
      addBoundsInstructionButtons();
      map.setMaxBounds(bounds);
      map.fitBounds(bounds);
      setInstructions("Your current map bounds", "");
    }

    isClicked = !isClicked;
  });
  map.on("mousemove", (e) => {
    if (currentStep !== steps.Bounds) {
      return;
    }
    if (isClicked) {
      bounds = L.latLngBounds(startPos, e.latlng);
      endPos = e.latlng;
      let previousRects = document.getElementsByClassName("zoomRect");
      if (previousRects) {
        for (let element of previousRects) {
          console.log(element);
          setInstructions("Click to select other corner of your bounds", "");
          element.remove();
        }
      }
      boundsRect = L.rectangle(bounds, {
        color: "#FFFF00",
        weight: 1,
        className: "zoomRect",
      }).addTo(map);
    }
  });
  // map.addControl(L.control.search({ position: "bottomright", marker: false }));
  var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
    position: "bottomright",
  })
    .on("markgeocode", function (e) {
      console.log(e);
      var bbox = e.geocode.bbox;
      var poly = L.polygon([
        bbox.getSouthEast(),
        bbox.getNorthEast(),
        bbox.getNorthWest(),
        bbox.getSouthWest(),
      ]);
      map.fitBounds(poly.getBounds());
    })
    .addTo(map);
};
const initializePointsOfInterest = (points) => {
  points.map((point) => {
    var marker = L.marker([point.latitude, point.longitude]).addTo(map);
    marker.on("click", (e) => {
      pointClicked(e.latlng.lat, e.latlng.lng);
    });
  });
};
const loadFile = (event) => {
  var reader = new FileReader();
  reader.onload = loadFileReader;
  reader.readAsText(event.files[0]);
};

function loadFileReader(event) {
  //alert(event.target.result);
  var obj = JSON.parse(event.target.result);
  if (
    !obj.pointsOfInterest ||
    !obj.baseLayers ||
    !obj.minZoom ||
    !obj.maxZoom ||
    !obj.mapCenter ||
    !obj.mapBounds
  ) {
    alert("Invalid JSON File");
    return;
  }
  console.log(event);
  console.log(obj);
  points = obj.pointsOfInterest;
  baseLayers = obj.baseLayers;
  minZoomLevel = obj.minZoom;
  maxZoomLevel = obj.maxZoom;
  currentMapCenter = obj.mapCenter;
  addCenterMarker();
  let bounds = L.latLngBounds(
    obj.mapBounds._northEast,
    obj.mapBounds._southWest
  );
  console.log(bounds);
  boundsRect = L.rectangle(bounds, {
    color: "#FFFF00",
    weight: 1,
    className: "zoomRect",
  }).addTo(map);
  map.setMaxBounds(boundsRect);
  map.fitBounds(bounds);
  initializePointsOfInterest(points);
}
const uploadImage = (event) => {
  var reader = new FileReader();
  reader.onload = imageEncode;
  reader.readAsDataURL(event.files[0]);
};
const imageEncode = (event) => {
  console.log(event);
  buildImagePreview(event.target.result);
};
const load = async () => {};
initializeMap();
document.getElementById("intro").showModal();

window.finishStep = finishStep;
window.closeDialog = closeDialog;
window.deletePoint = deletePoint;
window.handleAddImage = handleAddImage;
window.loadFile = loadFile;
window.addLanguageHandler = addLanguageHandler;
window.addBaseLayerUI = addBaseLayerUI;
window.addLinkedImage = addLinkedImage;
window.uploadImage = uploadImage;
window.cancelImageSelect = cancelImageSelect;
window.advanceToBounds = advanceToBounds;
window.advanceToSelectMaxZoom = advanceToSelectMaxZoom;
window.closeComplete = closeComplete;
window.handleProgressClick = handleProgressClick;
window.imagesSelected = imagesSelected;
window.handleNextImage = handleNextImage;
window.handlePreviousImage = handlePreviousImage;
