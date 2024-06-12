<?php 
	function eo_optionsframework_tabs() {
		$counter = 0;
		$options =& _optionsframework_options();
		$menu = '<ul class="nav nav-tabs">';
		foreach ( $options as $value ) {
			// Heading for Navigation
			if ( $value['type'] == "heading" ) {
							if( !empty ($value["icon"]) ) {
				//	var_dump($key,$value["icon"]);
					$icon = '<span class="glyphicon glyphicon-'.$value["icon"].'"></span>';
				}
				else {
					$icon = '';
					// _eo-check : why need this ?
				}
				$counter++;
				$class = '';
				$class = ! empty( $value['id'] ) ? $value['id'] : $value['name'];
				$class = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($class) ) . '-tab';
				$menu .= '<li><a id="options-group-' . $counter . '-tab" class="nav-tab ' . $class .'" title="' . esc_attr( $value['name'] ) . '" href="' . esc_attr( '#options-group-' . $counter ) . '">' . $icon .esc_html( $value['name'] ) . '</a></li>';
			}
		}
		$menu .= '</ul>';
		return $menu;
	}

	function eo_optionsframework_side_menu() {
		$counter = -1;
		$opt_gr_counter = 0;
		$options =& _optionsframework_options();
		$eo_opts =  get_option('eo_opts');
	//	var_dump($options);
	//	var_dump($eo_opts["groups"]);
		$menu = '<div role="complementary" class="bs-sidebar col-md-3 col-lg-2 visible-lg" id="eo_bs_side_menu">
		<ul class="nav bs-sidenav">';
							// var_dump($eo_opts["groups"]);

		foreach ( $options as $key => $value ) {
			// Heading for Navigation
				$counter++;
				$class = '';
				$class = ! empty( $value['id'] ) ? $value['id'] : $value['name'];
				$class = preg_replace('/[^a-zA-Z0-9._\-]/', '', strtolower($class) ) . '-tab';
				$targ = "#options-group-";
				if ( $value['type'] == "heading") {
					if( !empty ($value["icon"]) ) {
					//	var_dump($key,$value["icon"]);
						$icon = '<span class="glyphicon glyphicon-'.$value["icon"].'"></span>';
					}
					else {
						$icon = '';
						// _eo-check : why need this ?
		
					}
				// Group Panel Head 
					$opt_gr_counter++;
					if (  $counter >= 1 ) $menu .= '</ul></div></li>';
					$menu .= '<li id="sideli-'.esc_attr( str_replace("#","",$targ . $opt_gr_counter ) ).'" class="root">
								<div class="panel panel-default">
								  <div class="panel-heading"><a id="side-options-group-'.  $opt_gr_counter . '" class="panhead sidea ' . $class .'" title="' . esc_attr( $value['name'] ) . '" href="' . esc_attr( $targ . $opt_gr_counter ) . '">'.$icon.' ' . esc_html( $value['name'] ) . '</a></div>
							  <ul class="list-group">';
					//$menu .= '<li>arrkey#'.$key.'-item#'.$counter.'<a id="options-groupee-'.  $counter . '-tab" class="sidea ' . $class .'" title="' . esc_attr( $value['name'] ) . '" href="' . esc_attr( '#options-group-'.  $counter ) . '">' . esc_html( $value['name'] ) . '</a></li>';
				}
				else {
				// Regular item 
					if( ! empty( $value['group']) ) {
						// has group
				//		var_dump($eo_opts["groups"]);
						$targ = "#opt_grp_";
						$opt_gr = $value['group'];
						
						// Only get the first items of the group, skip the rest - Show only groups
						if( $value['id'] == $eo_opts["groups"][$opt_gr]['first_item']) {
							$a_additonal = ' data-parent="sideli-'.esc_attr( str_replace("#","",$targ . $opt_gr ) ).'" data-toggle="collapse" ';
							$menu .= '<li class="list-group-item-li"><a id="sub-options-group-'.  $counter . '"'.$a_additonal.' class="list-group-item accordion-toggle sidea suba ' . $class .'"  title="' . esc_attr( $value['name'] ) . '" href="' . eo_sanitize_id( $targ . $opt_gr ) . '">' . ucwords( esc_html( $value['group'] ) ). ' Options</a></li>';

						}						
						//<a class="accordion-toggle" data-toggle="collapse" data-parent="#section-gr-1" href="#opt_grp_jumbotron">	<b class="caret"></b> Jumbotron Options Group</a>							  
					}
					else {		
						// Ungrouped option, fall back to previous heading ?
						//$menu .= '<li class="list-group-item">No Option Groups</li>';
						continue;	// Dont show ungrouped items
						$opt_gr = $opt_gr_counter;
/*						echo "ungroued";		
						continue;
						
			//			var_dump( $opt_gr_counter );
					//	var_dump ($options[intval($key)-1]);
//						var_dump( $key , $key)
						//	var_dump ( prev($options[intval($key)]) );
					//		$opt_gr = '';
						

						/*else {
							$menu = .
						}*/
					}

					//$menu .= '<li class="list-group-item">arrkey#'.$key.'-item#'.$counter.
				}
				// Uncomment to show all options, grouped or ungrouped.
				//$menu .= '<li class="list-group-item"><a id="sub-options-group-'.  $counter . '"'.$a_additonal.' class="accordion-toggle sidea ' . $class .'"  title="' . esc_attr( $value['name'] ) . '" href="' . esc_attr( $targ . $opt_gr ) . '">' . esc_html( $value['name'] ) . '</a></li>';
		}
		$menu .= '</ul></div></li></ul></div>';
	
		return $menu;
	}
//}

//add_action('admin_enqueue_scripts','eo_bs_prog_css');
?>