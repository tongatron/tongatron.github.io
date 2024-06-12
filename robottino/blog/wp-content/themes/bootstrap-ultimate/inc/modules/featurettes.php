<?php
global $eo_options;
(of_get_option('feat_postcnt') ) ? $postcnt = intval(of_get_option('feat_postcnt')) : $postcnt = 2;
$cat = intval(of_get_option('feat_postcat'));
$orderby = of_get_option('feat_ord_by');
$ord = of_get_option('feat_ord');
$wtd = $eo_options['feat_whtd'];
if( !empty($wtd) & is_array($wtd) ) {
	$types = array();
	foreach ( $wtd as $typ => $v) {
		if($v == "1")	$types[] = $typ;
	}
	if(empty($types)) $types = array("post");
	//var_dump($less_rsrcs_arr);
}
$feat_args = array(
	'post_type' => $types,
	'ignore_sticky_posts' => 1
);
if($postcnt) $feat_args["posts_per_page"] = $postcnt;
if($orderby) $feat_args["orderby"] = $orderby;
if($ord) $feat_args["order"] = $ord;
if($cat && $cat != 0) $feat_args["cat"] = $cat;

$mod_exc_id = "feat";
include(get_template_directory().'/inc/modules/_mod_excl_incl.php');

// The Query
$feat_qy = new WP_Query( $feat_args );

// Save the retrieved IDs to exclude in other places
$feat_post_arr = $feat_qy->posts;
$feat_ids_arr = array();
foreach ( $feat_post_arr as $feat_post ) {
	$feat_ids_arr[] = $feat_post->ID;	
}
set_transient('eo_feat_ids',$feat_ids_arr);
//var_dump($feat_ids_arr);
?>  

<?php // Featurette Loop
	while ( $feat_qy->have_posts() ) {
	$feat_qy->the_post();
	$customimg = get_post_meta($post->ID,"_eo_cust_post_feat_img",true);
?>
<?php // Custom Title
	$the_title = get_the_title();
	$first3 = eo_snippet($the_title,2);
	if($first3)$sec2 = eo_snippet($the_title,2,$first3);
	if($first3 && $sec2) {
		//If  3 parts is needed 
	}
	else if($first3) {
		$the_title = $first3. '<span class="text-muted">' . str_replace($first3,"",$the_title) . '</span>';
	}
?>
    
	<hr class="featurette-divider">
        
	<div class="row featurette">
        <div class="col-md-8">
          <h2 class="featurette-heading"><?php echo $the_title ?></h2>
          <p class="lead"><?php eo_xcrpt(24); ?></p>
          <a class="btn btn-info" href="<?php the_permalink() ?>"><span class="glyphicon glyphicon-star"></span>Read More &raquo;</a>
        </div>
        <div class="col-md-4">
 <?php	if ( has_post_thumbnail() ) { 
		$large_image_url = wp_get_attachment_image_src( get_post_thumbnail_id(), 'large');
		echo '<a href="' . $large_image_url[0] . '" class="thumbnail cboxElement" title="' . the_title_attribute('echo=0') . '" >';
		the_post_thumbnail( 'eo-featurette',array('class' => 'featurette-image img-responsive') ); 
        echo '</a>';?>
 <?php }
 elseif($customimg) { 
 		echo '<a href="'.$customimg. '" class="thumbnail cboxElement" title="' . the_title_attribute('echo=0') . '">';
		echo '<img src="'.$customimg.'" class="featurette-image img-responsive custimg" /></a>';
 }
		else if( $eo_options["use_placeholder"] == "1" ){ 
			if( is_array(eo_get_cons('say_buzz') ) ) {
				$hia = eo_get_cons('say_buzz');
				$himx = count($hia);
				$hin = array_rand($hia);
				$feat_txt = $hia[$hin];
			}
?> 
			<div class="thumbnail"><img class="hold" src="data:image/png;base64," data-src="<?php echo get_template_directory_uri().'/library/bootstrap/js/holder.js/350x290/auto/'.array_rand(eo_get_cons('img_h_clss')).'/text:'.esc_attr($feat_txt); ?>" alt="<?php get_the_title() ?>" data-holder-invisible="true"></div>
        
<?php } // No feat img ?>
		</div>
	</div>
<?php } // end faturette loop ?>