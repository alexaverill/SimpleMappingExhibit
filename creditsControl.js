L.Control.creditsControl = L.Control.extend({
  options: {
    position: "bottomright",
    controlText: "<img src='./assets/info.png'/>",
    controlTitle: "MapInfo",
  },

  onAdd: function (map) {
    var controlName = "info-control",
      container = L.DomUtil.create("div", controlName + " leaflet-bar"),
      options = this.options;

    this._controlButton = this._createButton(
      options.controlText,
      options.controlTitle,
      controlName,
      container,
      this._controlCallback
    );
    return container;
  },

  _controlCallback: function (e) {
    let event = new CustomEvent("mapCredits");
    document.dispatchEvent(event);
  },

  _createButton: function (html, title, className, container, fn) {
    var link = L.DomUtil.create("a", className, container);
    link.innerHTML = html;
    link.href = "#";
    link.title = title;

    L.DomEvent.on(link, "mousedown dblclick", L.DomEvent.stopPropagation)
      .on(link, "click", L.DomEvent.stop)
      .on(link, "click", fn, this)
      .on(link, "click", this._refocusOnMap, this);

    return link;
  },
});
