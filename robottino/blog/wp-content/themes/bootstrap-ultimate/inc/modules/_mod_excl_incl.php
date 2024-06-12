<?php if ( ! defined( 'ABSPATH' ) ) exit;
/**
 * Excludes / Includes Template for modules (highlights,featurettes,carousel etc)
 *
 * This template file excludes / include posts from modules post queries.
 *
 * Uses transients
 *
 * @package EoTheme
 * @subpackage BootstrapUL
 */
//var_dump($mod_exc_id);
if ( ! empty ( $eo_options[$mod_exc_id.'_incl_ids'] ) ) {
	$included_ids = array_map('intval', explode(',', $eo_options[$mod_exc_id.'_incl_ids']));
	${$mod_exc_id.'_args'}["post__in"] = $included_ids;
	//var_dump( $included_ids);
}


$excluded_ids = array();
/*var_dump("postid:". $post->ID);
var_dump(is_home());*/

// _eo-todo: Standartize these ?


${$mod_exc_id.'_excl'} = $eo_options[$mod_exc_id.'_excl'];

//	var_dump($high_excl);
if( !empty(${$mod_exc_id.'_excl'}) & is_array(${$mod_exc_id.'_excl'}) ) {
	foreach ( ${$mod_exc_id.'_excl'} as $exc => $v) {
		$home_mods = array("high"=>'show_highlights',"caru"=>'show_slider',"feat"=>'show_featurettes');
		
		// if is home or page and if the module is enabled
		if($v == "1" && is_home() && $eo_options[$home_mods[$exc]] || $v == "1" && is_page() && !empty($eo_options[$exc.'_also_disp']) & is_array($eo_options[$exc.'_also_disp']) && $eo_options[$exc.'_also_disp'][$post->ID] == "1")	{
			${$exc . '_ids'} = get_transient('eo_'.$exc.'_ids');
			if(${$exc . '_ids'} && is_array(${$exc . '_ids'}) ) $excluded_ids = array_merge($excluded_ids,${$exc . '_ids'} );
			//		var_dump($excluded_ids);

		}
		
	}
	$excluded_ids = array_unique($excluded_ids);
	//var_dump($excluded_ids);
}
 
if ( ! empty ( $eo_options[$mod_exc_id.'_excl_ids'] ) ) {
	$excl_ids_pre = array_map('intval', explode(',', $eo_options[$mod_exc_id.'_excl_ids']));
	$excluded_ids = array_unique(array_merge($excluded_ids,$excl_ids_pre) );
}
${$mod_exc_id.'_args'}["post__not_in"] = $excluded_ids;
//var_dump($excluded_ids);
?>