;(function($, global) {
    var P = {
        _init: function() {
            var self = P;

            if(typeof CartConf !== 'undefined') {
                self.$freeShippingBlock = $('#freeShippingBlock').show();
                self.$carTotalBlock = $('[data-cart-subtotal]:first');

                self._setCartTotalChangeListener();
            }
          
        },

        _setCartTotalChangeListener: function() {
            var self = P;

            setInterval(self._onListenCartTotal, 300);
        },

        _onListenCartTotal: function () {
            var self = P, cartTotal, isFree;

            cartTotal = parseInt(self.$carTotalBlock.text().replace(/\D/g,''));
            isFree = cartTotal > CartConf.freeShippingPrice;

            self.$freeShippingBlock.find('[data-shipping-price]').text((isFree ? CartConf.msg.freeShipping : CartConf.msg.paidShipping));
        }
    };

    $(document).ready(P._init);

})(jQuery, this);

$(document).ready(function(){
  $(document).on('click', '.cart__qty-button', function(){
    var $this = $(this), cartQnty, qty;

    cartQnty = $(this).parent('.cart__qty').find('.cart__qty-input');
    qty = parseInt(cartQnty.val());

    if($(this).hasClass('qtyplus')) {
      qty++;
      console.log('plus');

    }else {
      if(qty >= 1) {
        qty--;
      }
    }
    //qty = (isNaN(qty))?1:qty;
    cartQnty.val(qty).trigger('change');

    return false;
  });
  
  $(function() {
    $('.clear-cart').on('click',function(e){
      e.preventDefault();
      $.ajax({
        type: "POST",
        url: '/cart/clear.js',
        success: function(){
          alert('I cleared the cart!');
        },
        dataType: 'json'
      });
    })
  });
});
