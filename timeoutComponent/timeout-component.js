class Timeout extends HTMLElement {
  html = `
    <style>
        dialog {
            width: 50vw;
            height: 40vh;

            border: none;
            background: none;
            color: var(--timeout-text-color, white);

            .content {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-content: center;
                align-items: center;
                gap: var(--timeout-column-gap, 2rem);
                font-size: var(--timeout-font-size, 2rem);
                font-family: var(--timeout-font-family, sans-serif);

                .buttons {
                    display: flex;
                    flex-direction: row;
                    gap: var(--timeout-button-gap, 1rem);
                }

                button {
                    padding-top: var(--timeout-button-padding-top, 1rem);
                    padding-bottom: var(--timeout-button-padding-bottom, 1rem);
                    padding-left: var(--timeout-button-padding-left, 1.5rem);
                    padding-right: var(--timeout-button-padding-right, 1.5rem);
                    font-size: var(--timeout-button-font-size, 1.5rem);
                    border: var(--timeout-button-border, none);
                    border-radius: var(--timeout-button-border-radius, 1rem);
                    background-color: var(--timeout-button-background-color, gray);
                    color: white;

                    &:hover {
                        background-color: var(--timeout-button-background-hover, darkgray);
                    }

                }
            }
        }

        .timeout-dialog::backdrop {
            background: rgba(0, 0, 0, .9);
        }
    </style>
    <dialog class="timeout-dialog">
        <div class="content">
            <div class="dialogTitle">Are you there?</div>
            <div class="buttons"><button id="continue">Yes</button></div>
        </div>
    </dialog>`;
  timeoutDuration = 60000;
  dialogDuration = 30000;
  timeoutActive = true;
  timeout;
  dialogTimeout;
  static get observedAttributes() {
    return ["timeout-active", "timeout-duration", "dialog-duration"];
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    if (oldVal === newVal) {
      return;
    }
    switch (attr) {
      case "timeout-active":
        this.timeoutActive = this.getAttribute("timeout-active") === "true";
        if (this.timeoutActive) {
          this.timeout = setTimeout(this.handleTimeout, this.timeoutDuration);
        } else {
          clearTimeout(this.timeout);
        }
        break;
      case "timeout-duration":
        this.timeoutDuration = this.getAttribute("timeout-duration");
        if (this.timeoutActive) {
          clearTimeout(this.timeout);
          this.timeout.setTimeout(this.handleTimeout, this.timeoutDuration);
        }
        break;
      case "dialog-duration":
        this.dialogDuration = this.getAttribute("dialog-duration");
        break;
    }
  }
  constructor() {
    super();
  }
  connectedCallback() {
    //get attributes
    let timeoutDurationAttribute = this.getAttribute("timeout-duration");
    let dialogDurationAttribute = this.getAttribute("dialog-duration");
    let activeAttribute = this.getAttribute("timeout-active");
    if (timeoutDurationAttribute) {
      this.timeoutDuration = timeoutDurationAttribute;
    }
    if (dialogDurationAttribute) {
      this.dialogDuration = dialogDurationAttribute;
    }
    if (activeAttribute) {
      this.timeoutActive = activeAttribute === "true";
    }
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this.html;
    this.resetTimeout = this.resetTimeout.bind(this);
    this.handleTimeout = this.handleTimeout.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.attributeChangedCallback = this.attributeChangedCallback.bind(this);
    this.dialog = shadow.querySelector("dialog");
    this.button = shadow.querySelector("#continue");
    this.button.addEventListener("click", () => {});
    document.addEventListener("mousedown", this.resetTimeout);
    document.addEventListener("keypress", this.resetTimeout);
    document.addEventListener("touchstart", this.resetTimeout);
    document.addEventListener("touchend", this.resetTimeout);
    document.addEventListener("touchmove", this.resetTimeout);
    if (this.timeoutActive) {
      this.timeout = setTimeout(this.handleTimeout, this.timeoutDuration);
    }
  }
  handleTimeout() {
    console.log("Timeout");
    clearTimeout(this.timeout);
    this.dialog.showModal();
    this.dialogTimeout = setTimeout(this.closeDialog, this.dialogDuration);
  }
  resetTimeout() {
    console.log("Reseting Timeout!");
    clearTimeout(this.timeout);
    clearTimeout(this.dialogTimeout);
    this.dialog.close();
    if (this.timeoutActive) {
      this.timeout = setTimeout(this.handleTimeout, this.timeoutDuration);
    }
  }
  closeDialog() {
    document.dispatchEvent(new CustomEvent("timeout"));
    clearTimeout(this.dialogTimeout);
    if (this.timeoutActive) {
      this.timeout = setTimeout(this.handleTimeout, this.timeoutDuration);
    }
    this.dialog.close();
  }
  show() {
    this.dialog.showModal();
  }
}
customElements.define("timeout-component", Timeout);
