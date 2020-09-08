; var GoogleMap = (function ($, global) {
    var Map = {
        maxPointsView: 3,
        scrollPosition : null,
        clasterImageUrl: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        locations : [],
        markers: [],
        circules: [],
        searchRadius: 1000, // in meters
        countryCenter: {lat: 48.21, lng: 31.10},
        minDistanceToPoint: {distance : null, coordinates : null },
        _init: function () {
            var self = Map;
            
            self.lng = $('#centers-longitude');
            self.lat = $('#centers-latitude');
            self.pointSidebarTemp = $('#sidebar-template');
            self.pointsSidebar = $('#points-sidebar');
            self.popupTemplate = $('#popup-template');
            self.allPointsBtn = $('#show-all');
            self.searchBtn = $('#search');
            self.addressField = $('#address');
            self.ngpFilters = $('.ngp-checkbox-item');

            self.sideBarSlide = $('#show-sidebar');
            self.sideBarSlide.on('click', self._sidebarToggle);
            self.labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            
            var controlsContainer = $('<div></div>');
            var controlBtn = $('<button></button>', {
                class: 'current-location-btn',
                title: 'Ваше місцезнаходження'
            });
            var imageContainer = $('<div></div>', {
                class: 'current-location-img',
                id: 'you_location_img'
            });

            controlsContainer.append(controlBtn);
            controlBtn.append(imageContainer);
            
            controlBtn.on('click', function() {
                self._getUserGeolocation(true);
            });
            
            var map = new google.maps.Map(document.getElementById('map'), {
                zoom: 6,
                minZoom: 6,
                maxZoom: 30,
                center: self.countryCenter, // geographical center,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                styles: [{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#efefef"}]},{"featureType":"poi.attraction","elementType":"labels.text","stylers":[{"color":"#c0c0c0"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#c0c0c0"}]},{"featureType":"transit.station","elementType":"labels.text","stylers":[{"color":"#c0c0c0"},{"visibility":"simplified"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"color":"#c0c0c0"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#5bd0c9"}]},{"featureType":"administrative.country","stylers":[{"visibility":"off"}]}]
            });
           
            self.map = map;
            self.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(controlsContainer[0]);
            
            $(window).scroll(function() {
                if (!self._isFullScreenMode()) {
                    self.scrollPosition = $(window).scrollTop();
                }
            });
            
            $(document).bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', self._fullScreenScrollFix);
            
            google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
                //show all locations
                self._getLocations();

                //try get user location
                self._getUserGeolocation();
            });
            
            self._changeZoomMap();
            
            //$(window).on('resize', self._changeZoomMap);
            
            self.infowindow = new google.maps.InfoWindow({
                content: ''
            });
            
            self.map.addListener('click', self._onMapClick);
            self.pointsSidebar.find('.point').on('click', self._moveToPoint);
            self.allPointsBtn.on('click', self._showAllPoints);
            self.searchBtn.on('click', self._searchPoints);
           
            $('input').on('ifChanged', function (event) { $(event.target).trigger('change'); });

            self.ngpFilters.change(function() {
               self._searchPoints();
            });
            
            self.searchBox = new google.maps.places.SearchBox(document.getElementById('address'));
            
            google.maps.event.addListener(self.searchBox, 'places_changed', function () {
                self._searchPoints();
            });
                        
            // Bias the SearchBox results towards current map's viewport.
            self.map.addListener('bounds_changed', function() {
                self.searchBox.setBounds(self.map.getBounds());
            });
        },
        _isIOSDevice: function() {
            var result = false;
            
            /* if we're on iOS, open in Apple Maps */
            if ((navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1) || (navigator.platform.indexOf("iPod") != -1)) {
                result = true;
            }
            
            return result;
        },
        _isFullScreenMode: function() {
            var isFullScreen = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            
            return isFullScreen;
        },
        _fullScreenScrollFix: function() {
            var self = Map, html = $('html, body');
             
            if (!self._isFullScreenMode()) {
                html.animate({
                    scrollTop: self.scrollPosition 
                }, 0);  
            }
        },
        _changeZoomMap: function() {
            var self = Map; 
            
            if (!self._isFullScreenMode()) {
                var bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(51.94854, 22.00779),
                    new google.maps.LatLng(44.54845, 40.48679)
                );

                self.map.fitBounds(bounds);
            }
        },
        _sidebarToggle: function () {
            var sideBarToggle = $('.side-bar'), self = Map;
            
            self.sideBarSlide.find('.nav-icon').toggleClass('open');
            
            if (!sideBarToggle.hasClass('opened')) {
                sideBarToggle.stop().fadeIn().addClass('opened');
               
            } else {
                sideBarToggle.stop().fadeOut().removeClass('opened');  
            }
        },
        _searchByAddress: function (address) {
            var self = Map;

            if (address.length) {
                $.getJSON( "https://maps.google.com/maps/api/geocode/json",{address: address}, function( data ) {
                    if (data.status == 'OK') {
                        self._searchCallback(data.results);
                    } else {
                        self.pointsSidebar.empty();
                    }
                });
            }
        },
        _searchPoints: function (e) {
            var self = Map;
            
            if (typeof self.markerCluster != 'undefined') { 
                self.markerCluster.clearMarkers();
            }
            
            self._clearMarkers();
            self._clearCircles();
            
            if (!self.addressField.val().length) {
                self._getLocations();
                return false;
            }

            var places = self.searchBox.getPlaces();

            if (typeof places == 'undefined' || !places || places.length == 0) {
                // get coordinates by address            
                self._searchByAddress(self.addressField.val());
            } else {
                self._searchCallback(places);
            }
        },
        _searchCallback: function (data) {
            var self = Map, LatLng;

            LatLng = data[0].geometry.location;

            LatLng = {
                lat: (typeof LatLng.lat == 'function') ? parseFloat(LatLng.lat()) : parseFloat(LatLng.lat),
                lng: (typeof LatLng.lng == 'function') ? parseFloat(LatLng.lng()) : parseFloat(LatLng.lng),
            };
            
            //draw search circle
            self._drawSearchRadius(LatLng);

            //get centers
            self._getLocations(true);
            
            //setMarker
            self._addMarker(data[0].place_id, LatLng, data[0].formatted_address, false);
            
            self.map.setCenter(LatLng);
//            self.map.setZoom(13);         
//            self.map.setZoom(16);         
            
            //show nearest point
//            self.map.fitBounds(self.circules[0].getBounds());
            self._findNearestPoint(LatLng);
        },
        _drawSearchRadius: function(coords) {
            var self = Map, radius, circle;

            radius = parseInt(self.searchRadius);

            coords.lat = parseFloat(coords.lat);
            coords.lng = parseFloat(coords.lng);

            circle = new google.maps.Circle({
                strokeColor: '#2e6da4',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#6283d8',
                fillOpacity: 0.35,
                map: self.map,
                center: coords,
                radius: radius
            });
            
            self.circules.push(circle);
        },
        _clearCircles: function () {
            var self = Map;

            $.each(self.circules, function (key, value) {
                self.circules[key].setMap(null);
            });
            self.circules = [];
        },
        _showAllPoints: function () {
            var self = Map;

            self.addressField.val('');
          
            self.ngpFilters.each(function() {
                var elem = $(this);
                if(!elem.is(':checked')) {
                    elem.closest('.custom-checkbox ').trigger('click');
                }
            });
            
            if (typeof self.markerCluster != 'undefined') { 
                self.markerCluster.clearMarkers();
            }
            
            self._clearMarkers();
            self._clearCircles();
            
            self._getLocations();
            
            self.map.setCenter(self.countryCenter);
            self.map.setZoom(6);
        },
        _onMapClick: function(event) {
            var self = Map, LatLng, marker;

            if (self.canAddPoint) {
                LatLng = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };

                self._clearMarkers();
                marker = self._addMarker(null, LatLng, null);

                self.lat.val(LatLng.lat.toFixed(7));
                self.lng.val(LatLng.lng.toFixed(7));
            }
        },
        _onMarkDrag: function (e) {
            var self = Map;

            self.lat.val(e.latLng.lat().toFixed(7));
            self.lng.val(e.latLng.lng().toFixed(7));
        },
        _clearMarkers: function () {
            var self = Map;

            if (!!self.markers[0]) {
                $.each(self.markers, function(key, val) {
                    self.markers[key].setMap(null);
                });
            }
        },
        _addMarker: function (name, location, description, icon) {
            var self = Map;
                
            var markerOptions = {
                position: location,
                title: name,
                map: self.map
            };
            
            markerOptions.icon = icon ? global.MapConfigs.icon[icon] : global.MapConfigs.icon['default'];
            
            var marker =  new google.maps.Marker(markerOptions);

            if (!!description) {
                google.maps.event.addListener(marker, "click",  function(e) {
                    self.infowindow.close();
                    self.infowindow.setContent(description);
                    self.infowindow.open(self.map, marker);            
                });
            }
            google.maps.event.addListener(marker, "dragend", self._onMarkDrag);

            self.markers.push(marker);

            return marker;
        },       
        _clearSideBar: function () {
            var self = Map;

            self.pointsSidebar.empty();
        },
        _getNgpFilters: function() {
            var self = Map, 
               filters = self.ngpFilters;
           
            filters = filters.map(function(){
                if (this.checked) {
                    return this.value; 
                } 
            }).get(); 
           
            // Device includes sticks too
//            if (filters.indexOf(global.MapConfigs.NGP_DEVICE) !== -1) {
//                filters.push(global.MapConfigs.NGP_STICK);
//            } 
           
            return filters;
        },
        _getUserGeolocation: function(is_btn) {
            var self = Map, LatLng = false;

            if(!is_btn) {
                LatLng =  self._getUserCoordsFromUrl();
            }

            if(LatLng) {
                self._setUserCurrentPosition(is_btn, LatLng);
            } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {            
                        LatLng = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                        self._setUserCurrentPosition(is_btn, LatLng);
                    }, function() {
                        self._getLocations();
                    });
                }
            }
        },

        _getUserCoordsFromUrl: function() {
            var self = Map, searchParams, lat, lng, LatLng = false;

            searchParams = new URLSearchParams(window.location.search);
            lat = searchParams.get('lat');
            lng = searchParams.get('lng');

            if(lat > 0 && lng > 0) {
                LatLng = {
                    lat: lat,
                    lng: lng
                };
            }

            return LatLng;
        },

        _setUserCurrentPosition: function(isBtn, LatLng) {
            var self = Map;
                    
            if (isBtn) {
                        var marker = new google.maps.Marker({
                            map: self.map,                        
                            position: LatLng,
                            icon: {
                                url: global.MapConfigs.currentPoint,
                                scaledSize: new google.maps.Size(20, 20), 
                                origin: new google.maps.Point(0,0),
                                anchor: new google.maps.Point(0, 0)
                            }
                        });
                        
                        $('#you_location_img').css('background-position', '-144px 0px');
                        self.markers.push(marker)
                        
                        self._findNearestPoint(LatLng);
            }

                    self._getLocations(true, LatLng)
        },
                    
        _findNearestPoint: function(LatLng) {
            var self = Map, bounds, west, east, tmp, points = [], maxDistancePoint, mapZoom;
            
            if (typeof global.MapConfigs.listPoints != 'undefined') {
                
                self.minDistanceToPoint = {distance: null, coordinates: null};
                
                $.each(global.MapConfigs.listPoints, function(ngp, point) {
                    $.each(point, function(index, center) {

                        if (!center.latitude || !center.longitude) {
                            return;
                        }
                        
                        points.push(self._checkRadiusPoint(parseFloat(center.latitude), parseFloat(center.longitude), LatLng.lat, LatLng.lng));
                    });
                }); 
                
                var sortedByDistance = self._sortByDistance(points);          
                
                if (sortedByDistance.length >= self.maxPointsView) {
                    maxDistancePoint = sortedByDistance[self.maxPointsView - 1].point
                } else if(sortedByDistance.length) {
                    maxDistancePoint = sortedByDistance[sortedByDistance.length - 1].point
                }
                
                if (!!maxDistancePoint) {
                    
                    tmp = [ 
                        new google.maps.LatLng(maxDistancePoint.lat(), maxDistancePoint.lng()),
                        new google.maps.LatLng(LatLng.lat, LatLng.lng)
                    ];
                    
                    if (maxDistancePoint.lng() < LatLng.lng)  {
                        west =  tmp[0];
                        east = tmp[1];
                    } else {
                        west =  tmp[1];
                        east = tmp[0];
                    }
                    
                    bounds = new google.maps.LatLngBounds(west, east);
                 
                    self.map.fitBounds(bounds);
                  
                  	mapZoom = self.map.getZoom();
                    
                    if (mapZoom > 0) {
                        mapZoom-= 0.25;
                    }
                  
                    self.map.setZoom(mapZoom);
                }
            }
        },
        _getLocations: function (filterByRadius, userLatLng) {
            var self = Map, locations = [], centers, centerInfo, popupContent, LatLng, centerInfoArr = [],
                    marker, inRadius = {result: false, distance: 0}, pointLatLng, template, markerIndex = 0, pointType = '';
            
            var inRadiusPoints = 0;
                        
            self._clearMarkers();
            self.markers = [];

            if (typeof self.markerCluster != 'undefined') {
                self.markerCluster.clearMarkers();
            }
            
            filterByRadius = filterByRadius || false;

            if (typeof global.MapConfigs !== 'undefined') {
                centers = global.MapConfigs.listPoints;

                self._clearSideBar();
                
                $.each(centers, function (ngp, point) {

                    if ($.inArray(ngp, self._getNgpFilters()) != -1) {           
                        $.each(point, function (index, center) {
                            if (!center.latitude || !center.longitude) {
                                return;
                            }
                            
                            LatLng = {lat: parseFloat(center.latitude), lng: parseFloat(center.longitude)};

                            // find by address
                            if (filterByRadius) {

                                pointLatLng = { lat: null, lng: null};

                                if (userLatLng) {
                                    pointLatLng.lat = userLatLng.lat;
                                    pointLatLng.lng = userLatLng.lng
                                } else {
                                    pointLatLng.lat = self.circules[0].center.lat();
                                    pointLatLng.lng = self.circules[0].center.lng()
                                }

                                inRadius = self._checkRadiusPoint(LatLng.lat, LatLng.lng, pointLatLng.lat, pointLatLng.lng);

                                if (inRadius.result) {
                                    inRadiusPoints++;
                                }
                            }
                            
                            pointType = global.MapConfigs.type[ngp] || '';
                            
                            popupContent = {
                                name: center.account_name + ' / ' + center.account_type,
                                address: center.city + ', ' + center.address_line,
                                type: pointType,
                                lat: center.latitude,
                                lng: center.longitude,
                                link: self._isIOSDevice() ? 'maps://maps.google.com' : 'https://maps.google.com',
                                userPositionLatLng: '' 
                            };
                            
                            if (typeof global.mapAdditionalConf !== 'undefined' && global.mapAdditionalConf.pointMonocolor) {
                                ngp = global.MapConfigs.NGP_DEVICE;
                            }
                            
                            marker = self._addMarker(center.account_name, LatLng, self._renderTemplate(popupContent, self.popupTemplate), ngp);

                            centerInfo = {
                                name: center.account_name + ' / ' + center.account_type,
                                address: center.city + ', ' + center.address_line,
                                type: pointType,
                                lat: center.latitude,
                                lng: center.longitude,
                                index: markerIndex++,
                                distance: inRadius.distance || ''
                            };
                            
                            // group all points buth not in radius
                            if (!inRadius.result) {
                                locations.push(marker);
                            }
                                
                            if (filterByRadius) {
                                centerInfoArr.push(centerInfo)
                            } else {
                                self._addToSidebar(centerInfo);
                            }
                        });
                    }
                });
                
                // filter points by distance
                if (filterByRadius && centerInfoArr.length) {
                   self._addToSidebar(self._sortByDistance(centerInfoArr));
                }
                
                self.pointsSidebar.find('.point').unbind('click').bind('click', self._moveToPoint);
            } else {
                return locations;
            }
            
            var ClasterOptions = {
                imagePath: self.clasterImageUrl,
                maxZoom: 20,
                styles :[
                    {
                        url: global.MapConfigs.clusterIcons.m1,
                        height: 54,
                         width: 54
                    },
                    {
                        url: global.MapConfigs.clusterIcons.m2,
                        height: 56,
                        width: 56
                    },
                    {
                        url: global.MapConfigs.clusterIcons.m3,
                        height: 66,
                        width: 66
                    },
                    {
                        url: global.MapConfigs.clusterIcons.m4,
                        height: 78,
                        width: 78
                    },
                    {
                        url: global.MapConfigs.clusterIcons.m5,
                        height: 90,
                        width: 90
                    }
                ]
            };
            
            // user location is allowed and points is founded in radius 1000 meters           
            if (userLatLng && inRadiusPoints) {
               
                self._drawSearchRadius(userLatLng); 
                self.map.setCenter(userLatLng);
                self.map.setZoom(16);
                
                //set to bounds
                self.map.fitBounds(self.circules[0].getBounds());
                
                self.markerCluster = new MarkerClusterer(self.map, locations, ClasterOptions);
            } else {
               self.markerCluster = new MarkerClusterer(self.map, locations, ClasterOptions);
            }

            return locations;
        },
        _addToSidebar: function(data) {
            var self = Map, template;
            
            //self._clearSideBar();
             
            data = Array.isArray(data) ? data : [data]
            
            data.map(function(item){
                template = self._renderTemplate(item, self.pointSidebarTemp);
                self.pointsSidebar.append(template);
            });
        },
        _sortByDistance: function(points)  {
            if (points) {
               points = points.sort(function(a, b) {return a.distance - b.distance});
            }
            
            return points;
        },
        _moveToPoint: function () {
            var self = Map, center;

            center = {
                lat: parseFloat($(this).attr('data-lat')),
                lng: parseFloat($(this).attr('data-lng'))
            }
            
            self.map.setCenter(center);
            self.map.setZoom(20);
            
            google.maps.event.trigger(self.markers[$(this).attr('data-index')], 'click', {});
            
            if ($(window).width() <= 768) {
                self._sidebarToggle();
            }    
        },
        _renderTemplate: function (content, template) {
            var template;

            template = template.html()
            
            if (!!content) {
                $.each(content, function(key, value) {
                    template = template.replace('@' + key , value);
                });
            }
            
            return  template;
        },
        _checkRadiusPoint: function($lat, $lng, centerLat, centerLng) {
            var self = Map;
            var point = new google.maps.LatLng($lat, $lng);
            var center = new google.maps.LatLng(centerLat, centerLng);
            var distance = google.maps.geometry.spherical.computeDistanceBetween(point, center);
            
            if (!self.minDistanceToPoint.distance || (self.minDistanceToPoint.distance > distance)) {
                self.minDistanceToPoint = {
                    distance: distance,
                    coordinates: point
                }; 
            }
            
//            return (distance <= self.searchRadius);
            return { result : (distance <= self.searchRadius), distance : distance, point: point};
        }
    };

    return {
        '_init' : Map._init
    };
})(jQuery, this);

$(document).ready(function(){
  
  var mapLat = +map.getAttribute('data-lat');
  var mapLng = +map.getAttribute('data-lng');
  
  function googleMapsScriptLoaded() {
    var map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: mapLat, lng: mapLng},
      zoom: 16
    });
    new google.maps.Marker({
      position: {
        lat: mapLat,
        lng: mapLng
      },
      map: map
    });
  }
  
 function appendMapScript() {
    const scriptEl = document.createElement('script');
    scriptEl.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBIToibsre0LnCpLoNFDOkW2ixnT4R-Jlk&libraries=places,geometry&callback=googleMapsScriptLoaded');
    scriptEl.setAttribute('async', true);
    document.body.appendChild(scriptEl);
  }

  window.googleMapsScriptLoaded = function() {
        $.getJSON(MapConfigs.domain, function(data) {
            MapConfigs.listPoints = data;
            
            GoogleMap._init();
        });
  };
  appendMapScript();
});