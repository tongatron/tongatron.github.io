<div class="optionsframework-submit clearfix panel panel-default"> 
	<?php (isset($_GET['settings-updated'])) ? $save_btn_class = "saved" : $save_btn_class = "disk"; ?>
    <button type="submit" name="update" class="btn btn-primary btn-xs save">
    	<span class="glyphicon glyphicon-floppy-<?php echo $save_btn_class ?>"></span> <?php esc_attr_e( 'Save Options', 'options_framework_theme' ); ?>
    </button>
    <button type="submit" name="reset" class="reset-button btn btn-warning btn-xs" onclick="return confirm( '<?php print esc_js( __( 'Click OK to reset. Any theme settings will be lost!', 'options_framework_theme' ) ); ?>' );"> <span class="glyphicon glyphicon-refresh" ></span> <?php esc_attr_e( 'Restore Defaults', 'options_framework_theme' ); ?></button>
</div>