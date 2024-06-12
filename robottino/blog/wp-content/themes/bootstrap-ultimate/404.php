<?php global $eo_options;
get_header();
?>
<div class="container" id="maincnot">
	<div id="content" class="clearfix">
		<?php if($eo_options["main_layout"] == "left-sidebar"  )	get_sidebar(); // sidebar main	?>
        <?php ($eo_options["main_layout"]=="full") ? $main_cols = 'col-sm-12' : $main_cols = eo_get_cols('main','',false) ?>
		<div id="main" class="<?php echo $main_cols ?>" role="main">
					<article id="post-not-found" class="clearfix">
						
						<header>

							<div class="jumbotron">
							
								<h1><?php _e("Epic 404 - Article Not Found", "bonestheme"); ?></h1>
								<p><?php _e("This is embarassing. We can't find what you were looking for.", "bonestheme"); ?></p>
															
							</div>
													
						</header> <!-- end article header -->
					
						<section class="post_content">
							
							<p><?php _e("Whatever you were looking for was not found, but maybe try looking again or search using the form below.", "bonestheme"); ?></p>

							<div class="row">
								<div class="col-sm-12">
									<?php get_search_form(); ?>
								</div>
							</div>
					
						</section> <!-- end article section -->
						
						<footer>
							
						</footer> <!-- end article footer -->
					
					</article> <!-- end article -->
			
				</div> <!-- end #main -->
			<?php if($eo_options["main_layout"] == "right-sidebar"  )	get_sidebar(); // sidebar main	?>
        </div> <!-- end #content -->
	</div><!-- maincnot -->
<?php get_footer(); ?>