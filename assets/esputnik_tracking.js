;var EsTracking = (function($, global) {
    var P = {
        STEP_REVIEW: 'review',
        STEP_THANKYOU: 'thank_you',

        _init: function() {
            var self = P, timer;

            if(global.ESConf) {
                timer = setInterval(function() {
                    if(typeof _sc !== 'undefined') {
                        clearInterval(timer);

                        self._onScLoaded();

                    }
                }, 150);
            }
        },

        _onScLoaded: function() {
            var self = P;

            if(global.ESConf.requestPage === global.ESConf.PAGE_TYPE_CART) {
                self._initCartEvents();
            } else if(Shopify.Checkout) {
                self._initCheckoutEvents();
            }
        },

        _initCartEvents: function () {
            var self = P;

            self._trackCart();
        },

        _initCheckoutEvents: function() {
            var self = P;

            self._trackCheckout();
        },

        onCartChange: function() {
            var self = P;

            self._trackCart();
        },

        _trackCart: function() {
            var self = P;

            self._buildCartItems(function (cartItems) {
                var trackData;

                trackData = {
                    StatusCart: cartItems
                };

                _sc.sendEvent('StatusCart', trackData);

                console.log('es_tracking', trackData);
            });
        },

        _trackCheckout: function() {
            var self = P, cartItems, trackData;

            if(Shopify.Checkout.step === self.STEP_REVIEW) {
                self._storeCartToSession();
            } else if(Shopify.Checkout.step === self.STEP_THANKYOU) {
                cartItems = self._getCartFromSession();
                if(cartItems) {
                    trackData = {
                        OrderNumber: global.ESConf.orderName,
                        PurchasedItems: cartItems
                    };

                    _sc.sendEvent('PurchasedItems', trackData);

                    console.log('es_tracking', trackData);
                }
            }
        },

        _storeCartToSession: function() {
            var self = P;

            self._buildCartItems(function (cartItems) {
                sessionStorage.setItem('es_cart', JSON.stringify(cartItems));
            });
        },

        _getCartFromSession: function() {
            var self = P, cart = false, _cart;

            try {
                _cart = sessionStorage.getItem('es_cart');
                cart = JSON.parse(_cart);
            } catch (e) {console.log(e);}

            return cart;
        },

        _buildCartItems: function (callback) {
            var self = P, items = [];

            jQuery.getJSON('/cart.js', function(cart) {
                $.each(cart.items, function(key, item) {
                    var _item;

                    _item = {
                        productKey: item.variant_id,
                        price: (item.price / 100),
                        quantity: item.quantity,
                        currency: 'UAH'
                    };

                    items.push(_item);
                });

                callback(items);
            });
        }
    };

    $(document).ready(P._init);

    return {
        onCartChange: P.onCartChange
    }
})(jQuery, this);