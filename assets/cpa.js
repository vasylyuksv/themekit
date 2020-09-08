var Cpa = (function($, global) {
    var P = {
        cookieName: '__cpa_',

        _init: function () {
            var self = P;

            self._setCpaCookie();
            self._processOrderComplete();
        },

        _setCpaCookie: function() {
            var self = P, urlParams, utmSource, sAuid, cookieData, affId, affSub;

            urlParams = new URLSearchParams(window.location.search);
            utmSource = urlParams.get('utm_source');
            sAuid = urlParams.get('SAuid');
            affId = urlParams.get('aff_id');
            affSub = urlParams.get('aff_sub');

            if(utmSource) {
                cookieData = JSON.stringify({
                    utm_source: utmSource,
                    SAuid: sAuid,
                    aff_id: affId,
                    aff_sub: affSub
                });

                document.cookie = self.cookieName + '=' + cookieData + ';expires=;path=/';
            }
        },

        _processOrderComplete: function() {
            var self = P, cookie;

            cookie = self._getCookie(self.cookieName);

            if(cookie && Shopify.Checkout && Shopify.Checkout.step === 'thank_you') {

                $.ajax({
                    url: CheckoutConf.url.processCpa,
                    type: 'post',
                    data: {
                        token: Shopify.Checkout.token,
                        cpa: cookie
                    }
                });
            }
        },
        
        onTestDriveSubmit: function () {
            var self = P, cpaInp, cookie;

            cpaInp = $('#cpaInp');
            cookie = self._getCookie(self.cookieName);

            if(cookie) {
                try {
                    JSON.parse(cookie);
                    cpaInp.val(cookie);
                } catch (e) {
                    console.log('Cpa: ' + e);
                }
            }
        },

        _getCookie: function(name) {
            var self = P, cookies, parts, cookie = false;

            cookies = "; " + document.cookie;
            parts = cookies.split("; " + name + "=");

            if (parts.length == 2) {
                cookie = parts.pop().split(";").shift();
            }

            return cookie;
        }
    };

    if($) {
      P._init();
    } else {
      setTimeout(P._init, 1000);
    }
  

    return {
        onTestDriveSubmit: P.onTestDriveSubmit
    };

})(jQuery, this);