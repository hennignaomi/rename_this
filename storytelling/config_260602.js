var config = {
  style: {
    version: 8,
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      carto: {
        type: "raster",
        tiles: ["https://tiles.stadiamaps.com/tiles/stamen_terrain_lines/{z}/{x}/{y}{r}.{ext}"],
        tileSize: 256,
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: { "background-color": "#ffffff" },
      },
      {
        id: "carto",
        type: "raster",
        source: "carto",
        paint: { "raster-opacity": 0.88 },
      },
    ],
  },
  showMarkers: false,
  inset: false,
  theme: "dark",
  use3dTerrain: false,
  auto: false,
  title: "Berlins DNA in Straßennamen",
  byline: "",
  footer: "",
  chapters: [
    {
      id: "intro",
      alignment: "center",
      fitToStreetBounds: false,
      hidden: false,
      description: "",
      location: {
        center: [13.398058, 52.520545],
        zoom: 10.5,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "dna-der-stadt",
      alignment: "center",
      fitToStreetBounds: false,
      hidden: false,
      description:
        "Straßennamen beschreiben nicht nur die Orte um uns herum, sondern bilden auch die kollektive DNA einer Stadt. Das gilt besonders in Berlin. Hier ist die deutsche Geschichte auf einzigartige Weise verdichtet: Preußische Königsstraßen, kaiserliche Triumphachsen, nationalsozialistische Umbenennungen, DDR-Prachtboulevards und Spuren des Kolonialismus überlagern sich und zeichnen ein vielschichtiges, oft widersprüchliches Bild. Wer genau hinsieht, kann an ihnen politische Brüche und gesellschaftliche Debatten ablesen.",
      location: {
        center: [13.398058, 52.520545],
        zoom: 10.5,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "adlergestell",
      alignment: "left",
      fitToStreetBounds: false,
      hidden: false,
      title: "Adlergestell",
      // image: './assets/adlergestell.jpg',
      description:
        "Im Berliner Straßenregister ist das <b>Adlergestell</b> mit rund <b>13,3 Kilometern</b> die längste zusammenhängend erfasste Straße. Sie verläuft durch <b>Treptow-Köpenick</b> und macht sichtbar, wie weit sich Berlin im Südosten ausdehnt. In den verknüpften Berliner Adressdaten hängen <b>212 Adressen</b> an dieser Straße; das entspricht <b>Rang 85</b> unter den Straßen der Stadt.",
      location: {
        center: [13.604511, 52.402091],
        zoom: 11.38,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "adlergestell",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "adlergestell",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "kuerzeste-strasse",
      alignment: "center",
      hidden: false,
      title: "Die kürzeste Straße",
      description:
        "Ein Berliner Kuriosum liegt im Nikolaiviertel: Die <b>Eiergasse</b> gilt mit nur rund <b>16 Metern</b> als kürzeste Straße der Stadt. Sie verbindet den Nikolaikirchplatz mit dem Mühlendamm und dient heute vor allem als schmale Passage mit Gastronomie-Außenflächen.",
      location: {
        center: [13.408438, 52.516738],
        zoom: 17,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "all-streets-context-thin",
          opacity: 0.34,
          duration: 900,
        },
        {
          layer: "eiergasse",
          opacity: 1,
          duration: 5000,
        },
        {
          layer: "satellite-imagery",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "all-streets-context-thin",
          opacity: 0,
          duration: 600,
        },
        {
          layer: "eiergasse",
          opacity: 0,
          duration: 5000,
        },
        {
          layer: "satellite-imagery",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "sonnenallee",
      alignment: "right",
      fitToStreetBounds: false,
      hidden: false,
      title: "Sonnenallee",
      // image: './assets/sonnenallee.jpg',
      description:
        "Die <b>Sonnenallee</b> in Neukölln zählt zu den bekanntesten Straßen Berlins – nicht nur wegen des Films, der den Straßennamen im Titel trägt. Auf knapp fünf Kilometern bündelt sie eine ungewöhnliche Dichte an Berliner Geschichte: das schnelle Wachstum der Mietskasernenstadt um 1900, die ideologische Umbenennung im Nationalsozialismus, die Teilung der Stadt durch die Mauer und die Veränderungen der Nachwendezeit.",
      location: {
        center: [13.459518, 52.471513],
        zoom: 12.81,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "sonnenallee",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "sonnenallee",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "karl-marx-allee",
      alignment: "left",
      fitToStreetBounds: false,
      hidden: false,
      title: "Karl-Marx-Allee",
      // image: './assets/karl-marx-allee.jpg',
      description:
        'Die <b>Karl-Marx-Allee</b> beginnt als Inszenierung. 1949 als „Stalinallee“ angelegt, sollte sie die Macht und Überlegenheit des Sozialismus sichtbar machen – in überdimensionierten Achsen und palastartigen Wohnbauten. Doch schon wenige Jahre später kippt die sozialistische Erzählung: Am 17. Juni 1953 wird sie zum Schauplatz des Protests: Bauarbeiter legten die Arbeit nieder, und aus dem Vorzeigeboulevard wurde der Ausgangspunkt des Aufstands, der wenig später von sowjetischen Truppen und DDR-Sicherheitsorganen gewaltsam niedergeschlagen wurde.',
      location: {
        center: [13.435502, 52.516799],
        zoom: 13.44,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "karl-marx-allee",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "karl-marx-allee",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "kietz",
      alignment: "right",
      hidden: false,
      title: "Kiez",
      description:
        "Berlin ist ein Millionendorf – und trägt die Dörfer noch in sich. Historisch hieß es <b>Kietz</b>: So wurden slawische Siedlungen am Rand mittelalterlicher Städte bezeichnet, die schon vor der brandenburgischen Expansion bestanden. Im Berliner Alltagsdeutsch wurde daraus später <b>Kiez</b> – nicht mehr als eigener Siedlungstyp, sondern als Wort für das vertraute Wohnviertel. Im Berliner Straßenregister taucht <b>Kietz/Kiez</b> heute noch in <b>10</b> Straßennamen auf. Hier reicht ein einziges Beispiel: <b>Möckernkiez</b>.",
      location: {
        center: [13.378016, 52.493111],
        zoom: 16.1,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "satellite-imagery",
          opacity: 1,
          duration: 5000,
        },
        {
          layer: "moeckernkiez",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "satellite-imagery",
          opacity: 0,
          duration: 5000,
        },
        {
          layer: "moeckernkiez",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "geister-strassen",
      alignment: "center",
      fitToStreetBounds: false,
      hidden: false,
      title: '"Geisterhafte" Straßennamen',
      description:
        "Auch Berlin kennt Straßen, die auf keinem Briefumschlag landen. Manchmal sind es Wege, die nur der Infrastruktur dienen – Zufahrten, Brücken, Tunnel. Manchmal sind es Relikte der Teilung: Straßen, die in West- und Ostberlin doppelt existierten und nach der Wende zwischen den Verwaltungen verschwanden. Irgendwie schade, dass sie nie das Privileg haben, auf einem Briefumschlag zu stehen. Ein gutes Beispiel ist der <b>Tunnel Tiergarten Spreebogen</b>.",
      location: {
        center: [13.375556, 52.513825],
        zoom: 12.73,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "geister-strassen",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "geister-strassen",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "anton-wilhelm-amo-strasse",
      alignment: "right",
      fitToStreetBounds: false,
      hidden: false,
      title: "Anton-Wilhelm-Amo-Straße",
      // image: './assets/anton-wilhelm-amo.jpg',
      description:
        "Berlin verhandelt seine Kolonialgeschichte auch im Straßenbild. Besonders im <b>Afrikanischen Viertel</b> tragen viele Namen bis heute die Spuren deutscher Kolonialherrschaft. Seit Jahren stehen sie im Zentrum politischer Auseinandersetzungen. Die <b>Anton-Wilhelm-Amo-Straße</b> liegt allerdings nicht dort, sondern in <b>Mitte</b>: Mit der Umbenennung der <b>Mohrenstraße</b> wurde auch hier ein sichtbares Zeichen gesetzt, weg von kolonialen Zuschreibungen hin zu einer positiven Form von Erinnerung.",
      location: {
        center: [13.389372, 52.511953],
        zoom: 14.99,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "anton-wilhelm-amo-strasse",
          opacity: 1,
          duration: 5000,
        },
        {
          layer: "afrikanisches-viertel",
          opacity: 1,
          duration: 5000,
        },
      ],
      onChapterExit: [
        {
          layer: "anton-wilhelm-amo-strasse",
          opacity: 0,
          duration: 5000,
        },
        {
          layer: "afrikanisches-viertel",
          opacity: 0,
          duration: 5000,
        },
      ],
    },
    {
      id: "frauen",
      alignment: "center",
      hidden: false,
      title: "",
      description:
        "Ein aktuelles Thema ist auch die deutliche Unterrepräsentation von Frauen bei Straßennamen. Von den rund 14.000 Straßennamen Berlins tragen weniger als zehn Prozent weibliche Vornamen. Auf der Karte sind nach männlichen Vornamen benannte Straßen hell, nach weiblichen rot markiert. Neuere Benennungen versuchen, dieses Ungleichgewicht langsam zu korrigieren – auch in Berlin gibt es entsprechende Initiativen und Vorgaben für Neubenennungen.",
      location: {
        center: [13.405, 52.52],
        zoom: 10.5,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [
        {
          layer: "male-streets",
          opacity: 0.24,
          duration: 1200,
        },
        {
          layer: "female-streets",
          opacity: 0.92,
          duration: 1200,
        },
      ],
      onChapterExit: [
        {
          layer: "male-streets",
          opacity: 0,
          duration: 500,
        },
        {
          layer: "female-streets",
          opacity: 0,
          duration: 500,
        },
      ],
    },
    {
      id: "ende",
      alignment: "center",
      fitToStreetBounds: false,
      hidden: false,
      title: "",
      description:
        "Wer durch die Straßen Berlins geht, bewegt sich nicht nur durch die Stadt, sondern zugleich durch die Schichten ihrer Vergangenheit. Die Straßennamen tragen Spuren ihrer Entstehung, erzählen von Konflikten und politischen Umbrüchen. Einige Namen erschließen sich direkt, andere geben ihre Geschichte erst auf den zweiten Blick preis. Aber eines steht fest: Ihre Bedeutung ist nie festgeschrieben. Sie verändert sich mit dem Lauf der Zeit – und damit unser Blick auf die Geschichte.",
      location: {
        center: [13.398058, 52.520545],
        zoom: 10.5,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [],
      onChapterExit: [],
    },
    {
      id: "credits",
      alignment: "center",
      fitToStreetBounds: false,
      hidden: false,
      title: "",
      description:
        'Datenquelle: <a href="https://daten.berlin.de/datensaetze/stra%C3%9Fenabschnitte-berlin" target="_blank">Straßenabschnitte RBS Berlin</a> (Amt für Statistik Berlin-Brandenburg, CC-BY-3.0)<br><br>Created using <a href="https://maplibre.org/maplibre-gl-js/docs/" target="_blank">MapLibre GL JS</a> + <a href="https://github.com/russellsamora/scrollama" target="_blank">Scrollama</a>.',
      location: {
        center: [13.398058, 52.520545],
        zoom: 10.5,
        pitch: 20,
        bearing: 0,
      },
      mapAnimation: "flyTo",
      rotateAnimation: false,
      callback: "",
      onChapterEnter: [],
      onChapterExit: [],
    },
  ],
};
