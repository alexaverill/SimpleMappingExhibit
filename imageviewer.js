class ImageViewer extends HTMLElement {
  constructor() {
    super();
    this.currentImage = 0;
    this.imageList = [];
  }
  createStyles() {
    let style = document.createElement("style");
    style.textContent = `
            .imageContainer{
position: relative;
  display: flex;
  justify-content: center;
  height: 400px;
  border-radius: .5rem;
  width: 90%;
  max-height: 400px;
  background: lightgray;

            }
            .controls {
                position: absolute;
                top: 0;
                left: 0;
                display: grid;
                height: 100%;
                width: 100%;
                grid-template-columns: .9fr;
                  grid-template-rows: 1.5fr 1fr 1fr;
                  grid-template-areas:
                ".    . .   " 
                "prev . next" 
                ".    . .   ";
                  padding-left: 1rem;
                  padding-right: 1rem;
            }
            .prev{
                grid-area:prev;
                height: 50px;
                width:50px;
                transform: rotateZ(180deg);
                border-radius:50px;
                background:rgba(255, 255, 255, 0.7);
                border:none;
                img{
                    height: 35px;
                }
            }
            .next{
                grid-area:next;
                height: 50px;
                width:50px;
                border:none;
                margin-left: 2px;
                border-radius:50px;
                background:rgba(255, 255, 255, 0.7);
                img{
                   height: 35px;
                }
            }
                    .imageViewer {
                        height: 100%;
  aspect-ratio: auto;
  width: 100%;
  object-fit: contain;
  margin: auto;
                    }`;
    this.shadowRoot.appendChild(style);
  }
  handleNext(event) {
    this.currentImage = (this.currentImage + 1) % this.imageList.length;
    console.log(this.currentImage);
    this.img.src = this.imageList[this.currentImage];
  }
  handlePrevious(event) {
    this.currentImage =
      this.currentImage > 0 ? this.currentImage - 1 : this.imageList.length - 1;
    this.img.src = this.imageList[this.currentImage];
  }
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.createStyles();

    let div = document.createElement("div");
    div.className = "imageContainer";

    this.img = document.createElement("img");
    this.img.className = "imageViewer";
    let controls = document.createElement("div");
    controls.classList = "controls";

    this.nextButton = document.createElement("button");
    this.nextButton.innerHTML = '<img class="icon" src="./assets/arrow.png" />';
    this.nextButton.classList = "next";
    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.nextButton.addEventListener("click", this.handleNext);
    this.previousButton = document.createElement("button");
    this.previousButton.innerHTML =
      '<img class="icon" src="./assets/arrow.png" />';
    this.previousButton.classList = "prev";
    this.previousButton.addEventListener("click", this.handlePrevious);
    controls.appendChild(this.previousButton);
    controls.appendChild(this.nextButton);
    this.nextButton.hidden = true;
    this.previousButton.hidden = true;
    div.appendChild(this.img);
    div.appendChild(controls);
    this.shadowRoot.appendChild(div);
  }
  handleEvent(event) {
    console.log(event);
    console.log(this.imageList);
  }
  setImages(imageList) {
    console.log(imageList);
    this.imageList = imageList;
    this.currentImage = 0;
    console.log(this.imageList);
    this.img.src = this.imageList[this.currentImage];
    if (this.imageList.length <= 1) {
      this.nextButton.hidden = true;
      this.previousButton.hidden = true;
    } else {
      this.nextButton.hidden = false;
      this.previousButton.hidden = false;
    }
  }
}
customElements.define("image-viewer", ImageViewer);
