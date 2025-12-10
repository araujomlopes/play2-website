( function( $ ) {
    'use strict';

    /* Check rtl isotope*/
    function rtl_isotop() {
        if ( $( 'body' ).hasClass( 'rtl' ) ) {
           return false;
        } else {
           return true;
        }
    };

    /* --------------------------------------------------
    * Post format gallery
    * --------------------------------------------------*/
    function otPostSliderSwiper() {
        var selector = $('.gallery-post-slider-swiper');

        if (selector.length) {
            selector.each(function (item, value) {
                var swiperContainer = $(this);
                var config = {
                    slidesPerView: 1,
                    loop: true,
                    speed: 800,
                    navigation: {
                        nextEl: '.octf-swiper-button-next',
                        prevEl: '.octf-swiper-button-prev',
                    },
                }
                if (window.elementorFrontend) {
                    if (window.elementorFrontend.isEditMode()) {
                        OTInitSwiper(swiperContainer, config);
                    } else {
                        elementorFrontend.on('components:init', () => {
                            OTInitSwiper(swiperContainer, config, elementorFrontend);
                        });
                    }
                } else {
                    OTInitSwiper(swiperContainer, config);
                }
            });
        }
    }

    /* --------------------------------------------------
    * Related projects
    * --------------------------------------------------*/
    function otPortfolioRelatedSwiper() {
        var selector = $('.portfolio-related-posts');

        if (selector.length) {
            selector.each(function (item, value) {
                var swiperContainer = $(this);
                var config = {
                    slidesPerView: 3,
                    loop: false,
                    speed: 600,
                    watchOverflow: true,
                    spaceBetween: 30,
                    pagination: {
                        el: '.octf-swiper-pagination',
                        clickable: true,
                    },
                    breakpoints: {
                        360: {
                            slidesPerView: 1,
                            slidesPerGroup: 1,
                        },
                        768: {
                            slidesPerView: 2,
                            slidesPerGroup: 1,
                        },
                        1024: {
                            slidesPerView: 3,
                            slidesPerGroup: 1,
                            pagination: {
                                clickable: true,
                            },
                        },
                    }
                }
                if (window.elementorFrontend) {
                    if (window.elementorFrontend.isEditMode()) {
                        OTInitSwiper(swiperContainer, config);
                    } else {
                        elementorFrontend.on('components:init', () => {
                            OTInitSwiper(swiperContainer, config, elementorFrontend);
                        });
                    }
                } else {
                    OTInitSwiper(swiperContainer, config);
                }
            });
        }
    }

    /* --------------------------------------------------
     * counter
     * --------------------------------------------------*/
    var icounter = function () {
        $('.ot-counter[data-counter]').each( function () {
            var scrollTop   = $(document).scrollTop() + $(window).height();
            var counter     = $(this).find('span.num'),
                countTo     = counter.attr('data-to'),
                during      = parseInt( counter.attr('data-time') );

            if ( scrollTop > counter.offset().top + counter.height() ) {
                $(this).removeAttr('data-counter');
                $({
                    countNum: counter.text()
                }).animate({
                    countNum: countTo
                },
                {
                    duration: during,
                    easing: 'swing',
                    step: function() {
                        counter.text(Math.floor(this.countNum));
                    },
                    complete: function() {
                        counter.text(this.countNum);
                    }
                });
            }
        });
    };

    var counter = function () {
        icounter();
    };

    /* --------------------------------------------------
    * testimonials
    * --------------------------------------------------*/
    var testimonialSlider = function ($scope, $) {
        $scope.find('.ot-testimonials-slider-s1').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');
            
            var config = {
                slidesPerView:  1,
                spaceBetween: 30,
                loop: true,
                speed: 800,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                pagination: {
                    el: pagination,
                    clickable: true
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                    },
                }
            }
            OTInitSwiper( swiperContainer, config );
        });
    };

    /* --------------------------------------------------
    * testimonials 2
    * --------------------------------------------------*/
    var testimonialSlider2 = function ($scope, $) {
        $scope.find('.ot-testimonials-slider-s2').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options'),
                speed = swiperContainer.data('effect') == 'fade' ? 0 : 800;
            
            var config = {
                slidesPerView:  1,
                spaceBetween: 30,
                loop: true,
                speed: speed,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                effect: swiperContainer.data('effect'),
                fadeEffect: {
                    crossFade: true
                },
                pagination: {
                    el: pagination,
                    clickable: true
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile)
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet)
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop)
                    },
                }
            }
            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );
        });
    };

    /* --------------------------------------------------
    * testimonials 3
    * --------------------------------------------------*/
    var testimonialSlider3 = function ($scope, $) {
        $scope.find('.ot-testimonials-slider-s3').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination-2' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');
            
            var config = {
                slidesPerView:  1,
                spaceBetween: 30,
                loop: true,
                speed: 800,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                effect: swiperContainer.data('effect'),
                fadeEffect: {
                    crossFade: true,
                },
                pagination: {
                    el: pagination,
                    clickable: true
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                    },
                }
            }
            
            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );
        });
    };

    /* --------------------------------------------------
    * Image Carousel
    * --------------------------------------------------*/
    var imageCarousel = function ($scope, $) {
        $scope.find('.image-carousel').each( function () {
            var swiperContainer  = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');

            var config = {
                slidesPerView:  1,
                spaceBetween: parseInt(sliderSettings.margin_desktop),
                loop: true,
                speed: 800,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                autoplay: {
                    delay: 6000,
                    disableOnInteraction: false,
                },
                pagination: {
                    el: pagination,
                    clickable: true,
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev,
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                        spaceBetween: parseInt(sliderSettings.margin_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                        spaceBetween: parseInt(sliderSettings.margin_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                        spaceBetween: parseInt(sliderSettings.margin_desktop),
                    },
                }
            }

            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );                                   
        });
    };    

    /* --------------------------------------------------
    * team carousel
    * --------------------------------------------------*/
    var teamCarousel = function ($scope, $) {
        $scope.find('.team-slider').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');
            
            var config = {
                slidesPerView:  1,
                spaceBetween: parseInt(sliderSettings.margin_desktop),
                loop: true,
                speed: 800,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                pagination: {
                    el: pagination,
                    clickable: true,
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev,
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                    },
                }
            }

            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );
        });
    };

    /* --------------------------------------------------
    * blog carousel
    * --------------------------------------------------*/
    var blogCarousel = function ($scope, $) {
        $scope.find('.blog-slider').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');
            
            var config = {
                slidesPerView:  1,
                spaceBetween: parseInt(sliderSettings.margin_desktop),
                loop: false,
                speed: 800,
                watchOverflow: true,
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                pagination: {
                    el: pagination,
                    clickable: true,
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev,
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                        spaceBetween: parseInt(sliderSettings.margin_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                        spaceBetween: parseInt(sliderSettings.margin_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                        spaceBetween: parseInt(sliderSettings.margin_desktop),
                    },
                }
            }

            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );
        });
    };

    /* --------------------------------------------------
    * project carousel
    * --------------------------------------------------*/
    var latestProjectCarousel = function ($scope, $) {
        $scope.find('.project-slider').each( function () {
            var swiperContainer = $(this),
                itemID = swiperContainer.data('item-slider') ? '[data-slider="' + swiperContainer.data('item-slider') + '"]' : '',
                pagination = '.octf-swiper-pagination' + itemID,
                arrow_next = '.octf-swiper-button-next' + itemID,
                arrow_prev = '.octf-swiper-button-prev' + itemID,
                sliderSettings = swiperContainer.data('slider_options');
            
            var config = {
                slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                loop: false,
                watchOverflow: true,
                autoplay: {
                    delay: 6000,
                    disableOnInteraction: false,
                },
                speed: 800,
                spaceBetween: parseInt(sliderSettings.margin_desktop),
                pagination: {
                    el: pagination,
                    clickable: true,
                },
                navigation: {
                    nextEl: arrow_next,
                    prevEl: arrow_prev,
                },
                breakpoints: {
                    360: {
                        slidesPerView: parseInt(sliderSettings.slides_show_mobile),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_mobile),
                        spaceBetween: parseInt(sliderSettings.margin_mobile),
                    },
                    768: {
                        slidesPerView: parseInt(sliderSettings.slides_show_tablet),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_tablet),
                        spaceBetween: parseInt(sliderSettings.margin_tablet),
                    },
                    1024: {
                        slidesPerView: parseInt(sliderSettings.slides_show_desktop),
                        slidesPerGroup: parseInt(sliderSettings.slides_scroll_desktop),
                        spaceBetween: parseInt(sliderSettings.margin_desktop),
                    },
                }
            }

            /*Swiper Init*/
            OTInitSwiper( swiperContainer, config );
        });
    };

    function OTInitSwiper(swiperContainer, config) {
        if ( 
            window.elementorFrontend
            && window.elementorFrontend.utils
            && window.elementorFrontend.utils.swiper 
        ) {
            const asyncSwiper = window.elementorFrontend.utils.swiper;
            new asyncSwiper( swiperContainer, config ).then( ( newSwiperInstance ) => {
                var mySwiper = newSwiperInstance;
            });
        } else if ('undefined' !== typeof Swiper) {
            var mySwiper = new Swiper( swiperContainer[0], config );
        }
    }

    /* --------------------------------------------------
    * accordions
    * --------------------------------------------------*/
    var customAccordions = function ($scope, $) {
        $scope.find('.ot-accordions').each( function () {
            var selector = $(this),
                content = selector.find('.acc-content'),
                header  = selector.find('.acc-toggle');

            header.off("click");

            header.each(function(){
                if ($(this).data('default') == 'yes') {
                    $(this).next().addClass('active').slideDown(300);
                    $(this).parent().addClass('current');
                }
            });

            header.on('click', function(e){
                e.preventDefault();
                var $this = $(this);

                $this.next().toggleClass('active').slideToggle(300);
                $this.parent().toggleClass('current');
                content.not($this.next()).slideUp(300);
                header.not($this).parent().removeClass('current');
            });
        });
    };

    /* --------------------------------------------------
    * tabs
    * --------------------------------------------------*/
    var customTabs = function ($scope, $) {

        $scope.find('.ot-tabs').each(function() {
            var selector = $(this),
                tabs     = selector.find('.tabs-heading li'),
                content  = selector.find('.tab-content');
            tabs.first().addClass('current');
            content.first().addClass('current');

            tabs.on( 'click', function(){
                var tab_id = $(this).attr('data-tab');
                $(this).siblings().removeClass('current');
                $(this).parents('.ot-tabs').find('.tab-content').removeClass('current');
                $(this).addClass('current');
                $("#"+tab_id).addClass('current');
            });
        });

        
    };

    /* --------------------------------------------------
    * Process
    * --------------------------------------------------*/
    var processTabs = function ($scope, $) {
        $scope.find('.ot-process[data-tab]').each(function(){
            var selector = $(this);
            selector.find('.process_nav li').first().addClass('current');
            selector.find('.process-des div.process-des-item').hide();
            selector.find('.process-des div.process-des-item').first().show();
            selector.find('.process_nav li').on( 'click', function(){
                $(this).parent().find('li').removeClass('current');
                $(this).addClass('current');
                $(this).parents('.ot-process').find('.process-des div.process-des-item').hide();

                var index = $(this).index();
                $(this).parents('.ot-process').find('.process-des div.process-des-item:eq(' + index + ')').fadeIn(300);
            });
        });
    };

    /* --------------------------------------------------
     * progress bar
     * --------------------------------------------------*/
    function lineProgress() {
        $('.ot-progress:not([data-processed])').each(function() {
            var bar = $(this),
                line = bar.find(".progress-bar"),
                progressEnd = bar.data('percent'),
                percent = bar.find('.ppercent');
            var scrollTop = $(document).scrollTop() + $(window).height();

            if ( scrollTop >  bar.offset().top +  bar.height() ) {
                bar.attr("data-processed", "true");
                line.css("width", (bar.outerWidth() * (progressEnd / 100)) + "px");

                for (var i = 0; i <= 50; i++) {
                    (function (count) {
                        setTimeout(function () {
                            percent.html(Math.round((progressEnd / 50) * count) + "%");
                        }, 30 * count);
                    })(i);
                }
            }
        });
    };

    /* ## Progress bar size */

    function lineProgressSize() {
        $('.ot-progress[data-processed]').each(function () {
            var bar = $(this);
            var line = bar.find(".progress-bar");
            var progressEnd = parseInt(bar.data('percent'));

            line.css("width", (bar.outerWidth() * (progressEnd / 100)) + "px");
        
        });
    }

    function circleProgress() {
        $('.circle-progress:not([data-processed])').each(function() {
            var circle    = $(this),
                bar_color = circle.data('color'),
                bar_hei   = circle.data('height'),
                bar_size  = circle.data('size');
            var scrollTop = $(document).scrollTop() + $(window).height();
            if ( scrollTop >  circle.offset().top +  circle.height() ) {
                circle.attr("data-processed", "true");
                circle.find('.inner-bar').easyPieChart({
                    barColor: bar_color,
                    trackColor: false,
                    scaleColor: false,
                    lineCap: 'square',
                    lineWidth: bar_hei,
                    size: bar_size,
                    animate: 1000,
                    onStart: $.noop,
                    onStop: $.noop,
                    /*easing: 'easeInOut',*/
                    onStep: function(from, to, percent) {
                        $(this.el).find('.percent').text(Math.round(percent) + '%');
                    }
                });
            }
        });
    };
    
    var progressBar = function () {
        lineProgress();
        circleProgress();
    };

    /* --------------------------------------------------
    * message box
    * --------------------------------------------------*/
    var messageBox = function($scope, $){
        $scope.find('.message-box').each( function(){
            var selector = $(this),
                close = selector.find('>i');
            close.on('click', function() {
                $scope.fadeOut();
            });
        });
    };

    /* --------------------------------------------------
    * post grid isotope
    * --------------------------------------------------*/
    var postGrid = function ($scope, $) {   
        $('.blog-grid').each( function(){
            var container = $(this); 
            container.isotope({ 
                itemSelector : '.masonry-post-item', 
                isOriginLeft: rtl_isotop(),
                percentPosition: true,
            });
        });        
    };

    /* --------------------------------------------------
	* projects filter isotope
	* --------------------------------------------------*/
    var projectsFilter = function () {
        function updateFilter() {
            $('.project_filters a').each(function() {
                var data_filter = this.getAttribute('data-filter');
                var num = $(this)
                    .closest('.project-filter-wrapper')
                    .find('.project-item')
                    .filter(data_filter).length;
                $(this)
                    .find('.filter-count')
                    .text( num );
            });
        }
        $('.projects-grid:not(.project-slider)').each( function(){
            var $container = $(this); 
            
            $container.isotope({ 
                itemSelector : '.project-item', 
                isOriginLeft: rtl_isotop(),
                animationEngine : 'css',
                masonry: {
                    columnWidth: '.grid-sizer'
                },
                layoutMode: 'masonry',
            });
            
            var $optionSets  = $(this).closest('.project-filter-wrapper').find('.project_filters'),
                $optionLinks = $optionSets.find('a');
    
            $optionLinks.on('click', function(){
                var $this = $(this);
    
                if ( $this.hasClass('selected') ) {
                    return false;
                }
                var $optionSet = $this.parents('.project_filters');
                    $optionSet.find('.selected').removeClass('selected');
                    $this.addClass('selected');
    
                var selector = $(this).attr('data-filter');
                    $container.isotope({ 
                        filter: selector 
                    });
                return false;
            });
            /* popup gallery */
            if( $container.hasClass('img-popup') ){
                if( $container.hasClass('style-6') ){
                    var all_links = document.querySelectorAll('h5 a.title-link');
                    for(var i=0; i<all_links.length; i++){
                        all_links[i].removeAttribute("href");
                    }
                }
                $('.img-popup').lightGallery({
                    selector: '.style-3 .projects-thumbnail, .style-4 .projects-thumbnail, .style-6 h5 a',
                    share: false,
                    pager: false,
                    thumbnail: false
                }); 
            }
            /* count filters */
            updateFilter();
        });
    };

    /* projects filter isotope 2 test */

    function updateFilter2() {
        $('.project_filters a').each(function() {
            var data_filter = this.getAttribute('data-filter');
            var num = $(this)
                .closest('.project-filter-wrapper')
                .find('.project-item')
                .filter(data_filter).length;
            $(this)
                .find('.filter-count')
                .text( num );
        });
    }

    function otIsotope() {
        $('.projects-grid:not(.project-slider)').each(function () {
            var $isotopeWrap = $(this);
            var properties = {
                itemSelector : '.project-item',
                animationEngine : 'css',
                layoutMode: 'masonry',
                percentPosition: true,
                masonry: {
                    columnWidth: '.grid-sizer'
                },
                isOriginLeft: rtl_isotop(),
            };
            $isotopeWrap.imagesLoaded(function() {
                $isotopeWrap.isotope(properties);
                $isotopeWrap.isotope("layout");
            });
            otIsotopeFilterHandler(this);
            updateFilter2();
        });
    }

    function otIsotopeFilterHandler(self){
        var filterBtn = $(self).closest('.project-filter-wrapper').find('.project_filters a');

        /* Filter Handler */
        filterBtn.on('click', function (e) {
            e.preventDefault();

            var $this = $(this);
            if ( $this.hasClass('selected') ) {
                return;
            }
            $this.addClass('selected').parent().siblings().find('a').removeClass('selected');

            var dataFilter  = $this.attr('data-filter'),
                isotopeWrap = $this.closest('.project-filter-wrapper').find('.projects-grid');
            isotopeWrap.isotope({ 
                filter: dataFilter 
            });
        });

        /* popup gallery */
        if( $(self).hasClass('img-popup') ){
            if( $(self).hasClass('style-6') ){
                var all_links = document.querySelectorAll('h5 a.title-link');
                for(var i=0; i<all_links.length; i++){
                    all_links[i].removeAttribute("href");
                }
            }
            $('.img-popup').lightGallery({
                selector: '.style-3 .projects-thumbnail, .style-4 .projects-thumbnail, .style-6 h5 a',
                share: false,
                pager: false,
                thumbnail: false
            }); 
        }
    }

    /* projects filter isotope 2 test end*/

    /* --------------------------------------------------
	* image gallery
    * --------------------------------------------------*/
    var imageGallery = function ($scope, $) {
        $scope.find('.image-gallery').each( function(){
            var selector = $(this),
                popup   = selector.find('.gallery-icon > a');
            popup.append('<span class="overlay"><i class="ot-flaticon-add"></i></span>');
            selector.lightGallery({
                selector: popup,
                share: false,
                pager: false,
            });
        });
    };

    /* --------------------------------------------------
    * video popup
    * --------------------------------------------------*/
    var videoPopup = function ($scope, $) {
        $scope.find('.video-popup').each( function(){
            var selector = $(this),
                videoItem = selector.find('>div');
            selector.lightGallery({
                selector: videoItem,
            });
        });
    };

    /* --------------------------------------------------
    * image service box popup
    * --------------------------------------------------*/
    var imageServiceBox = function ($scope, $) {
        $scope.find('.service-box').each( function(){
            var selector = $(this),
                imgPopup = selector.find('.image-box > div');
            selector.lightGallery({
                selector: imgPopup,
                share: false,
                pager: false,
            });
        });
    };

    /* --------------------------------------------------
    * coming soon
    * --------------------------------------------------*/
    var countDown = function($scope, $){
        $scope.find('.ot-countdown').each( function(){
            var selector = $(this),
                date     = selector.data('date'),
                zone     = selector.data('zone'),
                day      = selector.data('day'),
                days     = selector.data('days'),
                hour     = selector.data('hour'),
                hours    = selector.data('hours'),
                min      = selector.data('min'),
                mins     = selector.data('mins'),
                second   = selector.data('second'),
                seconds  = selector.data('seconds');
            selector.countdown({
                date: date,
                offset: zone,
                day: day,
                days: days,
                hour: hour,
                hours: hours,
                minute: min,
                minutes: mins,
                second: second,
                seconds: seconds
            }, function () {
                alert('Done!');
            });
        });
    };
    
    /* --------------------------------------------------
    * social team
    * --------------------------------------------------*/
    var socialTeam = function( $scope, $ ){
        $scope.find('.team-wrap').each( function(){
            var selector = $(this).find('.team-social > span');
            selector.on('click', function(){
                $(this).parent().toggleClass('active');
            });
        });
    };

    /* --------------------------------------------------
    * Image Before After
    * --------------------------------------------------*/
    var beforeAfter = function ( $scope , $ ) {
        $scope.find('.twentytwenty-container').each( function(){
            var $selector     = $(this),
                orientation     = $selector.data('orientation'),
                before      = $selector.data('before'),
                after       = $selector.data('after'),
                before_size     = $selector.data('bsize');      
            $selector.twentytwenty({        
                default_offset_pct: before_size, 
                orientation: orientation, 
                before_label: before, 
                after_label: after, 
                no_overlay: false, 
                move_slider_on_hover: false, 
                move_with_handle_only: true, 
                click_to_move: true,
            });     
        }); 
    };

    /* --------------------------------------------------
    * handle after scroll/load/resize
    * --------------------------------------------------*/
    $(window).on('scroll', function() {
        lineProgress();
        circleProgress();
        icounter();
    });
    $(window).on('load', function () {
        lineProgress();
        circleProgress();
        icounter();
    });
    $(window).on('resize', function () {
        lineProgressSize();
    });
    $(document).ready(function () {
        otPostSliderSwiper();
        otPortfolioRelatedSwiper();
    });

    /**
     * Elementor JS Hooks
     */
    $(window).on("elementor/frontend/init", function () {

        /*Counter*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/icounter.default",
            counter
        );

        /*Testimonials*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/itestimonials.default",
            testimonialSlider
        );

        /*Testimonials 2*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/itestimonials2.default",
            testimonialSlider2
        );

        /*Testimonials 3*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/itestimonials3.default",
            testimonialSlider3
        );

        /*Custom accordions*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/iaccordions.default",
            customAccordions
        );

        /*Custom tabs*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/itabs.default",
            customTabs
        );

        /*Process tabs*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/iprocessbox.default",
            processTabs
        );

        /*Progress bar*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/iprogress.default",
            progressBar
        );

        /*Image carousel*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/theratio-image-carousel.default",
            imageCarousel
        );

        /*Blog carousel*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ipost_carousel.default",
            blogCarousel
        );

        /*Team carousel*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/imembercarousel.default",
            teamCarousel
        );
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/imembercarousel.default",
            socialTeam
        );

        /*Latest Project carousel*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/irprojects.default",
            latestProjectCarousel
        );

        /*Message box*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/imessagebox.default",
            messageBox
        );

        /*Post grid*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ipost_grid.default",
            postGrid
        );

        /*projects filter isotope*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ipfilter.default",
            projectsFilter
        );
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ipfilter_metro.default",
            projectsFilter
        );

        /*gallery*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/igimages.default",
            imageGallery
        );

        /*video popup*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ivideopopup.default",
            videoPopup
        );

        /*Service box*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/theratio-service-box.default",
            imageServiceBox
        );

        /*countdown*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/icountdown.default",
            countDown
        );

        /*Team*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/imember.default",
            socialTeam
        );

        /*Image Before After*/
        elementorFrontend.hooks.addAction(
            "frontend/element_ready/ibeforeafter.default",
            beforeAfter
        );
    });

} )( jQuery );