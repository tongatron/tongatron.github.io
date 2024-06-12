<?php
/*
Description: A framework for building theme options.
Author: Devin Price
Author URI: http://www.wptheming.com
License: GPLv2
Version: 1.6
*/

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

/* If the user can't edit theme options, no use running this plugin */

add_action( 'init', 'optionsframework_rolescheck' );

function optionsframework_rolescheck () {
	if ( current_user_can( 'edit_theme_options' ) ) {
		// If the user can edit theme options, let the fun begin!
		add_action( 'admin_menu', 'optionsframework_add_page');
		add_action( 'admin_init', 'optionsframework_init' );
		add_action( 'wp_before_admin_bar_render', 'optionsframework_adminbar' );
	}
}

/* Loads the file for option sanitization */

add_action( 'init', 'optionsframework_load_sanitization' );

function optionsframework_load_sanitization() {
	require_once dirname( __FILE__ ) . '/options-sanitize.php';
}

/*
 * Creates the settings in the database by looping through the array
 * we supplied in options.php.  This is a neat way to do it since
 * we won't have to save settings for headers, descriptions, or arguments.
 *
 * Read more about the Settings API in the WordPress codex:
 * http://codex.wordpress.org/Settings_API
 *
 */

function optionsframework_init() {
	global $theme_opt_slug;

	// Include the required files
	require_once dirname( __FILE__ ) . '/../eo_custom_options-framework.php';
	require_once dirname( __FILE__ ) . '/options-interface.php';
	require_once dirname( __FILE__ ) . '/options-media-uploader.php';

	// Optionally Loads the options file from the theme
	$location = apply_filters( 'options_framework_location', array( 'options.php' ) );
	$optionsfile = locate_template( $location );

	// Load settings
	//if (function_exists("eo_prep")) eo_prep();
	$optionsframework_settings = get_option('optionsframework' );

	// Updates the unique option id in the database if it has changed
	if ( function_exists( 'optionsframework_option_name' ) ) {
		optionsframework_option_name();
	}
	elseif ( has_action( 'optionsframework_option_name' ) ) {
		do_action( 'optionsframework_option_name' );
	}
	// If the developer hasn't explicitly set an option id, we'll use a default
	else {
		$default_themename = get_option( 'stylesheet' );
		$default_themename = preg_replace("/\W/", "_", strtolower($default_themename) );
		$default_themename = 'optionsframework_' . $default_themename;
		if ( isset( $optionsframework_settings['id'] ) ) {
			if ( $optionsframework_settings['id'] == $default_themename ) {
				// All good, using default theme id
			} else {
				$optionsframework_settings['id'] = $default_themename;
				update_option( 'optionsframework', $optionsframework_settings );
			}
		}
		else {
			$optionsframework_settings['id'] = $default_themename;
			update_option( 'optionsframework', $optionsframework_settings );
		}
	}

	// If the option has no saved data, load the defaults
	if ( ! get_option( $optionsframework_settings['id'] ) ) {
		optionsframework_setdefaults();
	//	die("1");
	}
	else {
		// get stored options
		$eo_option_get = get_option( $theme_opt_slug );
		// get initial options
		$eo_options_pre = get_option('eo_options');
		if( $eo_options_pre && ! empty($eo_options_pre) ) {
		//	var_dump($eo_options_pre);
		//	die("2");

			// add any newly added / missing options
			$def_options =& _optionsframework_options();
			foreach ($def_options as $option ) {		
				// if is actual option, not heading or info
				if( $option["type"] != "heading" && $option["type"] != "info" && $option["type"] != "free_html") { 
					$thek = $option["id"];
					(array_key_exists("std",$option) ) ? $thev = $option["std"] : $thev = false;
				//	var_dump($option["std"]);
			//		if(	! array_key_exists($option["id"],$eo_options_pre) ) $eo_options_pre[$thek]=array($eo_options_pre[$thek],$thev);
					if(	! array_key_exists($thek,$eo_options_pre) )	$eo_options_pre[$thek] = $thev;

				}
			}
			
			// overwrite initial options with existing stored values. _eo-check: why even need this ?
			foreach ($eo_options_pre as $k => $eo_option ) {
				if(array_key_exists($k,$eo_option_get) ) $eo_options_pre[$k] = $eo_option_get[$k];
			}
			// update the option and the eo_options global
			update_option('eo_options',$eo_options_pre);
			$eo_options = $eo_options_pre;
		}
		else {
		//	die("3");
			// just in case ??
			$def_options =& _optionsframework_options();
			$eo_option_get = get_option( $theme_opt_slug );
			$eo_options_pre = array();
			foreach ($def_options as $option ) {		
				// if is actual option, not heading or info
				if( $option["type"] != "heading" && $option["type"] != "info" && $option["type"] != "free_html") { 
					$thek = $option["id"];
					(array_key_exists("std",$option) ) ? $thev = $option["std"] : $thev = false;
			//		if(	! array_key_exists($option["id"],$eo_options_pre) ) $eo_options_pre[$thek]=array($eo_options_pre[$thek],$thev);
					if(	! array_key_exists($thek,$eo_option_get) )	{
						$eo_options_pre[$thek] = $thev;
					}
					else {
					// overwrite initial options with existing stored values. _eo-check: why even need this ?
						$eo_options_pre[$thek] = $eo_option_get[$thek];
					}

				}
			}

			// update the option and the eo_options global
			update_option('eo_options',$eo_options_pre);
			$eo_options = $eo_options_pre;
		}
	}

	// Registers the settings fields and callback
	register_setting( 'optionsframework', $optionsframework_settings['id'], 'optionsframework_validate' );
	// Change the capability required to save the 'optionsframework' options group.
	add_filter( 'option_page_capability_optionsframework', 'optionsframework_page_capability' );
}

