<?php
global $eo_const,$eo_options;
if($eo_const["img_h_clss"])$img_h = $eo_const["img_h_clss"];
(of_get_option('slider_postcnt') ) ? $postcnt = intval(of_get_option('slider_postcnt')) : $postcnt = 3;
$cat = intval(of_get_option('slider_postcat'));
$orderby = of_get_option('slider_ord_by');
$ord = of_get_option('slider_ord');
$wtd = $eo_options['caru_whtd'];
if( !empty($wtd) & is_array($wtd) ) {
	$types = array();
	foreach ( $wtd as $typ => $v) {
		if($v == "1")	$types[] = $typ;
	}
	if(empty($types)) $types = array("post");
	//var_dump($less_rsrcs_arr);
}
$caru_args = array(
	'post_type' => $types,
	'ignore_sticky_posts' => 1
);
if($postcnt) $caru_args["posts_per_page"] = $postcnt;
if($orderby) $caru_args["orderby"] = $orderby;
if($ord) $caru_args["order"] = $ord;
if($cat && $cat != 0) $caru_args["cat"] = $cat;

// Excludes
$mod_exc_id = "caru";
include(get_template_directory().'/inc/modules/_mod_excl_incl.php');

// The Query
$caru_qy = new WP_Query( $caru_args );
$caru_post_arr = $caru_qy->posts;
$caru_ids_arr = array();
foreach ( $caru_post_arr as $caru_post ) {
	$caru_ids_arr[] = $caru_post->ID;	
}
set_transient('eo_caru_ids',$caru_ids_arr);

?>
<div class="carousel slide" id="myCarousel">
  <!-- Indicators -->
  <ol class="carousel-indicators">
	<li class="" data-slide-to="0" data-target="#myCarousel"></li>
    <?php $cnt=1; 
	while($cnt < $postcnt) {
	  echo '<li data-slide-to="'.$cnt.'" data-target="#myCarousel" class="active"></li>';
	  $cnt++;
	  } 
	?>
  </ol>
  <div class="carousel-inner">
<?php // Carousel Loop
	while ( $caru_qy->have_posts() ) {
	//var_dump($caru_qy->current_post,$postcnt);
	//if($caru_qy->current_post == $postcnt) return;
	$caru_qy->the_post();

	$customimg = get_post_meta($post->ID,"_eo_cust_post_feat_img",true);
	if ( has_post_thumbnail() === false && $eo_options["use_placeholder"] == "1" ) { 
		if( is_array(eo_get_cons('say_buzz') ) ) {
			$hia = eo_get_cons('say_buzz');
			$himx = count($hia);
			$hin = array_rand($hia);
			$buzz_txt = $hia[$hin];
		}
	
	?>
	<img class="hold" src="data:image/png;base64," data-src="<?php echo get_template_directory_uri().'/library/bootstrap/js/holder.js/100%x320/auto/'.array_rand(eo_get_cons('img_h_clss')).'/text:'.esc_attr($buzz_txt); ?>" alt="<?php get_the_title() ?>" data-holder-invisible="true">
	<?php } ?>
    <div class="item <?php if($caru_qy->current_post == 0) echo 'active';?>">
     <?php 	if ( has_post_thumbnail() === false && $eo_options["use_placeholder"] != "1" &&  $eo_options["use_placeholder_img"] == "1" ) { ?>
    <span class="holdimg">&nbsp;Placeholder</span>
    <?php } ?>
	<?php  

	if ( has_post_thumbnail() ) the_post_thumbnail( 'eo-carousel' );  ?> 
	<?php    if ( has_post_thumbnail() ) the_post_thumbnail( 'eo-carousel' );  ?> 
      <div class="container">
        <div class="carousel-caption">
          <h1><?php	echo  get_the_title()  ?></h1>
          <?php eo_xcrpt(12); ?><a href="<?php the_permalink() ?>" class="btn btn-large btn-primary">Details <span class="glyphicon glyphicon-chevron-right"></span></a>
        </div>
      </div>
    </div>
	<?php } // end carousel loop ?>
  </div>

  <a data-slide="prev" href="#myCarousel" class="left carousel-control"><span class="glyphicon glyphicon-chevron-left"></span></a>
  <a data-slide="next" href="#myCarousel" class="right carousel-control"><span class="glyphicon glyphicon-chevron-right"></span></a>
</div>