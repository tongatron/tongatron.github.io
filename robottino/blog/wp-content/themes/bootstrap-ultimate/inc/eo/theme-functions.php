<?php
global $eo_options;
function eo_get_cons($v = null,$s = null) {
		$eo_const = get_option('eo_const');
		if( is_array($eo_const) ) {
			if (!isset ($v) ) {
				return $eo_const;
			}
			else if(array_key_exists($v,$eo_const) && !isset($s)) {
				return $eo_const[$v];
			}
			else if (isset($s) && is_array($eo_const[$v]) && array_key_exists($s,$eo_const[$v]) )  {
				return  $eo_const[$v][$s];
			}
			else {
				return false;
			};
		}
}

// Check Option function where option framework has not yet initiated
function eo_check_of_opt($optc = '',$optset = '') {
	global $theme_opt_slug;
	//var_dump($theme_opt_slug);
	$optionsframework_settings = get_option('optionsframework' );
	($theme_opt_slug) ? $the_opt_set = $theme_opt_slug : $the_opt_set = $optionsframework_settings['id'];
	($optset) ? $optm = $optset : $optm = $theme_opt_slug;
		// Option Set to check
	$opts = get_option( $optm );
	return ($optc || $optc != "all") ?  $opts[$optc] : $opts;	
}

// _eo-review: maybe a better way to detect child themes ?
function eo_get_template_part( $slug, $name = null ) {
	$eo_theme = '/child/default/';
	$file = get_template_directory().$eo_theme.$slug.'.php';
	if(file_exists($file)) {
		$slug = $eo_theme.$slug;
		//inc/carousel
	}
	do_action( 'get_template_part_' . $slug, $slug, $name );
	$templates = array();
	if ( isset( $name ) ) $templates[] = $slug . '-' . $name . '.php';
	$templates[] = $slug . '.php';
	locate_template($templates, true, false);
}

function eo_sanitize_id($att) {
	return	strtolower(str_replace(" ","_", esc_attr($att) ) );
}

if( of_get_option( 'custom_nav_markup') == "1" ) {
	require_once(get_template_directory().'/inc/core/menu_nav_walker.php'); // _custom nav walker
	require_once(get_template_directory().'/inc/core/menu_page_walker.php'); // _custom page walker
	
	function eo_main_nav() {
		wp_nav_menu(array(
			'container' => false,                           // remove nav container
			'container_class' => 'menu clearfix',           // class of container (should you choose to use it)
			'menu' => __( 'The Main Menu', 'bonestheme' ),  // nav name
			'menu_class' => 'top-nav clearfix',         // adding custom nav class
			'theme_location' => 'main-nav',                 // where it's located in the theme
			'before' => '',                                 // before the menu
			'after' => '',                                  // after the menu
			'link_before' => '',                            // before each link
			'link_after' => '',                             // after each link
			'depth' => 0,                                   // limit the depth of the nav
			'items_wrap'      => '<ul id="%1$s" class="%2$s nav navbar-nav">%3$s</ul>',
			'walker' => new eo_Walker_Nav_Menu(),
		//	'show_home' => true,
			'fallback_cb' => 'eo_main_nav_fallback'      // fallback function
		));
	}
}

