;(function($, global) {
    var OrderAmount = {
        amount: 0,
        lastAmount: 0,

        _init: function() {
            var self = OrderAmount;

            self.$carTotalBlock = $('[data-cart-subtotal]:first');

            setInterval(function() {
                self.amount = parseInt(self.$carTotalBlock.text().replace(/\D/g,''));

                if(self.amount !== self.lastAmount) {
                    self.lastAmount = self.amount;

					P._setIpostBtnVisibility();
                }
            }, 300);
        }
    };

    var P = {
        dateRegex: /^\d{2}\/\d{2}\/\d{4}$/,

        _init: function() {
            var self = P;

            self.$orderNote = $('#CartSpecialInstructions');
            self.$popup = $('#cartIpostPopup');
            self.$form = self.$popup.find('[data-form]').submit(self._onFormSubmit);

            self._createIPostBtn();

            self._initGooglePlaces();
            self._setPopUpEvents();
            self._setPopUpData();
        },

        _createIPostBtn: function() {
            var self = P, $btnCont;

            $btnCont = $('.cart__submit-controls');
            self.$ipostBtn = $($('#ipostBtnTmpl').html()).hide();

            $btnCont.append(self.$ipostBtn);
        },

        _setIpostBtnVisibility: function() {
            var self = P, isOrderAmountOk;

            if(self.$ipostBtn) {
                self.$ipostBtn.hide();

                isOrderAmountOk = OrderAmount.amount >= global.IPostConf.order_amount.min && OrderAmount.amount <= global.IPostConf.order_amount.max;
                self._isAllProductsAllowed(function(isAllProductsAllowed) {
                    if(isOrderAmountOk && isAllProductsAllowed) {
                        self.$ipostBtn.show();
                    } else {
                        self.$ipostBtn.hide();
                    }
                });
            }
        },

        _isAllProductsAllowed: function(callback) {
            var self = P, allowAll = true, queryCount = 0;

            jQuery.getJSON('/cart.js', function(cart) {
                $.each(cart.items, function(key, item) {
                    var productUrl = '/products/' + item.handle + '.js';

                    $.getJSON( productUrl, function(product) {
                        allowAll = allowAll && product.tags.indexOf(global.IPostConf.TAG_ALLOW_IPOST) > -1;
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

        _setPopUpData: function() {
            var self = P;

            if(global.IPostConf.customer) {
                $.ajax({
                    url: global.IPostConf.url.conf,
                    data: {customer_id: global.IPostConf.customer.id},
                    success: function (data) {
                        var select = $('<select></select>');
                      
                      	self._IPostConf = data;

                        self._initSelectData(self.$form.find('[data-city]'), data.cities);
                        self._initSelectData(self.$form.find('[data-date]'), data.dateList);
                        self._initSelectData(self.$form.find('[data-time-from]'), data.timeFromList);
                        self._initSelectData(self.$form.find('[data-time-to]'), data.timeToList);

                        self._correctTime();
                        self.$form.find('[data-date], [data-time-from], [data-time-to]').attr('disabled', true);

                        self.token = data.token;

                        if(!data.isAllowedNow) {
                            $('#chbxDeliveryTimeLbl').trigger('click');
                        }
                    },
                    error: function() {
                        self._setError(self.$form.find('[data-city]'), global.IPostConf.msg.errorLoadSettings);
                        self._setError(self.$form.find('[data-date]'), global.IPostConf.msg.errorLoadSettings);
                    }
                });

                self.$form.find('[data-fio]').val(global.IPostConf.customer.name);
                self.$form.find('[data-email]').val(global.IPostConf.customer.email);
                self.$form.find('[data-phone]').val(global.IPostConf.customer.phone);
            }
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

        _setPopUpEvents: function() {
            var self = P;

            self.$form.find('[data-phone]').inputmask('+38(099)-999-99-99', { 'placeholder': '+38(0__)-___-__-___' });

            self.$form.find('[data-cancel]').click(function() {
                self.$popup.fadeOut();
                return false;
            });

            self.$form.find('[data-street]').change(function() {
                if(!self.$form.find('[data-street]').val()) {
                    self.$form.find('[data-delivery-address]').val('');
                }
            });

            self.$form.find('[data-custom-time]').change(function () {
                self.$form.find('[data-date], [data-time-from], [data-time-to]').attr('disabled', !$(this).is(':checked'));
            });

            $('#chbxDeliveryTimeLbl').click(function() {
                $('[for="chbxDeliveryTime"]').trigger('click');
            });

            self.$form.find('[data-date]').change(function() {
                self._correctTime();
            });

            self.$form.find('[data-time-from]').change(function() {
                self._correctTime();
            });

            self.$form.find('[data-2catalog]').click(function() {
                $(location).attr('href', global.IPostConf.url.catalog);
            });

            self.$ipostBtn.click(function() {
                if(global.IPostConf.customer) {
                    self.$popup.fadeIn();
                } else {
                    $(location).attr('href', global.IPostConf.url.login);
                }

                return false;
            });

            $(window).keydown(function (event) {
                if (event.keyCode == 13) {
                    if(self.$popup.is(':visible')) {
                        event.preventDefault();
                        return false;
                    }
                }
            });

            $(document).click(self._onDocumentClick);
        },

        _onDocumentClick: function(event) {
            var self = P,
                $target = $(event.target);


            if(self.$popup.is(':visible')) {
                if(!$target.hasClass('modal-prompt') && !$target.parents('.modal-prompt').length) {
                    self.$popup.fadeOut();
                }
            }
        },

        _initGooglePlaces: function() {
            var self = P, autocomplete;

            autocomplete = new google.maps.places.Autocomplete(self.$form.find('[data-street]')[0]);
            autocomplete.setComponentRestrictions({'country': ['UA']});
            autocomplete.setTypes([ "geocode" ]);

            google.maps.event.addListener(autocomplete, 'place_changed', function (e) {
                var place, address, addressParts = {};

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

                self.$form.find('[data-delivery-address]').val(JSON.stringify(address));
            });

            self.$form.find('[data-street]').on('focus', function () {
                $(self.$form.find('[data-street-wrap]')).append($('.pac-container'));
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
                self.$form.find('[data-time-from]').find('option').each(function() {
                    var elem = $(this), time;

                    time = new Date(date + ' ' + elem.val()).getTime();

                    elem.attr('disabled', (time < timeNow));
                });

                self._setClosestTime(self.$form.find('[data-time-from]'));
            }
        },

        _correctTimeTo: function() {
            var self = P, date, timeFrom, timeMax;

            date = self._getSelectedDate();
            timeFrom = self.$form.find('[data-time-from]').val();
            if(!timeFrom) {
                timeFrom = '23:59';
            }

            if(date) {
                timeMax = new Date(date + ' ' +  timeFrom).getTime() + 3 * 3600 * 1000;

                self.$form.find('[data-time-to]').find('option').each(function() {
                    var elem = $(this), time;

                    time = new Date(date + ' ' + elem.val()).getTime();

                    elem.attr('disabled', (time < timeMax));
                });

                self._setClosestTime(self.$form.find('[data-time-to]'));
            }

        },

        _getSelectedDate: function() {
            var self = P, val, date = false;

            val = self.$form.find('[data-date]').val();

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

        _setError: function($elem, error) {
            var self = P, $error;

            $error = $elem.closest('[data-form-row]').find('[data-error]');

            if(error) {
                $error.text(error).show();
            } else {
                $error.hide();
            }
        },

        _validate: function() {
            var self = P, isValid = true, elem,
                phoneRegex = /^\+38\(0\d{2}\)-\d{3}-\d{2}-\d{2}$/,
                emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

            elem = self.$form.find('[data-fio]');
            if(elem.val().length < 6) {
                self._setError(elem, global.IPostConf.msg.errorRequied);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            elem = self.$form.find('[data-email]');
            if(!emailRegex.test(elem.val())) {
                self._setError(elem, global.IPostConf.msg.errorIncorrectEmail);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            elem = self.$form.find('[data-phone]');
            if(!phoneRegex.test(elem.val())) {
                self._setError(elem, global.IPostConf.msg.errorIncorrectPhone);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            elem = self.$form.find('[data-city]');
            if(!elem.val()) {
                self._setError(elem, global.IPostConf.msg.errorRequied);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            elem = self.$form.find('[data-street]');
            if(!self.$form.find('[data-delivery-address]').val()) {
                self._setError(elem, global.IPostConf.msg.errorRequied);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            elem = self.$form.find('[data-flat]');
            if(!elem.val()) {
                self._setError(elem, global.IPostConf.msg.errorRequied);
                isValid = false;
            } else {
                self._setError(elem, false);
            }

            if(self.$form.find('[data-custom-time]').is(':checked')) {
                elem = self.$form.find('[data-date]');
                if(!elem.val() || !self.$form.find('[data-time-from]').val() || !self.$form.find('[data-time-to]')) {
                    self._setError(elem, global.IPostConf.msg.errorRequied);
                    isValid = false;
                } else {
                    self._setError(elem, false);
                }
            }

            return isValid;
        },


        _onFormSubmit: function() {
            var self = P, formData;

            if(self._validate()) {
                formData = self._getFormData();

                jQuery.getJSON('/cart.js', function(cart) {
                    self._createOrder(cart);
                });
            }

            return false;
        },

        _createOrder: function(cart) {
            var self = P, formData, elem;

            formData = self._getFormData();
            formData.cart = self._getCartData(cart);

            self.$form.find('[data-preload]').show();
            self.$form.find('[data-next]').attr('disabled', true);

            $.ajax({
                url: global.IPostConf.url.createOrder,
                data: JSON.stringify(formData),
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if(data.success) {

                        jQuery.post('/cart/clear.js');

                        self.$form.find('[data-form-inputs]').slideUp(200, function () {
                            self.$form.find('[data-success-msg]').slideDown();
                        });

                    } else {
                        self._showCreateOrerError(data);
                        self.$form.find('[data-next]').attr('disabled', false);
                    }
                },
                error: function () {
                    elem = self.$form.find('[data-comment]');
                    self._setError(elem, global.IPostConf.msg.errorTryAgain);
                    self.$form.find('[data-next]').attr('disabled', false);
                },
                complete: function() {
                    self.$form.find('[data-preload]').hide();
                }
            });
        },

        _showCreateOrerError: function(resData) {
            var self = P, elem;

            $.each(resData.errors, function(key, value) {
                elem = self.$form.find('[data-' + key + ']');
                self._setError(elem, value);
            });
        },

        _getCartData: function(cart) {
            var self = P, cartData = {};

            cartData.total_price = cart.total_price / 100;
            cartData.items = [];

            $.each(cart.items, function(key, item) {
                var itemData = {
                    title: item.title,
                    quantity: item.quantity,
                    price: item.price / 100
                };

                cartData.items.push(itemData);
            });


            return cartData;
        },

        _getFormData: function() {
            var self = P, formData;

            formData = {
                customer_id: global.IPostConf.customer.id,
                fio: self.$form.find('[data-fio]').val(),
                phone: self.$form.find('[data-phone]').val(),
                email: self.$form.find('[data-email]').val(),
                city: self.$form.find('[data-city]').val(),
                street: self.$form.find('[data-delivery-address]').val(),
                flat: self.$form.find('[data-flat]').val(),
                comment: self.$form.find('[data-comment]').val(),
              	phone_customer: global.IPostConf.customer.phone,
                token: self.token
            };

            if(self.$form.find('[data-custom-time]').is(':checked')) {
                formData.date = {
                    date: self.$form.find('[data-date]').val(),
                    time_from: self.$form.find('[data-time-from]').val(),
                    time_to: self.$form.find('[data-time-to]').val()
                };
            }

            return formData;
        }
    };

    $(document).ready(function() {
        OrderAmount._init();
        P._init();
    });
})(jQuery, this);