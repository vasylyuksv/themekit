;(function($, global) {
    var Login = {
        _init: function() {
            var self = Login;

            self.$errorBox = $('#snAuthError');
        },
        login: function(snId, snType) {
            var self = Login;

            self.$errorBox.hide();

            $.ajax({
                url: SnConf.url.authSn,
                data: {sn_id: snId, sn_type: snType, cart_item_count: SnConf.cartItemCount},
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    var errors = [];

                    if(data.loginUrl) {
                        $(location).attr('href', data.loginUrl);
                    } else {
                        $.each(data.errors, function(key, err) {
                            errors.push($("<div>").text(err).html())
                        });
                        self.$errorBox.html(errors.join('<br />')).show();
                    }
                },
                error: function () {
                    self.$errorBox.text(SnConf.msg.errorLogin).show();
                }
            });
        }
    };

    var Fb = {
        _init: function () {
            var self = Fb;

            self.$loginBtn = $('#fbAuth').click(self._onFbLogin);
        },

        _onFbLogin: function () {
            var self = Fb;

            FB.login(function(response) {
                if (response.status === 'connected') {
                    FB.api('/me', function(response) {
                        Login.login(response.id, 'fb');
                    });
                }
            });

            return false;
        }
    };

    var Google = {
        _init: function() {
            var self = Google;

            self.$loginBtn = $('#googleAuth');

            gapi.load('auth2', function(){
                self.auth2 = gapi.auth2.init({
                    client_id: SnConf.googleClientId,
                    cookiepolicy: 'single_host_origin'
                });

                self._attachSignin();
            });
        },

        _attachSignin: function() {
            var self = Google;

            self.auth2.attachClickHandler(self.$loginBtn[0], {},
                function(googleUser) {
                    var profile;

                    profile = googleUser.getBasicProfile();

                    Login.login(profile.getId(), 'google');
                },
                function(error) {
                    console.log('error', error);
                }
            );
        }
    };

    $(document).ready(function() {
        Login._init();
        Fb._init();
        Google._init();
    });

})(jQuery, this);