if( $eo_options['nav_select_menu'] == "1" )  {
	require_once(get_template_directory().'/inc/core/mobile_menu_nav_walker.php'); // _custom nav walker
	require_once(get_template_directory().'/inc/core/mobile_menu_page_walker.php'); // _custom page walker
	
	function eo_mobile_nav_menu() {
		$mobnav = wp_nav_menu(array(
			'container' => false,                           // remove nav container
			'container_class' => 'menu clearfix',           // class of container (should you choose to use it)
			'menu' => __( 'The Main Menu', 'bonestheme' ),  // nav name
			'menu_class' => 'mobile-top-nav clearfix',         // adding custom nav class
			'theme_location' => 'main-nav',                 // where it's located in the theme
			'before' => '',
			'echo' => false,                                // echo
			'after' => '',                                  // after the menu
			'link_before' => '',                            // before each link
			'link_after' => '',                             // after each link
			'depth' => 0,                                   // limit the depth of the nav
			'items_wrap' => '<div class="row eo-mobile-select-wrap hidden-md hidden-lg"><form action="#" class="mobile-select-form form-inline"><div class="form-group col-xs-10"><select id="%1$s" class="%2$s nav mobile-navbar-nav eo-mobile-select-nav form-control" name="eo-mobile-select-nav">%3$s</select></div><div class="form-group col-xs-2"><input type="submit" class="ms_gobut form-control" value="Go"></div></form></div>',
			'walker' => new eo_mobile_Walker_Nav_Menu(),
		//	'show_home' => true,
			'fallback_cb' => 'eo_mobile_nav_fallback'      // fallback function
		));
		echo strip_tags($mobnav, '<div><select><option><form><input>' );
	}
	function eo_mobile_page_menu( $args = array() ) {
		$defaults = array('sort_column' => 'menu_order, post_title', 'menu_class' => 'menu', 'echo' => true, 'link_before' => '', 'link_after' => '');
		$args = wp_parse_args( $args, $defaults );
		$args = apply_filters( 'wp_page_menu_args', $args );
	
		$menu = '';
	
		$list_args = $args;
	//	var_dump($args);
		// Show Home in the menu
		if ( ! empty($args['show_home']) ) {
			if ( true === $args['show_home'] || '1' === $args['show_home'] || 1 === $args['show_home'] )
				$text = __('Home');
			else
				$text = $args['show_home'];
			$class = '';
			if ( is_front_page() && !is_paged() )
				$class = ' class="current_page_item active"';
				$slctd = ' selected="selected"';
			$menu .= '<option value="' . home_url( '/' ) . '"' . $class . $slctd . '>' . $args['link_before'] . $text . $args['link_after'] . '</option>';
			// If the front page is a page, add it to the exclude list
			if (get_option('show_on_front') == 'page') {
				if ( !empty( $list_args['exclude'] ) ) {
					$list_args['exclude'] .= ',';
				} else {
					$list_args['exclude'] = '';
				}
				$list_args['exclude'] .= get_option('page_on_front');
			}
		}
	
		$list_args['echo'] = false;
		$list_args['title_li'] = '';
		$list_args['walker'] = new eo_mobile_Walker_Page();
		
		$menu .= str_replace( array( "\r", "\n", "\t" ), '', wp_list_pages($list_args) );
		//var_dump($menu);
	
		if ( $menu )
		$select_cl = "eo-mobile-select-nav";
		if ( isset($_GET[$select_cl]) ) {
			$get_selected = $_GET[$select_cl];
			header('Location: '.$get_selected);
		}

			$menu = '<div class="form-group col-xs-10"><select class="' . esc_attr($args['select_class']) . '" name="eo-mobile-select-nav">' . $menu . '</select></div>';
	
		$menu = '<div class="row eo-mobile-select-wrap visible-xs visible-sm"><form action="" class="' . esc_attr($args['menu_class']) . '">' . $menu . "<div class='form-group col-xs-2 col-sm-2'><input type='submit' class='ms_gobut form-control' value='Go'></div></form></div>\n";
		$menu = apply_filters( 'wp_page_menu', $menu, $args );
		
		
		if ( $args['echo'] )
			echo $menu;
		else
			return $menu;
	}
	function eo_mobile_nav_fallback() {
		eo_mobile_page_menu( array(
			'show_home' => true,
			'menu_class' => 'top-nav-mobile tnav_m_fback form-inline',      // adding custom nav class
			'select_class' => 'eo-mobile-select-nav form-control',      // adding custom nav class
		//	'include'     => 9999,
		//	'show_home' => true,
			'exclude'     => '',
			'echo'        => true,
			'link_before' => '',                            // before each link
			'link_after' => ''                             // after each link
		) );
	}
}