/**
 * Ensures that a user with the 'edit_theme_options' capability can actually set the options
 * See: http://core.trac.wordpress.org/ticket/14365
 *
 * @param string $capability The capability used for the page, which is manage_options by default.
 * @return string The capability to actually use.
 */

function optionsframework_page_capability( $capability ) {
	return 'edit_theme_options';
}

/*
 * Adds default options to the database if they aren't already present.
 * May update this later to load only on plugin activation, or theme
 * activation since most people won't be editing the options.php
 * on a regular basis.
 *
 * http://codex.wordpress.org/Function_Reference/add_option
 *
 */

function optionsframework_setdefaults() {
	$optionsframework_settings = get_option( 'optionsframework' );

	// Gets the unique option id
	$option_name = $optionsframework_settings['id'];

	/*
	 * Each theme will hopefully have a unique id, and all of its options saved
	 * as a separate option set.  We need to track all of these option sets so
	 * it can be easily deleted if someone wishes to remove the plugin and
	 * its associated data.  No need to clutter the database.
	 *
	 */

	if ( isset( $optionsframework_settings['knownoptions'] ) ) {
		$knownoptions =  $optionsframework_settings['knownoptions'];
		if ( !in_array( $option_name, $knownoptions ) ) {
			array_push( $knownoptions, $option_name );
			$optionsframework_settings['knownoptions'] = $knownoptions;
			update_option( 'optionsframework', $optionsframework_settings );
		}
	} else {
		$newoptionname = array( $option_name );
		$optionsframework_settings['knownoptions'] = $newoptionname;
		update_option( 'optionsframework', $optionsframework_settings );
	}

	// Gets the default options data from the array in options.php
	$options =& _optionsframework_options();

	
	//Global options setup _eo-mod-of
	
	$eo_options_array = array();
	foreach ($options as $option ) {
	//		var_dump($option);

		// if is actual option, not heading or info
		if( $option["type"] != "heading" && $option["type"] != "info" && $option["type"] != "free_html") { 
			$thek = $option["id"];
			(array_key_exists("std",$option) ) ? $thev = $option["std"] : $thev = false;
			$eo_options_array[$thek] = $thev;
		}
	}
	$eo_options = $eo_options_array;
	update_option('eo_options',$eo_options);
//	var_dump($eo_options);
	


	// If the options haven't been added to the database yet, they are added now
	$values = of_get_default_values();

	if ( isset( $values ) ) {
		add_option( $option_name, $values ); // Add option with default settings
	}
}

