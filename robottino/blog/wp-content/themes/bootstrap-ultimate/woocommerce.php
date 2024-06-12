<?php global $eo_options;
get_header();
$cust_layout = get_post_meta($post->ID,'_eo_cust_post_layout',true);
$customimg = get_post_meta($post->ID,"_eo_cust_post_feat_img",true);
?>
<div class="container" id="maincnot">
<?php
$mod_idfs = array("high"=>'highlights',"caru"=>'carousel',"feat"=>'featurettes');
foreach ($mod_idfs as $mod_idf=>$fnam ) {
	if( !empty($eo_options[$mod_idf.'_also_disp']) & is_array($eo_options[$mod_idf.'_also_disp']) ) {
		//var_dump($eo_options[$mod_idf.'_also_disp']);
		if($eo_options[$mod_idf.'_also_disp'][$post->ID] == "1") eo_get_template_part( 'inc/modules/'.$fnam ); wp_reset_query();		
	}
}
?>
	<div id="content" class="clearfix">
		<?php if($cust_layout && $cust_layout == "left-sidebar"  || !$cust_layout && $eo_options["main_layout"] == "left-sidebar" || $cust_layout == "default"  && $eo_options["main_layout"] == "left-sidebar" )	get_sidebar(); // sidebar main	?>
        <?php ($cust_layout && $cust_layout == "full" || !$cust_layout && $eo_options["main_layout"]=="full") ? $main_cols = 'col-sm-12' : $main_cols = eo_get_cols('main','',false) ?>
		<div id="main" class="<?php echo $main_cols ?>" role="main">
				<?php woocommerce_content(); ?>
				</div> <!-- end #main -->
			<?php if($cust_layout && $cust_layout == "right-sidebar"  || !$cust_layout  && $eo_options["main_layout"] == "right-sidebar" || $cust_layout == "default"  && $eo_options["main_layout"] == "right-sidebar" )	get_sidebar(); // sidebar main	?>
        </div> <!-- end #content -->
	</div><!-- maincnot -->
<?php get_footer(); ?>