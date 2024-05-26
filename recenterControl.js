L.Control.zoomHome = L.Control.extend({
  options: {
    position: "bottomright",
    zoomHomeText: "<img src='./assets/recenter.png'/>",
    zoomHomeTitle: "Zoom home",
  },

  onAdd: function (map) {
    var controlName = "recenter-control",
      container = L.DomUtil.create("div", controlName + " leaflet-bar"),
      options = this.options;

    this._zoomHomeButton = this._createButton(
      options.zoomHomeText,
      options.zoomHomeTitle,
      controlName,
      container,
      this._zoomHome
    );
    return container;
  },

  _zoomHome: function (e) {
    let recenterEvent = new CustomEvent("mapRecenter");
    document.dispatchEvent(recenterEvent);
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
