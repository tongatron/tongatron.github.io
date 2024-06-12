<?php
/*
The comments page for Bones
*/

// Do not delete these lines
$current_user = wp_get_current_user();

  if (!empty($_SERVER['SCRIPT_FILENAME']) && 'comments.php' == basename($_SERVER['SCRIPT_FILENAME']))
    die ('Please do not load this page directly. Thanks!');

  if ( post_password_required() ) { ?>
  	<div class="alert alert-info"><?php _e("This post is password protected. Enter the password to view comments.", "bonestheme"); ?></div>
  <?php
    return;
  }
?>

<!-- You can start editing here. -->

<?php if ( have_comments() ) : ?>
	<?php if ( ! empty($comments_by_type['comment']) ) : ?>
  <div id="all_comments">
	<h3 id="comments"><?php comments_number('<span>' . __("No", "bonestheme") . '</span> ' . __("Responses", "bonestheme") . '', '<span>' . __("One", "bonestheme") . '</span> ' . __("Response", "bonestheme") . '', '<span>%</span> ' . __("Responses", "bonestheme") );?> <?php _e("to", "bonestheme"); ?> &#8220;<?php the_title(); ?>&#8221;</h3>

	<nav id="comment-nav">
		<ul class="clearfix">
	  		<li><?php previous_comments_link( __("Older comments", "bonestheme") ) ?></li>
	  		<li><?php next_comments_link( __("Newer comments", "bonestheme") ) ?></li>
	 	</ul>
	</nav>
	
	<ul class="commentlist">
		<?php wp_list_comments('type=comment&callback=bones_comments'); ?>
	</ul>
	<?php endif; ?>
	
	<?php if ( ! empty($comments_by_type['pings']) ) : ?>
		<h3 id="pings">Trackbacks/Pingbacks</h3>
		
		<ol class="pinglist">
			<?php wp_list_comments('type=pings&callback=list_pings'); ?>
		</ol>
	<?php endif; ?>
	
	<nav id="comment-nav">
		<ul class="clearfix">
	  		<li><?php previous_comments_link( __("Older comments", "bonestheme") ) ?></li>
	  		<li><?php next_comments_link( __("Newer comments", "bonestheme") ) ?></li>
		</ul>
	</nav>
  </div><!-- #all_comments -->	

	<?php else : // this is displayed if there are no comments so far ?>

	<?php if ( comments_open() ) : ?>
    	<!-- If comments are open, but there are no comments. -->

	<?php else : // comments are closed 
	?>
	
	<?php
		$suppress_comments_message = of_get_option('suppress_comments_message');

		if ($suppress_comments_message) :
	?>
			
		<?php else : ?>
		
			<!-- If comments are closed. -->
			<p class="alert alert-info"><?php _e("Comments are closed", "bonestheme"); ?>.</p>
			
		<?php endif; ?>

	<?php endif; ?>

<?php endif; ?>


<?php if ( comments_open() ) {
	$commenter = wp_get_current_commenter();
	$req = get_option( 'require_name_email' );
	$aria_req = ( $req ? " aria-required='true'" : '' );
	
	$comm_args = array(
	  'id_form'           => 'commentform',
	  'id_submit'         => 'defsubmit',
	  'title_reply'       => __( 'Leave a Reply' ),
	  'title_reply_to'    => __( 'Leave a Reply to %s' ),
	  'cancel_reply_link' => __( 'Cancel Reply' ),
	  'label_submit'      => __( 'Post Comment' ),
	
	  'must_log_in' => '<p class="must-log-in">' .
		sprintf(
		  __( 'You must be <a href="%s">logged in</a> to post a comment.' ),
		  wp_login_url( apply_filters( 'the_permalink', get_permalink() ) )
		) . '</p>',
	
	  'logged_in_as' => '<p class="logged-in-as">' .
		sprintf(
		__( 'Logged in as <a href="%1$s">%2$s</a>. <a href="%3$s" title="Log out of this account">Log out?</a>' ),
		  admin_url( 'profile.php' ),
		  $user_identity,
		  wp_logout_url( apply_filters( 'the_permalink', get_permalink( ) ) )
		) . '</p>',
	
	  'comment_notes_before' => '<div class="col-sm-6 col-lg-5">',
	  
	  /*'<p class="comment-notes">' .
		__( 'Your email address will not be published.' ) . ( $req ? __( 'Required' ) : '' ) .
		'</p>',*/
	
	  'fields' => apply_filters( 'comment_form_default_fields', array(
	
		'author' =>
		  '<div class="form-group">' .
		  '<label for="author">' . __( 'Name', 'domainreference' ) . ( $req ? '<span class="required"><abbr title="'.  __( 'Required' )  .'"> *</abbr></span>' : '' ) . '</label> ' .
		  '<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-user"></i></span>' .
		  '<input id="author" name="author" class="form-control" type="text" value="' . esc_attr( $commenter['comment_author'] ) .
		  '" size="30" placeholder="'. __("Your Name", "eotheme") .'" tabindex="1"' . $aria_req . ' /></div></div>',
	
		'email' =>
		  '<div class="form-group">' .
		  '<label for="email">' . __( 'Email', 'domainreference' ) . ( $req ? '<span class="required"><abbr title="'.  __( 'Required' )  .'"> *</abbr></span>' : '' ) . '</label> ' .
		  '<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-envelope"></i></span>' .
		  '<input id="email" name="email" class="form-control" type="text" value="' . esc_attr(  $commenter['comment_author_email'] ) .
		  '" size="30" placeholder="'.__("Your Email", "eotheme") .'"  tabindex="2"' . $aria_req . ' />' .
		'</div><p class="comment-notes"><small>' . __( 'Your email address will not be published.' ) .  '</small></p></div>',
	
		'url' =>
		  '<div class="form-group"><label for="url">' .
		  __( 'Website', 'domainreference' ) . '</label>' .
		  '<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-home"></i></span>
			<input id="url" name="url" class="form-control" type="text" value="' . esc_attr( $commenter['comment_author_url'] ) .
		  '" size="30" placeholder="'. __("Your Website", "eotheme") .'" tabindex="3" /></div>
		  	</div>'
		)
	  ), 	
	  'comment_field' => ( ! is_user_logged_in() ? '</div><!-- closing div for comm fields -->' : '' ) .
	  '<div class="col-sm-6 col-lg-7"><p class="comment-form-comment"><label for="comment" style="display:block">' . _x( 'Comment', 'noun' ) .
		'</label><textarea id="comment" name="comment" style="width:100%" rows="8" placeholder="'. __("Your Comment...", "eotheme") .'" tabindex="4"' . $aria_req . '>' .
		'</textarea></p>
		<input class="btn btn-primary" name="comm_submit" type="submit" id="comm_submit" tabindex="5" value="'. __("Submit Comment", "eotheme") . '" />',
	  'comment_notes_after' => '</div><!-- closing tag for open wrapper div of textarea and submit -->',
	);	
	comment_form($comm_args); 
}?>