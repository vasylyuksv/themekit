window.GTM = {
    customer: {
        id: null
    },
    template: {
        name: ''
    },

    currency: '',
    products: {},

    init: function () {
        this.checkLoginStatus()
        this.checkPasswordRecovery()
    },

    allPageEvent: function (iso_code) {
        let date = new Date();
        let timestamp = date.getTime();
        let EventData = {
            'ServerSideTampstamp': timestamp,
            'PageType': this.template.name,
            'Country': iso_code,
            'UserID': null,
            'LoggedInStatus': 'log out',
            'SiteSection': this.template.name
        };

        if (this.customer.id) {
            EventData.LoggedInStatus = 'log in';
            EventData.UserID = this.customer.id
        }

        window.dataLayer.push(EventData);

    },
    checkLoginStatus: function () {
        let oldCustomerID = sessionStorage.getItem('customer.id');

        if (oldCustomerID === 'null') {
            oldCustomerID = null
        }
        if (oldCustomerID != this.customer.id) {
            if (this.customer.id !== null) {
                this.finishRegistration(true);
                window.dataLayer.push({
                    'event': 'account',
                    'eventAction': 'login',
                    'eventLabel': 'success'

                });
            } else {
                this.finishRegistration(false);
                window.dataLayer.push({
                    'event': 'account',
                    'eventAction': 'logout',
                    'eventLabel': 'success'
                });
            }
            sessionStorage.setItem('customer.id', this.customer.id)
        }

    },
    unsuccessfulLoginEvent: function (fields) {
        window.dataLayer.push({
            'event': 'account',
            'eventAction': 'login',
            'eventLabel': 'fail',
            'errorType': 'incorrect_credentials',
            'errorFields': fields,
        });
    },

    // registration events
    unsuccessfulRegistrationEvent: function (fields) {
        window.dataLayer.push({
            'event': 'registration',
            'eventAction': 'registration Failure',
            'eventLabel': 'fail',
            'errorType': 'incorrect_credentials',
            'errorFields': fields,
        });
    },
    startRegistration: function () {
        sessionStorage.setItem('registration_start', true);
    },
    finishRegistration: function (success) {
        if (success && 'registration_start' in sessionStorage) {
            window.dataLayer.push({
                'event': 'registration',
                'eventAction': 'registration Success',
                'eventLabel': 'success'
            });
        }

        sessionStorage.removeItem('registration_start');
    },

    // password-recovery events
    unsuccessfulPasswordRecoveryEvent: function (fields) {
        window.dataLayer.push({
            'event': 'password-recovery',
            'eventAction': 'password-recovery Failure',
            'eventLabel': 'fail',
            'errorType': 'incorrect_credentials',
            'errorFields': fields,
        });
    },

    checkPasswordRecovery: function () {
        if (document.referrer !== document.location.href && 'recovery-confirm' in sessionStorage && sessionStorage.getItem('recovery-confirm') === '1') {
            window.dataLayer.push({
                'event': 'password-recovery',
                'eventAction': 'password-recovery Success',
                'eventLabel': 'success'
            });
        }
        sessionStorage.removeItem('recovery-confirm');
    },
    // checkout events
    checkoutErrors: function (step, errors, event = 'checkout continue') {
        dataLayer.push({
            'eventAction': 'checkout step ' + step,
            'eventCategory': 'checkout',
            'eventLabel': 'fail',
            'errorType': 'required_fields',
            'errorFields': errors,
            'event': event
        });
    },

    changeQuantity: function (id, quantity) {
        if (!(id in this.products)) {
            return;
        }
        quantity = parseInt(quantity);
        let product = this.products[id];
        if (quantity == product.quantity) {
            return;
        }
        if (quantity > product.quantity) {
            this.addToCart(id, quantity - product.quantity)
        } else {
            this.removeFromCart(id, product.quantity - quantity)
            if (quantity == 0) {
                delete this.products[id]
                return;
            }
        }
        this.products[id].quantity = quantity


    },

    addToCart: function (id, quantity) {
        if (!(id in this.products)) {
            return;
        }
        if(quantity == null){
        	quantity = 1;
        }
        let product = this.products[id];

        product.quantity = parseInt(quantity);

        window.dataLayer.push({
            'event': 'addToCart',
            'ecommerce': {
                'currencyCode': this.currency,
                'add': {                                // 'add' actionFieldObject measures.
                    'products': [product]
                }
            }
        });
    },

    removeFromCart: function (id, quantity) {
        if (!(id in this.products)) {
            return;
        }
        let product = this.products[id];

        product.quantity = parseInt(quantity);

        window.dataLayer.push({
            'event': 'removeFromCart',
            'ecommerce': {
                'remove': {                               // 'remove' actionFieldObject measures.
                    'products': [product]
                }
            }
        });
    },

    productClick: function (id, href) {
        if (!(id in this.products)) {
            return;
        }
        let product = this.products[id];
        let listName = product.list;
        sessionStorage.setItem('lastListName', listName);
        delete product.list;
        window.dataLayer.push({
            'event': 'productClick',
            'ecommerce': {
                'click': {
                    'actionField': {
                        'list': listName
                    },
                    'products': [product]
                }
            },
            'eventCallback': function () {
                document.location = href
            }
        });
    }

};


