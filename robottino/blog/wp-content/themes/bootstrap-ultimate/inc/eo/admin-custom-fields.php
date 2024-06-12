<?php
// File Security Check
if ( ! defined( 'ABSPATH' ) ) exit;

// eo-todo:
// eo-fix: Rebuild this whole thing without having to require custom files ?

require_once('admin-custom-options-interface.php');
require_once ( 'custom-options-media-uploader.php' );
//require_once ( 'custom-options-sanitize.php' );

function optionsframework_init_custom() {

	// Include the required files
	

	// Optionally Loads the options file from the theme
//	$location = apply_filters( 'options_framework_location', array( 'options.php' ) );
//	$optionsfile = locate_template( $location );

	// Load settings
	//if (function_exists("eo_prep")) eo_prep();
//	$optionsframework_settings = get_option('eo_custom_fields_opt' );



	// Registers the settings fields and callback
//	register_setting( 'eocustomsettings', $optionsframework_settings['id'], 'optionsframework_validate' );
	// Change the capability required to save the 'optionsframework' options group.
	//add_filter( 'option_page_capability_optionsframework', 'optionsframework_page_capability' );
}
add_action( 'admin_init', 'optionsframework_init_custom' );
function optionsframework_load_scripts_custom() {

//	$menu = optionsframework_menu_settings();

//	if ( 'appearance_page_' . $menu['menu_slug'] != $hook )
//		return;

	// Enqueue colorpicker scripts for versions below 3.5 for compatibility
	if ( !wp_script_is( 'wp-color-picker', 'registered' ) ) {
		wp_register_script( 'iris', get_template_directory_uri() . '/panel/of/js/iris.min.js', array( 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), false, 1 );
		wp_register_script( 'wp-color-picker',get_template_directory_uri() . '/panel/of/js/color-picker.min.js', array( 'jquery', 'iris' ) );
		$colorpicker_l10n = array(
			'clear' => __( 'Clear','options_framework_theme' ),
			'defaultString' => __( 'Default', 'options_framework_theme' ),
			'pick' => __( 'Select Color', 'options_framework_theme' )
		);
		wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n );
	}

	// Enqueue custom option panel JS
//	wp_enqueue_script( 'options-custom', get_template_directory_uri() . '/panel/of/js/options-custom.js', array( 'jquery','wp-color-picker' ) );

	// Inline scripts from options-interface.php
}
add_action( 'admin_head', 'optionsframework_load_scripts_custom' );

function load_custom_fields_of_style() {
	wp_enqueue_style( 'optionsframework', get_template_directory_uri() . '/panel/rsc/css/custom_optionsframework.css' );
	if ( !wp_style_is( 'wp-color-picker','registered' ) ) {
		wp_register_style( 'wp-color-picker', get_template_directory_uri() . '/panel/of/css/color-picker.min.css' );
	}
	wp_enqueue_style( 'wp-color-picker' );
	
	
      //  wp_register_style( 'custom_wp_admin_css', get_template_directory_uri() . '/admin-style.css', false, '1.0.0' );
     //   wp_enqueue_style( 'custom_wp_admin_css' );
	 // _eo-check: what's this anyway ?
}
add_action( 'admin_enqueue_scripts', 'load_custom_fields_of_style' );
// _eo-of-mod : generation of custom fields
// Output of fields

/**
 * Adds a box to the main column on the Post and Page edit screens.
 */
function eo_add_custom_box() {

    $screens = array( 'post', 'page' );

    foreach ( $screens as $screen ) {

        add_meta_box(
            'eo_custom_field_options',
            __( 'Post Custom Options', 'eo_theme' ),
            'eo_inner_custom_box',
            $screen
        );
    }
}
add_action( 'add_meta_boxes', 'eo_add_custom_box' );



