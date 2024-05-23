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