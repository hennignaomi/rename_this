/* global maplibregl, config */
window.StoryLayers = (function () {
  var RENAMED_COLOR = "#ff7876";
  var HIGHLIGHT_COLOR = "#ff4455";
  var HOVER_COLOR = "#f5d442";

  var CORE_LINE_WIDTH = [
    "interpolate",
    ["linear"],
    ["zoom"],
    9,
    2.5,
    11,
    2.5,
    13,
    3.6,
    15,
    4.8,
    16.5,
    5.6,
    18,
    6.2,
  ];

  var GLOW_LINE_WIDTH = [
    "interpolate",
    ["linear"],
    ["zoom"],
    9,
    3.8,
    11,
    4,
    13,
    5.8,
    15,
    8,
    16.5,
    9.5,
    18,
    11,
  ];

  var GLOW_LINE_BLUR = [
    "interpolate",
    ["linear"],
    ["zoom"],
    9,
    0,
    11,
    0.15,
    13,
    0.45,
    15,
    0.8,
    17,
    1.2,
    18,
    1.6,
  ];

  var HIGHLIGHT_CORE_LINE_WIDTH = [
    "interpolate",
    ["linear"],
    ["zoom"],
    9,
    3.2,
    11,
    3.2,
    13,
    4.8,
    15,
    6.4,
    16.5,
    7.4,
    18,
    8.2,
  ];

  var HIGHLIGHT_GLOW_LINE_WIDTH = [
    "interpolate",
    ["linear"],
    ["zoom"],
    9,
    4.8,
    11,
    5,
    13,
    7.2,
    15,
    10,
    16.5,
    11.8,
    18,
    13.6,
  ];
  var map;
  var boundsByLayerId = {};
  var loadPromises = {};
  var sequenceTimers = [];
  var activeLayerIds = [];
  var layerColors = {};
  var popupEl = null;
  var activeChapterId = null;
  var sequenceGeneration = 0;
  var mapHoverMoveHandler = null;
  var mapHoverCanvasHandler = null;
  var mapHoverLeaveHandler = null;
  var mapHoverActiveGroupId = null;
  var mapHoverBaseLayerId = null;
  var mapHoverQueryLayerIds = [];
  var HOVER_HIT_RADIUS = 24;
  var HIT_LINE_WIDTH = 18;

  function layerIdFromFile(file) {
    return (
      "story-" +
      file
        .replace(/_wgs84\.geojson$/i, "")
        .replace(/\.geojson$/i, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase()
    );
  }

  function sourceId(layerId) {
    return layerId + "-source";
  }

  function glowId(layerId) {
    return layerId + "-glow";
  }

  function hitLayerIdFromFile(file) {
    return layerIdFromFile(file) + "-hit";
  }

  function getFlyDuration() {
    return (config && config.mapFlyDuration) || 2800;
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function extendBounds(bounds, coords) {
    if (!coords) return bounds;
    if (typeof coords[0] === "number") {
      if (!bounds) {
        return [coords[0], coords[1], coords[0], coords[1]];
      }
      bounds[0] = Math.min(bounds[0], coords[0]);
      bounds[1] = Math.min(bounds[1], coords[1]);
      bounds[2] = Math.max(bounds[2], coords[0]);
      bounds[3] = Math.max(bounds[3], coords[1]);
      return bounds;
    }
    for (var i = 0; i < coords.length; i += 1) {
      bounds = extendBounds(bounds, coords[i]);
    }
    return bounds;
  }

  function boundsFromGeojson(geojson) {
    var bounds = null;
    (geojson.features || []).forEach(function (feature) {
      var geometry = feature.geometry || {};
      bounds = extendBounds(bounds, geometry.coordinates);
    });
    return bounds;
  }

  function ensureSatelliteLayer() {
    var token =
      typeof getMapboxAccessToken === "function" ? getMapboxAccessToken() : "";
    if (!token || map.getSource("mapbox-satellite")) return;

    var q = "access_token=" + encodeURIComponent(token);
    map.addSource("mapbox-satellite", {
      type: "raster",
      tiles: [
        "https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
          q,
      ],
      tileSize: 256,
    });
    map.addLayer(
      {
        id: "mapbox-satellite-layer",
        type: "raster",
        source: "mapbox-satellite",
        paint: { "raster-opacity": 0 },
      },
      "mapbox-light-layer"
    );
  }

  function setSatelliteVisible(visible, duration) {
    ensureSatelliteLayer();
    if (!map.getLayer("mapbox-satellite-layer")) return;
    var ms = duration == null ? 1200 : duration;
    map.setPaintProperty("mapbox-light-layer", "raster-opacity-transition", {
      duration: ms,
    });
    map.setPaintProperty("mapbox-satellite-layer", "raster-opacity-transition", {
      duration: ms,
    });
    map.setPaintProperty(
      "mapbox-light-layer",
      "raster-opacity",
      visible ? 0.15 : 1
    );
    map.setPaintProperty(
      "mapbox-satellite-layer",
      "raster-opacity",
      visible ? 1 : 0
    );
  }

  function applyLinePaint(layerId, lineColor, options) {
    var highlight = options && options.highlight;
    map.setPaintProperty(glowId(layerId), "line-color", lineColor);
    map.setPaintProperty(
      glowId(layerId),
      "line-width",
      highlight ? HIGHLIGHT_GLOW_LINE_WIDTH : GLOW_LINE_WIDTH
    );
    map.setPaintProperty(glowId(layerId), "line-blur", GLOW_LINE_BLUR);
    map.setPaintProperty(layerId, "line-color", lineColor);
    map.setPaintProperty(
      layerId,
      "line-width",
      highlight ? HIGHLIGHT_CORE_LINE_WIDTH : CORE_LINE_WIDTH
    );
  }

  function applyLayerFeatureFilter(layerId, excludeNames) {
    if (!map.getLayer(layerId)) return;

    var filter = null;
    if (excludeNames && excludeNames.length) {
      filter = ["!", ["in", ["get", "strname"], ["literal", excludeNames]]];
    }

    map.setFilter(layerId, filter);
    if (map.getLayer(glowId(layerId))) {
      map.setFilter(glowId(layerId), filter);
    }
    var hitLayerId = layerId + "-hit";
    if (map.getLayer(hitLayerId)) {
      map.setFilter(hitLayerId, filter);
    }
  }

  function raiseLayerPair(layerId) {
    if (map.getLayer(glowId(layerId))) {
      map.moveLayer(glowId(layerId));
    }
    if (map.getLayer(layerId)) {
      map.moveLayer(layerId);
    }
  }

  function fetchLayerGeojson(file) {
    return fetch("./data/" + file, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Could not load " + file);
      return response.json();
    });
  }

  function applyGeojsonToLayer(layerId, file, geojson, lineColor, options) {
    boundsByLayerId[layerId] = boundsFromGeojson(geojson);
    var src = sourceId(layerId);

    if (!map.getSource(src)) {
      map.addSource(src, { type: "geojson", data: geojson });
      map.addLayer({
        id: glowId(layerId),
        type: "line",
        source: src,
        layout: { "line-cap": "butt", "line-join": "miter" },
        paint: {
          "line-color": lineColor,
          "line-width": GLOW_LINE_WIDTH,
          "line-blur": GLOW_LINE_BLUR,
          "line-opacity": 0,
        },
      });
      map.addLayer({
        id: layerId,
        type: "line",
        source: src,
        layout: { "line-cap": "butt", "line-join": "miter" },
        paint: {
          "line-color": lineColor,
          "line-width": CORE_LINE_WIDTH,
          "line-opacity": 0,
        },
      });
    } else {
      map.getSource(src).setData(geojson);
    }

    if (map.getLayer(layerId)) {
      applyLinePaint(layerId, lineColor, options);
    }
    return layerId;
  }

  function ensureLayer(file, color, options) {
    var layerId = layerIdFromFile(file);
    var lineColor = color || RENAMED_COLOR;
    layerColors[layerId] = lineColor;
    options = options || {};
    var src = sourceId(layerId);

    if (map.getSource(src)) {
      return fetchLayerGeojson(file)
        .then(function (geojson) {
          return applyGeojsonToLayer(layerId, file, geojson, lineColor, options);
        })
        .catch(function (err) {
          console.warn(err);
          return null;
        });
    }

    if (loadPromises[layerId]) {
      return loadPromises[layerId].then(function (id) {
        if (id && map.getLayer(layerId)) {
          applyLinePaint(layerId, lineColor, options);
        }
        return id;
      });
    }

    loadPromises[layerId] = fetchLayerGeojson(file)
      .then(function (geojson) {
        return applyGeojsonToLayer(layerId, file, geojson, lineColor, options);
      })
      .catch(function (err) {
        console.warn(err);
        delete loadPromises[layerId];
        return null;
      });

    return loadPromises[layerId];
  }

  function ensureHitLayer(file) {
    var baseLayerId = layerIdFromFile(file);
    var hitLayerId = hitLayerIdFromFile(file);

    return ensureLayer(file, RENAMED_COLOR).then(function (baseId) {
      if (!baseId || !map.getSource(sourceId(baseLayerId))) return null;

      if (!map.getLayer(hitLayerId)) {
        map.addLayer({
          id: hitLayerId,
          type: "line",
          source: sourceId(baseLayerId),
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": "#000000",
            "line-width": HIT_LINE_WIDTH,
            "line-opacity": 0.01,
          },
        });
      }

      syncHitLayersForFiles([file]);

      return hitLayerId;
    });
  }

  function setLayerVisible(layerId, visible, duration, options) {
    if (!map.getLayer(layerId)) return;
    options = options || {};
    var ms = duration == null ? 900 : duration;
    var highlight = options.highlight;
    map.setPaintProperty(layerId, "line-opacity-transition", { duration: ms });
    map.setPaintProperty(glowId(layerId), "line-opacity-transition", {
      duration: ms,
    });
    map.setPaintProperty(layerId, "line-opacity", visible ? 0.95 : 0);
    map.setPaintProperty(
      glowId(layerId),
      "line-opacity",
      visible ? (highlight ? 0.52 : 0.28) : 0
    );

    var hitLayerId = layerId + "-hit";
    if (map.getLayer(hitLayerId)) {
      map.setPaintProperty(hitLayerId, "line-opacity-transition", {
        duration: ms,
      });
      map.setPaintProperty(hitLayerId, "line-opacity", visible ? 0.01 : 0);
    }
  }

  function hideLayerIds(layerIds, duration) {
    layerIds.forEach(function (layerId) {
      setLayerVisible(layerId, false, duration || 500);
      var idx = activeLayerIds.indexOf(layerId);
      if (idx !== -1) activeLayerIds.splice(idx, 1);
    });
  }

  function hideAll(duration) {
    activeLayerIds.slice().forEach(function (layerId) {
      setLayerVisible(layerId, false, duration || 500);
    });
    activeLayerIds = [];
  }

  function clearSequenceTimers() {
    sequenceTimers.forEach(function (id) {
      window.clearTimeout(id);
    });
    sequenceTimers = [];
  }

  function syncHitLayersForFiles(files) {
    (files || []).forEach(function (file) {
      var baseLayerId = layerIdFromFile(file);
      var hitLayerId = hitLayerIdFromFile(file);
      if (!map.getLayer(hitLayerId)) return;
      var visible = activeLayerIds.indexOf(baseLayerId) !== -1;
      map.setPaintProperty(hitLayerId, "line-opacity", visible ? 0.01 : 0);
    });
  }

  function showFiles(files, duration, replace, stepOptions) {
    stepOptions = stepOptions || {};
    var colorByFile = stepOptions.colors || {};
    var highlightFiles = stepOptions.highlightFiles || {};
    var excludeFrom = stepOptions.excludeFrom || {};

    if (replace) hideAll(400);
    return Promise.all(
      files.map(function (file) {
        var color = colorByFile[file] || RENAMED_COLOR;
        return ensureLayer(file, color, {
          highlight: !!highlightFiles[file],
        });
      })
    ).then(function (layerIds) {
      layerIds.forEach(function (layerId, index) {
        if (!layerId) return;
        var file = files[index];
        if (activeLayerIds.indexOf(layerId) === -1) {
          activeLayerIds.push(layerId);
        }
        applyLayerFeatureFilter(layerId, excludeFrom[file] || null);
        setLayerVisible(layerId, true, duration, {
          highlight: !!highlightFiles[file],
        });
        if (highlightFiles[file]) {
          raiseLayerPair(layerId);
        }
      });
      syncHitLayersForFiles(files);
      return layerIds.filter(Boolean);
    });
  }

  function showHoverFiles(files) {
    return Promise.all(
      files.map(function (file) {
        return ensureLayer(file, HOVER_COLOR);
      })
    ).then(function (layerIds) {
      layerIds.forEach(function (layerId) {
        setLayerVisible(layerId, true, 200);
      });
      return layerIds.filter(Boolean);
    });
  }

  function hideHoverFiles(files) {
    files.forEach(function (file) {
      var layerId = layerIdFromFile(file);
      if (layerColors[layerId] === HOVER_COLOR) {
        setLayerVisible(layerId, false, 200);
      }
    });
  }

  function fitToLayerIds(layerIds, chapter) {
    var bounds = null;
    layerIds.forEach(function (layerId) {
      var b = boundsByLayerId[layerId];
      if (!b) return;
      if (!bounds) bounds = b.slice();
      else {
        bounds[0] = Math.min(bounds[0], b[0]);
        bounds[1] = Math.min(bounds[1], b[1]);
        bounds[2] = Math.max(bounds[2], b[2]);
        bounds[3] = Math.max(bounds[3], b[3]);
      }
    });
    if (!bounds) return;

    var padding = chapter.padding || {
      top: 110,
      right: 40,
      bottom: 40,
      left: 40,
    };
    var boundsPair = [
      [bounds[0], bounds[1]],
      [bounds[2], bounds[3]],
    ];
    var cameraOptions = {
      padding: padding,
      bearing: chapter.location.bearing,
      pitch: chapter.location.pitch,
      maxZoom: chapter.location.zoom,
    };

    if (chapter.fitBoundsZoomScale && chapter.fitBoundsZoomScale !== 1) {
      var camera = map.cameraForBounds(boundsPair, cameraOptions);
      if (camera && Number.isFinite(camera.zoom)) {
        camera.zoom += Math.log2(chapter.fitBoundsZoomScale);
        map.easeTo(
          Object.assign({}, camera, {
            duration: getFlyDuration(),
            easing: easeInOutCubic,
          })
        );
        return;
      }
    }

    map.fitBounds(boundsPair, Object.assign({}, cameraOptions, {
      duration: getFlyDuration(),
      easing: easeInOutCubic,
    }));
  }

  function ensurePopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement("div");
    popupEl.id = "story-hover-popup";
    popupEl.setAttribute("role", "tooltip");
    popupEl.hidden = true;
    document.body.appendChild(popupEl);
    return popupEl;
  }

  function getEventClientXY(event) {
    if (event.originalEvent) {
      return {
        x: event.originalEvent.clientX,
        y: event.originalEvent.clientY,
      };
    }
    if (!map || !map.getCanvas() || !event.point) {
      return { x: 0, y: 0 };
    }
    var rect = map.getCanvas().getBoundingClientRect();
    return {
      x: rect.left + event.point.x,
      y: rect.top + event.point.y,
    };
  }

  function showPopupAtPoint(html, clientX, clientY) {
    var el = ensurePopup();
    el.innerHTML = html;
    el.hidden = false;
    var x = Number.isFinite(clientX) ? clientX : 0;
    var y = Number.isFinite(clientY) ? clientY : 0;
    el.style.left =
      Math.max(12, Math.min(x + 14, window.innerWidth - 332)) + "px";
    el.style.top =
      Math.max(12, Math.min(y + 14, window.innerHeight - 260)) + "px";
  }

  function hidePopup() {
    if (popupEl) popupEl.hidden = true;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function featureStreetName(features) {
    if (!features || !features.length) return null;
    for (var i = 0; i < features.length; i += 1) {
      var props = features[i].properties;
      if (props && props.strname) return props.strname;
    }
    return null;
  }

  function streetRenameFormerText(info) {
    if (info.note) {
      return escapeHtml(info.note);
    }
    if (info.formers && info.formers.length) {
      return info.formers
        .map(function (entry) {
          return (
            "bis " + escapeHtml(entry.until) + ": " + escapeHtml(entry.former)
          );
        })
        .join(", ");
    }
    if (info.until && info.former) {
      return (
        "bis " + escapeHtml(info.until) + ": " + escapeHtml(info.former)
      );
    }
    return "";
  }

  function buildStreetRenameLinePopup(streets, features) {
    var strname = featureStreetName(features);
    if (!strname || !streets || !streets[strname]) return "";

    var info = streets[strname];
    var label = info.name || strname;
    var formerText = streetRenameFormerText(info);
    if (!formerText) {
      return (
        '<span class="story-hover-popup--street">' +
        '<span class="story-hover-popup-name">' +
        escapeHtml(label) +
        "</span></span>"
      );
    }
    return (
      '<span class="story-hover-popup--street">' +
      '<span class="story-hover-popup-name">' +
      escapeHtml(label) +
      "</span> · " +
      '<span class="story-hover-popup-former">' +
      formerText +
      "</span></span>"
    );
  }

  function getMapHoverPopupDef(popupId) {
    if (!popupId || !config || !config.mapHoverPopups) return null;
    return config.mapHoverPopups[popupId] || null;
  }

  function popupHtmlFromPopupId(popupId, features) {
    var popupDef = getMapHoverPopupDef(popupId);
    if (!popupDef) return "";

    if (popupDef.type === "street-rename" || popupDef.streets) {
      return buildStreetRenameLinePopup(popupDef.streets, features);
    }
    return "";
  }

  function resolveMapLayerHoverHtml(hoverConfig, features) {
    if (hoverConfig.popupId) {
      return popupHtmlFromPopupId(hoverConfig.popupId, features);
    }
    if (typeof hoverConfig.popupHtml === "function") {
      return hoverConfig.popupHtml(features);
    }
    return hoverConfig.popupHtml;
  }

  function normalizeStoryLayerId(layerId) {
    return String(layerId || "")
      .replace(/-glow$/, "")
      .replace(/-hit$/, "");
  }

  function findHoverGroupByLayerId(chapter, layerId) {
    var baseLayerId = normalizeStoryLayerId(layerId);
    var found = null;
    (chapter.hoverGroups || []).forEach(function (group) {
      (group.files || []).forEach(function (file) {
        if (layerIdFromFile(file) === baseLayerId) found = group;
      });
    });
    return found;
  }

  function findHoverGroupByFeature(chapter, feature) {
    if (!feature || !feature.layer) return null;
    return findHoverGroupByLayerId(chapter, feature.layer.id);
  }

  function collectChapterFiles(chapter) {
    var files = [];
    var seen = {};
    function add(file) {
      if (!file || seen[file]) return;
      seen[file] = true;
      files.push(file);
    }
    (chapter.storyLayers || []).forEach(add);
    (chapter.layerSequence || []).forEach(function (step) {
      (step.files || []).forEach(add);
    });
    (chapter.hoverGroups || []).forEach(function (group) {
      (group.files || []).forEach(add);
    });
    if (chapter.mapLayerHover && chapter.mapLayerHover.layers) {
      chapter.mapLayerHover.layers.forEach(add);
    }
    add(chapter.cameraFitFile);
    return files;
  }

  function reloadChapterLayers(chapter) {
    var files = collectChapterFiles(chapter);
    return Promise.all(
      files.map(function (file) {
        delete loadPromises[layerIdFromFile(file)];
        return ensureLayer(file, RENAMED_COLOR);
      })
    ).then(function () {
      return Promise.all(files.map(ensureHitLayer));
    });
  }

  function unbindMapClusterHover() {
    if (map && mapHoverMoveHandler) {
      map.off("mousemove", mapHoverMoveHandler);
    }
    if (map && mapHoverCanvasHandler && map.getCanvas()) {
      map.getCanvas().removeEventListener("mousemove", mapHoverCanvasHandler);
    }
    if (map && mapHoverLeaveHandler) {
      map.off("mouseout", mapHoverLeaveHandler);
    }
    if (map && mapHoverLeaveHandler && map.getCanvas()) {
      map.getCanvas().removeEventListener("mouseleave", mapHoverLeaveHandler);
    }
    mapHoverMoveHandler = null;
    mapHoverCanvasHandler = null;
    mapHoverLeaveHandler = null;
    mapHoverActiveGroupId = null;
    mapHoverBaseLayerId = null;
    mapHoverQueryLayerIds = [];
    if (map && map.getCanvas()) {
      map.getCanvas().style.cursor = "";
    }
    hidePopup();
  }

  function applyMapClusterHoverGroup(chapter, group, clientX, clientY) {
    if (!mapHoverBaseLayerId) return;

    var nextGroupId = group ? group.id : null;
    if (nextGroupId !== mapHoverActiveGroupId) {
      mapHoverActiveGroupId = nextGroupId;
      setLayerVisible(mapHoverBaseLayerId, !group, 0);
      (chapter.hoverGroups || []).forEach(function (g) {
        (g.files || []).forEach(function (file) {
          var layerId = layerIdFromFile(file);
          setLayerVisible(layerId, group && g.id === group.id, 0);
        });
      });
    }

    if (group) {
      showPopupAtPoint(group.popupHtml, clientX, clientY);
    } else {
      hidePopup();
    }
  }

  function hoverQueryLayerIdsFromFiles(files) {
    var ids = [];
    (files || []).forEach(function (file) {
      ids.push(hitLayerIdFromFile(file));
    });
    return ids;
  }

  function attachMapHover(
    chapterId,
    queryLayerIds,
    getPopupHtml,
    onFeaturesChange
  ) {
    var canvas = map.getCanvas();
    if (!canvas) return;

    mapHoverQueryLayerIds = queryLayerIds.slice();

    function handleHoverPoint(point, clientX, clientY, originalEvent) {
      if (activeChapterId !== chapterId) return;

      var layers = mapHoverQueryLayerIds.filter(function (layerId) {
        return map.getLayer(layerId);
      });
      if (!layers.length) return;

      var radius = HOVER_HIT_RADIUS;
      var features = map.queryRenderedFeatures(
        [
          [point.x - radius, point.y - radius],
          [point.x + radius, point.y + radius],
        ],
        { layers: layers }
      );

      if (!features.length) {
        hidePopup();
        canvas.style.cursor = "grab";
        if (onFeaturesChange) onFeaturesChange(null, originalEvent);
        return;
      }

      var popupHtml =
        typeof getPopupHtml === "function" ? getPopupHtml(features) : getPopupHtml;
      if (popupHtml) {
        showPopupAtPoint(popupHtml, clientX, clientY);
      } else {
        hidePopup();
      }
      canvas.style.cursor = "pointer";
      if (onFeaturesChange) onFeaturesChange(features, originalEvent);
    }

    mapHoverMoveHandler = function (event) {
      var client = getEventClientXY(event);
      handleHoverPoint(event.point, client.x, client.y, event.originalEvent);
    };

    mapHoverCanvasHandler = function (domEvent) {
      var rect = canvas.getBoundingClientRect();
      handleHoverPoint(
        {
          x: domEvent.clientX - rect.left,
          y: domEvent.clientY - rect.top,
        },
        domEvent.clientX,
        domEvent.clientY,
        domEvent
      );
    };

    map.on("mousemove", mapHoverMoveHandler);
    canvas.addEventListener("mousemove", mapHoverCanvasHandler);

    mapHoverLeaveHandler = function () {
      hidePopup();
      canvas.style.cursor = "grab";
      if (onFeaturesChange) onFeaturesChange(null, null);
    };
    map.on("mouseout", mapHoverLeaveHandler);
    canvas.addEventListener("mouseleave", mapHoverLeaveHandler);
  }

  function bindMapLayerHover(chapter) {
    unbindMapClusterHover();
    if (!chapter.mapLayerHover) return;

    var hoverConfig = chapter.mapLayerHover;
    var files = hoverConfig.layers || [];

    return Promise.all(files.map(ensureHitLayer)).then(function (hitLayerIds) {
      if (activeChapterId !== chapter.id) return;

      var queryLayerIds = hitLayerIds.filter(Boolean);
      syncHitLayersForFiles(files);
      queryLayerIds.forEach(function (hitLayerId) {
        if (!map.getLayer(hitLayerId)) return;
        map.setPaintProperty(hitLayerId, "line-opacity", 0.01);
        var baseLayerId = hitLayerId.replace(/-hit$/, "");
        if (map.getLayer(baseLayerId)) {
          map.setFilter(hitLayerId, map.getFilter(baseLayerId));
        }
        map.moveLayer(hitLayerId);
      });

      attachMapHover(chapter.id, queryLayerIds, function (features) {
        return resolveMapLayerHoverHtml(hoverConfig, features);
      });
    });
  }

  function bindMapClusterHover(chapter) {
    unbindMapClusterHover();
    if (!chapter.mapClusterHover || !chapter.hoverGroups || !chapter.storyLayers) {
      return Promise.resolve();
    }

    mapHoverBaseLayerId = layerIdFromFile(chapter.storyLayers[0]);
    mapHoverQueryLayerIds = [];

    var preload = [ensureLayer(chapter.storyLayers[0], RENAMED_COLOR)];
    chapter.hoverGroups.forEach(function (group) {
      (group.files || []).forEach(function (file) {
        preload.push(ensureLayer(file, RENAMED_COLOR));
        mapHoverQueryLayerIds.push(layerIdFromFile(file));
      });
    });

    var hitPreload = mapHoverQueryLayerIds.map(ensureHitLayer);

    return Promise.all(preload.concat(hitPreload)).then(function () {
      if (activeChapterId !== chapter.id) return;

      setLayerVisible(mapHoverBaseLayerId, true, 0);
      chapter.hoverGroups.forEach(function (group) {
        (group.files || []).forEach(function (file) {
          setLayerVisible(layerIdFromFile(file), false, 0);
        });
      });
      mapHoverActiveGroupId = null;

      var queryHitLayerIds = mapHoverQueryLayerIds
        .map(function (layerId) {
          return layerId + "-hit";
        })
        .filter(function (hitLayerId) {
          return map.getLayer(hitLayerId);
        });

      queryHitLayerIds.forEach(function (hitLayerId) {
        var baseLayerId = hitLayerId.replace(/-hit$/, "");
        if (map.getLayer(baseLayerId)) {
          map.setFilter(hitLayerId, map.getFilter(baseLayerId));
        }
        map.moveLayer(hitLayerId);
      });

      attachMapHover(
        chapter.id,
        queryHitLayerIds,
        null,
        function (features, domEvent) {
          if (!features || !features.length) {
            applyMapClusterHoverGroup(chapter, null, 0, 0);
            return;
          }
          var group = findHoverGroupByFeature(chapter, features[0]);
          if (!group) {
            applyMapClusterHoverGroup(chapter, null, 0, 0);
            return;
          }
          var x = domEvent ? domEvent.clientX : 0;
          var y = domEvent ? domEvent.clientY : 0;
          applyMapClusterHoverGroup(chapter, group, x, y);
        }
      );
    });
  }

  function hideHoverLayersOnly() {
    Object.keys(layerColors).forEach(function (layerId) {
      if (layerColors[layerId] === HOVER_COLOR) {
        setLayerVisible(layerId, false, 0);
      }
    });
  }

  function runLayerSequenceStep(step, chapter, generation) {
    if (generation !== sequenceGeneration || activeChapterId !== chapter.id) {
      return;
    }
    showFiles(step.files || [], 400, step.replace !== false, {
      colors: step.colors,
      excludeFrom: step.excludeFrom,
      highlightFiles: step.highlightFiles,
    }).then(function (layerIds) {
      if (generation !== sequenceGeneration || activeChapterId !== chapter.id) {
        return;
      }
      if (step.fitBounds && layerIds.length) {
        fitToLayerIds(layerIds, chapter);
      }
      if (chapter.mapLayerHover) {
        bindMapLayerHover(chapter);
      }
    });
  }

  function runLayerSequence(chapter, generation) {
    chapter.layerSequence.forEach(function (step) {
      var delay = step.delay || 0;
      if (delay === 0) {
        runLayerSequenceStep(step, chapter, generation);
        return;
      }
      var timer = window.setTimeout(function () {
        runLayerSequenceStep(step, chapter, generation);
      }, delay);
      sequenceTimers.push(timer);
    });
  }

  function enterChapter(chapter) {
    sequenceGeneration += 1;
    var generation = sequenceGeneration;
    activeChapterId = chapter.id;

    clearSequenceTimers();
    unbindMapClusterHover();
    hidePopup();
    hideHoverLayersOnly();
    hideAll(0);
    setSatelliteVisible(!!chapter.satellite, 400);

    reloadChapterLayers(chapter).then(function () {
      if (generation !== sequenceGeneration || activeChapterId !== chapter.id) {
        return;
      }

      if (chapter.cameraFitFile) {
        fitToLayerIds([layerIdFromFile(chapter.cameraFitFile)], chapter);
      }

      if (chapter.layerSequence && chapter.layerSequence.length) {
        runLayerSequence(chapter, generation);
      } else if (chapter.storyLayers && chapter.storyLayers.length) {
        showFiles(chapter.storyLayers, 400, false).then(function (layerIds) {
          if (generation !== sequenceGeneration || activeChapterId !== chapter.id) {
            return;
          }
          if (chapter.fitStoryBounds !== false && layerIds.length) {
            fitToLayerIds(layerIds, chapter);
          }
          if (chapter.mapClusterHover) {
            bindMapClusterHover(chapter);
          }
          if (chapter.mapLayerHover) {
            bindMapLayerHover(chapter);
          }
        });
      }
    });
  }

  function exitChapter(chapter) {
    if (!chapter || activeChapterId !== chapter.id) {
      return;
    }
    clearSequenceTimers();
    unbindMapClusterHover();
    hidePopup();
    hideHoverLayersOnly();
    activeChapterId = null;
  }

  function init(mapInstance) {
    map = mapInstance;
    ensureSatelliteLayer();

    var files = new Set();
    (config.chapters || []).forEach(function (chapter) {
      (chapter.storyLayers || []).forEach(function (file) {
        files.add(file);
      });
      (chapter.layerSequence || []).forEach(function (step) {
        (step.files || []).forEach(function (file) {
          files.add(file);
        });
      });
      (chapter.hoverGroups || []).forEach(function (group) {
        (group.files || []).forEach(function (file) {
          files.add(file);
        });
      });
      if (chapter.mapLayerHover && chapter.mapLayerHover.layers) {
        chapter.mapLayerHover.layers.forEach(function (file) {
          files.add(file);
        });
      }
    });
    files.forEach(function (file) {
      ensureLayer(file, RENAMED_COLOR);
      ensureHitLayer(file);
    });
  }

  return {
    init: init,
    enterChapter: enterChapter,
    exitChapter: exitChapter,
    layerIdFromFile: layerIdFromFile,
    setSatelliteVisible: setSatelliteVisible,
    fitToLayerIds: fitToLayerIds,
    easeInOutCubic: easeInOutCubic,
    getFlyDuration: getFlyDuration,
  };
})();
