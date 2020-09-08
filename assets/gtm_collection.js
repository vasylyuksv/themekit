window.GTMcollection = {
    products: [],
    name: '',
    initClicks: function () {
        $("a.js-gtm-product-click").off('click').click(function (event) {
            event.preventDefault();
            window.GTM.productClick($(this).data("id"), this.href)
        });
    },

    runCollection: function (name) {
        if ($('.js-gtm-recommendation-product').length < 1) {
            return
        }
        let that = this;
        $('.js-gtm-recommendation-product').map(function () {
            that.products.push(JSON.parse(this.innerHTML))
        });
        this.name = name;
        this.impressions();
        that.initClicks();
    },
    impressions: function () {
        if (this.products.length < 1) {
            return;
        }
        let that = this;
        let products = this.products.map(function (product, key) {
            product.position = key + 1;
            product.list = that.name;
            window.GTM.products[product.innerID] = product;
            delete product.innerID;
            return product
        });
        window.dataLayer.push({
            'event': 'productImpression',
            'ecommerce': {
                'currencyCode': window.GTM.currency,                       // Local currency is optional.
                'impressions': products
            }
        });
        this.reset();
    },
    reset: function () {
        this.products = [];
        this.name = '';
    }
}

$(document).ready(function () {
    window.GTMcollection.initClicks()
});