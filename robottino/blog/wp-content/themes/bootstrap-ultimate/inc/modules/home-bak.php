<?php get_header();
$sldr = of_get_option('show_slider');
$sldr_p = of_get_option('slider_p');
$sh_high = of_get_option('show_highlights');
$sh_feat = of_get_option('show_featurettes');
// if($sldr && $sldr_p == "contain" && is_home()) eo_get_template_part( 'inc/carousel' );
// eo-todo: move the main container out of header inside index ?>

			<?php echo "bbb";
			
				$blog_jumbo = of_get_option('blog_jumbo');
				if ($blog_jumbo){
			?>
            
			<div class="clearfix row">
				<div class="jumbotron">
				
					<h1><?php bloginfo('title'); ?></h1>
					
					<p><?php bloginfo('description'); ?></p>
				
				</div>
			</div>
			<?php
				}
			?>
			
			<div id="content" class="clearfix row">
           <?php   if($sh_high) eo_get_template_part( 'inc/highlights' ); ?>
           <?php   if($sh_feat) eo_get_template_part( 'inc/featurettes' ); ?>
           <?php  //get_template_part( $eo_theme . 'inc/carousel' ); ?>

			
				<div id="main" class="col-sm-8 clearfix" role="main">

					<?php if (have_posts()) : while (have_posts()) : the_post(); ?>
						<?php get_template_part( 'content', get_post_format() ); ?>					
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
			
				</div> <!-- end #main -->
    
				<?php get_sidebar(); // sidebar 1 ?>
    
			</div> <!-- end #content -->

<?php get_footer(); ?>