<?php 
global $eo_options;
// Move footer outside #wrap if sticky footer is enabled
if( $eo_options["sticky_footer"] == "1" ) echo "</div></div>";
?>

                <footer role="contentinfo" id="footer">
                
                    <div id="inner-footer" class="container">
                      <hr />
                      <div id="widget-footer" class="clearfix row">
                        <?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('footer1') ) : ?>
                        <?php endif; ?>
                        <?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('footer2') ) : ?>
                        <?php endif; ?>
                        <?php if ( !function_exists('dynamic_sidebar') || !dynamic_sidebar('footer3') ) : ?>
                        <?php endif; ?>
                      </div>
                        
                        <nav class="clearfix">
                            <?php bones_footer_links(); // Adjust using Menus in Wordpress Admin ?>
                        </nav>
                        
                        <p class="pull-right<?php if ($eo_options["foot_linkback"]) echo ' authl'?>" id="copyright_foot">
                        <?php  if ($eo_options["foot_copy_right"]) 	echo $eo_options["foot_copy_right"];
						if ($eo_options["foot_linkback"]) {
						?>
                        
                        <a href="http://eodepo.com/bootstrap-ultimate" title="Bootstrap 3 theme for Wordpress" target="_blank"> Bootstrap UL</a>
                        </p><?php } // foot_linkback?>
                
                        <p class="attribution">&copy; 
						<?php if ($eo_options["foot_copy_left"]) {
							echo $eo_options["foot_copy_left"];
						} else {
						 bloginfo('name');
						}
						 ?>
                        </p>
                        
                    
                    </div> <!-- end #inner-footer -->
                    
                </footer> <!-- end footer -->
            
			<?php if(  $eo_options["sticky_footer"] != "1" ) { ?>  </div> <!-- end #maincnot .container --><?php  } ?> 
                    
            <!--[if lt IE 7 ]>
                <script src="//ajax.googleapis.com/ajax/libs/chrome-frame/1.0.3/CFInstall.min.js"></script>
                <script>window.attachEvent('onload',function(){CFInstall.check({mode:'overlay'})})</script>
            <![endif]-->
       <?php wp_footer(); // js scripts are inserted using this function ?>
	</body>
</html>