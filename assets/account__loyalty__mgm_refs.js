;(function($, global) {
    var P = {
        rowsPerPage: 10,

        _init: function() {
            var self = P;

            if(global.LoyaltyConf && global.LoyaltyConf.mgm.code) {
                self.$loader = $('[data-mgmref-loader]');
                self.$table = $('[data-mgmref-table]');
                self.$pagination = $('[data-mgmref-pagination]');

                self._getMgmRefs();
            }
        },

        _getMgmRefs: function() {
            var self = P;

            $.ajax({
                url: global.LoyaltyConf.urlMgmRefs,
                type: 'post',
                dataType: 'json',
                data: JSON.stringify({
                    code: global.LoyaltyConf.mgm.code
                }),
                success: function (data) {
                    var balance = 0, refs = [];

                    if(data.success) {
                        refs = data.data;
                    }

                    self.refs = refs;
                    self._setPagination();
                },
                complete: function () {
                    self.$loader.hide();
                }
            });
        },

        _setPagination: function() {
            var self = P;

            if(self.refs.length) {
                self._initPagination();
            }

            if(self.refs.length <= self.rowsPerPage) {
                self.$pagination.hide();
            }
        },

        _initPagination: function() {
            var self = P;

            // https://github.com/infusion/jQuery-Paging
            self.$pagination.paging(self.refs.length, {
                format: '< ncnnn >',
                perpage: self.rowsPerPage, // show 10 elements per page
                lapping: 0, // don't overlap pages for the moment
                onSelect: function (page) {
                    var self = P, refs, sliceStart, sliceEnd;

                    self.$pagination.find('li.active').removeClass('active');
                    self.$pagination.find('[data-page="' + page + '"]').closest('li').addClass('active');

                    if(page == 1) {
                        self.$pagination.find('.lk-table__pagination--prev').addClass('disabled');
                    } else {
                        self.$pagination.find('.lk-table__pagination--prev').removeClass('disabled');
                    }

                    if(page == this.pages) {
                        self.$pagination.find('.lk-table__pagination--next').addClass('disabled');
                    } else {
                        self.$pagination.find('.lk-table__pagination--next').removeClass('disabled');
                    }

                    sliceStart = self.rowsPerPage * (page -1);
                    sliceEnd = sliceStart + self.rowsPerPage;

                    refs = self.refs.slice(sliceStart, sliceEnd);

                    self._setTable(refs);
                },
                onFormat: function (type) {
                    switch (type) {
                        case 'block': // n and c
                            return '<li><a href="">' + this.value + '</a></li>';
                        case 'first': return '';
                        case 'last': return '';
                        case 'prev':
                            return '<a href="" class="lk-table__pagination--nav lk-table__pagination--prev"><svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                                '  <path d="M4.03244 10.3468L11.6738 2.70509C11.8843 2.49518 12 2.21453 12 1.91528C12 1.61586 11.8843 1.33537 11.6738 1.12513L11.0043 0.455882C10.7942 0.245309 10.5134 0.129395 10.2141 0.129395C9.91486 0.129395 9.63438 0.245309 9.42414 0.455882L0.325828 9.55402C0.114757 9.76493 -0.000825885 10.0467 4.44915e-06 10.3463C-0.000825885 10.6472 0.114591 10.9287 0.325828 11.1398L9.41567 20.2291C9.62591 20.4397 9.90639 20.5556 10.2058 20.5556C10.5051 20.5556 10.7856 20.4397 10.996 20.2291L11.6654 19.5599C12.101 19.1243 12.101 18.4152 11.6654 17.9798L4.03244 10.3468Z" fill="#000"></path>\n' +
                                '</svg></a>';
                        case 'next':
                            return '<a href="" class="lk-table__pagination--nav lk-table__pagination--next"><svg width="12" height="21" viewBox="0 0 12 21" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
                                '  <path d="M7.96756 10.3382L0.326155 17.98C0.115747 18.1899 -9.2718e-07 18.4705 -9.30982e-07 18.7698C-9.34787e-07 19.0692 0.115747 19.3497 0.326155 19.5599L0.995736 20.2292C1.20581 20.4397 1.48663 20.5557 1.78588 20.5557C2.08514 20.5557 2.36562 20.4397 2.57586 20.2292L11.6742 11.131C11.8852 10.9201 12.0008 10.6383 12 10.3387C12.0008 10.0378 11.8854 9.75633 11.6742 9.54526L2.58433 0.455916C2.37409 0.245342 2.09361 0.129427 1.79419 0.129427C1.49493 0.129426 1.21445 0.245341 1.00404 0.455915L0.334625 1.12516C-0.100969 1.56076 -0.100969 2.26986 0.334625 2.70529L7.96756 10.3382Z" fill="#000"></path>\n' +
                                '</svg></a>';
                    }
                }
            });
        },

        _setTable: function(refs) {
            var self = P, table;

            if(refs.length) {
                table = $('<table></table>');
                $.each(refs, function(key, data) {
                    var tr;

                    tr = $('<tr></tr>')
                        .append($('<td></td>', {text: data.transaction_id, 'class': 'dn'}))
                        .append($('<td></td>', {text: data.name}))
                        .append($('<td></td>', {text: global.LoyaltyConf.mgm.action[data.type]}))
                        .append($('<td></td>', {text: data.date}))
                    ;

                    table.append(tr);
                });

                self.$table.find('tbody').html(table.html());
                self.$table.show();
            }
        }
    };

    $(document).ready(P._init);

})(jQuery, this);