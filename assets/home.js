$(document).ready(function(){


  (function($) {
  $(function() {

    $('.tabs__caption').on('click', 'div:not(.active)', function() {
      $(this)
        .addClass('active').siblings().removeClass('active')
        .closest('div.tabs-descr').find('div.tabs__content').removeClass('active').eq($(this).index()).addClass('active');
    });

  });
  })(jQuery);
  
  //index page slider
//   $('.index-slider').not('.slick-initialized').slick({
//     lazyLoad: 'ondemand',
//      dots: true,
//     arrow: true,
//     infinite: true,
//     speed: 500,
//     autoplay: true,
//      fade: true,
//      cssEase: 'linear'
//    });
  
  
  var $slider = $('.index-slider')
        .on('init', function(slick) {
            console.log('fired!');
            $('.index-slider').fadeIn(100);
        })
        .slick({
            fade: true,
            focusOnSelect: true,
            lazyLoad: 'ondemand',
            speed: 1000
        });
  
  $('.product-slider').not('.slick-initialized').slick({
     dots: false,
    arrow: true,
    infinite: false,
    speed: 500,
     fade: true,
     cssEase: 'linear'
   });
  
  $('.home__product-slider').not('.slick-initialized').slick({
     dots: true,
    arrow: true,
    infinite: false,
    speed: 300,
    autoplay: true,
     fade: true,
     cssEase: 'linear'
    //adaptiveHeight: true
   });
  
  //append Dots for product slider
  //function appendDots(){
  //  var cloneDots = $('.home-ps .slick-dots');
  //  $('.home-ps__mobile-dots').append(cloneDots);
  //}  
  //if ($('.home-ps .slick-dots')[0] && $(window).width() <= 767) {
  //  appendDots();  	
  //}
  
  
  // accordion
  	var acc = document.getElementsByClassName("accordion");
    var i;
    
    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        } 
      });
    }

    // instafeed
    (function() {
        if(typeof Instafeed !== 'undefined') {

            var userFeed = new Instafeed({
                target: 'instafeed',
                get: 'user',
                userId: '8155877233',
                accessToken: '8155877233.1677ed0.a21eaa752be34c45a2d410cb2dc9f909',
                limit: 9,
                resolution: 'standard_resolution'

            });
            userFeed.run();

            setTimeout(function () {
                $("#instafeed a").attr("target", "_blank");
            }, 2000);
        }
    })();
  
// Modal about movie
//     $('.js-open-movie').on('click', function (e) {
//         e.preventDefault();
//         $('.modal-movie').addClass('active');
//         setTimeout(function () {
//             $('.movie__video').get(0).play();
//         }, 100);
//     });
//     $('.movie__close').on('click', function (e) {
//         e.preventDefault();
//         $('.modal-movie').removeClass('active');
//         $('.movie__video').get(0).pause();
//     });
//     $('.movie.modal-movie').on('click', function (e) {
//         e.preventDefault();
//         $('.modal-movie').removeClass('active');
//         $('.movie__video').get(0).pause();
//     });


});