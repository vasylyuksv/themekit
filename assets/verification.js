$(document).ready(function() {


    // Get url params
    $.urlParam = function (name) {
        var results = new RegExp('[\?&]' + name + '=([^&#]*)')
            .exec(window.location.search);

        return (results !== null) ? results[1] || 0 : false;
    }

    $('#customer_id').val($.urlParam('customerId'));

    $('#phone-verification-form').submit(function() {
        var form = $(this), errBlock, code,
            errClass = 'input--error';

        errBlock = $('#codeError').hide();
        code = $('#phone_verification');

        code.removeClass(errClass);

        if(code.val()) {
            form.find(':input').attr('disabled', true);

            $.ajax({
                type: 'POST',
                url: PhoneVerConf.url,
                data: JSON.stringify({
                    code: code.val(),
                    id: $.urlParam('customerId')
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if(data.response) {
                        $(location).attr('href', data.data.activation_url);
                    } else {
                        window.GTM.unsuccessfulRegistrationEvent(['response','phone_verification',data.code]);
                        errBlock.text((data.message ? data.message : PhoneVerConf.msg.errTryAgain)).show();
                        code.addClass(errClass);
                    }

                    form.find(':input').attr('disabled', false);
                },
                error: function() {
                    window.GTM.unsuccessfulRegistrationEvent(['request','phone_verification']);
                    errBlock.text(PhoneVerConf.msg.errTryAgain).show();
                    form.find(':input').attr('disabled', false);
                    code.addClass(errClass);
                }
            });

        } else {
            window.GTM.unsuccessfulRegistrationEvent(['phone_verification']);
            errBlock.text(PhoneVerConf.msg.required).show();
            code.addClass(errClass);
        }

        return false;
    });
});
