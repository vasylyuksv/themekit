var json = [
      {
        "title" : "Store A",
        "animal" : "fish",
        "drink" : "coca",
        "name" : "paul",
        "geometry": {
          "type": "Point",
          "coordinates": [
            0.48339843749999994,
            46.89023157359399
          ]
        }
      },
      {
        "title" : "Store B",
        "animal" : "fish",
        "drink" : "fanta",
        "name" : "sandrine",
        "geometry": {
          "type": "Point",
          "coordinates": [
            2.7685546874999996,
            47.76148371616669
          ]
        }
      },
      {
        "title" : "Store C",
        "animal" : "fish",
        "drink" : "coca",
        "name" : "paul",
        "geometry": {
          "type": "Point",
          "coordinates": [
            2.57080078125,
            45.882360730184025
          ]
        }
      },
      {
        "title" : "Store D",
        "animal" : "cat",
        "drink" : "fanta",
        "name" : "sandrine",
        "geometry": {
          "type": "Point",
          "coordinates": [
            -0.098876953125,
            44.52001001133986
          ]
        }
      },
      {
        "title" : "Store E",
        "animal" : "cat",
        "drink" : "coca",
        "name" : "lea",
        "geometry": {
          "type": "Point",
          "coordinates": [
            4.54833984375,
            45.874712248904764
          ]
        }
      },
      {
        "title" : "Store F",
        "animal" : "dog",
        "drink" : "fanta",
        "name" : "lea",
        "geometry": {
          "type": "Point",
          "coordinates": [
            4.822998046875,
            45.920587344733654
          ]
        }
      },
      {
        "title" : "Store G",
        "animal" : "dog",
        "drink" : "fanta",
        "name" : "sandrine",
        "geometry": {
          "type": "Point",
          "coordinates": [
            4.06494140625,
            45.96642454131025
          ]
        }
      }
    ];

var jsonStringify = JSON.stringify(json);
var jsonParse = JSON.parse(jsonStringify); 

var markers = [];
var markerCluster;
var searchInput = jQuery('#searchMap input');
var filterSelect = jQuery('.filter');
var resetButton = jQuery('#resetFilter');



var filterResults = [];
for (var i = 0; i < json.length; i++) {
    var filters = json[i];
    var filterAnimal = filters.animal;
    var filterDrink = filters.drink;
    var filterName = filters.name;
    filterResults.push(filterAnimal, filterDrink, filterName);       
}

var filterStringify = JSON.stringify(filterResults)
var filterParse = JSON.parse(filterStringify);   


