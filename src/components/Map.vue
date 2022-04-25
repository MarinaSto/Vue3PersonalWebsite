<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-kmz/dist/leaflet-kmz";
import "leaflet-gpx/gpx";
import { mapboxAccessKey } from "../mapbox";
//import gpxVal from '../../public/tres.gpx'
export default {
  name: "Map",
  data() {
    return {
      mapDiv: "",
      center: [40, 0],
      currentObjectURLs: [],
      showGPXStats: false,
      gpxStats: [],
      imageUrl: "../logo.png",
      gpxUrl: "/tres.gpx",
    };
  },
  methods: {
    // Create the initial Leaflet map
    setupLeafletMap: function () {
      this.mapDiv = L.map("map", {
        center: [46.296196, 11.164263],
        zoom: 13,
      });
      // .locate({setView: true})
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/streets-v11",
          tileSize: 512,
          zoomOffset: -1,
          accessToken:
            "sk.eyJ1IjoidmFsZXJpb21hIiwiYSI6ImNsMXY0cW93ZTA1Mzkza3IxYjJ5ejFpejYifQ.XYmSJ8M8UdSNWuJZjHNZ0w",
        }
      ).addTo(this.mapDiv);
      var logoIcon = L.icon({
        iconUrl: this.imageUrl,
        iconSize: [50, 50], // size of the icon
      });
      L.marker([46.296196, 11.164263], { icon: logoIcon }).addTo(this.mapDiv);
      fetch('../../public/tres.gpx')
  .then(response => {
    console.log('----------------------',response)
this.showGPXStats = true;
          // Parse GPX files
           let objectURL = URL.createObjectURL(response.gpx);
          new L.GPX(objectURL, { async: true })
            .on("loaded", (e) => {
              let el = e.target;
              let stats = this.gpxStats;
              map.fitBounds(el.getBounds());
              // Grab the total distance
              let distance = el.get_distance_imp();
              stats.push({
                type: "Total Distance",
                value: distance,
                unit: "miles",
              });
              // Grab the avg speed
              let movingSpeed = el.get_moving_speed_imp();
              stats.push({
                type: "Average Moving Speed",
                value: movingSpeed,
                unit: "mph",
              });
              // Grab the max speed
              let elevLoss = el.get_elevation_loss_imp();
              stats.push({
                type: "Elevation Loss",
                value: elevLoss,
                unit: "ft",
              });
              // Grab the elevation gain
              let elevGain = el.get_elevation_gain_imp();
              stats.push({
                type: "Elevation Gain",
                value: elevGain,
                unit: "ft",
              });
            })

  })
  .then(data => {
  	// Do something with your data
  	console.log(data);
  });
    },
    parseFile: function (el) {
      // Check to see if there are any Object URLs to revoke
      if (this.currentObjectURLs.length > 0) {
        for (const url of this.currentObjectURLs) {
          URL.revokeObjectURL(url);
        }
        this.currentObjectURLs = []; // reset the objectURLs array since we are only handling one file at the moment
        this.gpxStats = []; // reset the GPX stats array since we are only accounting for one track right now
      }
      // Set some variables for use later
      const fileList = el.files;
      let map = this.mapDiv;
      for (const file of fileList) {
        let objectURL = URL.createObjectURL(file);
        console.log(objectURL, file, this.gpxUrl);
        this.currentObjectURLs.push(objectURL);
        if (file.type === "application/gpx+xml") {
          // Show GPX Stats
          this.showGPXStats = true;
          // Parse GPX files
          new L.GPX(objectURL, { async: true })
            .on("loaded", (e) => {
              let el = e.target;
              let stats = this.gpxStats;
              map.fitBounds(el.getBounds());
              // Grab the total distance
              let distance = el.get_distance_imp();
              stats.push({
                type: "Total Distance",
                value: distance,
                unit: "miles",
              });
              // Grab the avg speed
              let movingSpeed = el.get_moving_speed_imp();
              stats.push({
                type: "Average Moving Speed",
                value: movingSpeed,
                unit: "mph",
              });
              // Grab the max speed
              let elevLoss = el.get_elevation_loss_imp();
              stats.push({
                type: "Elevation Loss",
                value: elevLoss,
                unit: "ft",
              });
              // Grab the elevation gain
              let elevGain = el.get_elevation_gain_imp();
              stats.push({
                type: "Elevation Gain",
                value: elevGain,
                unit: "ft",
              });
            })
            .addTo(map);
        } else {
          // Don't show GPX stats
          this.showGPXStats = false;
          // Parse KML and KMZ files
          let kmz = L.kmzLayer().addTo(map);
          let control = L.control
            .layers(null, null, { collapsed: false })
            .addTo(map);
          kmz.on("load", (e) => {
            control.addOverlay(e.layer, e.name);
          });
          kmz.load(objectURL);
        }
      }
    },
  },
  mounted() {
    this.setupLeafletMap();
  },
};
</script>
<template>
  <main>
    <form enctype="multipart/form-data" novalidate>
      <label for="upload"
        >Upload Your Map
        <input
          id="upload"
          type="file"
          multiple
          accept=".kmz, .kml, .gpx"
          @change="parseFile($event.target)"
      /></label>
    </form>
    <div id="map"></div>
    <section class="gpxStats" v-show="showGPXStats">
      <header>
        <h2>Track Stats</h2>
      </header>
      <div class="content">
        <ul>
          <li v-for="stat in gpxStats">
            <span class="stat-type">{{ stat.type }}</span
            >: {{ stat.value }} {{ stat.unit }}
          </li>
        </ul>
      </div>
    </section>
  </main>
</template>
<style scoped>
#map {
  block-size: clamp(10rem, 50vh, 60rem);
}
label {
  display: inline-flex;
  flex-direction: column;
  gap: 1rem;
}
.gpxStats {
  margin-block-start: 3rem;
}
.stat-type {
  font-weight: bold;
}
</style>
