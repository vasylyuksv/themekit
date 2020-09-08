;(function($, global) {
    var Account = {
        _init: function () {
            var self = Account;

            self.$snAccountBtnCont = $('#snAccountBtnCont');
            self.$fb = $('#fbAccount').click(self._onBindFb);
            self.$google = $('#googleAccount');
            self.$error = $('#snAccountError');

            self._checkAccountBind();

            gapi.load('auth2', function(){
                var _gapi = gapi.auth2.init({
                    client_id: SnConf.googleClientId,
                    cookiepolicy: 'single_host_origin'
                });

                _gapi.attachClickHandler(self.$google[0], {},
                    function(googleUser) {
                        var profile;

                        profile = googleUser.getBasicProfile();

                        self._onSnLogin(profile.getId(), 'google');
                    },
                    function(error) {
                        console.log('error', error);
                    }
                );
            });
        },

        _onBindFb: function() {
            var self = Account,
                elem = $(this);

            FB.login(function(response) {
                if (response.status === 'connected') {
                    FB.api('/me', function(response) {
                        self._onSnLogin(response.id, 'fb');
                    });
                }
            });

            return false;
        },

        _onSnLogin: function(snId, snType) {
            var self = Account, isFb;

            isFb = snType === 'fb';

            if(isFb) {
                self._showSnLoader(self.$fb);
            } else {
                self._showSnLoader(self.$google);
            }

            self.$error.hide();

            $.ajax({
                url: global.SnConf.url.accountBind,
                type: 'post',
                dataType: 'json',
                data: {
                    sn_type: snType,
                    sn_id: snId,
                    token: self.token,
                    customer_id: global.SnConf.customerId
                },
                success: function (data) {
                    if(data.success) {
                        self._processBindStatusResponse(data.bind_status);
                    } else {
                        self.$error.text(data.msg).show();
                      
                        if(isFb) {
                            self._hideSnLoader(self.$fb);
                        } else {
                            self._hideSnLoader(self.$google);
                        }
                    }
                },
                error: function () {
                    self.$error.text(global.SnConf.msg.errorLogin).show();

                    if(isFb) {
                        self._setFbState(self._isFbBind);
                    } else {
                        self._setGoogleState(self._isGoogleBind);
                    }
                }
            });
        },

        _showSnLoader: function($snBtn) {
            var self = Account, img;

            img = $('<img />', {src: global.SnConf.url.urlLoader, 'class': 'sn-preload'});

            $snBtn.find('[data-id="sn_state"]').html(img);
        },
      
        _hideSnLoader: function($snBtn) {
            var self = Account;

            $snBtn.find('[data-id="sn_state"]').html('');
        },

        _checkAccountBind: function() {
            var self = Account;

            self.$error.hide();

            $.ajax({
                url: global.SnConf.url.checkAccountBind,
                type: 'get',
                dataType: 'json',
                data: {customer_id: global.SnConf.customerId},
                success: function (data) {
                    self.$snAccountBtnCont.show();
                    self._processBindStatusResponse(data);
                },
                error: function () {
                    self.$error.text(global.SnConf.msg.errorGetBindStatus).show();
                    self.$snAccountBtnCont.hide();
                }
            });
        },

        _processBindStatusResponse: function(bindRes) {
            var self = Account;

            self._setFbState(bindRes.fb);
            self._setGoogleState(bindRes.google);
            self.token = bindRes.token;
        },

        _setFbState: function(isBind) {
            var self = Account;

            self._isFbBind = isBind;

            if(isBind) {
                self.$fb.find('[data-id="sn_state"]').text(global.SnConf.msg.accountBound);
            } else {
                self.$fb.find('[data-id="sn_state"]').text(global.SnConf.msg.bindAccount);
            }
        },

        _setGoogleState: function(isBind) {
            var self = Account;

            self._isGoogleBind = isBind;

            if(isBind) {
                self.$google.find('[data-id="sn_state"]').text(global.SnConf.msg.accountBound);
            } else {
                self.$google.find('[data-id="sn_state"]').text(global.SnConf.msg.bindAccount);
            }
        },
    };

    $(document).ready(Account._init);
})(jQuery, this);