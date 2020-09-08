;(function ($, global) {
    var P = {
        _init: function () {
            var self = P;

            self.$form = $('#recoverForm').submit(self._onFormSubmit);
            self.$email = $('#RecoverEmail');
            self.$phone = $('#recoverPhone');

            self.$emailErr = $('#recoverEmailErr').hide();
            self.$phoneErr = $('#recoverPhoneErr').hide();

            self.$successBox = $('#ResetSuccess');

            self.errClass = 'input--error';

            self.bReturn = true;
        },

        _onFormSubmit: function() {
            var self = P, bReturn = true, phoneRe = /^\+38\(0\d{2}\)\-\d{3}\-\d{2}\-\d{2}$/;

            self.$phone.removeClass(self.errClass);
            self.$email.removeClass(self.errClass);

            if(!self.$phone.val() && !self.$email.val()) {
                self.$phone.addClass(self.errClass);
                self.$email.addClass(self.errClass);
                window.GTM.unsuccessfulPasswordRecoveryEvent(['phone','email'])

                return false;
            }

            if(self.$phone.val()) {
                self.bReturn = false;

                if(!self.$phone.attr('disabled')) {
                    if(!phoneRe.test(self.$phone.val())) {
                        self.$phoneErr.text(LoginConf.msg.incorrectPhone).show();
                        self.$phone.addClass(self.errClass);
                        window.GTM.unsuccessfulPasswordRecoveryEvent(['phone'])
                    } else {
                      
                      	self.$form.find('[type="submit"]').attr('disabled', true);

                        $.ajax({
                            url: LoginConf.urlRecover,
                            data: JSON.stringify({
                                phone: self.$phone.val()
                            }),
                            contentType: "application/json; charset=utf-8",
                            dataType: 'json',
                            type: 'post',
                            success: function (data) {
                                var urlConfirmRecover;

                                if(data.response) {
                                    urlConfirmRecover = LoginConf.urlConfirmRecover +
                                        '?id=' + data.data.id + '&pass=' + data.data.input_password;

                                    $(location).attr('href', urlConfirmRecover);
                                } else {
                                    self.$phoneErr.html((data.message ? data.message : LoginConf.msg.tryAgain)).show();
                                    self.$phone.addClass(self.errClass);
                                    window.GTM.unsuccessfulPasswordRecoveryEvent(['server',data.code])
                                    self.$phone.attr('disabled', false);
                                }
                            },
                            error: function () {
                                self.$phoneErr.text(LoginConf.msg.tryAgain).show();
                                self.$phone.attr('disabled', false);
                                self.$phone.addClass(self.errClass);
                                window.GTM.unsuccessfulPasswordRecoveryEvent(['server'])
                            },
                            complete: function() {
                                self.$form.find('[type="submit"]').attr('disabled', false);
                            }
                        });
                    }
                }
            } else {
                self.bReturn = true;
            }



            return self.bReturn;
        }
    }

    $(document).ready(P._init);
})(jQuery, this);