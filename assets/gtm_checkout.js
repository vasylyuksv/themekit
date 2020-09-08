window.GTMcheckout = {
    products: [],
    action: {
        step: 1,
        option: null
    },
    steps: {},
    checkout: function (callback) {
        if (this.products.length < 1) {
            return;
        }
        if (this.action.option === null) {
            delete this.action.option;
        }
        window.dataLayer.push({
            'event': 'checkout',
            'ecommerce': {
                'checkout': {
                    'actionField': this.action,
                    'products': this.products
                }
            },
            'eventCallback': callback
        });
    },
    purchase: function () {
        if (this.products.length < 1) {
            return;
        }
        window.dataLayer.push({
		  'event': 'purchase',
          'ecommerce': {
                'purchase': {
                    'actionField': this.action,
                    'products': this.products
                }
            }
        });
    },
    setStep: function (name) {
        this.action.step = this.steps[name];
    }
}

window.GTMcheckout.steps = {
    'contact_information': 1,
    'shipping_method': 2,
    'payment_method': 3,
    'review': 4
};

$(document).on("page:load", function () {
    if (Shopify.Checkout.step === "shipping_method") {
        $('[data-step="shipping_method"] form:first').submit(function (event) {
            window.GTMcheckout.action.option = $(this)
                .find('input[name="checkout[shipping_rate][id]"]:checked')
                .attr('aria-label');
            window.GTMcheckout.checkout();
        })
    }

    if (Shopify.Checkout.step === "payment_method") {
        $('[data-step="payment_method"] form').submit(function (event) {
            window.GTMcheckout.action.option = $(this)
                .find('input[name="checkout[payment_gateway]"]:checked')
                .closest('.radio-wrapper')
                .find('.radio__label label')
                .text().trim();
            window.GTMcheckout.checkout();
        })
    }

    if (Shopify.Checkout.step === "review") {
        $('[data-step="review"] form').submit(function () {
            window.GTMcheckout.checkout();
        })
    }
});