/**
 * Birthdate validation
 * @param {object} $
 * @param {objecr} global
 * @returns {undefined}
 */
;(function ($, global) {
    var C = {
        _init: function () {
            var self = C;

            if (typeof global.ConfValidation != 'undefined') {

                var conf = global.ConfValidation;

                self.errClass = 'input--error';

                self.form = $(conf.formId);
                self.birthdate = $(conf.birthdateId);
                self.birthdateErr = $(conf.errorFieldId);

                self.firstName = $(conf.firstNameId);
                self.lastName = $(conf.lastNameId);
                self.firstNameError = $(conf.firstNameError);
                self.lastNameError = $(conf.lastNameError);
                self.$fbId = $('#fbId');
                self.$googleId = $('#googleId');

                self.email = $(conf.email);
                self.emailError = $(conf.emailError);

                self.phone = $(conf.phoneId);
                self.phoneError = $(conf.phoneError);

                self.agree = $('#customer_agreement');
                self.agreeError = $('#agreement-err');

                self.form.submit(self._addValidationRules);
            }

        },
        _addValidationRules: function (e) {
            var self = C, hasError = false, errorFields = [];

            // e.preventDefault();

            self.birthdateErr.hide();
            self.birthdate.removeClass(self.errClass);

            // birthdate validation
            if (self.birthdate.val().length > 0) {

                var birthdateValue = self.birthdate.val().split('/'),
                    fullYear, month, day, msg = '';

                self.birthdateErr.empty();

                fullYear = birthdateValue[2] || null;
                month = (!!birthdateValue[1]) ? birthdateValue[1] - 1 : 0; // correct start month num
                day = birthdateValue[0] || null;

                var birthdate = new Date(fullYear, month, day),
                    age,
                    birthDateTimestamp,
                    dateRegExp,
                    dateRangeStart = new Date('1939', '00', '01'),
                    dateRange = false,
                    birthDateDay,
                    correctDayInt;

                dateRegExp = /^\d{2}\/\d{2}\/\d{4}$/;

                birthdateValue = birthdateValue.join('/');

                birthDateTimestamp = Math.abs(birthdate.getTime());

                // correct date if year is leap
                if (birthdate.getFullYear() % 400 == 0) {
                    correctDayInt = parseInt(birthdate.getDate());
                    birthdate.setDate(correctDayInt <= 1 ? 1 : correctDayInt - 1);
                    birthDateDay = day = birthdate.getDate();
                } else {
                    birthDateDay = birthdate.getDate();
                }

                if (birthdate instanceof Date && (birthDateDay == day && birthdate.getMonth() == month && birthdate.getFullYear() == fullYear) && dateRegExp.test(birthdateValue)) {

                    age = self.calculateAge(birthdate);

                    if (birthdate.getTime() > Date.now()) {
                        hasError = true;
                        msg = global.ConfValidation.msg.wrongDate;
                    } else if (parseInt(age) < 18) {
                        hasError = true;
                        msg = global.ConfValidation.msg.tooYoung;
                    } else {

                        //check time range
                        if (birthDateTimestamp <= Math.abs(dateRangeStart.getTime())) {
                            dateRange = true;
                        } else {
                            hasError = true;
                            msg = global.ConfValidation.msg.wrongDate;
                        }
                    }
                } else {
                    //invalid date
                    hasError = true;
                    msg = global.ConfValidation.msg.wrongDate;
                }

                if (hasError) {
                    errorFields.push('Birthdate');
                    self.birthdateErr.text(msg).show();
                    self.birthdate.addClass(self.errClass);
                }
            } else {
                hasError = true;
                errorFields.push('Birthdate');
                self.birthdateErr.text(ConfValidation.msg.required).show();
                self.birthdate.addClass(self.errClass);
            }

            if (!self._validateFirstName()) {
                hasError = true;
                errorFields.push('FirstName');
            }

            if (!self._valudateLastName()) {
                hasError = true;
                errorFields.push('LastName');
            }

            if (!self._validateEmail()) {
                hasError = true;
                errorFields.push('Email');
            }

            if (!self._validatePhone()) {
                hasError = true;
                errorFields.push('Phone');
            }

            if (!self._validateAgree()) {
                hasError = true;
                errorFields.push('Agree');
            }

            if (!hasError) {
                self._submitForm();
            }
            if (errorFields.length > 0) {
                window.GTM.unsuccessfulRegistrationEvent(errorFields);
            }
            return false;
        },

        _submitForm: function () {
            var self = C, errorBox;

            errorBox = $('#errBox').hide();

            self.form.find(':input').attr('disabled', true);

            $.ajax({
                url: ConfValidation.urlLoginPhone,
                data: JSON.stringify({
                    first_name: self.firstName.val(),
                    last_name: self.lastName.val(),
                    phone: self.phone.val(),
                    email: self.email.val(),
                    date_birthday: self.birthdate.val(),
                    customer_agreement: '1',
                    fb_id: self.$fbId.val(),
                    google_id: self.$googleId.val()
                }),
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                type: 'post',
                success: function (response) {
                    var msg = ConfValidation.msg.tryAgain, msgArr = [], urlConfirmPhone;

                    if (response.data.customerId) {
                        urlConfirmPhone = ConfValidation.urlConfirmPhone.replace('{id}', response.data.customerId);

                        $(location).attr('href', urlConfirmPhone);
                    } else {
                        window.GTM.unsuccessfulRegistrationEvent(['response', 'form1', response.message]);
                        errorBox.html((response.message ? response.message : msg)).show();
                    }

                    self.form.find(':input').attr('disabled', false);
                },
                error: function (xhr, status, error) {
                    window.GTM.unsuccessfulRegistrationEvent(['request', 'form1']);
                    errorBox.text(ConfValidation.msg.tryAgain).show();
                    self.form.find(':input').attr('disabled', false);
                }
            });
        },

        _validateEmail: function () {
            var self = C, re, isValid = true;

            re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            self.emailError.hide();
            self.email.removeClass(self.errClass);

            if (self.email.val()) {
                if (!re.test(self.email.val())) {
                    self.emailError.text(ConfValidation.msg.wrongEmail).show();
                    self.email.addClass(self.errClass);
                    isValid = false;
                }
            } else {
                self.emailError.text(ConfValidation.msg.required).show();
                self.email.addClass(self.errClass);
                isValid = false;
            }

            return isValid;
        },

        _validatePhone: function () {
            var self = C, re, isValid = true;

            re = /^\+38\(0\d{2}\)\-\d{3}\-\d{2}\-\d{2}$/;

            self.phoneError.hide();
            self.phone.removeClass(self.errClass);

            if (self.phone.val()) {
                if (!re.test(self.phone.val())) {
                    self.phoneError.text(ConfValidation.msg.wrongPhone).show();
                    self.phone.addClass(self.errClass);
                    isValid = false;
                }
            } else {
                self.phoneError.text(ConfValidation.msg.required).show();
                self.phone.addClass(self.errClass);
                isValid = false;
            }

            return isValid;
        },

        _validateAgree: function () {
            var self = C, isValid = true;

            self.agree.removeClass(self.errClass);
            self.agreeError.hide();

            if (!self.agree.is(':checked')) {
                self.agree.addClass(self.errClass);
                self.agreeError.text(ConfValidation.msg.required).show();
                isValid = false;
            }

            return isValid;
        },

        calculateAge: function (birthday) {
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs);
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        },

        _validateFirstName: function () {
            var self = C, isValid = true;

            self.firstNameError.hide();
            self.firstName.removeClass(self.errClass);

            if (self.firstName.length > 0) {
                if (!self.firstName.val()) {
                    self.firstNameError.text(ConfValidation.msg.required).show();
                    isValid = false;
                    self.firstName.addClass(self.errClass);
                }
            }

            return isValid;
        },

        _valudateLastName: function () {
            var self = C, isValid = true;

            self.lastNameError.hide();
            self.lastName.removeClass(self.errClass);

            if (self.lastName.length > 0) {
                if (!self.lastName.val()) {
                    self.lastNameError.text(ConfValidation.msg.required).show();
                    self.lastName.addClass(self.errClass);
                    isValid = false;
                }
            }

            return isValid;
        }
    };

    $(document).ready(C._init);
})(jQuery, this)
