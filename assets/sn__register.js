;(function() {
    var Form = {
        _init: function () {
            var self = Form;

            self.$firstName = $('#first_name');
            self.$lastName = $('#last_name');
            self.$email = $('#email');
            self.$birtDate = $('#date_birthday');
            self.$fbId = $('#fbId');
            self.$googleId = $('#googleId');
        }
    };

    var Fb = {
        _init: function () {
            var self = Fb;

            self.$loginBtn = $('#fbReg').click(self._onFbLogin);
        },

        _onFbLogin: function () {
            var self = Fb;

            FB.login(function(response) {
                if (response.status === 'connected') {
                    FB.api('/me', {fields: 'first_name,last_name,email,birthday'}, function(response) {
                            self._fillRegForm(response);
                    });
                }
            }, {scope: 'email'}); // user_birthday

            return false;
        },

        _fillRegForm: function(fbMe) {
            var self = Fb;

            Form.$firstName.val(fbMe.first_name);
            Form.$lastName.val(fbMe.last_name);
            Form.$email.val(fbMe.email);
            Form.$fbId.val(fbMe.id);
        },
    };

    var Google = {
        _init: function() {
            var self = Google;

            self.$loginBtn = $('#googleReg');

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
                    self._fillRegForm(googleUser)
                },
                function(error) {
                    console.log('error', error);
                }
            );
        },

        _fillRegForm: function(googleUser) {
            var self = Google, profile;

            profile = googleUser.getBasicProfile();

            Form.$firstName.val(profile.getGivenName());
            Form.$lastName.val(profile.getFamilyName());
            Form.$email.val(profile.getEmail());
            Form.$googleId.val(profile.getId());
        }
    };

    $(document).ready(function() {
        Fb._init();
        Form._init();
        Google._init();
    });
})(jQuery, this);