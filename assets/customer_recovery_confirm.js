;(function ($, global) {
    var P = {
        _init: function () {
            var self = P;

            self.$form = $('#passRecoverForm').submit(self._onFormSubmit);

            self.$code = $('#smsCode');
            self.$codeErr = $('#smsCodeErr').hide();

            self.$agree = $('#customer_agreement');
            self.$agreeErr = $('#agreementErr').hide();

            self.$pass = $('#pass');
            self.$passErr = $('#passErr');

            self.$passConf = $('#passConf');
            self.$passConfErr = $('#passConfErr').hide();

            self._setPassState();
        },

        _onFormSubmit: function () {
            var self = P, reqData;

            if (self._validate()) {
                self.$form.find(':input').attr('disabled', true);

                reqData = {
                    code: self.$code.val(),
                    id: self._urlParam('id')
                };

                if (self.$pass.is(':visible')) {
                    reqData.password = self.$pass.val();
                }

                if (self.$passConf.is(':visible')) {
                    reqData.password_confirmation = self.$passConf.val();
                }

                $.ajax({
                    url: RecoverConf.urlCheckCode,
                    data: JSON.stringify(reqData),
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json',
                    type: 'post',
                    success: function (data) {
                        if (data.response) {
                            sessionStorage.setItem('recovery-confirm','1');
                            if (data.data.activation_url) {
                                $(location).attr('href', data.data.activation_url);
                            } else {
                                $(location).attr('href', RecoverConf.urlLogin);
                            }
                        } else {
                            self.$codeErr.text((data.message ? data.message : RecoverConf.msg.tryAgain)).show();
                            window.GTM.unsuccessfulPasswordRecoveryEvent(['server',data.code]);
                            self.$form.find(':input').attr('disabled', false);
                        }
                    },
                    error: function () {
                        window.GTM.unsuccessfulPasswordRecoveryEvent(['server']);
                        self.$codeErr.text(RecoverConf.msg.tryAgain).show();
                        self.$form.find(':input').attr('disabled', false);
                    }
                });
            }


            return false;
        },

        _validate: function () {
            var self = P, isValid = true;

            self.$codeErr.hide();
            if (!self.$code.val()) {
                isValid = false;
                self.$codeErr.text(RecoverConf.msg.required).show();
                window.GTM.unsuccessfulPasswordRecoveryEvent(['code']);

            }

            self.$agreeErr.hide();
            // if(!self.$agree.is(':checked') && self._urlParam('pass') !== 'true') {
            //     isValid = false;
            //     self.$agreeErr.text(RecoverConf.msg.required).show();
            // }

            self.$passErr.hide();
            self.$passConfErr.hide();
            if (self.$pass.is(':visible')) {
                if (!self.$pass.val()) {
                    isValid = false;
                    self.$passErr.text(RecoverConf.msg.required).show();
                    window.GTM.unsuccessfulPasswordRecoveryEvent(['password'])

                } else if (self.$pass.val().length < 8) {
                    isValid = false;
                    self.$passErr.text(RecoverConf.msg.minPassLength).show();
                    window.GTM.unsuccessfulPasswordRecoveryEvent(['password'])
                }

                if (!self.$passConf.val()) {
                    isValid = false;
                    self.$passConfErr.text(RecoverConf.msg.required).show();
                    window.GTM.unsuccessfulPasswordRecoveryEvent(['password-confirm'])

                }

                if (self.$pass.val() && self.$passConf.val()) {
                    if (self.$pass.val() !== self.$passConf.val()) {
                        isValid = false;
                        self.$passConfErr.text(RecoverConf.msg.passNotEqual).show();
                        window.GTM.unsuccessfulPasswordRecoveryEvent(['password-confirm', 'password', 'not-equal'])

                    }
                }
            }


            return isValid;
        },

        _setPassState: function () {
            var self = P;

            $('.input--pass').show();
            $('.input-agree').hide();
        },

        _urlParam: function (name) {
            var self = P;

            var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                .exec(window.location.search);

            return (results !== null) ? results[1] || 0 : false;
        }
    };

    $(document).ready(P._init);
})(jQuery, this);