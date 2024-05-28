const createLongInputElemeent = (id, label, value) => {
  let div = document.createElement("div");
  div.className = "inputRow";
  let input = document.createElement("textarea");
  input.className = `baseLayerInput ${id}`;
  input.id = id;
  input.value = value;
  let inputLabel = createLabel(id, label);
  div.appendChild(inputLabel);
  div.appendChild(input);
  return div;
};
const createInputElements = (id, label, value) => {
  let div = document.createElement("div");
  div.className = "inputRow";
  let input = document.createElement("input");
  input.className = `baseLayerInput ${id}`;
  input.type = "text";
  input.id = id;
  input.value = value;
  let inputLabel = createLabel(id, label);
  div.appendChild(inputLabel);
  div.appendChild(input);
  return div;
};
const createZoomInput = (id, label, value) => {
  let div = document.createElement("div");
  div.className = "inputRow";
  let input = document.createElement("input");
  input.className = `baseLayerInput ${id}`;
  input.type = "number";
  input.id = id;
  input.value = value;
  let inputLabel = createLabel(id, label);
  div.appendChild(inputLabel);
  div.appendChild(input);
  return div;
};
const createLabel = (id, label) => {
  let inputLabel = document.createElement("label");
  inputLabel.className = "inputLabel";
  inputLabel.htmlFor = id;
  inputLabel.innerText = label;
  return inputLabel;
};
