<?php

/*
 * Loads the Options Panel
 *
 * If you're loading from a child theme use stylesheet_directory
 * instead of template_directory
 */

if ( ! function_exists( 'optionsframework_init' ) ) {
	define( 'OPTIONS_FRAMEWORK_DIRECTORY', get_template_directory_uri() . '/panel/of/' );
	require_once dirname( __FILE__ ) . '/of/options-framework.php';
}

/*
 * This is an example of how to add custom scripts to the options panel.
 * This one shows/hides the an option when a checkbox is clicked.
 *
 * You can delete it if you not using that option
 */

//add_action( 'optionsframework_custom_scripts', 'optionsframework_custom_scripts' );
//add_action( 'optionsframework_custom_scripts', 'eo_custom_admin_head_css' );

// Admin javascripts

function eo_admin_jses(){
global $eo_options;
	//var_dump($eo_options);
	wp_register_script(  'modernizr', 
	get_template_directory_uri() . '/rsc/js/modernizr.min.js', 
	  array('jquery'), 
	  '1.2' );
	wp_enqueue_script('modernizr');
	
	if( $eo_options['load_chosen_adm'] == "1") {
	//( $eo_options['use_chosen_min_js'] == "1") ? $min = ".min" : $min = '' ;
	wp_register_script( 'chosen', 
	  get_template_directory_uri() . '/lib/chosen/chosen.jquery.js', 
	  array('jquery'), 
	  '1.2' );
	}
	if( $eo_options['load_bs_adm'] == "1") {
	wp_enqueue_script('bootstrap');
	
	//( $eo_options['use_bs_min_js'] == "1") ? $min = ".min" : $min = '' ;
	wp_register_script( 'bootstrap', 
	  get_template_directory_uri() . '/lib/bootstrap/js/bootstrap.js', 
	  array('jquery'), 
	  '1.2' );
	wp_enqueue_script('bootstrap');
	}
}

// Admin Styles
function eo_admin_csses() {
global $eo_options;
//var_dump($eo_options);
	
	wp_register_style( 'eo_optionsframework', get_template_directory_uri().'/panel/rsc/css/eo_optionsframework.css' );
	wp_enqueue_style( 'eo_optionsframework' );
	
	// Bootstrap for admin	
	if( $eo_options['load_bs_adm'] == "1") {
	//	( $eo_options['use_bs_min_css'] == "1") ? $min = ".min" : $min = '' ;
		wp_register_style( 'bootstrap', get_template_directory_uri() . '/lib/bootstrap/css/bootstrap.css', array(), '3.0.1', 'all' );
		wp_enqueue_style( 'bootstrap' );
		
		
		
		$bsw_theme = $eo_options['bsw_theme'];
		if(  $bsw_theme && $eo_options['use_bsw_theme_admin'] == "1") {
			
			wp_register_style( 'bsw_theme_admin', get_template_directory_uri() . '/panel/of/themes/'. $bsw_theme . '.css', array(), '1.0', 'all' );
			wp_enqueue_style( 'bsw_theme_admin' );
		}
		else{
			wp_register_style( 'default_theme_admin', get_template_directory_uri() . '/panel/rsc/css/admin-default.css', array(), '1.0', 'all' );
			wp_enqueue_style( 'default_theme_admin' );
		}
	}
	
	// Chosen for admin
	if( $eo_options['load_chosen_adm'] == "1") {
		wp_register_script( 'chosen-adm', get_template_directory_uri() . '/lib/chosen/chosen.jquery.min.js', array('jquery') );
		wp_enqueue_script( 'chosen-adm' );
		
		wp_register_style( 'chosen-adm', get_template_directory_uri() . '/lib/chosen/chosen.min.css', array(), '3.0.1', 'all' );
		wp_enqueue_style( 'chosen-adm' );
	}
}
function eo_admin_enhance_css() {
global $eo_options;
		wp_register_style( 'admin_enhance', get_template_directory_uri() . '/panel/rsc/admin-enhance.php', array(), '1.0', 'all' );
		wp_enqueue_style( 'admin_enhance' );
}
if(  $is_theme_opt_page) {
//var_dump($is_theme_opt_page);
	// Load the bootstrap admin styles & scripts
	add_action('admin_enqueue_scripts','eo_admin_csses');
	add_action('admin_enqueue_scripts','eo_admin_jses');
//	add_action('admin_enqueue_scripts','eo_admin_enhance_css');
	add_action( 'optionsframework_custom_scripts', 'optionsframework_custom_scripts' );
	add_action( 'optionsframework_custom_scripts', 'eo_custom_admin_head_css' );
}
	//add_action( 'admin_head', 'of_admin_head' );

