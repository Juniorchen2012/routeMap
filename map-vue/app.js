new Vue({
  el: "#app",
  data: {
    trackData: [],
    showTrack: true,
    sliderValue: 0,
    map: null,
    trackPolyline: null,
    currentMarker: null,
    dateRange: [],
  },
  methods: {
    processFile(event) {
      const file = event.raw;
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.trackData = this.parseCSV(e.target.result);
          this.displayTrack(this.trackData);
        };
        reader.readAsText(file);
      }
    },
    parseCSV(text) {
      let lines = text.trim().split("\n");
      return lines
        .slice(1)
        .map((line) => {
          let fields = line.split(",").map((field) => field.trim());
          let geoTime = fields[0];
          let latitude = parseFloat(fields[1]);
          let longitude = parseFloat(fields[2]);

          if (!isNaN(latitude) && !isNaN(longitude)) {
            return { geoTime, latitude, longitude };
          }
        })
        .filter((point) => point !== undefined);
    },
    displayTrack(trackData) {
      if (this.trackPolyline) {
        this.trackPolyline.remove();
      }
      const trackPath = trackData.map((point) => [
        parseFloat(point.latitude),
        parseFloat(point.longitude),
      ]);
      this.trackPolyline = L.polyline(trackPath, { color: "red" }).addTo(
        this.map
      );
      this.map.fitBounds(this.trackPolyline.getBounds());
    },
    filterTrackByDate() {
      if (this.dateRange.length === 2) {
        const [startDate, endDate] = this.dateRange;
        const filteredData = this.trackData.filter((point) => {
          const pointDate = new Date(parseInt(point.geoTime));
          return pointDate >= startDate && pointDate <= endDate;
        });
        this.displayTrack(filteredData);
      }
    },
    toggleTrackVisibility() {
      if (this.trackPolyline) {
        if (this.showTrack) {
          this.trackPolyline.addTo(this.map);
        } else {
          this.trackPolyline.remove();
        }
      }
    },
    displayCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latLng = L.latLng(
              position.coords.latitude,
              position.coords.longitude
            );
            if (this.currentMarker) {
              this.currentMarker.setLatLng(latLng);
            } else {
              this.currentMarker = L.circleMarker(latLng, {
                color: "blue",
                radius: 5,
              }).addTo(this.map);
            }
            this.map.setView(latLng, 13);
          },
          () => {
            alert("无法获取您的位置");
          }
        );
      } else {
        alert("浏览器不支持地理定位");
      }
    },
    updateMarkerOnMap() {
      if (
        this.trackData.length > 0 &&
        this.sliderValue < this.trackData.length
      ) {
        const point = this.trackData[this.sliderValue];
        const latLng = L.latLng(
          parseFloat(point.latitude),
          parseFloat(point.longitude)
        );
        if (this.currentMarker) {
          this.currentMarker.setLatLng(latLng);
        } else {
          this.currentMarker = L.circleMarker(latLng, {
            color: "blue",
            radius: 5,
          }).addTo(this.map);
        }
        this.map.setView(latLng, 13);
      }
    },
  },
  mounted() {
    this.map = L.map("map").setView([51.505, -0.09], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);
  },
});