function eo_page_navi($maxpn=NULL) {
	global $wp_query;
	(isset($maxpn)) ? $maxnum = $maxpn : $maxnum = $wp_query->max_num_pages;
	$bignum = 999999999;
	if ( $wp_query->max_num_pages <= 1 )
		return;
	
	echo '<nav class="pagination">';
	
		$pag_links = paginate_links( array(
			'base' 			=> str_replace( $bignum, '%#%', esc_url( get_pagenum_link($bignum) ) ),
			'format' 		=> '',
			'current' 		=> max( 1, get_query_var('paged') ),
			'total' 		=> $maxnum,
			'prev_text' 	=> '&larr;',
			'next_text' 	=> '&rarr;',
			'type'			=> 'list',
			'end_size'		=> 3,
			'mid_size'		=> 3
		) );
		echo str_replace("page-numbers","page-numbers pagination",$pag_links);

	
	echo '</nav>';
}
function eo_snippet( $str, $wcnt = 2, $excl ='' ) {
	(isset($excl) ) ? $qta = array("'",",","&#8217;",$excl) : $qta = array("'",",","&#8217;") ;
	$str = str_replace($qta,"",$str);
  return implode( 
    '', 
    array_slice( 
      preg_split(
        '/([\s,\.;\?\!]+)/', 
        $str, 
        $wcnt*2+1, 
        PREG_SPLIT_DELIM_CAPTURE
      ),
      0,
      $wcnt*2-1
    )
  );
}
function eo_get_gen_clss($id = null) {
	// Return requested / all generated class
	if( get_option('eo_gen_opt_cl') ) $gen_opt_clss = get_option('eo_gen_opt_cl');
	return (isset($id)) ? $gen_opt_clss[$id] : $gen_opt_clss;
}
function eo_alert($msg,$typ = 'Note', $cpb = 'edit_theme_options') {
	if ( current_user_can( $cpb ) ) {
		$cpb_txt = ucwords(str_replace("_"," ",$cpb));
		if(isset($typ)) $type = $typ;
		$themsg = ucwords($type.' : '.$msg);
		echo '<div class="alert alert-'.$type.'">
	  <strong>'.$themsg.'</strong> <span class="warn_adm_note">Dont worry, this is only shown to those who can <em>'.$cpb_txt.'</em></span>
	</div>';
		}
}
function eo_xcrpt( $l=NULL,$e=true,$ap=NULL ) {
	$excerpt = get_the_excerpt();
	
	(isset($l)) ? $limit = $l : $limit = 20;
	
	 if (str_word_count($excerpt, 0) > $limit) {
          $words = str_word_count($excerpt, 2);
          $pos = array_keys($words);
          $excerpt = substr($excerpt, 0, $pos[$limit]) . '...';
     }
	 if($e) {
		 	echo $excerpt;
	 }
	 else {
		return $excerpt; 
	 }
}

function eo_trim( $str,$l=NULL, $e=true,$ap=NULL ) {	
	(isset($l)) ? $l = $l : $l = 20;
	if(isset($ap)) {
		$apl = mb_strlen($ap);
		$min = $apl + $l;
	}
	else {
		$min = 23;
		$ap = '...';
	}
	$str = (mb_strlen($str) > $min) ? mb_substr($str,0,$l).$ap : $str;
	 if($e) {
		echo $str;
	 }
	 else {
		 return $str;
	 }
}

if ( ! function_exists( 'eo_infinite_scroll_js' ) ) {
	function eo_infinite_scroll_js() {
		global $eo_options;
	    if ( ( $eo_options['inf_scroll'] == '1' ) && ( is_home() || is_archive() ) ) { ?>
	    <script>
	    if ( ! navigator.userAgent.match(/(iPod|iPhone|iPad|Android)/)) {
		    var infinite_scroll = {
		        loading: {
		            img: "<?php echo get_template_directory_uri(); ?>/panel/rsc/img/loading.gif",
		            msgText: "<?php _e( 'Loading the next set of posts...', 'eo_theme' ); ?>",
		            finishedMsg: "<?php _e( 'All posts loaded.', 'eo_theme' ); ?>"
		        },
		        "nextSelector":".pagination a.next",
		        "navSelector":".pagination",
		        "itemSelector":"#main .post",
		        "contentSelector":"#main .postshold"
		    };
		    jQuery( infinite_scroll.contentSelector ).infinitescroll( infinite_scroll );
		}
	    </script>
	    <?php
	    }
	}
}
add_action( 'wp_footer', 'eo_infinite_scroll_js',100 );

