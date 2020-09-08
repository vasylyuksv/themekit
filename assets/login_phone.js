;var LoginSmsForm = (function($, global) {
    var P = {
        _init: function () {
            var self = P;

            self.$form = $('#confirmSmsForm');
            self.$loginSms = $('#loginSms').keyup(self._onSmsKeyUp);
            self.$smsError = $('#smsError');
            self.$resendSmsLnk = $('#resendSmsLnk').click(self._onResendSms);
            self.$loginSmsBtn = $('#loginSmsBtn').click(self._onConfirmSms);

        },

        _onSmsKeyUp: function(event) {
            var self = P;

            if(event.keyCode == 13) {
                self._onConfirmSms();
            }

        },

        _onConfirmSms: function() {
            var self = P, isValid = true;

            self.$smsError.hide();
            if(!$.trim(self.$loginSms.val())) {
                isValid = false;
                self.$smsError.text(global.LoginPhone.msg.required).show();
            }

            if(isValid) {
                self._confirmSms();
            }
        },

        _confirmSms: function() {
            var self = P, reqData;

            self.$loginSms.attr('disabled', true);
            self.$loginSmsBtn.attr('disabled', true);
            self.$smsError.hide();

            reqData = {
                customer_id: SendSmsForm.getCustomerId(),
                code: $.trim(self.$loginSms.val()),
                cart_items: global.LoginPhone.cartItemsCount
            };

            $.ajax({
                url: global.LoginPhone.urlSmsConfirm,
                data: reqData,
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if(data.response) {
                        SendSmsForm.markCodeUsed();
                        $(location).attr('href', data.data.loginUrl);
                    } else {
                        self.$smsError.text(data.validationMessages[0].message).show();
                    }
                },
                error: function () {
                    self.$smsError.text(global.LoginPhone.msg.tryAgain).show();
                },
                complete: function () {
                    self.$loginSms.attr('disabled', false);
                    self.$loginSmsBtn.attr('disabled', false);
                }
            });
        },

        _onResendSms: function () {
            var self = P;

            self.hide();
            SendSmsForm.show();

            return false;
        },

        show: function () {
            var self = P;

            self.$form.show();
        },

        hide: function () {
            var self = P;

            self.$form.hide();
            self.$smsError.hide();
        }
    };

    $(document).ready(P._init);

    return {
        show: P.show,
        hide: P.hide
    };
})(jQuery, this);




;var SendSmsForm = (function($, global) {
    var P = {
        STORE_KEY: 'login_phone_data',

        _init: function() {
            var self = P;

            self.$form = $('#sendSmsForm');
            self.$phone = $('#loginPhone');
            self.$phone.inputmask('+38(099)-999-99-99', { 'placeholder': '+38(0__)-___-__-___' });
            self.$phone.keyup(self._onPhoneKeyUp);
            self.$sendSmsBtn = $('#sendSmsBtn').click(self._onSendSms);
            self.$phoneError = $('#phoneError');

            self._restoreData();
            self._setFormsVisbility();
        },

        _onPhoneKeyUp: function(event) {
            var self = P;

            if(event.keyCode == 13) {
                self._onSendSms();
            }
        },

        _onSendSms: function () {
            var self = P, phoneRe = /^\+38\(0\d{2}\)\-\d{3}\-\d{2}\-\d{2}$/, isValid = true;

            self.$phoneError.hide();
            if(!phoneRe.test(self.$phone.val())) {
                isValid = false;
                self.$phoneError.text(global.LoginPhone.msg.incorrectPhone).show();
            }

            if(isValid) {
                self._sendSms();
            }
        },

        _sendSms: function () {
            var self = P;

            self.$phone.attr('disabled', true);
            self.$sendSmsBtn.attr('disabled', true);
            self.$phoneError.hide();

            $.ajax({
                url: global.LoginPhone.urlSms,
                data: {phone: self.$phone.val()},
                type: 'post',
                dataType: 'json',
                success: function (data) {
                    if(data.response) {
                        self._savePhone2Store(data.data.customer_id);

                        self.hide();
                        LoginSmsForm.show();
                    } else {
                        self.$phoneError.text(data.validationMessages[0].message).show();
                    }
                },
                error: function () {
                    self.$phoneError.text(global.LoginPhone.msg.tryAgain).show();
                },
                complete: function () {
                    self.$phone.attr('disabled', false);
                    self.$sendSmsBtn.attr('disabled', false);
                }
            });
        },

        _savePhone2Store: function (dbCustomerId) {
            var self = P, data;

            self._setStoreData({
                phone: self.$phone.val(),
                customer_id: dbCustomerId,
                time: (new Date()).getTime()
            });
        },

        _setStoreData: function(data) {
            var self = P;

            data = JSON.stringify(data);

            localStorage.setItem(self.STORE_KEY, data);
        },

        _getStoreData: function () {
            var self = P, _data, data = false;

            try {
                _data = localStorage.getItem(self.STORE_KEY);
                if(_data) {
                    data = JSON.parse(_data);
                }
            } catch (e) {}

            return data;
        },

        _restoreData: function() {
            var self = P, data;

            data = self._getStoreData();
            if(data) {
                self.$phone.val(data.phone);
            }
        },

        _setFormsVisbility: function() {
            var self = P, data;

            data = self._getStoreData();
            if(data) {
                if((new Date()).getTime() - data.time < 60 * 5 * 1000) {
                    self.hide();
                    LoginSmsForm.show();
                }
            }
        },

        markCodeUsed: function() {
            var self = P, data;

            data = self._getStoreData();
            if(data) {
                data.time = 0;
                self._setStoreData(data);
            }
        },

        getCustomerId: function() {
            var self = P, data, customerId = false;

            data = self._getStoreData();
            if(data) {
                customerId = data.customer_id;
            }

            return customerId;
        },

        show: function () {
            var self = P;

            P.$form.show();
        },

        hide: function () {
            var self = P;

            P.$form.hide();
        }
    };

    $(document).ready(P._init);

    return {
        show: P.show,
        hide: P.hide,
        getCustomerId: P.getCustomerId,
        markCodeUsed: P.markCodeUsed
    };
})(jQuery, this);