function initMap() {
    var map = new google.maps.Map(document.getElementById('map-init'), {
      zoom: 6,
      center: new google.maps.LatLng(45.882360730184025, 2.57080078125)
    });

    for (var i = 0; i < json.length; i++){
        setMarkers(json[i], map);
    }

    markerCluster = new MarkerClusterer(map, markers, {ignoreHiddenMarkers: true, imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m'});
}

function setMarkers(marker, map) {
    var markerMap = marker.geometry.coordinates;
    var title = marker.title;
    var animal = marker.animal;
    var drink = marker.drink;
    var name = marker.name;
    var pos = new google.maps.LatLng(markerMap[1], markerMap[0]);
    var content = marker;

    markerMap = new google.maps.Marker({
        position: pos,
        title: title,
        animal: animal,
        drink: drink,
        name: name,
        map: map
    });

    markers.push(markerMap);

    var infowindow = new google.maps.InfoWindow({
        content: title + '<br/>' + animal + '<br/>' + drink + '<br/>' + name 
    });    

    // Marker click listener
    google.maps.event.addListener(markerMap, 'click', (function (marker1, content) {
        return function () {
            infowindow.setContent(content);
            infowindow.open(map, markerMap);
            map.panTo(this.getPosition());
            // map.setZoom(15);
        }
    })(markerMap, content));
}

function clusterManager(array) {
    markerCluster.clearMarkers();
    if (!array.length) {
        jQuery('.alert').addClass('is-visible');
    } else {
        jQuery('.alert').removeClass('is-visible');
        for (i=0; i < array.length; i++) {
            markerCluster.addMarker(array[i]);
        }
    }
}

//@todo add inputsearch
function newFilter(filterType1 = 'all', filterType2 = 'all', filterType3 = 'all') {
    var criteria = [
        { Field: "animal", Values: [filterType1] },
        { Field: "drink", Values: [filterType2] },
        { Field: "name", Values: [filterType3] },
        // { Field: ["animal", "name", "drink"], Values: [filterTyped] }
      ];

    var filtered = markers.flexFilter(criteria);
    clusterManager(filtered);
}

Array.prototype.flexFilter = function(info) {
    // Set our variables
    var matchesFilter, matches = [], count;

    // Helper function to loop through the filter criteria to find matching values
    // Each filter criteria is treated as "AND". So each item must match all the filter criteria to be considered a match.
    // Multiple filter values in a filter field are treated as "OR" i.e. ["Blue", "Green"] will yield items matching a value of Blue OR Green.
    matchesFilter = function(item) {
      count = 0
      for (var n = 0; n < info.length; n++) {
        if (info[n]["Values"].indexOf(item[info[n]["Field"]]) > -1) {
            count++;
        }
        //if value = all, return all item
        else if (info[n]["Values"] == "all") {
            count++;
        }
      }
      // If TRUE, then the current item in the array meets all the filter criteria
      return count == info.length;
    }
  
    // Loop through each item in the array
    for (var i = 0; i < this.length; i++) {
      // Determine if the current item matches the filter criteria
      if (matchesFilter(this[i])) {
        matches.push(this[i]);
      }
    }
  
    // Give us a new array containing the objects matching the filter criteria
    return matches;
  }
  


jQuery(document).ready(function() {
  jQuery('.filter-animal').on('change', function(){       
    var filter2 = jQuery('.filter-drink').val();
    var filter3 = jQuery('.filter-name').val();
    newFilter(jQuery(this).val(), filter2, filter3);
  });
  
  jQuery('.filter-drink').on('change', function(){
    var filter1 = jQuery('.filter-animal').val();
    var filter3 = jQuery('.filter-name').val();
    newFilter(filter1, jQuery(this).val(), filter3);
  });
  
  jQuery('.filter-name').on('change', function(){
    var filter1 = jQuery('.filter-animal').val();
    var filter2 = jQuery('.filter-drink').val();
    newFilter(filter1, filter2, jQuery(this).val());
  });
    
    searchInput.on('keyup', function () {
          var searchTyped = $(this).val();
          var arr = [];
          if (searchTyped.length > 0) {
              jsonParse.filter(function() {
                  for (i = 0; i < json.length; i++) {
                      marker = markers[i];
                      var markerFilter = [];
                      var filterAnimal = marker.animal;
                      var filterDrink = marker.drink;
                      var filterName = marker.name;
    
                      markerFilter.push(filterAnimal, filterDrink, filterName); 
                      var markerFilterStringify = JSON.stringify(markerFilter);
                      if( markerFilterStringify.indexOf(searchTyped) >= 0) {
                          arr.push(marker);
                      } else {
                          console.log('dont fit requirement')
                      }
                  }
              });
              clusterManager(arr);
          } else {
              newFilter();
          }
      });

    resetButton.on('click', function() {
        searchInput.val('');
        filterSelect.val('all');
        newFilter();
    });
 
    //delete all duplicated value from the previous array
    var uniqueValue = [];
    jQuery.each(filterResults, function(i, el){
        if(jQuery.inArray(el, uniqueValue) === -1) {
            uniqueValue.push(el);
        } 
    });

    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
        var matches, substringRegex;
        matches = [];
    
        substrRegex = new RegExp(q, 'i');
    
        jQuery.each(strs, function(i, str) {
            if (substrRegex.test(str)) {
            matches.push(str);
            }
        });
        cb(matches);
        };    
    };
    searchInput.typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    },
    {
        name: 'customFilter',
        source: substringMatcher(uniqueValue)
    });

});


$(window).on('load', function(){
    initMap();
});
