class IconEditor extends HTMLElement {
  html = `
  <link rel="stylesheet" href="iconEditor/iconEditor.css">
  <div class="content">
            <div class="canvasLayers">
                <canvas id="imageEditor"></canvas>
                <canvas id="originPoint"></canvas>


            </div>
            <input type="file" id="imageUpload">
        </div>`;
  offsetPosition = [];
  imageSize = [];
  uploadInstructions = "The default image size is 82x82px";
  offsetInstructions =
    "Select the point on the image where it should be placed on the map.";
  imageData;
  constructor() {
    super();
  }
  getSize() {
    return this.imageSize;
  }
  getOffset() {
    return this.offsetPosition;
  }
  getImage() {
    return this.imageData;
  }
  getImageObj() {
    return {
      image: this.imageData,
      offset: this.offsetPosition,
      size: this.imageSize,
    };
  }
  reset() {
    console.log("Reset Icon Editor");
    this.offsetPosition = [];
    this.imageSize = [];
    this.imageData = null;
    let ctx = this.imageCanvas.getContext("2d");
    ctx.clearRect(0, 0, this.iconWidth, this.iconHeight);
  }
  drawPoint(x, y) {
    console.log(`${x} ${y}`);
    let ctx = this.originCanvas.getContext("2d");
    ctx.clearRect(
      0,
      0,
      this.originCanvas.offsetWidth,
      this.originCanvas.offsetHeight
    );
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 360);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();
  }
  drawDefaultOffset(imageWidth, imageHeight) {
    let x = imageWidth / 2;
    let y = imageHeight;
    this.drawPoint(x, y);
    this.offsetPosition = [x, y];
  }
  getCursorPosition(event) {
    const rect = this.originCanvas.getBoundingClientRect();
    console.log(rect);
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.offsetPosition = [x, y];
    this.drawPoint(x, y);
  }

  connectedCallback() {
    var attributes = this.attributes;
    this.iconHeight = parseFloat(attributes.iconHeight.value);
    this.iconWidth = parseFloat(attributes.iconWidth.value);
    var shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = this.html;
    this.handleEvent = this.handleEvent.bind(this);
    this.imageEncode = this.imageEncode.bind(this);
    this.getCursorPosition = this.getCursorPosition.bind(this);
    this.imageCanvas = shadow.querySelector("#imageEditor");
    this.imageCanvas.width = this.iconWidth ?? 82;
    this.imageCanvas.height = this.iconHeight ?? 82;
    this.originCanvas = shadow.querySelector("#originPoint");
    this.originCanvas.width = this.iconWidth ?? 82;
    this.originCanvas.height = this.iconHeight ?? 82;
    this.originCanvas.addEventListener("mousedown", this.getCursorPosition);
    this.fileUpload = shadow.querySelector("#imageUpload");
    this.fileUpload.addEventListener("change", this.handleEvent);
  }
  handleEvent(e) {
    console.log(e);
    var reader = new FileReader();
    reader.onload = this.imageEncode;
    reader.readAsDataURL(e.target.files[0]);
  }
  imageEncode(event) {
    this.img = new Image(); // Create new img element
    this.img.onload = () => {
      let ctx = this.imageCanvas.getContext("2d");
      const width = this.img.naturalWidth;
      const height = this.img.naturalHeight;
      let displayWidth =
        width > this.imageCanvas.offsetWidth
          ? this.imageCanvas.offsetWidth
          : width;
      let displayHeight =
        height > this.imageCanvas.offsetHeight
          ? this.imageCanvas.offsetHeight
          : height;
      ctx.clearRect(0, 0, this.iconWidth, this.iconHeight);
      ctx.drawImage(this.img, 0, 0, displayWidth, displayHeight);
      this.imageSize = [displayHeight, displayHeight];
      this.imageData = this.imageCanvas.toDataURL();
      this.drawDefaultOffset(displayWidth, displayHeight);
    };
    this.img.src = event.target.result;
  }
}
customElements.define("icon-editor", IconEditor);
