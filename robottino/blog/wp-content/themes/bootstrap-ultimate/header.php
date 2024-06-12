<?php
if ( ! defined( 'ABSPATH' ) ) exit;

global $eo_options,$wpdb,$th_xs_slug;

?><!DOCTYPE html> 
<!--[if IEMobile 7 ]> <html <?php language_attributes(); ?>class="no-js iem7"> <![endif]-->
<!--[if lt IE 7 ]> <html <?php language_attributes(); ?> class="no-js ie6"> <![endif]-->
<!--[if IE 7 ]>    <html <?php language_attributes(); ?> class="no-js ie7"> <![endif]-->
<!--[if IE 8 ]>    <html <?php language_attributes(); ?> class="no-js ie8"> <![endif]-->
<!--[if (gte IE 9)|(gt IEMobile 7)|!(IEMobile)|!(IE)]><!--><html <?php language_attributes(); ?> class="no-js"><!--<![endif]-->
	<head>
		<meta charset="utf-8">
		<title><?php wp_title( '|', true, 'right' ); ?></title>
				
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
               <?php if( ! empty ($eo_options["favicon_url"]) ) { ?>
       			<link rel="shortcut icon" href="<?php echo $eo_options["favicon_url"]; ?>">
				<?php } ?>
		<!-- media-queries.js (fallback) -->
		<!--[if lt IE 9]>
			<script src="http://css3-mediaqueries-js.googlecode.com/svn/trunk/css3-mediaqueries.js"></script>			
		<![endif]-->

		<!-- html5.js -->
		<!--[if lt IE 9]>
			<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
			<script src="library/js/respond.min.js"></script>
		<![endif]-->
		
  		<link rel="pingback" href="<?php bloginfo('pingback_url'); ?>">
        <?php if($eo_options["use_placeholder"] == "1") { ?>
		<script type='text/javascript' src='<?php echo get_template_directory_uri()?>/rsc/js/holder.js'></script>
        <?php } ?>
		<?php if ( is_singular() ) wp_enqueue_script( 'comment-reply' ); ?>

		<!-- theme options from options panel -->
       <?php if ( $eo_options['use_bsw_themes'] == "1" && $eo_options['bsw_theme'] != "default"  && $eo_options['bsw_theme_sup'] == "1" ) { 
	    $gl_u = get_template_directory_uri().'/lib/bootstrap/fonts/';
		?>
       <?php
	      echo '<style>@font-face {
		  font-family: "Glyphicons Halflings";
		  src: url("'.$gl_u.'glyphicons-halflings-regular.eot");
		  src: url("'.$gl_u.'glyphicons-halflings-regular.eot?#iefix") format("embedded-opentype"), url("'.$gl_u.'glyphicons-halflings-regular.woff") format("woff"), url("'.$gl_u.'glyphicons-halflings-regular.ttf") format("truetype"), url("'.$gl_u.'glyphicons-halflings-regular.svg#glyphicons-halflingsregular") format("svg");
		}
	   </style>';
	    } ?>
		<?php  if ( is_singular() ) eo_inline_css_per_post(); ?>

		<?php if ( $eo_options['eo_typo_body'] && array_key_exists("source",$eo_options['eo_typo_body']) && $eo_options['eo_typo_body']["source"] == "gwf_font") { ?>
		<link href='http://fonts.googleapis.com/css?family=<?php echo $eo_options['eo_typo_body']["face"] ?>:<?php echo $eo_options['eo_typo_body']["variant"] ?>' rel='stylesheet' type='text/css'>
        <?php } ?>
		<?php if ( $eo_options['eo_typo_heading'] && array_key_exists("source",$eo_options['eo_typo_heading']) && $eo_options['eo_typo_heading']["source"] == "gwf_font") { ?>
		<link href='http://fonts.googleapis.com/css?family=<?php echo $eo_options['eo_typo_heading']["face"] ?>:<?php echo $eo_options['eo_typo_heading']["variant"] ?>' rel='stylesheet' type='text/css'>
        <?php } ?>
        <?php if ( $eo_options['eo_typo_nav'] && array_key_exists("source",$eo_options['eo_typo_nav']) && $eo_options['eo_typo_nav']["source"] == "gwf_font") { ?>
		<link href='http://fonts.googleapis.com/css?family=<?php echo $eo_options['eo_typo_nav']["face"] ?>:<?php echo $eo_options['eo_typo_nav']["variant"] ?>' rel='stylesheet' type='text/css'>
        <?php }
		// _eo-todo: compact the typography csses ? ?>
        <?php wp_head(); ?>
	</head>
	<body <?php ( of_get_option('nav_position')  == "fixed" ) ? body_class('fixednav') : body_class(); ?>>
	<div id="wrap"<?php if ( $eo_options['sticky_footer']  == "1" ) echo ' class="stickyf"' ?>>			
		<header role="banner">
			<div id="inner-header" class="clearfix">			
				<div class="navbar navbar-<?php echo of_get_option('nav_pref') ?><?php if ( of_get_option('nav_position')  == "fixed" ) echo " navbar-fixed-top" ?>">
					<div class="container" id="navbarcont">
						<?php
							$blogn = get_option('blogname');
							if ( of_get_option('trim_site_title')  == "1" ){
							$blogname = (strlen($blogn) > 18) ? substr($blogn,0,16).'..' : $blogn;

							}
							else {
								$blogname = $blogn;
							}
                         ?>
                         <?php ( $eo_options['nav_select_menu'] == "1" ) ? $nav_select_hide = ' hidden-xs hidden-sm' : $nav_select_hide = ''; ?>

						<div class="nav-container row">
                                <?php ( $eo_options['nav_select_menu'] == "1" ) ? $nh_col_cl = 'col-sm-5 col-md-3 col-lg-2' : $nh_col_cl = 'col-sm-3 col-lg-2'; ?>
								<div class="navbar-header <?php echo $nh_col_cl ?>">
                                    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"<?php if( $eo_options['nav_select_menu'] == "1" ) echo ' style="display:none"'; ?>>
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                        <span class="icon-bar"></span>
                                    </button>
                                    <a class="navbar-brand logo <?php if(of_get_option('branding_logo','')!='') echo 'logo_img' ?>" id="logo_lg" title="<?php echo get_bloginfo('description'); ?>" href="<?php echo home_url(); ?>">
                                        <?php if(of_get_option('branding_logo','')!='') { ?>
                                            <img src="<?php echo of_get_option('branding_logo'); ?>" class="img-responsive"  alt="<?php echo get_bloginfo('description'); ?>">
                                            <?php }
											else {
                                            	if(of_get_option('site_name','1')) echo $blogname;
											} ?></a>
 										<?php // var_dump(bloginfo('name')); ?>
								</div><!-- end .navbar-header -->
                               <?php ( $eo_options['nav_select_menu'] == "1" ) ? $tw_col_cl = 'col-sm-7 col-md-7 col-lg-8' : $tw_col_cl = 'col-sm-9 col-md-7 col-lg-8'; ?>
                                <div class="<?php echo $tw_col_cl ?>" id="topmenuwrap">
										<nav role="navigation">
                                		<?php ( $eo_options['nav_select_menu'] == "1" ) ? $collapse = '' : $collapse = ' collapse'; ?>
                                            <div class="navbar-collapse<?php echo $collapse . $nav_select_hide ?>">
                                            <?php if( $eo_options['custom_nav_markup'] == "1" ) {
                                                eo_main_nav(); // Adjust using Menus in Wordpress Admin 
                                            } else {
                                                wp_nav_menu();
                                            }?>
                                            </div>
										</nav>		
                                        <?php if( $eo_options['nav_select_menu'] == "1" ) eo_mobile_nav_menu(); ?>				
                                </div><!-- end #topmenuwrap -->
									<?php if(of_get_option('search_bar', '1')) {?>
                                    <div class="searchwrap searchf_mlg col-sm-12 col-md-2">
                                        <form class="navbar-form navbar-right form-inline" role="search" method="get" id="searchformtop" action="<?php echo home_url( '/' ); ?>">
                                            <div class="input-group clearfix">
                                                <input name="s" id="search_lg" style="min-width: 4em;" type="text" class="search-query form-control pull-right s_exp" autocomplete="off" placeholder="<?php _e('Search','bonestheme'); ?>">
                                                <div class="input-group-btn">
                                                   <button class="btn btn-info">
                                                   <span class="glyphicon glyphicon-search"></span>
                                                   </button>
												</div>
                                            </div>
                                        </form>
                                    </div><!-- end .searchwrap -->
                                    <?php } ?>	
						</div><!-- nav-container row -->
					</div> <!-- end .#navbarcont.container -->
                         <?php if( $eo_options['nav_select_menu'] == "1" ) {
							//				eo_mobile_nav_menu(); // Adjust using Menus in Wordpress Admin 
										}/* else {
											wp_nav_menu();
										}*/?>
                          <!--   <div class="clearfix visible-xs visible-sm"></div> -->
				</div> <!-- end .navbar -->	
			</div> <!-- end #inner-header -->
		</header> <!-- end header -->