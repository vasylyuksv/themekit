;(function($, global) {
  var P = {
    tabActiveClass: 'active-tab',

    _init: function() {
      var self = P;

      self.tabNav = $('[data-tab-nav] [data-tab]').click(self._onTabClick);
      self.tabPage = $('[data-tab-page] [data-tab]');

      $('[data-tab-link]').click(self._onTabLinkClick);

      self._setCurrent();
    },

    _onTabLinkClick: function() {
      var self = P, tabName,
          elem = $(this);

      tabName = elem.attr('data-tab-link');
      self.tabNav.filter('[data-tab="' + tabName + '"]').trigger('click');
      window.scrollTo(0, 0);
    },

    _onTabClick: function() {
      var self = P,
          elem = $(this);

      self.tabNav.removeClass(self.tabActiveClass);
      elem.addClass(self.tabActiveClass);

      self.tabPage.hide();
      self.tabPage.filter('[data-tab="' + elem.attr('data-tab') + '"]').show();

    },

    _setCurrent: function () {
      var self = P, link;

      link = self.tabNav.find('[href*="' + location.hash + '"]');
      if(link.length) {
        link.closest('[data-tab]').trigger('click');
      } else {
          self.tabNav.filter(':first').trigger('click');
      }
    }
  };

  $(document).ready(P._init);

})(jQuery, this);