fetch("creditsComponent/credit.html")
  .then((stream) => stream.text())
  .then((text) => define(text));

function define(html) {
  class Credits extends HTMLElement {
    constructor() {
      super();

      //   this.valueElement = shadow.querySelector("p");
      //   var incrementButton = shadow.querySelectorAll("button")[1];
      //   var decrementButton = shadow.querySelectorAll("button")[0];

      //   incrementButton.onclick = () => this.value++;
      //   decrementButton.onclick = () => this.value--;
    }
    connectedCallback() {
      var shadow = this.attachShadow({ mode: "open" });
      shadow.innerHTML = html;
      console.log(html);
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
}