/* Define menu options (still limited to appearance section)
 *
 * Examples usage:
 *
 * add_filter( 'optionsframework_menu', function($menu) {
 *     $menu['page_title'] = 'Hello Options';
 *	   $menu['menu_title'] = 'Hello Options';
 *     return $menu;
 * });
 */

function optionsframework_menu_settings() {

	$menu = array(
		'page_title' => __( 'Bootstrap UL Options', 'eo_theme'),
		'menu_title' => __('Bootstrap UL Options', 'eo_theme'),
		'capability' => 'edit_theme_options',
		'menu_slug' => 'bootstrap-ultimate',
		'callback' => 'optionsframework_page'
	);

	return apply_filters( 'optionsframework_menu', $menu );
}

/* Add a subpage called "Theme Options" to the appearance menu. */

function optionsframework_add_page() {

	$menu = optionsframework_menu_settings();
	$of_page = add_theme_page( $menu['page_title'], $menu['menu_title'], $menu['capability'], $menu['menu_slug'], $menu['callback'] );

	// Load the required CSS and javscript
	add_action( 'admin_enqueue_scripts', 'optionsframework_load_scripts' );
	add_action( 'admin_print_styles-' . $of_page, 'optionsframework_load_styles' );
}

/* Loads the CSS */

function optionsframework_load_styles() {
	wp_enqueue_style( 'optionsframework', OPTIONS_FRAMEWORK_DIRECTORY.'css/optionsframework.css' );
	if ( !wp_style_is( 'wp-color-picker','registered' ) ) {
		wp_register_style( 'wp-color-picker', OPTIONS_FRAMEWORK_DIRECTORY.'css/color-picker.min.css' );
	}
	wp_enqueue_style( 'wp-color-picker' );
}

/* Loads the javascript */

function optionsframework_load_scripts( $hook ) {

	$menu = optionsframework_menu_settings();

	if ( 'appearance_page_' . $menu['menu_slug'] != $hook )
		return;

	// Enqueue colorpicker scripts for versions below 3.5 for compatibility
	if ( !wp_script_is( 'wp-color-picker', 'registered' ) ) {
		wp_register_script( 'iris', OPTIONS_FRAMEWORK_DIRECTORY . 'js/iris.min.js', array( 'jquery-ui-draggable', 'jquery-ui-slider', 'jquery-touch-punch' ), false, 1 );
		wp_register_script( 'wp-color-picker', OPTIONS_FRAMEWORK_DIRECTORY . 'js/color-picker.min.js', array( 'jquery', 'iris' ) );
		$colorpicker_l10n = array(
			'clear' => __( 'Clear','options_framework_theme' ),
			'defaultString' => __( 'Default', 'options_framework_theme' ),
			'pick' => __( 'Select Color', 'options_framework_theme' )
		);
		wp_localize_script( 'wp-color-picker', 'wpColorPickerL10n', $colorpicker_l10n );
	}

	// Enqueue custom option panel JS
	wp_enqueue_script( 'options-custom', OPTIONS_FRAMEWORK_DIRECTORY . 'js/options-custom.js', array( 'jquery','wp-color-picker' ) );

	// Inline scripts from options-interface.php
	add_action( 'admin_head', 'of_admin_head' );
}

function of_admin_head() {
	// Hook to add custom scripts
	do_action( 'optionsframework_custom_scripts' );
}

