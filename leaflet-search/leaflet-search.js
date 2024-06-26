/*!
 * LeafletSearch 1.0.2
 * (c) 2023 Sjaak Priester, Amsterdam
 * MIT License
 * https://github.com/sjaakp/leaflet-search
 * https://sjaakpriester.nl
 */
!(function () {
  "use strict";
  !(function (t) {
    if (t && "undefined" != typeof window) {
      var n = document.createElement("style");
      n.setAttribute("type", "text/css"),
        (n.innerHTML = t),
        document.head.appendChild(n);
    }
  })(
    ".geo-search{box-shadow:0 1px 5px rgba(0,0,0,.65)}.geo-search svg{width:1.2em}.geo-search input{transition:width .4s;width:0;padding:2px 0;border:solid #888;border-width:1px 0;outline:0}.geo-search.open input{width:15em;padding:2px 2px;border-width:1px;border-top-left-radius:4px;border-bottom-left-radius:4px}.geo-search button{border:1px solid #888;border-top-right-radius:4px;border-bottom-right-radius:4px;padding:2px 6px}.geo-search button:hover{background-color:#ddd}"
  ),
    (L.geo = {
      Geocoder: L.Class.extend({
        initialize: function (t, n) {
          (this._map = t), L.setOptions(this, n);
        },
        constructUrl: function (t, n) {
          void 0 === n && (n = {});
          var e = Object.assign({}, this.options, n),
            o = new URL(t);
          for (var i in e) o.searchParams.set(i, e[i]);
          return o;
        },
        fetchJson: function (t) {
          return fetch(t.href).then(function (t) {
            return t.json();
          });
        },
        placeMarker: function (t, n, e) {
          this._map.placeMarker(t, n, e);
        },
        fire: function (t) {
          this._map.fire(t);
        },
        suggest: function (t, n) {},
        lookup: function (t) {},
      }),
    }),
    (L.geo.Nominatim = L.geo.Geocoder.extend({
      url: "https://nominatim.openstreetmap.org/",
      mark: function (t) {
        var n = L.latLng(t.lat, t.lon),
          e = t.boundingbox,
          o = L.latLngBounds([e[0], e[2]], [e[1], e[3]]);
        this.placeMarker(n, o, t);
      },
      search: function (t) {
        var n = this.constructUrl(this.url + "search", {
          format: "json",
          q: t,
        });
        return this.fetchJson(n);
      },
      suggest: function (t, n) {
        var e = this;
        this.search(t)
          .then(function (t) {
            n.innerHTML = t.reduce(function (t, n) {
              return (
                t +
                '<option data-id="' +
                n.osm_type.charAt(0).toUpperCase() +
                n.osm_id +
                '">' +
                n.display_name +
                "</option>"
              );
            }, "");
          })
          .catch(function (t) {
            return e.fire(t);
          });
      },
      lookup: function (t) {
        var n = this,
          e = this.constructUrl(this.url + "lookup", {
            format: "json",
            osm_ids: t,
          });
        this.fetchJson(e)
          .then(function (t) {
            return n.mark(t[0]);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
      geocode: function (t) {
        var n = this;
        this.search(t)
          .then(function (t) {
            if (t.length < 1) throw "notfound";
            return t[0];
          })
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
    })),
    (L.geo.GeoNames = L.geo.Geocoder.extend({
      url: "http://api.geonames.org/search",
      fetchGeonames: function (t) {
        return this.fetchJson(t).then(function (t) {
          var n = t.geonames;
          if (!n || n.length < 1) throw "notfound";
          return n;
        });
      },
      mark: function (t) {
        var n = L.latLng(t.lat, t.lng),
          e = t.bbox,
          o = L.latLngBounds([e.north, e.west], [e.south, e.east]);
        this.placeMarker(n, o, t);
      },
      suggest: function (t, n) {
        var e = this,
          o = this.constructUrl(this.url, {
            q: t,
            type: "json",
            style: "short",
          });
        this.fetchGeonames(o)
          .then(function (t) {
            n.innerHTML = t.reduce(function (t, n) {
              return (
                t +
                '<option data-id="' +
                n.geonameId +
                '">' +
                n.name +
                "&emsp;" +
                n.countryCode +
                "</option>"
              );
            }, "");
          })
          .catch(function (t) {
            return e.fire(t);
          });
      },
      lookup: function (t) {
        var n = this,
          e = this.constructUrl("http://api.geonames.org/getJSON", {
            geonameId: t,
          });
        this.fetchJson(e)
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
      geocode: function (t) {
        var n = this,
          e = this.constructUrl(this.url, { q: t, inclBbox: !0 });
        this.fetchGeonames(e)
          .then(function (t) {
            return t.shift();
          })
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
    })),
    (L.geo.Here = L.geo.Geocoder.extend({
      mark: function (t) {
        var n = t.displayPosition,
          e = L.latLng(n.latitude, n.longitude),
          o = t.mapView,
          i = o.topLeft,
          r = o.bottomRight,
          s = L.latLngBounds(
            [i.latitude, r.longitude],
            [r.latitude, i.longitude]
          );
        this.placeMarker(e, s, t);
      },
      fetchData: function (t) {
        var n = this;
        t.jsonattributes = 1;
        var e = this.constructUrl(
          "https://geocoder.ls.hereapi.com/6.2/geocode.json",
          t
        );
        this.fetchJson(e)
          .then(function (t) {
            return t.response.view.shift().result.shift();
          })
          .then(function (t) {
            return n.mark(t.location);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
      suggest: function (t, n) {
        var e = this,
          o = this.constructUrl(
            "https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json",
            { query: t }
          );
        this.fetchJson(o)
          .then(function (t) {
            return t.suggestions;
          })
          .then(function (t) {
            n.innerHTML = t.reduce(function (t, n) {
              return (
                t +
                '<option data-id="' +
                n.locationId +
                '">' +
                n.label +
                "</option>"
              );
            }, "");
          })
          .catch(function (t) {
            return e.fire(t);
          });
      },
      lookup: function (t) {
        this.fetchData({ locationid: t });
      },
      geocode: function (t) {
        this.fetchData({ searchtext: t });
      },
    })),
    (L.geo.TomTom = L.geo.Geocoder.extend({
      url: "https://api.tomtom.com/search/2/geocode/",
      suggestions: [],
      datalist: null,
      mark: function (t) {
        var n = t.position,
          e = L.latLng(n.lat, n.lon),
          o = t.viewport,
          i = o.topLeftPoint,
          r = o.btmRightPoint,
          s = L.latLngBounds([i.lat, r.lon], [r.lat, i.lon]);
        this.placeMarker(e, s, t);
      },
      fetchResults: function (t, n) {
        void 0 === n && (n = {});
        var e = encodeURIComponent(t),
          o = this.constructUrl("" + this.url + e + ".json", n);
        return this.fetchJson(o).then(function (t) {
          if (t.summary.numResults < 1) throw "notfound";
          return t.results;
        });
      },
      suggest: function (t, n) {
        var e = this;
        (this.datalist = n),
          this.fetchResults(t, { typeahead: !0 })
            .then(function (t) {
              (e.suggestions = t),
                (n.innerHTML = t.reduce(function (t, n) {
                  return (
                    t +
                    '<option data-id="' +
                    n.id +
                    '">' +
                    n.address.freeformAddress +
                    "</option>"
                  );
                }, ""));
            })
            .catch(function (t) {
              return e.fire(t);
            });
      },
      lookup: function (t) {
        var n = this.suggestions.find(function (n) {
          return n.id === t;
        });
        n && this.mark(n);
      },
      geocode: function (t) {
        var n = this;
        this.fetchResults(t)
          .then(function (t) {
            return t.shift();
          })
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
    })),
    (L.geo.Kadaster = L.geo.Geocoder.extend({
      url: "https://api.pdok.nl/bzk/locatieserver/search/v3_1/",
      mark: function (t) {
        this.placeMarker(t.centroide_ll.match(/[\d.]+/g).reverse(), null, t);
      },
      suggest: function (t, n) {
        var e = this,
          o = this.constructUrl(this.url + "suggest", {
            q: t + " and -type:postcode",
          });
        this.fetchJson(o)
          .then(function (t) {
            if (t.response.numFound < 1) throw "notfound";
            return t.highlighting;
          })
          .then(function (t) {
            var e = "";
            for (var o in t) {
              e +=
                '<option data-id="' +
                o +
                '">' +
                t[o].suggest.shift() +
                "</option>";
            }
            n.innerHTML = e;
          })
          .catch(function (t) {
            return e.fire(t);
          });
      },
      lookup: function (t) {
        var n = this,
          e = this.constructUrl(this.url + "lookup", { id: t });
        this.fetchJson(e)
          .then(function (t) {
            return t.response.docs.shift();
          })
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
      geocode: function (t) {
        var n = this,
          e = this.constructUrl(this.url + "free", {
            q: t + " and -type:postcode",
          });
        this.fetchJson(e)
          .then(function (t) {
            if (t.response.numFound < 1) throw "notfound";
            return t.response.docs.shift();
          })
          .then(function (t) {
            return n.mark(t);
          })
          .catch(function (t) {
            return n.fire(t);
          });
      },
    }));
  var t =
      "undefined" != typeof globalThis
        ? globalThis
        : "undefined" != typeof window
        ? window
        : "undefined" != typeof global
        ? global
        : "undefined" != typeof self
        ? self
        : {},
    n = /^\s+|\s+$/g,
    e = /^[-+]0x[0-9a-f]+$/i,
    o = /^0b[01]+$/i,
    i = /^0o[0-7]+$/i,
    r = parseInt,
    s = "object" == typeof t && t && t.Object === Object && t,
    u = "object" == typeof self && self && self.Object === Object && self,
    c = s || u || Function("return this")(),
    a = Object.prototype.toString,
    h = Math.max,
    f = Math.min,
    l = function () {
      return c.Date.now();
    };
  function d(t) {
    var n = typeof t;
    return !!t && ("object" == n || "function" == n);
  }
  function g(t) {
    if ("number" == typeof t) return t;
    if (
      (function (t) {
        return (
          "symbol" == typeof t ||
          ((function (t) {
            return !!t && "object" == typeof t;
          })(t) &&
            "[object Symbol]" == a.call(t))
        );
      })(t)
    )
      return NaN;
    if (d(t)) {
      var s = "function" == typeof t.valueOf ? t.valueOf() : t;
      t = d(s) ? s + "" : s;
    }
    if ("string" != typeof t) return 0 === t ? t : +t;
    t = t.replace(n, "");
    var u = o.test(t);
    return u || i.test(t) ? r(t.slice(2), u ? 2 : 8) : e.test(t) ? NaN : +t;
  }
  var p = function (t, n, e) {
    var o,
      i,
      r,
      s,
      u,
      c,
      a = 0,
      p = !1,
      m = !1,
      v = !0;
    if ("function" != typeof t) throw new TypeError("Expected a function");
    function L(n) {
      var e = o,
        r = i;
      return (o = i = void 0), (a = n), (s = t.apply(r, e));
    }
    function b(t) {
      return (a = t), (u = setTimeout(x, n)), p ? L(t) : s;
    }
    function k(t) {
      var e = t - c;
      return void 0 === c || e >= n || e < 0 || (m && t - a >= r);
    }
    function x() {
      var t = l();
      if (k(t)) return y(t);
      u = setTimeout(
        x,
        (function (t) {
          var e = n - (t - c);
          return m ? f(e, r - (t - a)) : e;
        })(t)
      );
    }
    function y(t) {
      return (u = void 0), v && o ? L(t) : ((o = i = void 0), s);
    }
    function w() {
      var t = l(),
        e = k(t);
      if (((o = arguments), (i = this), (c = t), e)) {
        if (void 0 === u) return b(c);
        if (m) return (u = setTimeout(x, n)), L(c);
      }
      return void 0 === u && (u = setTimeout(x, n)), s;
    }
    return (
      (n = g(n) || 0),
      d(e) &&
        ((p = !!e.leading),
        (r = (m = "maxWait" in e) ? h(g(e.maxWait) || 0, n) : r),
        (v = "trailing" in e ? !!e.trailing : v)),
      (w.cancel = function () {
        void 0 !== u && clearTimeout(u), (a = 0), (o = c = i = u = void 0);
      }),
      (w.flush = function () {
        return void 0 === u ? s : y(l());
      }),
      w
    );
  };
  (L.Control.Search = L.Control.extend({
    initialize: function (t) {
      L.setOptions(this, L.extend({ debounce: 300, suggest: 2 }, t));
    },
    onAdd: function (t) {
      var n = t.getContainer().id + "_dl",
        e = L.DomUtil.create("div", "geo-search"),
        o = L.DomUtil.create("input", null, e);
      (o.type = "text"),
        o.setAttribute("list", n),
        L.DomEvent.on(
          o,
          "input",
          p(function (n) {
            n.target.value.length >= this.options.suggest &&
              t._geocoder.suggest(n.target.value, r);
          }, this.options.debounce),
          this
        ),
        L.DomEvent.on(
          o,
          "change",
          function (t) {
            var n = t.target.value,
              o = r.childNodes;
            (t.target.value = ""), e.classList.remove("open");
            for (var i = 0; i < o.length; i++)
              if (n.startsWith(o[i].innerText))
                return void this._geocoder.lookup(o[i].dataset.id);
            this.geocode(n);
          },
          t
        );
      var i = L.DomUtil.create("button", null, e);
      (i.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"/></svg>'),
        (i.title = "Search"),
        L.DomEvent.on(
          i,
          "click",
          function (t) {
            t.preventDefault(), t.stopPropagation(), this.toggle();
          },
          this
        );
      var r = L.DomUtil.create("datalist", null, e);
      return (r.id = n), e;
    },
    toggle: function () {
      var t = this.getContainer(),
        n = t.classList,
        e = n.contains("open");
      n.toggle("open"), e || t.children[0].focus();
    },
  })),
    (L.control.search = function (t) {
      return new L.Control.Search(t);
    }),
    L.Map.include({
      marker: null,
      placeMarker: function (t, n, e) {
        if (
          (this.fire("geofound", { latlng: t, bbox: n, place: e }), this.marker)
        )
          this.marker.setLatLng(t);
        else {
          var o = this.options.createMarker || L.marker;
          this.marker = o(t).addTo(this);
        }
        this.options.fly
          ? n
            ? this.flyToBounds(n)
            : this.flyTo(t)
          : n
          ? this.fitBounds(n)
          : this.panTo(t);
      },
      geocode: function (t) {
        return this._geocoder.geocode(t), this;
      },
      setGeocoder: function (t, n) {
        return (
          void 0 === n && (n = {}),
          (this._geocoder = new L.geo[t](this, n)),
          this
        );
      },
    }),
    L.Map.addInitHook(function () {
      this.setGeocoder("Nominatim", {});
    });
})();
//# sourceMappingURL=leaflet-search.js.map
