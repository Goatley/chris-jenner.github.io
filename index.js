
// *********************
// Put these two lines at the very top of you 'index.js' file (or whatever you'd like to name it).
// This is where we'll import the external data and store them into variables for this file
//***********************************
import fisheries_point from './data/fisheries_point.js';
import fisheries_polyline from './data/fisheries_polyline.js';
import tackle_points from './data/tackle_points.js';

let checkboxStates = [];

/*SECTION FOR DETERMINING AND UPDATING MOBILE STYLES UP TOP*/
var wwidth = window.matchMedia('(max-width: 768px)');

if (wwidth.matches) {
  document.querySelector('.filterContainer').classList.add('mobile');
  document.querySelector('.filterBtnCont').classList.add('mobile');
  document.querySelectorAll('.selectBox').forEach(ele => ele.classList.add('mobile'));
}

var map = L.map('map', {
  center: [51.396145, -2.5015016],
  zoom: 11,
  zoomControl: false,
  gestureHandling: true
});

var basemap = L.tileLayer('https://api.maptiler.com/maps/uk-openzoomstack-light/{z}/{x}/{y}.png?key=JRDKWZ623VwZMdOklau8', {
  tileSize: 512,
  zoomOffset: -1,
  minZoom: 8,
  attribution: "\u003ca href=\"https://www.maptiler.com/copyright/\" target=\"_blank\"\u003e\u0026copy; MapTiler\u003c/a\u003e, Contains OS data \u00a9 Crown copyright and database right 2021",
  crossOrigin: true
}).addTo(map);

const search = new GeoSearch.GeoSearchControl({
  provider: new GeoSearch.OpenStreetMapProvider(),
  animateZoom: true,
  searchLabel: 'Search by location',
  updateMap: true,
  style: 'bar',
  autoClose: true,
    position: 'topleft'
});
map.addControl(search);

L.control.zoom({
  position: 'topright'
}).addTo(map);

var shopicon = L.icon({
  iconUrl: 'images/tackleshop_50px.png',
  iconSize: [40, 49],
  iconAnchor: [20,20],
  popupAnchor: [3,-20]
  });

var lakeicon = L.icon({
  iconUrl: 'images/fisheries_50px.png',
  iconSize: [40, 49],
  iconAnchor: [20,20],
  popupAnchor: [3,-20]
  });

var clubicon = L.icon({
  iconUrl: 'images/clubs_50px.png',
  iconSize: [40, 49],
  iconAnchor: [20,20],
  popupAnchor: [3,-20]
  });

var coachicon = L.icon({
  iconUrl: 'images/coaching_50px.png',
  iconSize: [40, 49],
  iconAnchor: [20,20],
  popupAnchor: [3,-20]
  });

var holidayicon = L.icon({
  iconUrl: 'images/holiday_50px.png',
  iconSize: [40, 49],
  iconAnchor: [20,20],
  popupAnchor: [3,-20]
  });

  const tackle = L.geoJSON(null, {
    pointToLayer: function(geoJsonPoint, latlng) {
      return L.marker(latlng, {icon: shopicon});
       },
    }).bindPopup(function(layer) {
    let cap_name = layer.feature.properties.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
    return `<p>${cap_name}</p><a href="https://${layer.feature.properties.shop_url}" target="_blank">View<a>`;
  }).addTo(map);

const lakes = L.geoJSON(null, {
  pointToLayer: function(geoJsonPoint, latlng) {
    return L.marker(latlng, {icon: lakeicon});
     },
  style: function(feature) {
    return {
      color: feature.properties.color
    };
  },
  filter: (feature) => {
    if (checkboxStates.length == 0) return true;
    return checkboxStates.every(function(element) {
      return feature.properties[element.name];
    });
  }
}).bindPopup(function(layer) {
  let cap_name = layer.feature.properties.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return `<p>${cap_name}</p><a href="https://${layer.feature.properties.tfi_url}" target="_blank">View<a>`;
}).addTo(map);