function eo_inner_custom_box( $post ) {
	
global $post;

 wp_nonce_field( 'eo_inner_custom_box', 'eo_inner_custom_box_nonce' );

$eo_metaboxes = array();

// Shown on both posts and pages
// Show only on specific post types or page

if ( ( get_post_type() == 'post' || get_post_type() == 'page' ) || ( !get_post_type() ) ) {

$eo_metaboxes[] = array (	
					'id' => 'eo_cust_post_feat_img',
					'name' => 'Custom Image',
					'label' => __( 'Image', 'eo_theme' ),
					'type' => 'upload',
					'desc' => __( 'Upload an image or enter an URL. Will be used if no -featured image- is present.', 'eo_theme' ) );
$eo_metaboxes[] = array (	
					'id' => 'eo_cust_post_layout',
					'name' => 'Custom Layout',
					'std' => 'default',
					'label' => __( 'Layout', 'eo_theme' ),
					'type' => 'images',
					'desc' => __( 'Select the layout you want on this specific post/page.', 'eo_theme' ),
					'options' => array(
								'default' => get_template_directory_uri() . '/panel/rsc/img/' . 'default.png',
								'full' => get_template_directory_uri() . '/panel/rsc/img/' . '1col.png',
								'left-sidebar' => get_template_directory_uri() . '/panel/rsc/img/' . '2cl.png',
								'right-sidebar' => get_template_directory_uri() . '/panel/rsc/img/' . '2cr.png'));
$eo_metaboxes[] = array (	
					'id' => 'eo_cust_post_css',
					'name' => __( 'Custom CSS', 'eo_theme' ),
					'label' => __( 'CSS', 'eo_theme' ),
					'type' => 'textarea',
					'desc' => __( 'Custom CSS for this post. The code will be placed inside &lt;style&gt;&lt;/style&gt; tags you dont need to add it.', 'eo_theme' ) );
					
$eo_metaboxes[] = array (	
					'id' => 'eo_cust_post_js',
					'name' => __( 'Custom JS', 'eo_theme' ),
					'label' => __( 'JS', 'eo_theme' ),
					'type' => 'textarea',
					'desc' => __( 'Custom JS for this post. The code will be placed inside &lt;script&gt;&lt;/script&gt; tags you dont need to add it.', 'eo_theme' ) );

/*$eo_metaboxes[] = array (  
					'id' => 'eo_cust_post_embed',
					'name'  => 'embed',
					'std'  => '',
					'label' => __( 'Embed Code', 'eo_theme' ),
					'type' => 'textarea',
					'desc' => __( 'Enter the video embed code for your video (YouTube, Vimeo or similar)', 'eo_theme' ) );*/

} // End post



	/* Custom Post type custom options
	if ( get_post_type() == 'slide' || ! get_post_type() ) {
	$eo_metaboxes[] = array (
						'name' => 'url',
						'label' => __( 'Slide URL', 'eo_theme' ),
						'type' => 'text',
						'desc' => sprintf( __( 'Enter an URL to link the slider title to a page e.g. %s (optional)', 'eo_theme' ), 'http://yoursite.com/pagename/' )
						);

	$eo_metaboxes[] = array (
							'name'  => 'embed',
							'std'  => '',
							'label' => __( 'Embed Code', 'eo_theme' ),
							'type' => 'textarea',
							'desc' => __( 'Enter the video embed code for your video (YouTube, Vimeo or similar)', 'eo_theme' )
							);
	} // End Slide*/
	update_option("eo_custom_fields_opt",$eo_metaboxes);
	
	eo_optionsframework_fields_custom();
}


/**
 * Prints the box content.
 * 
 * @param WP_Post $post The object for the current post/page.
 */
function eo_inner_cusasdtom_boxasdasd( $post ) {
	
  // Add an nonce field so we can check for it later.
  wp_nonce_field( 'eo_inner_custom_box', 'eo_inner_custom_box_nonce' );
  

  /*
   * Use get_post_meta() to retrieve an existing value
   * from the database and use the value for the form.
   */

  echo '<label for="feat_img">';
       _e( "Description for this field", 'eo_theme' );
  echo '</label> ';
  echo '<input type="text" id="feat_img" name="feat_img" value="' . esc_attr( $value ) . '" size="25" />';

}

/**
 * When the post is saved, saves our custom data.
 *
 * @param int $post_id The ID of the post being saved.
 */
function eo_custom_save_postdata( $post_id ) {
	global $theme_opt_slug;

  /*
   * We need to verify this came from the our screen and with proper authorization,
   * because save_post can be triggered at other times.
   */

  // Check if our nonce is set.
  if ( ! isset( $_POST['eo_inner_custom_box_nonce'] ) )
    return $post_id;

  $nonce = $_POST['eo_inner_custom_box_nonce'];

  // Verify that the nonce is valid.
  if ( ! wp_verify_nonce( $nonce, 'eo_inner_custom_box' ) )
      return $post_id;

  // If this is an autosave, our form has not been submitted, so we don't want to do anything.
  if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) 
      return $post_id;

  // Check the user's permissions.
  if ( 'page' == $_POST['post_type'] ) {

    if ( ! current_user_can( 'edit_page', $post_id ) )
        return $post_id;
  
  } else {

    if ( ! current_user_can( 'edit_post', $post_id ) )
        return $post_id;
  }

  /* OK, its safe for us to save the data now. */

  // Sanitize user input.
  
  $eo_custom_field_opts = get_option("eo_custom_fields_opt");
  foreach ($eo_custom_field_opts as $custom_f_opt ) {
	  $typ = $custom_f_opt["type"];
	  $custom_fid = str_replace($custom_f_opt["id"],"_".$custom_f_opt["id"],$custom_f_opt["id"]);
	  $pst_id = $custom_f_opt["id"];
	  $input = $_POST["eo_cfo"][$pst_id];
//	  var_dump($input);
	  $sanitize_function = "of_sanitize_$typ";
 	  if( $typ != "images") {
		  // _eo-review: Check images sanitation
		  $sane_data = $sanitize_function($input);
	  }
	  else {
		 $sane_data = $input;
	  }
	 /* var_dump($pst_id);
	  var_dump($custom_fid);
	  var_dump($sane_data);
	  var_dump($_POST);*/
	  update_post_meta( $post_id, $custom_fid, $sane_data );
  }
//  $mydata = sanitize_text_field( $_POST['feat_img'] );

  // Update the meta field in the database.
  /*update_post_meta( $post_id, '_eo_feat_img', $mydata );
    $value = get_post_meta( $post->ID, '_eo_feat_img', true );*/

}
add_action( 'save_post', 'eo_custom_save_postdata' );
?>