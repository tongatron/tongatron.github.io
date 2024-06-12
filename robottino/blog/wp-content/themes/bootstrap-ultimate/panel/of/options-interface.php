<?php

/**
 * Generates the tabs that are used in the options menu
 */

function optionsframework_tabs() {
	$counter = 0;
	$options =& _optionsframework_options();
	$menu = '';

	foreach ( $options as $value ) {
		// Heading for Navigation
		if ( $value['type'] == "heading" ) {
			$counter++;
			$class = '';
			$class = ! empty( $value['id'] ) ? $value['id'] : $value['name'];
			$class = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($class) ) . '-tab';
			$menu .= '<a id="options-group-' . $counter . '-tab" class="nav-tab ' . $class .'" title="' . esc_attr( $value['name'] ) . '" href="' . esc_attr( '#options-group-' . $counter ) . '">' . esc_html( $value['name'] ) . '</a>';
		}
	}

	return $menu;
}

/**
 * Generates the options fields that are used in the form.
 */

function optionsframework_fields() {

	global $allowedtags,$eo_options,$theme_opt_slug;
	$optionsframework_settings = get_option( 'optionsframework' );
	$eo_opts = get_option( 'eo_opts' );
	$all_fonts = get_option( 'eo_all_fonts_arr' );

	if($theme_opt_slug) {
		$option_name = $theme_opt_slug;	
	}
	// Gets the unique option id
	else if ( isset( $optionsframework_settings['id'] ) ) {
		$option_name = $optionsframework_settings['id'];
	}
	else {
		$option_name = 'options_framework_theme';
	};

	$settings = get_option($option_name);
	$options =& _optionsframework_options();

	$counter = 0;
	$menu = '';
	$first_font = '';
	
	add_thickbox(); 
	// _eo-of-mod : load thickbox for previews
	
	foreach ( $options as $value ) {

		$val = '';
		$select_value = '';
		$output = '';
		
		// _eo-of-mod : opt-groups
		if(eo_check_of_opt('load_bs_adm') == "1") {
			if (!empty($value["group"]) && array_key_exists('group', $value))  {
				$gval = $value["group"];
				$gfirstid = $eo_opts["groups"][$gval]["first_item"];
				$glastid = $eo_opts["groups"][$gval]['last_item'];
				
				if ( $gfirstid == $value["id"]  ) {
			//	var_dump("First goefid" . ${"goefid_$gval"});
					//	$output .= '<div class="panel-group" id="panopt_grp_'.$gval.'">
						$output .='
						<!-- start group output --><div class="panel panel-default">
							<div class="panel-heading">
							  <h4 class="panel-title">
								<a class="accordion-toggle" data-toggle="collapse" data-parent="#section-gr-'.$counter.'" href="#opt_grp_'.eo_sanitize_id($gval).'">
								<span class="glyphicon glyphicon-collapse-up"></span><span class="glyphicon glyphicon-collapse-down"></span> '. ucwords($gval).' Options Group
								</a>
							  </h4>
							</div>
							<div id="opt_grp_'.eo_sanitize_id($gval).'" class="panel-collapse collapse in">
							  <div class="panel-body row">';
				}
			}
		}

		// Wrap all options
		if ( ( $value['type'] != "heading" ) && ( $value['type'] != "info" ) && ( $value['type'] != "free_html" ) ) {

			// Keep all ids lowercase with no spaces
			$value['id'] = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower( $value['id'] ) );

			$id = 'section-' . $value['id'];

			$class = 'section';
			if ( isset( $value['type'] ) ) {
				$class .= ' section-' . $value['type'];
			}
			if ( isset( $value['class'] ) ) {
				$class .= ' ' . $value['class'];
			}

			$output .= '<div id="' . esc_attr( $id ) .'" class="' . esc_attr( $class ) . '">'."\n";
			// additional inner wrap for stacking or hiding empty, not met options
		//	$output .= '<a class="innerwrap clearfix" href="javascript:void(0)"></a>'."\n";
			$output .= "\n";
			if ( isset( $value['name'] ) ) {
				$output .= '<h4 class="heading">';
				if ( isset( $value['desc'] ) ) $output .= '<abbr  title="'.esc_attr( $value['desc'] ).'">';
			
			
				
				// _eo-of-mod : Display preview of the options if it has a preview image 
			if ($value['type'] == "typography" && empty($first_font) && !empty($value['prev']) ) {
				$previmg = get_template_directory_uri().'/panel/rsc/img/preview/fonts_prev.jpg';
				$output .= '<a href="'.$previmg.'" title="'.esc_attr( $value['desc'] ) .'" name="'.esc_attr( $value['desc'] ) .'" data-original-title="'.esc_attr( $value['desc'] ) .'" class="thickbox popp"><span class="glyphicon glyphicon-zoom-in"></span>';
				$output .= 	esc_html( $value['name'] );
				$output .= '</a>';
				if ( eo_check_of_opt('prev_pop') == "1" ) $output .= '<div class="popcontent" style="display:none;"><img src="'.$previmg.'" alt="previmg" /></div>';
				$first_font = "nope";
			}
			else {
				if ( isset( $value['prev']) && !empty($value['prev']) ) $previmg = get_template_directory_uri().'/panel/rsc/img/preview/'.$value['prev'];
				if ( !empty($value['prev']) ) $output .= '<a href="'.$previmg.'" title="'.esc_attr( $value['desc'] ) .'" name="'.esc_attr( $value['desc'] ) .'" data-original-title="'.esc_attr( $value['desc'] ) .'" class="thickbox popp"><span class="glyphicon glyphicon-zoom-in"></span>';
				$output .= 	esc_html( $value['name'] );
				if ( !empty($value['prev']) ) $output .= '</a>';
				if ( !empty($value['prev']) && eo_check_of_opt('prev_pop') == "1" ) $output .= '<div class="popcontent" style="display:none;"><img src="'.$previmg.'" alt="previmg" /></div>';
			}
			
			if(eo_check_of_opt('load_bs_adm') == "1" && !empty($value['prev']) ) {
			//	 $output .= '<a href="'.$previmg.'" class="popp" role="button" title="" data-toggle="popover" data-original-title="'.esc_attr( $value['name'] ) .'"><span class="glyphicon glyphicon-eye"></span> ¿</a>				';
			}
			
			if ( isset( $value['preq'] ) ) {
				/*if(strpos($value['preq'],"|") !== false) {
					$preqa = explode("|",$value['preq']);
					$preqt = $preqa[0];
					$preqd = $preqa[1];
				}*/
				if( is_array($value['preq']) ) {
				$preqs = $value['preq'];
					foreach ( $preqs as $preqab => $preqd ) {
					$output .= 	'<a href="javascript:void(0);" title="'.$preqd.'" data-original-title="Requires '.esc_attr( $preqab ) .'" class="preq '.esc_attr( $preqab ) .' popp"><abbr title="'.esc_attr( $preqd ) .' popp" class="'.esc_attr( $preqab ) .'" >*</abbr></a>';
					if (eo_check_of_opt('prev_pop') == "1" ) $output .= '<span class="popcontent" style="display:none;">'.$preqd.'</span>';
					}
				}
				else {
					$output .= 	'<a href="javascript:void(0);" title="'.$preqd.'"><abbr title="'.$preqd.'" class="'.$preqab.'">*</abbr></a>';
					if (eo_check_of_opt('prev_pop') == "1" ) $output .= '<span class="popcontent" style="display:none;">'.$preqd.'</span>';
				}
			}
			if ( isset( $value['desc'] ) ) $output .= '</abbr>';
			$output .= 	'</h4>' . "\n";
			}
			if ( $value['type'] != 'editor' ) {
				$output .= '<div class="option clearfix">' . "\n" . '<div class="controls">' . "\n";
			}
			else {
				$output .= '<div class="option clearfix">' . "\n" . '<div>' . "\n";
			}
		}

		// Set default value to $val
		if ( isset( $value['std'] ) ) {
			$val = $value['std'];
		}

		// If the option is already saved, ovveride $val
		if ( ( $value['type'] != 'heading' ) && ( $value['type'] != 'info') && ( $value['type'] != 'free_html') ) {
			if ( isset( $settings[($value['id'])]) ) {
				$val = $settings[($value['id'])];
				// Striping slashes of non-array options
				if ( !is_array($val) ) {
					$val = stripslashes( $val );
				}
			}
		}

		// If there is a description save it for labels
		$explain_value = '';
		if ( isset( $value['desc'] ) ) {
			$explain_value = $value['desc'];
		}
		( !empty($value['class']) && strpos($value['class'],"not-met") )  ? $disabled = "" : $disabled = '';
		( !empty($value['placeholder']) )  ? $placeholder = 'placeholder="' . esc_attr( $value['placeholder'] ) . '"' : $placeholder = '';
		switch ( $value['type'] ) {

		// Basic text input
		case 'text':
		//var_dump(eo_chck_cl("google_ua_key","lvalidl"));

			$output .= '<input id="' . esc_attr( $value['id'] ) . '" class="of-input'.$disabled.'" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" type="text" value="' . esc_attr( $val ) . '" '.$placeholder.' '.$disabled.'/>';
			break;

		// Password input
		case 'password':
			$output .= '<input id="' . esc_attr( $value['id'] ) . '" class="of-input" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" type="password" value="' . esc_attr( $val ) . '" />';
			break;

		// Textarea
		case 'textarea':
			$rows = '8';

			if ( isset( $value['settings']['rows'] ) ) {
				$custom_rows = $value['settings']['rows'];
				if ( is_numeric( $custom_rows ) ) {
					$rows = $custom_rows;
				}
			}

			$val = stripslashes( $val );
			$output .= '<textarea id="' . esc_attr( $value['id'] ) . '" class="of-input" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" rows="' . $rows . '">' . esc_textarea( $val ) . '</textarea>';
			break;

		// Select Box
		case 'select':
			$output .= '<select class="of-input" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" id="' . esc_attr( $value['id'] ) . '">';

			foreach ($value['options'] as $key => $option ) {
				$output .= '<option'. selected( $val, $key, false ) .' value="' . esc_attr( $key ) . '">' . esc_html( $option ) . '</option>';
			}
			$output .= '</select>';
			break;


		// Radio Box
		case "radio":
			$name = $option_name .'['. $value['id'] .']';
			foreach ($value['options'] as $key => $option) {
				$id = $option_name . '-' . $value['id'] .'-'. $key;
				$output .= '<input class="of-input of-radio" type="radio" name="' . esc_attr( $name ) . '" id="' . esc_attr( $id ) . '" value="'. esc_attr( $key ) . '" '. checked( $val, $key, false) .' /><label for="' . esc_attr( $id ) . '">' . esc_html( $option ) . '</label>';
			}
			break;

		// Image Selectors
		case "images":
			$name = $option_name .'['. $value['id'] .']';
			foreach ( $value['options'] as $key => $option ) {
				$selected = '';
				if ( $val != '' && ($val == $key) ) {
					$selected = ' of-radio-img-selected';
				}
				$output .= '<input type="radio" id="' . esc_attr( $value['id'] .'_'. $key) . '" class="of-radio-img-radio" value="' . esc_attr( $key ) . '" name="' . esc_attr( $name ) . '" '. checked( $val, $key, false ) .' />';
				$output .= '<div class="of-radio-img-label">' . esc_html( $key ) . '</div>';
				// _eo-of-mod: imgclass
				$output .= '<img src="' . esc_url( $option ) . '" alt="' . $option .'" class="of-radio-img-img' . $selected .' '. $value['imgclass'] . '" onclick="document.getElementById(\''. esc_attr($value['id'] .'_'. $key) .'\').checked=true;" />';
			}
			break;

		// Checkbox
		case "checkbox":
			$output .= '<input id="' . esc_attr( $value['id'] ) . '" class="checkbox of-input" type="checkbox" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" '. checked( $val, 1, false) .' />';
			$output .= '<label class="explain" for="' . esc_attr( $value['id'] ) . '">' . wp_kses( $explain_value, $allowedtags) . '</label>';
			break;

		// Multicheck
		case "multicheck":
			foreach ($value['options'] as $key => $option) {
				$checked = '';
				$label = $option;
				$option = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($key));

				$id = $option_name . '-' . $value['id'] . '-'. $option;
				$name = $option_name . '[' . $value['id'] . '][' . $option .']';

				if ( isset($val[$option]) ) {
					$checked = checked($val[$option], 1, false);
				}

				$output .= '<input id="' . esc_attr( $id ) . '" class="checkbox of-input" type="checkbox" name="' . esc_attr( $name ) . '" ' . $checked . ' /><label for="' . esc_attr( $id ) . '">' . esc_html( $label ) . '</label>';
			}
			break;
			
		// _eo-of-mod Added Multiselect from latest
		case "multiselect":
		
			$output .= '<select multiple="multiple" class="of-input" name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '[]" id="' . esc_attr( $value['id'] ) . '">';
	
			foreach ($value['options'] as $key => $option) {
				$selected = '';
				$label = $option;
				$option = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($key));
				$id = $option_name . '-' . $value['id'] . '-'. $option;
				$name = $option_name . '[' . $value['id'] . '][' . $option .']';
				
				if ( isset($val) && is_array($val) ) {
					if( array_key_exists( $key, $val)) {
						if($val[$key]) {
							$selected = ' selected="selected" ';
						}
					}
				}
	
				$output .= '<option'. $selected .' value="' . esc_attr( $key ) . '">' . esc_html( $label ) . '</option>';
				
			}
	
			$output .= '</select>';
			break;
		// Color picker
		case "color":
			$default_color = '';
			if ( isset($value['std']) ) {
				if ( $val !=  $value['std'] )
					$default_color = ' data-default-color="' . $value['std'] . '" ';
			}
			$output .= '<input name="' . esc_attr( $option_name . '[' . $value['id'] . ']' ) . '" id="' . esc_attr( $value['id'] ) . '" class="of-color"  type="text" value="' . esc_attr( $val ) . '"' . $default_color .' />';

			break;

		// Uploader
		case "upload":
			$output .= optionsframework_uploader( $value['id'], $val, null,  esc_attr( $option_name . '[' . $value['id'] . ']' ) );

			break;

		// Typography
		case 'typography':

			unset( $font_source, $font_subset, $font_variant, $font_size, $font_style, $font_face, $font_color );

			$typography_defaults = array(
				'source' => 'os_font',
				'subset' => '',
				'variant' => '',
				'size' => '',
				'face' => '',
				'style' => '',
				'color' => ''
			);

			$typography_stored = wp_parse_args( $val, $typography_defaults );
			


		//	var_dump($fonts_all);