/*
 * Builds out the options panel.
 *
 * If we were using the Settings API as it was likely intended we would use
 * do_settings_sections here.  But as we don't want the settings wrapped in a table,
 * we'll call our own custom optionsframework_fields.  See options-interface.php
 * for specifics on how each individual field is generated.
 *
 * Nonces are provided using the settings_fields()
 *
 */

if ( !function_exists( 'optionsframework_page' ) ) :
function optionsframework_page() { 
global $eo_options; ?>

<?php if(eo_check_of_opt('load_bs_adm') == "1") {
	
	
$bsw_theme = eo_check_of_opt('bsw_theme');
$xl_adm = eo_check_of_opt('xl_adm'); ?>
<div id="eo_outer-wrap" class="eo_abs container<?php if ( $bsw_theme && eo_check_of_opt("use_bsw_theme_admin") == 1 ) echo ' '.$bsw_theme ?><?php if($xl_adm && eo_check_of_opt('xl_adm') != "default") echo ' '.$xl_adm; ?>">
<?php  } ?>
	<div id="diss_msgs" class="row"><?php eo_output_dismiss_messages(); ?></div>
    <div id="optionsframework-wrap" class="wrap">
        <div class="row">
        <?php (eo_check_of_opt('top_nav_adm_show') != "always") ? $top_nav_adm = eo_check_of_opt('top_nav_adm_show') : $top_nav_adm = ''; ?>
            <div id="topnavwrap" class="clearfix<?php echo ' '.$top_nav_adm ?>">
                <?php screen_icon( 'themes' ); ?>
                <h2 class="nav-tab-wrapper">
                    <?php if(eo_check_of_opt('load_bs_adm') == "1" )  {
                        echo eo_optionsframework_tabs();
                    }
                    else {
                        echo optionsframework_tabs();
                    }?>
                </h2>
            </div>
    
            <?php eo_output_sh_msgs(); ?>            
            <?php settings_errors( 'options-framework' ); ?>            
            <?php if(eo_check_of_opt('load_bs_adm') == "1" && eo_check_of_opt('side_menu_adm_show') == "auto-l" )   echo eo_optionsframework_side_menu(); ?>
            <div id="optionsframework-metabox" class="metabox-holder col-md-9 col-lg-10">
                <div id="optionsframework" class="postbox">
                    <noscript>
                        <div class="alert alert-warning">
                            <strong>Warning!</strong> You have <b>javascript</b> disabled, do not forget to save after making changes.
                        </div>
                    </noscript>
                    
                    <?php			
					
                         if(eo_check_of_opt('init_refreshed','eo_opts') != "yes" || ! isset($eo_options) ) {
                            (eo_check_of_opt('load_bs_adm') == "1") ? $butcl = '' : $butcl = " button button-primary";
							$the_th_slug = eo_get_cons("eo_theme","slug");
							($the_th_slug) ? $theme_slug = $the_th_slug : $theme_slug = 'options-framework';
                            $t_adm_url = admin_url( 'themes.php?page='.$the_th_slug.'&init_refreshed=yes' );  ?>
    
                        <div class="alert alert-warning"> 
                            <div class="bs-callout bs-callout-warning form-group">
                                <h4>Excuse me sir!</h4>
                                <p><em>Something feels amiss.. But <b>fear not</b>..</em> Just </p>
                                <form action="<?php echo $t_adm_url	?>" class="form-inline" method="post">
                                    <button type="submit" class="form-control btn-primary btn btn-md <?php echo $butcl ?>" name="submit" value="Refresh This Page"><span class="glyphicon glyphicon-refresh"></span> Refresh This Page
                                </button>
                                </form>
                                <p>and if this message disappears, all your problems should go away.</p>
                            </div>
                        </div>
                   <?php }?>
                 
                    <form action="options.php" method="post">
                    <?php  if(eo_check_of_opt('load_bs_adm') == "1") include(get_template_directory().'/panel/inc/eo_of_submit.php'); ?>
                    <?php settings_fields( 'optionsframework' ); ?>
                    <?php optionsframework_fields(); /* Settings */ ?>
                    <?php if(eo_check_of_opt('load_bs_adm') == "1") {
                         include(get_template_directory().'/panel/inc/eo_of_submit.php');
                    } else {?>
                    <div id="optionsframework-submit">
                        <input type="submit" class="button-primary" name="update" value="<?php esc_attr_e( 'Save Options', 'options_framework_theme' ); ?>" />
                        <input type="submit" class="reset-button button-secondary" name="reset" value="<?php esc_attr_e( 'Restore Defaults', 'options_framework_theme' ); ?>" onclick="return confirm( '<?php print esc_js( __( 'Click OK to reset. Any theme settings will be lost!', 'options_framework_theme' ) ); ?>' );" />
                        <div class="clear"></div>
                    </div>
                     <?php } ?>
                    </form>
                     <?php    include(get_template_directory().'/panel/inc/eo_backup.php'); ?>

                </div> <!-- / #optionsframework-metabo.metabox-holder -->
            </div><!-- / #optionsframework.postbox -->
            <?php if(eo_check_of_opt('load_bs_adm') == "1" && eo_check_of_opt('side_menu_adm_show') == "auto-r" )   echo eo_optionsframework_side_menu(); ?>
            <?php do_action( 'optionsframework_after' ); ?>
        </div> <!-- / .row -->
    </div> <!-- / .wrap -->
<?php if(eo_check_of_opt('load_bs_adm') == "1") echo '</div>' ?>
<?php
}
endif;

