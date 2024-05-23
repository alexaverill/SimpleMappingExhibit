export const buildDeleteIcon = () => {
  let deleteBtnIcon = document.createElement("img");
  deleteBtnIcon.src = "./assets/delete.png";
  return deleteBtnIcon;
};
export const buildImagePreview = (imgPath) => {
  let parent = document.getElementById("imageList");
  let imageContainer = document.createElement("div");
  imageContainer.id = document.getElementsByClassName(
    "previewImageContainer"
  ).length; //want to be able to delete it easily
  imageContainer.className = "previewImageContainer";
  imageContainer.setAttribute("image", imgPath);
  let image = document.createElement("img");
  image.src = imgPath;
  let deleteBtn = document.createElement("button");
  deleteBtn.className = "imageDeleteBtn";
  deleteBtn.appendChild(buildDeleteIcon());
  deleteBtn.onclick = () => {
    console.log(`Delete image: ${imageContainer.id}`);
    document.getElementById(imageContainer.id).remove();
  };
  imageContainer.appendChild(image);
  imageContainer.appendChild(deleteBtn);
  parent.appendChild(imageContainer);
};
export const handleAddImage = () => {
  if (imageList.length > 0) {
    console.log("NEED to add images to dialog");
    imageList.map((image) => {
      buildImagePreview(image.image);
    });
  }
  document.getElementById("imageAdd").showModal();
};
export const cancelImageSelect = () => {
  document.getElementById("imageAdd").close();
};
export const handleImagesSelected = () => {
  let images = document.getElementsByClassName("previewImageContainer");
  let tempImages = [];
  for (let image of images) {
    let imageObj = { image: image.getAttribute("image") };
    tempImages.push(imageObj);
  }
  document.getElementById("imageLink").value = "";
  document.getElementById("imageList").innerHTML = "";
  document.getElementById("imageAdd").close();
  return tempImages;
};
export const setImageNavigationButtons = (length) => {
  let previousImgBtn = document.getElementById("previous");
  let nextImgBtn = document.getElementById("next");
  if (length <= 1) {
    if (!previousImgBtn.classList.contains("hide")) {
      previousImgBtn.classList.add("hide");
    }
    if (!nextImgBtn.classList.contains("hide")) {
      nextImgBtn.classList.add("hide");
    }
  } else {
    nextImgBtn.classList.remove("hide");
    previousImgBtn.classList.remove("hide");
  }
};
