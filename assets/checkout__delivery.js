;var CheckoutDelivery = (function($, global) {

    /**
     * Сохранение типа доставки в Session Store
     */
    var Delivery = {
        STORE_KEY: 'ckt_delivery2',

        setDeliveryName: function(deliveryName) {
            var self = Delivery, amountDesc, storeKey;

            storeKey = self._getStoreKey();
            amountDesc = DeliveryType.getDeliveryDesc(deliveryName);

            sessionStorage.setItem(storeKey, JSON.stringify({
                amountDesc: amountDesc,
                deliveryName: deliveryName
            }));
        },

        getAmountDesc: function() {
            var self = Delivery, storeValue;

            storeValue  = self._getStoreData();

            return storeValue.amountDesc;
        },

        getDeliveryName: function() {
            var self = Delivery, storeValue;

            storeValue  = self._getStoreData();

            return storeValue.deliveryName;
        },


        _getStoreData: function() {
            var self = Delivery, storeValue, storeKey;

            storeKey = self._getStoreKey();
            storeValue = sessionStorage.getItem(storeKey) ? JSON.parse(sessionStorage.getItem(storeKey)) : {};

            return storeValue;
        },

        _getStoreKey: function() {
            var self = Delivery;

            return self.STORE_KEY + String(Shopify.Checkout.token) + String(Shopify.Checkout.estimatedPrice);
        }
    };

    /**
     * Определить тип доставки
     */
    var DeliveryType = {

        getDeliveryDesc: function(deliveryName) {
            var self = DeliveryType, desc = '';

            if(self._isFree(deliveryName)) {
                desc = CheckoutDeliveryConf.amountDesc.np.free;
            } else {
                desc = CheckoutDeliveryConf.amountDesc.np.paid;
            }

            return desc;
        },

        isNp: function() {
            var self = DeliveryType, getDeliveryName;

            getDeliveryName = Delivery.getDeliveryName();

            return self._isNp(getDeliveryName);
        },
        isFree: function() {
            var self = DeliveryType, getDeliveryName;

            getDeliveryName = Delivery.getDeliveryName();

            return self._isFree(getDeliveryName);
        },
        _isNp: function(name) {
            return name && name.toLowerCase().indexOf('нова пошта') > -1;
        },

        _isFree: function(name) {
            return name && (name.toLowerCase().indexOf('безкоштовн') > -1 || name.toLowerCase().trim() === 'нова пошта');
        }
    };

    /**
     * Right sidebar
     * @constructor
     */
    var SideBar = function(chkDelivery) {
        this.chkDelivery = chkDelivery;
        this.setDeliveryBlock();
    };
    SideBar.prototype.setDeliveryBlock = function() {
        this.delieryBlock = $('.sidebar__content .total-line--shipping');
        this.summarySection = $('.sidebar__content .order-summary__sections');
    };
    SideBar.prototype.setPaidDeliveryInfo = function() {
        if(this.summarySection.find('[data-id="paidSummaryInfo"]').length == 0) {
        }
    };
    SideBar.prototype.fixDeliveryInfo = function() {
        var amountDesc;

        this.setDeliveryBlock();

        amountDesc = Delivery.getAmountDesc();
        if(!amountDesc || Shopify.Checkout.step === 'contact_information') {
            this.delieryBlock.hide();
        } else {
            this.delieryBlock.find('[data-checkout-total-shipping-target]').text(amountDesc);
            this.delieryBlock.show();
        }

        this.setPaidDeliveryInfo();

        return this;
    };


    /**
     * Shipping page
     * @constructor
     */
    // var ShippingPage = function(chkDelivery) {
    //     this.chkDelivery = chkDelivery;
    //     this.methodCont = $('.section__content');
    //
    //     this.methods = this.methodCont.find('input[name="checkout\\[shipping_rate\\]\\[id\\]"]');
    //
    // };
    // ShippingPage.prototype.run = function() {
    //     this.methods.bind('change', this, this._onShippingMethodChange);
    //
    //     this.methodCont.find('.radio__label__accessory').hide();
    //
    //     this._updShippingMethodInfo();
    // };
    // ShippingPage.prototype._onShippingMethodChange = function(event) {
    //     var self = event.data;
    //
    //     self._updShippingMethodInfo();
    // };
    // ShippingPage.prototype._updShippingMethodInfo = function() {
    //     var span, radio, methodDesc;
    //
    //     if(typeof CheckoutBonusPrice !== 'undefined' && CheckoutBonusPrice.getBonusTotalPrice()) {
    //         if(NpAddrStore.getDeliveryType() === NpAddrStore.deliveryIpost) {
    //             methodDesc = CheckoutDeliveryConf.amountDesc.ipost.freeFull;
    //         } else {
    //             methodDesc = CheckoutDeliveryConf.amountDesc.np.freeFull;
    //         }
    //
    //     } else {
    //         radio = this.methods.filter(':checked');
    //         span = $('.section__content label[for="' + radio.attr('id') + '"] [data-shipping-method-label-title]');
    //         methodDesc = $.trim(span.text());
    //     }
    //
    //     Delivery.setDeliveryName(methodDesc);
    //
    //     this.chkDelivery.sideBarBlock.fixDeliveryInfo();
    // };


    /**
     * ReviewBlock с информацией о доставке
     * @param chkDelivery
     * @constructor
     */
    var ReviewBlock = function(chkDelivery) {
        this.chkDelivery = chkDelivery;
        this.reviewCont = $('.content-box');
    };
    ReviewBlock.prototype.run = function() {
        var row, a, totalShipping, amountDesc;

        totalShipping = this.reviewCont.find('.total-line--shipping');

        a = this.reviewCont.find('a[href*="shipping_method"]');
        if(a.length) {
            row = a.closest('.review-block');
            row.find('.emphasis, .small-text').hide();
        } else {
            this.reviewCont.find('.emphasis').hide();
        }

        amountDesc = Delivery.getAmountDesc();
        if(!amountDesc) {
            totalShipping.hide();
        } else {
            totalShipping.find('.order-summary__emphasis').text(amountDesc);
            totalShipping.show();
        }

    };


    /**
     * Main class
     * @constructor
     */
    var CheckoutDelivery = function() {
        this.sideBarBlock = new SideBar(this);
        // this.shippingPage = new ShippingPage(this);
        this.reviewBlock = new ReviewBlock(this);
    };
    CheckoutDelivery.prototype.run = function() {
        var self = this;
        this._setHtmlChangeListener();

        switch(Shopify.Checkout.step) {
            // case 'shipping_method': setTimeout(function() {self.shippingPage.run();}, 500); break;
        }

        this.reviewBlock.run();
    };
    CheckoutDelivery.prototype._setHtmlChangeListener = function() {
        var self = this;

        setInterval(function() {
            self.sideBarBlock.fixDeliveryInfo();
        }, 200);
    };


    /**
     * Run all
     */
    if(global.CheckoutDeliveryConf) {
        (new CheckoutDelivery()).run();
    }

    return {
        Delivery: Delivery
    };
})(jQuery, this);