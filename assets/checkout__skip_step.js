;(function($, global) {
    var P = {
        PHRASE_IPOST: 'ipost',
        PHRASE_NP: 'нова пошта',
        PHRASE_NP_BONUS: 'бонус',

        STEP_STORE_KEY: 'checkout_step',
        STEP_CONTACT: 'contact_information',
        STEP_SHIPPING: 'shipping_method',
        STEP_PAYMENT: 'payment_method',
        STEP_REVIEW: 'review',
        STEP_THANKYOU: 'thank_you',

        _init: function() {
            var self = P;

            self.$stepPreload = $('#stepPreload');
            self.$deliveryWrappers = $('.content-box .radio-wrapper');
            self.$submitBtn = $('#continue_button');

            self._proccessStep();
        },

        _proccessStep: function() {
            var self = P;

            if (Shopify.Checkout.step !== self.STEP_CONTACT) {
                if(!NpAddrStore.getDeliveryType()) {
                    NpAddrStore.local2Session();

                    if(!NpAddrStore.getDeliveryType()) {
                        location.href = self._getUrl(self.STEP_CONTACT);
                    }
                }
            }


            switch(Shopify.Checkout.step) {
                case self.STEP_SHIPPING: self._processStepShipping(); break;
                case self.STEP_PAYMENT: self._processStepPayment(); break;
                case self.STEP_THANKYOU: self._processStepThankyou(); break;
                case self.STEP_REVIEW: self._processStepReview(); break;
            }

            sessionStorage.setItem(self.STEP_STORE_KEY, Shopify.Checkout.step);
        },

        _processStepPayment: function() {
            var self = P, $addrBlock, addrTxt, deliveryType, radio;

            deliveryType = NpAddrStore.getDeliveryType();

            if (deliveryType === NpAddrStore.deliveryIpost) {
                radio = $('input[value="' + CheckoutConf.payment.liqpayId + '"]');
                $('[data-trekkie-id="change_shipping_address_link"]').hide();
                radio.closest('.radio-wrapper').remove();
                $('[data-subfields-for-gateway="' + CheckoutConf.payment.liqpayId + '"]').remove();

                if(radio.is(':checked')) {
                    $('input[name="checkout\\[payment_gateway\\]"]:first').trigger('click');
                }
            }

            $addrBlock = $('.review-block .address');
            addrTxt = $.trim($addrBlock.text());
            addrTxt = addrTxt.replace(', 111111, Ukraine', '');
            $addrBlock.text(addrTxt);

            self._setDiscountCodeVisibility();
        },

        _processStepShipping: function() {
            var self = P, storeStep, deliveryType, url, toContactStep = false, $deliveryWrapper = false;

            self.$stepPreload.show();

            storeStep = sessionStorage.getItem(self.STEP_STORE_KEY);
            deliveryType = NpAddrStore.getDeliveryType();

            if(deliveryType === NpAddrStore.deliveryAddress || deliveryType === NpAddrStore.deliveryDepartment) {
                if(CheckoutBonusPrice.getBonusTotalPrice()) {
                    $deliveryWrapper = self._findDeliveryRadioWrapper(self.PHRASE_NP_BONUS, false);
                } else {
                    $deliveryWrapper = self._findDeliveryRadioWrapper(self.PHRASE_NP, self.PHRASE_NP_BONUS);
                }
            } else if(deliveryType === NpAddrStore.deliveryIpost) {
                $deliveryWrapper = self._findDeliveryRadioWrapper(self.PHRASE_IPOST, false);
            } else {
                toContactStep = true;
            }

            if(!$deliveryWrapper) {
                $deliveryWrapper = self.$deliveryWrappers.first();
            }

            $deliveryWrapper.find('label').trigger('click');
            CheckoutDelivery.Delivery.setDeliveryName($deliveryWrapper.find('label').text());

            if(storeStep !== self.STEP_CONTACT) {
                toContactStep = true;
            }

            if(toContactStep) {
                url = self._getUrl(self.STEP_CONTACT);
                location.href = url;
            } else {
                self.$submitBtn.trigger('click');
            }
        },

        _processStepThankyou: function() {
            var self = P, contentBox, _contentBox;

            $('.section__content__column .address').each(function() {
                var elem = $(this), txt;

                txt = elem.html();
                txt = txt.replace('<br>111111<br>Ukraine', '');
                elem.html(txt);
            });

            contentBox = $('.section__content .content-box').first();
            _contentBox = contentBox.clone();
            _contentBox.find('.os-step__title').remove();
            _contentBox.find('.os-step__description').html($('#bonusInfoThanksPageTmpl').html());
            _contentBox.insertAfter(contentBox);
        },

        _processStepReview: function() {
            var self = P, $addrBlock, addrTxt, isLiqpay, isIpost;

            $addrBlock = $('.review-block__inner .address:not(.review-block__billing-address)');
            addrTxt = $addrBlock.html();
            addrTxt = addrTxt.replace('<br>111111<br>Ukraine', '');
            $addrBlock.html(addrTxt);

            $addrBlock = $('.review-block__inner .address').filter('.review-block__billing-address');
            addrTxt = $addrBlock.text();
            addrTxt = addrTxt.replace(', 111111, Ukraine', '');
            $addrBlock.html(addrTxt);

            self._setDiscountCodeVisibility();

            isLiqpay = $('.payment-method-list').text().toLowerCase().indexOf('liqpay') > -1;
            isIpost = $('.review-block [href*="shipping_method"]').closest('.review-block')
                        .find('.review-block__content').text().toLowerCase().indexOf('ipost') > -1;

            if(isLiqpay && isIpost) {
                location.href = self._getUrl(self.STEP_PAYMENT);
            }
        },

        _findDeliveryRadioWrapper: function(phrase, phrase2) {
            var self = P, wrapper = false;

            self.$deliveryWrappers.each(function() {
                var elem = $(this), labelTxt;

                labelTxt = elem.find('label').text().toLowerCase();
                if(labelTxt.indexOf(phrase) > -1 && (!phrase2 || (phrase2 && labelTxt.indexOf(phrase2) == -1))) {
                    wrapper = elem;
                    return false;
                }
            });

            return wrapper;
        },

        _getUrl: function(step) {
            var self = P, url;

            url = location.origin + location.pathname + '?step=' + step;

            return url;
        },

        _setDiscountCodeVisibility: function() {
            var self = P, deliveryType;

            deliveryType = NpAddrStore.getDeliveryType();
            if (deliveryType === NpAddrStore.deliveryIpost) {
                $('[name="checkout[reduction_code]"]').closest('.order-summary__section--discount').remove();
            }
        }
    };

    $(document).ready(P._init);

})(jQuery, this);