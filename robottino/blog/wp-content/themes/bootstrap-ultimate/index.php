<?php global $eo_options;
get_header();
$ptitl = false;
$h_cl = false;
if(is_search()) {
	$ptitl = __("Search Results for:", "eo_theme");
	$pidf = esc_attr( get_search_query() );
}
if(is_author()) {
	$curauth = (get_query_var('author_name')) ? get_user_by('slug', get_query_var('author_name')) : get_userdata(get_query_var('author'));
	$ptitl = __("Posts By:", "bonestheme");
	$pidf = get_the_author_meta('display_name', $curauth->ID); 
}
if(is_archive()) {
	$h_cl = ' archive_title h2';
	if (is_author()) {
		$ptitl = __("Posts By:", "bonestheme");
		$pidf = get_the_author_meta('display_name', $curauth->ID); 
	} elseif (is_category()) {
    	$ptitl =  __("Posts Categorized:", "bonestheme");
		$cat = get_queried_object();
		$pidf = $cat->name;
	} elseif (is_tag()) { 
		$ptitl =  __("Posts Tagged:", "bonestheme");
		$tag = get_queried_object();
		$pidf = $tag->name;
	} elseif (is_day()) {
		$ptitl =  __("Daily Archives:", "bonestheme");
		$pidf = get_the_time('l, F j, Y');
	} elseif (is_month()) { 
		$ptitl = __("Monthly Archives:", "bonestheme");
		$pidf = get_the_time('F Y');
	} elseif (is_year()) { 
		$ptitl = __("Yearly Archives:", "bonestheme");
		$pidf = get_the_time('Y'); 
	} 
}
?>
<div class="container" id="maincnot">
	<div id="content" class="clearfix">
		<?php if($eo_options["main_layout"] == "left-sidebar"  )	get_sidebar(); // sidebar main	?>
        <?php ($eo_options["main_layout"]=="full") ? $main_cols = 'col-sm-12' : $main_cols = eo_get_cols('main','',false) ?>
		<div id="main" class="<?php echo $main_cols ?>" role="main">        	
		<?php if($ptitl) { ?>
				<div class="page-header">
					<h1 class="h2<?php if($h_cl) echo $h_cl ?>"><span><?php echo $ptitl; ?></span> <?php echo $pidf; ?></h1>
				</div>
            <?php } ?>
			<?php if ($eo_options["inf_scroll"] == "1") echo '<div class="postshold">' ?>
            <?php $counter = 0;
			$currpono = $wp_query->post_count;
             if (have_posts()) : while (have_posts()) : the_post();
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
                  if ( $counter === $currpono - 1 ) echo '</div><!-- the last div-->';
                     
                    $counter++;
            }?>		          
            <?php endwhile; ?>
            		
			<?php if (function_exists('eo_page_navi')) {
                eo_page_navi(); // custom page navi function derived from bones 
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
		<?php if($eo_options["main_layout"] == "right-sidebar"  ) 	get_sidebar(); // sidebar main	?>	
	</div> <!-- end #content -->
</div><!-- maincnot -->
<?php get_footer(); ?>