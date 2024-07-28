const buildDeleteIcon = () => {
  let deleteBtnIcon = document.createElement("img");
  deleteBtnIcon.src = "./assets/delete.png";
  return deleteBtnIcon;
};
const buildImagePreview = (imgPath) => {
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
const handleAddImage = () => {
  if (imageList.length > 0) {
    let parent = document.getElementById("imageList");
    parent.innerHTML = "";
    imageList.map((image) => {
      buildImagePreview(image.image);
    });
  }
  document.getElementById("imageAdd").showModal();
};
const cancelImageSelect = () => {
  document.getElementById("imageAdd").close();
};
const handleImagesSelected = () => {
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
