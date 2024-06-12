<?php
/**
 * A unique identifier is defined to store the options in the database and reference them from the theme.
 * By default it uses the theme name, in lowercase and without spaces, but this can be changed if needed.
 * If the identifier changes, it'll appear as if the options have been reset.
 * 
 */

//var_dump($eo_options);
function optionsframework_option_name() {

	// This gets the theme name from the stylesheet
	$themename = wp_get_theme();
	$themename = preg_replace("/\W/", "_", strtolower($themename) );

	$optionsframework_settings = get_option( 'optionsframework' );
	$optionsframework_settings['id'] = $themename;
	update_option( 'optionsframework', $optionsframework_settings );
}
function eo_get_options ($opt) {
	global $theme_opt_slug;	
	$optionsframework_settings = get_option('optionsframework');
	$option_options = get_option('optionsframework', $optionsframework_settings['id']);	
	($theme_opt_slug) ? $opt_id = $theme_opt_slug : $opt_id = $optionsframework_settings['id'];
	$ret_options = get_option($opt_id);	
		if($opt == "all") {
				return $ret_options;
		}
		else {
			return $ret_options[$opt];
		}
}

add_action( 'admin_head', 'of_admin_head' );
/**
 * Defines an array of options that will be used to generate the settings page and be saved in the database.
 * When creating the "id" fields, make sure to use all lowercase and no spaces.
 *  
 */

function optionsframework_options() {
	global $theme_opt_slug,$eo_options;				

	$themesPath = dirname(__FILE__) . '/panel/of/themes';
	$gwf_update_button = '<a id="eo_upd_gwf" class="button-primary eo_fleft">Refresh Fonts / Check for updates</a>';
	
	$gwf_update_button = '<button id="eo_upd_gwf" type="button" class="';
	if ( eo_get_options("load_bs_adm") == 1 ) { $gwf_update_button .= 'eo_fleft btn btn-primary btn-sm';
	}
	else {
	$gwf_update_button .= 'button-primary';
	}
	$gwf_update_button .= '">';
	if ( eo_get_options("load_bs_adm") == 1 ) $gwf_update_button .= '<span class="glyphicon glyphicon-cloud-download"></span>';
	$gwf_update_button .= 'Download / Update  <b>Google Fonts</b></button>';
	
	$del_all_nonce = wp_create_nonce("eo_del_opt_nonce");
	// Extend this func to delete certain things, instead of everything
	$del_all_str = "start_over";
	$del_link = admin_url('admin-ajax.php?action=eo_del_opt&del_what=' . $del_all_str . '&nonce='.$del_all_nonce);
	$del_link_html  = '<a data-nonce="' . $del_all_nonce . '" data-sure_text="you want to delete all theme related options & settings" data-del_what="' . $del_all_str . '" href="' . $del_link . '" class="eo_usure eo_del_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$del_link_html .= 'btn btn-warning btn-sm eo_fleft';
	}
	else {
		$del_link_html .= 'button button-secondary';
	}
	$del_link_html .= '"><span class="glyphicon glyphicon-floppy-remove"></span> x Delete options & Settings</a><div class="explain">If something doesnt look or feel right, just use this to reset options. Dont worry, everything will be recreated, its essentially a refresh rather than delete. </div>';
	
	
/*	$del_link_html  = '<a data-nonce="' . $del_all_nonce . '" data-sure_text="you want to delete all theme related options & settings" data-del_what="' . $del_all_str . '" href="' . $del_link . '" class="eo_usure eo_del_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$del_link_html .= 'btn btn-danger btn-sm eo_fleft';
	}
	else {
		$del_link_html .= 'button button-secondary';
	}
	$del_link_html .= '"><span class="glyphicon glyphicon-floppy-remove"></span> x Delete options & Settings</a><div class="explain">If something doesnt look or feel right, just use this to reset options. Dont worry, everything will be recreated, its essentially a refresh rather than delete. </div>';*/
	
	// Delete transients
	$del_trans_nonce = wp_create_nonce("eo_del_trans_nonce");
	$del_trans_str = "eo_transients";
	$del_trans_link = admin_url('admin-ajax.php?action=eo_del_opt&del_what=' . $del_trans_str . '&nonce='.$del_trans_nonce);
	$del_trans_link_html  = '<a data-nonce="' . $del_trans_nonce . '" data-sure_text="you want to delete all transients prefixed *eo_* " data-del_what="' . $del_trans_str . '" href="' . $del_trans_link . '" class="eo_usure eo_del_trans_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$del_trans_link_html .= 'btn btn-danger btn-sm eo_fleft';
	}
	else {
		$del_trans_link_html .= 'button button-secondary';
	}
	$del_trans_link_html .= '"><span class="glyphicon glyphicon-trash"></span> x Delete Transients</a><div class="explain"><span class="label label-danger">Warning:</span> This will also delete your <b>backups</b> Delete all transients prefixed <code>eo_</code> .Use this only if you know what you are doing</div>';

	
	$pp_msg =  '<div class="alert alert-warning" style="padding: 1em;"> 
                            <div class="bs-callout bs-callout-warning form-group" style="margin: 0.1em; padding: 0.6em;">
                                <h4>Hope you enjoy the theme!</h4>
                                <p>Long hours and all nighters go into making these themes.. If you like it please consider donating so that i can maintain and develop it further:</p>
								<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=5CNHT2TW8BJJN" target="_blank"><img src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" alt="Donate" /></a>
                            </div>
                     </div>';
	$rv_msg = '<div class="alert alert-warning" style="padding: 1em;"> 
                        <div class="bs-callout bs-callout-warning form-group" style="margin: 0.1em; padding: 0.6em;">
                            <h4>Please rate & review</h4>
                            <p>Please <a href="http://wordpress.org/themes/bootstrap-ultimate" class="btn btn-primary" target="_blank"> <span class="glyphicon glyphicon-thumbs-up"></span> Rate this theme on WP themes dir.</a> All kinds of feedback helps.</p>
                        </div>
                 </div>';

   // echo $del_link_html;
	
	/*
	$nonce = wp_create_nonce("my_user_vote_nonce");
    $link = admin_url('admin-ajax.php?action=my_user_vote&post_id=Roboto&nonce='.$nonce);
	
	 echo '<a class="check_roboto" data-nonce="' . $nonce . '" data-post_id="Roboto" href="' . $link . '">Check Roboto</a>';*/
	 
	// Multicheck Array
	$multicheck_array = array(
		'one' => __('French Toast', 'options_framework_theme'),
		'two' => __('Pancake', 'options_framework_theme'),
		'three' => __('Omelette', 'options_framework_theme'),
		'four' => __('Crepe', 'options_framework_theme'),
		'five' => __('Waffle', 'options_framework_theme')
	);

	// Multicheck Defaults
	$multicheck_defaults = array(
		'one' => '1',
		'five' => '1'
	);

	$gwf_update_button = '<button id="eo_upd_gwf" type="button" class="';
	if ( eo_get_options("load_bs_adm") == 1 ) { $gwf_update_button .= 'eo_fleft btn btn-primary btn-sm';
	}
	else {
	$gwf_update_button .= 'button-primary';
	}
	$gwf_update_button .= '">';
	if ( eo_get_options("load_bs_adm") == 1 ) $gwf_update_button .= '<span class="glyphicon glyphicon-cloud-download"></span>';
	$gwf_update_button .= 'Download / Update  <b>Google Fonts</b></button>';
	
	
	$update_button = '<button id="check-bootswatch" type="button" disabled="disabled" class="';
	if ( eo_get_options("load_bs_adm") == 1 ) { $update_button .= 'eo_fleft btn btn-info btn-sm';
	}
	else {
	$update_button .= 'button-primary';
	}
	$update_button .= '">';
	if ( eo_get_options("load_bs_adm") == 1 ) $update_button .= '<span class="glyphicon glyphicon-cloud-download"></span>';
	$update_button .= 'Download / Check themes update</button><span>-Disabled:- WP doesnt allow public themes to use curl</span>';
	
