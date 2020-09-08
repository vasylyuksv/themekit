;(function($, global) {
    var P = {
        _init: function() {
            var self = P;

            if(Shopify.Checkout.step === 'thank_you') {
                self._process();
            }
        },

        _process: function() {
            var self = P;

            self._sendToRemoveServer();
            self._sendIpostToRemoteServer();
            NpAddrStore.clearSession();
        },

        _sendToRemoveServer: function() {
            var self = P, url, postData;

            url = global.CheckoutConf.url.setCheckout + '?' + $.param({shop_name: global.CheckoutConf.shopName});
            postData = NpAddrStore.getLocalStoreData();
            postData['checkout_token'] = Shopify.Checkout.token;

            $.ajax({
                url: url,
                type: 'post',
                dataType: 'json',
                data: JSON.stringify(postData),
                success: function success(data) {

                }
            });
        },

        _sendIpostToRemoteServer: function() {
            var self = P;

            if (NpAddrStore.getDeliveryType() === NpAddrStore.deliveryIpost) {
                IpostCheckout.sendFromSession();
            }
        }
    };

    $(document).ready(P._init);
})(jQuery, this);