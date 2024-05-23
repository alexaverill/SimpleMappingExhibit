const createLanguageEntry = (language) => {
  let div = document.createElement("div");
  div.className = "languageEntry";
  let languageName = document.createElement("p");
  languageName.innerText = language;
  div.appendChild(languageName);

  let deleteBtn = document.createElement("button");
  deleteBtn.className = "deleteBtn";
  deleteBtn.appendChild(buildDeleteIcon());
  deleteBtn.onclick = () => removeLanguage(language);
  div.appendChild(deleteBtn);
  return div;
};
export const displayLanguages = () => {
  let languageOptionDiv = document.getElementById("languageEntries");
  languageOptionDiv.innerHTML = [];
  for (let language of languages) {
    languageOptionDiv.appendChild(createLanguageEntry(language));
  }
};
export const SaveLanguageText = () => {
  let titleInput = document.getElementById("title");
  let descriptionInput = document.getElementById("description");
  let title = titleInput.value;
  let description = descriptionInput.value;
  let titleObj = { language: currentLanguage, title };
  let descriptionObj = { language: currentLanguage, description };
  let titleIndex = titles.find((title) => title.language == currentLanguage);
  if (titleIndex >= 0) {
    titles.splice(titleIndex, 1, titleObj);
  } else {
    titles.push(titleObj);
  }
  let descriptionIndex = descriptions.find(
    (description) => description.language == currentLanguage
  );
  if (descriptionIndex >= 0) {
    descriptions.splice(descriptionIndex, 1, descriptionObj);
  } else {
    descriptions.push(descriptionObj);
  }
};
const handleLanguageSelection = (e) => {
  let titleInput = document.getElementById("title");
  let descriptionInput = document.getElementById("description");
  //save current text
  SaveLanguageText();
  //change set selected language
  currentLanguage = e.value;
  let newTitle =
    titles.find((title) => title.language === currentLanguage) ?? "";
  let newDescription =
    descriptions.find((desc) => desc.language === currentLanguage) ?? "";
  titleInput.value = newTitle.title;
  descriptionInput.value = newDescription.description;
  //display other language text;
  console.log(e);
};
const populateLanguageSelector = () => {
  // let div = createElement()
  let languageSelector = document.getElementById("languageSelector");
  languageSelector.innerHTML = "";
  let languageOptions = [];
  for (language of languages) {
    let option = document.createElement("option");
    option.value = language;
    option.innerText = language;
    languageSelector.appendChild(option);
  }
};
const removeLanguage = (language) => {
  if (languages.length <= 1) {
    return;
  }
  languages.splice(languages.indexOf(language), 1);
  displayLanguages();
};
const addLanguage = (language) => {
  languages.push(language);
  displayLanguages();
  populateLanguageSelector();
  currentLanguage = languages?.at(0);
};
const addLanguageHandler = (e) => {
  let entry = document.getElementById("languageEntry");
  addLanguage(entry.value);
  entry.value = "";
};
