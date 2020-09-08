;var StoreFinder = (function($, global) {

    // ----------- Util ----------- //
    var Util = {
        isIosDevice: function() {
            return (navigator.platform.indexOf("iPhone") != -1) ||
                    (navigator.platform.indexOf("iPad") != -1) ||
                    (navigator.platform.indexOf("iPod") != -1);
        },

        escapeHtml: function(text) {
            return $("<div>").text(text).html();
        }
    };
    // ----------- End Util ----------- //



    // ----------- Marker ----------- //
    var Marker = function (outletData) {
        this.outletData = outletData
    };
    Marker.prototype.markerPopupTmpl = $('#markerPopupTmpl').html();
    Marker.prototype.makeMarker = function() {
        var self = this, markerData, marker;

        markerData = {
            position: {
                lat: self.outletData.lat,
                lng: self.outletData.lng
            },
            title: self.outletData.title,
            map: self.map,
            icon: self.getOutletIcon()
        };

        marker = new google.maps.Marker(markerData);

        google.maps.event.addListener(marker, "click",  function(e) {
            Map.markerPopup.close();
            Map.markerPopup.setContent(self.getPopup());
            Map.markerPopup.open(Map.map, marker);
        });

        self.marker = marker;

        return marker;
    };
    Marker.prototype.getOutletIcon = function() {
        var self = this, icon = null;

        $.each(Map.mapData.outletType, function(key, outletType) {
            if(self.outletData.outlet_type == outletType.id) {
                icon = outletType.icon;
                return false;
            }
        });

        return icon;
    };
    Marker.prototype.getOutletDescription = function() {
        var self = this, description = '';

        $.each(Map.mapData.outletType, function(key, outletType) {
            if(self.outletData.outlet_type == outletType.id) {
                description = outletType.description;
                return false;
            }
        });

        return description;
    };
    Marker.prototype.getPopup = function() {
        var self = this, popupData, popupTmpl;

        popupTmpl = self.markerPopupTmpl.repeat(1);

        popupData = {
            name: self.outletData.type,
            address: self.outletData.city + ', ' + self.outletData.address,
            type: self.getOutletDescription(),
            lat: self.outletData.lat,
            lng: self.outletData.lng,
            link: Util.isIosDevice() ? 'maps://maps.google.com' : 'https://maps.google.com'
        };

        $.each(popupData, function(key, value) {
            popupTmpl = popupTmpl.replace('@' + key , value);
        });

        return popupTmpl;
    };
    // ----------- End Marker ----------- //

    // ---------------- List Item ------------ //
    var ListItem = function(outletData) {
        this.outletData = outletData;
    };
    ListItem.rowTmpl = $('#listRowTmpl').html();
    ListItem.productTmpl = $('#prodTmpl').html();
    ListItem.prototype.renderRow = function() {
        var self = this, rowHtml = '', $row, tmplData;

        rowHtml = ListItem.rowTmpl.repeat(1);
        tmplData = {
            '@icon': self._renderRowIcon(),
            '@address': Util.escapeHtml(this.outletData.city + ', ' + this.outletData.address),
            '@title': Util.escapeHtml(this.outletData.title),
            '@products': self._renderRowProducts(),
            '@description': Util.escapeHtml(this.outletData.type),
            '@link': '#'
        };

        $.each(tmplData, function(key, value) {
            rowHtml = rowHtml.replace(key , value);
        });

        $row = $(rowHtml);
        $row.find('[data-id="marker_lnk"]').bind('click', self, self._onMapLinkClick);

        return $row;
    };
    ListItem.prototype._renderRowIcon = function() {
        var self = this, _outletType;

        $.each(List.mapData.outletType, function(key, outletType) {
            if(outletType.id == self.outletData.outlet_type) {
                _outletType = outletType;
                return false;
            }
        });

        return _outletType.icon;
    };
    ListItem.prototype._renderRowProducts = function() {
        var self = this, _htmlArr = [], _prodNames = [], tmpl;

        $.each(self.outletData.products, function(key, prodId) {
            $.each(List.mapData.products, function(key, product) {
                if(product.id == prodId) {
                    _prodNames.push(product.title);
                }
            });
        });

        $.each(_prodNames, function(key, prodName) {
            tmpl = ListItem.productTmpl.repeat(1);
            tmpl = tmpl.replace('@product', Util.escapeHtml(prodName));

            _htmlArr.push(tmpl);
        });

        return _htmlArr.join('');
    };
    ListItem.prototype._onMapLinkClick = function(event) {
        var self = event.data

        List.showMarkerOnMap(self.outletData);

        return false;
    };

    // ---------------- End List Item ------------ //


    // ------------- List --------------- //
    var List = {
        pageSize: 5,

        init: function(mapData) {
            var self = List;

            self.mapData = mapData;

            self.$list = $('[data-id="store_finder"] [data-id="list"]');
            self.$rowCont = $('[data-id="store_finder"] [data-id="row_cont"]');
            self.$moreBtn = $('[data-id="store_finder"] [data-id="more_outlet_list"]').click(self._onMoreOutlets);

            self.resetRows(self.mapData.outlets);
        },

        resetRows: function(outletList) {
            var self = List;

            self.page = 1;
            self.outletList = outletList;

            self.renderRows();
        },

        renderRows: function() {
            var self = List, outletNum, i, $row;

            self.$rowCont.html('');
            if(self.outletList) {
                outletNum = self.pageSize * self.page;

                for(i = 0; i < outletNum; i ++) {
                    if(self.outletList.length > i) {
                        $row = (new ListItem(self.outletList[i])).renderRow();
                    }

                    self.$rowCont.append($row);
                }

                if(outletNum < self.outletList.length) {
                    self.$moreBtn.show();
                } else {
                    self.$moreBtn.hide();
                }
            }
        },

        refresh: function() {
            var self = List;

            if(self.outletList) {
                self.renderRows();
            }
        },

        resetRowsOutletDistance: function(outletDistance) {
            var self = List, outletList = [];

            $.each(outletDistance, function(key, _outletDistane) {
                outletList.push(_outletDistane.outletData);
            });

            self.resetRows(outletList);
        },

        resetRowsFiltered: function(markers) {
            var self = List, gps, outletDistance, outletList = [];


            $.each(markers, function(key, marker) {
                outletList.push(marker.outletData);
            });

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    gps = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    outletDistance = Map._calculateOutletDistance(gps, markers);
                    outletDistance = Map._sortOutletDistance(outletDistance);

                    self.resetRowsOutletDistance(outletDistance);
                }, function() {
                    self.resetRows(outletList);
                });
            } else {
                self.resetRows(outletList);
            }
        },

        showMarkerOnMap: function(outletData) {
            var self = List, _marker;

            $.each(Map.markers, function(key, marker) {
                if(marker.outletData.id === outletData.id) {
                    _marker = marker;
                    return false;
                }
            });

            StoreFinder.$switchMapBtn.trigger('click');

            Map.map.panTo(_marker.marker.position);
            Map.map.setZoom(17);
            new google.maps.event.trigger(_marker.marker, 'click');

            $('[data-id="store_finder"]')[0].scrollIntoView(true);
        },

        _onMoreOutlets: function() {
            var self = List;

            self.page ++;
            self.renderRows();
        }
    };
    // ------------- End List --------------- //


    // ----------- Map ----------- //
    var Map = {
        countryCenter: {lat: 48.21, lng: 31.10},
        zoom: 6,
        radius: 1000,

        init: function(mapData) {
            var self = Map;

            self.mapData = mapData;
            self.$map = $('[data-id="store_finder"] [data-id="map"]');
            self.markerPopup = new google.maps.InfoWindow({
                content: ''
            });

            if(mapData.outlets.length > 0) {
                self._initMap();
                self._drawPoints();
            }
        },

        _initMap: function() {
            var self = Map;

            self.map = new google.maps.Map(self.$map[0], {
                zoom: self.zoom,
                minZoom: self.zoom,
                maxZoom: 30,
                center: self.countryCenter, // geographical center,
                zoomControl: true,
                zoomControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                styles: [{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#efefef"}]},{"featureType":"poi.attraction","elementType":"labels.text","stylers":[{"color":"#c0c0c0"},{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"labels.icon","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","elementType":"labels.text.fill","stylers":[{"color":"#c0c0c0"}]},{"featureType":"transit.station","elementType":"labels.text","stylers":[{"color":"#c0c0c0"},{"visibility":"simplified"}]},{"featureType":"transit.station.rail","elementType":"labels.text","stylers":[{"color":"#c0c0c0"}]},{"featureType":"transit.station.rail","elementType":"labels.text.stroke","stylers":[{"visibility":"simplified"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#5bd0c9"}]}]
            });

            self.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(self._getCurrentLocationBtn());

            google.maps.event.addListenerOnce(self.map, 'tilesloaded', self._showOnLoadNearestOutlets);
        },

        _getCurrentLocationBtn: function() {
            var self = Map, _cont, _btn, _imgCont;

            _cont = $('<div></div>');
            _btn = $('<button></button>', {'class': 'current-location-btn', 'title': 'Ваше місцезнаходження'});
            _imgCont = $('<div></div>', {'class': 'current-location-img'});

            _cont.append(_btn);
            _btn.append(_imgCont);

            _btn.on('click', self._onGetCurrentLocation);

            return _cont[0];
        },

        _showOnLoadNearestOutlets: function() {
            var self = Map;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    gps = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    self._zoomNearestPoints(gps, true);
                }, function() {
                    console.log('Geolocation is not allowed');
                });
            }
        },

        _onGetCurrentLocation: function() {
            var self = Map, gps;

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    gps = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    self._zoomNearestPoints(gps, false);
                }, function() {
                    console.log('Geolocation is not allowed');
                });
            }
        },

        _zoomNearestPoints: function(gps, isAuto) {
            var self = Map, outletDistance, maxOutlet, west, east, bounds, mapZoom;

            outletDistance = self._calculateOutletDistance(gps);
            outletDistance = self._sortOutletDistance(outletDistance);

            List.resetRowsOutletDistance(outletDistance);

            maxOutlet = self._getMaxDistanceOutlet(outletDistance);

            if(maxOutlet.lng < gps.lng) {
                west = new google.maps.LatLng(maxOutlet.lat, maxOutlet.lng);
                east = new google.maps.LatLng(gps.lat, gps.lng);
            } else {
                west = new google.maps.LatLng(gps.lat, gps.lng);
                east = new google.maps.LatLng(maxOutlet.lat, maxOutlet.lng);
            }

            bounds = new google.maps.LatLngBounds(west, east);

            self._drawSearchRadius(gps);

            if(isAuto) {
                self.map.fitBounds(self.searchRadius.getBounds());
            } else {
                self.map.fitBounds(bounds);
            }

            mapZoom = self.map.getZoom();
            if (mapZoom > 0) {
                mapZoom-= 0.25;
            }

            self.map.setZoom(mapZoom);

            new google.maps.Marker({
                map: self.map,
                position: gps,
                icon: {
                    url: StoreFinderConf.url.currentMarker,
                    scaledSize: new google.maps.Size(20, 20),
                    origin: new google.maps.Point(0,0),
                    anchor: new google.maps.Point(0, 0)
                }
            });
        },

        _getMaxDistanceOutlet: function(outletDistance) {
            var self = Map, maxOutlet, maxPointInView = 3;

            if(outletDistance.length >= maxPointInView) {
                maxOutlet = outletDistance[maxPointInView - 1].outletData;
            } else {
                maxOutlet = outletDistance[outletDistance.length - 1].outletData;
            }

            return maxOutlet;
        },

        _calculateOutletDistance: function(gps, markerList) {
            var self = Map, outletDistance = [], gpsPos, outletPos, distance;

            gpsPos = new google.maps.LatLng(gps.lat, gps.lng);

            if(!markerList) {
                markerList = self.markers;
            }

            $.each(markerList, function(key, marker) {
                if(marker.marker.getVisible()) {
                    outletPos = new google.maps.LatLng(marker.outletData.lat, marker.outletData.lng);
                    distance = google.maps.geometry.spherical.computeDistanceBetween(outletPos, gpsPos);

                    outletDistance.push({
                        distance: distance,
                        outletData: marker.outletData
                    });
                }
            });

            return outletDistance;
        },

        _sortOutletDistance: function(outletDistance) {
            var self = Map;

            outletDistance = outletDistance.sort(function(a, b) {return a.distance - b.distance});

            return outletDistance;
        },

        _drawPoints: function() {
            var self = Map, marker, _mapMarker, _mapMarkers = [], _markers = [];

            $.each(self.mapData.outlets, function(key, outletData) {
                marker = new Marker(outletData);
                _mapMarker = marker.makeMarker();

                _markers.push(marker);
                _mapMarkers.push(_mapMarker);
            });

            self._drawClusters(_mapMarkers);

            self.markers = _markers;
        },

        _drawClusters: function(markers) {
            var self = Map, clusterOptions;

            if(self.cluster) {
                self.cluster.clearMarkers();
            }

            clusterOptions = {
                maxZoom: 20,
                styles :[{url:StoreFinderConf.clusterIcons.m1,height:54,width:54},{url:StoreFinderConf.clusterIcons.m2,height:56,width:56},{url:StoreFinderConf.clusterIcons.m3,height:66,width:66},{url:StoreFinderConf.clusterIcons.m4,height:78,width:78},{url:StoreFinderConf.clusterIcons.m5,height:90,width:90}]
            };

            self.cluster = new MarkerClusterer(self.map, markers, clusterOptions);
        },

        _drawSearchRadius: function(gps) {
            var self = Map;

            self._clearSearchRadius();

            self.searchRadius = new google.maps.Circle({
                strokeColor: '#2e6da4',
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: '#6283d8',
                fillOpacity: 0.35,
                map: self.map,
                center: gps,
                radius: self.radius
            });
        },

        _clearSearchRadius: function() {
            var self = Map;

            if(self.searchRadius) {
                self.searchRadius.setMap(null);
            }
        },

        // searchPoints: function(address) {
        //     var self = Map, gps;
        //
        //     if(address.length) {
        //         $.getJSON(
        //             "https://maps.google.com/maps/api/geocode/json",
        //             {
        //                 address: address,
        //                 key: StoreFinderConf.mapKey
        //             },
        //             function( data ) {
        //
        //                 if (data.status == 'OK') {
        //                     gps = data.results[0].geometry.location;
        //                     self._zoomNearestPoints(gps);
        //                 } else {
        //                     self.showAllOutlets();
        //                 }
        //         });
        //     }
        // },

        filterPoints: function() {
            var self = Map, fProduct, fOutletType, mapMarkers = [], markers = [];

            fProduct = MapFilter.$product.val();
            fOutletType = MapFilter.$outletType.val();

            $.each(self.markers, function(key, marker) {
                var isVisible = true;

                if(fProduct) {
                    isVisible = false;
                    $.each(marker.outletData.products, function(key, product) {
                        if(fProduct.indexOf(product.toString()) > -1) {
                            isVisible = true;

                            return false;
                        }
                    });
                }

                if(fOutletType && isVisible) {
                    isVisible = false;
                    if(fOutletType.indexOf(marker.outletData.outlet_type.toString()) > -1) {
                        isVisible = true;
                    }
                }

                if(isVisible) {
                    mapMarkers.push(marker.marker);
                    marker.marker.setVisible(true);
                    markers.push(marker);
                } else {
                    marker.marker.setVisible(false);
                }
            });

            self._drawClusters(mapMarkers);

            List.resetRowsFiltered(markers);
        },

        showAllOutlets: function() {
            var self = Map, mapMarkers = [];

            MapFilter.clearFilters();

            $.each(self.markers, function(key, marker) {
                marker.marker.setVisible(true);
                mapMarkers.push(marker.marker);
            });

            self._drawClusters(mapMarkers);
            self.map.setCenter(self.countryCenter);
            self.map.setZoom(self.zoom);

            List.resetRowsFiltered(self.markers);
        }
    };
    // ----------- End Map ----------- //


    // ----------- MapFilter ----------- //
    var MapFilter = {
        init: function (mapData) {
            var self = MapFilter;

            self.mapData = mapData;
            self.$outletType = $('[data-id="store_finder"] [data-id="outlet_type_filter"]');
            self.$product = $('[data-id="store_finder"] [data-id="product_filter"]');
            self.$address = $('[data-id="store_finder"] [data-id="address"]');

            self.$allOutletsBtn = $('[data-id="all_outlets_btn"]').click(self._onAllOutlets);

            self.addressSearch = new google.maps.places.SearchBox(self.$address[0]);

            if(mapData.outlets.length > 0) {
                self._initOutletType();
                self._initProduct();
                self._initAddress();
            }

            self.$product.multipleSelect({
                multiple: false,
                selectAll: false,
                formatAllSelected: function formatAllSelected() {
                    return 'Обрано всi';
                },
                formatCountSelected: function formatCountSelected(count, total) {
                    return count + ' з ' + total + ' обрано';
                }
            });

            self.$outletType.multipleSelect({
                multiple: false,
                selectAll: false,
                formatAllSelected: function formatAllSelected() {
                    return 'Обрано всi';
                },
                formatCountSelected: function formatCountSelected(count, total) {
                    return count + ' з ' + total + ' обрано';
                }
            });
        },

        clearFilters: function() {
            var self = MapFilter;

            self.$outletType.val('');
            self.$product.val('');
            self.$address.val('');

            self.$outletType.multipleSelect('uncheckAll');
            self.$product.multipleSelect('uncheckAll');

        },

        _onOutletTypeChange: function() {
            var self = MapFilter;

            Map.filterPoints();
        },

        _onProductChange: function() {
            var self = MapFilter;

            Map.filterPoints();
        },

        _initAddress: function() {
            var self = MapFilter;

            google.maps.event.addListener(self.addressSearch, 'places_changed', function (e) {
                var place, gps;

                place = self.addressSearch.getPlaces()[0];

                gps = {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }

                Map._zoomNearestPoints(gps);
            });
        },

        _initOutletType: function() {
            var self = MapFilter, _select;

            _select = self._getSelectOptions(self.mapData.outletType);
            _select.prepend(self.$outletType.find('option:first'));

            self.$outletType.html(_select.html());
            self.$outletType.attr('disabled', false);
            self.$outletType.change(self._onOutletTypeChange);
        },

        _initProduct: function() {
            var self = MapFilter, _select;

            _select = self._getSelectOptions(self.mapData.products);
            _select.prepend(self.$product.find('option:first'));

            self.$product.html(_select.html());
            self.$product.attr('disabled', false);
            self.$product.change(self._onProductChange);
        },

        _getSelectOptions: function(data) {
            var self = MapFilter, select, _option;

            select = $('<select></select>');
            $.each(data, function (key, _data) {
                _option = $('<option></option>', {'text': _data.title, 'value': _data.id});
                select.append(_option);
            });

            return select;
        },

        _onAllOutlets: function() {
            var self = MapFilter;

            StoreFinder.$switchMapBtn.trigger('click');
            Map.showAllOutlets();
            $('[data-id="store_finder"]')[0].scrollIntoView(true);
        }
    };
    // ----------- End MapFilter ----------- //


    // ----------- StoreFinder ----------- //
    var StoreFinder = {
        mapData: false,

        _tryInit: function() {
            var self = StoreFinder;

            if(self._canInitMap()) {
              setTimeout(function() {
                  self._setMapInited();

                  Map.init(self.mapData);
                  List.init(self.mapData);

                  List.$list.hide();

                  self.$switchMapBtn = $('[data-id="switch_map"]').click(self._onSwitchListMap);
                  self.$switchListBtn = $('[data-id="switch_list"]').click(self._onSwitchListMap);
                  self.$contactBtn = $('[data-id="contacts"]').click(self._onGoContact);
                }, 1000);
            }
        },

        _loadMapData: function() {
            var self = StoreFinder;

            $.getJSON(StoreFinderConf.url.outletData, function(data) {
                self.mapData = data;

                MapFilter.init(self.mapData);

                self._tryInit();
            });
        },

        _canInitMap: function() {
            var self = StoreFinder;

            return self.mapData && (typeof google !== 'undefined' && google.maps && google.maps.Map) && !self.mapInited;
        },

        _setMapInited: function() {
            var self = StoreFinder;

            self.mapInited = true;
        },

        _onSwitchListMap: function() {
            var self = StoreFinder,
                elem = $(this);

            self.$switchMapBtn.removeClass('current');
            self.$switchListBtn.removeClass('current');

            if(elem.attr('data-id') === 'switch_map') {
                Map.$map.show();
                List.$list.hide();
                self.$switchMapBtn.addClass('current');
            } else {
                Map.$map.hide();
                List.$list.show();
                List.refresh();
                self.$switchListBtn.addClass('current');
            }
        },

        _onGoContact: function() {
            var self = StoreFinder;

            $(location).attr('href', self.$contactBtn.attr('data-href'));
        },

        onMapScriptLoad: function () {
            var self = StoreFinder;

            self._tryInit();
        }
    };

    // ----------- End StoreFinder ----------- //

    StoreFinder._loadMapData();

    return {
        onMapScriptLoad: StoreFinder.onMapScriptLoad
    }
})(jQuery, this);


(function() {
    var script = document.createElement('script');
    script.setAttribute('src', 'https://maps.googleapis.com/maps/api/js?key=' + StoreFinderConf.mapKey + '&libraries=places,geometry&callback=StoreFinder.onMapScriptLoad');
    script.setAttribute('async', true);
    document.body.appendChild(script);
})();