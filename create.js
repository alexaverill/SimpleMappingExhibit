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
      attribution: "Tiles courtesy of the U.S. Geological Survey",
    },
  },
  {
    name: "Street Map",
    tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: {
      minZoomLevel: 1,
      maxZoomLevel: 15,
      attribution:
        "Tiles courtesy of OpenStreetMap. Visit openstreetmap.org to learn more.",
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
let languages = ["English"];
let mapTitles = [];
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
let mapTitle = null;
let currentCustomMarker;
let customMarkers = [
  {
    image:
      "data:image/png;base64,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",
    offset: [20.5, 41],
    size: [41, 41],
  },
];
let customCredits = [];

const handleTitleChange = (e) => {
  mapTitle = e.value;
};
const handleTitleBlur = (e) => {
  saveMapTitle();
};
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
  let imageViewer = document.querySelector("image-viewer");
  document
    .querySelector("image-viewer")
    .setImages(imageList.map((image) => image.image));
  // dialogImage.src = imageList[currentImage].image;
  // setImageNavigationButtons(imageList.length);
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
  let credits = [];
  for (let child of parent.children) {
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
    credits.push({ name, credit: attribution });
    baseLayers.push(mapLayer);
  }
  document.querySelector("edit-map-credits").setCredits(credits, customCredits);
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
  saveMapTitle();

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
  let mapTitle = document.querySelector("#mapTitleInput");
  SaveLanguageText();
  currentLanguage = e.value;
  let newMapTitle =
    mapTitles.find((title) => title.language === currentLanguage) ?? "";

  mapTitle.value = newMapTitle;

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
  for (var language of languages) {
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
const AddNewLanguage = () => {
  let entry = document.getElementById("languageEntry");
  if (entry.value.length > 0) {
    addLanguage(entry.value);
  }
  entry.value = "";
};
const handleLanguageKeyPress = (e) => {
  if (e.key === "Enter") {
    AddNewLanguage();
  }
};
const addLanguageHandler = (e) => {
  AddNewLanguage();
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
const closeIconImageSelector = () => {
  document.querySelector("icon-editor").reset();
  document.querySelector("#customMarker").close();
};
const addExistingMarker = (index) => {
  let marker = customMarkers[index];
  currentCustomMarker = marker;
  let icon = L.icon({
    iconUrl: marker.image,
    iconSize: marker.size,
    iconAnchor: marker.offset,
  });
  setIcon(icon);
  closeIconImageSelector();
};
const setIcon = (icon) => {
  if (!newPointRef) {
    map.eachLayer((layer) => {
      if (layer._icon && layer._icon.src.indexOf("flag.svg") < 0) {
        //map.removeLayer(layer);
        if (
          layer._latlng.lat === content.latitude &&
          layer._latlng.lng === content.longitude
        ) {
          console.log("Found Point");
          layer.setIcon(icon);
        }
      }
    });
  } else {
    newPointRef.setIcon(icon);
  }
};
const saveIconImageSelector = () => {
  let editor = document.querySelector("icon-editor");
  let marker = editor.getImageObj();
  if (!marker) {
    console.log("No image or offset set");
    closeIconImageSelector();
  }
  let icon = L.icon({
    iconUrl: marker.image,
    iconSize: marker.size,
    iconAnchor: marker.offset,
  });

  //save image and apply it to current point;
  setIcon(icon);
  if (newPointRef) {
    console.log("Saving marker");
    newPointRef.marker = marker;
  } else if (content) {
    console.log("Updating Marker");
    content.marker = marker;
  }
  currentCustomMarker = marker;
  customMarkers.push(marker);
  closeIconImageSelector();
};
const setExistingMarkers = () => {
  if (customMarkers && customMarkers.length <= 0) {
    return;
  }
  let markerDiv = document.querySelector("#existingMarkers");
  markerDiv.innerHTML = "";
  let index = 0;
  for (let marker of customMarkers) {
    console.log(marker);
    let imageDiv = `<div><button class="iconButton" onclick="addExistingMarker(${index})"><img src="${marker.image}"/></button></div>`;
    markerDiv.innerHTML += imageDiv;
    index++;
  }
};

const customMarker = () => {
  let editor = document.querySelector("icon-editor");
  console.log(content);
  if (content) {
    if (content.marker) {
      document.querySelector("icon-editor").setImage(content.marker.image);
    }
  } else if (newPointRef) {
    console.log(newPointRef);
    if (newPointRef.marker) {
      document.querySelector("icon-editor").setImage(newPointRef.marker.image);
    }
  }
  setExistingMarkers();
  document.querySelector("#customMarker").showModal();
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
  console.log(currentCustomMarker);
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
      marker: currentCustomMarker,
    };
    points.push(newPoint);
  } else {
    let index = points.findIndex((point) => point.id == currentid);
    points[index].titles = titles;
    points[index].descriptions = descriptions;
    points[index].images = imageList;
    points[index].marker = currentCustomMarker;
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
  document.querySelector("image-viewer").setImages(imageList);
  titles = [];
  descriptions = [];
  currentCustomMarker = null;
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
  document.getElementById("id").value = point.id;
  document.getElementById("title").value =
    point.titles.find((title) => title.language === currentLanguage)?.title ??
    "";
  document.getElementById("description").value =
    point.descriptions.find(
      (description) => description.language === currentLanguage
    )?.description ?? "";
  if (imageList.length > 0) {
    document
      .querySelector("image-viewer")
      .setImages(imageList.map((image) => image.image));
  }
  if (point.marker) {
    document.querySelector("icon-editor").setImage(point.marker.image);
  }
};
const handleBackgroundClick = () => {
  closeDialog();
};

const setCurrentLatLang = () => {
  addCenterMarker();
  document.getElementById("userInstructionButtons").innerHTML = "";
  document
    .getElementById("userInstructionButtons")
    .appendChild(getInstructionContinue());
  map.setView(currentMapCenter);
  map.center = currentMapCenter;
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
  introDialog.close();
  languageDialog.showModal();
  displayLanguages();
};
const handleProgressClick = (state) => {
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
      marker: point.marker,
    };
  });
  if (mapTitles.length <= 0) {
    mapTitles.push({ language: currentLanguage, title: mapTitle });
  }
  let mapObject = {
    mapTitles,
    languages,
    mapCenter: currentMapCenter,
    baseLayers: baseLayers,
    minZoom: minZoomLevel,
    maxZoom: maxZoomLevel,
    mapBounds: boundsRect.getBounds(),
    pointsOfInterest: cleanedPoints,
    customCredits,
  };
  let jsonString = JSON.stringify(mapObject);
  return new Blob(["mapData = " + jsonString], { type: "application/json" });
};
const downloadJson = () => {
  var link = document.createElement("a");
  link.download = "data.json";
  link.href = window.URL.createObjectURL(createDownloadData());
  link.click();
};
const handleComplete = () => {
  currentStep = steps.Complete;
  advanceProgress("zoomProgress", "");

  let textFile = window.URL.createObjectURL(createDownloadData());
  //for some reason it was adding 3 links the normal way to deal with this
  let innerHtml = `<button onClick="closeComplete()">Explore Your Map</button>
        <button id="downloadLink" class="download" onClick="downloadJson()"><img src="./assets/download.png"/>Download Data</button>`;
  let downloadBtn = document.getElementById("completeBtnBar");
  downloadBtn.innerHTML = "";
  downloadBtn.innerHTML = innerHtml;
  document.getElementById("completedMap").showModal();
  document.getElementById("progress").innerHTML +=
    '<button id="downloadLink" class="download" onClick="downloadJson()"><img src="./assets/download.png"/>Download Data</button>';
};
const initializeMap = (
  startCoordinates = [0, 0],
  zoomLevel = 3,
  maxZoomLevel = 15,
  minZoomLevel = 3,
  zoomPosition = "bottomright"
) => {
  map = L.map("map", { attributionControl: false, zoomControl: true }).setView(
    startCoordinates,
    zoomLevel
  );

  // add the new control to the map
  var zoomHome = new L.Control.zoomHome();
  var creditsControl = new L.Control.creditsControl();
  creditsControl.addTo(map);
  zoomHome.addTo(map);
  document.addEventListener("mapRecenter", () => {
    map.setView(map.center);
  });
  document.addEventListener("mapCredits", () => {
    document.querySelector("edit-map-credits").show();
  });
  document.addEventListener("customCreditChange", (event) => {
    customCredits = event.detail.customCredits;
  });
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
  var geocoder = L.Control.geocoder({
    defaultMarkGeocode: false,
    position: "bottomright",
  })
    .on("markgeocode", function (e) {
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

function saveMapTitle() {
  let mapTitleInput = document.querySelector("#mapTitleInput");
  let mapTitle = mapTitleInput.value;
  let mapTitleObj = { language: currentLanguage, title: mapTitle };
  console.log(mapTitleObj);
  let mapTitleIndex = mapTitles.findIndex((title) => title.title === mapTitle);
  if (mapTitleIndex >= 0) {
    mapTitles.splice(mapTitleIndex, 1, mapTitleObj);
  } else {
    mapTitles.push(mapTitleObj);
  }
}

function loadFileReader(event) {
  var obj = JSON.parse(event.target.result.replace("mapData = ", ""));
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
  for (let file of event.files) {
    let reader = new FileReader();
    reader.onload = imageEncode;
    reader.readAsDataURL(file);
  }
};
const imageEncode = (event) => {
  buildImagePreview(event.target.result);
};
initializeMap();
document.getElementById("intro").showModal();
