<?php
if ( ! defined( 'ABSPATH' ) ) exit;	// File Security Check
//Set a default theme name -slug-
//define( 'THEME_SLUG', "bootstrap-ultimate" );
$theme_name = 'Bootstrap Ultimate';
$theme_sname = 'Bootstrap UL';
$theme_slug = 'bootstrap-ultimate';
$th_xs_slug = 'bsul';
$theme_opt_slug = str_replace("-","_",$theme_slug);
// Check if it matches options slug
$optionsframework_settings = get_option( 'optionsframework' );
//var_dump($optionsframework_settings);

if($optionsframework_settings) {
	$option_slug = $optionsframework_settings['id'];
	// sync theme slug with option slug if there's a mismatch, just in case
	if($option_slug !== $theme_opt_slug )	{
		$optionsframework_settings['id'] = $theme_opt_slug;
		update_option( 'optionsframework', $optionsframework_settings );
	}
}
else {
	$optionsframework_settings = array("id" => $theme_opt_slug, "knownoptions" => array($theme_opt_slug) );
	update_option( 'optionsframework', $optionsframework_settings );
}
// This will come handy to distinguish theme option panel from frontend & other admin pages
$is_theme_opt_page = (is_admin() && isset($_GET['page']) && $_GET['page'] == $theme_slug);

// Make a one time refresh for settings to be created properly || _eo-review: Do we absolutely need this ?
$eo_opts = get_option('eo_opts');
// Refresh only once on init, to record settings || _eo-check: Why need this ?
$t_adm_url = admin_url( 'themes.php?page='.$theme_slug.'&init_refreshed=yes' );

if($eo_opts) {
	$eo_opts["init_refreshed"] = "yes";
	update_option( 'eo_opts', $eo_opts );
	
} else if( ! array_key_exists("init_refreshed",$_GET) && is_admin() ){
	header("Refresh: 1; url=$t_adm_url");
}		

$eo_const = get_option( 'eo_const' );

// Get Bones Core Up & Running!
//require_once('eo/eo_bones.php');            // core functions (don't remove)
//var_dump($eo_consts);

add_action( 'after_setup_theme', 'eo_theme_setup' );

function eo_theme_setup() {
	load_theme_textdomain( 'eo_theme', get_template_directory() .'/lang' );

	// Add some values that almost never need to change
	$eo_const = array(
	"img_h_clss" => array("vine" => "vine","sky" => "sky","lava"=>"lava","industrial"=>"industrial","gray"=>"gray","social"=>"social","gold"=>"gold","alt"=>"alt","lovely"=>"lovely","benzin"=>"benzin","clblue"=>"clblue","cheer"=>"cheer","fun"=>"fun","goldfish"=>"goldfish"),
	"say_hi" => array("Hi !","¡Hola!","Hej !","Hey !","Selam..","šalom !","Bonjour." ),
	//"say_hi" => array("Hi","Hola","Hej","Hey","Selam","salom","Bonjour" ),
	// some stupid buzzwords and phrases
	"say_buzz" => array("think outside the box","innovation","responsive design","social marketing","the cloud","user engagement","synergy" ),
	"eo_theme" => array("name" => "Bootstrap Ultimate", "slug" => "bootstrap-ultimate","abbr"=>"Bootstrap UL")
	);
//	add_option('eo_const',$eo_const);
	// update if necessary upon adding new constant material
	update_option('eo_const',$eo_const);
	/*$eo_const = get_option('eo_const');
	$th_slug = $eo_const["eo_theme"]["slug"];
	$is_theme_opt_page = (isset($_GET['page']) && $_GET['page'] == $th_slug);*/
	add_theme_support( 'woocommerce' );
}
// Get constant values
?>