<script lang="ts">
import { defineComponent } from "vue";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import "leaflet-gpx/gpx";
import "leaflet-kmz/dist/leaflet-kmz";

interface gpxData {
  type: string;
  value: number;
  unit: string;
}
// import { mapboxAccessKey } from "../mapbox";
export default defineComponent({
  name: "MapLeaflet",
  props: {
    urlGpx: {},
    episodeImage: {},
  },
  data() {
    return {
      mapDiv: null as L.Map | null,
      center: [40, 0],
      showGPXStats: false,
      gpxStats: [] as gpxData[],
      imageUrl: "../logo.png", //TODO: to be used in the map
    };
  },
  methods: {
    // Create the initial Leaflet map
    setupLeafletMap: function () {
      const map = L.map("map", {
        center: [46.296196, 11.164263],
        zoom: 13,
      });
      L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          accessToken:
            "sk.eyJ1IjoidmFsZXJpb21hIiwiYSI6ImNsMXY0cW93ZTA1Mzkza3IxYjJ5ejFpejYifQ.XYmSJ8M8UdSNWuJZjHNZ0w",
        }
      ).addTo(map);

      var theIcon = L.divIcon({
        html: "<div style='background-color:#ef7305;' class='marker-pin'></div><img class='circular--square' src='http://drive.google.com/uc?export=view&id=1q1P-SVwIvTLJXufzUuejGnbovwnnbbrg' />",
        iconSize: [113, 113],
        iconAnchor: [96, 104], // bottom center is the anchor point
        popupAnchor: [60, 70],
      });

      L.marker([46.296196, 11.164263], {
        icon: theIcon,
        riseOnHover: true,
        draggable: false,
        autoPan: true,
      })
        .addTo(map)
        .bindTooltip(
          `<img height="150" src="${this.episodeImage}"><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</p>`
        )
        .openTooltip();

      this.mapDiv = map;
      this.loadMap();
    },
    loadMap: function () {
      let map = this.mapDiv;
      // Show GPX Stats
      this.showGPXStats = true;
      // Parse GPX files
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new L.GPX(this.urlGpx, {
        async: true,
        polyline_options: {
          color: "#26A69A",
        },
        marker_options: {
          startIconUrl: "/pin-icon-start.png",
          endIconUrl: "/pin-icon-start.png",
          shadowUrl: "/pin-icon-start.png",
        },
      })
        .on("loaded", (e: L.LeafletEvent) => {
          let el = e.target;
          let stats = this.gpxStats;
          map?.fitBounds(el.getBounds());

          // Grab the total distance
          let distance = el.get_distance_imp();
          stats.push({
            type: "Total Distance",
            value: distance,
            unit: "kilometers",
          });
          // Grab the avg speed
          let movingSpeed = el.get_moving_speed_imp();
          stats.push({
            type: "Average Moving Speed",
            value: movingSpeed,
            unit: "kph",
          });
          // Grab the max speed
          let elevLoss = el.get_elevation_loss_imp();
          stats.push({
            type: "Elevation Loss",
            value: elevLoss,
            unit: "m",
          });
          // Grab the elevation gain
          let elevGain = el.get_elevation_gain_imp();
          stats.push({
            type: "Elevation Gain",
            value: elevGain,
            unit: "m",
          });

          var info =
            "Name: Amicinbici</br>" +
            "Distance: " +
            distance +
            " km </br>" +
            "Elevation Gain: " +
            movingSpeed +
            " m </br>" +
            "Lat:" +
            elevGain +
            "</br>" +
            "Lon:" +
            elevGain +
            "</br>";
          // register popup on click
          el.getLayers()[0].bindPopup(info);
        })
        .addTo(map);
    },
  },
  mounted() {
    this.setupLeafletMap();
  },
});
</script>
<template>
  <main>
    <div id="map"></div>
  </main>
</template>
<style scoped>
#map {
  block-size: clamp(10rem, 50vh, 60rem);
}
.gpxStats {
  margin-block-start: 3rem;
}
.stat-type {
  font-weight: bold;
}

div :deep(.marker-pin) {
  width: 60px;
  height: 60px;
  border-radius: 50% 50% 50% 0;
  background: linear-gradient(
    166deg,
    rgba(239, 46, 5, 1) 0%,
    rgba(239, 115, 5, 1) 42%,
    rgba(239, 116, 8, 1) 88%,
    rgba(236, 141, 58, 1) 100%
  );
  position: absolute;
  transform: rotate(-45deg);
  right: -10px;
  bottom: 18px;
  margin: -15px 0 0 -15px;
}

div :deep(.marker-pin::after) {
  content: "";
  width: 50px;
  height: 50px;
  margin: 5px 0 0 5px;
  background: transparent;
  position: absolute;
  border-radius: 50%;
}

div:deep(.circular--square) {
  position: absolute;
  border-radius: 50%;
  width: 50px;
  left: 68px;
  top: 40px;
}
div:deep(.leaflet-marker-icon) {
  background: transparent !important;
  border: none !important;
}
</style>