//	$update_button = '<button id="check-bootswatch" type="button" class="button-primary eo_fleft"><span class="glyphicon glyphicon-cloud-download"></span> Download / Check themes updates</button>';
	// Insert default option
	$theList = array();
	$theList['default'] = OPTIONS_FRAMEWORK_DIRECTORY . 'themes/default.jpg';
	if ($handle = opendir( $themesPath )) {
	    while (false !== ($file = readdir($handle)))
	    {
	        //if ($file != "." && $file != ".." && strtolower(substr($file, strrpos($file, '.') + 1)) == 'css')
	        if ($file != "." && $file != ".." && strtolower(substr($file, strrpos($file, '.') + 1)) == 'css')
	        {
	        	$name = substr($file, 0, strlen($file) - 4);
				$thumb = OPTIONS_FRAMEWORK_DIRECTORY . 'themes/' . $name . '-thumbnail.png';
				$theList[$name] = $thumb;
				//var_dump($thumb);

	        }
	    }
	    closedir($handle);
	}
	
	$theBgList = array();
	if ($bghandle = opendir( get_template_directory() . '/rsc/img/patterns' )) {
	    while (false !== ($file = readdir($bghandle)))
	    {
		//	var_dump($file);
			if ($file!="."&&$file!="..") {
	        	$bgname = substr($file, 0, strlen($file) - 4);
				$thumb = get_template_directory_uri() . '/rsc/img/patterns/'.$file;
				$theBgList[$bgname] = $thumb;
		//		var_dump($thumb,$bgname);
			}
	    }
			$temp = array('none' => $theBgList['none']);
			unset($theBgList['none']);
			$theBgList = $temp + $theBgList;
	    closedir($bghandle);
	}
	
	//print_r($theList);
	
	// fixed or scroll position
	$fixed_scroll = array("fixed" => "Fixed","scroll" => "Scroll");
	
	// Multicheck Defaults
	//$multicheck_defaults = array("one" => "1","five" => "1");
	
	// Background Defaults
	$background_defaults = array('color' => '', 'image' => '', 'repeat' => 'repeat','position' => 'top center','attachment'=>'scroll');
	
	// Pull all the categories into an array
	$options_categories = array();  
	$options_categories_obj = get_categories();
	foreach ($options_categories_obj as $category) {
    	$options_categories[$category->cat_ID] = $category->cat_name;
	}
	
	// Pull all the pages into an array
	$options_pages = array();  
	$options_pages_obj = get_pages('sort_column=post_parent,menu_order');
	$options_pages[''] = 'Select a page:';
	foreach ($options_pages_obj as $page) {
    	$options_pages[$page->ID] = $page->post_title;
	}
		
	// If using image radio buttons, define a directory path
	$imagepath =  get_bloginfo('stylesheet_directory') . '/images/';
	$tmpuri = get_template_directory_uri();
	
	/* CHECK FONT SOURCES */
	$all_font_opt = get_option('eo_all_fonts_arr');
	$testf = eo_combined_font_faces();


	$eo_def_gf_array_o = get_option('eo_def_gf_array');
	$eo_gl_fnt =get_option('eo_googlefonts_arr' );

	$eofontarr = get_option( 'eo_all_fonts_arr');
	$typography_mixed_fonts = array_merge( options_typography_get_os_fonts() , options_typography_get_google_fonts() );
	/* Build Font Sources _eo */
	asort($typography_mixed_fonts);

	$post_types = eo_get_post_types();
	$dashboxes = eo_get_dashboxes();
	
	$options = array();
	$options[] = array( "name" => __('Common', 'eo_theme'),
						"icon" => "globe",
						"type" => "heading");
	$options[] = array( "name" => __('Branding Logo', 'eo_theme'),
						"desc" => "Select an image to use for site branding",
						"id" => "branding_logo",
						"group" => "branding",
						"class" => "col-sm-6",
						"std" => "",
						"type" => "upload");
						
	$options[] = array( "name" => __('Custom favicon', 'eo_theme'),
						"desc" => "URL for a valid .ico favicon",
						"id" => "favicon_url",
						"group" => "branding",
						"class" => "col-sm-6",
						"std" => "",
						"type" => "text");
						
	$options[] = array( "name" => __('Default Main Layout', 'eo_theme'),
						'id' => 'main_layout',
						"std" => "right-sidebar",
						'type' => 'images',
						"group" => "layout",
						"class" => "col-sm-12 col-md-8",
						"imgclass" => "eo_layoutthumb img-thumbnail col-sm-6 col-md-4 col-lg-3",
						'desc' => __( 'Select the default layout.', 'eo_theme' ),
						'options' => array(
								'full' => get_template_directory_uri() . '/panel/rsc/img/' . '1col.png',
								'left-sidebar' => get_template_directory_uri() . '/panel/rsc/img/' . '2cl.png',
								'right-sidebar' => get_template_directory_uri() . '/panel/rsc/img/' . '2cr.png'
							)
						);					
