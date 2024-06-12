<?php class eo_Walker_Nav_Menu extends Walker_Nav_Menu {
  function start_lvl(&$output, $depth=0, $args=array()) {

    $indent = str_repeat("\t", $depth);
    $output .= "\n$indent<ul class=\"sub-menu dropdown-menu\">\n";
  }
  function start_el( &$output, $item, $depth=0, $args=array(), $id=0 ) {
	  	$indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';
		$class_names = $value = '';
	  	  //	var_dump($item->title);
		$classes = empty( $item->classes ) ? array() : (array) $item->classes;
		(strpos($item->title,"[dd-ph]") !== false) ? $is_dd_placeholder = true : $is_dd_placeholder = false;
		
		if($is_dd_placeholder)	$classes[] = 'dd-ph';
		$classes[] = "depth".$depth;
		$classes_str = implode(" ",$classes);
		if(strpos($classes_str,"menu-item-has-children") !== false) {
			if(  $depth == 0 ) $classes[] .= ' dropdown';	
		}
		if(  $depth == 1 && strpos($classes_str,"menu-item-has-children") !== false  ) {
			$classes[] = " dropdown-submenu";
		//	var_dump($css_class);
		//	
		}
		$class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
		$class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';
		
		$id = apply_filters( 'nav_menu_item_id', 'menu-item-'. $item->ID, $item, $args );
		$id = $id ? ' id="' . esc_attr( $id ) . '"' : '';

		$output .= $indent . '<li' . $id . $value . $class_names .'>';

		$atts = array();
		$atts['title']  = ! empty( $item->attr_title ) ? $item->attr_title : '';
		$atts['target'] = ! empty( $item->target )     ? $item->target     : '';
		$atts['rel']    = ! empty( $item->xfn )        ? $item->xfn        : '';
		$atts['href']   = ! empty( $item->url )        ? $item->url        : '';
		if( $is_dd_placeholder	)	$atts['data-toggle'] = "dropdown";
		if( $is_dd_placeholder	)	$atts['class'] = 'dropdown-toggle';
		

		/**
		 * Filter the HTML attributes applied to a menu item's <a>.
		 *
		 * @since 3.6.0
		 *
		 * @param array $atts {
		 *     The HTML attributes applied to the menu item's <a>, empty strings are ignored.
		 *
		 *     @type string $title  The title attribute.
		 *     @type string $target The target attribute.
		 *     @type string $rel    The rel attribute.
		 *     @type string $href   The href attribute.
		 * }
		 * @param object $item The current menu item.
		 * @param array  $args An array of arguments. @see wp_nav_menu()
		 */
		$atts = apply_filters( 'nav_menu_link_attributes', $atts, $item, $args );

		$attributes = '';
		foreach ( $atts as $attr => $value ) {
			if ( ! empty( $value ) ) {
				$value = ( 'href' === $attr ) ? esc_url( $value ) : esc_attr( $value );
				$attributes .= ' ' . $attr . '="' . $value . '"';
			}
		}
		$item_output = $args->before;
		$item_output .= '<a'. $attributes .'>';
		if(strpos($classes_str,"fa_") !== false ) {
			foreach ($classes as $clas) {
				if(strpos($clas,"fa_") !== false) 	{
						$fa_name = str_replace("fa_","",$clas);
						$item_output .= '<i class="fa fa-'.$fa_name.'"></i>';
				}
			}	
		}
		/** This filter is documented in wp-includes/post-template.php */
		$item_output .= $args->link_before . apply_filters( 'the_title', $item->title, $item->ID ) . $args->link_after;
		$item_output .= '</a>';
		$item_output .= $args->after;
		
		if( $is_dd_placeholder) $item_output = str_replace("[dd-ph]","",$item_output);
//		  function start_el( &$output, $item, $depth, $args, $id=0 ) {

		$output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args, $id );
  }
}
?>