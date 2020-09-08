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
               var isFormSubmitted = false;
             
               self.form = $(conf.formId);
               self.birthdate = $(conf.birthdateId); 
               self.birthdateErr = $(conf.errorFieldId);

               self.firstName = $(conf.firstNameId);
               self.lastName = $(conf.lastNameId);
               self.email = $(conf.emailId);
               self.firstNameError = $(conf.firstNameError);
               self.lastNameError = $(conf.lastNameError);
               self.emailError = $(conf.emailError);

               if(conf.passwordId && conf.passwordError) {
                   self.password = $(conf.passwordId);
                   self.passwordError = $(conf.passwordError);
               }     
             
             
             	$(document).on('submit', self.form, function(e){
                  if (!self._addValidationRules()) e.preventDefault();
             	})
           }

        },
        _addValidationRules: function (e) {
            var self = C, hasError = false;
           
            self.birthdateErr.hide();
           
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
                    dateRangeStart = new Date('1939','00','01'),
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
                
               if (birthdate instanceof  Date && (birthDateDay == day && birthdate.getMonth() == month && birthdate.getFullYear() == fullYear) && dateRegExp.test(birthdateValue)) {
                                    
                    age = self.calculateAge(birthdate);
                    
                    if (birthdate.getTime() > Date.now()) {
                        hasError = true;
                        msg = global.ConfValidation.msg.wrongDate;
                    }else if (parseInt(age) < 18) {
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

                if(hasError) {
                    self.birthdateErr.text(msg).show();
                }
            } else {
                hasError = true;
                self.birthdateErr.text(ConfValidation.msg.required).show();
            }

            if(!self._validateFirstName()) {
                hasError = true;
            }

            if(!self._valudateLastName()) {
                hasError = true;
            }

            if(!self._validateEmail()) {
                hasError = true;
            }

            if(!self._validatePassword()) {
                hasError = true;
            }

            return !hasError;
        },

        _validatePassword: function() {
            var self = C, passVal, errorMsg= [], hasError = false, confMsg, ul, i,
                lengthRegex = new RegExp("^.{8,}"),
                lowLetterRegex = new RegExp("[a-z]+"),
                upperLetterRegex = new RegExp("[A-Z]+"),
                specialCharRegex = new RegExp("[!@#\$%\^&\*]+");

            confMsg = global.ConfValidation.msg.password;
            passVal = self.password.val();
            self.passwordError.text('');

            if(!lengthRegex.test(passVal)) {
                errorMsg.push(confMsg.minLength);
            }
            if(!lowLetterRegex.test(passVal)) {
                errorMsg.push(confMsg.lowerLetter);
            }
            if(!upperLetterRegex.test(passVal)) {
                errorMsg.push(confMsg.upperLetter);
            }
            if(!specialCharRegex.test(passVal)) {
                errorMsg.push(confMsg.specialChar);
            }

            if(errorMsg.length > 0) {
                hasError = true;
                ul = $('<ul></ul>');

                for(i in errorMsg) {
                    ul.append(
                        $('<li></li>', {text: errorMsg[i]})
                    );
                }

                self.passwordError.html(confMsg.must + ul.html());
            }

            return !hasError;
        },

        calculateAge : function (birthday) { 
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); 
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        },

        _validateFirstName: function() {
            var self = C, isValid = true;

            self.firstNameError.hide();

            if(self.firstName.length > 0) {
                if(!self.firstName.val()) {
                    self.firstNameError.text(ConfValidation.msg.required).show();
                    isValid = false;
                }
            }

            return isValid;
        },

        _valudateLastName: function() {
            var self = C, isValid = true;

            self.lastNameError.hide();

            if(self.lastName.length > 0) {
                if(!self.lastName.val()) {
                    self.lastNameError.text(ConfValidation.msg.required).show();
                    isValid = false;
                }
            }

            return isValid;
        },

        _validateEmail: function() {
            var self = C, isValid = true;

            self.emailError.hide();
          
            if (self.email.val().length === 0) {
              self.emailError.text(ConfValidation.msg.required).show();
              isValid = false;
            } else if (!self.email.val().match(/[^@]+@[^\.]+\..+/g)) {
              self.emailError.text(ConfValidation.msg.email).show();
              isValid = false;
            }

            return isValid;
        },

        _needPasswordValidation() {
            var self = C;

            return self.password && self.passwordError;
        }
    };

    $(document).ready(C._init);
})(jQuery, this)
