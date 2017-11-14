var map, dataLayer, infobox, searchManager;
// URL to the data source that powers the locator. 
var dataSourceUrl = 'https://spatial.virtualearth.net/REST/v1/data/515d38d4d4e348d9a61c615f59704174/CoffeeShops/CoffeeShop';
// A setting for specifying the distance units displayed. Possible values are 'km' and 'mi'. 
var distanceUnits = 'km';
function GetMap() {
    // Load the map. 
    map = new Microsoft.Maps.Map('#myMap', {
        zoom: 3
    });
    // Create a layer to load pushpins to. 
    dataLayer = new Microsoft.Maps.Layer();
    // Add a click event to the data layer to display an infobox. 
    Microsoft.Maps.Events.addHandler(dataLayer, 'click', function (e) {
        displayInfobox(e.primitive);
    });
    map.layers.insert(dataLayer);
    // Create a global infobox control. 
    infobox = new Microsoft.Maps.Infobox(new Microsoft.Maps.Location(0, 0), {
        visible: false,
        offset: new Microsoft.Maps.Point(0, 20),
        height: 170,
        width: 230
    });
    infobox.setMap(map);
    // Load the Search, Spatial Data Service and Spatial Math modules.
    Microsoft.Maps.loadModule(['Microsoft.Maps.Search', 'Microsoft.Maps.SpatialDataService', 'Microsoft.Maps.SpatialMath'], function () {
        searchManager = new Microsoft.Maps.Search.SearchManager(map);
    });
    document.getElementById('searchBtn').onclick = performSearch;
    document.getElementById('searchBox').onkeypress = function (e) {
        if (e.which == 13) {
            performSearch();
        }
    };
}
function performSearch() {
    clearMap();
    // Create a request to geocode the users search. 
    var geocodeRequest = {
        where: document.getElementById('searchBox').value,
        count: 1,
        callback: function (r) {
            if (r && r.results &&
                r.results.length > 0 &&
                r.results[0].location) {
                findNearbyLocations(r.results[0].location);
            }
            else {
                showErrorMsg('Unable to geocode query');
            }
        },
        errorCallback: function () {
            showErrorMsg('Unable to geocode query');
        }
    };
    // Geocode the users search. 
    searchManager.geocode(geocodeRequest);
}
// A simple function for displaying error messages in the app. 
function showErrorMsg(msg) {
    document.getElementById('resultsPanel').innerHTML = '<span class="errorMsg">' + msg + '</span>';
}
// A simple function for clearing the map and results panel. 
function clearMap() {
    dataLayer.clear();
    infobox.setOptions({ visible: false });
    document.getElementById('resultsPanel').innerHTML = '';
}
// A function that searches for nearby locations against the data source. 
function findNearbyLocations(location) {
    // Create the query to get the 10 closest stores that are within 20KM of the specified location. 
    var queryOptions = {
        queryUrl: dataSourceUrl,
        spatialFilter: {
            spatialFilterType: 'nearby',
            location: location,
            radius: 20
        },
        top: 10
    };
    //Process the query.
    Microsoft.Maps.SpatialDataService.QueryAPIManager.search(queryOptions, map, function (results) {
        // Create an array to store the coordinates of all the location results. 
        var locs = [];
        // Create an array to store the HTML used to generate the list of results. 
        // By using an array to concatenate strings is much more efficient than using +. 
        var listItems = [];
        //Loop through results and add to map 
        for (var i = 0; i < results.length; i++) {
            results[i].setOptions({
                icon: 'images/red_pin.png',
                text: (i + 1) + ''
            });
            // Add the location of the pushpin to the array of locations 
            locs.push(results[i].getLocation());
            // Create the HTML for a single list item for the result.                         
            listItems.push('<table class="listItem"><tr><td rowspan="3"><span>', (i + 1), '.</span></td>');
            //Get metadata for location
            var metadata = results[i].metadata;
            // Store the result ID as a property of the name. This will allow us to relate the list item to the pushpin on the map. 
            listItems.push('<td><a class="title" href="javascript:void(0);" rel="', metadata.ID, '">', metadata.Name, '</a></td>');
            listItems.push('<td>', convertSdsDistance(metadata.__Distance), ' ', distanceUnits, '</td></tr>');
            listItems.push('<tr><td colspan="2" class="listItem-address">', metadata.AddressLine, '<br/>', metadata.Locality, ', ');
            listItems.push(metadata.AdminDistrict, '<br/>', metadata.PostalCode, '</td></tr>');
            listItems.push('<tr><td colspan="2"><a target="_blank" href="http://bing.com/maps/default.aspx?rtp=~pos.', metadata.Latitude, '_', metadata.Longitude, '_', encodeURIComponent(metadata.Name), '">Directions</a></td></tr>');
            listItems.push('</table>');
        }
        // Add the pushpins to the map. 
        dataLayer.add(results);
        // Use the array of locations from the results to set the map view to show all locations. 
        if (locs.length > 1) {
            map.setView({ bounds: Microsoft.Maps.LocationRect.fromLocations(locs), padding: 80 });
        }
        else {
            map.setView({ center: locs[0], zoom: 15 });
        }
        var resultsPanel = document.getElementById('resultsPanel');
        // Add the list items to the results panel. 
        resultsPanel.innerHTML = listItems.join('');
        // Add a click event to the title of each list item. 
        var resultItems = resultsPanel.getElementsByClassName('title');
        for (var i = 0; i < resultItems.length; i++) {
            resultItems[i].onclick = resultClicked;
        }
    });
}
function resultClicked(e) {
    // Get the ID of the selected location 
    var id = e.target.getAttribute('rel');
    //Loop through all the pins in the data layer and find the pushpin for the location. 
    var pins = dataLayer.getPrimitives();
    for (var i = 0; i < pins.length; i++) {
        var pin = pins[i];
        if (pin.metadata.ID != id) {
            pin = null;
        }
        else {
            break;
        }
    }
    // If a pin is found with a matching ID, then center the map on it and show it's infobox. 
    if (pin) {
        // Offset the centering to account for the infobox. 
        map.setView({ center: pin.getLocation(), zoom: 17 });
        displayInfobox(pin);
    }
}
// Takes a pushpin and generates the content for the infobox from the Metadata and displays the infobox. 
function displayInfobox(pin) {
    var metadata = pin.metadata;
    var desc = ['<table>'];
    desc.push('<tr><td colspan="2">', metadata.AddressLine, ', ', metadata.Locality, ', ');
    desc.push(metadata.AdminDistrict, ', ', metadata.PostalCode, '</td></tr>');
    desc.push('<tr><td><b>Hours:</b></td><td>', formatTime(metadata.Open), ' - ', formatTime(metadata.Close), '</td></tr>');
    desc.push('<tr><td><b>Store Type:</b></td><td>', metadata.StoreType, '</td></tr>');
    desc.push('<tr><td><b>Has Wifi:</b></td><td>', (metadata.IsWiFiHotSpot) ? 'Yes' : 'No', '</td></tr>');
    desc.push('<tr><td colspan="2"><a target="_blank" href="http://bing.com/maps/default.aspx?rtp=~pos.', metadata.Latitude, '_', metadata.Longitude, '_', encodeURIComponent(metadata.Name), '">Directions</a></td></tr>');
    desc.push('</table>');
    infobox.setOptions({ visible: true, location: pin.getLocation(), title: metadata.Name, description: desc.join('') });
}
// Formats a time in 1000 hours to hh:mm AM/PM format 
function formatTime(val) {
    var minutes = val % 100;
    var hours = Math.round(val / 100);
    if (minutes == 0) {
        minutes = '00';
    }
    if (hours > 12) {
        return (hours - 12) + ':' + minutes + 'PM';
    }
    else {
        return hours + ':' + minutes + 'AM';
    }
}
function convertSdsDistance(distance) {
    var toUnits;
    switch (distanceUnits.toLowerCase()) {
        case 'mi':
        case 'miles':
            toUnits = Microsoft.Maps.SpatialMath.DistanceUnits.Miles;
            break;
        case 'km':
        case 'kilometers':
        default:
            toUnits = Microsoft.Maps.SpatialMath.DistanceUnits.Kilometers;
            break;
    }
    //Convert distance to disired units.
    var d = Microsoft.Maps.SpatialMath.convertDistance(distance, Microsoft.Maps.SpatialMath.DistanceUnits.Kilometers, toUnits);
    //Round to to 2 decimal places.
    d = Math.round(d * 100) / 100;
    return d;
}
//# sourceMappingURL=Locator.js.map