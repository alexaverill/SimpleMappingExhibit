let html = `
<link rel="stylesheet" href="creditsComponent/credit.css">
<dialog class="genericDialog">
    <div class="dialogTitle">Credits</div>
    <div class="content">
        <p>This map was build using Leaflet JS, an open source mapping library.</p>
         <div id="customCredits" class="customCredits">
            <div class="creditList" id="creditEntries">
            </div>
            <div class="creditForm">
                <input type="text" id="creditEntry" /><button id="addCreditButton">Add Credit</button>
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
class EditCredits extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = html;
    this.customCredits = [];
    this.handleCreditAdd = this.handleCreditAdd.bind(this);
    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.dialog = shadow.querySelector("dialog");
    this.button = shadow.querySelector("#close");
    this.creditList = shadow.querySelector("#mapLayerList");
    this.creditEntry = shadow.querySelector("#creditEntry");
    this.addCreditButton = shadow.querySelector("#addCreditButton");
    this.customCreditArea = shadow.querySelector("#creditEntries");
    this.button.addEventListener("click", this.closeDialog);
    this.addCreditButton.addEventListener("click", this.handleCreditAdd);
    this.creditEntry.addEventListener("keydown", this.handleInputKeyDown);
  }
  handleInputKeyDown(e) {
    if (e.key === "Enter") {
      this.handleCreditAdd();
    }
  }
  handleCreditAdd() {
    let credit = this.creditEntry.value;
    if (credit && credit.length > 0) {
      this.customCredits.push(credit);
      this.buildCreditList();
      this.creditEntry.value = "";
      this.notifyCreditsChanged();
    }
  }
  notifyCreditsChanged() {
    let creditNotification = new CustomEvent("customCreditChange", {
      detail: {
        customCredits: this.customCredits,
      },
    });
    this.dispatchEvent(creditNotification);
  }
  buildCreditList() {
    this.customCreditArea.innerHTML = "";
    for (let credit of this.customCredits) {
      let entry = this.createCreditEntry(credit);
      this.customCreditArea.appendChild(entry);
    }
  }
  removeCredit(creditText) {
    this.customCredits.splice(
      this.customCredits.findIndex((credit) => credit === creditText),
      1
    );
    this.buildCreditList();
  }
  buildDeleteIcon() {
    let deleteBtnIcon = document.createElement("img");
    deleteBtnIcon.src = "./assets/delete.png";
    return deleteBtnIcon;
  }
  createCreditEntry(creditText) {
    let div = document.createElement("div");
    div.className = "creditEntry";
    let credit = document.createElement("p");
    credit.innerText = creditText;
    div.appendChild(credit);

    let deleteBtn = document.createElement("button");
    deleteBtn.className = "deleteBtn";
    deleteBtn.appendChild(buildDeleteIcon());
    deleteBtn.onclick = () => this.removeCredit(creditText);
    div.appendChild(deleteBtn);
    return div;
  }
  show() {
    this.dialog.showModal();
  }
  closeDialog(event) {
    this.dialog.close();
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
customElements.define("edit-map-credits", EditCredits);
