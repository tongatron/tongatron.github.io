<form action="<?php echo home_url( '/' ); ?>" method="get" class="form-stacked form-inline">
    <fieldset>
		<div class="clearfix">
			<div class="input-append input-prepend">
				<span class="add-on"><i class="glyphicon glyphicon-search"></i></span><input type="text" name="s" id="search" class="form-control" placeholder="<?php _e("Search", "bonestheme"); ?>" value="<?php the_search_query(); ?>" /><button type="submit" class="btn btn-primary"><?php _e("Search", "bonestheme"); ?></button>
			</div>
        </div>
    </fieldset>
</form>