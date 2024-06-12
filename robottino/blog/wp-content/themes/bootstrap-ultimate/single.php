<?php global $eo_options;
get_header();
$cust_layout = get_post_meta($post->ID,'_eo_cust_post_layout',true);
$customimg = get_post_meta($post->ID,"_eo_cust_post_feat_img",true);
?>
<div class="container" id="maincnot">
	<div id="content" class="clearfix">
		<?php if($cust_layout && $cust_layout == "left-sidebar"  || !$cust_layout && $eo_options["main_layout"] == "left-sidebar" || $cust_layout == "default"  && $eo_options["main_layout"] == "left-sidebar" )	get_sidebar(); // sidebar main	?>
        <?php ($cust_layout && $cust_layout == "full" || !$cust_layout && $eo_options["main_layout"]=="full") ? $main_cols = 'col-sm-12' : $main_cols = eo_get_cols('main','',false) ?>
		<div id="main" class="<?php echo $main_cols ?>" role="main">
					<?php if (have_posts()) : while (have_posts()) : the_post(); ?>	
					  <?php get_template_part( 'content-single', get_post_format() ); ?>		
					<?php comments_template('',true); ?>
					<?php endwhile; ?>			
					
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
			<?php if($cust_layout && $cust_layout == "right-sidebar"  || !$cust_layout  && $eo_options["main_layout"] == "right-sidebar" || $cust_layout == "default"  && $eo_options["main_layout"] == "right-sidebar" )	get_sidebar(); // sidebar main	?>
        </div> <!-- end #content -->
	</div><!-- maincnot -->
<?php get_footer(); ?>