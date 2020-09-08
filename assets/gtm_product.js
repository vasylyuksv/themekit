window.GTMproduct = {
    id: '',
    list: '',
    data: {
        name: '',         // Name or ID is required.
        id: '',
        price: '',
        brand: '',
        category: '',
        variant: ''
    },
    detail: function () {
        if (this.list == null) {
            if ('lastListName' in sessionStorage) {
                this.list = sessionStorage.getItem('lastListName');
                sessionStorage.removeItem('lastListName');
            } else {
                this.list = 'direct'
            }
        }
        window.dataLayer.push({
            'event': 'productDetail',
            'ecommerce': {
                'detail': {
                    'actionField': {'list': this.list},
                    'products': [this.data]
                }
            }
        });

        window.GTM.products[this.id] = this.data
    }
};

