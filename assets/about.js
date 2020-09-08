$(document).ready(function(){
 
   $('.about__slider').slick({
     dots: false,
    arrow: true,
    infinite: false,
    speed: 500,
     fade: true,
     cssEase: 'linear'
   });
  
  $('.product-slider').slick({
     dots: false,
    arrow: true,
    infinite: false,
    speed: 500,
     fade: true,
     cssEase: 'linear'
   });
   
  

  // Modal about movie
  $('.js-open-movie').on('click', function (e) {
    e.preventDefault();
    $('.modal-movie').addClass('active');
    $('body').addClass('modalOpened');
    setTimeout(function () {
      //       $('.movie__video').get(0).play();
    }, 100);
  });
  $('.movie__close').on('click', function (e) {
    e.preventDefault();
    $('.modal-movie').removeClass('active');
    $('body').removeClass('modalOpened');
    //     $('.movie__video').get(0).pause();
    vimeoWrap = $('.movie__video');
    vimeoWrap.html( vimeoWrap.html() );
  });
  $('.movie.modal-movie').on('click', function (e) {
    e.preventDefault();
    $('.modal-movie').removeClass('active');
    $('body').removeClass('modalOpened');
    //     $('.movie__video').get(0).pause();
    vimeoWrap = $('.movie__video');
    vimeoWrap.html( vimeoWrap.html() );
  });
  
  
  
  /** Reviews Slider **/
  $('.about-reviews__slider')
  .not('.slick-initialized')
  .slick({
    infinite: false,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: false,
    responsive: [
      {
        breakpoint: 1199,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true
        }
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: true,
          dots: false
        }
      }
    ]
  });
  
  /** How USE Slider **/
  $('.about-use__slider')
  .not('.slick-initialized')
  .slick({
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    arrow: true,
    fade: true,
    cssEase: 'ease-in-out',
    touchThreshold: 100
  });
  
  
  
  
  gsap.registerPlugin(ScrollTrigger);
  

//Animation About FEATURES Block  
  let ltFeaturesGlo = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-features__temps",
      toggleActions: "restart none reverse none",
      scrub: 5,
      start: "center 90%",
      end: "80% 75%",
      markers: false
    }
  });  
  ltFeaturesGlo.to(".anim-glo_img_2", {ease:Power4.easeOut, y:0, opacity:1, duration:1.5})
  .to(".anim-glo_img_1", {ease:Power4.easeOut, opacity:1, duration:0.5})
  .to(".anim-glo_img_1", {ease:Power4.easeOut, x:0, duration:1.5});
  
  
  let ltFeaturesCig = gsap.timeline({
    scrollTrigger: {
      trigger: ".about-features__temps",
      toggleActions: "restart none reverse none",
      scrub: 5,
      start: "center 90%",
      end: "80% 75%",
      markers: false
    }
  });  
  ltFeaturesCig.to(".anim-cig_img_2", {ease:Power4.easeOut, y:0, opacity:1, duration:2})
  .to(".anim-cig_img_1", {ease:Power4.easeOut, opacity:1, duration:0.5}, "-=0.5")
  .to(".anim-cig_img_1", {ease:Power4.easeOut, x:0, duration:1});
  
  
  let ltFeaturesIcons = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-features__list',
      toggleActions: "play none none none",
      start: "center 90%",
      end: "bottom 80%",
      markers: false      
    }
  });  
  ltFeaturesIcons.staggerFrom(".about-features__item img", 1, {ease:Power4.easeOut, autoAlpha: 0}, 1);  
//end Animation About FEATURES Block   	
  
//Animation About QUALITY Block 
  let tlQualityIcons = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-quality__list',
      toggleActions: "play none none none",
      start: "center 70%",
      end: "bottom 80%",
      markers: false      
    }
  });
  tlQualityIcons.staggerFrom(".about-quality__item img", 1, {ease:Power4.easeOut, autoAlpha: 0}, 1);  
  
  let tlQualityImg = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-quality__img',
      scrub: 8,
      start: "top 70%",
      end: "center 80%",
      markers: false
    }
  });  
  tlQualityImg.to(".about-quality__img > img", 		{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 2})
  .to(".about-quality__line--1", 					{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1}, "-=1")
  .to(".about-quality__line--1 span", 				{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1})
  .to(".about-quality__line--2", 					{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1})
  .to(".about-quality__line--2 span", 				{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1})
  .to(".about-quality__line--3", 					{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1}, "-=0.25")
  .to(".about-quality__line--3 span", 				{ease:Power4.easeOut, autoAlpha: 1, x: 0, duration: 1}, "-=0.25");  
//end Animation About QUALITY Block  
  
  
//Animation About REVIEWS Slider   
  let tlReviews = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-reviews__slider',
      toggleActions: "play none none none",
      start: "+=150 70%",
      end: "+=150 90%",
      ease: Power4.easeOut,
      markers: false      
    }
  });
  tlReviews.staggerFrom(".about-reviews__name", 1, {ease:Power4.easeOut, autoAlpha: 0, y: -10}, 0.5)
  .staggerFrom(".about-reviews__name strong, .about-reviews__name div", 1, {ease:Power4.easeOut, autoAlpha: 0, y: -10}, 0.5, "-=2")
  .staggerFrom(".about-reviews__text span", 1, {ease:Power4.easeOut, autoAlpha: 0}, 0.5,  "-=2");
//end Animation About REVIEWS Slider  
  
  
//Animation About USE Slider
  gsap.from(".slick-active .about-use__img img", {
    scrollTrigger: {
      trigger: ".about-use__img",
      toggleActions: "restart none reverse none",
      scrub: 3,
      start: "center 70%",
      end: "bottom 80%",
      markers: false,
      ease: Power4.easeOut
    },
    opacity: 0,
    duration: 1    
  });
//end Animation About USE Slider  
  
//Animation About CHOOSE Block  
  
  let tlChoose = gsap.timeline({
    scrollTrigger: {
      trigger: '.about-choose__hyper',
      scrub: 3,
      start: "top 70%",
      end: "center 80%",
      markers: false      
    }
  });
  
  tlChoose.from(".about-choose__hyper img", {ease:Power4.easeOut, autoAlpha: 0, x: -100, duration: 1})
  .from(".about-choose__pro img", {ease:Power4.easeOut, autoAlpha: 0, x: 100, duration: 1}, "-=1");
  
//end Animation About CHOOSE Block    
  
  
   
  
  ScrollTrigger.refresh();
  
    
  
  
});