/*	$options[] = array( "name" => __('Extra Small - Content', 'eo_theme'),
						"id" => "layout_xs_main",
						"desc" => "Choose your preferred layout for the device",
						"group" => "layout",
						"std" => "12",
						"type" => "select",
						"class" => "col-sm-7 nochosen colsel",
						"prev" => "size_expl.jpg",
						"options" => eo_col_cl_maker('xs',0,12)
						);
	$options[] = array( "name" => __('Extra Small - Sidebar', 'eo_theme'),
						"id" => "layout_xs_side",
						"desc" => "Choose your preferred layout for the device",
						"group" => "layout",
						"std" => "12",
						"type" => "select",
						"prev" => "size_expl.jpg",
						"class" => "col-sm-5 nochosen colsel",
						"options" => eo_col_cl_maker('xs',0,12)
						);*/
	$options[] = array( "name" => __('Small devices - Content', 'eo_theme'),
						"id" => "layout_sm_main",
						"desc" => "Choose your preferred layout for the device",
						"prev" => "size_expl.jpg",
						"group" => "layout",
						"std" => "8",
						"type" => "select",
						"class" => "col-sm-7 nochosen colsel",
						"options" => eo_col_cl_maker('sm')
						);
	$options[] = array( "name" => __('Small devices - Sidebar', 'eo_theme'),
						"id" => "layout_sm_side",
						"desc" => "Choose your preferred layout for the device",
						"prev" => "size_expl.jpg",
						"group" => "layout",
						"std" => "4",
						"type" => "select",
						"class" => "col-sm-5 nochosen colsel",
						"options" => eo_col_cl_maker('sm')
						);
	$options[] = array( "name" => __('Medium devices - Content', 'eo_theme'),
						"id" => "layout_md_main",
						"desc" => "Refer to the first - extra small devices - option for explanation",
						"group" => "layout",
						"std" => "-1",
						"type" => "select",
						"class" => "col-sm-7 nochosen colsel",
						"options" => eo_col_cl_maker('md')
						);
	$options[] = array( "name" => __('Medium devices - Sidebar', 'eo_theme'),
						"id" => "layout_md_side",
						"desc" => "Refer to the first - extra small devices - option for explanation",
						"group" => "layout",
						"std" => "-1",
						"type" => "select",
						"class" => "col-sm-5 nochosen colsel",
						"options" => eo_col_cl_maker('md')
						);
	$options[] = array( "name" => __('Large devices - Content', 'eo_theme'),
						"id" => "layout_lg_main",
						"desc" => "Refer to the first - extra small devices - option for explanation",
						"group" => "layout",
						"std" => "9",
						"type" => "select",
						"class" => "col-sm-7 nochosen colsel",
						"options" => eo_col_cl_maker('lg')
						);
	$options[] = array( "name" => __('Large devices - Sidebar', 'eo_theme'),
						"id" => "layout_lg_side",
						"desc" => "Refer to the first - extra small devices - option for explanation",
						"group" => "layout",
						"std" => "3",
						"type" => "select",
						"class" => "col-sm-5 nochosen colsel",
						"options" => eo_col_cl_maker('lg')
						);
						
	$options[] = array( "name" => __('Main bg color', 'eo_theme'),
						"desc" => "Main body background color.",
						"id" => "main_bg_color",
						"group" => "Background",
						"class" => 'col-sm-6',
						"prev" => "bgcolors.jpg",
						"std" => "",
						"type" => "color");		
						
		$options[] = array( "name" => __('Content bg color', 'eo_theme'),
						"desc" => "Content (Container) background color.",
						"id" => "cont_bg_color",
						"group" => "Background",
						"class" => 'col-sm-6',
						"std" => "",
						"prev" => "bgcolors.jpg",
						"type" => "color");	
									
	$options[] = array( "name" => __('Bg Image', 'eo_theme'),
						"id" => "main_bg_img",
						"desc" => __('Main background image / pattern.', 'eo_theme'),
						"group" => "Background",
						"std" => "none",
					//	"class" => eo_opt_dept('use_bsw_themes','1'),
						"type" => "images",
						"options" => $theBgList,
						"imgclass" => "eo_bgthumb img-thumbnail col-sm-4 col-md-3 col-lg-2"
						);
						
	$options[] = array( "name" => __('Loop Contents', 'eo_theme'),
						"id" => "loop_whtd",
						"group" => "the loop",
						'std' => array("post"),
						'type' => 'multiselect',
						'options' => $post_types,
						"class" => "col-sm-6 col-md-3",
					//	"options" => array('posts' => 'Posts', 'pages' => 'Pages')
						);
						
						
	$options[] = array( "name" => __('Extent', 'eo_theme'),
						"id" => "loop_ext",
						"desc" => "Select whether to display excerpt / full content in loops | Doesnt apply to singular display.",
						"group" => "the loop",
						"std" => "excerpt",
					//	"prev" => "mult_loop.jpg",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => array('excerpt' => 'Excerpt', 'content' => 'Full Content')
						);
						
	$options[] = array( "name" => __('Limit excerpt by', 'eo_theme'),
						"id" => "exc_limby",
						"desc" => "Limit the excerpt by words / character.",
						"group" => "the loop",
						"std" => "char",
					//	"prev" => "mult_loop.jpg",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => array('char' => 'Characters', 'word' => 'Words')
						);
						
	$options[] = array( "name" => __('Excerpt Limit#count', 'eo_theme'),
						"desc" => "Limit by this number of chars / words depending on previous option.",
						"id" => "exc_lim",
						"group" => "the loop",
						"class" => "col-sm-6 col-md-3",
					//	"force_clear" => "visible-md visible-lg",
						"std" => "180",
						"type" => "text");
						
	$options[] = array( "name" => __('Featured IMG size loop', 'eo_theme'),
						"desc" => "Select featured image size foor loops.",
						"id" => "featimg_size",
						"group" => "the loop",
						"std" => "thumbnail",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => eo_get_q_thumb_sizes()
						);
	$options[] = array( "name" => __('Featured IMG single', 'eo_theme'),
						"desc" => "Select featured image size for single display.",
						"id" => "featimg_size_s",
						"group" => "the loop",
						"std" => "eo-carousel",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => eo_get_q_thumb_sizes()
						);
						
	$options[] = array( "name" => __('Featured IMG display', 'eo_theme'),
						"id" => "featimg_disp",
						"desc" => "Display featured image block or inline. Hybrid is inline in loop, block in single mode",
						"group" => "the loop",
						"std" => "hybrid",
						"prev" => "featimgdisp.jpg",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => array('inline' => 'Inline', 'block' => 'Block', 'hybrid' => 'Hybrid')
						);
						
	$options[] = array( "name" => __('Featured IMG Link to', 'eo_theme'),
						"id" => "featimg_link",
						"desc" => "Display featured image block or inline.",
						"group" => "the loop",
						"std" => "img",
					//	"prev" => "mult_loop.jpg",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => array('img' => 'Image', 'post' => 'Post')
						);
						
	$options[] = array( "name" => __('Loop Columns', 'eo_theme'),
						"id" => "loop_siz",
						"desc" => "Select whether to display posts one by one in single column, or two column. Only applies to larger screens.",
						"group" => "the loop",
						"std" => "single",
						"prev" => "mult_loop.jpg",
						"type" => "select",
						"class" => "col-sm-6 col-md-3",
						"options" => array('single' => 'Single', 'double' => 'Double')
						);
						
	$options[] = array( "name" => __('Date', 'eo_theme'),
						"desc" => "Show post time.",
						"id" => "pmeta_time",
						"group" => "Post meta",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Author', 'eo_theme'),
						"desc" => "Show post author.",
						"id" => "pmeta_auth",
						"group" => "Post meta",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Category', 'eo_theme'),
						"desc" => "Show post category.",
						"id" => "pmeta_cat",
						"group" => "Post meta",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Tags', 'eo_theme'),
						"desc" => "Show post tags.",
						"id" => "pmeta_tags",
						"group" => "Post meta",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
/*
	$options[] = array( "name" => __('Google Analytics has been removed Removed - GA UA code', 'eo_theme'),
						"id" => "google_ua_key",
						"desc" => eo_make_dmsg('ga_removed','Please note that <b>Google Analytics</b> feature has been removed.This functionality is not allowed in themes and falls into <b>plugin territory</b> category'),
						"class" => 'alert alert-info fadee in col-sm-12',
						"group" => "Google Analytics",
						"type" => "free_html",
						);*/

						
			
	
	$options[] = array( "name" => __('CSS', 'eo_theme'),
						"desc" => "Additional CSS",
						"group" => "Quick Start",
						"class" => "col-md-6",
						"id" => "eo_custom_css",
						"std" => "",
						"type" => "textarea");	
						
	$options[] = array( "name" => __('Custom JS', 'eo_theme'),
						"desc" => "Custom js before closing <code>&lt;/body&gt;</pre></code>It will be directly printed inside <code>&lt;script&gt;&lt;/script&gt;</pre></code> ",
						"group" => "Quick Start",
						"class" => "col-md-6",
						"id" => "eo_custom_footer_js",
						"std" => "",
						"type" => "textarea");	

	$options[] = array( "name" => __('Home', 'eo_theme'),
						"icon" => "home",
						"type" => "heading");
						
	$options[] = array( "name" => __('Home Sidebar', 'eo_theme'),
						"desc" => "Activate a sidebar to display on home page only.",
						"id" => "home_sb",
						"std" => "0",
						"group" => "Homepage",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('No# Posts in Home', 'eo_theme'),
						"desc" => "Number of posts on homepage.",
						"id" => "home_postcnt",
						"group" => "Homepage",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"type" => "text");
						
	$options[] = array( "name" => __('What to display ?', 'eo_theme'),
						"id" => "home_whtd",
						"group" => "Homepage",
						'std' => array("post"),
						'type' => 'multiselect',
						'options' => $post_types,
						"class" => "col-sm-6 col-md-4 col-lg-3",
						);
						
	$options[] = array( "name" => __('Home Cat.', 'eo_theme'),
						"desc" => "Home posts category to show.",
						"id" => "home_postcat",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Homepage",
						"std" => key(eo_get_q_cats()),
						"options" => eo_get_q_cats(),
						"force_clear" => "visible-lg",
						"type" => "select");
						
	$options[] = array( "name" => __('Exclude from home', 'eo_theme'),
						"desc" => "Select the posts you want to exclude from recent posts in home.",
						"id" => "home_excl",
						"group" => "Homepage",
				//		'std' => array(),
						'type' => 'multiselect',
						'options' => array(
							'caru' => 'Carousel posts',
							'high' => 'Highlight posts',		
							'feat' => 'Featurette posts',		
						),
						"class" => "col-sm-6 col-md-4 col-lg-3",
						);
						
	$options[] = array( "name" => __('Order by', 'eo_theme'),
						"desc" => "Order posts by",
						"id" => "home_ord_by",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Homepage",
						"std" => "date",
				//		"force_clear" => "visible-md",
						"options" => eo_order_by_arr(),
						"type" => "select");		
								
	$options[] = array( "name" => __('Order &darr; &uarr;', 'eo_theme'),
						"desc" => "Order asc&uarr;-desc&darr;.",
						"id" => "home_ord",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Homepage",
						"std" => "DESC",
						"options" => eo_order_arr(),
						"type" => "select");
	
	$options[] = array( "name" => __('Modules', 'eo_theme'),
						"icon" => "filter",
						"type" => "heading");
						
	$options[] = array( "name" => __('Carousel on home', 'eo_theme'),
						"desc" => "Display the bootstrap slider carousel on homepage page template. This uses the wordpress featured images.",
						"id" => "show_slider",
						"std" => "1",
						"group" => "carousel",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-3 col-lg-3','trigger'),
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Also display on', 'eo_theme'),
						"desc" => "Select pages to also display on.",
						"id" => "caru_also_disp",
						"group" => "carousel",
				//		"std" => key(eo_get_q_pages()),
						"type" => "multiselect",
						"class" => "col-md-4 col-lg-3",
						"options" => eo_get_q_pages()
						);	
	$options[] = array( "name" => __('Carousel bg color', 'eo_theme'),
						"desc" => "Carousel background color.",
						"id" => "caru_bg_color",
						"group" => "carousel",
						"class" => "col-md-4 col-lg-3",
						//"prev" => "bgcolors.jpg",
						"std" => "",
						"type" => "color");	
						
	$options[] = array( "name" => __('Carousel layout ?', 'eo_theme'),
						"id" => "slider_p",
						"group" => "carousel",
						"std" => "full",
						"type" => "select",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3| col-md-4 col-lg-3 stack'),
						"force_clear" => "visible-md",
						"options" => array('full' => 'Full', 'contain' => 'Contained')
						);
						
	$options[] = array( "name" => __('Carousel effect', 'eo_theme'),
						"id" => "caru_eff",
						"group" => "carousel",
						"std" => "slide",
						"type" => "select",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3| col-md-4 col-lg-3 stack'),
						"force_clear" => "visible-lg",
						"options" => array('slide' => 'Slide', 'fade' => 'Fade')
						);
						
	$options[] = array( "name" => __('What to display ?', 'eo_theme'),
						"id" => "caru_whtd",
						"group" => "carousel",
						'std' => array("post"),
						'type' => 'multiselect',
						'options' => $post_types,
				//		"force_clear" => "visible-md visible-lg",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3| col-md-4 col-lg-3 stack'),
					//	"options" => array('posts' => 'Posts', 'pages' => 'Pages')
						);

	$options[] = array( "name" => __('No# posts in slider', 'eo_theme'),
						"desc" => "Number of posts to show.",
						"id" => "slider_postcnt",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => "3",
				//		"force_clear" => "visible-lg",
						"type" => "text");
						
	$options[] = array( "name" => __('Slider Cat.', 'eo_theme'),
						"desc" => "Slider posts category to show.",
						"id" => "slider_postcat",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => key(eo_get_q_cats()),
						"options" => eo_get_q_cats(),
						"type" => "select");
						
	$options[] = array( "name" => __('Include IDs', 'eo_theme'),
						"desc" => "Specify post IDs to retrieve | Comma (,) seperated IDs Ex: 1,22,217.",
						"id" => "caru_incl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "carousel",
						"placeholder" => "Example: 2,15,417",
						"type" => "text");
						
	$options[] = array( "name" => __('Exclude IDs', 'eo_theme'),
						"desc" => "Specify post IDs NOT to retrieve | Comma (,) seperated IDs Ex: <em>1,22,217</em>",
						"id" => "caru_excl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "carousel",
						"placeholder" => "Example: 1,22,217",
						"type" => "text");
						
	$options[] = array( "name" => __('Also exclude', 'eo_theme'),
						"desc" => "Please note that for modules with <b>RANDOM</b> order the IDs wont match for the preceding modules since the modules are executed and IDs are saved in the order they are displayed.",
						"id" => "caru_excl",
						"group" => "carousel",
				//		'std' => array(),
						'type' => 'multiselect',
						'options' => array(
							'high' => 'Highlight posts',
							'feat' => 'Featurette posts',		
						),
						"class" => "col-md-4 col-lg-3",
						);
	
	$options[] = array( "name" => __('Order by', 'eo_theme'),
						"desc" => "Order posts by",
						"id" => "slider_ord_by",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => "date",
						"options" => eo_order_by_arr(),
						"type" => "select");				
	$options[] = array( "name" => __('Order &darr; &uarr;', 'eo_theme'),
						"desc" => "Order asc&uarr;-desc&darr;.",
						"id" => "slider_ord",
						"class" => eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => "DESC",
						"force_clear" => "visible-md visible-lg",
						"options" => eo_order_arr(),
						"type" => "select");				
	$options[] = array( "name" => __('Autoplay', 'eo_theme'),
						"desc" => "Autoplay.",
						"id" => "caru_autop",
						"std" => "1",
						"group" => "carousel",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"type" => "checkbox");
	$options[] = array( "name" => __('Pause', 'eo_theme'),
						"desc" => "Pause on hover.",
						"id" => "caru_pause",
						"std" => "1",
						"group" => "carousel",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"type" => "checkbox");
	$options[] = array( "name" => __('Continous', 'eo_theme'),
						"desc" => "Continous -infinite slides, OFF for only playing each slide ONCE.",
						"id" => "caru_cont",
						"std" => "1",
						"group" => "carousel",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"type" => "checkbox");
	$options[] = array( "name" => __('Interval', 'eo_theme'),
						"desc" => "In miliseconds ex: 5000 for 5seconds. Minimum 1000. Time each slide displays",
						"id" => "caru_interval",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => "5000",
						"type" => "text");
	$options[] = array( "name" => __('Prevent overflow', 'eo_theme'),
						"desc" => "It may stretch down too much if your image is vertical or stretches too much.",
						"id" => "caru_of_prevent",
						"std" => "1",
						"group" => "carousel",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"type" => "checkbox");						
	$options[] = array( "name" => __('Max. height', 'eo_theme'),
						"desc" => "Value in px.",
						"id" => "caru_of_prevent_h",
						"class" => "trigger ".eo_opt_dept('show_slider','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "carousel",
						"std" => "320px",
						"type" => "text");
						
	$options[] = array( "name" => __('Highlights on home', 'eo_theme'),
						"desc" => "Display highlights on home.",
						"id" => "show_highlights",
						"std" => "1",
						"group" => "highlights",
						"class" => eo_opt_dept('show_highlights','1','col-md-4 col-lg-3| col-md-4 col-lg-3','trigger'),
						"type" => "checkbox");
	
	$options[] = array( "name" => __('Also display on', 'eo_theme'),
						"desc" => "Select pages to also display on.",
						"id" => "high_also_disp",
						"group" => "highlights",
				//		"std" => key(eo_get_q_pages()),
						"type" => "multiselect",
						"class" => "col-md-4 col-lg-3",
						"options" => eo_get_q_pages()
						);					
	
	$options[] = array( "name" => __('What to display ?', 'eo_theme'),
						"id" => "highl_whtd",
						"group" => "highlights",
						'std' => array("post"),
						'type' => 'multiselect',
						"force_clear" => "visible-md",
						'options' => $post_types,
						"class" => eo_opt_dept('show_highlights','1','col-md-4 col-lg-3| col-md-4 col-lg-3 stack'),

						);			
	$options[] = array( "name" => __('No# posts in Highlights', 'eo_theme'),
						"desc" => "Number of posts to show.",
						"id" => "highl_postcnt",
						"class" => "col-md-4 col-lg-3",
						"group" => "highlights",
						"std" => "4",
						"force_clear" => "visible-lg",
						"type" => "text");
						
	$options[] = array( "name" => __('Highlights Cat.', 'eo_theme'),
						"desc" => "Highlights posts category to show.",
						"id" => "highl_postcat",
						"class" => "col-md-4 col-lg-3",
						"group" => "highlights",
						"std" => key(eo_get_q_cats()),
						"options" => eo_get_q_cats(),
						"type" => "select");
	
	$options[] = array( "name" => __('Include IDs', 'eo_theme'),
						"desc" => "Specify post IDs to retrieve | Comma (,) seperated IDs Ex: 1,22,217.",
						"id" => "high_incl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "highlights",
						"placeholder" => "Example: 2,15,417",
						"type" => "text");
						
	$options[] = array( "name" => __('Exclude IDs', 'eo_theme'),
						"desc" => "Specify post IDs NOT to retrieve | Comma (,) seperated IDs Ex: <em>1,22,217</em>",
						"id" => "high_excl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "highlights",
						"placeholder" => "Example: 1,22,217",
						"type" => "text");
						
	$options[] = array( "name" => __('Also exclude', 'eo_theme'),
						"desc" => "Please note that for modules with <b>RANDOM</b> order the IDs wont match for the preceding modules since the modules are executed and IDs are saved in the order they are displayed.",
						"id" => "high_excl",
						"group" => "highlights",
				//		'std' => array(),
						'type' => 'multiselect',
						'options' => array(
							'caru' => 'Carousel posts',
							'feat' => 'Featurette posts',		
						),
						"class" => "col-md-4 col-lg-3",
						);
						
	$options[] = array( "name" => __('Order by', 'eo_theme'),
						"desc" => "Order posts by",
						"id" => "highl_ord_by",
						"class" => eo_opt_dept('show_highlights','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "highlights",
						"std" => "date",
						"options" => eo_order_by_arr(),
						"type" => "select");				
	$options[] = array( "name" => __('Order &darr; &uarr;', 'eo_theme'),
						"desc" => "Order asc&uarr;-desc&darr;.",
						"id" => "highl_ord",
						"class" => eo_opt_dept('show_highlights','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "highlights",
						"std" => "DESC",
						"options" => eo_order_arr(),
						"type" => "select");
						
	$options[] = array( "name" => __('Featurettes on home', 'eo_theme'),
						"desc" => "Display featurettes on home.",
						"id" => "show_featurettes",
						"std" => "1",
						"group" => "featurettes",
						"class" => eo_opt_dept('show_featurettes','1','col-md-4 col-lg-3|col-md-4 col-lg-3','trigger'),
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Also display on', 'eo_theme'),
						"desc" => "Select pages to also display on.",
						"id" => "feat_also_disp",
						"group" => "featurettes",
				//		"std" => key(eo_get_q_pages()),
						"type" => "multiselect",
						"class" => "col-md-4 col-lg-3",
						"options" => eo_get_q_pages()
						);	
						
	$options[] = array( "name" => __('What to display ?', 'eo_theme'),
						"id" => "feat_whtd",
						"group" => "featurettes",
						'std' => array("post"),
						'type' => 'multiselect',
						'options' => $post_types,
						"force_clear" => "visible-md",
						"class" => eo_opt_dept('show_featurettes','1','col-md-4 col-lg-3| col-md-4 col-lg-3 stack'),
						);					
	$options[] = array( "name" => __('No# posts in featurettes', 'eo_theme'),
						"desc" => "Number of posts to show.",
						"id" => "feat_postcnt",
						"class" => "col-md-4 col-lg-3",
						"group" => "featurettes",
						"std" => "1",
						"force_clear" => "visible-lg",
						"type" => "text");
						
	$options[] = array( "name" => __('Featurettes Cat.', 'eo_theme'),
						"desc" => "Featurettes posts category to show.",
						"id" => "feat_postcat",
						"class" => "col-md-4 col-lg-3",
						"group" => "featurettes",
						"std" => key(eo_get_q_cats()),
						"options" => eo_get_q_cats(),
						"type" => "select");
						
		$options[] = array( "name" => __('Include IDs', 'eo_theme'),
						"desc" => "Specify post IDs to retrieve | Comma (,) seperated IDs Ex: 1,22,217.",
						"id" => "feat_incl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "featurettes",
						"placeholder" => "Example: 2,15,417",
						"type" => "text");
						
	$options[] = array( "name" => __('Exclude IDs', 'eo_theme'),
						"desc" => "Specify post IDs NOT to retrieve | Comma (,) seperated IDs Ex: <em>1,22,217</em>",
						"id" => "feat_excl_ids",
						"class" => "col-md-4 col-lg-3",
						"group" => "featurettes",
						"placeholder" => "Example: 1,22,217",
						"type" => "text");
						
	$options[] = array( "name" => __('Also exclude', 'eo_theme'),
						"desc" => "Please note that for modules with <b>RANDOM</b> order the IDs wont match for the preceding modules since the modules are executed and IDs are saved in the order they are displayed.",
						"id" => "feat_excl",
						"group" => "featurettes",
				//		'std' => array(),
						'type' => 'multiselect',
						'options' => array(
							'caru' => 'Carousel posts',
							'high' => 'Highlight posts',		
						),
						"class" => "col-md-4 col-lg-3",
						);
						
	$options[] = array( "name" => __('Order by', 'eo_theme'),
						"desc" => "Order posts by",
						"id" => "feat_ord_by",
						"class" => eo_opt_dept('show_featurettes','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "featurettes",
						"std" => "date",
						"options" => eo_order_by_arr(),
						"type" => "select");				
	$options[] = array( "name" => __('Order &darr; &uarr;', 'eo_theme'),
						"desc" => "Order asc&uarr;-desc&darr;.",
						"id" => "feat_ord",
						"class" => eo_opt_dept('show_featurettes','1','col-md-4 col-lg-3|col-md-4 col-lg-3 stack'),
						"group" => "featurettes",
						"std" => "DESC",
						"options" => eo_order_arr(),
						"type" => "select");
						
						
	$options[] = array( "name" => __('Blog page -jumbotron- unit (*former -hero-)', 'eo_theme'),
						"group" => "jumbotron",
						"desc" => "Display blog jumbotron hero unit (*former -hero-)",
						"id" => "blog_jumbo",
						"std" => "0",
						"class" => eo_opt_dept('blog_jumbo','1','col-md-6|col-md-12'),
//						"class" => "col-md-6 col-lg-4",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('What to display in jumbotron -former hero- ?', 'eo_theme'),
						"id" => "jumbo_whtd",
						"group" => "jumbotron",
						"std" => "def_home",
						"type" => "select",
						"class" => eo_opt_dept('blog_jumbo','1','col-md-6|col-md-6 hide'),
						"options" => array('def_home' => 'Blog title & desc', 'a_page' => 'A page')
						);
						
	$options[] = array( "name" => __('Page to display in jumbotron', 'eo_theme'),
						"desc" => "Select the page to display in hero.",
						"id" => "jumbo_pid",
						"group" => "jumbotron",
						"std" => key(eo_get_q_pages()),
						"type" => "select",
						"class" => eo_opt_dept('blog_jumbo','1','col-md-6|col-md-6 hide'),
						"options" => eo_get_q_pages()
						);
						
						
						
	$options[] = array( "name" => __('Homepage page template jumbotron (old hero-unit) background color', 'eo_theme'),
						"desc" => "Default used if no color is selected.",
						"id" => "jumbo_bg_color",
						"group" => "jumbotron",
						"class" => eo_opt_dept('blog_jumbo','1','col-md-6 col-lg-4|col-md-6 col-lg-4 hide'),
						"std" => "",
						"type" => "color");
						
	//	_eo-todo: build multiple dependencies, for example display page selector only if Jumbo disp. is set to page.
						
	$options[] = array( "name" => __('Typography', 'eo_theme'),
						"type" => "heading",
						"icon" => "text-height"
						);
	$options[] = array( "name" => __('Refresh fonts from Google', 'eo_theme'),
		"type" => "info",
		"id" => "check_gwf",
		"group" => "Google Fonts",
		"class" => "col-md-5",
		"desc" => $gwf_update_button 
	);	
	$options[] = array( "name" => __('Google Webfont API key', 'eo_theme'),
						"desc" => 'You can use the one i created, but it has a 10,000 hit limit, if somehow the limit is exceeded, you might want to <a href="https://developers.google.com/fonts/docs/developer_api#Auth" target="_blank">get your own</a>.',
						"id" => "google_wf_apikey",
						"group" => "Google Fonts",
						"class" => "col-md-7",
						"type" => "text",
						"std" => "AIzaSyAMO-3ly3H7EJ801RbtRAQ2bkTqyVtGLoE"
	);
	$options[] = array( 'name' => 'Body Font',
	'desc' => 'Main Body Font.',
	'id' => 'eo_typo_body',
	'std' => array('size' => '14px', 'source' => 'os_font'),
	'group' => 'Font Choices',
	'type' => 'typography',
	'class' => 'eot'
	);
	$options[] = array( 'name' => 'Top Nav.',
	'desc' => 'Top Navigation Font',
	'id' => 'eo_typo_nav',
	'group' => 'Font Choices',
	'type' => 'typography',
	'std' => array('size' => '14px', 'source' => 'os_font')
	);	
	$options[] = array( 'name' => 'Headings',
	'desc' => 'Post & Widget titles, headings - h1, h2.',
	'id' => 'eo_typo_heading',
	'group' => 'Font Choices',
	'type' => 'typography',
	'std' => array('color' => '', 'source' => 'os_font'),
	'options' => array(
			'sizes' => false,
		)
	);		
	
	$options[] = array( "name" => __('Lead paragraph', 'eo_theme'),
						"desc" => "Check to add a .lead class to the first paragraph to emphasize opening line",
						"id" => "use_leadp",
						"group" => "Formatting",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Dropcaps', 'eo_theme'),
						"desc" => "Check to use Drop caps for the first letter",
						"id" => "use_dropcaps",
						"group" => "Formatting",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "0",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Link Color', 'eo_theme'),
						"desc" => "Default used if no color is selected.",
						"id" => "link_color",
						"group" => "Link Text",
						'class' => 'col-md-6 col-lg-4',
						"std" => "",
						"type" => "color");
					
	$options[] = array( "name" => __('Link:hover Color', 'eo_theme'),
						"desc" => "Default used if no color is selected.",
						"id" => "link_hover_color",
						"group" => "Link Text",
						'class' => 'col-md-6 col-lg-4',
						"std" => "",
						"type" => "color");
						
	$options[] = array( "name" => __('Link:active Color', 'eo_theme'),
						"desc" => "Default used if no color is selected.",
						"id" => "link_active_color",
						'class' => 'col-md-6 col-lg-4',
						"group" => "Link Text",
						"std" => "",
						"type" => "color");
						
	$options[] = array( "name" => __('Customize', 'eo_theme'),
						"type" => "heading",
						"icon" => "tasks"
						);
						
	$options[] = array( "name" => __('Site name', 'eo_theme'),
						"desc" => "Check to show the site name in the navbar",
						"id" => "site_name",
						"group" => "Top Nav",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Trim Site name', 'eo_theme'),
						"desc" => "Long titles usually look awkward..Trims title to 20 chars..",
						"id" => "trim_site_title",
						"group" => "Top Nav",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Position', 'eo_theme'),
						"desc" => "Fixed to the top of the window or scroll with content.",
						"id" => "nav_position",
						"std" => "scroll",
						"type" => "select",
						"group" => "Top Nav",
						"class" => "mini col-sm-6 col-md-4 col-lg-3", //mini, tiny, small
						"options" => $fixed_scroll);
			
	$options[] = array( "name" => __('Select menu', 'eo_theme'),
						"desc" => "Check to use more mobile friendly -select- menu instead of default toggle menu",
						"id" => "nav_select_menu",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"std" => "1",
						"force_clear" => "visible-lg",
						"prev" => "mobile-select.jpg",
						"type" => "checkbox");		
	
	$options[] = array( "name" => __('Style', 'eo_theme'),
						"desc" => "Default / Inverse color scheme for navbar.",
						"id" => "nav_pref",
						"std" => "default",
						"type" => "select",
						"group" => "Top Nav",
						"class" => "mini col-sm-6 col-md-4 col-lg-3", //mini, tiny, small
						"options" => array("default" => "Default", "inverse" => "Inverse")
					);
						
	$options[] = array( "name" => __('Nav bg color', 'eo_theme'),
						"desc" => "Default used if no color is selected.",
						"id" => "top_nav_bg_color",
						"group" => "Top Nav",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "",
						"prev" => "tnav_col.jpg",
						"type" => "color");
						
	$options[] = array( "name" => __('Use gradient', 'eo_theme'),
						"desc" => "Check to use a gradient for top nav background",
						"id" => "showhidden_gradient",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"std" => "",
						"prev" => "tnav_col.jpg",
						"type" => "checkbox");
	
	$options[] = array( "name" => __('Bottom gradient color', 'eo_theme'),
						"desc" => "Top nav background color used as top gradient color.",
						"id" => "top_nav_bottom_gradient_color",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"std" => "",
						"prev" => "tnav_col.jpg",
			//			"class" => eo_opt_dept('showhidden_gradient','1') ." col-sm-6 col-md-4 col-lg-3",
						"force_clear" => "visible-lg",
						"type" => "color");
						
	$options[] = array( "name" => __('Top nav item color', 'eo_theme'),
						"desc" => "Link color.",
						"id" => "top_nav_link_color",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"prev" => "tnav_col.jpg",
						"force_clear" => "visible-md",
						"std" => "",
						"type" => "color");
						
	$options[] = array( "name" => __('Top nav item hover color', 'eo_theme'),
						"desc" => "Link hover color.",
						"id" => "top_nav_link_hover_color",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"prev" => "tnav_col.jpg",
						"std" => "",
						"type" => "color");
						
	$options[] = array( "name" => __('Top nav dropdown item color', 'eo_theme'),
						"desc" => "Dropdown item color.",
						"id" => "top_nav_dropdown_item",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"std" => "",
						"prev" => "tnav_col.jpg",
						"type" => "color");
						
	$options[] = array( "name" => __('Top nav dropdown item hover bg color', 'eo_theme'),
						"desc" => "Background of dropdown item hover color.",
						"id" => "top_nav_dropdown_hover_bg",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Top Nav",
						"std" => "",
						"type" => "color");
	
	$options[] = array( "name" => __('Search bar', 'eo_theme'),
						"desc" => "Show search bar in top nav",
						"id" => "search_bar",
						"group" => "Top Nav",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Custom markup', 'eo_theme'),
						"desc" => "Default WP markup doesnt fit bootstrap, so custom nav walker classes are included ",
						"id" => "custom_nav_markup",
						"group" => "Top Nav",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");

	$options[] = array( "name" => __('FootLeft', 'eo_theme'),
						"desc" => "Copyright text &copy; in footer left",
						"group" => "Footer",
						"class" => "col-sm-12 col-md-4 col-lg-4",
						"id" => "foot_copy_left",
						"type" => "textarea");	
	$options[] = array( "name" => __('FootRight', 'eo_theme'),
						"desc" => "Footer text &copy; in footer right",
						"group" => "Footer",
						"class" => "col-sm-4 col-md-4 col-lg-4",
						"id" => "foot_copy_right",
						"type" => "textarea");	
	$options[] = array( "name" => __('Sticky Footer', 'eo_theme'),
						"desc" => "Make the footer stick to the bottom",
						"id" => "sticky_footer",
						"class" => "col-sm-6 col-md-2 col-lg-2",
						"group" => "Footer",
						"prev" => "sticky.jpg",
						"std" => "0",
						"type" => "checkbox");
	$options[] = array( "name" => __('T.author link', 'eo_theme'),
						"desc" => "Show a link back to theme's author in footer right.",
						"id" => "foot_linkback",
						"group" => "Footer",	
						"class" => "col-sm-6 col-md-2 col-lg-2",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Suppress -Comments are closed- message', 'eo_theme'),
						"desc" => "Suppress 'Comments are closed' message",
						"id" => "suppress_comments_message",
						"group" => "others",
						"std" => "1",
						"type" => "checkbox"
					);					

	$options[] = array( "name" => __('Theme', 'eo_theme'),
						"type" => "heading",
						"icon" => "picture");
						/*
	$options[] = array( "name" => __('Refresh themes from Bootswatch', 'eo_theme'),
					"type" => "info",
					"group" => "Bootswatch Themes",
					"class" => "col-sm-6",					
					"id" => "themecheck",
					"desc" => $update_button
				);		*/
						
	$options[] = array( "name" => __('Bootswatch.com Themes', 'eo_theme'),
						"desc" => "Use theme from bootswatch.com.",
						"id" => "use_bsw_themes",
						"group" => "Bootswatch Themes",	
						"class" => "col-sm-6",					
						"std" => "0",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Style Superiority', 'eo_theme'),
						"desc" => "ON if you want selected Bootswatch sub-themes styles (fonts,colors) to override theme options. Otherwise OFF if you want theme settings to override Bootswatch sub-theme. In other words; leave it ON if you'd like the sub-theme as is, turn OFF to customize further based upon the sub-theme.",
						"id" => "bsw_theme_sup",
						"group" => "Bootswatch Themes",
						"class" => "col-sm-6",		
						"prev" => "bsw_sup.jpg",			
						"std" => "1",
						"force_clear" => "hidden-xs",
						"type" => "checkbox");
		
	$options[] = array( "name" => __('Select a theme', 'eo_theme'),
						"id" => "bsw_theme",
						"desc" => __('Do not forget to turn previous option ON to use themes.', 'eo_theme'),
						"group" => "Bootswatch Themes",
						"std" => "default",
						"class" => eo_opt_dept('use_bsw_themes','1'),
						"type" => "images",
						"options" => $theList,
						"imgclass" => "eo_themethumb img-thumbnail col-sm-6 col-md-4 col-lg-3"
						);
	$options[] = array( "name" => __('Use selected theme for admin too', 'eo_theme'),
						"desc" => "Apply the same theme to admin options panel.",
						"id" => "use_bsw_theme_admin",
						"group" => "Bootswatch Themes",
						"class" => eo_opt_dept('use_bsw_themes','1'),
						"std" => "0",
						"type" => "checkbox");
		
	$options[] = array( "name" => __('Xtend', 'eo_theme'),
						"type" => "heading",
						"icon" => "gift"
						);		
										
	$options[] = array( "name" => __('Lightbox', 'eo_theme'),
						"desc" => "Use lightbox -colorbox-",
						"id" => "use_lightbox",
						"group" => "extensions",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Font Awesome', 'eo_theme'),
						"desc" => "Use fontawesome",
						"id" => "use_fontawesome",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "extensions",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Infinte Scroll', 'eo_theme'),
						"desc" => "Load posts via ajax without going to next page",
						"id" => "inf_scroll",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "extensions",
						"std" => "0",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('.Chosen', 'eo_theme'),
						"desc" => "Make your select - dropdown boxes nicer.",
						"id" => "use_chosen_fe",
						"prev" => "load_chosen.jpg",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "extensions",
						"std" => "none",
						"options" => array("none"=>"NO","cl_chosen"=>"selects with .chosen class","all"=>"ALL selects"),
						"type" => "select");
						
	$options[] = array( "name" => __('Place[holder].js', 'eo_theme'),
						"desc" => "Create fun placeholder images via js for posts that dont have featured img",
						"id" => "use_placeholder",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "extensions",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Placeholder img', 'eo_theme'),
						"desc" => "If you dont want the js method; use a placeholder img for posts that dont have featured img",
						"id" => "use_placeholder_img",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "extensions",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Dev.', 'eo_theme'),
						"type" => "heading",
						"icon" => "cog"
						);						
	$options[] = array( "name" => __('Load via LESS', 'eo_theme'),
					//	"desc" => "You can disable it for whatever reason.",
						"id" => "use_less",
						"std" => "0",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "development",
						"type" => "checkbox");
	
	$options[] = array(
						'name' => __('LESS Resources', 'eo_theme'),
						'desc' => __('Resources to load via LESS.', 'eo_theme'),
						'id' => 'use_less_for',
						//'std' => array("bootstrap" => "1", "some_other" => "1"),
						'std' => array("bootstrap","fontawesome"),
						'type' => 'multiselect',
						"group" => "development",
						"class" => eo_opt_dept('use_less','1','col-sm-6 col-md-4 col-lg-3|col-sm-6 col-md-4 col-lg-3'),
						'options' => array(
							"bootstrap" => "Bootstrap",
							"fontawesome" => "Fontawesome"
						//	"some_other" => "Some Other"
						)
					);
					/*
		$options[] = array( "name" => __('Use minified JS', 'eo_theme'),
						"desc" => "Use minified sources for javascripts where available .",
						"id" => "use_min_res",
						"std" => "0",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "development",
						"type" => "checkbox");*/
		$options[] = array( "name" => __('Override.css ?', 'eo_theme'),
						"desc" => "Enable rsc/css/override.css file at the end of <head> so that it overrides everything else.",
						"id" => "override_css",
						"std" => "0",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "development",
						"type" => "checkbox");
					/*
	$options[] = array(
		'name' => __('Multiselect', 'options_framework_theme'),
		'desc' => __('Multiselect description.', 'options_framework_theme'),
		'id' => 'example_multiselect',
		'std' => $multicheck_defaults, // These items get selectd by default
		'type' => 'multiselect',
		'options' => $multicheck_array);*/
	
		/*				
	$options[] = array( "name" => __('LESS Resources",
						"desc" => "Resources to load via LESS.",
						"id" => "use_less_for",
					//	"std" => "default",
						"type" => "select",
						"class" => eo_opt_dept('use_less','1'),
						"group" => "development",
						"multiple" => "yes",
					//	"class" => "mini col-sm-6 col-md-4 col-lg-3", //mini, tiny, small
						"options" => array("bootstrap" => "Bootstrap", "fontawesome" => "Fontawesome")
						);*/

	$options[] = array( "name" => __('Load Bootsrap.JS -all', 'eo_theme'),
						"desc" => "Only turn this off if you will load Javascript files individually in the next option.",
						"id" => "load_bs_fe",
						"group" => "development",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
	$options[] = array( "name" => __('Bootstrap .min ?', 'eo_theme'),
			//			"desc" => "You can disable it for whatever reason.",
						"id" => "use_bs_min_fe",
						"std" => "1",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "development",
						"desc" => "Use .minified sources for optimized loading speed. Warning: might cause conflicts",
						"type" => "checkbox");	
	$options[] = array(
						'name' => __('Load Bootstrap jses individually', 'eo_theme'),
						'desc' => __('Dont forget to turn previous option OFF. If you dont need them all, select which ones to load.', 'eo_theme'),
						'id' => 'bs_js_seperate',
//						'std' => array("bootstrap","fontawesome"),
						'type' => 'multiselect',
						"group" => "development",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						'options' => array("affix" => "Affix",
							"alert" => "Alert",
							"button" => "Button",
							"carousel" => "Carousel",
							"collapse" => "Collapse",
							"dropdown" => "Dropdown",
							"modal" => "Modal",
							"popover" => "Popover",
							"scrollspy" => "Scrollspy",
							"tab" => "Tab",
							"tooltip" => "Tooltip",
							"transition" => "Transition"
						)
					);					
		$options[] = array(
						'name' => __('Dashboard Boxes', 'eo_theme'),

						'desc' => __('You can use this to empty your dashboard and remove unnecessary wp meta boxes in main wp-admin dahboard.', 'eo_theme'),
						'id' => 'adm_remove_dash_boxes',
						//'std' => array("bootstrap" => "1", "some_other" => "1"),
						'std' => array("dashboard_recent_drafts","dashboard_incoming_links"),
						'type' => 'multiselect',
						"group" => "development",
						"class" =>"col-sm-6 col-md-4 col-lg-3",
						'options' => $dashboxes
					);
											
	$options[] = array( "name" => __('Panel', 'eo_theme'),
						"type" => "heading",
						"icon" => "wrench"
						);
						
	$options[] = array( "name" => __('Admin Top Nav', 'eo_theme'),
						"desc" => "You may want to enable top nav in smaller screens to save vertical space and use the left menu, or alternatively show it always or never show at all",
						"id" => "top_nav_adm_show",
						"group" => "Panel Preferences",
						"class" => "col-md-4",
						"std" => "always",
						"options" => array("hidden-sm"=>"Larger screens","hidden"=>"Never","always"=>"Always"),
						"type" => "select");
						
	$options[] = array( "name" => __('Admin Side Menu Nav', 'eo_theme'),
						"desc" => "You may want to disable top nav in smaller screens to save vertical space and use the left menu, or alternatively show it always or never show at all",
						"id" => "side_menu_adm_show",
						"group" => "Panel Preferences",
						"class" => "col-md-4",
						"std" => "auto-l",
						"options" => array("auto-l"=>"Auto-left","auto-r"=>"Auto-right","hidden"=>"Never"),
						"type" => "select");
						
	$options[] = array( "name" => __('Expand Panel?', 'eo_theme'),
						"desc" => "Change only if you have a large monitor, expands the container to 1600px or fluid 100% to take much as much space available.",
						"id" => "xl_adm",
						"class" => "col-md-4",
						"group" => "Panel Preferences",
						"std" => "default",
						"force_clear" => "visible-lg",
						"options" => array("default"=>"Default","xl"=>"XL-1600px","fluid"=>"Fluid-100%"),
						"type" => "select"
					);
						
	$options[] = array( "name" => __('Load chosen in admin?', 'eo_theme'),
						"desc" => "chosen is a very useful jquery plugin for enhancing select inputs, comes very handy when sorting out of many options like Google fonts especially.",
						"id" => "load_chosen_adm",
						"std" => "1",
						"prev" => "load_chosen.jpg",
						"group" => "Panel Preferences",
						"class" => "col-sm-6 col-md-4 col-lg-3",
					//	"preq" => "js|bs",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Collapse WP menu', 'eo_theme'),
						"desc" => "Always collapse the left wp menu on theme options page unless you expand it.",
						"id" => "coll_wp_menu",
						"group" => "Panel Preferences",
						"std" => false,
						"prev" => "coll_wp_menu.jpg",
						"preq" => array("js" => "Requires js to <b>uncollapse</b> since its almost impossible to play with admin body classes",
										"opt" => "Requires X option to be Y"
										),
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Popover opt. prev.', 'eo_theme'),
						"desc" => "Popover images for quick preview. You can disable them if you already know what you're doing",
				//		"class" => eo_opt_dept('load_bs_adm','1'),
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"id" => "prev_pop",
						"group" => "Panel Preferences",
						"std" => "1",
						"prev" => "prev_pop.jpg",
						"type" => "checkbox");				
						
	$options[] = array( "name" => __('ON/OFF Checkboxes ?', 'eo_theme'),
						"desc" => "turn checkboxes into ON/OFF switch.",
						"id" => "adm_cbox",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Panel Preferences",
						"std" => "1",
						"prev" => "adm_cbox.jpg",
						"type" => "checkbox");
	
	$options[] = array( "name" => __('Checkboxes Style', 'eo_theme'),
						"desc" => "Checkboxes switch sytle.",
						"id" => "cbox_style",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"group" => "Panel Preferences",
					//	"class" => eo_opt_dept('adm_cbox','1'),
						"std" => "droid",
						"prev" => "cbox_style.jpg",
						"options" => array("droid"=>"Android","ios5"=>"iOS5","win8"=>"Windows 8","google"=>"Google - Experimental"),
						"type" => "select");
	$options[] = array( "name" => __('T.author link admin', 'eo_theme'),
						"desc" => "Show a link back to theme's author in admin footer right.",
						"id" => "auth_l_adm",
						"group" => "Panel Preferences",	
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");
						
	$options[] = array( "name" => __('Bootstrap Admin', 'eo_theme'),
						"desc" => "You can disable it for whatever reason.",
						"id" => "load_bs_adm",
						"group" => "Panel Preferences",
						"prev" => "load_bs_adm.jpg",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "1",
						"type" => "checkbox");					
	
	/*$options[] = array( "name" => 'Backup Settings',
						"type" => "free_html",
						'desc' => $optsave_link_html,
						"group" => "Under the hood",
						"id" => "eo_save_all_opt",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "");*/
						
	$options[] = array( "name" => 'Delete Settings ?',
						"type" => "free_html",
						'desc' => $del_link_html,
						"group" => "Under the hood",
						"id" => "eo_del_all_o",
						"class" => "col-sm-6",
						"std" => "");
/*						
	$options[] = array( "name" => __('Backup Settings', 'eo_theme'),
						"desc" => "Copy these text to backup your settings",
						"group" => "Under the hood",
						"class" => "col-sm-12 col-md-4 col-lg-3",
						"id" => "backup_sett",
						"type" => "textarea");
						
	$options[] = array( "name" => 'Delete Options & Settings ?',
						"type" => "free_html",
						'desc' => $del_link_html,
						"group" => "Under the hood",
						"id" => "eo_del_all_o",
						"class" => "col-sm-6 col-md-4 col-lg-3",
						"std" => "");
						
	$options[] = array( "name" => __('Import Settings', 'eo_theme'),
						"desc" => "Select one from available backups",
						"group" => "Under the hood",
						"class" => "col-sm-12 col-md-4 col-lg-4",
						"id" => "import_sett",
						"type" => "select",
						"options" => eo_get_import_options());
						
						   if(!is_writable($targetDir))  die('You cannot upload to the specified directory, please CHMOD it to 777.');*/

						
	$options[] = array( "name" => 'Delete Transients ?',
						"type" => "free_html",
						"group" => "Under the hood",
						'desc' => $del_trans_link_html,
						"id" => "eo_del_trans_o",
						"class" => "col-sm-6",
						"std" => "");		
	$options[] = array( "name" => __('Test', 'eo_theme'),
						"icon" => "stats",
						"type" => "heading");					
	$options[] = array( "name" => 'Test the theme',
					"type" => "info",
					'desc' => '<a href="'.$tmpuri.'/docs/index.php?page=bswtest" class="btn btn-info" target="_blank" class="tess">Click here to view test page </a>',
					"id" => "eo_bswtest",
					"std" => "");	
					
	$options[] = array( "name" => __('About', 'eo_theme'),
						"type" => "heading",
						"icon" => "info-sign");	
						
	$options[] = array( "name" => 'A few tips and tricks to keep in mind',
						"type" => "free_html",
						"group" => "tips",
						'desc' => '<div class="list-group">
						<a class="list-group-item active thickbox" title="Use the string  <code>[dd-ph]</code> in your menu / page title to disable the link and act like placeholder. Dont worry it wont show up in front end." href="'.get_template_directory_uri().'/panel/rsc/img/preview/menu-sample.jpg"><span class="glyphicon glyphicon-zoom-in"></span> Use <code>[dd-ph]</code> in your menu-page title to disable the link and act like placeholder </a>
						<a class="list-group-item active thickbox" title="Menu items / pages marked with <code>[dd-ph]</code> will appear as  <code>&lt;optgroup&gt;&lt;/script&gt;</code> in your mobile select menu" href="'.get_template_directory_uri().'/panel/rsc/img/preview/ddph-optgr.jpg"><span class="glyphicon glyphicon-zoom-in"></span>Menu items/pages marked with <code>[dd-ph]</code> will also appear as  <code>&lt;optgroup&gt;&lt;/optgroup&gt;</code> in your mobile select menu</a>
						<a class="list-group-item active thickbox" title="Add <code>fa_icon</code> ex: fa_home to insert home icon" href="'.get_template_directory_uri().'/panel/rsc/img/preview/fa_menu.jpg"><span class="glyphicon glyphicon-zoom-in"></span>Add <code>fa_icon</code> ex: fa_home to insert home icon</a>
						<a class="list-group-item active thickbox" title="Use <code>.cboxElement</code> class in your links to activate lightbox. Use <code>.cbinl</code> & <code>.cbinr</code> classes to make them inline and float L-R." href="'.get_template_directory_uri().'/panel/rsc/img/preview/inline_lbox.jpg"><span class="glyphicon glyphicon-zoom-in"></span> Use <code>.cboxElement</code> class in your links to activate lightbox. Use <code>.cbinl</code> & <code>.cbinr</code> classes to make them inline and float L-R.</a>
						<a class="list-group-item active thickbox" title="Dont add <code>&lt;style&gt;&lt;/style&gt;</code> or <code>&lt;script&gt;&lt;/script&gt;</code> when you add Custom JS/CSS per post." href="'.get_template_directory_uri().'/panel/rsc/img/preview/cust_js_css_pp.jpg"><span class="glyphicon glyphicon-zoom-in"></span> Dont add <code>&lt;style&gt;&lt;/style&gt;</code> or <code>&lt;script&gt;&lt;/script&gt;</code> when you add Custom JS/CSS per post</a>
						<a href="http://wordpress.org/plugins/regenerate-thumbnails/" class="list-group-item" target="_blank">If this is not a new install, you should regenerate your thumbnails to recreate thumbs for already uploaded images in appropriate sizes</a>
						<a href="#" class="list-group-item">Hopefully more to come...</a>
          </div>
		  <a href="'.$tmpuri.'/docs/" target="_blank" class="btn btn-default"><span class="glyphicon glyphicon-file"></span> Documentation -work in progress.</a>',
						"id" => "eo_tips_tricks",
						"class" => "",
						"std" => "");
		
		$options[] = array( "name" => __('Please Review', 'eo_theme'),
						"desc" => $rv_msg,
						"id" => "support_msg",
						"group" => "tips",
						"type" => "free_html");	
		$options[] = array( "name" => __('Consider Donating', 'eo_theme'),
						"desc" => $pp_msg,
						"id" => "paypal_msg",
						"group" => "tips",
						"type" => "free_html");

/*
		// _eo-review: Review this when adding new font sections
		$eo_typo_opt = get_option('eo_typo_opt' );
		$chosen_fonts = array();
		// Create an empty array to save font options to prevent future multi includes or conflicts
		foreach ( $options as $opt_typo ) {
			if(array_key_exists("id",$opt_typo) && array_key_exists("type",$opt_typo) && $opt_typo["type"] == "typography" ) {
				 $typovals = eo_get_options($opt_typo["id"]);
				 if( $typovals["source"] == "gwf_font") {
					 $chosen_fonts[$typovals["face"]][] = $typovals["variant"];
				 }
			}
		}
		update_option('eo_typo_opt',$chosen_fonts);*/
	/*				
	if( get_option('eo_gen_opt_cl') ) {
		$opt_cl_gen = get_option('eo_gen_opt_cl');
	}
	else {
		$opt_cl_gen = array();
	}
	*/
	
	$opt_cl_gen["timest"] = time();
	foreach ( $options as $opt_cl_g ) {
		if(array_key_exists("id",$opt_cl_g) && array_key_exists("class",$opt_cl_g) ) {
			$optidd = $opt_cl_g["id"];
			$optcl = $opt_cl_g["class"];
			$opt_cl_gen[$optidd] = $optcl;
		//	var_dump("the cl to write:" . $optcl);
		}
		
	}
	update_option('eo_gen_opt_cl',$opt_cl_gen);
	//	var_dump("These will be writ: ".time());			
	//	var_dump($opt_cl_gen);	

	
	if ( get_option('eo_gen_opt_cl' ) ) {
		$gen_refine_cl = get_option('eo_gen_opt_cl' );
		$refined_opts = array();
		// Create an empty array to redefine opts
		foreach ( $options as $opt_refine ) {
		//	var_dump($opt_refine);
			if(array_key_exists("id",$opt_refine) && array_key_exists("class",$opt_refine) && !empty($opt_refine["class"]) ) {
				// If we have an $option["id"], and non empty class, get in there
				if(array_key_exists($opt_refine["id"],$gen_refine_cl) && ! empty($gen_refine_cl[$opt_refine["id"]]) ) {
				// Unnecessary check ? Check if optid exists in generated classes and the corresponding value is not empty
				
					$refine_id = $opt_refine["id"];
					// previously generated class val
					$refine_val = $gen_refine_cl[$refine_id];
					// Time to refine the $options[] -$opt_refine-
					
					$opt_refine["class"] = $refine_val." refined";
					/*
					foreach( $opt_refine as $key => $opt_redefine ) {
						//redefine every option array
						$refined_opts[$key] = array(
						
						);
					}
					$refined_opts[$refine_id] = $refine_val." refined";
					var_dump("this opt should be refined as:".$refine_val);*/
				}
			}
		}
	/*	$new_options = $options;
		var_dump("All refined opts ");
		var_dump($new_options);*/
	//	$options = $refined_opts;
	}
//	var_dump($options);
	return $options;
	
}
// Store the generated classes based on dependencies.. Might prove useful. _eo-review: Now that we store the created classes, run eo_opt_dept() only once instead of each option ?
//$opt_cl_get = optionsframework_options();

/**
 * Returns an array of system fonts
 * Feel free to edit this, update the font fallbacks, etc.
 */
function options_typography_get_os_fonts() {
	// OS Font Defaults
	$os_faces = array(
		'Arial, sans-serif' => 'Arial',
		'"Avant Garde", sans-serif' => 'Avant Garde',
		'Cambria, Georgia, serif' => 'Cambria',
		'Copse, sans-serif' => 'Copse',
		'Garamond, "Hoefler Text", Times New Roman, Times, serif' => 'Garamond',
		'Georgia, serif' => 'Georgia',
		'"Helvetica Neue", Helvetica, sans-serif' => 'Helvetica Neue',
		'Tahoma, Geneva, sans-serif' => 'Tahoma'
	);
	return $os_faces;
}
function get_selected_font_arr($slct_fnt) {
	$all_fonts = get_option("eo_googlefonts_arr");
	foreach ($all_fonts as $a_font ) {
			if (in_array($slct_fnt, $gfw_family)) {
					return $os_faces;
			}
	}
}


/**
 * Returns a select list of Google fonts
 * Feel free to edit this, update the fallbacks, etc.
 */
function options_typography_get_google_fonts() {
	// Google Font Defaults
	$google_faces = array(
		'Arvo, serif' => 'Arvo',
		'Copse, sans-serif' => 'Copse',
		'Droid Sans, sans-serif' => 'Droid Sans',
		'Droid Serif, serif' => 'Droid Serif',
		'Lobster, cursive' => 'Lobster',
		'Nobile, sans-serif' => 'Nobile',
		'Open Sans, sans-serif' => 'Open Sans',
		'Oswald, sans-serif' => 'Oswald',
		'Pacifico, cursive' => 'Pacifico',
		'Rokkitt, serif' => 'Rokkit',
		'PT Sans, sans-serif' => 'PT Sans',
		'Quattrocento, serif' => 'Quattrocento',
		'Raleway, cursive' => 'Raleway',
		'Ubuntu, sans-serif' => 'Ubuntu',
		'Yanone Kaffeesatz, sans-serif' => 'Yanone Kaffeesatz'
	);
	return $google_faces;
}

?>