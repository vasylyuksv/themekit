var CartBonusesCheck = (function() {
    var P = {
        _init: function() {
            var self = P;

            if(typeof CartConf !== 'undefined') {
                self.$submitBtn = $('[name="checkout"]');
                self.$cartError = $('[data-cart-error-message-wrapper]');
                self.$form = $('[data-cart-form]').submit(self._onCartSubmit);
                self.$bonusBalance = $('[data-bonuses-balance]');

                self._getBalance(function() {
                    self.onPriceChange(CartConf.bonuses.orderSum);
                });
            }
        },

        _getBalance: function(callback) {
            var self = P;

            self.$submitBtn.attr('disabled', true);
            $.ajax({
                url: CartConf.bonuses.urlTransactions,
                dataType: 'json',
                type: 'post',
                data: JSON.stringify({
                    id: CartConf.customer.id,
                    email: CartConf.customer.email
                }),
                success: function(data) {
                    if(data.success) {
                        self.bonusBalance = data.data.summary.balance;

                        self.$bonusBalance.text(self.bonusBalance);

                        callback();
                    } else {
                        self.bonusBalance = CartConf.bonuses.balance;
                        callback();
                    }
                },
                error: function() {
                    self.bonusBalance = CartConf.bonuses.balance;
                    callback();
                },
                complete: function () {
                    self.$submitBtn.attr('disabled', false);
                }
            })
        },

        onPriceChange: function(orderSumBonuses) {
            var self = P;

            self.orderSumBonuses = orderSumBonuses;
            self._checkOrder(orderSumBonuses);

            console.log('bonus change', orderSumBonuses, self.bonusBalance);
        },

        _checkOrder: function() {
            var self = P, isValid = true;

            self.$cartError.addClass('hide');

            if(self.orderSumBonuses > self.bonusBalance) {
                isValid = false;
                self.$cartError.removeClass('hide').find('[data-cart-error-message]').text(CartConf.bonuses.msg.notEnoughBonuses);
            }

            return isValid;
        },

        _onCartSubmit: function() {
            var self = P;

            return self._checkOrder();
        }
    };

    $(document).ready(P._init);

    return {
        onPriceChange: P.onPriceChange
    };
})();