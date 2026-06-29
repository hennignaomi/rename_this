function getMapboxAccessToken() {
  return (
    (typeof window !== "undefined" && window.MAPBOX_ACCESS_TOKEN) ||
    ""
  );
}

/** Append token to Mapbox tile/sprite/glyph requests (required for MapLibre). */
function createMapboxTransformRequest() {
  return function (url) {
    var token = getMapboxAccessToken();
    if (
      !token ||
      (url.indexOf("mapbox.com") === -1 && url.indexOf("mapbox.cn") === -1)
    ) {
      return { url: url };
    }
    if (url.indexOf("access_token=") !== -1) {
      return { url: url };
    }
    return {
      url:
        url +
        (url.indexOf("?") !== -1 ? "&" : "?") +
        "access_token=" +
        encodeURIComponent(token),
    };
  };
}

/** Raster Mapbox Light — works reliably in MapLibre (vector style URLs often fail). */
function buildMapboxRasterStyle(token) {
  var q = "access_token=" + encodeURIComponent(token);
  return {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      "mapbox-light": {
        type: "raster",
        tiles: [
          "https://api.mapbox.com/styles/v1/mapbox/light-v11/tiles/256/{z}/{x}/{y}?" +
            q,
        ],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.mapbox.com/about/maps/" target="_blank">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#e8e4df" },
      },
      {
        id: "mapbox-light-layer",
        type: "raster",
        source: "mapbox-light",
        paint: { "raster-opacity": 1 },
      },
    ],
  };
}

/** "mapbox" | "basemapde" — set to basemapde to try the BKG basemap.de Web Vektor service. */
var BASEMAP_PROVIDER = "basemapde";

/** basemap.de viewer styleID → MapLibre style JSON (1=Farbe, 2=Relief, 3=Grau). */
var BASEMAPDE_STYLE_URLS = {
  1: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_col.json",
  2: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_top.json",
  3: "https://sgx.geodatenzentrum.de/gdz_basemapde_vektor/styles/bm_web_gry.json",
};

function getBasemapdeStyleUrl(styleId) {
  return BASEMAPDE_STYLE_URLS[styleId || 3] || BASEMAPDE_STYLE_URLS[3];
}

function getResolvedMapStyle() {
  if (BASEMAP_PROVIDER === "basemapde") {
    return getBasemapdeStyleUrl(
      typeof config !== "undefined" ? config.basemapdeStyleId : 3
    );
  }

  var token = getMapboxAccessToken();
  if (!token) {
    console.warn(
      "Missing Mapbox token. Copy config.local.example.js to config.local.js and add your pk. token."
    );
    return {
      version: 8,
      sources: {},
      layers: [
        {
          id: "background",
          type: "background",
          paint: { "background-color": "#f2f0eb" },
        },
      ],
    };
  }
  return buildMapboxRasterStyle(token);
}

function getMapStyle() {
  return getResolvedMapStyle();
}

var BERLIN = {
  center: [13.398058, 52.520545],
  zoom: 10.4,
  pitch: 20,
  bearing: 0,
};