function eo_add_class_attachment($html){
	global $eo_options;
	// Add lightbox
    $postid = get_the_ID();
	if( strpos($html,"attachment_id") === false && $eo_options["use_lightbox"] == 1 ) $html = str_replace('class="thumbnail','class="thumbnail cboxElement',$html);
	//if( strpos($html,'title="') === false && $eo_options["use_lightbox"] == 1 ) $html = str_replace('title="" class="',$html);
    return $html;
}
add_filter('wp_get_attachment_link','eo_add_class_attachment',99,1);

add_filter('body_class','eo_body_classes');
function eo_body_classes($classes) {
	global $eo_options;
	if( $eo_options['use_fontawesome'] != "1" )	$classes[] = 'fa_hid';
	return $classes;
}

function eo_get_post_types() {
	$post_types = get_post_types( array( '_builtin' => false, 'publicly_queryable' => true ) );
	$post_types_neu = array();
	foreach($post_types as $post_type) {
		$post_types_neu[$post_type] = ucfirst($post_type);
	}
	$post_types_neu["post"] = "Posts";
	return $post_types_neu;
}
function eo_get_dashboxes() {
	global $wp_version;
	$dashboxes = array(
							"dashboard_right_now" => "Dash. Right Now",
							"dashboard_recent_comments" => "Recent Comments",
							"dashboard_incoming_links" => "Incoming Links",
							"dashboard_plugins" => "Plugins Widget",
							"dashboard_quick_press" => "Quick Press",
							"dashboard_recent_drafts" => "Recent Drafts",
							"dashboard_primary" => "Dashboard Primary",
							"dashboard_secondary" => "Dashboard Secondary",
							"eo_theme_dash" => "eoTheme News",
						);
	if ( $wp_version >= 3.8 ) {
		$dashboxes["dashboard_activity"] = "Dashboard Activity";		
	}
	return $dashboxes;
}
function eovd($dw) {
	echo "<pre>";
	var_dump($dw);
	echo "</pre>";	
}
function eoperc($num_amount, $num_total,$fl=false,$e=false) {
	$count1 = $num_amount / $num_total;
	($fl) ? $count2 = floor($count1 * 100) : $count2 = $count1 * 100;
	$count = number_format($count2, 0);
	return $count;
}
function eo_get_cols($ctg,$add_cl='',$e=true) {
	global $eo_options;
	//$col_cls = array("xs","sm","md","lg");
	if($ctg == 'main') {
		$tarr = array("layout_xs_main"=>"12","layout_sm_main"=>"8","layout_md_main"=>"8","layout_lg_main"=>"9");
	}
	elseif($ctg == 'side') {
		$tarr = array("layout_xs_side"=>"12","layout_sm_side"=>"8","layout_md_side"=>"8","layout_lg_side"=>"9");
	}
	$colz = '';
	foreach ($tarr as $k => $defv ) {
		if($ctg == "main") {
			$sz = str_replace(array('layout_', '_main'), '', $k);
		}
		else if($ctg == "side") {
			$sz = str_replace(array('layout_', '_side'), '', $k);
		}
		($sz == "lg") ? $sep = '' : $sep = ' ';
		if(	array_key_exists($k,$eo_options) ) {
			if( $eo_options[$k] == "0" ) {
				$colz = $colz.'hidden-'.$sz.$sep;
			}
			elseif($eo_options[$k] == "-1" ) {
				$colz = $colz;
			}
			elseif($eo_options[$k] != "0" ) {
				$colz = $colz.'col-'.$sz.'-'.$eo_options[$k].$sep;
			}
			
		}
		else {
			$colz = $colz.'col-'.$sz.'-'.$defv.$sep;
		}
	}
	if(!empty($add_cl) ) $colz = $colz.$add_cl;

	if($e){
		echo $colz;
	}
	else {
		return $colz;
	}
}
?>