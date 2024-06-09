let html = `
<link rel="stylesheet" href="creditsComponent/credit.css">
<link rel="stylesheet" href="creditsComponent/credit.css">
<dialog class="genericDialog">
    <div class="dialogTitle">Credits</div>
    <div class="content">
        <p>This map was build using Leaflet JS, an open source mapping library.</p>
         <div id="customCredits" class="customCredits">
            <div class="creditList" id="creditEntries">
            </div>
        </div>
        <div class="subtitle">Basemaps Provided by:</div>
        <div class="mapLayerList" id="mapLayerList">
        </div>
    </div>
      <div class="footer">
    <button id="close">Close</button>
  </div>
</dialog>`;
class Credits extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = html;
    this.customCredits = [];
    this.customCreditArea = shadow.querySelector("#creditEntries");
    this.closeDialog = this.closeDialog.bind(this);
    this.dialog = shadow.querySelector("dialog");
    this.button = shadow.querySelector("#close");
    this.creditList = shadow.querySelector("#mapLayerList");
    this.button.addEventListener("click", this.closeDialog);
  }
  show() {
    this.dialog.showModal();
  }
  closeDialog(event) {
    this.dialog.close();
  }
  buildCreditList() {
    this.customCreditArea.innerHTML = "";
    for (let credit of this.customCredits) {
      let entry = this.createCreditEntry(credit);
      this.customCreditArea.appendChild(entry);
    }
  }
  createCreditEntry(creditText) {
    let div = document.createElement("div");
    div.className = "creditEntry creditView";
    let credit = document.createElement("p");
    credit.innerText = creditText;
    div.appendChild(credit);
    return div;
  }
  setCredits(credits, customCredits) {
    this.customCredits = customCredits;
    this.buildCreditList();
    let creditHtml = "";
    for (let credit of credits) {
      creditHtml += `<div class="credit"><div class="name">${credit.name}</div><div>${credit.credit}</div></div>`;
    }
    this.creditList.innerHTML = creditHtml;
  }
}
customElements.define("map-credits", Credits);