var config = {
  style: getMapStyle(),
  basemapProvider: BASEMAP_PROVIDER,
  basemapdeStyleId: 3,
  /** Hide 2D/3D building footprints on basemap.de (less visual clutter). */
  basemapdeHideBuildings: true,
  /** Hide POI icons (parking, trees, towers, transit stops, etc.). */
  basemapdeHideSymbols: true,
  /** Hide highway shields, rail tracks, tram labels, motorway junctions, center lines, footpaths. */
  basemapdeHideTrafficDetail: true,
  /** Hide tree rows, power lines, and construction/disused road markings. */
  basemapdeHideInfrastructure: true,
  /** Hide dashed line features (tunnels, ditches, hedges, historical walls, etc.). */
  basemapdeHideDashedLines: true,
  /** Hide water bank/center lines (keep water area fills). */
  basemapdeHideWaterLines: true,
  mapbox: BASEMAP_PROVIDER === "mapbox",
  mapFlyDuration: 2800,
  showMarkers: false,
  theme: "dark",
  auto: false,
  title: "Re:Name THIS!",
  subtitle: "Wie Berliner Straßennamen Geschichte schreiben",
  footer: "",
  /** Reusable map hover popups — reference by id from chapter mapLayerHover.popupId */
  mapHoverPopups: {
    "street-rename-dekolonial": {
      type: "street-rename",
      streets: {
        "Anna-Mungunda-Allee": { until: "2024", former: "Petersallee" },
        "Anton-Wilhelm-Amo-Straße": { until: "2025", former: "M***straße" },
        "Audre-Lorde-Straße": { until: "2025", former: "Manteuffelstraße" },
        "Baraschstraße": { until: "2022", former: "Wissmannstraße" },
        "Cornelius-Fredericks-Straße": {
          until: "2022",
          former: "Lüderitzstraße",
        },
        "Freia-Eisner-Straße": { until: "2024", former: "Planstraße C" },
        "Hofjägerallee": {
          name: "Helmut-Kohl-Allee",
          until: "2026",
          former: "Hofjägerallee",
        },
        "Lucy-Lameck-Straße": { until: "2021", former: "Wissmannstraße" },
        "Maji-Maji-Allee": { until: "2024", former: "Petersallee" },
        "Manga-Bell-Platz": { until: "2024", former: "Nachtigalplatz" },
        "Martha-Ndumbe-Platz": { until: "2025", former: "Nettelbeckplatz" },
        "Regina-Jonas-Straße": {
          until: "2025",
          former: "Kohlfurter Straße",
        },
      },
    },
    "street-rename-wedding": {
      type: "street-rename",
      streets: {
        "Cornelius-Fredericks-Straße": {
          until: "2022",
          former: "Lüderitzstraße",
        },
        "Manga-Bell-Platz": { until: "2024", former: "Nachtigalplatz" },
        "Maji-Maji-Allee": { until: "2024", former: "Petersallee" },
        "Anna-Mungunda-Allee": { until: "2024", former: "Petersallee" },
      },
    },
    "street-rename-afrikanisches-viertel": {
      type: "street-rename",
      streets: {
        "Kameruner Straße": {},
        "Togostraße": {},
        "Cornelius-Fredericks-Straße": {
          until: "2022",
          former: "Lüderitzstraße",
        },
        "Guineastraße": {},
        "Kiautschoustraße": {},
        "Samoastraße": {},
        "Pekinger Platz": {},
        "Afrikanische Straße": {},
        "Transvaalstraße": {},
        "Swakopmunder Straße": {},
        "Windhuker Straße": {},
        "Manga-Bell-Platz": { until: "2024", former: "Nachtigalplatz" },
        "Otawistraße": {},
        "Kongostraße": {},
        "Sansibarstraße": {},
        "Mohasistraße": {},
        "Damarastraße": {},
        "Usambarastraße": {},
        "Sambiastraße": {},
        "Maji-Maji-Allee": { until: "2024", former: "Petersallee" },
        "Anna-Mungunda-Allee": { until: "2024", former: "Petersallee" },
        "Ghanastraße": {},
      },
    },
    "street-rename-burenviertel": {
      type: "street-rename",
      streets: {
        "Rudolf-Grosse-Straße": {
          formers: [
            { until: "1922", former: "Bothaallee" },
            { until: "1976", former: "Victor-Franke-Straße" },
          ],
        },
        "Johannes-Zoschke-Straße": {
          until: "1976",
          former: "Ohm-Krüger-Straße",
        },
        "Robert-Siewert-Straße": {
          until: "1976",
          former: "Warmbader Straße",
        },
        "Ursula-Goetze-Straße": {
          until: "1976",
          former: "Waterbergstraße",
        },
      },
    },
    "street-rename-coppi": {
      type: "street-rename",
      streets: {
        "Coppistraße": { note: "Erstbenennung 1972" },
        "Ursula-Goetze-Straße": {
          until: "1976",
          former: "Waterbergstraße",
        },
      },
    },
    "street-rename-odf-lichtenberg": {
      type: "street-rename",
      streets: {
        "Alice-und-Hella-Hirsch-Ring": { note: "Erstbenennung, 2003" },
        "Clara-Grunwald-Straße": { note: "Erstbenennung, 2003" },
        "Charlotte-Salomon-Hain": { note: "Erstbenennung, 2005" },
        "Fritz-Kortner-Straße": { note: "Erstbenennung, 2006" },
        "Georg-Löwenstein-Straße": { note: "Erstbenennung, 2006" },
        "Paula-Fürst-Straße": { note: "Erstbenennung, 2006" },
        "Gisèle-Freund-Hain": { note: "Erstbenennung, 2007" },
        "Johanna-und-Willy-Brauer-Platz": { note: "Erstbenennung, 2008" },
        "Franz-Stimming-Weg": { note: "Erstbenennung, 2010" },
        "Frieda-Rosenthal-Straße": { note: "Erstbenennung, 2010" },
        "Friedrich-Jacobs-Promenade": { note: "Erstbenennung, 2010" },
      },
    },
    "street-rename-reinickendorf-ns": {
      type: "street-rename",
      streets: {
        "Alt-Tegel": { note: "Johanna-Weiher-Straße, 1946-1949" },
        "Blesener Zeile": { note: "Willi-Bartsch-Straße, 1946-1948" },
        "General-Barby-Straße": { note: "Ernst-Beuthke-Straße, 1946-1948" },
        "General-Woyna-Straße": { note: "Hans Schulz Straße, 1946-1948" },
        "Graf-Haeseler-Straße": { note: "Rudolf-Grieb-Straße, 1946-1948" },
        "Hatzfeldtallee": {
          name: "Hatzfeldallee",
          note: "Hans-und-Hilde-Coppi-Allee, 1945-1946",
        },
        "Saalmannstraße": { note: "Karl-Lüdtke-Straße, 1946-1948" },
        "Tile-Brügge-Weg": { note: "Otto-Haase-Straße, 1946-1949" },
        "Ziekowstraße": { note: "Paul-Gehrt-Straße, 1946-1948" },
      },
    },
    "street-rename-post-1990": {
      type: "street-rename",
      streets: {
        "Adele-Sandrock-Straße": { until: "1992", former: "Erich-Wichert-Straße" },
        "Alt-Friedrichsfelde": { until: "1992", former: "Straße der Befreiung" },
        "Am Plumpengraben": { until: "1992", former: "Straße des NAW" },
        "Behmstraße": { until: "1993", former: "Helmut-Just-Straße" },
        "Berliner Allee": { until: "1991", former: "Klement-Gottwald-Allee" },
        "Blumberger Damm": { until: "1992", former: "Otto-Buchwitz-Straße" },
        "Breite Straße": { until: "1991", former: "Johannes-R.-Becher-Straße" },
        "Carola-Neher-Straße": { until: "1992", former: "Erwin-Kramer-Straße" },
        "Cecilienstraße": { until: "1992", former: "Albert-Norden-Straße" },
        "Danziger Straße": { until: "1995", former: "Dimitroffstraße" },
        "Dorotheenstraße": { until: "1995", former: "Clara-Zetkin-Straße" },
        "Ella-Kay-Straße": { until: "1993", former: "Franz-Dahlem-Straße" },
        "Engeldamm": { until: "1991", former: "Fritz-Heckert-Straße" },
        "Erich-Kästner-Straße": { until: "1992", former: "Waldemar-Schmidt-Straße" },
        "Erieseering": { until: "1992", former: "Hans-Loch-Straße" },
        "Ernst-Barlach-Straße": { until: "1992", former: "Fritz-Große-Straße" },
        "Ernst-Bloch-Straße": { until: "1992", former: "Albert-Schreiner-Straße" },
        "Fredersdorfer Straße": { until: "1991", former: "Timbaudstraße" },
        "Gendarmenmarkt": { until: "1991", former: "Platz der Akademie" },
        "Gensinger Straße": { until: "1992", former: "Werner-Lamberz-Straße" },
        "Havemannstraße": { until: "1992", former: "Erich-Glückauf-Straße" },
        "Heinrich-Grüber-Straße": { note: "bis 1991: Hönower Straße (vor 1838)" },
        "Hermann-Hesse-Straße": { until: "1992", former: "Kurt-Fischer-Straße" },
        "Huronseestraße": { until: "1992", former: "Hans-Loch-Straße" },
        "Isenburger Weg": { until: "1990", former: "Ernst-Thälmann-Straße" },
        "Johanna-Tesch-Straße": { until: "1992", former: "Jenny-Matern-Straße" },
        "Jägerstraße": { until: "1991", former: "Otto-Nuschke-Straße" },
        "Kleeblattstraße": { until: "1992", former: "Richard-Günther-Straße" },
        "Landsberger Allee": { until: "1992", former: "Leninallee" },
        "Lilli-Henoch-Straße": { until: "1993", former: "Wilhelm-Florin-Straße" },
        "Lily-Braun-Straße": { until: "1992", former: "Wilhelm-Koenen-Straße" },
        "Louis-Lewin-Straße": { until: "1992", former: "Paul-Verner-Straße" },
        "Luisenstraße": { until: "1991", former: "Hermann-Matern-Straße" },
        "Lustgarten": { note: "ab 1951: Marx-Engels-Platz" },
        "Mark-Twain-Straße": { until: "1992", former: "Richard-Staimer-Straße" },
        "Markgrafenstraße": { until: "1991", former: "Wilhelm-Külz-Straße" },
        "Maxie-Wander-Straße": { until: "1992", former: "Fritz-Selbmann-Straße" },
        "Mehrower Allee": { until: "1992", former: "Otto-Winzer-Straße" },
        "Michiganseestraße": { until: "1992", former: "Hans-Loch-Straße" },
        "Märkische Allee": { until: "1992", former: "Heinrich-Rau-Straße" },
        "Möllendorffstraße": { until: "1991", former: "Jacques-Duclos-Straße" },
        "Neue Grottkauer Straße": { until: "1992", former: "Heinz-Hoffmann-Straße" },
        "Nossener Straße": { until: "1992", former: "Gerhart-Eisler-Straße" },
        "Ontarioseestraße": { until: "1992", former: "Hans-Loch-Straße" },
        "Peter-Huchel-Straße": { until: "1992", former: "Alexander-Abusch-Straße" },
        "Petersburger Platz": { until: "1991", former: "Kotikowplatz" },
        "Petersburger Straße": { until: "1991", former: "Bersarinstraße" },
        "Platz der Vereinten Nationen": { until: "1992", former: "Leninplatz" },
        "Poelchaustraße": { until: "1992", former: "Karl-Maron-Straße" },
        "Radickestraße": { until: "1992", former: "Peter-Kast-Straße" },
        "Raoul-Wallenberg-Straße": { until: "1992", former: "Bruno-Leuschner-Straße" },
        "Rathausstraße": { until: "1991", former: "Marx-Engels-Forum" },
        "Rheinpfalzallee": { until: "1995", former: "Siegfried-Widera-Straße" },
        "Rheinsteinstraße": { until: "1992", former: "Fritz-Schmenkel-Straße" },
        "Rüdersdorfer Straße": { until: "1991", former: "Babeufstraße" },
        "Schivelbeiner Straße": { until: "1993", former: "Willy-Bredel-Straße" },
        "Schloßbrücke": { until: "1991", former: "Marx-Engels-Brücke" },
        "Schützenstraße": { until: "1991", former: "Reinhold-Huhn-Straße" },
        "Sewanstraße": { until: "1992", former: "Hans-Loch-Straße" },
        "Strelitzer Straße": { until: "1991", former: "Egon-Schultz-Straße" },
        "Taubenstraße": { until: "1991", former: "Johannes-Dieckmann-Straße" },
        "Torstraße": { until: "1994", former: "Wilhelm-Pieck-Straße" },
        "Treskowallee": { until: "1992", former: "Hermann-Duncker-Straße" },
        "Vincent-van-Gogh-Straße": { until: "1992", former: "Erich-Correns-Straße" },
        "Weißenseer Weg": { until: "1992", former: "Ho-Chi-Minh-Straße" },
        "Wilhelmstraße": { until: "1993", former: "Otto-Grotewohl-Straße" },
        "Wuhletalstraße": { until: "1992", former: "Henneckestraße" },
      },
    },
  },
  chapters: [
    {
      id: "intro",
      alignment: "center",
      hidden: false,
      description:
        "<div class=\"chapter-intro\"><div class=\"chapter-intro__content\"><h2 class=\"chapter-intro__title\">Straßenkämpfe</h2><div class=\"chapter-intro__prose\"><p>Straßennamen sind ein lebendiges Archiv der Geschichte und zugleich ein umkämpftes Terrain der Erinnerungspolitik. Berlin ist wohl einer der Spitzenreiter, was Straßenumbenennungen betrifft: Ob nach dem Ende der Kaiserzeit und des Nationalsozialismus, im Sozialismus, nach der Wiedervereinigung oder durch die aktuelle Forderung nach Aufarbeitung der deutschen Kolonialgeschichte – die Bezirke sehen sich immer wieder mit der Frage konfrontiert, wie sie mit problematischen Straßennamen umgehen, welche Neuerungen oder Revisionen sie vornehmen wollen. Die meisten Straßennamen lassen nur wenig von den ideologischen Kämpfen ahnen, die zu ihrer (Um-)Benennung geführt haben. Ein paar dieser Geschichten sind hier zusammengetragen.</p><p>Da bislang kein vollständiges öffentliches Verzeichnis von historischen Straßenumbenennungen in Ost- und Westberlin veröffentlicht wurde, basieren die hier gezeigten Karten auf Datensätzen und Recherchen von Einzelpersonen. Sie stehen exemplarisch für viele weitere Straßengeschichten in ganz Berlin.</p></div></div></div>",
      location: {
        center: BERLIN.center,
        zoom: BERLIN.zoom * 1.2,
        pitch: BERLIN.pitch,
        bearing: BERLIN.bearing,
      },
      mapAnimation: "flyTo",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "post-1990",
      alignment: "left",
      title: "Rückbenennungen nach 1990",
      description:
        '<p>Die Umbenennung großer, repräsentativer Plätze und Verkehrsachsen Ostberlins in den 1990er Jahren und der Abbau von Lenin- und Marx-Denkmälern ist Teil des kollektiven Gedächtnisses: Aus Lenin-Platz wurde Platz der Vereinten Nationen, aus Clara-Zetkin-Straße Dorotheenstraße. Der Marx-Engels-Platz wurde rückbenannt in Schlossplatz und Lustgarten, und viele mehr.</p><p>Mit den fast 70 <a href="https://strassenlaerm.berlin/strassenumbenennungen-nach-1990/" target="_blank" rel="noopener">Straßenrückbenennungen nach der Wiedervereinigung</a> wurden zahlreiche Namen von Persönlichkeiten und politischen Vorbildern der DDR aus dem Straßenbild gelöscht – häufig, um einer konservativen Rückbesinnung auf die Kaiserzeit Platz zu machen.</p><p>Ein Kuriosum in der Karte rechts: Die einzige in der Nachwendezeit umbenannte Straße im Westen Berlins ist der Isenburger Weg in Spandau. Von 1956 bis 1990 hieß sie Ernst-Thälmann-Straße – das Gebiet, in dem sie liegt, war aus Berlin ausgegliedert und gehörte aufgrund einer Vereinbarung der Alliierten zur SBZ, bzw. zur DDR.</p><figure class="chapter-figure chapter-figure--half"><img src="./assets/ClaraZetkin1990.jpg" alt="Clara-Zetkin-Straße, 1990" /><figcaption>Clara-Zetkin-Straße 1990. Foto: Hartmut Reiche, Bundesarchiv</figcaption></figure>',
      location: { center: [13.379, 52.512], zoom: 11.2, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      storyLayers: ["renamedPost1990_AGG_wgs84.geojson"],
      mapLayerHover: {
        layers: ["renamedPost1990_AGG_wgs84.geojson"],
        popupId: "street-rename-post-1990",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "edith-kiss",
      alignment: "left",
      title: "Edith-Kiss-Straße",
      satellite: true,
      description:
        "<p>Ein Anliegen vieler Straßenbenennungen der letzten zwei Jahrzehnte ist es, die Anzahl der nach Frauen benannten Straßen in Berlin zu erhöhen. Viele der neueren Straßennamen erinnern zudem an jüdische Verfolgte des Naziregimes. In diesem Zusammenhang steht auch die Benennung der Edith-Kiss-Straße.</p><p>Die aus Ungarn deportierte Bildhauerin Edith Bán-Kiss arbeitete als Zwangsarbeiterin in einem Außenlager des KZ Ravensbrück, im südlich von Berlin gelegenen Flugzeugmotorenwerk Genshagen der Daimler-Benz Motorengesellschaft. Nach ihr ist seit 2014 eine Planstraße im Neubaugebiet zwischen Ostbahnhof und Warschauer Straße benannt. Doch warum hier, irgendwo im Nirgendwo zwischen Uber-Arena und neuen Bürotürmen? Die Bezirksverordnetenversammlung von Friedrichshain-Kreuzberg reagierte damit auf die Eröffnung der neuen Mercedes-Hauptvertriebszentrale an diesem Standort. Deren offizielle Anschrift lautet nun Mühlenstraße 30, wo sich lediglich die kurze Seite des Gebäudes ohne Eingang befindet.</p><figure class=\"chapter-figure\"><img src=\"./assets/330px-Edith_Kiss_bei_der_Arbeit,_1943.png\" alt=\"Edith Kiss bei der Arbeit, 1943\" /><figcaption>Edith Kiss bei der Arbeit, 1943. Bild: Wikipedia</figcaption></figure>",
      location: { center: [13.43955, 52.50606], zoom: 16.4, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      storyLayers: ["Edith-Kiss-Str_wgs84.geojson"],
      mapCallout: {
        anchors: [
          { lngLat: [13.4393, 52.50632] },
          { lngLat: [13.44344, 52.50606] },
        ],
        offset: [-92, -448],
        lineStyle: "straight",
        lineOrigin: "panel-edge",
        lineColor: "#ffffff",
        lineWidth: 1.75,
        text:
          "Mercedes Vertriebszentrale Deutschland (links) und Mehrzweckhalle mit Vorplatz (rechts), die bis 2024 bzw. 2025 die Namen Mercedes-Benz Arena und Mercedes Platz trugen. Das Bild unten zeigt die 1936 gebaute Montagehalle des Daimler-Benz Flugzeugmotorenwerks in Genshagen.",
        image: "./assets/genshagenWerk.png",
        imageAlt: "Montagehalle Werk Genshagen",
        caption: "Bild: Mercedes Benz",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "hirsch-odf",
      alignment: "left",
      title: "Alice-und-Hella-Hirsch-Ring",
      satellite: true,
      description:
        "<p>Seit 2003 trägt eine Straße in Lichtenberg die Namen der Schwestern Alice und Hella Hirsch. Wie Edith Bán-Kiss musste auch Hella Hirsch als Zwangsarbeiterin in der Rüstungsindustrie arbeiten. Sie war im ACETA-Werk in Rummelsburg tätig, einer Tochtergesellschaft der IG-Farben in der Hauptstraße 13, nur wenige hundert Meter entfernt von der heute nach ihr benannten Straße. Dort wurde sie 1942 aufgrund ihrer Mitgliedschaft in der jüdischen Widerstandsgruppe um Herbert Baum verhaftet. Insgesamt 28 Mitglieder der Gruppe, die meisten von ihnen erst Anfang 20, wurden zum Tode verurteilt und ermordet. Ihre Schwester Alice Hirsch kam im KZ Auschwitz ums Leben.</p><p>Zwischen 2003 und 2010 wurden insgesamt 11 Lichtenberger Straßen nach Verfolgten des Naziregimes benannt. Die Schwestern Hirsch sind hierbei die einzigen, die Teil einer aktiven Widerstandsgruppe waren. Die lange ausbleibende Anerkennung des organisierten jüdischen Widerstands gegen den NS prägten sowohl die DDR- als auch die BRD-Gedenkpolitik. Diese Lücke wirkt bis heute fort.</p><figure class=\"chapter-figure\"><img src=\"./assets/AliceHellaHirsch.png\" alt=\"Alice und Hella Hirsch\" /><figcaption>Alice und Hella Hirsch. Bilder: Gedenkstätte Deutscher Widerstand</figcaption></figure>",
      location: { center: [13.50811, 52.48523], zoom: 13.6, pitch: 20, bearing: 0 },
      cameraFitFile: "OdF_Lichtbrg_AGG_wgs84.geojson",
      layerSequence: [
        {
          delay: 0,
          files: [
            "OdF_Lichtbrg_AGG_wgs84.geojson",
            "AH-Hirsch-Ring_AGG_wgs84.geojson",
          ],
          colors: {
            "AH-Hirsch-Ring_AGG_wgs84.geojson": "#ff4455",
          },
          highlightFiles: {
            "AH-Hirsch-Ring_AGG_wgs84.geojson": true,
          },
          excludeFrom: {
            "OdF_Lichtbrg_AGG_wgs84.geojson": ["Alice-und-Hella-Hirsch-Ring"],
          },
          replace: false,
          fitBounds: false,
        },
      ],
      mapCallout: {
        anchor: [13.49035, 52.492428],
        offset: [132, -168],
        panelPlacement: "toward-right",
        rightInset: 24,
        lineConnector: "horizontal",
        lineStyle: "straight",
        lineColor: "#ffffff",
        lineWidth: 1.75,
        text:
          'Das ACETA-Werk des Chemiekonzerns I.G. Farben beschäftigte ab 1939 hunderte jüdische Zwangsarbeiter*innen. Die letzten von ihnen wurden im Februar 1943 deportiert. Das Werksgebäude existiert noch heute.',
        image: "./assets/AcetaHauptstr13.png",
        imageAlt: "Luftbild des ACETA-Werks an der Hauptstraße 13, 1938",
        caption: "Luftbild 1938, GDI Berlin",
      },
      mapLayerHover: {
        layers: [
          "OdF_Lichtbrg_AGG_wgs84.geojson",
          "AH-Hirsch-Ring_AGG_wgs84.geojson",
        ],
        popupId: "street-rename-odf-lichtenberg",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "antifaschist-lichtenberg",
      alignment: "left",
      title: "Widerstandsgruppen in Straßennamen",
      description:
        "<p>In Lichtenberg tragen besonders viele Straßen die Namen von Personen, die während des Nationalsozialismus im Widerstand aktiv waren – ein zentrales Thema der DDR-Gedenkpolitik. Neben KPD-Mitgliedern sind hier verschiedene Widerstandsnetzwerke abgebildet: Ab den 1970er Jahren wurden Straßen nach Mitgliedern der Schulze-Boysen/Harnack-Gruppe („Rote Kapelle“) benannt, später folgten zahlreiche Straßenumbenennungen nach Mitgliedern der Saefkow- und Uhrig-Gruppen.</p><figure class=\"chapter-figure chapter-figure--pair\"><div class=\"chapter-figure-pair\"><img src=\"./assets/AntonSaefkowPlatz.png\" alt=\"Anton-Saefkow-Platz\" /><img src=\"./assets/BriefmarkeSaefkow.png\" alt=\"Briefmarke zur Erinnerung an die Saefkow-Gruppe\" /></div><figcaption>DDR Gedenkpolitik in Straßennamen und Briefmarkenserien. Bilder: Wikipedia</figcaption></figure>",
      location: { center: [13.492, 52.508], zoom: 12.6, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      mapClusterHover: true,
      storyLayers: ["Wid_NS_Lichtbrg_AGG_wgs84.geojson"],
      hoverGroups: [
        {
          id: "rk",
          files: ["RK_Lichtbrg_AGG_wgs84.geojson"],
          popupHtml:
            "<strong>Straßennamen nach Mitgliedern der Schulze-Boysen / Harnack-Gruppe („Rote Kapelle“)</strong><ul><li>Schulze-Boysen-Straße</li><li>Harnackstraße</li><li>Coppistraße</li><li>Albert-Hößler-Straße</li><li>John-Sieg-Straße</li><li>Wilhelm-Guddorf-Straße</li><li>Ursula-Goetze-Straße</li></ul>",
        },
        {
          id: "saefkow",
          files: ["Saefkow_Lichtbrg_AGG_wgs84.geojson"],
          popupHtml:
            "<strong>Straßennamen nach Mitgliedern der Saefkow-Gruppe</strong><ul><li>Arthur-Weisbrodt-Straße</li><li>Elli-Voigt-Straße</li><li>Judith-Auer-Straße</li><li>Anton-Saefkow-Platz</li><li>Franz-Jacob-Straße</li><li>Paul-Junius-Straße</li><li>Rudolf-Seiffert-Straße</li></ul>",
        },
        {
          id: "uhrig",
          files: ["Uhrig_Lichtbrg_AGG_wgs84.geojson"],
          popupHtml:
            "<strong>Straßennamen nach Mitgliedern der Uhrig-Gruppe</strong><ul><li>Tuchollaplatz</li><li>Elfriede-Tygör-Straße</li><li>Erich-Kurz-Straße</li><li>Franz-Mett-Straße</li><li>Johannes-Zoschke-Straße</li><li>Otto-Schmirgal-Straße</li><li>Paul-Gesche-Straße</li><li>Robert-Uhrig-Straße</li><li>Rudolf-Grosse-Straße</li></ul>",
        },
      ],
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "reinickendorf",
      alignment: "left",
      title: "Unerwünschte Erinnerung",
      description:
        "<p>Ähnlich hätte es auch in Reinickendorf kommen können: direkt nach Kriegsende 1946 sollten hier mindestens acht Straßen in Erinnerung an ermordete Widerstandskämpfer*innen umbenannt werden. Doch die Straßennamen wurden nie amtlich bestätigt und bereits 1948 im Zuge des Kalten Krieges rückgängig gemacht. Die Straßen tragen seither wieder die Namen von Preußischen Generälen, Diplomaten oder lokalen Gutsbesitzern.</p><p>Eine dieser Straßen, nicht weit vom Tegeler Datschengrundstück der Familie Coppi, sollte schon 1945 nach den beiden Widerstandskämpfer*innen in Hans-und-Hilde-Coppi-Allee umbenannt werden. Doch die Mitglieder ihrer Widerstandsgruppe galten in der jungen BRD als kommunistische Landesverräter.</p><figure class=\"chapter-figure chapter-figure--rotate-left\"><div class=\"chapter-figure-rotate\"><img src=\"./assets/HansHildeCoppi.png\" alt=\"Hilde und Hans Coppi\" /></div><figcaption>Hilde und Hans Coppi. Bilder: DHM/LeMO</figcaption></figure>",
      location: { center: [13.302, 52.581], zoom: 13.4, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      storyLayers: ["Wid_NS_Reinickdrf_AGG_wgs84.geojson"],
      mapLayerHover: {
        layers: ["Wid_NS_Reinickdrf_AGG_wgs84.geojson"],
        popupId: "street-rename-reinickendorf-ns",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "coppi-resistance",
      alignment: "left",
      description:
        "<p>Stattdessen gibt es seit 1972 die Lichtenberger <strong>Coppistraße</strong>. Auch in der DDR setzte sich die Anerkennung des Widerstandsnetzwerks der Schulze-Boysen/Harnack-Gruppe („Rote Kapelle“) nur schrittweise durch.</p><p>Auch <strong>Ursula Goetze</strong> war Mitglied dieses Widerstandsnetzwerks. Die junge Studentin nahm an vielen illegalen Aktivitäten teil, so auch an der Klebezettelaktion gegen die Nazi-Propagandaausstellung „Das Sowjetparadies“. Ursula Goetze und mehrere weitere Angehörige der Gruppe wurden wegen dieser Aktion umgebracht.</p><p>Auch Mitglieder der Gruppe Baum, unter ihnen Hella Hirsch, wurden wegen eines Brandanschlags auf dieselbe Ausstellung gefasst und zum Tode verurteilt.</p><figure class=\"chapter-figure chapter-figure--split\"><div class=\"chapter-figure-pair\"><div class=\"chapter-figure-split\"><img src=\"./assets/UrsulaGoetze.png\" alt=\"Ursula Goetze\" /><figcaption>Ursula Goetze 1940. Bild: Gedenkstätte Deutscher Widerstand</figcaption></div><div class=\"chapter-figure-split\"><img src=\"./assets/Klebezettel.jpg\" alt=\"Klebezettel der Roten Kapelle\" /><figcaption>Klebezettel der „Roten Kapelle“. Wikipedia</figcaption></div></div></figure>",
      location: { center: [13.508, 52.501], zoom: 14.5, pitch: 20, bearing: 0 },
      fitBoundsZoomScale: 0.85,
      fitStoryBounds: true,
      storyLayers: [
        "Coppistr_AGG_wgs84.geojson",
        "UrsulaGoetze_wgs84.geojson",
      ],
      mapLayerHover: {
        layers: [
          "Coppistr_AGG_wgs84.geojson",
          "UrsulaGoetze_wgs84.geojson",
        ],
        popupId: "street-rename-coppi",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "burenviertel",
      alignment: "left",
      title: "ehemaliges Burenviertel, Lichtenberg",
      description:
        "<p>Die 1976 nach Ursula Goetze benannte Straße gehört zu einem eigenen Cluster mit antifaschistischen Straßennamen. Dies sind Umbenennungen aus der DDR-Zeit, mit denen Straßennamen des ehemaligen „Burenviertels“ in Karlshorst aus dem Straßenbild gelöscht wurden. Ursprünglich 22 geplante Straßen im neu besiedelten Karlshorst sollten Anfang des 20. Jh. nach kolonialen Orten, Personen und Ereignissen der afrikanischen Kolonialgebiete benannt werden. Realisiert wurden hiervon nur eine Handvoll, darunter die Waterbergstraße, Warmbader Straße, Bothaallee (später Frankestraße) und die Ohm-Krüger-Straße.</p><p>Die Waterbergstraße wurde wahrscheinlich nach der Schlacht am Ohamakari (kolonialer Name: Waterberg) von 1904 benannt, in deren Nachgang die deutschen sog. „Schutztruppen“ unter Kommandeur von Trotha den Völkermord an den Herero verübten. Die Ohm-Krüger-Straße erinnerte an Paul Kruger, den Präsidenten der Burenrepublik Transvaal, und war liebevoll mit seinem Spitznamen (Onkel/Ohm Krüger) versehen. Die Figur Krugers, ebenso wie die des brutalen Reichskommissars der Kolonie Deutsch-Ostafrika, Carl Peters, wurde in populären NS-Propagandafilmen gefeiert.</p><figure class=\"chapter-figure chapter-figure--pair-caption\"><div class=\"chapter-figure-pair\"><img src=\"./assets/Ohm-Kruger.jpg\" alt=\"Filmposter Ohm Krüger\" /><img src=\"./assets/CarlPeters.jpg\" alt=\"Filmposter Carl Peters\" /></div><figcaption>Filmposter zu kolonialrevisionistischen NS-Propagandafilmen</figcaption></figure>",
      location: { center: [13.536, 52.492], zoom: 15.2, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      storyLayers: ["exBurenviertel_AGG_wgs84.geojson"],
      mapLayerHover: {
        layers: ["exBurenviertel_AGG_wgs84.geojson"],
        popupId: "street-rename-burenviertel",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "wedding-colonial",
      alignment: "left",
      title: "Afrikanisches Viertel, Wedding",
      description:
        "<p>Carl Peters, wegen rassistischer Gewaltexzesse unehrenhaft aus dem Reichsbeamtendienst entlassen, wurde 1937 posthum durch Hitler rehabilitiert. In dem Zuge wurde auch eine Straße im Afrikanischen Viertel im Wedding nach dem Kolonialverbrecher benannt.</p><p>In deren direkter Umgebung befinden sich wiederum 22 Straßen, die nach Figuren und Orten des deutschen Kolonialismus benannt waren oder sind, einige weitere sind über Berlin verteilt. Über Jahrzehnte forderten zivilgesellschaftliche Organisationen deren kritische Kontextualisierung und Umbenennung.</p><figure class=\"chapter-figure\"><img src=\"./assets/PetersNachtigalplatz.png\" alt=\"Petersallee und Nachtigalplatz im Afrikanischen Viertel\" /><figcaption>Mit roter Farbe bespritzte Straßenschilder</figcaption></figure>",
      location: { center: [13.343, 52.552], zoom: 14.2, pitch: 20, bearing: 0 },
      layerSequence: [
        {
          delay: 0,
          files: ["renamedPeters_AGG_wgs84.geojson"],
          replace: false,
          fitBounds: true,
        },
        {
          delay: 8000,
          files: ["Kolonial_Wedding_AGG_wgs84.geojson"],
          replace: true,
          fitBounds: true,
        },
      ],
      mapLayerHover: {
        layers: [
          "renamedPeters_AGG_wgs84.geojson",
          "Kolonial_Wedding_AGG_wgs84.geojson",
        ],
        popupId: "street-rename-afrikanisches-viertel",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "aktuelle-umbenennungen",
      alignment: "left",
      title: "Umbenennungen",
      description:
        "<p>Die Petersallee wurde schließlich 2024 umbenannt. Heute trägt ein Teil der Allee den Namen Anna Mungundas, die 1959 bei Protesten gegen das Apartheid-Regime im heutigen Namibia ums Leben kam. Der andere Teil trägt den Namen Maji-Maji-Allee, in Erinnerung an den Aufstand lokaler Bevölkerungsgruppen im Gebiet Deutsch-Ostafrikas (im heutigen Tansania) gegen die deutsche Kolonialherrschaft.</p><p>Der ehemalige Nachtigalplatz – der an den offiziellen Begründer der Kolonie Deutsch-Südwestafrika erinnerte – heißt nun Manga-Bell-Platz. Er ist nach dem Königspaar der Duala benannt, die Widerstand gegen das deutsche Kolonialregime im heutigen Kamerun leisteten. Rudolf Duala Manga Bell wurde dafür 1914 hingerichtet.</p><figure class=\"chapter-figure\"><img src=\"./assets/MangaBells1905.jpg\" alt=\"Emily und Rudolf Duala Manga Bell\" /><figcaption>Emily und Rudolf Duala Manga Bell ca. 1905. Bundesarchiv</figcaption></figure><div class=\"chapter-section-spacer\" aria-hidden=\"true\"></div><p>Die frühere Lüderitzstraße – benannt nach dem Unternehmer, aus dessen Handelsstützpunkt die Kolonie Deutsch-Südwestafrika hervorging – heißt seit 2022 Cornelius-Fredericks-Straße. Sie wurde nach einem der Anführer des Nama-Aufstands im heutigen Namibia benannt. Er starb 1907 im deutschen Konzentrationslager Haifischinsel in Lüderitz.</p><figure class=\"chapter-figure chapter-figure--split-crop\"><div class=\"chapter-figure-pair\"><div class=\"chapter-figure-split\"><div class=\"chapter-figure-image\"><img src=\"./assets/500px-Cornelius_Fredericks_Lüderitz_Str.png\" alt=\"Cornelius-Fredericks-Straße im Afrikanischen Viertel\" /></div><figcaption>Straßenumbenennung im Afrikanischen Viertel. Foto: Myrmux</figcaption></div><div class=\"chapter-figure-split\"><div class=\"chapter-figure-image chapter-figure-image--crop\"><img src=\"./assets/sharkIsland.png\" alt=\"Die Haifischinsel in der Lüderitzbucht\" /></div><figcaption>Die Haifischinsel mit dem Lager in der Lüderitzbucht vor 1910. Wikipedia</figcaption></div></div></figure>",
      location: { center: [13.341, 52.554], zoom: 15.5, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      storyLayers: ["DekolonialWedding_AGG_wgs84.geojson"],
      mapLayerHover: {
        layers: ["DekolonialWedding_AGG_wgs84.geojson"],
        popupId: "street-rename-wedding",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "dekolonial-berlin",
      alignment: "center",
      description:
        "<p>In den vergangenen Jahren erfolgte eine Reihe von dekolonialen Straßenumbenennungen, vor allem in den Bezirken Mitte und Friedrichshain-Kreuzberg. Anstelle von Generälen, Beamten oder Kommissaren der deutschen Kolonialgebiete wurden diese Straßen nach Personen des antikolonialen Widerstands und bedeutenden Persönlichkeiten mit afrikanischen oder afrodeutschen Biografien benannt.</p><p>Zugleich werden weitere Schwerpunkte gesetzt: so wird mit der Umbenennung der Kohlfurter in Regina-Jonas-Straße der lange in Vergessenheit geratenen weltweit ersten Rabbinerin gedacht. Mit Freia Eisner (die Tochter Kurt Eisners) wird eine antifaschistische und queere Aktivistin geehrt, und mit der Helmut-Kohl-Allee ein konservativer Alt-Bundeskanzler.</p><p>Die Politiken der Berliner Straßenumbenennungen bleiben divers und kontrovers.</p>",
      location: { center: [13.357, 52.520], zoom: 13, pitch: 20, bearing: 0 },
      fitStoryBounds: true,
      fitBoundsZoomScale: 0.92,
      storyLayers: ["Dokolonial_Berlin_AGG_wgs84.geojson"],
      mapLayerHover: {
        layers: ["Dokolonial_Berlin_AGG_wgs84.geojson"],
        popupId: "street-rename-dekolonial",
      },
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "credits",
      alignment: "center",
      description:
        '<h3>Postskriptum</h3><p>Die hier gezeigten Karten und Listen von Straßenumbenennungen erheben keinerlei Anspruch auf Vollständigkeit, da trotz zahlreicher Nachfragen keine zentral verwaltete Datengrundlage zu dem Thema verfügbar war. Der Hinweis zu dieser <a href="https://download.statistik-berlin-brandenburg.de/91d0dfabc77bc5d4/5e4ed6e0022b/strassenumbenennungen-berlin.pdf" target="_blank" rel="noopener">Straßenbenennungsdatei</a> erreichte mich erst zum Projektende. Die Liste wurde vom Amt für Statistik Berlin Brandenburg recherchiert und wird halbjährlich aktualisiert. Sie ist jedoch erst ab ca. 1990 vollständig. Zentral geführte Daten zu historischen Straßenbenennungen Ostberlins und früherer Jahrzehnte fehlen nach wie vor.</p><h3>Dank</h3><p>Die Umbenennungen und der aktuelle Wissensstand zur Kolonialgeschichte in Berlins Straßenlandschaft wären ohne die Arbeit von Initiativen wie Berlin Postkolonial e.V., ISD-BUND e.V. und vielen weiteren Aktivist*innen nicht denkbar gewesen.</p><p>Die Arbeit des Vereins Straßenlärm e.V. macht antisemitische, antiziganistische und koloniale Bezüge im Berliner Stadtraum sichtbar.</p><p>Besonderer Dank an Clara Westendorff und Daniel Hadwiger (Museum Reinickendorf), die die Lichtenberger und Reinickendorfer Datensätze zu Straßenumbenennungen erarbeitet und zur Verfügung gestellt haben.</p><p>Ihre Recherchen erfolgten im Kontext der Ausstellungsreihe <a href="https://umbenennen.berlin/" target="_blank" rel="noopener">„umbenennen?!“</a>. Im Verlauf von zwei Jahren zeigen 12 Berliner Bezirksmuseen individuelle Ausstellungen zur Geschichte der Berliner Straßennamen.</p><p class="legal-links"><a href="./quellen.html">Quellen</a><a href="./impressum.html">Impressum</a><a href="./datenschutz.html">Datenschutz</a></p>',
      location: BERLIN,
      onChapterEnter: [],
      onChapterExit: [],
    },
  ],
};
