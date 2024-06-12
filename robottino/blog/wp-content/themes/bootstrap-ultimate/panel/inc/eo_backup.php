<?php
$optsave_nonce = wp_create_nonce("eo_optsave_nonce");
	// Extend this func to delete certain things, instead of everything
	$def_optsave_link_html = '<input id="save_opts" type="submit" name="submit" value="Backup NOW" class="btn btn-success btn-sm eo_fleft nojssub" /><label for="save_opts"><span class="glyphicon glyphicon-floppy-save nojssub"></span></label>';

	$optsave_link = admin_url('admin-ajax.php?action=eo_backup_settings&nonce='.$optsave_nonce);
	$optsave_link_html  = '<a style="display: none;" id="asave_opts" data-nonce="' . $optsave_nonce . '" data-sure_text="All unsaved change will be lost. Backup current options & settings ?" href="' . $optsave_link . '" class="eo_usure subbut eo_save_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$optsave_link_html .= 'btn btn-success btn-sm eo_fleft';
	}
	else {
		$optsave_link_html .= 'button button-secondary';
	}
	$optsave_link_html .= '"><span class="glyphicon glyphicon-floppy-save"></span> Backup NOW</a><div class="explain">Unsaved changes will be lost, so you are recommended to save options before backing up.<br /> Your backups will be saved as <code>DayMonthYear_Hour-Min{_optionalname}</code></div>';
	
$optrestore_nonce = wp_create_nonce("eo_optrestore_nonce");
	// Extend this func to delete certain things, instead of everything
	$def_optrestore_link = '<input id="restore_opts" type="submit" name="submit" value="Load Selected Options" class="btn btn-success btn-sm eo_fleft nojssub" /><label for="save_opts"><span class="glyphicon glyphicon-floppy-open nojssub"></span></label>';

	$optrestore_link = admin_url('admin-ajax.php?action=eo_restore_settings&nonce='.$optrestore_nonce);
	$optrestore_link_html  = '<a style="display: none;" id="arestore_opts" data-nonce="' . $optrestore_nonce . '" data-sure_text="Current settings will be overwritten. Load selected settings ?" href="' . $optrestore_link . '" class="eo_usure subbut eo_restore_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$optrestore_link_html .= 'btn btn-primary btn-sm eo_fleft';
	}
	else {
		$optrestore_link_html .= 'button button-primary';
	}
	$optrestore_link_html .= '"><span class="glyphicon glyphicon-floppy-open"></span> Load selected options</a><div class="explain">Unsaved changes will be lost, so you are recommended to save options before backing up. </div>';
	
	$delbackups_nonce = wp_create_nonce("eo_delbackups_nonce");
	// Extend this func to delete certain things, instead of everything
	$def_optrestore_link = '<input id="restore_opts" type="submit" name="submit" value="Load Selected Options" class="btn btn-success btn-sm eo_fleft nojssub" /><label for="save_opts"><span class="glyphicon glyphicon-floppy-open nojssub"></span></label>';

	$backdel_link = admin_url('admin-ajax.php?action=eo_del_backups&nonce='.$delbackups_nonce);
	$backdel_link_html  = '<a id="delbackups" data-nonce="' . $delbackups_nonce . '" data-sure_text="All backups will be deleted" href="' . $backdel_link . '" class="eo_usure eo_restore_op ';
	if ( eo_get_options("load_bs_adm") == 1 ) {
		$backdel_link_html .= 'btn btn-danger btn-sm eo_fleft';
	}
	else {
		$backdel_link_html .= 'button button-primary';
	}
	$backdel_link_html .= '"><span class="glyphicon glyphicon-trash"></span> x Delete ALL Backups</a><div class="explain">All previously stored backups will be deleted. </div>';
	
?>

<div id="backup_restore_grp" style="margin-top:1em;" class="panel-group panel">
	<!-- start group output -->
	<div class="panel panel-primary">
		<div class="panel-heading">
		  <h4 class="panel-title">
			<a href="#backup_restore_opts" data-parent="#backup_restore_grp" data-toggle="collapse" class="accordion-toggle">
			<span class="glyphicon glyphicon-collapse-up"></span><span class="glyphicon glyphicon-collapse-down"></span>Backup & Restore Settings <span class="glyphicon glyphicon-floppy-disk"></span>
			</a>
		  </h4>
		</div>
		<div class="panel-collapse collapse" id="backup_restore_opts" style="height: auto;">
			<div class="panel-body row">
				<div class="section section-free_html col-sm-4" id="eo_save_all_opt">
					<form id="backup_settings" method="post" name="backup_settings" class="form-inline" action="<?php echo admin_url('admin-ajax.php'); ?>">
                        <input type="hidden" name="action" value="eo_backup_settings" />
                        <input type="hidden" name="nonce" value="<?php echo $optsave_nonce ?>" />
                        <h4 class="heading">Backup Settings</h4>
                         </label><input type="text" name="backup_name" id="backup_name" maxlength="12" placeholder="optional..name, max 12 chars" />
                                                  <hr />

                            <label for="backup_exp">Keep for:</label>
                         <select name="backup_exp" id="backup_exp">
                         	<option value="aday">a Day</option>
                         	<option value="aweek" selected="selected">a Week</option>
                         	<option value="amonth">a Month</option>
                         	<option value="perm">Permanently</option>
                         </select>
                         <hr class="clearfix" />
                        <?php echo $def_optsave_link_html . $optsave_link_html; ?>
                    </form>
				</div>
                
				<div class="section section-free_html col-sm-5" id="eo_restore_opt">
					<form id="restore_settings" method="post" class="form-inline" name="restore_settings" action="<?php echo admin_url('admin-ajax.php'); ?>">
                        <input type="hidden" name="action" value="eo_restore_settings" />
                        <input type="hidden" name="nonce" value="<?php echo $optrestore_nonce ?>" />
                        <h4 class="heading">Restore Settings</h4>
                         <label for="restore_name">Load:</label>
                         <select name="restore_name" id="restore_name">
                         <?php  $tr_bups_arr = eo_gen_backup_list(false,true); 
                            foreach ($tr_bups_arr as $bup) {
								$optv = str_replace("_transient_","",$bup);
                                $thename = str_replace(array("_transient_","eo_bc_bsul_","_bcn"),array("","",""),$bup);
                                echo '<option value="'.$optv.'">'.$thename.'</option>';
                            }
                         ?></select>
                        <?php echo $def_optrestore_link . $optrestore_link_html; ?>
					</form>
				</div>
                <div class="section section-free_html col-sm-3" id="eo_restore_opt">
                      <?php echo $backdel_link_html; ?>
				</div>
			</div>
            	<div class="alert alert-info">
                <h4><span class="glyphicon glyphicon-info-sign"></span>You can use backups as <b>templates</b></h4>
                <p>Basically after you configure your theme options & sub-theme & colors etc. when you save it you can consider it as a template.</p>
                </div>
		</div>
	</div><!-- end group output -->
</div>
<script type="text/javascript">
	jQuery(document).ready(function($) {
		$(".nojssub").css("display","none");

		$("input.nojssub").each(function(index, element) {
             $("a#a"+this.id).css("display","block");
			 $(this).remove();
        });
	});
</script>