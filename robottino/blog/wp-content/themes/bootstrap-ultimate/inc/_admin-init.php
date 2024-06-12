<?php
// File Security Check
if ( ! defined( 'ABSPATH' ) ) exit;

/*-----------------------------------------------------------------------------------*/
/*  Framework Version & Theme Version */
/*-----------------------------------------------------------------------------------*/
//Add theme and framework version for future updates etc. Might come handy later

/*function eo_version_init () {
    $eo_version = array(
		'eof_version'=>'1.0',
		'theme_version'=>'1.0',
		'installed_on'=>time()
		);
    add_option( 'eo_version',$eo_version );
	// Check new version every X add in option panel to check for updates,  if there's new one, add option to get it
	if( $new_eo_v > $eo_version["eof_version"] ) {
    	// Get the files and update the version file
		update_option( 'eo_version', $eo_version );
    }
} // End eo_version_init()*/

/*-----------------------------------------------------------------------------------*/
/* Load the required Framework Files */
/*-----------------------------------------------------------------------------------*/


// initial redirect on activation
global $pagenow,$theme_slug;

$eoinc_path = get_template_directory() . '/inc/eo/';
require_once($eoinc_path . 'eo_bones.php');            // bones basic
require_once( get_template_directory() . '/lib/bones/admin.php');            // bones basic

require_once ( $eoinc_path . 'admin-functions.php' );	// Custom admin functions 
require_once ( $eoinc_path . 'admin-custom-fields.php' );	// Custom fields admin

require_once(get_template_directory() . '/panel/options-panel.php');
//require_once ( $eoinc_path . 'admin-custom.php' );	// Custom fields admin

// Custom Backend Footer
function eo_custom_admin_footer() {
	$the_theme = wp_get_theme();
	$the_theme_v = $the_theme->get( 'Version' );
	_e( '<a href="http://eodepo.com/bootstrap-ultimate" title="Bootstrap 3 theme for Wordpress" target="_blank"><img src="'.get_template_directory_uri().'/panel/rsc/img/adm2.png" alt="eoTheme"> Bootstrap Ultimate</a> v.<b>'.$the_theme_v.'</b> by Emin &Ouml;zlem - <a href="http://eminozlem.com" title="Emin Ozlem-WP / b2 freelancer">eo</a></span>.', 'eo_theme' );
}

// adding it to the admin area
if(of_get_option('auth_l_adm') == "1") add_filter( 'admin_footer_text', 'eo_custom_admin_footer' );

add_action( 'admin_init', 'eo_prep' );
function eo_admin_body_class($classes) {
	global $theme_slug;
	$classes .= ' '.$theme_slug;
	if(of_get_option('coll_wp_menu') == "1" && isset($_GET["page"]) && $_GET["page"] == $theme_slug ) $classes .= " auto-fold folded";
	return $classes;
}
add_filter( 'admin_body_class', 'eo_admin_body_class' );
?>