const rivers = L.geoJSON(null, {
  pointToLayer: function(geoJsonPoint, latlng) {
    return L.marker(latlng, {icon: lakeicon});
     },
  filter: (feature) => {
    if (checkboxStates.length == 0) return true;
    return checkboxStates.every(function(element) {
      return feature.properties[element.name];
    });
  },
}).bindPopup(function(layer) {
	let cap_name = layer.feature.properties.name.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
  return `<p>${cap_name}</p><a href="https://${layer.feature.properties.tfi_url}" target="_blank">View<a>`;
}).addTo(map);

function updateCheckboxStates() {
  //first reset your object that holds the input checked states
  checkboxStates = [];
  for (let input of document.querySelectorAll('input')) {
    if (input.checked) {
      let inputState = {}
      inputState.name = input.name;
      inputState.checked = input.checked;
      checkboxStates.push(inputState)
    }
  }
}

// for (let input of document.querySelectorAll('input')) {
//   //Listen to 'change' event of all inputs
//   input.onchange = (e) => {
//     lakes.clearLayers();
//     rivers.clearLayers();
//     updateCheckboxStates();
//     lakes.addData(fisheries_point);
//     rivers.addData(fisheries_polyline);
//   }
// }

//this is the filtering logic - whenever you click 'filter', it reads over all chekced boxes and removes then re-adds the newly filtered data to the screen
document.querySelector('.filterBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    lakes.clearLayers();
    rivers.clearLayers();
    tackle.clearLayers();
    updateCheckboxStates();
    lakes.addData(fisheries_point);
    rivers.addData(fisheries_polyline);
    tackle.addData(tackle_points);
})

//NOW setup the filter checkboxes and their states
//these variables hold the state of whether they're expanded or not
//first is species, then facilities, then tickets.  To add more filters, just add more 'false's
const checkState = [false, false, false];

//now variables to hold the expanding objects
//this first piece is the 'drop down menu'
var checkBoxes = document.querySelectorAll('.inputContainer');
//this second piece is for all of the buttons themselves for filtering
var selects = document.querySelectorAll('.selectBox');

//this function actually expands/unshows the drop down boxes with the checkbox options beneath each filtering button
function showCheckboxes(idx) {
    if (checkState[idx]) {
        checkBoxes[idx].style.display = "none";
        checkState[idx] = false;
        selects[idx].style.zIndex = 'auto'
    } else {
        hideCheckBoxes();
        checkBoxes[idx].style.display = "flex";
        checkState[idx] = true;
        selects[idx].style.zIndex = 1001;
    }
}

function hideCheckBoxes() {
  checkBoxes.forEach((ele, idx) => {
    ele.style.display = 'none';
    selects[idx].style.zIndex = 'auto';
  });
  checkState.fill(false);

}

//add event handlers for clicking on the filtering buttons (the individual checkbox)
document.querySelectorAll('.overSelect').forEach((box, idx) => {
  box.addEventListener('click', (e) => {
    showCheckboxes(idx);
    e.stopPropagation();
  })
});

//stop propogation of clicks on the checkbox menu - this own't have it randomly close when clicking around
document.querySelectorAll('.inputContainer').forEach(ele => {
  ele.addEventListener('click', (e) => e.stopPropagation())
});

//close the menu if you click anywhere on the menu
document.querySelector('.filterContainer').addEventListener('click', () => {
  if (checkState.includes(true)) {
    hideCheckBoxes();
  }
})

search.getContainer().onclick = e => { e.stopPropagation(); };


/****** INITT ******/
updateCheckboxStates()
lakes.addData(fisheries_point);
rivers.addData(fisheries_polyline);
tackle.addData(tackle_points);

var fsControl = L.control.fullscreen();
map.addControl(fsControl);

map.on('enterFullscreen', function(){
  if(window.console) window.console.log('enterFullscreen');
});
map.on('exitFullscreen', function(){
  if(window.console) window.console.log('exitFullscreen');
});

function onLocationFound(e) {
    var radius = e.accuracy / 4;

    L.circle(e.latlng, radius).addTo(map);
    }

    function onLocationError(e) {
      alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    map.locate({setView: true, maxZoom: 12, timeout: 10000});
