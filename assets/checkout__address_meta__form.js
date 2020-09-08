;(function ($, global) {
    var P = {
        classError: 'field--error',

        _init: function () {
            var self = P;

            if (Shopify.Checkout.step === 'contact_information') {
                NpAddrStore.local2Session();

                self._initForm();
                self._setHtmlChangeListener();
            }
        },

        _initForm: function () {
            var self = P;

            self.npAddressFormTmpl = $('#npAddressFormTmpl').html();
            self.noCallbackTmpl = $('#noCallbackTmpl').html();

            self.$_shippingFirstName = $('#checkout_shipping_address_first_name');
            self.$_shippingLastName = $('#checkout_shipping_address_last_name');
            self.$_shippingAddrList = $('#checkout_shipping_address_id');
            self.$_shippingAddr1 = $('#checkout_shipping_address_address1');
            self.$_shippingCity = $('#checkout_shipping_address_city');
            self.$_shippingCountry = $('#checkout_shipping_address_country');
            self.$_shippingPhone = $('#checkout_shipping_address_phone');
            self.$_shippingRegion = $('#checkout_shipping_address_province');

            self.$form = $('[data-step="contact_information"] form:first').submit(self._onFormSubmit);


            self._setNativeAddr();
            self._setNpAddressForm();
            self._fillNpAddressForm();
            self._showNativeErrors();
            self._fillContactData();
            self._initNpAddStorage();
            self._setIpostForm();
        },

        _setNativeAddr: function () {
            var self = P;

            self.$_shippingPhone.inputmask('+38(099)-999-99-99', {'placeholder': '+38(0__)-___-__-___'});

            self.$_shippingAddrList.closest('.field').hide();
            self.$_shippingAddr1.closest('.field').hide();
            self.$_shippingCity.closest('.field').hide();
            self.$_shippingCountry.closest('.field').hide();
            self.$_shippingRegion.closest('.field').hide();
            $('.section--contact-information').hide();

            self.$_shippingPhone.closest('.field').detach().insertAfter(self.$_shippingLastName.closest('.field'));
        },

        _setNativeAddrValue: function () {
            var self = P, addrArr = [], addrStr;

            if (self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryAddress) {
                addrArr.push(NpAddrStore.getStreet());
                addrArr.push('буд.' + NpAddrStore.getHouse());
                if (NpAddrStore.getFlat()) {
                    addrArr.push('кв.' + NpAddrStore.getFlat());
                }

                self.$_shippingCity.val(NpAddrStore.getCityLabel());
            } else if(self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryDepartment) {
                addrArr.push('відділення №' + NpAddrStore.getDepartmentNum());

                self.$_shippingCity.val(NpAddrStore.getCityLabel());
            } else {
                addrArr.push(sessionStorage.getItem(NpAddrStore.IPOST_CITY));
                addrArr.push(sessionStorage.getItem(NpAddrStore.IPOST_STREET));
                addrArr.push(sessionStorage.getItem(NpAddrStore.IPOST_FLAT));

                self.$_shippingCity.val(sessionStorage.getItem(NpAddrStore.IPOST_CITY));
            }

            addrStr = addrArr.join(', ');

            self.$_shippingAddr1.val(addrStr);
        },

        _setNpAddressForm: function () {
            var self = P, _phoneErr;

            self.$_shippingCountry.closest('.field').after(self.npAddressFormTmpl);
            self.$_shippingPhone.closest('.field').after(self.noCallbackTmpl);

            self.$npCity = $('#np_city');
            self.$npDeliveryType = $('[name="np_delivery_type"]').change(self._onDeliveryTypeChange);
            self.$npStreet = $('#np_street');
            self.$npBuilding = $('#np_building').change(self._onBuildingChange);
            self.$npFlat = $('#np_flat').change(self._onFlatChange);
            self.$npDepartment = $('#np_department');
            self.$npNoCallback = $('#np_no_callback').change(self._onNoCallbackChange);

            self.$addressBlock = $('#addressBlock');
            self.$departmentBlock = $('#departmentBlock');
            self.$ipostBlock = $('#ipostBlock');

            self.$npCityError = $('#np_city_error');
            self.$npDeliveryTypeError = $('#np_delivery_type_error');
            self.$npStreetError = $('#np_street_error');
            self.$npBuildingError = $('#np_building_error');
            self.$npFlatError = $('#np_flat_error');
            self.$npDepartmentError = $('#np_department_error');

            self.$npPaySummaryInfo = $('#npPaySummaryInfo');

            _phoneErr = $('<div></div>', {
                'id': 'np_phone_error',
                'class': 'field__message field__message--error'
            }).hide();
            self.$_shippingPhone.closest('.field__input-wrapper').append(_phoneErr);

            self.$npPhoneError = $('#np_phone_error');

            if (!self._isAgeVerified()) {
                self.$npNoCallback.attr('checked', false).attr('disabled', true).closest('.field').hide();
            }

            self._initAutocompleteCity();
            self._initAutocompleteStreet();
            self._initAutocompleteDepartment();
        },

        _isAgeVerified: function () {
            var self = P, i, tag, cTag, j, isAgeVerified = false;

            for (i in global.CheckoutConf.tagAgeVerified) {
                tag = global.CheckoutConf.tagAgeVerified[i].toLowerCase();

                for (j in global.CheckoutConf.customerTags) {
                    cTag = global.CheckoutConf.customerTags[j].toLowerCase();

                    if (cTag === tag) {
                        isAgeVerified = true;
                        break;
                    }
                }
            }

            return isAgeVerified;
        },

        _fillNpAddressForm: function () {
            var self = P;

            if (NpAddrStore.getCityId() && NpAddrStore.getDeliveryCityId() && NpAddrStore.getCityName() && NpAddrStore.getCityLabel()) {
                self.$npCity.val(NpAddrStore.getCityLabel());
            }

            if (NpAddrStore.getDeliveryType()) {
                self.$npDeliveryType.filter('[value="' + NpAddrStore.getDeliveryType() + '"]').attr('checked', true);
            }

            if (NpAddrStore.getDepartmentLabel() && NpAddrStore.getDepartmentNum()) {
                self.$npDepartment.val(NpAddrStore.getDepartmentLabel());
            }

            if (NpAddrStore.getNoCallback() !== null) {
                self.$npNoCallback.attr('checked', NpAddrStore.getNoCallback());
            }

            if (NpAddrStore.getStreet()) {
                self.$npStreet.val(NpAddrStore.getStreet());
            }

            if (NpAddrStore.getHouse()) {
                self.$npBuilding.val(NpAddrStore.getHouse());
            }

            if (NpAddrStore.getFlat()) {
                self.$npFlat.val(NpAddrStore.getFlat());
            }

            self.$npDeliveryType.trigger('change');
        },

        _initNpAddStorage: function () {
            var self = P;

            NpAddrStore.setDeliveryType(self.$npDeliveryType.filter(':checked').val());

            if (!self._isAgeVerified()) {
                NpAddrStore.setNoCallback(false);
            } else {
                if (self.$npNoCallback.attr('checked')) {
                    NpAddrStore.setNoCallback(true);
                }
            }
        },

        _setIpostForm: function() {
            var self = P;

            IpostCheckout.init();
        },

        _onBuildingChange: function () {
            var self = P;

            NpAddrStore.setHouse($.trim(self.$npBuilding.val()));
        },

        _onFlatChange: function () {
            var self = P;

            NpAddrStore.setFlat(self.$npFlat.val());
        },

        _onNoCallbackChange: function () {
            var self = P;

            NpAddrStore.setNoCallback(self.$npNoCallback.is(':checked'));
        },

        _initAutocompleteCity: function () {
            var self = P;

            self.$npCity.autocomplete({
                source: function source(request, response) {
                    $.ajax({
                        url: global.CheckoutConf.url.getNpCity,
                        dataType: 'json',
                        data: {
                            query: request.term,
                            shop_name: global.CheckoutConf.shopName
                        },
                        success: function success(data) {
                            response(data);
                        }
                    });
                },
                minLength: 3,
                select: function select(event, ui) {
                    self.$npCity.val(ui.item.label);

                    NpAddrStore.setCityId(ui.item.city_id);
                    NpAddrStore.setCityName(ui.item.meta.MainDescription);
                    NpAddrStore.setCityLabel(ui.item.label);
                    NpAddrStore.setArea(ui.item.meta.Area);
                    NpAddrStore.setRegion(ui.item.meta.Region);
                    NpAddrStore.setDeliveryCityId(ui.item.delivery_city_id);


                    return false;
                },
                change: function change(e, ui) {
                    if (!ui.item) {
                        e.target.value = "";

                        NpAddrStore.setCityId('');
                        NpAddrStore.setCityName('');
                        NpAddrStore.setCityLabel('');
                        NpAddrStore.setArea('');
                        NpAddrStore.setRegion('');
                        NpAddrStore.setDeliveryCityId('');
                    }

                    self.$npStreet.val('');
                    NpAddrStore.setStreet('');

                    self.$npDepartment.val('');
                    NpAddrStore.setDepartmentNum('');
                    NpAddrStore.setDepartmentLabel('');
                }
            });
        },

        _initAutocompleteStreet: function () {
            var self = P;

            self.$npStreet.autocomplete({
                source: function source(request, response) {
                    if (NpAddrStore.getCityId()) {
                        $.ajax({
                            url: global.CheckoutConf.url.getNpStreet,
                            dataType: 'json',
                            data: {
                                query: request.term,
                                shop_name: global.CheckoutConf.shopName,
                                city_id: NpAddrStore.getCityId()
                            },
                            success: function success(data) {
                                response(data);
                            }
                        });
                    }
                },
                minLength: 3,
                select: function select(event, ui) {
                    self.$npStreet.val(ui.item.value);

                    NpAddrStore.setStreet(ui.item.value);

                    return false;
                },
                change: function change(e, ui) {
                    if (!ui.item) {
                        e.target.value = "";

                        NpAddrStore.setStreet('');
                    }
                }
            });
        },

        _initAutocompleteDepartment: function () {
            var self = P;

            self.$npDepartment.autocomplete({
                source: function source(request, response) {
                    if (NpAddrStore.getDeliveryCityId()) {
                        $.ajax({
                            url: global.CheckoutConf.url.getNpDepartment,
                            dataType: 'json',
                            data: {
                                query: request.term,
                                shop_name: global.CheckoutConf.shopName,
                                city_id: NpAddrStore.getDeliveryCityId()
                            },
                            success: function success(data) {
                                response(data);
                            }
                        });
                    }
                },
                minLength: 1,
                select: function select(event, ui) {
                    self.$npDepartment.val(ui.item.value);

                    NpAddrStore.setDepartmentLabel(ui.item.label);
                    NpAddrStore.setDepartmentNum(ui.item.meta.number);

                    return false;
                },
                change: function change(e, ui) {
                    if (!ui.item) {
                        e.target.value = "";

                        NpAddrStore.setDepartmentLabel('');
                        NpAddrStore.setDepartmentNum('');
                    }
                }
            });
        },

        _onDeliveryTypeChange: function () {
            var self = P, deliveryType;

            self.$addressBlock.hide();
            self.$departmentBlock.hide();
            self.$ipostBlock.hide();
            self.$npCity.closest('.field').hide();
            deliveryType = self.$npDeliveryType.filter(':checked').val();

            if (deliveryType === NpAddrStore.deliveryAddress) {
                self.$npCity.closest('.field').show();
                self.$addressBlock.show();
                self.$npPaySummaryInfo.show();
            } else if (deliveryType === NpAddrStore.deliveryDepartment) {
                self.$npCity.closest('.field').show();
                self.$departmentBlock.show();
                self.$npPaySummaryInfo.show();
            } else {
                self.$ipostBlock.show();
                self.$npPaySummaryInfo.hide();
            }

            NpAddrStore.setDeliveryType(deliveryType);
        },

        _onFormSubmit: function () {
            var self = P, isValid;

            isValid = self._validate();

            if (isValid) {
                NpAddrStore.session2Local();
                self._setNativeAddrValue();
                self._correctPhone();

                if (self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryIpost) {
                    IpostCheckout.send();
                }

                try {
                    window.GTMcheckout.action.option = self.$npDeliveryType.filter(':checked').val();
                    window.GTMcheckout.checkout(function () {
//                         $('[data-step="contact_information"] form:first').off('submit').submit();
                    });
                } catch(e) {
                    console.log(e);
                }
            }

            return isValid;
        },

        _validate: function () {
            var self = P, isValid = true, intRegex = /^\d+$/, phoneRegex = /^\+38\(0[123456789]{1}\d{1}\)-\d{3}-\d{2}-\d{2}$/, phoneRegex2 = /^\+380\d{9}$/;
            var errorFields = [];

            self.$npDeliveryTypeError.hide();
            if (!self.$npDeliveryType.filter(':checked').length) {
                isValid = false;
                errorFields.push('deliveryType');
                self.$npDeliveryTypeError.text(global.CheckoutConf.msg.required).show();
            }

            if (self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryAddress || self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryDepartment) {
                self.$npCityError.hide();
                if (!self.$npCity.val()) {
                    isValid = false;
                    errorFields.push('city');
                    self.$npCityError.text(global.CheckoutConf.msg.required).show();
                }
            }

            if (self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryAddress) {

                self.$npStreetError.hide();
                if (!self.$npStreet.val()) {
                    isValid = false;
                    errorFields.push('street');
                    self.$npStreetError.text(global.CheckoutConf.msg.required).show();
                }

                self.$npBuildingError.hide();
                if (!$.trim(self.$npBuilding.val())) {
                    isValid = false;
                    errorFields.push('building');
                    self.$npBuildingError.text(global.CheckoutConf.msg.required).show();
                }

                self.$npFlatError.hide();
                if (self.$npFlat.val()) {
                    if (!intRegex.test(self.$npFlat.val())) {
                        isValid = false;
                        errorFields.push('flat');
                        self.$npFlatError.text(global.CheckoutConf.msg.mustBeInteger).show();
                    } else if (self.$npFlat.val() <= 0) {
                        isValid = false;
                        errorFields.push('flat');
                        self.$npFlatError.text(global.CheckoutConf.msg.mustBeGreaterZero).show();
                    }
                }

            } else if (self.$npDeliveryType.filter(':checked').val() === NpAddrStore.deliveryDepartment) {

                self.$npDepartmentError.hide();
                if (!self.$npDepartment.val()) {
                    isValid = false;
                    errorFields.push('department');
                    self.$npDepartmentError.text(global.CheckoutConf.msg.required).show();
                }

            } else {
                if(!IpostCheckout.validate()) {
                    isValid = false;
                    errorFields.push('ipost');
                }
            }


            self.$npPhoneError.hide();
            if (!phoneRegex.test(self.$_shippingPhone.val()) && !phoneRegex2.test(self.$_shippingPhone.val())) {
                isValid = false;
                errorFields.push('phone');
                self.$npPhoneError.text(global.CheckoutConf.msg.incorrectPhone).show();
            }

            if (!isValid) {
                // console.log(errorFields);
                window.GTM.checkoutErrors(1, errorFields, Shopify.Checkout.step);
            }

            return isValid;
        },

        _correctPhone: function () {
            var self = P, _phone;

            _phone = self.$_shippingPhone.val().replace(/[^\+\d]/g, '');
            self.$_shippingPhone.inputmask("remove");
            self.$_shippingPhone.val(_phone);
        },

        _showNativeErrors: function () {
            var self = P, errors = [];

            errors = self._getElemErr([
                self.$_shippingAddrList,
                self.$_shippingAddr1,
                self.$_shippingCity,
                self.$_shippingCountry
            ]);

            if (errors.length > 0) {
                self.$npCity.closest('.field').addClass(self.classError);
                self.$npCityError.html(errors.join('<br />')).show();
                $('#ipost_city_error').html(errors.join('<br />')).show();
            }

        },

        _getElemErr: function (elemList) {
            var self = P, $elem, $error, i, errors = [];

            for (i in elemList) {
                $elem = elemList[i];
                $error = $elem.closest('.field').find('[id^="error-for-"]');
                if ($error.length > 0) {
                    errors.push($error.text());
                }
            }

            return errors;
        },

        _fillContactData: function () {
            var self = P, addrData = false, _addrData = false, _addrFirstData = false, phone,
                phoneRegex = /^\+380\d{9}$/;

            self.$_shippingAddrList.find('option').each(function () {
                var $elem = $(this);

                try {
                    _addrData = JSON.parse($elem.attr('data-properties'));
                    if (!_addrFirstData) {
                        _addrFirstData = _addrData;
                    } else {
                        if (!phoneRegex.test(_addrFirstData.phone.replace(/\s/g, '')) && phoneRegex.test(_addrData.phone.replace(/\s/g, ''))) {
                            _addrFirstData = _addrData;
                        }
                    }


                    if (_addrData.default) {
                        addrData = _addrData;
                        return false;
                    }
                } catch (e) {
                }
            });

            if (!addrData && _addrFirstData) {
                addrData = _addrFirstData;
            }

            if (addrData) {
                if (!self.$_shippingFirstName.val()) {
                    self.$_shippingFirstName.val(addrData.first_name);
                }

                if (!self.$_shippingLastName.val()) {
                    self.$_shippingLastName.val(addrData.last_name);
                }

                phone = addrData.phone.replace(/\s/g, '');
                if (!self.$_shippingPhone.val() && phoneRegex.test(phone)) {
                    self.$_shippingPhone.val(addrData.phone.replace(/\s/g, ''));
                }
            }
        },

        _setHtmlChangeListener: function () {
            var self = P;

            setInterval(function () {
                if ($('#changeHtml').length === 0) {
                    self._initForm();
                }
            }, 300);
        }
    };

    $(document).ready(P._init);
})(jQuery, this);