/**
 * Validate Options.
 *
 * This runs after the submit/reset button has been clicked and
 * validates the inputs.
 *
 * @uses $_POST['reset'] to restore default options
 */
function optionsframework_validate( $input ) {

	/*
	 * Restore Defaults.
	 *
	 * In the event that the user clicked the "Restore Defaults"
	 * button, the options defined in the theme's options.php
	 * file will be added to the option for the active theme.
	 */

	if ( isset( $_POST['reset'] ) ) {
		add_settings_error( 'options-framework', 'restore_defaults', __( 'Default options restored.', 'options_framework_theme' ), 'updated fade' );
		return of_get_default_values();
	}

	/*
	 * Update Settings
	 *
	 * This used to check for $_POST['update'], but has been updated
	 * to be compatible with the theme customizer introduced in WordPress 3.4
	 */

	$clean = array();
	$options =& _optionsframework_options();
	foreach ( $options as $option ) {

		if ( ! isset( $option['id'] ) ) {
			continue;
		}

		if ( ! isset( $option['type'] ) ) {
			continue;
		}

		$id = preg_replace( '/[^a-zA-Z0-9._\-]/', '', strtolower( $option['id'] ) );

		// Set checkbox to false if it wasn't sent in the $_POST
		if ( 'checkbox' == $option['type'] && ! isset( $input[$id] ) ) {
			$input[$id] = false;
		}

		// Set each item in the multicheck to false if it wasn't sent in the $_POST
		if ( 'multicheck' == $option['type'] && ! isset( $input[$id] ) ) {
			foreach ( $option['options'] as $key => $value ) {
				$input[$id][$key] = false;
			}
		}
		
		// _eo-of-mod 
		// _eo-review: input bug ?? check_gwf|info, bsw_theme|images , bs_js_seperate|multiselect , eo_bswtest|info
		// Set each item in the multiselect to false if it wasn't sent in the $_POST
		if ( 'multiselect' == $option['type'] && ! isset( $input[$id] ) ) {
			foreach ( $option['options'] as $key => $value ) {
				$input[$id][$key] = false;
			}
		}
		
		// Set info to false if it wasn't sent in the $_POST
		if ( 'info' == $option['type'] && ! isset( $input[$id] ) ) {
			$input[$id] = false;
		}
		
		


		// For a value to be submitted to database it must pass through a sanitization filter
		if ( has_filter( 'of_sanitize_' . $option['type'] ) ) {			
			
			$clean[$id] = apply_filters( 'of_sanitize_' . $option['type'], $input[$id], $option );
		}
	}

	// Hook to run after validation
	do_action( 'optionsframework_after_validate', $clean );

	return $clean;
}

