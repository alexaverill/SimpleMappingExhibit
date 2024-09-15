class PingExhibitera extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["group", "helperaddress", "id", "activeUser", "url", "uuid"];
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }
    switch (attr) {
      case "group":
        this.group = this.getAttribute("group");
        break;
      case "helperaddress":
        this.helperAddress = this.getAttribute("helperaddress");
        break;
      case "id":
        this.id = this.getAttribute("id");
        break;
      case "activeUser":
        this.activeUser = this.getAttribute("activeUser") === "true";
        break;
      case "url":
        this.url = this.getAttribute("url");
        break;
      case "uuid":
        this.uuid = this.getAttribute("uuid");
        break;
    }
  }
  async pingExhibitera() {
    if (!this.url) {
      return;
    }
    let messageBody = {
      currentInteraction: this.activeUser,
      group: this.group ?? "",
      helperAddress: this.helperAddress ?? "",
      id: this.id ?? "",
      uuid: this.uuid ?? "",
      permissions: {
        audio: false,
        refresh: false,
        restart: false,
        shutdown: false,
        sleep: false,
      },
    };
    if (!this.uuid) {
      delete messageBody.uuid;
    }
    if (!this.id) {
      delete messageBody.id;
    }
    let data = await fetch(this.url, {
      method: "POST",
      body: JSON.stringify(messageBody),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let json = await data.json();
    console.log(json);
    if (json.commands.length > 0) {
      this.handleCommands(json.commands);
    }
  }
  handleCommands(commandArray) {
    for (let command of commandArray) {
      console.log(command);
      switch (command) {
        case "refresh_page":
          window.location.reload();
          break;
        default:
          console.log(command);
      }
    }
  }
  connectedCallback() {
    this.group = this.getAttribute("group");

    this.helperAddress = this.getAttribute("helperaddress");

    this.id = this.getAttribute("id");

    this.activeUser = this.getAttribute("activeUser") === "true";

    this.url = this.getAttribute("url");
    this.uuid = this.getAttribute("uuid");
    this.pingExhibitera();
    setInterval(() => this.pingExhibitera(), 4500);
  }
}
customElements.define("ping-exhibitera-wc", PingExhibitera);
