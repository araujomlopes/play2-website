( function( $ ) {
    'use strict';

    /* Check rtl isotop*/
    function rtl_isotop() {
        if ( $( 'body' ).hasClass( 'rtl' ) ) {
           return false;
        } else {
           return true;
        }
    };

    /* --------------------------------------------------
    * sticky header
    * --------------------------------------------------*/
	$('.header-static .is-fixed').parent().append('<div class="header-clone"></div>');
	$('.header-clone').height($('#site-header .is-fixed').outerHeight());
	$('.header-static .header-clone').hide();	
	$(window).on("scroll", function(){
		var site_header = $('#site-header').outerHeight() + 1;	
			
		if ($(window).scrollTop() >= site_header) {	    	
			$('.site-header .is-fixed').addClass('is-stuck');	
			$('.header-static .header-clone').show();	
		}else {
			$('.site-header .is-fixed').removeClass('is-stuck');		              
			$('.header-static .header-clone').hide();
		}
	});

    /* --------------------------------------------------
    * mobile menu
    * --------------------------------------------------*/
    $('.mmenu_wrapper li:has(ul)').prepend('<span class="arrow"><i class="ot-flaticon-next"></i></span>');
    $(".mmenu_wrapper .mobile_mainmenu > li span.arrow").on('click',function() {
        $(this).parent().find("> ul").stop(true, true).slideToggle()
        $(this).toggleClass( "active" ); 
    });
	
	$( "#mmenu_toggle" ).on('click', function() {
		$(this).toggleClass( "active" );
		$(this).parents('.header_mobile').toggleClass( "open" );
		if ($(this).hasClass( "active" )) {
			$('.mobile_nav').stop(true, true).slideDown(100);
		}else{
			$('.mobile_nav').stop(true, true).slideUp(100);
		}
	});

    /* --------------------------------------------------
    * popup video
    * --------------------------------------------------*/
    var video_popup = $('.video-popup');
    if (video_popup.length > 0 ) {
        video_popup.each( function(){
            $(this).lightGallery({
                selector: '.video-popup > a',
            });
        } )
    }

    /* --------------------------------------------------
    * Post Grid Isotop
    * --------------------------------------------------*/
    $(window).load( function () {
        if( $('.blog-grid').length > 0 ){
            var container = $('.blog-grid'); 
            container.isotope({ 
                itemSelector : '.masonry-post-item',
                isOriginLeft: rtl_isotop(),
                percentPosition: true,
            });
        };
    });

    /* --------------------------------------------------
    * filter projects
    * --------------------------------------------------*/
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
            if ( num != 0 && $(this).hasClass('empty') ) {
                $(this).removeClass('empty');
            }
        });
    }
    $('.project-filter-wrapper').each( function(){
        var $container = $(this).find('.projects-grid'); 
        $container.isotope({ 
            itemSelector : '.project-item', 
            isOriginLeft: rtl_isotop(),
            animationEngine : 'css',
            masonry: {
                columnWidth: '.grid-sizer'
            },
            layoutMode: 'fitRows',
        });

        var $optionSets  = $(this).find('.project_filters'),
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
        /* count filters */
        updateFilter();
    });

    /* load more button */    
    $('#btn-loadmore').on('click',function(){
        var btn		= $(this),
            grid    = $(this).parents('.project-filter-wrapper').find('.projects-grid'),
            offset  = grid.find('.project-item').length,
            more    = grid.data('load'),
            loaded  = $(this).data('loaded'),
            loading = $(this).data('loading'),
            cat 	= $(this).data('category'),
            count   = grid.data('count');
        $.ajax({
            url : theratio_loadmore_params.ajaxurl, // AJAX handler
            data : {
                'action': 'loadmore', // the parameter for admin-ajax.php
                'ppp'	: more,
                'cat'	: cat,
                'offset': offset,
            },
            type : 'POST',
            beforeSend : function ( xhr ) {
                btn.text(loading).append('<i class="fas fa-sync-alt fa-spin"></i>'); // some type of preloader
            },
            success : function( data ){
                if( data ) {
                    var items = $(data);
                    btn.text(loaded);
                    grid.append(items).isotope('appended', items); // insert new posts
                    updateFilter();
                } else {
                    btn.hide(); // if no data, HIDE the button as well
                }
            }
        });
        offset += more;
        if( count <= offset ){
            btn.fadeOut(1000);
        }
        return false;
    });

    /* --------------------------------------------------
    * back to top
    * --------------------------------------------------*/
    if ($('#back-to-top').length) {
	    var scrollTrigger = 500, // px
	        backToTop = function () {
	            var scrollTop = $(window).scrollTop();
	            if (scrollTop > scrollTrigger) {
	                $('#back-to-top').addClass('show');
	            } else {
	                $('#back-to-top').removeClass('show');
	            }
	        };
	    backToTop();
	    $(window).on('scroll', function () {
	        backToTop();
	    });
	    $('#back-to-top').on('click', function (e) {
	        e.preventDefault();
	        $('html,body').animate({
	            scrollTop: 0
	        }, 700);
	    });	
	}

    /* --------------------------------------------------
    * Gird Lines
    * --------------------------------------------------*/
    $('.has-lines-vertical').each(function () {
        var l  = $('<div class="grid-lines grid-lines-vertical"><span class="g-line-vertical line-left"></span><span class="g-line-vertical line-center"></span><span class="g-line-vertical line-right"></span></div>');
        $(this).prepend(l);
    });
    $('.has-lines-horizontal').each(function () {
        var l  = $('<div class="grid-lines grid-lines-horizontal"><span class="g-line-horizontal line-top"></span><span class="g-line-horizontal line-bottom"></span></div>');
        $(this).prepend(l);
    });

    /* Royal Preloader */
    if ( $('#royal_preloader').length ) {
        var $selector       = $('#royal_preloader'),
            $width          = $selector.data('width'),
            $height         = $selector.data('height'),
            $txtcolor       = $selector.data('color'),
            $bgcolor        = $selector.data('bgcolor'),
            $logourl        = $selector.data('url'),
            $text           = $selector.data('text'),
            $mode           = $selector.data('mode');

        if ( $mode == 'scale_text' ) {
            Royal_Preloader.config({
                mode          :    'scale_text',
                text          :    $text,
                text_colour   :    $txtcolor,
                background    :    $bgcolor,
            });  
        } else if ( $mode == 'logo' ) {
            Royal_Preloader.config({
                mode           :   'logo',
                logo           :    $logourl,
                logo_size      :    [$width, $height],  
                text_colour    :    $txtcolor,
                background     :    $bgcolor,
            });
        } else {
            Royal_Preloader.config({
                mode           :   'progress',
                background     :   $bgcolor,
            });
        }        
    }

} )( jQuery );
