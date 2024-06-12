<?php
global $eo_options;
get_header(); 
$sldr = of_get_option('show_slider');
$sldr_p = of_get_option('slider_p');
$sh_high = of_get_option('show_highlights');
$sh_feat = of_get_option('show_featurettes');
$sh_jumbo = of_get_option('blog_jumbo');
$paged = (get_query_var('paged')) ? get_query_var('paged') : 1; 


(!empty($eo_options["home_postcnt"]) ) ? $homepcnt = intval($eo_options["home_postcnt"]) : $homepcnt = false;
$cat = intval(of_get_option('home_postcat'));
$orderby = of_get_option('home_ord_by');
$ord = of_get_option('home_ord');
$wtd = $eo_options['home_whtd'];
if( !empty($wtd) & is_array($wtd) ) {
	$types = array();
	foreach ( $wtd as $typ => $v) {
		if($v == "1")	$types[] = $typ;
	}
	if(empty($types)) $types = array("post");
}
$homeq_args = array(
	'post_type' => $types,
	'paged' => $paged,
	'ignore_sticky_posts' => 1
);
if($homepcnt) $homeq_args["posts_per_page"] = $homepcnt;
if($orderby) $homeq_args["orderby"] = $orderby;
if($ord) $homeq_args["order"] = $ord;
if($cat && $cat != 0) $homeq_args["cat"] = $cat;

		
if ( ! empty( $eo_options["home_excl"] ) ) {
	$excluded_ids = array();
	$home_excludes = $eo_options["home_excl"];
	$home_mods = array("high"=>'show_highlights',"caru"=>'show_slider',"feat"=>'show_featurettes');
	foreach ( $home_excludes as $exc=>$v) {
		if($v == "1" && $eo_options[$home_mods[$exc]] == "1") {
				${$exc . '_ids'} = get_transient('eo_'.$exc.'_ids');
				if(${$exc . '_ids'} && is_array(${$exc . '_ids'}) ) $excluded_ids = array_merge($excluded_ids,${$exc . '_ids'} );
		}
	}
	$excluded_ids = array_unique($excluded_ids);
	if(is_array($excluded_ids) && ! empty ($excluded_ids) ) $homeq_args["post__not_in"] = $excluded_ids;
}


$home_qy = new WP_Query( $homeq_args );
	

if($sldr && $sldr_p == "full" && is_home() ) eo_get_template_part( 'inc/modules/carousel' ); ?>
	<div class="container" id="maincnot">
       <?php if($sldr && $sldr_p == "contain" && is_home() ) eo_get_template_part( 'inc/modules/carousel' ); ?>
       <?php   if($sh_jumbo == "1") eo_get_template_part( 'inc/modules/jumbo' ); ?>
       <div id="content" class="clearfix">
       <?php   if($sh_high == "1") eo_get_template_part( 'inc/modules/highlights' ); ?>
       <?php   if($sh_feat == "1") eo_get_template_part( 'inc/modules/featurettes' ); ?>
       <?php  //get_template_part( $eo_theme . 'inc/carousel' ); ?>

        	<?php //eovd($eo_options); ?>
            <?php if($eo_options["main_layout"] == "left-sidebar"  ) {
				if($eo_options["home_sb"] == "1" ) {
					get_sidebar('home'); // sidebar 2
				} else {
					get_sidebar(); // sidebar main
				}
			}
			?>
			<?php
			 ($eo_options["main_layout"]=="full") ? $main_cols = 'col-sm-12' : $main_cols = eo_get_cols('main','',false) ?>
			<div id="main" class="<?php echo $main_cols ?>" role="main">
            <?php //var_dump($posts); ?>
                <?php if ($eo_options["inf_scroll"] == "1") echo '<div class="postshold">' ?>
                <?php $counter = 0;
				$currpono = $home_qy->post_count;
				 if ($home_qy->have_posts()) : while ($home_qy->have_posts()) : $home_qy->the_post();
				 if($eo_options["loop_siz"] == "double") {
					 ( $counter % 4 == 0 ) ? $zcl = "z1" : $zcl ='z2';
					 if ($counter % 2 == 0 && $counter === 0){
							echo '<div class="row '.$zcl.'" id="rwid'.$counter.'">';
							} else if ($counter % 2 == 0){
								echo '</div><div class="row '.$zcl.'" id="rwid'.$counter.'">';
							} 
							( $counter % 2 == 0 ) ? $ther = "odd" : $ther ='even';
				 }
                
                 get_template_part( 'content', get_post_format() ); ?>		
                 
                <?php  if($eo_options["loop_siz"] == "double") {
					/*
					eovd(count( $posts ) );
					eovd($counter);
					eovd($homepcnt );*/
                  if ( $counter === $currpono - 1 ) echo '</div><!-- the last div-->';
						 
						$counter++;
				}?>		
                 			
                <?php endwhile; ?>	
                
                <?php if (function_exists('eo_page_navi')) {
                     eo_page_navi($home_qy->max_num_pages); // custom page navi function derived from bones 
                    } else { // if it is disabled, display regular wp prev & next links ?>
                    <nav class="wp-prev-next">
                        <ul class="clearfix">
                            <li class="prev-link"><?php next_posts_link(_e('&laquo; Older Entries', "bonestheme")) ?></li>
                            <li class="next-link"><?php previous_posts_link(_e('Newer Entries &raquo;', "bonestheme")) ?></li>
                        </ul>
                    </nav>
                <?php } ?>	
                
                <?php else : ?>
                
                <article id="post-not-found">
                    <header>
                        <h1><?php _e("Not Found", "bonestheme"); ?></h1>
                    </header>
                    <section class="post_content">
                        <p><?php _e("Sorry, but the requested resource was not found on this site.", "bonestheme"); ?></p>
                    </section>
                    <footer>
                    </footer>
                </article>
                
                <?php endif; ?>
                <?php if ($eo_options["inf_scroll"] == "1") echo '</div> <!-- end .postshold -->' ?>
            </div> <!-- end #main -->

            <?php if($eo_options["main_layout"] == "right-sidebar"  ) {
				if($eo_options["home_sb"] == "1" ) {
					get_sidebar('home'); // sidebar 2
				} else {
					get_sidebar(); // sidebar main
				}
			}
			?>

        </div> <!-- end #content -->
	</div><!-- maincnot -->
<?php get_footer(); ?>