//			$all_fonts_sources[$all_font["font_src_slug"]] = $all_font["font_src_name"];
			
			$typography_options = array(
				//'sources' =>  array("os_font"=>"Os fonts"),
				//'faces' => eo_default_font_faces(),
				// Uncomment above 2, and comment out below 2 if you only want OS fonts
				'sources' =>  eo_get_font_sources(),
				'faces' => eo_combined_font_faces(),
				'subsets' => '',
				'variants' => array("400" => "Regular400"),
			//	'variants' => eo_combined_font_variants(),
				'sizes' => of_recognized_font_sizes(),
				'styles' => of_recognized_font_styles(),
				'color' => true
			);

			if ( isset( $value['options'] ) ) {
				$typography_options = wp_parse_args( $value['options'], $typography_options );
			}
			
			// Font Sources --  if we have multiple sources for font option
			if ( isset($typography_options['sources']) ) {
				
			//	var_dump( $typography_stored);
				$font_source = '<select class="of-typography of-typography-source" name="' . esc_attr( $option_name . '[' . $value['id'] . '][source]' ) . '" id="' . esc_attr( $value['id'] . '_source' ) . '">';
				$sources =	$typography_options['sources'];
				foreach ( $sources as $key => $source ) {
					$font_source .= '<option value="' . esc_attr( $key ) . '" ' . selected( $typography_stored['source'], $key, false ) . '>' . esc_html( $source ) . '</option>';
				}
				$font_source .= '</select>';
			}

			// Font Size
			if ( $typography_options['sizes'] ) {
				$font_size = '<select class="of-typography of-typography-size" name="' . esc_attr( $option_name . '[' . $value['id'] . '][size]' ) . '" id="' . esc_attr( $value['id'] . '_size' ) . '">';
				$sizes = $typography_options['sizes'];
				foreach ( $sizes as $i ) {
					$size = $i . 'px';
					$font_size .= '<option value="' . esc_attr( $size ) . '" ' . selected( $typography_stored['size'], $size, false ) . '>' . esc_html( $size ) . '</option>';
				}
				$font_size .= '</select>';
			}

			// Font Face
			if ( $typography_options['faces'] ) {
				$tsrcs = $typography_options['sources'];
				// If the font sources are properly defined in an array("font_squirrel"=>"Font Squirrel","typekit"=>"Type Kit") etc, & count 'em.
				if(is_array($tsrcs)) $f_src_c = count($tsrcs);
				
				if( $f_src_c < 2 ) {
					//We do not have multiple font sources	
					$faces = $typography_options['faces'];
				//	var_dump($faces);
					// Just fall back to default
					$font_face = '<select class="of-typography of-typography-face" name="'. esc_attr( $option_name . '[' . $value['id'] . '][face]' ) . '" id="' . esc_attr( $value['id'] . '_face' ) . '">';
					foreach ( $faces as $key => $face ) {
						$font_face .= '<option value="' . esc_attr( $key ) . '" ' . selected( $typography_stored['face'], $key, false ) . '>' . esc_html( $face ) . '</option>';
					}
					$font_face .= '</select>';
				}
				else {
				// Have multiple font sources, get the faces for them, first make sure we have a stored source choice, if not check for sources and get the first

					$all_faces = $typography_options['faces'];
					// If we dont have a selected source, just select the first available
					( !empty($typography_stored['source']) ) ? $stored_s = $typography_stored['source'] : $stored_s = key($tsrcs);
					$font_face = '';
					$cnt = 1;
					foreach ( $tsrcs as $k => $f ) {
							$cnt++;
						 // Get the faces for each font source from the previouslly stored option all_fonts
							if($k != $stored_s) {
								$hidd = "hid".$cnt."-";
								$hiddclas = "hidtype";
							}
							else {
								 $hidd = '';
								 $cnt = '';
								$hiddclas = "";
							}
							// Keep the select as is if it's the stored font, else modify the id and hide
						//	($stored_s
							$font_face .= '<select class="of-typography of-typography-face '.$k.' '.$hiddclas.'" name="'. $hidd. esc_attr( $option_name . '[' . $value['id'] . '][face]' ) . '" id="'. $hidd. esc_attr( $value['id'] . '_face' ) . '">';
							foreach ( $all_faces[$k] as $key => $face ) {
								$font_face .= '<option value="' . esc_attr( $key ) . '" ' . selected( $typography_stored['face'], $key, false ) . '>' . esc_html( $face ) . '</option>';
							}
							$font_face .= '</select>';
						 
					}
				}
			//	var_dump($faces);
				
			}

			// Font Styles
			if ( $typography_options['styles'] ) {
				$tsrcs = $typography_stored['source'];
				// _eo-review: make same with above hid class ?
				( $tsrcs == "gwf_font") ? $hiddclas = ' hidv' : $hiddclas = '';
					// Display styles only for standart fonts, google has variants.
					$font_style = '<select class="of-typography of-typography-style'.$hiddclas.'" name="'.$option_name.'['.$value['id'].'][style]" id="'. $value['id'].'_style">';
					$styles = $typography_options['styles'];
					foreach ( $styles as $key => $style ) {
						$font_style .= '<option value="' . esc_attr( $key ) . '" ' . selected( $typography_stored['style'], $key, false ) . '>'. $style .'</option>';
					}
					$font_style .= '</select>';
			}
			
			if ( $typography_options['variants'] ) {
				$ftg = $typography_stored['face'];
			//	var_dump( $value['id'],$typography_stored['variant'] );
				$tsrcs = $typography_stored['source'];
				( $tsrcs == "os_font") ? $hiddclas = ' hidv' : $hiddclas = '';
				if($typography_stored['face'] && $tsrcs != "os_font") {
					$variants = eo_get_gwf_variant($ftg);
				}
				else {
					$variants = $typography_options['variants'];
					
				}
					// Display styles only for standart fonts, google has variants.
					$font_variant = '<select class="of-typography of-typography-variant'.$hiddclas.'" name="'.$option_name.'['.$value['id'].'][variant]" id="'. $value['id'].'_variant">';
					// get the variant for the selected font if there's a stored val
					foreach ( $variants as $variant ) {
						$font_variant .= '<option value="' . esc_attr( $variant ) . '" ' . selected( $typography_stored['variant'], $variant, false ) . '>'. $variant .'</option>';
					}
					$font_variant .= '</select>';
			}

			// Font Color
			if ( $typography_options['color'] ) {
				//var_dump($typography_stored);
				$default_color = '';
				if ( isset( $value['std']['color'] ) ) {
					if ( $val !=  $value['std']['color'] )
						$default_color = ' data-default-color="' .$value['std']['color'] . '" ';
				}
				$font_color = '<input name="' . esc_attr( $option_name . '[' . $value['id'] . '][color]' ) . '" id="' . esc_attr( $value['id'] . '_color' ) . '" class="of-color of-typography-color  type="text" value="' . esc_attr( $typography_stored['color'] ) . '"' . $default_color .' />';
			}

			// Allow modification/injection of typography fields 
			$typography_fields = compact( 'font_source','font_face','font_variant','font_size', 'font_subset', 'font_style', 'font_color' );
		//	var_dump($typography_fields);
			$typography_fields = apply_filters( 'of_typography_fields', $typography_fields, $typography_stored, $option_name, $value );
			//var_dump($typography_fields);
			$output .= implode( '', $typography_fields );
			
			break;

		// Background
		case 'background':

			$background = $val;

			// Background Color
			$default_color = '';
			if ( isset( $value['std']['color'] ) ) {
				if ( $val !=  $value['std']['color'] )
					$default_color = ' data-default-color="' .$value['std']['color'] . '" ';
			}
			$output .= '<input name="' . esc_attr( $option_name . '[' . $value['id'] . '][color]' ) . '" id="' . esc_attr( $value['id'] . '_color' ) . '" class="of-color of-background-color"  type="text" value="' . esc_attr( $background['color'] ) . '"' . $default_color .' />';

			// Background Image
			if (!isset($background['image'])) {
				$background['image'] = '';
			}

			$output .= optionsframework_uploader( $value['id'], $background['image'], null, esc_attr( $option_name . '[' . $value['id'] . '][image]' ) );

			$class = 'of-background-properties';
			if ( '' == $background['image'] ) {
				$class .= ' hide';
			}
			$output .= '<div class="' . esc_attr( $class ) . '">';

			// Background Repeat
			$output .= '<select class="of-background of-background-repeat" name="' . esc_attr( $option_name . '[' . $value['id'] . '][repeat]'  ) . '" id="' . esc_attr( $value['id'] . '_repeat' ) . '">';
			$repeats = of_recognized_background_repeat();

			foreach ($repeats as $key => $repeat) {
				$output .= '<option value="' . esc_attr( $key ) . '" ' . selected( $background['repeat'], $key, false ) . '>'. esc_html( $repeat ) . '</option>';
			}
			$output .= '</select>';

			// Background Position
			$output .= '<select class="of-background of-background-position" name="' . esc_attr( $option_name . '[' . $value['id'] . '][position]' ) . '" id="' . esc_attr( $value['id'] . '_position' ) . '">';
			$positions = of_recognized_background_position();

			foreach ($positions as $key=>$position) {
				$output .= '<option value="' . esc_attr( $key ) . '" ' . selected( $background['position'], $key, false ) . '>'. esc_html( $position ) . '</option>';
			}
			$output .= '</select>';

			// Background Attachment
			$output .= '<select class="of-background of-background-attachment" name="' . esc_attr( $option_name . '[' . $value['id'] . '][attachment]' ) . '" id="' . esc_attr( $value['id'] . '_attachment' ) . '">';
			$attachments = of_recognized_background_attachment();

			foreach ($attachments as $key => $attachment) {
				$output .= '<option value="' . esc_attr( $key ) . '" ' . selected( $background['attachment'], $key, false ) . '>' . esc_html( $attachment ) . '</option>';
			}
			$output .= '</select>';
			$output .= '</div>';

			break;

		// Editor
		case 'editor':
			$output .= '<div class="explain">' . wp_kses( $explain_value, $allowedtags ) . '</div>'."\n";
			echo $output;
			$textarea_name = esc_attr( $option_name . '[' . $value['id'] . ']' );
			$default_editor_settings = array(
				'textarea_name' => $textarea_name,
				'media_buttons' => false,
				'tinymce' => array( 'plugins' => 'wordpress' )
			);
			$editor_settings = array();
			if ( isset( $value['settings'] ) ) {
				$editor_settings = $value['settings'];
			}
			$editor_settings = array_merge( $default_editor_settings, $editor_settings );
			wp_editor( $val, $value['id'], $editor_settings );
			$output = '';
			break;

		// Info
		case "info":
			$id = '';
			$class = 'section';
			if ( isset( $value['id'] ) ) {
				$id = 'id="' . esc_attr( $value['id'] ) . '" ';
			}
			if ( isset( $value['type'] ) ) {
				$class .= ' section-' . $value['type'];
			}
			if ( isset( $value['class'] ) ) {
				$class .= ' ' . $value['class'];
			}

			$output .= '<div ' . $id . 'class="' . esc_attr( $class ) . '">' . "\n";
			if ( isset($value['name']) ) {
				$output .= '<h4 class="heading">' . esc_html( $value['name'] ) . '</h4>' . "\n";
			}
			if ( $value['desc'] ) {
				$output .= apply_filters('of_sanitize_info', $value['desc'] ) . "\n";
			}
			$output .= '</div>' . "\n";
			break;
			
		case "free_html":
			$id = '';
			$class = 'section';
			if ( isset( $value['id'] ) ) {
				$id = 'id="' . esc_attr( $value['id'] ) . '" ';
			}
			if ( isset( $value['type'] ) ) {
				$class .= ' section-' . $value['type'];
			}
			if ( isset( $value['class'] ) ) {
				$class .= ' ' . $value['class'];
			}

			$output .= '<div ' . $id . 'class="' . esc_attr( $class ) . '">' . "\n";
			if ( isset($value['name']) ) {
				$output .= '<h4 class="heading">' . esc_html( $value['name'] ) . '</h4>' . "\n";
			}
			if ( $value['desc'] ) {
			//	$output .= apply_filters('of_sanitize_info', $value['desc'] ) . "\n";
				$output .= $value['desc'] . "\n";
			}
			$output .= '</div>' . "\n";
			break;

		// Heading for Navigation
		case "heading":
			$counter++;
			if ($counter >= 2) {
				$output .= '</div>'."\n";
				if(eo_check_of_opt('load_bs_adm') == "1" && !empty($eo_opts["groups"]) ) 	$output .= '</div><!-- end groupsect -->';
			}
			$class = '';
			$class = ! empty( $value['id'] ) ? $value['id'] : $value['name'];
			$class = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($class) );
			$output .= '<div id="options-group-' . $counter . '" class="opt-group group ' . $class . ' clearfix">';
			if(eo_check_of_opt('load_bs_adm') == "1" && !empty($eo_opts["groups"]) ) {
				$output .= '<!-- start groupsect --><div class="panel-group ' . esc_html( strtolower($value['name']) ) . '" id="section-gr-' . $counter . '">';
			}
			$output .= '<h3>' . esc_html( $value['name'] ) . '</h3>' . "\n";
			break;
		}

		if ( ( $value['type'] != "heading" ) && ( $value['type'] != "info" ) &&  ( $value['type'] != "free_html" )) {
			$output .= '</div>';

			if ( ( $value['type'] != "checkbox" ) && ( $value['type'] != "editor" ) ) {
				$output .= '<div class="explain">' . wp_kses( $explain_value, $allowedtags ) . '</div>'."\n";
			}
			// extra </div> for innerwrap
		//	$output .= '</div>';
			$output .= '</div></div>'."\n";
			if(isset($value["force_clear"]) ) {
				$output .='<div class="clearrow clearfix '.$value["force_clear"].'"></div><!-- forceclear row-->';
			}
		}
		if(eo_check_of_opt('load_bs_adm') == "1") {
			if (!empty($value["group"]) && array_key_exists('group', $value))  {
				if ( $glastid == $value["id"]  )		$output .= '</div></div></div><!-- end group output -->';
			}
		}
		echo $output;
	}		// _eo-fix: Where is this extra div coming from ?
		if(eo_check_of_opt('load_bs_adm') == "1" )	echo '</div>';
	echo '</div>';
}