let html = `
<link rel="stylesheet" href="creditsComponent/credit.css">
<dialog class="dialog">
    <div class="dialogContent">
        <div class="title">Credits</div>
        <div class="titleLine"></div>
        <div class="description">
            <p>This map was build using Leaflet JS, an open source mapping library.</p>
        </div>
        <div class="subtitle">Basemaps Provided by:</div>
        <div class="mapLayerList" id="mapLayerList">
        </div>
        <div class="dialogFooter">
            <div class="titleLine bottomLine"></div>
            <button id="close">Close</button>
        </div>
    </div>

</dialog>`;
class Credits extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = html;
    //console.log(html);
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
  setCredits(credits) {
    let creditHtml = "";
    for (let credit of credits) {
      creditHtml += `<div class="credit"><div class="name">${credit.name}</div><div>${credit.credit}</div></div>`;
    }
    this.creditList.innerHTML = creditHtml;
  }
}
customElements.define("map-credits", Credits);
