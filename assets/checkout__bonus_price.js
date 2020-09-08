;var CheckoutBonusPrice = (function($, global) {
    var BonusPrice = {
        STEP_THANKYOU: 'thank_you',
        TOTAL_BONUS_KEY: 'total_bonus',

        _init: function() {
            var self = BonusPrice;

            self._getCart();
            self._getProductPrice();
        },

        _getCart: function() {
            var self = BonusPrice;

            jQuery.getJSON('/cart.js', function(cart) {
                self.cart = cart;

                self._onReady();
            });
        },

        _getProductPrice: function() {
            var self = BonusPrice;
            
            jQuery.get('/pages/product-bonus-price', function(data) {
                self.productPrice = JSON.parse(data);

                self._onReady();
            });
        },

        _onReady: function() {
            var self = BonusPrice;

            if(self.productPrice && self.cart) {
                self._calculateCartPrices();

                setInterval(function() {
                    self._showPrices();
                }, 200);
            }
        },

        _showPrices: function() {
            var self = BonusPrice;

            if($('[data-bonus-price]').length == 0) {
                self._showTotalPrice();
                self._showProductPrice();
            }
        },

        _calculateCartPrices: function() {
            var self = BonusPrice, totalPrice = 0;

            $.each(self.cart.items, function(key, item) {
                var _price;

                _price = self._findPriceByProductId(item.product_id);
                if(_price > 0) {
                    _price *= item.quantity;

                    totalPrice += _price;
                }

                item.bonusPrice = _price;
            });

            if (Shopify.Checkout.step !== self.STEP_THANKYOU) {
                self.bonusTotalPrice = totalPrice;
                sessionStorage.setItem(self.TOTAL_BONUS_KEY, totalPrice);
            } else {
                self.bonusTotalPrice = sessionStorage.getItem(self.TOTAL_BONUS_KEY);
            }
        },

        _findPriceByProductId: function(productId) {
            var self = BonusPrice, price = -1;

            $.each(self.productPrice, function(key, values) {
                var prodId, prodPrice;

                prodId = values[0];
                prodPrice = values[1];

                if(productId == prodId) {
                    price = prodPrice;
                    return false;
                }
            });

            return price;
        },

        _showTotalPrice: function() {
            var self = BonusPrice, $subtotal, $total;

            $subtotal = $('[data-checkout-subtotal-price-target]');
            $total = $('[data-checkout-payment-due-target]');

            if(self.bonusTotalPrice) {
                $subtotal.html($subtotal.html() + '<br />' + self._getTotalBonusHtml());
                $total.html($total.html() + '<br />' + self._getTotalBonusHtml());
            }
        },

        _showProductPrice: function() {
            var self = BonusPrice;

            $('.order-summary__section__content [data-product-id]').each(function() {
                var elem = $(this), productId, productItem, $price;

                productId = elem.attr('data-product-id');
                productItem = self._findItemInCart(productId);

                if(productItem) {
                    $price = elem.find('.product__price .order-summary__emphasis');

                    if(productItem.bonusPrice > 0) {
                        $price.html($price.html() + '<br />' + self._getProductBonusHtml(productItem.bonusPrice));
                    }
                }
            });
        },

        _findItemInCart: function(productId) {
            var self = BonusPrice, productItem = false;

            $.each(self.cart.items, function(key, item) {
                if(item.product_id == productId) {
                    productItem = item;
                    return false;
                }
            });

            return productItem;
        },

        _getTotalBonusHtml: function() {
            var self = BonusPrice;

            return '<span class="total-bonus-price" data-bonus-price>' + self.bonusTotalPrice + ' ' + global.CheckoutConf.msg.bonuses + '</span>';
        },

        _getProductBonusHtml: function(productPrice) {
            var self = BonusPrice;

            return '<span class="product-bonus-price" data-bonus-price>' + productPrice + ' ' + global.CheckoutConf.msg.bonuses + '</span>';
        }
    };
    BonusPrice._init();

    return {
        getBonusTotalPrice: function() {
            var price;

            price = sessionStorage.getItem(BonusPrice.TOTAL_BONUS_KEY);
            price = Number(price);

            return price;
        }
    };

})(jQuery, this);