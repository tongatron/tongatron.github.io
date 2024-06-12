<?php $customimg = get_post_meta($post->ID,"_eo_cust_post_feat_img",true); ?>
<?php
global $eo_options;
$lsiz = $eo_options["loop_siz"];
($lsiz == "double" && ! is_singular()) ? $post_cl = 'col-lg-6' : $post_cl = 'clearfix';
?>
<article id="post-<?php the_ID(); ?>" <?php post_class($post_cl); ?> role="article">
    <header>    
		<div class="page-header"><h2 class="h2"><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h2></div>
    </header> <!-- end article header -->
	<section class="post_content">
		  <?php 
		  	($eo_options["featimg_disp"] == "inline" || $eo_options["featimg_disp"] == "hybrid") ? $fimg_dcl = 'cbinl col-sm-3 col-md-4 col-lg-3' : $fimg_dcl = '';
		  	if($eo_options["featimg_link"] != "post") $fimg_dcl = $fimg_dcl . ' cboxElement';
		    if ( has_post_thumbnail() ) { 
                     $thumbargs = array(
                //	'src'	=> $src,
                    'class' => 'feat-thumb img-responsive',
                    'alt'	=> trim(strip_tags(get_the_title() ) ),
                    'title'	=> trim(strip_tags(get_the_title() ) )
                    );
                    $large_image_url = wp_get_attachment_image_src( get_post_thumbnail_id($post->ID), 'large');
					($eo_options["featimg_link"] == "post") ? $fimg_l = get_permalink() : $fimg_l =  $large_image_url[0];
					($eo_options["featimg_size"]) ? $featimg_size = $eo_options["featimg_size"] : $featimg_size = 'thubmnail';
						
					echo '<a href="' . $fimg_l . '" class="thumbnail '.$fimg_dcl.'">';
                    the_post_thumbnail( $featimg_size,$thumbargs ); 
                    echo '</a>';
                }
                elseif($customimg) { 
                    $pimg = '<a href="'.$customimg. '" class="thumbnail '.$fimg_dcl.'" title="' . the_title_attribute('echo=0') . '"><img src="'.$customimg.'" class="featurette-image img-responsive custimg" /></a>';
                    echo $pimg;
                }
				//eovd($eo_options["loop_ext"]);
				if($eo_options["loop_ext"] && $eo_options["loop_ext"] == 'excerpt') {
					
					if(!empty($eo_options["exc_lim"]) && intval($eo_options["exc_lim"]) > 0 ) {
						if($eo_options["exc_limby"] == "char") {
						 eo_trim(strip_tags(get_the_excerpt()),$eo_options["exc_lim"]);	
						}
						else if($eo_options["exc_limby"] == "word") {
						 eo_xcrpt(strip_tags($eo_options["exc_lim"]));	
						}
					}
					else {
						the_excerpt();
					}
				}
				else {
                    the_content();
				}
                ?>
	</section> <!-- end article section -->
  
  <footer>
      <div class="post_meta"> 
     <?php if($eo_options["pmeta_time"] == "1") { ?><span class="footmeta ptime"><time datetime="<?php the_time('Y-m-j'); ?>"><span class="glyphicon glyphicon-time"></span><?php echo get_the_date('Y-m-d'); ?></time></span><?php } ?>
     <?php if($eo_options["pmeta_auth"] == "1") { ?><span class="footmeta pauth"><?php _e("by", "bonestheme"); ?> <?php the_author_posts_link(); ?></span><?php } ?>
     <?php if($eo_options["pmeta_cat"] == "1") { ?><span class="footmeta pcat"><?php _e("filed under", "bonestheme"); ?> <?php the_category(', '); ?>.</span><?php } ?>
	<?php if($eo_options["pmeta_tags"] == "1") { ?><span class="footmeta ptags tags"><span class="glyphicon glyphicon-tags"></span><?php the_tags('<span class="tags-title">' . __("Tags", "bonestheme") . ':</span> ', ' ', ''); ?></span><?php } ?>
    </div>
    
  </footer> <!-- end article footer -->

</article> <!-- end article -->