<div id="sidebar1" class="<?php eo_get_cols('side',' fluid-sidebar sidebar') ?>" role="complementary">
    <?php if ( is_active_sidebar( 'sidebar1' ) ) : ?>
        <?php dynamic_sidebar( 'sidebar1' ); ?>
    <?php else : ?>
        <!-- This content shows up if there are no widgets defined in the backend. --> 
        <div class="alert alert-info">
            <p><?php _e("Please activate some Widgets", "bonestheme"); ?>.</p>    
        </div>
    <?php endif; ?>
</div>