/**
 * Display message when options have been saved
 */

function optionsframework_save_options_notice() {
	add_settings_error( 'options-framework', 'save_options', __( 'Options saved.', 'options_framework_theme' ), 'updated fade' );
}

add_action( 'optionsframework_after_validate', 'optionsframework_save_options_notice' );

/**
 * Format Configuration Array.
 *
 * Get an array of all default values as set in
 * options.php. The 'id','std' and 'type' keys need
 * to be defined in the configuration array. In the
 * event that these keys are not present the option
 * will not be included in this function's output.
 *
 * @return    array     Rey-keyed options configuration array.
 *
 * @access    private
 */

function of_get_default_values() {
	$output = array();
	$config =& _optionsframework_options();
	foreach ( (array) $config as $option ) {
		if ( ! isset( $option['id'] ) ) {
			continue;
		}
		if ( ! isset( $option['std'] ) ) {
			continue;
		}
		if ( ! isset( $option['type'] ) ) {
			continue;
		}
		if ( has_filter( 'of_sanitize_' . $option['type'] ) ) {
			$output[$option['id']] = apply_filters( 'of_sanitize_' . $option['type'], $option['std'], $option );
		}
	}
	return $output;
}

/**
 * Add Theme Options menu item to Admin Bar.
 */

function optionsframework_adminbar() {

	global $wp_admin_bar;

	$wp_admin_bar->add_menu( array(
			'parent' => 'appearance',
			'id' => 'of_theme_options',
			'title' => __( 'Theme Options', 'options_framework_theme' ),
			'href' => admin_url( 'themes.php?page=bootstrap-ultimateframework' )
		));
}

/**
 * Wrapper for optionsframework_options()
 *
 * Allows for manipulating or setting options via 'of_options' filter
 * For example:
 *
 * <code>
 * add_filter('of_options', function($options) {
 *     $options[] = array(
 *         'name' => 'Input Text Mini',
 *         'desc' => 'A mini text input field.',
 *         'id' => 'example_text_mini',
 *         'std' => 'Default',
 *         'class' => 'mini',
 *         'type' => 'text'
 *     );
 *
 *     return $options;
 * });
 * </code>
 *
 * Also allows for setting options via a return statement in the
 * options.php file.  For example (in options.php):
 *
 * <code>
 * return array(...);
 * </code>
 *
 * @return array (by reference)
 */
function &_optionsframework_options() {
	static $options = null;

	if ( !$options ) {
		// Load options from options.php file (if it exists)
		$location = apply_filters( 'options_framework_location', array('options.php') );
		if ( $optionsfile = locate_template( $location ) ) {
			$maybe_options = require_once $optionsfile;
			if ( is_array($maybe_options) ) {
				$options = $maybe_options;
			} else if ( function_exists( 'optionsframework_options' ) ) {
				$options = optionsframework_options();
			}
		}

		// Allow setting/manipulating options via filters
		$options = apply_filters('of_options', $options);
	}

	return $options;
}

/**
 * Get Option.
 *
 * Helper function to return the theme option value.
 * If no value has been saved, it returns $default.
 * Needed because options are saved as serialized strings.
 */

if ( ! function_exists( 'of_get_option' ) ) {

	function of_get_option( $name, $default = false ) {
		$config = get_option( 'optionsframework' );

		if ( ! isset( $config['id'] ) ) {
			return $default;
		}

		$options = get_option( $config['id'] );

		if ( isset( $options[$name] ) ) {
			return $options[$name];
		}

		return $default;
	}
}