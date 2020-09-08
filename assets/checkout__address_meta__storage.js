var NpAddrStore = {
    deliveryAddress: 'address',
    deliveryDepartment: 'department',
    deliveryIpost: 'ipost',

    CITY_ID: 'np_city_id',
    CITY_NAME: 'np_city_name',
    CITY_LABEL: 'np_city_label',
    REGION: 'np_region',
    AREA: 'np_area',
    DELIVERY_CITY_ID: 'np_del_city_id',
    STREET: 'np_street',
    HOUSE: 'np_house',
    FLAT: 'np_flat',
    DEPARTMENT: 'np_department',
    DEPARTMENT_LABEL: 'np_department_label',
    CALLBACK: 'np_nocallback',
    DELIVERY_TYPE: 'np_delivery_type',
    IPOST_CITY: 'ipost_city',
    IPOST_STREET: 'ipost_street',
    IPOST_ADDRESS: 'ipost_address',
    IPOST_FLAT: 'ipost_flat',
    IPOST_CHOSE_TIME: 'ipost_chose_time',
    IPOST_DATE: 'ipost_date',
    IPOST_TIME_FROM: 'ipost_time_from',
    IPOST_TIME_TO: 'ipost_time_to',
    IPOST_COMMENT: 'ipost_comment',
    IPOST_FORM_DATA: 'ipost_form_data',



    setCityId: function(cityId) {
        sessionStorage.setItem(this.CITY_ID, cityId);
    },

    getCityId: function() {
        return sessionStorage.getItem(this.CITY_ID);
    },

    setCityName: function(cityName) {
        sessionStorage.setItem(this.CITY_NAME, cityName);
    },

    getCityName: function() {
        return sessionStorage.getItem(this.CITY_NAME);
    },

    setCityLabel: function(cityLabel) {
        sessionStorage.setItem(this.CITY_LABEL, cityLabel);
    },

    getCityLabel: function() {
        return sessionStorage.getItem(this.CITY_LABEL);
    },

    setArea: function(cityLabel) {
        sessionStorage.setItem(this.AREA, cityLabel);
    },

    setRegion: function(region) {
        sessionStorage.setItem(this.REGION, region);
    },

    setDeliveryCityId: function(deliveryCityId) {
        sessionStorage.setItem(this.DELIVERY_CITY_ID, deliveryCityId);
    },

    getDeliveryCityId: function() {
        return sessionStorage.getItem(this.DELIVERY_CITY_ID);
    },

    setStreet: function(street) {
        sessionStorage.setItem(this.STREET, street);
    },

    getStreet: function() {
        return sessionStorage.getItem(this.STREET);
    },

    setHouse: function(house) {
        sessionStorage.setItem(this.HOUSE, house);
    },

    getHouse: function() {
        return sessionStorage.getItem(this.HOUSE);
    },

    setFlat: function(flat) {
        sessionStorage.setItem(this.FLAT, flat);
    },

    getFlat: function() {
        return sessionStorage.getItem(this.FLAT);
    },

    setDepartmentNum: function(department) {
        sessionStorage.setItem(this.DEPARTMENT, department);
    },

    getDepartmentNum: function() {
        return sessionStorage.getItem(this.DEPARTMENT);
    },

    setDepartmentLabel: function(department) {
        sessionStorage.setItem(this.DEPARTMENT_LABEL, department);
    },

    getDepartmentLabel: function() {
        return sessionStorage.getItem(this.DEPARTMENT_LABEL);
    },
    
    setNoCallback: function (bCallback) {
        sessionStorage.setItem(this.CALLBACK, (bCallback ? '1' : ''));
    },

    getNoCallback: function () {
        if(sessionStorage.getItem(this.CALLBACK) != null) {
            return sessionStorage.getItem(this.CALLBACK) == '1'
        }

        return null;
    },

    setDeliveryType: function(deliveryType) {
        sessionStorage.setItem(this.DELIVERY_TYPE, deliveryType);
    },

    getDeliveryType: function() {
        return sessionStorage.getItem(this.DELIVERY_TYPE);
    },

    session2Local: function() {
        var npData = {}, storeKey;

        storeKey = this.getLocalstoreKey();

        npData[this.CITY_ID] = sessionStorage.getItem(this.CITY_ID);
        npData[this.CITY_NAME] = sessionStorage.getItem(this.CITY_NAME);
        npData[this.CITY_LABEL] = sessionStorage.getItem(this.CITY_LABEL);
        npData[this.AREA] = sessionStorage.getItem(this.AREA);
        npData[this.REGION] = sessionStorage.getItem(this.REGION);
        npData[this.DELIVERY_CITY_ID] = sessionStorage.getItem(this.DELIVERY_CITY_ID);
        npData[this.STREET] = sessionStorage.getItem(this.STREET);
        npData[this.HOUSE] = sessionStorage.getItem(this.HOUSE);
        npData[this.FLAT] = sessionStorage.getItem(this.FLAT);
        npData[this.DEPARTMENT] = sessionStorage.getItem(this.DEPARTMENT);
        npData[this.DEPARTMENT_LABEL] = sessionStorage.getItem(this.DEPARTMENT_LABEL);
        npData[this.CALLBACK] = sessionStorage.getItem(this.CALLBACK);
        npData[this.DELIVERY_TYPE] = sessionStorage.getItem(this.DELIVERY_TYPE);

        npData[this.IPOST_CITY] = sessionStorage.getItem(this.IPOST_CITY);
        npData[this.IPOST_STREET] = sessionStorage.getItem(this.IPOST_STREET);
        npData[this.IPOST_ADDRESS] = sessionStorage.getItem(this.IPOST_ADDRESS);
        npData[this.IPOST_FLAT] = sessionStorage.getItem(this.IPOST_FLAT);

        localStorage.setItem(storeKey, JSON.stringify(npData));
    },

    local2Session: function() {
        var storeData, i;

        storeData = this.getLocalStoreData();
        if(storeData) {
            for(i in storeData) {
                sessionStorage.setItem(i, storeData[i]);
            }
        }
    },

    getLocalStoreData: function() {
        var storeKey, storeData, i;

        storeKey = this.getLocalstoreKey();
        storeData = localStorage.getItem(storeKey);
        try {
            storeData = JSON.parse(storeData);
            for(i in storeData) {
                if(storeData[i] === null) {
                    storeData[i] = '';
                }
            }
        } catch (e) {
            storeData = false;
        }

        return storeData;
    },

    clearSession: function() {
        sessionStorage.removeItem(this.CITY_ID);
        sessionStorage.removeItem(this.CITY_NAME);
        sessionStorage.removeItem(this.CITY_LABEL);
        sessionStorage.removeItem(this.AREA);
        sessionStorage.removeItem(this.REGION);
        sessionStorage.removeItem(this.DELIVERY_CITY_ID);
        sessionStorage.removeItem(this.STREET);
        sessionStorage.removeItem(this.HOUSE);
        sessionStorage.removeItem(this.FLAT);
        sessionStorage.removeItem(this.DEPARTMENT);
        sessionStorage.removeItem(this.DEPARTMENT_LABEL);
        sessionStorage.removeItem(this.CALLBACK);
        sessionStorage.removeItem(this.DELIVERY_TYPE);

        sessionStorage.removeItem(this.IPOST_CITY);
        sessionStorage.removeItem(this.IPOST_STREET);
        sessionStorage.removeItem(this.IPOST_ADDRESS);
        sessionStorage.removeItem(this.IPOST_FLAT);
        sessionStorage.removeItem(this.IPOST_CHOSE_TIME);
        sessionStorage.removeItem(this.IPOST_DATE);
        sessionStorage.removeItem(this.IPOST_TIME_FROM);
        sessionStorage.removeItem(this.IPOST_TIME_TO);
        sessionStorage.removeItem(this.IPOST_COMMENT);
        sessionStorage.removeItem(this.IPOST_FORM_DATA);
    },

    getLocalstoreKey: function() {
        return 'np_' + CheckoutConf.customerId
    }
};







