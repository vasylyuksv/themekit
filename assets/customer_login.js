// Login validate
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function validatePhone(phone) {
    var re = /^(\+\d{3})?\d{9}$/;
    return re.test(phone.replace(/\s+/g, ''));
}

let originalForm = $('#customer_login');
let originalEmail = originalForm.find('#CustomerEmail');
let originalPass = originalForm.find('#CustomerPasswordOth');

let fdForm = $('#accountLogin');
let fdEmail = fdForm.find('.fd-email');
let fdPass = fdForm.find('.fd-password');

fdForm.submit(function () {
    var errClass = 'input--error', $errBox;

    $errBox = fdForm.find('#snAuthError');

    $errBox.hide();

    fdEmail.removeClass(errClass);
    fdPass.removeClass(errClass);

    if(!fdEmail.val() || !fdPass.val()) {

        if(!fdEmail.val()) {
            fdEmail.addClass(errClass);
            window.GTM.unsuccessfulLoginEvent(['Email/Phone'])
        }

        if(!fdPass.val()) {
            fdPass.addClass(errClass);
            window.GTM.unsuccessfulLoginEvent(['Password'])

        }

    } else {

        if (validateEmail(fdEmail.val())) {
            test(fdEmail.val(), fdPass.val())
        } else if (validatePhone(fdEmail.val())) {
            $.ajax({
                type: 'POST',
                url: LoginConf.urlLoginPhone,
                data: JSON.stringify({
                    "phone": fdEmail.val()
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if(data.response) {
                        test(data.data.email, fdPass.val())
                    } else {
                        window.GTM.unsuccessfulLoginEvent(['Phone'])
                        $errBox.text(data.message).show();
                    }
                },
                error: function (data) {
                    $errBox.html('Внутрішня помилка сервера, спробуйте ще раз.').show();
                    window.GTM.unsuccessfulLoginEvent(['Phone','Server']);

                    console.log('Sorry, internal server error!');
                    console.log(data);
                },
            });
        } else {
            window.GTM.unsuccessfulLoginEvent(['Email/Phone']);
            $errBox.html('Некоректний email або пароль.').show();
        }

    }

    return false;
});

function test(email, pass) {
    originalEmail.val(email);
    originalPass.val(pass);
    setTimeout(function(){
        $('#customer_login').trigger('submit');
    }, 100);
}

if(originalForm.find('.form-message').length) {
    fdForm.find('#snAuthError').html(originalForm.find('.form-message').find('.errors ul li').first().text()).show();
}