function optionsframework_custom_scripts() { 
global $eo_options;
?>

<script type="text/javascript">
// _eo todo: move this inside a stable eo file ?
jQuery(document).ready(function($) {
	<?php if($eo_options[ 'coll_wp_menu'] != "1" ) { ?>
		$('body').removeClass("auto-fold folded");
	<?php } ?>	
	
	
//$('.bootstrap-ultimate #adminmenuwrap').css({'width' : '32px','overflow' : 'hidden'});
	/*$('.bootstrap-ultimate #adminmenuwrap').mouseover(function(e) {
        $(this).animate({'width' : '132px'},200);

    });*/
    $('.eo_usure').click(function(e) {
        e.preventDefault();
		
        if (window.confirm('Are you sure ' + $(this).attr("data-sure_text") + ' ?')) {
            location.href = this.href;
        }
    });
	
	
		
	
	function check_font_selects() {
		$(".eot select.of-typography-face").hide();
		$(".eot.section-typography").each(function(index, element) {
			var thizid = $(this).attr("id");
			var selectedsrcid	= $("#" + thizid + " select.of-typography-source").attr("id");
		//	if($("#" + selectedsrcid + "[id*='eo_ft']").length > 0) { 
					var selectedsrc	= $("#" + thizid + " select.of-typography-source").val();
				$("#" + thizid + " select.of-typography-face." + selectedsrc).show();
					 //       alert(selectedsrc);
		//	}
			var selectedsrcid	= $("#" + thizid + " select.of-typography-source").attr("id");
			//	if($("#" + selectedsrcid + "[id*='eo_ft']").length > 0) { 
			var selectedsrc	= $("#" + thizid + " select.of-typography-source").val();
			$("#" + thizid + " select.of-typography-face." + selectedsrc).show();
		});
	}
	//check_font_selects();
	
	$("select.of-typography-source").change(function(e) {
	var sectid = $(this).parent().parent().parent().attr("id");
	var thizid = $(this).attr("id");	
	var selectedsrc	= $(this).val();
	if( selectedsrc == "gwf_font") {
			$("#" + sectid + " select.of-typography-style").chosen('destroy');
			$("#" + sectid + " select.of-typography-style").hide(200);
			$("#"+sectid+" select.of-typography-variant" ).show(300);
			$("#" + sectid + " select.of-typography-variant").chosen({disable_search_threshold: 6});
	}
	else if( selectedsrc == "os_font") {
			$("#" + sectid + " select.of-typography-variant").chosen('destroy');
			$("#" + sectid + " select.of-typography-variant").hide(200);
			$("#"+sectid+" select.of-typography-style" ).show(300);
			$("#" + sectid + " select.of-typography-style").chosen({disable_search_threshold: 6});
		//	$("#"+sectid+" select.of-typography-style" ).hide(100);
	}
	
	$("#" + sectid + " select.of-typography-face").hide(200);
	$("#" + sectid + " select.of-typography-face."+selectedsrc).show(400);
	var idtorep = $("#" + sectid + " select.of-typography-face."+selectedsrc).attr("id");
	var nametorep = $("#" + sectid + " select.of-typography-face."+selectedsrc).attr("name");
	var otherstorep = $("#" + sectid + " select.of-typography-face").not("." + selectedsrc);
	if (idtorep.indexOf("hid") >= 0) {
		var newid = idtorep.slice(5);
		var newname = nametorep.slice(5);
		
	}
	$("#" + sectid + " select.of-typography-face."+selectedsrc).attr("id",newid);
	$("#" + sectid + " select.of-typography-face."+selectedsrc).attr("name",newname);
	$("#" + sectid + " select.of-typography-face."+selectedsrc).removeClass("hidtype");
	$("#" + sectid + " select.of-typography-face").chosen('destroy');
	$("#" + sectid + " select.of-typography-face."+selectedsrc).chosen({disable_search_threshold: 6});
	$("#" + sectid + " select.of-typography-face."+selectedsrc).trigger("chosen:updated");
	$("#" + sectid + " select.of-typography-face").hide();

	var cntr = 0;
	$(otherstorep).not("." + selectedsrc).each(function(index, element) {
		thizoid = $(this).attr("id");
		thizoname = $(this).attr("name");
		cntr++;
		$(this).attr("id", "hid" + cntr + "-" + thizoid);
		$(this).attr("name", "hid" + cntr + "-" + thizoname);
		$("#" + sectid + " select.of-typography-face."+selectedsrc).addClass("hidtype");
		$("#" + sectid + " select.of-typography-face").trigger("chosen:updated");
    });
	
	//	check_font_selects();
    //   alert(selectedsrc);
    });
	
	
	$("select.of-typography-source").click(function(e) {
        
    });
	
	<?php	if($eo_options[ 'load_chosen_adm' ] == "1" ) { ?>
			$("select").not(".hidv, .hidtype").chosen({disable_search_threshold: 6});
			//$("select").not(":visible").chosen('destroy');
	<?php } ?>
	<?php if($eo_options[ 'load_bs_adm'] ) { 
	// make side menu specific condition ?>
	$('.nav-tab-wrapper a').each(function(index, element) {
        if( $(this).hasClass("nav-tab-active") ) {
			var activetopa = $(this).attr("id");
			$("#" + activetopa).parent().addClass("active");
		}
    });
	$('.nav-tab-wrapper a').click(function(evt) {
		$('.nav-tab-wrapper li').removeClass('active');
		$(this).parent().addClass('active').blur();
	});
	<?php } ?>

	<?php if($eo_options['load_bs_adm'] == "1"  && $eo_options[ 'prev_pop'] == "1" ) { ?>
	$('a.popp').popover({
    	 trigger: 'hover',
		 html: true,
		 placement: 'auto',
		 title:	 function() { return $(this).attr("title") },
		 content: function() {
         return $(this).next(".popcontent").html();
        }
    });
	<?php } ?>
	<?php if($eo_options[ 'adm_cbox' ] == "1" ) { ?>
	$('.metabox-holder .section input:checkbox').not(".nosw").each(function(index, element) {
		var thizid = $(this).attr("id");
		var explaintext = $(this).next(".explain").text();
		$("#section-" + thizid + " h4.heading").attr("title",explaintext).css( 'cursor', 'help' );
		<?php if($eo_options[ 'cbox_style' ] == "droid" || $eo_options[ 'cbox_style' ] == "google") { ?>
			$(this).next(".explain").text('').addClass("onoffswitch-label").prepend('<div class="onoffswitch-inner"><div class="onoffswitch-active"><div class="onoffswitch-switch">ON</div></div><div class="onoffswitch-inactive"><div class="onoffswitch-switch">OFF</div></div></div>');
		<?php } ?>
		<?php if($eo_options[ 'cbox_style' ] == "ios5" || $eo_options[ 'cbox_style' ] == "win8" ) { ?>
			$(this).next(".explain").text('').addClass("onoffswitch-label").prepend('<div class="onoffswitch-inner"></div><div class="onoffswitch-switch"></div>');
		<?php } ?>
		$(this).parent().wrapInner( "<div class='onoffswitch'></div>" );
	// $(this).attr( "name","onoffswitch" );
	 $(this).addClass( "onoffswitch-checkbox" );
    });
	<?php } ?>
	$('#eo_outer-wrap .section.dept input:checkbox').change(function(event) {
		var thizid = $(this).attr("id");
		
	//	$("<div>"+ thizhtml +"</div>").insertAfter(this);
	//	$(this).next("label").html(thizhtml);
	//	alert($(this).attr("id") );
	
		var parentClssid = $(this).parents(".section").attr('id');
		var parentClss = $("#" +  parentClssid).attr('class').split(' ');
	//	alert(parentClss);
		
		// remove original .col class, switch to alternate .kol class
		
		if( this.checked ) {
			$(".section.hide.dp-" + thizid ).removeClass("hide").fadeIn(200);
			if ($("#" +  parentClssid).hasClass("altcl")) {
				for (var i = 0; i < parentClss.length; i++) {
					if (parentClss[i].indexOf('col') != -1) {
					//	$("#" +  parentClssid).removeClass(parentClss[i]);
						reppcl = parentClss[i].replace("col","kol");
						$("#" +  parentClssid).addClass(reppcl);
						$("#" +  parentClssid).removeClass(parentClss[i]);
					}
					else if (parentClss[i].indexOf('kol') != -1) {
						reppcl = parentClss[i].replace("kol","col");
						$("#" +  parentClssid).addClass(reppcl);
						$("#" +  parentClssid).removeClass(parentClss[i]);
		
					};
				};
				$("#" +  parentClssid).removeClass("altcl");
			}
		}
		else  {
			// _eo-review: check why we need to do this twice, find a more compact solution
			// _eo-fix: if checkbox left checked, page refreshed
			if ($("#" +  parentClssid).hasClass("altcl")) {

				for (var i = 0; i < parentClss.length; i++) {
					if (parentClss[i].indexOf('col') != -1) {
					//	$("#" +  parentClssid).removeClass(parentClss[i]);
						reppcl = parentClss[i].replace("col","kol");
						$("#" +  parentClssid).addClass(reppcl);
						$("#" +  parentClssid).removeClass(parentClss[i]);
					}
					else if (parentClss[i].indexOf('kol') != -1) {
						reppcl = parentClss[i].replace("kol","col");
						$("#" +  parentClssid).addClass(reppcl);
						$("#" +  parentClssid).removeClass(parentClss[i]);
		
					};
				};
				$("#" +  parentClssid).removeClass("altcl");
			}
			
			
			$(".section.dp-" + thizid).not("#" + parentClssid).addClass("hide").fadeOut(100);
			/*
			for (var i = 0; i < parentClss.length; i++) {
				if (parentClss[i].indexOf('col') != -1) {
				//	$("#" +  parentClssid).removeClass(parentClss[i]);
					reppcl = parentClss[i].replace("col","kol");
					$("#" +  parentClssid).addClass(reppcl);
					$("#" +  parentClssid).removeClass(parentClss[i]);
				}
				else if (parentClss[i].indexOf('kol') != -1) {
					reppcl = parentClss[i].replace("kol","col");
					$("#" +  parentClssid).addClass(reppcl);
					$("#" +  parentClssid).removeClass(parentClss[i]);
	
				};
			};*/
		}	
		
	});
	
	$('#eo_bs_side_menu a.suba').click(function(event) {
		// _eo-review: select the selector more efficiently ?
		thizi = $(this).parent().parent().parent().parent().attr("id");
		thizid = $("#" + thizi + " .panel-heading a").attr("href");
	//	thizid = $(this).parent().parent().parent("panel-heading a").attr("href");
	//	alert(thizid);

		if(	$(thizid).is(':hidden')) {
	  		$(".opt-group").fadeOut(200);
			$(thizid).fadeIn(300);
		}
  		
		//options-group-4-tab
		if($('.nav-tab-wrapper').is(':visible')) {
		//If top nav is visible, sync with left nav
			$(".nav-tab-wrapper a").removeClass("nav-tab-active");
			$(".nav-tab-wrapper li").removeClass("active");
				var vall = thizid.replace('side-', '');
				vall += '-tab';
			//	alert(vall);
			$(".nav-tab-wrapper a" + vall).addClass("nav-tab-active");
			$(".nav-tab-wrapper a" + vall).parent().addClass("active");
			//nav-tab-active
		}
	});
	
	$('#eo_bs_side_menu a.panhead').click(function(event) {
		event.preventDefault();
		thizid = $(this).attr("href");
  		$(".opt-group").fadeOut(200);
  		$(thizid).fadeIn(300);
		//options-group-4-tab
		if($('.nav-tab-wrapper').is(':visible')) {
		//If top nav is visible, sync with left nav
			$(".nav-tab-wrapper a").removeClass("nav-tab-active");
				var vall = thizid.replace('side-', '');
				vall += '-tab';
			//	alert(vall);
			$(".nav-tab-wrapper a" + vall).addClass("nav-tab-active");
			//nav-tab-active
		}
	});
/*
	jQuery('#example_showhidden').click(function() {
  		jQuery('#section-example_text_hidden').fadeToggle(400);
	});

	if (jQuery('#example_showhidden:checked').val() !== undefined) {
		jQuery('#section-example_text_hidden').show();
	}*/

});
</script>
<?php } ?>
<?php
//add_action('admin_head','eo_custom_admin_head_css');
	function eo_custom_admin_head_css () {
	global $eo_options;
	//	var_dump($eo_options[ 'adm_cbox' ));
		
	/* This might look HUGE and unnecessary in your <head>, i hate that too. I'd rather load ../wp-load.php, but it might not work for everyone and it has its risks:
	http://ottopress.com/2010/dont-include-wp-load-please/
	
	After some research i've concluded this is the best way to do it. Convinced by:
	http://vatuma.com/tutorials-tips-and-tricks/for-developers/creating-dynamic-css-for-wp-theme.html	
	
	*/
	
	$css_out = '<style type="text/css">';
	if($eo_options['use_bsw_theme_admin'] == "1") {
		$gl_u = get_template_directory_uri().'/lib/bootstrap/fonts/';
	 /* bsw missing glyphicon fix */
	 $css_out .= '@font-face {
	  font-family: "Glyphicons Halflings";
	  src: url("'.$gl_u.'glyphicons-halflings-regular.eot");
	  src: url("'.$gl_u.'glyphicons-halflings-regular.eot?#iefix") format("embedded-opentype"), url("'.$gl_u.'glyphicons-halflings-regular.woff") format("woff"), url("'.$gl_u.'glyphicons-halflings-regular.ttf") format("truetype"), url("'.$gl_u.'glyphicons-halflings-regular.svg#glyphicons-halflingsregular") format("svg");
	}';
	}
	
		$adm_cbox = $eo_options[ 'adm_cbox'];
		if ( $adm_cbox )	{
			
			// tiny checkbox fixes
			$css_out .= '
			 #optionsframework div.onoffswitch input.checkbox {
				position: absolute;
				cursor: pointer;
				display: block;
				left: 0;
				visibility: hidden;
				width: 100% !important;
			}
			 #optionsframework .section-checkbox .explain.onoffswitch-label {
				max-width: 80px;
				/* width: 6em; */
			}';
			if ( $eo_options[ 'cbox_style' ] == 'droid'  )	{
			$css_out .= '/* manual width fix*/
				.onoffswitch-label { width: 80px}    .onoffswitch {
		position: relative; width: 100px;
		-webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
		}
		.onoffswitch-checkbox {
		display: none;
		}
		.onoffswitch-label {
		display: block; overflow: hidden; cursor: pointer;
		border: 0px solid #999999; border-radius: 0px;
		}
		.onoffswitch-inner {
		width: 200%; margin-left: -100%;
		-moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;
		-o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;
		}
		.onoffswitch-inner > div {
		float: left; position: relative; width: 50%; height: 30px; padding: 0; line-height: 30px;
		font-size: 14px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
		-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
		}
		.onoffswitch-inner .onoffswitch-active {
		padding-left: 15px;
		background-color: #C2C2C2; color: #FFFFFF;
		}
		.onoffswitch-inner .onoffswitch-inactive {
		padding-right: 15px;
		background-color: #C2C2C2; color: #FFFFFF;
		text-align: right;
		}
		.onoffswitch-switch {
		width: 40px; margin: 0px; text-align: center;
		border: 0px solid #999999;border-radius: 0px;
		position: absolute; top: 0; bottom: 0;
		}
		.onoffswitch-active .onoffswitch-switch {
		background: #27A1CA; left: 0;
		}
		.onoffswitch-inactive .onoffswitch-switch {
		background: #A1A1A1; right: 0;
		}
		.onoffswitch-active .onoffswitch-switch:before {
		content: " "; position: absolute; top: 0; left: 40px;
		border-style: solid; border-color: #27A1CA transparent transparent #27A1CA; border-width: 15px 10px;
		}
		.onoffswitch-inactive .onoffswitch-switch:before {
		content: " "; position: absolute; top: 0; right: 40px;
		border-style: solid; border-color: transparent #A1A1A1 #A1A1A1 transparent; border-width: 15px 10px;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
		margin-left: 0;
		}';	
			}
			else if ( $eo_options[ 'cbox_style' ] == 'ios5'  )	{
				$css_out .= '/* manual height fix*/
				.onoffswitch-switch { height: 26px}
				.onoffswitch {
		position: relative; width: 72px;
		-webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
		}
		.onoffswitch-checkbox {
		display: none;
		}
		.onoffswitch-label {
		display: block; overflow: hidden; cursor: pointer;
		border: 2px solid #666666; border-radius: 22px;
		}
		.onoffswitch-inner {
		width: 200%; margin-left: -100%;
		-moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;
		-o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;
		}
		.onoffswitch-inner:before, .onoffswitch-inner:after {
		float: left; width: 50%; height: 22px; padding: 0; line-height: 22px;
		font-size: 16px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
		-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
		border-radius: 22px;
		box-shadow: 0px 11px 0px rgba(0,0,0,0.08) inset;
		}
		.onoffswitch-inner:before {
		content: "ON";
		padding-left: 8px;
		background-color: #6BB2ED; color: #FFFFFF;
		border-radius: 22px 0 0 22px;
		}
		.onoffswitch-inner:after {
		content: "OFF";
		padding-right: 8px;
		background-color: #FFFFFF; color: #666666;
		text-align: right;
		border-radius: 0 22px 22px 0;
		}
		.onoffswitch-switch {
		width: 24px; margin: 0px;
		background: #FFFFFF;
		border: 2px solid #666666; border-radius: 22px;
		position: absolute; top: 0; bottom: 0; right: 46px;
		-moz-transition: all 0.3s ease-in 0s; -webkit-transition: all 0.3s ease-in 0s;
		-o-transition: all 0.3s ease-in 0s; transition: all 0.3s ease-in 0s;
		background-image: -moz-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%);
		background-image: -webkit-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%);
		background-image: -o-linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%);
		background-image: linear-gradient(center top, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0) 80%);
		box-shadow: 0 1px 1px white inset;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
		margin-left: 0;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
		right: 0px;
		}';
			}
			else if ( $eo_options[ 'cbox_style' ] == 'google'  )	{
				$css_out .= '/* manual width fix*/
				.onoffswitch-label { width: 73px}    .onoffswitch {
		position: relative; width: 100px;
		-webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
		}
		.onoffswitch-checkbox {
		display: none;
		}
		.onoffswitch-label {
		display: block; overflow: hidden; cursor: pointer;
		border: 0px solid #999999; border-radius: 0px;
		}
		.onoffswitch-inner {
		width: 200%; margin-left: -100%;
		-moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;
		-o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;
		}
		.onoffswitch-inner > div {
		float: left; position: relative; width: 50%; height: 30px; padding: 0; line-height: 30px;
		font-size: 12px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
		-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
		}
		.onoffswitch-inner .onoffswitch-active {
		padding-left: 15px;
		background-color: #C2C2C2; color: #FFFFFF;
		}
		.onoffswitch-inner .onoffswitch-inactive {
		padding-right: 15px;
		background-color: #C2C2C2; color: #FFFFFF;
		text-align: right;
		}
		.onoffswitch-switch {
		width: 40px; margin: 0px; text-align: center;
		border: 0px solid #999999;border-radius: 0px;
		position: absolute; top: 0; bottom: 0;
		}
		.onoffswitch-active .onoffswitch-switch {
		background: #27A1CA; left: 0;
		}
		.onoffswitch-inactive .onoffswitch-switch {
		background: #A1A1A1; right: 0;
		}
		.onoffswitch-active .onoffswitch-switch:before {
		content: " "; position: absolute; top: 0; left: 40px;
		border-style: solid; border-color: #27A1CA transparent transparent #27A1CA; border-width: 15px 10px;
		}
		.onoffswitch-inactive .onoffswitch-switch:before {
		content: " "; position: absolute; top: 0; right: 40px;
		border-style: solid; border-color: transparent #A1A1A1 #A1A1A1 transparent; border-width: 15px 10px;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
		margin-left: 0;
		}
		.onoffswitch-active{
    -moz-user-select: none;
    border-radius: 4px;
    cursor: pointer;
    display: inline-block;
    font-size: 11px;
    font-weight: bold;
    line-height: 29px;
    margin-right: 16px;
    overflow: hidden;
    padding-right: 32px;
    position: relative;
    vertical-align: middle;
    white-space: nowrap;
}

.onoffswitch-switch {
	background: -moz-linear-gradient(center top , #0096FE, #0082EA) repeat scroll 0 0 #0096FE;
    color: #FFFFFF;
    margin-left: -100%;
    transition: margin 250ms ease-in-out 0s;
    -moz-box-sizing: border-box;
    display: inline-block;
    height: 29px;
    min-width: 33px;
    padding: 0 10px;
    text-align: center;
    text-transform: uppercase;
}
..onoffswitch-inner .onoffswitch-inactive:after {
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    bottom: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) inset;
    content: "";
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
}
.onoffswitch-inner .onoffswitch-inactive {
    background: -moz-linear-gradient(center top , #ECECEC, #E2E2E2) repeat scroll 0 0 #ECECEC;
    color: #333333;
}
.onoffswitch-inner .onoffswitch-inactive {
    -moz-box-sizing: border-box;
    display: inline-block;
    height: 29px;
    min-width: 33px;
    padding: 0 10px;
    text-align: center;
    text-transform: uppercase;
}
.onoffswitch-inner .onoffswitch-inactive {
    background: -moz-linear-gradient(center top , #ECECEC, #E2E2E2) repeat scroll 0 0 #ECECEC;
    color: #333333;
}
.onoffswitch-active .onoffswitch-switch {
	 background: -moz-linear-gradient(center top , #0096FE, #0082EA) repeat scroll 0 0 #0096FE;
}
.onoffswitch-switch {
	margin-left:0;
	}
.onoffswitch-active {
	margin-right:0
}
.onoffswitch-active .onoffswitch-switch:before, .onoffswitch-inactive .onoffswitch-switch:before, .onoffswitch-active .onoffswitch-switch:before {
    border-radius: 3px;
	box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3)
	border-width: 1px;
    border: 1px solid #999999 !important;
}
.onoffswitch-label {
	width: 82px;
}
.onoffswitch-switch {
    min-width: 52px;
	   width: 56px;
}

.onoffswitch-active .onoffswitch-switch::after {
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
    bottom: 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) inset;
    content: "";
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
}

';
			}
			else if ( $eo_options[ 'cbox_style' ] == 'asdasd'  )	{
				$css_out .= '';
			}
			else if ( $eo_options[ 'cbox_style' ] == 'win8'  )	{
				$css_out .= ' /* manual height fix*/
				.onoffswitch-switch { height: 26px}
				.onoffswitch {
		position: relative; width: 76px;
		-webkit-user-select:none; -moz-user-select:none; -ms-user-select: none;
		}
		.onoffswitch-checkbox {
		display: none;
		}
		.onoffswitch-label {
		display: block; overflow: hidden; cursor: pointer;
		border: 2px solid #999999; border-radius: 0px;
		}
		.onoffswitch-inner {
		width: 200%; margin-left: -100%;
		-moz-transition: margin 0.3s ease-in 0s; -webkit-transition: margin 0.3s ease-in 0s;
		-o-transition: margin 0.3s ease-in 0s; transition: margin 0.3s ease-in 0s;
		}
		.onoffswitch-inner:before, .onoffswitch-inner:after {
		float: left; width: 50%; height: 22px; padding: 0; line-height: 18px;
		font-size: 14px; color: white; font-family: Trebuchet, Arial, sans-serif; font-weight: bold;
		-moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box;
		border: 2px solid transparent;
		background-clip: padding-box;
		}
		.onoffswitch-inner:before {
		content: "on";
		padding-left: 10px;
		background-color: #2E8DEF; color: #FFFFFF;
		}
		.onoffswitch-inner:after {
		content: "off";
		padding-right: 10px;
		background-color: #CCCCCC; color: #666666;
		text-align: right;
		}
		.onoffswitch-switch {
		width: 25px; margin: 0px;
		background: #000000;
		position: absolute; top: 0; bottom: 0; right: 51px;
		-moz-transition: all 0.3s ease-in 0s; -webkit-transition: all 0.3s ease-in 0s;
		-o-transition: all 0.3s ease-in 0s; transition: all 0.3s ease-in 0s;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-inner {
		margin-left: 0;
		}
		.onoffswitch-checkbox:checked + .onoffswitch-label .onoffswitch-switch {
		right: 0px;
		}';
			} // end else if checkbox preference
		} // end checkbox
		$css_out .= '</style>';
		echo $css_out;
}

/* 
 * Turns off the default options panel from Twenty Eleven
 */
 
add_action('after_setup_theme','remove_twentyeleven_options', 100);

function remove_twentyeleven_options() {
	remove_action( 'admin_menu', 'twentyeleven_theme_options_add_page' );
}