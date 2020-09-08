var IpostCheckout = (function($, global) {
    var P = {
        dateRegex: /^\d{2}\/\d{2}\/\d{4}$/,

        init: function () {
            var self = P;

            self.$firstName = $('#checkout_shipping_address_first_name');
            self.$lastName = $('#checkout_shipping_address_last_name');
            self.$phone = $('#checkout_shipping_address_phone');
            self.$city = $('#ipost_city').change(self._onCityChange);
            self.$street = $('#ipost_street');
            self.$flat = $('#ipost_flat').change(self._onFlatChange);
            self.$deliveryAddress = $('#ipost-delivery-address');
            self.$deliveryDate = $('#ipost_delivery_date').change(self._onDateChange);
            self.$deliveryTimeFrom = $('#ipost_delivery_time_from').change(self._onTimeFromChange);
            self.$deliveryTimeTo = $('#ipost_delivery_time_to').change(self._onTimeToChange);
            self.$choseDeliveryTime = $('#ipost_chose_delivery_time').change(self._onChooseDeliveryTimeChange);
            self.$comment = $('#ipost_comment').change(self._onCommentChange);

            self.$npDeliveryType = $('[name="np_delivery_type"]');

            self.$blockIpost = $('#ipostBlock');
            self.$blockInputs = self.$blockIpost.find('[data-id="inputs"]');
            self.$blockPreload = self.$blockIpost.find('[data-id="preload"]');
            self.$blockError = self.$blockIpost.find('[data-id="error"]');

            self.$blockError.find('[data-id="reload_btn"]').click(self._setFormInputs);

            self.hasAppliedDiscount = $('#checkout_clear_discount').length;

            self._setIpostBtnVisibility();
            self._initGooglePlaces();
            self._setFormInputs();
        },

        send: function() {
            var self = P, formData;

            formData = self._getFormData();
            sessionStorage.setItem(NpAddrStore.IPOST_FORM_DATA, formData);

            $.ajax({
                url: global.CheckoutConf.ipost.url.checkout,
                type: 'post',
                data: formData
            });
        },

        sendFromSession: function() {
            var self = P, formData;

            formData = sessionStorage.getItem(NpAddrStore.IPOST_FORM_DATA);
            if(formData) {
                try {
                    formData = JSON.parse(formData);
                    formData.is_final = 1;
                    formData = JSON.stringify(formData);

                    $.ajax({
                        url: global.CheckoutConf.ipost.url.checkout,
                        type: 'post',
                        data: formData
                    });
                } catch (e) {
                    console.log(e);
                }
            }
        },

        _onCityChange: function() {
            var self = P;

            sessionStorage.setItem(NpAddrStore.IPOST_CITY, self.$city.val());
        },

        _onFlatChange: function() {
            var self = P;

            sessionStorage.setItem(NpAddrStore.IPOST_FLAT, self.$flat.val());
        },

        _onDateChange: function() {
            var self = P;

            self._correctTime();

            sessionStorage.setItem(NpAddrStore.IPOST_DATE, self.$deliveryDate.val());
        },

        _onTimeFromChange: function() {
            var self = P;

            self._correctTime();

            sessionStorage.setItem(NpAddrStore.IPOST_TIME_FROM, self.$deliveryTimeFrom.val());
        },

        _onTimeToChange: function() {
            var self = P;

            sessionStorage.setItem(NpAddrStore.IPOST_TIME_TO, self.$deliveryTimeTo.val());
        },

        _onCommentChange: function() {
            var self = P;

            sessionStorage.setItem(NpAddrStore.IPOST_COMMENT, self.$comment.val());
        },

        _onChooseDeliveryTimeChange: function() {
            var self = P;

            sessionStorage.setItem(NpAddrStore.IPOST_CHOSE_TIME, (self.$choseDeliveryTime.is(':checked') ? 1 : 0));

            self._onCustomTime();
        },

        validate: function() {
            var self = P, isValid = true, deliveryAddrData;

            self._setError(self.$city, false);
            if(!self.$city.val()) {
                self._setError(self.$city, global.CheckoutConf.msg.required);
                isValid = false;
            }

            self._setError(self.$street, false);
            if(!self.$deliveryAddress.val()) {
                self._setError(self.$street, global.CheckoutConf.msg.required);
                isValid = false;
            } else {
                try {
                    deliveryAddrData = JSON.parse(self.$deliveryAddress.val());
                    if(!deliveryAddrData.number) {
                        self._setError(self.$street, global.CheckoutConf.msg.streetWithHouse);
                        isValid = false;
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            self._setError(self.$flat, false);
            if(!self.$flat.val()) {
                self._setError(self.$flat, global.CheckoutConf.msg.required);
                isValid = false;
            }

            self._setError(self.$deliveryDate, false);
            if(self.$choseDeliveryTime.is(':checked')) {
                if(!self.$deliveryDate.val() || !self.$deliveryTimeTo.val() || !self.$deliveryTimeFrom.val()) {
                    self._setError(self.$deliveryDate, global.CheckoutConf.msg.required);
                    isValid = false;
                }
            }

            return isValid;
        },

        _setError: function($elem, error) {
            var self = P, $error;

            $error = $('#' + $elem.attr('id') + '_error');

            if(error) {
                $error.text(error).show();
            } else {
                $error.hide();
            }
        },

        _setFormInputs: function() {
            var self = P;

            self.$blockInputs.hide();
            self.$blockPreload.show();
            self.$blockError.hide();

            $.ajax({
                url: global.CheckoutConf.ipost.url.conf,
                data: {customer_id: global.CheckoutConf.customerId},
                success: function (data) {
                    var select = $('<select></select>');

                    self._IPostConf = data;

                    self._initSelectData(self.$city, data.cities);
                    self._initSelectData(self.$deliveryDate, data.dateList);
                    self._initSelectData(self.$deliveryTimeFrom, data.timeFromList);
                    self._initSelectData(self.$deliveryTimeTo, data.timeToList);

                    self._correctTime();
                    self._onCustomTime();

                    self.token = data.token;

                    self.$blockInputs.show();
                    self.$blockPreload.hide();

                    self._setDataFromSessionStore(data.isAllowedNow);
                },
                error: function() {
                    self.$blockPreload.hide();
                    self.$blockError.show();
                }
            });

            return false;
        },

        _setDataFromSessionStore: function(isAllowNow) {
            var self = P;

            self.$city.val(sessionStorage.getItem(NpAddrStore.IPOST_CITY));
            self.$street.val(sessionStorage.getItem(NpAddrStore.IPOST_STREET));
            self.$deliveryAddress.val(sessionStorage.getItem(NpAddrStore.IPOST_ADDRESS));
            self.$flat.val(sessionStorage.getItem(NpAddrStore.IPOST_FLAT));

            if(!isAllowNow || parseInt(sessionStorage.getItem(NpAddrStore.IPOST_CHOSE_TIME))) {
                $('[for="ipost_chose_delivery_time"]').trigger('click');
            }

            self.$deliveryDate.val(sessionStorage.getItem(NpAddrStore.IPOST_DATE));
            self.$deliveryTimeFrom.val(sessionStorage.getItem(NpAddrStore.IPOST_TIME_FROM));
            self.$deliveryTimeTo.val(sessionStorage.getItem(NpAddrStore.IPOST_TIME_TO));
            self.$comment.val(sessionStorage.getItem(NpAddrStore.IPOST_COMMENT));
        },

        _initSelectData: function($select, data) {
            var self = P, select = $('<select></select>'), option;

            option = $select.find('option:first');
            if(option.length) {
                select.append(option);
            }

            $.each(data, function (key, value) {
                option = $('<option></option>', {value: key, text: value});
                select.append(option);
            });

            $select.html(select.html());
        },

        _initGooglePlaces: function() {
            var self = P, autocomplete;

            autocomplete = new google.maps.places.Autocomplete(self.$street[0]);
            autocomplete.setComponentRestrictions({'country': ['UA']});
            autocomplete.setTypes([ "geocode" ]);

            google.maps.event.addListener(autocomplete, 'place_changed', function (e) {
                var place, address, addressParts = {}, addressStr;

                place = autocomplete.getPlace();

                $.each(place.address_components, function(key, value){
                    addressParts[value.types[0]] = value.short_name;
                });

                address = {
                    lat: place.geometry.location.lat(),
                    long: place.geometry.location.lng(),
                    city: addressParts['locality'] || null,
                    street: addressParts['route'] || null,
                    number: addressParts['street_number'] || null,
                    postal_code: addressParts['postal_code'] || null
                };

                addressStr = JSON.stringify(address);

                self.$deliveryAddress.val(addressStr);

                sessionStorage.setItem(NpAddrStore.IPOST_ADDRESS, addressStr);
                sessionStorage.setItem(NpAddrStore.IPOST_STREET, self.$street.val());
            });
        },

        _correctTime: function() {
            var self = P;

            self._correctTimeFrom();
            self._correctTimeTo();
        },

        _correctTimeFrom: function() {
            var self = P, date, timeNow;

            date = self._getSelectedDate();
            timeNow = Date.now();

            if(date) {
                self.$deliveryTimeFrom.find('option').each(function() {
                    var elem = $(this), time;

                    time = new Date(date + ' ' + elem.val()).getTime();

                    elem.attr('disabled', (time < timeNow));
                });

                self._setClosestTime(self.$deliveryTimeFrom);
            }
        },

        _correctTimeTo: function() {
            var self = P, date, timeFrom, timeMax;

            date = self._getSelectedDate();
            timeFrom = self.$deliveryTimeFrom.val();
            if(!timeFrom) {
                timeFrom = '23:59';
            }

            if(date) {
                timeMax = new Date(date + ' ' +  timeFrom).getTime() + 3 * 3600 * 1000;

                self.$deliveryTimeTo.find('option').each(function() {
                    var elem = $(this), time;

                    time = new Date(date + ' ' + elem.val()).getTime();

                    elem.attr('disabled', (time < timeMax));
                });

                self._setClosestTime(self.$deliveryTimeTo);
            }

        },

        _getSelectedDate: function() {
            var self = P, val, date = false;

            val = self.$deliveryDate.val();

            if(self.dateRegex.test(val)) {
                date = val.split('/').reverse().join('/');
            }

            return date;
        },

        _setClosestTime: function($time) {
            var self = P;

            if(!$time.val()) {
                if($time.find('option:enabled:first').length) {
                    $time.val($time.find('option:enabled:first').val());
                } else {
                    $time.val('');
                }
            }
        },

        _onCustomTime: function() {
            var self = P, isChecked;

            isChecked = self.$choseDeliveryTime.is(':checked');

            self.$deliveryDate.attr('disabled', !isChecked);
            self.$deliveryTimeFrom.attr('disabled', !isChecked);
            self.$deliveryTimeTo.attr('disabled', !isChecked);
        },

        _setIpostBtnVisibility: function() {
            var self = P, isOrderAmountOk;

            if(!self.hasAppliedDiscount) {
                isOrderAmountOk = Shopify.Checkout.estimatedPrice >= global.CheckoutConf.ipost.order_amount.min &&
                    Shopify.Checkout.estimatedPrice <= global.CheckoutConf.ipost.order_amount.max;

                self._isAllProductsAllowed(function(isAllProductsAllowed) {
                    if(!isOrderAmountOk || !isAllProductsAllowed) {
                        self._hideIpost();
                    }
                });
            } else {
                self._hideIpost();
            }
        },

        _hideIpost: function() { 
            var self = P;

            self.$npDeliveryType.filter('[value="' + NpAddrStore.deliveryAddress + '"]').trigger('click');
            self.$npDeliveryType.filter('[value="' + NpAddrStore.deliveryIpost + '"]').closest('.radio-wrapper').remove();
            self.$blockIpost.remove();
        },

        _isAllProductsAllowed: function(callback) {
            var self = P, allowAll = true, queryCount = 0;

            jQuery.getJSON('/cart.js', function(cart) {
                $.each(cart.items, function(key, item) {
                    var productUrl = '/products/' + item.handle + '.js';

                    $.getJSON( productUrl, function(product) {
                        allowAll = allowAll && product.tags.indexOf(global.CheckoutConf.ipost.TAG_ALLOW_IPOST) > -1;
                        queryCount += 1;

                        if(queryCount === cart.items.length) {
                            callback(allowAll);
                        }
                    })
                    .fail(function() {
                        allowAll = false;
                        callback(allowAll);
                    })
                });
            });
        },

        _getFormData: function() {
            var self = P, formData;

            formData = {
                customer_id: global.CheckoutConf.customerId,
                fio: self.$firstName.val() + ' ' + self.$lastName.val(),
                phone: self.$phone.val(),
                email: global.CheckoutConf.customerEmail,
                city: self.$city.val(),
                street: self.$street.val(),
                street_address: self.$deliveryAddress.val(),
                flat: self.$flat.val(),
                comment: self.$comment.val(),
                checkoutToken: Shopify.Checkout.token,
                token: self.token
            };

            if(self.$choseDeliveryTime.is(':checked')) {
                formData.date = {
                    date: self.$deliveryDate.val(),
                    time_from: self.$deliveryTimeFrom.val(),
                    time_to: self.$deliveryTimeTo.val()
                };
            }

            return JSON.stringify(formData);
        }
    };

    return {
        init: P.init,
        validate: P.validate,
        send: P.send,
        sendFromSession: P.sendFromSession
    }
})(jQuery, this);