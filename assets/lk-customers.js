//Mobile menu
if( $(window).width() < 768){
  $('.lk-menu li').on('click', function(){

    if (!$(this).hasClass('lk-menu__main')){
      //   var linkContent = $(this).find('a').html();
      $('.lk-menu--mobile').removeClass('active');
      $('.lk-menu__wrapper').removeClass('shown');
      $('body').removeClass('is-fixed');
      //   $('.lk-menu--btn').html(linkContent);
    }
  });
}
$('.lk-menu--mobile').on('click', function(){
  if($(this).hasClass('active')){    
    $('.lk-menu--mobile').removeClass('active');
    $('.lk-menu__wrapper').removeClass('shown');
    $('body').removeClass('is-fixed');
    $(window).resize();

  } else {
    $('.lk-menu--mobile').addClass('active');
    $('.lk-menu__wrapper').addClass('shown');
    $('body').addClass('is-fixed');
    $(window).resize();
  }
});

//PRELOADER
$(document).ready(function(){
  var onLoadText = $('.active-tab a').html();
  //$('.lk-menu--btn').html(onLoadText);  
  $('.lk-myaccount__right').addClass('loaded_hiding');
  window.setTimeout(function () {
    $('.lk-myaccount__right').addClass('loaded');
    $('.lk-myaccount__right').removeClass('loaded_hiding');
  }, 500);
});

// Page BONUS products
$('.ic--info__icon').hover(
  function(){
    $(this).closest('.ic--info__wrapper').addClass('active');
  }, function(){
    $(this).closest('.ic--info__wrapper').removeClass('active');
  }
);
// fix for CASE when no space for show popup at right
function getPosIcon(){
  if( ($(window).width() > 767) && ($(window).width() < 1200) ){
    var winWidth = $(window).width();  
    setTimeout(function(){
      $('.ic--info').map(function(){
        let $this = $(this);
        let curPosition = $this.offset().left;    
        
        if(winWidth - curPosition < winWidth/3){
          $this.addClass('tooClose');
        }  
      });
    }, 200);

  } else {
    $('.ic--info').removeClass('tooClose');
  }
};

$(window).on('resize', function() {
  getPosIcon();
});

// equal HEIGHTS
function myHeight(classHeight, dwidth){
  if($(window).width() > dwidth){
    var max_height = 0;
    setTimeout(function(){
      $(classHeight).each(function(){
        max_height = Math.max($(this).height(), max_height);
        
      });
      $(classHeight).each(function(){
        $(this).css('minHeight', max_height);
      });
    },100); 
  }
}

//RegEX remove text from element -- in header Code name text
// function removeText(container, element, text){ 
//   var subject = $(element).html();
//   var regex = new RegExp('(?:' + text + ')', 'gi');
//   var dd = subject.match(regex);
//   if(dd){
//     $(element).html(subject.replace(text, ''));
//   }
// };

if($('.lk-bonus-item__title')[0]){
  
     
  $('.lk-bonus-item__title a').map(function(){
    $this = $(this);
    var text = ' - спеціальна пропозиція';
    var aaa = $this.html();
    var regex = new RegExp('(?:' + text + ')', 'gi');
    var dd = aaa.match(regex);
    if(dd){
      $this.html(aaa.replace(text, ''));
    }

  });
}

//Show menu on mobile for first Page Account
$(document).ready(function() {
  	var historyBack =  document.referrer.indexOf("addresses");
  
  var loacationAddress = window.location.href.indexOf("addresses");
  
    if((window.location.hash.length == 0) && loacationAddress < 0  && historyBack < 0 && $(window).width() < 768 && $('.lk-menu--mobile')[0]) {
      setTimeout(function(){
        $('.lk-menu--mobile').addClass('active');
        $('.lk-menu__wrapper').addClass('shown');
        $('body').addClass('is-fixed');
      }, 500);      
    } else {
    	
    }
});

function bonusSlider(){
  $('.lk-bonus-slider').not('.slick-initialized').slick({
    slidesToShow: 3,
    slidesToScroll: 2,
    dots: false,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          arrows: false,
          dots: true
        }
      },
      {
        breakpoint: 767,
        settings: {
          arrows: true,
          slidesToShow: 2,
          slidesToScroll: 2,
          dots: false
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: true,
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false
        }
      }
    ]
  });
} 

$('.lk-menu [data-tab="main"]').on('click', function(){
  setTimeout(function(){
  	$('.lk-bonus-slider').slick('setPosition');
    myHeight('.lk-bonus-item__height2', 100);
  }, 200);
});
$('[data-tab="bonus-items"]').on('click', function(){
  myHeight('.lk-bonus-item__height', 767); //fix for changed TABS calculate height of product title
  getPosIcon(); //fix position icon popup
});

//START SCRIPTS*********************************
$(document).ready(function(){
  bonusSlider();
  getPosIcon(); //fix position icon popup
  myHeight('.lk-bonus-item__height', 768); //equal Height for title products
  myHeight('.lk-bonus-item__height2', 100); //equal Height for title products in SLIDER main
});

$(document).ready(function() {
  var setSelectedProduct = function(productId, variantId) {
    var variantImg, variantImgCont, variant2Buy;

    variantImg = $('[data-color-variant="' + variantId + '"]');
    variantImgCont = variantImg.closest('[data-color-product]');
    variant2Buy = $('#selVar-' + productId);

    variantImgCont.find('img').hide();
    variantImg.show();

    variant2Buy.val(variantId);
  };

  $('[data-color-switch] input[type="radio"]').change(function() {
    var elem = $(this), variantId, productId;

    productId = elem.attr('data-product');
    variantId = elem.val();

    setSelectedProduct(productId, variantId);
  });

  $('[data-product-select]').change(function() {
    var elem = $(this), variantId, productId;

    productId = elem.attr('data-product-select');
    variantId = elem.val();

    setSelectedProduct(productId, variantId);
  });
});


//emulating click and open tab
$('.click-friend').on('click', function(){
  $('[data-tab="invite-friend"]').trigger('click');

  var body = $("html, body");
  body.stop().animate({scrollTop:0}, 500, 'swing');
});


  
$(document).ready(function(){
  $('.lk-color_slider333').slick({
  	arrows: false,
    slidesToShow: 3
  });
}); 

