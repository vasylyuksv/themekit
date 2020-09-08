;(function(global) {
    var P = {
        _init: function () {
            var self = P;

            self.$bntAllProducts = $('[data-id="all_bonus_product"]').bind('click', {all: true}, self._onShowProducts);
            self.$btnAllowedProducts = $('[data-id="allow_bonus_product"]').bind('click', {all: false}, self._onShowProducts);
            self.$products = $('[data-allowbuy]');

            if(self.$products.filter('[data-allowbuy="1"]').length == 0) {
                self.$bntAllProducts.hide();
                self.$btnAllowedProducts.hide();
            }
        },

        _onShowProducts: function (event) {
            var self = P;

            self.$bntAllProducts.removeClass('active');
            self.$btnAllowedProducts.removeClass('active');

            if(event.data.all) {
                self.$bntAllProducts.addClass('active');
                self.$products.show();
            } else {
                self.$products.filter('[data-allowbuy="0"]').hide();
                self.$btnAllowedProducts.addClass('active');
            }

            console.log(event.data);

            return false;
        }
    };

    $(document).ready(P._init);
})(this);