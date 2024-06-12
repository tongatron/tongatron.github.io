<?php
//var_dump($is_theme_opt_page);
function eo_load_panel_jses() {
// _eo-todo: move all the admin js stuff here, and include this only in admin.
wp_enqueue_script( 'jquery-cookie', get_template_directory_uri() . '/panel/rsc/js/jquery.cookie.js', array( 'jquery' ), '1.0', true );
}
if($is_theme_opt_page) {
	add_action('admin_footer', 'eo_load_panel_jses');
	add_action('admin_footer', 'eo_admin_foot_print_jses',9999);
}
function eo_admin_foot_print_jses() {
	// _eo-todo: move all the inline admin js stuff here.
	?>
	<script type="text/javascript" >
	jQuery(document).ready(function($) {
		$("a.subbut").click(function(e) {
			e.preventDefault();
           $(this).closest('form').submit();
        });

		var lctab_cook = $.cookie('eop_lctab');
		if (lctab_cook) {
			$("#topnavwrap ul.nav-tabs li").removeClass("active");
			$("#topnavwrap ul.nav-tabs li a").removeClass("nav-tab-active");
			$("#topnavwrap ul.nav-tabs li a#"+lctab_cook).addClass("nav-tab-active");
			$("#topnavwrap ul.nav-tabs li a#"+lctab_cook).parent().addClass("active");
			$("div.opt-group").hide();
			$("div#"+lctab_cook.replace("-tab", "")).fadeIn();
		}
		$("#topnavwrap ul.nav-tabs li a").click(function(e) {
			//options-group-2-tab
	//		alert( $(this).attr("id"));
            $.cookie("eop_lctab", $(this).attr("id") );
        });
		<?php if(of_get_option( 'load_chosen_adm' ) == "1" ) {  ?>
		$(".nochosen select").chosen('destroy');
		<?php } ?>

		$(".colsel select").each(function() {
            var thecolsel = $(this);
			var thizid =  $(this).attr("id");
			$('<a id="' + thizid + '-innherit" class="innherit btn btn-xs btn-info" href="javascript:void(0)"><abbr title="Will inherit from previous width if not specified"><span class="glyphicon glyphicon-info-sign"></span></abbr>inherit</a>').insertBefore(this);
			
		//						console.log("thiss-" + thizid);

			
	//		alert(connectto);
			
	//		alert(conslider);
	
		/*	if($(this).attr("id").indexOf('xs') !== -1 ) {
				var maks = 12;
			}
			else {
				var maks = 13;
			}*/
			
			var maks = $('#'+ $(this).attr("id")+' option').size() - 2;	
	
			var theslider = $( '<div id="' + thizid + '-slider"></div>' ).insertAfter(this).slider({
				animate: true,
				range: "min",
				value: $(this).val(),
			  min: 0,
			  max: maks,
			  slide: function( event, ui ) {
				 var thesliderid = $(this).attr("id");
				 var theselid = $(this).attr("id").replace("-slider", "");
				// console.log("activeid#" + thesliderid);

				if(theselid.indexOf('side') !== -1 ) {
					var connectto = theselid.replace("side", "main");
					var conslider = "#" + connectto + "-slider";
				//	console.log("sideconvert-" + connectto);
				
				}
				else if(theselid.indexOf('main') !== -1 ) {
					var connectto = theselid.replace("main", "side");
					var conslider = "#" + connectto + "-slider";
				//	console.log("mainconvert-" + connectto);
				
				}
				var thecolsel = $("select#" + $(this).attr("id").replace("-slider", "") );
				  	  
				//  			console.log("thisid-" + this.id);
				thecolsel[ 0 ].selectedIndex = ui.value;
				var chngval = 12 - ui.value;
				var chngindx = $("#" + connectto + ' option[value="'+chngval+'"]').index();
			//	 if(parseInt(ui.value) > -1) {

					
			//		console.log(this.id);
			//		console.log('#' + this.id + ' option');
					$('#' + thizid + ' option').removeAttr('selected');
					$('#' + thizid + ' option[value="'+ ui.value +'"]').attr('selected', 'selected');
					
					if(parseInt($("#" + connectto).val()) != -1 ) {
						$('#' + connectto + ' option').removeAttr('selected');
						$('#' + connectto + ' option[value="'+ chngval +'"]').attr('selected', 'selected');
						$(conslider).slider( "value", chngval );
					}
		//		}
		//		$('#' + connectto + ' option').removeAttr('selected');
			//	console.log(thecolsel[ 0 ].selectedIndex,ui.value,chngval,chngindx,maks);

					if(parseInt($("#" + theselid).val()) != -1 && $(this).is(":hidden") ) {
						$(this).toggle();
					}
			  },
			   change: function( event, ui ) {
				//  var theselid = $(this).attr("id").replace("-slider", "");
		//		  alert($(this).attr("id"));
		//		  alert(thizid);
			//	  alert(selval);
				//	console.log("theseltext" + $("select#" + theselid + " option:selected").text());
				//	console.log("theselid#" + theselid);
				//	console.log("selvall" + $("#" + $(this.prev("select").attr("id") + " option:selected").text());
				//	if($("select#" + theselid + " option:selected").text().indexOf('inherit') !== -1 ) {
				//		console.log("tofadeout" +  $(this).attr("id"));
				//		$("select#" + theselid).fadeOut();
				//	}
			   }
			});
		//	console.log(theslider);
			$(this).change(function() {
 				var theselid = $(this).attr("id");
				  
				if(theselid.indexOf('side') !== -1 ) {
					var connectto = theselid.replace("side", "main");
					var conslider = "#" + connectto + "-slider";
				//	console.log("sideconvert-" + connectto);
				
				}
				else if(theselid.indexOf('main') !== -1 ) {
					var connectto = theselid.replace("main", "side");
					var conslider = "#" + connectto + "-slider";
				//	console.log("mainconvert-" + connectto);
				
				}
				
				if(parseInt($(this).val()) == -1 ) {
					$('#' + this.id + '-slider').fadeOut();
				}
				else if($('#' + this.id + '-slider').is(":hidden") ) {
					$('#' + this.id + '-slider').fadeIn();
				}
				
		//		  console.log(theslider, $(this).val(),this.selectedIndex);

			  theslider.slider( "value", $(this).val() );

			  if(parseInt($(this).val()) > -1) {
				  var conval = 12 - $(this).val();
				 var thizval =  $(this).val()
		//		  console.log(thizval);

			//	  alert( conval );
				if(parseInt($("#" + connectto).val()) != -1 ) {
					  $('#' + connectto + ' option').removeAttr('selected');
					  $('#' + connectto + ' option[value="' + conval + '"]').attr('selected', 'selected');
					  $(conslider).slider( "value", conval );
				}
				  
				  $('#' + thizid + ' option').removeAttr('selected');
				  $('#' + thizid + ' option[value="'+thizval+'"]').attr('selected', 'selected');
				  
/*				  if(parseInt($(this).val()) == 0 && thizid.indexOf('xs') == -1) {
					$(theslider).fadeOut();
			  		}*/
				  

			  }
			//  console.log(conslider);
			});
        }); // end layout sliders
		$("a.innherit").click(function(e) {
		//	alert("111");
		//	console.log('select#' + this.id.replace('-innherit','') );
            $('select#' + this.id.replace('-innherit','') + ' option').removeAttr('selected');
            $('select#' + this.id.replace('-innherit','') + ' option[value="-1"]').attr('selected', 'selected');
            $('#' + this.id.replace('-innherit','-slider')).fadeOut();
        });
		$("div#section-main_bg_img img:not([src*='none.jpg'])").click(function(e) {
            $("body").css("background-image","url(" + $(this).attr("src") + ")" );
        });
		$("div#section-main_bg_img img[src*='none.jpg']").click(function(e) {
            $("body").css("background-image","none" );
        });
	});
	</script>
<?php
}

// - - FONT FUNCTIONS  - - 

function eo_default_font_faces() {
			$def_os_fontz = array(
			'Helvetica Neue, Helvetica, Arial, sans-serif'=> 'Helvetica-Arial',
			// Bah ! Who'd use that anyway ? 'Arial Black, Gadget, sans-serif' => 'Arial Black'
			// NO!.. just no! 'Comic Sans MS, Comic Sans MS, cursive'
			'Courier New, Courier New, monospace' => 'Courier New',
			'Georgia, Georgia, serif' => 'Georgia',
			// Not sure why would anyone want this one, but maybe for headings...
			'Impact, Impact, Charcoal, sans-serif' => 'Impact',
			'Lucida Console, Monaco, monospace' => 'Lucida Console',
			'Lucida Grande, Lucida Sans Unicode, sans-serif' => 'Lucida Grande',
			'Palatino Linotype, Book Antiqua, Palatino, serif' => 'Palatino',
			'Tahoma, Geneva, sans-serif' => 'Tahom-Geneva',
			'Times New Roman, Times New Roman, Times, serif' => 'Times New Roman',
			'Trebuchet, Trebuchet MS, sans-serif' => 'Trebuchet',
			'Verdana, Verdana, Geneva, sans-serif' => 'Verdana-Geneva',
			'MS Sans Serif, Geneva, sans-serif' => 'Ms Serif-Geneva',
			'MS Serif, New York, serif' => 'Serif'
			);
	return $def_os_fontz;
}


function eo_combined_font_faces() {
	$eo_fnts_prep = get_option ( 'eo_all_fonts_arr' );
	$comb_faces_trans = get_transient( 'eo_comb_faces_trans');
	if($comb_faces_trans) {
	//	delete_transient( 'eo_comb_faces_trans');
		$merged_faces = $comb_faces_trans;
	}
	else {
		// Rebuild faces for easy use
		if($eo_fnts_prep && ! empty($eo_fnts_prep["gwf_font"]) && is_array($eo_fnts_prep["gwf_font"]) && ! empty($eo_fnts_prep["os_font"]) && is_array($eo_fnts_prep["os_font"]) ){
			$merged_faces = array();
			$def_faces = $eo_fnts_prep["os_font"]["font_faces"];
			$ggl_faces = $eo_fnts_prep["gwf_font"]["font_faces"];
			if($def_faces && is_array($def_faces) ) {
				$merged_faces["os_font"] = $def_faces;
			}
			if($ggl_faces && is_array($ggl_faces) ) {
				$ggl_final_faces = array();
				foreach ($ggl_faces as $slug => $val) {
					// lowercase slugs make it hard, just store the option val as name, maybe only a space to + replace
				//	$ggl_final_faces[$slug] = $val["name"];
					$fslug = str_replace(" ","+",$val["name"]);
					$ggl_final_faces[$fslug] = $val["name"];
				}
				$merged_faces["gwf_font"] = $ggl_final_faces;
			}
			// save the restructured array for later use for a short time - 30 mins
			set_transient( 'eo_comb_faces_trans', $merged_faces, 60 * 300 );
			//return	eo_default_font_faces();
		}
		else {
			$merged_faces = eo_default_font_faces();
		}
	}
	return $merged_faces;
}



function eo_get_font_sources() {
	$fonts_all = get_option ( 'eo_all_fonts_arr' );
	if( $fonts_all && is_array($fonts_all) ) {
		$all_fonts_sources = array();
		foreach ( $fonts_all as $all_fonts_source ) {
			$all_fonts_sources[$all_fonts_source["font_src_slug"]] = $all_fonts_source["font_src_name"];	
			//var_dump($all_fonts_sources);
		}
		return $all_fonts_sources;
	}		
}

//quick page list
function eo_get_q_pages() {
	$page_ids_arr = get_all_page_ids();
	$page_opt_arr = array();
	foreach ( $page_ids_arr as $the_page_idd ) {
		$page_opt_arr[$the_page_idd] = 	get_the_title($the_page_idd);
	}
	return $page_opt_arr;
}

// quick cat list
function eo_get_q_cats() {
	$category_ids = get_all_category_ids();
	$cat_arr = array();
	foreach($category_ids as $cat_id) {
	  $cat_name = get_cat_name($cat_id);
	//  echo $cat_id . ': ' . $cat_name;
	$cat_arr[$cat_id] = $cat_name;	
	}
	ksort($cat_arr);
	$st_cat_arr = array(0 => "ALL");
//	$fin_cat_arr = array_merge($st_cat_arr,$cat_arr);
	$fin_cat_arr = $st_cat_arr + $cat_arr;
	return $fin_cat_arr;
}
function eo_order_arr() {
	$order_arr  = array("ASC" => "ASC", "DESC" => "DESC" );
	return $order_arr;
}
function eo_order_by_arr() {
	$order_arr  = array(
		"date" => "Date",
		"ID" => "ID",
		"rand" => "Random",
		"name" => "Name",
		"title" => "Title",
		"author" => "Author",
		"modified" => "Modified",
		"comment_count" => "Comment Count",
	);
	return $order_arr;
}

function eo_chck_gen_cl($cl_tc, $cl_tr, $add_cl = '',$absl = '') {
		$gen_opt_cl = get_option('eo_gen_opt_cl' );
	//	var_dump($gen_opt_cl[$cl_tc]);
		return (strpos($gen_opt_cl[$cl_tc],$cl_tr) !== false ) ? true : false;
	}
function eo_opt_dept($opt_td,$opt_tb,$col = '',$addc='') {
	$optionsframework_settings = get_option('optionsframework' );
	$opts = get_option(  $optionsframework_settings['id'] );	
//	$dopt = optionsframework_options();
	//	_eo-todo: build multiple dependencies, for example display page selector only if Jumbo disp. is set to page.
	$idf = ' dept dp-'.$opt_td.'';
	$ret_cl = '';
	$ret_cl .= $idf;
	$counter = 0;
	//if dependant columns is recieved explode true|false
	if(strpos($opt_tb,"-") !== false) {
		$opt_tba = explode("-",$opt_tb);
	}
	else {
		$opt_tba = array($opt_tb);
	}
	foreach ($opt_tba as $opt_tb) {
	($opts[$opt_td]) ? $ret_cl .= " exist" : " non-exist";
		if( !empty($col) && ! is_array($col) )	{
		//	var_dump($col);
				$mlcl = strpos($col, "|");
				if ($mlcl !== false) $cola = explode("|",$col);
				(is_array($cola) ) ? $col = $cola : $col = $col;
		}

		if ($opts[$opt_td] == '' && strpos($ret_cl,"empty") === false ) {
			$ret_cl .= " empty";
			if ( !empty($ret_cl) && strpos($ret_cl,"col") === false ) {
				(is_array($col)) ? $kol = str_replace("col"," kol",$col[0]).' '.$col[1] : $kol = $col;
				$ret_cl .= $kol;
			}
		}
		else if ( $opt_tb == "|is_ua_code|") {
	//		var_dump("desc: " . $desc);
			if(	!empty($opts[$opt_td]) ) {
				// skip if already valid
				$optcl = $opts[$opt_td]["class"];
		//		var_dump($opts[$opt_td]);
				$chckua = strpos($optcl, "lvalidl");
				if ($chckua === false) {
					$chckuacd = strpos($opts[$opt_td], "UA");
					if ($chckuacd !== false) {
						$search = array('UA', '-');
						$replace = array('', '');
						$numonly = str_replace($search, $replace, $opts[$opt_td]);
				//		var_dump($numonly);
						if(is_numeric($numonly) && strlen($numonly >= 7) ) {
							$ret_cl .= " lvalidl";
							(is_array($col)) ? $kol = str_replace("col"," kol",$col[1]) : $kol = $col;
							//if( !is_ar$cola = explode("|",$col);
						}	
						else {
							$ret_cl .= " linvalidl";	
						//	$desc = $opts[$opt_td]["desc"];
						}
					}
					else {
						$ret_cl .= " linvalidl";
					}
				}
				else {
					$ret_cl .= "not-eval";
				}
			}
		}
		else if (  $opts[$opt_td] == $opt_tb) {
			// _eo-check: checkboxes with value "0" are not being stored, returning false
			$ret_cl .= " match ";
			(is_array($col)) ? $kol = str_replace("col"," kol",$col[1]).' '.$col[0] : $kol = $col;
			$ret_cl .= $kol;
		}
		else if (  $opts[$opt_td] != $opt_tb) {
			 $ret_cl .= " not-met altcl ";
			(is_array($col)) ? $kol = str_replace("col"," kol",$col[0]).' '.$col[1] : $kol = $col;
			$ret_cl .= $kol;			//return false;
			
		}
		else  {
			$ret_cl .= " unknwn";
		}
	}
	$ret_classes = preg_replace('!\s+!', ' ', $ret_cl);
	$occc = substr_count($ret_classes, $idf) ;
	if ( $occc > 1 )	$ret_classes = preg_replace('/'.$idf.'/', '', $ret_classes, 2);

	if( get_option('eo_gen_opt_cl') ) {
	$opt_cl_gen = get_option('eo_gen_opt_cl');
	}
	else {
		$opt_cl_gen = array();
	}
	if( $opts[$opt_td] && get_option('eo_gen_opt_cl') ) {
					return $ret_classes;
	}
	else {
		
//		var_dump("No prior val: return to opts as".$ret_classes);

		return $ret_classes;
	}
	//var_dump($opt_td,$opt_tb);
}
function eo_prep() {
	$optionsframework_settings = get_option('optionsframework' );
	
	$options =& _optionsframework_options();
	$eo_opts = get_option('eo_opts');

	$eo_fnts_prep = get_option('eo_all_fonts_arr');
	
	// CREATE GROUPS OPTION GROUPS FOR OPTIONS IF WE HAVE AND STORE THEM IN OPTIONS FOR LATER USE.
	// _eo-review: Regroup the options better.
	$grouped_opts = array();
	
	// ASSIGN ICONS TO GROUPS
/*		$grouped_icons = array(
					"slider" => "home",
					"slider" => "text-height",
					"slider" => "",
					"slider" => "",						
	);*/
	//$eo_opts =  get_option('eo_opts');

	$optcount = count($options);
	if($eo_opts) $last_gr_c = count($eo_opts["groups"]);
//	var_dump($optcount,$eo_opts["last_cnt"]);
//	var_dump($last_gr_c,$eo_opts["last_gr_cnt"]);
	// CREATE OPTION GROUPS
	// _eo-todo: Find a better & more accurate way to find out if groups has changed also review the iteration
	if( empty($eo_opts) || $eo_opts["last_cnt"] != $optcount ) {
		foreach ( $options as $key => $optval ) {
			if (array_key_exists('id', $optval) && array_key_exists('group', $optval))  {
				if(!empty($optval["group"]) ) {
					//	var_dump($optval["group"]);
					if ( array_key_exists($optval["group"], $grouped_opts) && is_array($grouped_opts[$optval["group"]]) ) {
						array_push($grouped_opts[$optval["group"]], $optval);			
								//		var_dump($grouped_opts[$optval["group"]]);
						//	array_push($eo_opts['groups'][$optval["group"]], $eo_groups_summary );
						$eo_opts['groups'][$optval["group"]]["last_item"] = $optval["id"];	
					}
					else {
						$grouped_opts[$optval["group"]] = array();														
						array_push($grouped_opts[$optval["group"]], $optval);
						
						$eo_opts['groups'][$optval["group"]] = array("first_item" => $optval["id"],"last_item" => $optval["id"]);
					}
				//	unset($options[$key]);
				}
		//		var_dump($grouped_opts);
			//var_dump($options);

		//	update_option( 'optionsframework', $optionsframework_settings );
			}
		}
					$eo_opts["last_gr_cnt"] = count($grouped_opts);;
					$eo_opts["last_cnt"] = $optcount;
					$eo_opts["init_refreshed"] = "no";
					update_option( 'eo_opts', $eo_opts );
	}
	
	
	$gf_dump_file =  get_template_directory().'/panel/inc/gfdump.php';
	if($eo_fnts_prep && ! empty($eo_fnts_prep["gwf_font"]) && is_array($eo_fnts_prep["gwf_font"]) && ! empty($eo_fnts_prep["os_font"]) && is_array($eo_fnts_prep["os_font"]) ){
		// All Good.. Nothing to see here..
	} 
	else {
		// We dont have both the system and the Google fonts it seems..
		if( ! $eo_fnts_prep ) {
			// Check if we have some font source -- probably none at this point, so set some default fonts
			
			// Create an empty array to store fonts
			if( ! is_array($eo_fnts_prep) ) $eo_fnts_prep = array();
			
			$def_os_fonts = array(
			'Helvetica Neue, Helvetica, Arial, sans-serif'=> 'Helvetica-Arial',
			// Bah ! Who'd use that anyway ? 'Arial Black, Gadget, sans-serif' => 'Arial Black'
			// NO!.. just no! 'Comic Sans MS, Comic Sans MS, cursive'
			'Courier New, Courier New, monospace' => 'Courier New',
			'Georgia, Georgia, serif' => 'Georgia',
			// Not sure why would anyone want this one, but maybe for headings...
			'Impact, Impact, Charcoal, sans-serif' => 'Impact',
			'Lucida Console, Monaco, monospace' => 'Lucida Console',
			'Lucida Grande, Lucida Sans Unicode, sans-serif' => 'Lucida Grande',
			'Palatino Linotype, Book Antiqua, Palatino, serif' => 'Palatino',
			'Tahoma, Geneva, sans-serif' => 'Tahom-Geneva',
			'Times New Roman, Times New Roman, Times, serif' => 'Times New Roman',
			'Trebuchet, Trebuchet MS, sans-serif' => 'Trebuchet',
			'Verdana, Verdana, Geneva, sans-serif' => 'Verdana-Geneva',
			'MS Sans Serif, Geneva, sans-serif' => 'Ms Serif-Geneva',
			'MS Serif, New York, serif' => 'Serif'
			);

			// Check if System Font Families exist
			// Unnecessary check.. if(!empty($def_os_fonts) && is_array($def_os_fonts) ) {
			$os_font_src_arr = array(
				"font_src_slug" => "os_font",
				"font_src_name" => "Stock OS Fonts",
				"font_faces" => $def_os_fonts
			);
			$all_fonts["os_font"] = $os_font_src_arr;
			update_option('eo_all_fonts_arr',$all_fonts);
			// Maybe skip this and do both updates at once ?
		//	var_dump($all_fonts);
		}
		else if( $eo_fnts_prep && is_array($eo_fnts_prep["os_font"]) ) {
			// We should already have default os fonts from above but Google Fonts ?
			
			// We might have a value from a recent Google Font check..
			$google_f_opt = get_option( 'eo_googlefonts_arr' );
			if($google_f_opt && is_array($google_f_opt)) {
				$eo_fnts_prep["gwf_font"] = $google_f_opt;
				//Update fonts with Google Fonts and be done with it
				update_option( 'eo_all_fonts_arr', $eo_fnts_prep );	
				
				//$gwf_faces_trans = get_transient('gwf_faces_trans');

			}
			else if( file_exists($gf_dump_file)) { 
			// Load Google fonts from local file
				include_once($gf_dump_file);
			//	var_dump($def_gf_array);
				$eo_fnts_prep["gwf_font"] = $def_gf_array;
				update_option( 'eo_def_gf_array', $def_gf_array );	//test
					//Update fonts with Google Fonts and be done with it
				update_option( 'eo_all_fonts_arr', $eo_fnts_prep );	
				
			}
			else {
				// Cant get Google font for some reason ??
			}
		} // os font + google addition
	} // We dont have any fonts + os font addition
//	var_dump($options);
//	update_option( $optionsframework_settings['id'], $options );
}

function eo_make_dmsg($dmid,$dmtxt) {
	$eo_opts = get_option('eo_opts');
	if($eo_opts && array_key_exists("diss_msgs",$eo_opts) && is_array($eo_opts["diss_msgs"]) && in_array($dmid,$eo_opts["diss_msgs"]) && !empty($eo_opts["diss_msgs"]) ) {
		return false;
	}
	else {
		//	'visit_tips'
		$diss_msg_nonce = wp_create_nonce($dmid.'_nonce');
		//	$diss_msg_str = "eo_transients";
		//	$diss_msg_link = admin_url('themes.php?page='.$theme_opt_slug.'&action=diss_msg&dmid=' . $dmid);
		$diss_msg_link = admin_url('admin-ajax.php?action=eo_dismiss_msg&diss_what=' . $dmid . '&nonce='.$diss_msg_nonce);
		$diss_msg_link_html  = '<a data-dismiss="alert" data-diss_what="' . $dmid . '" href="' . $diss_msg_link . '" class="close" data-nonce="' . $diss_msg_nonce . '" data-del_what="' . $dmid . '">X</a>';
		$diss_msg_link_html .= '<span>'.$dmtxt.'</span>';
		
		return $diss_msg_link_html;
	}
}
	
	//	var_dump($dismiss_messages);
function eo_output_dismiss_messages() {
	$the_theme = wp_get_theme();
	$the_theme_v = $the_theme->get( 'Version' );

	$dismiss_messages = array();
	
	$dismiss_messages[] = array( "title" => __('Check About tab', 'eo_theme'),
			"desc" => eo_make_dmsg('visit_tips','Make sure you visit the <b>Tips and Tricks</b> section in the <em>About</em> tab'),
			"class" => 'alert alert-info fadee in',
			"ver" => "all"
			);	
	$dismiss_messages[] = array( "title" => __('If something goes wrong', 'eo_theme'),
			"desc" => eo_make_dmsg('go_wrg','If you get an error, something goes wrong, or something just doesnt feel right, looks messed up just <em>restore default options</em>. If that doesnt solve it either; delete all options in <em>under the hood</em> settings'),
			"class" => 'alert alert-info fadee in',
			"ver" => "all"
			);
	
	foreach ($dismiss_messages as $dismiss_msg) {
		//var_dump($dismiss_msg["desc"]);
		if($dismiss_msg["desc"] && array_key_exists("ver",$dismiss_msg) && version_compare($the_theme_v, $dismiss_msg["ver"], "<=") &&  ! array_key_exists("comp",$dismiss_msg) || $dismiss_msg["desc"] && array_key_exists("ver",$dismiss_msg) && $dismiss_msg["ver"] == "all") {
			echo '<div class="dismsg '.$dismiss_msg["class"].'">
				<h4>'.$dismiss_msg["title"].'</h4>
				<p>'.$dismiss_msg["desc"].'</p>
				<span style="font-size: 90%">'. __('You can simply dismiss this message never to be shown again by clicking the X on the right', 'eo_theme').'</span>
			  </div>';
		}
		elseif($dismiss_msg["desc"] && array_key_exists("ver",$dismiss_msg) && array_key_exists("comp",$dismiss_msg) && $dismiss_msg["comp"] == "eq" && version_compare($the_theme_v, $dismiss_msg["ver"], "==") )
		{
			echo '<div class="dismsg '.$dismiss_msg["class"].'">
				<h4>'.$dismiss_msg["title"].'</h4>
				<p>'.$dismiss_msg["desc"].'</p>
				<span style="font-size: 90%">'. __('You can simply dismiss this message never to be shown again by clicking the X on the right', 'eo_theme').'</span>
			  </div>';
		}
	}
}

add_action("wp_ajax_eo_dismiss_msg", "eo_dismiss_msg");

function eo_dismiss_msg() {
		$result = '';
		// check if we want to delete transient or option
		if ( isset($_GET["diss_what"]) ) {
			$dmid = $_GET["diss_what"];
			if ( !wp_verify_nonce( $_REQUEST['nonce'], $dmid."_nonce")) {
			  exit("Cheating ??");
			}
		}
		else {
			// no msg set to be dismissed
			  exit("What are you doing ? dme#1 Cheating ??");
		}
		// check if requested option is allowed to be deleted		
		$eo_opts = get_option('eo_opts');
		if($eo_opts) {
			// create the dmsg array if it hasnt been created
			if( ! array_key_exists("diss_msgs",$eo_opts) ) $eo_opts["diss_msgs"] = array();
			$dmsgs = $eo_opts["diss_msgs"];
			if( ! in_array($dmid,$dmsgs) ) {
				$result = "option dismissed#".$dmid;
				$eo_opts["diss_msgs"][] = $dmid;
				update_option('eo_opts',$eo_opts);
			}
		}
		
		// Return result. Block direct access from browser
	   if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		  $result = json_encode($result);
		  echo $result;
	   }
	   else {
		  header("Location: ".$_SERVER["HTTP_REFERER"]);
	   }
	
	   die($result);
}

add_action("wp_ajax_eo_del_opt", "eo_del_opt");

function eo_del_opt() {
		global $wpdb, $theme_opt_slug;
		
		if ( isset($_GET["del_what"]) ) {
			$delwg = $_GET["del_what"];
			if($delwg == "eo_transients") {
				if ( !wp_verify_nonce( $_REQUEST['nonce'], "eo_del_trans_nonce")) {
				  exit("Cheating ??");
				}
			}
			
		}
		else {
		  if ( !wp_verify_nonce( $_REQUEST['nonce'], "eo_del_opt_nonce")) {
			  exit("Cheating ??");
		   }   
		}
	
		$optionsframework_settings = get_option('optionsframework' );
		// _eo-review : Need a more unique prefix_ $wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'cpt_%'" );
		($theme_opt_slug) ? $the_opt_id = $theme_opt_slug : $the_opt_id = get_option( $optionsframework_settings['id'] );
		$del_wht = $_REQUEST["del_what"];
		$acc_del_opts = array($the_opt_id,"eo_transients","eo_const","eo_custom_fields_opt","eo_all_fonts_arr","eo_opts","eo_gen_opt_cl","eo_def_gf_array","eo_googlefonts_arr");
		if($del_wht == "start_over") {
		//	$what_to_del = $del_wht;
			$last_op = end($acc_del_opts);
			foreach ( $acc_del_opts as $del_opt) {
				 $chck_opt_ex = get_option( $del_opt );
				 if($chck_opt_ex) {
					 delete_option($del_opt);
					 if( $last_op == $del_opt )	{ 
						$result = "All options & settings -should be- deleted";
					}
					else {
						$result = "Whoops could not delete all options";	
					}
				 }
			}

		}
		else if ( in_array($del_wht,$acc_del_opts) ) {
			if($del_wht == "eo_transients") {
				if ( is_multisite() ) {
					$all_sites = $wpdb->get_results( "SELECT * FROM $wpdb->blogs" );
					if ( $all_sites ) {
						foreach ($all_sites as $site) {
							$wpdb->set_blog_id( $site->blog_id );
							$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_eo_%')" );
						}
					}
				}
				else {
					$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_eo_%')" );
					$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_timeout_eo_%')" );
				//	die("Transients deleted");
				}
			}
			$what_to_del = $del_wht;
			delete_option($del_wht);
		}
		else {
			exit("Cheating ?? #Trying to delete something else ?!!");
		}
	
	   if(!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') {
		  $result = json_encode($result);
		// echo $result;
			die($result);  
	   }
	   else {
		  header("Location: ".add_query_arg(array("sh_msg"=>"del_success","sh_msg_cl"=>"success"),$_SERVER["HTTP_REFERER"]) );
	   }
	
}

function eo_gen_backup_list($regen=false,$r=false) {
	global $wpdb, $eo_options, $th_xs_slug;

	$bups = get_transient('eo_backup_list_'.$th_xs_slug);
	if(!$bups || $regen) {
		
		if ( is_multisite() ) {
			$all_sites = $wpdb->get_results( "SELECT * FROM $wpdb->blogs" );
			if ( $all_sites ) {
				foreach ($all_sites as $site) {
					$wpdb->set_blog_id( $site->blog_id );
					$bupt =	$wpdb->get_col( $wpdb->prepare( "SELECT `option_name` FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE %s",'_transient_eo_bc_'.$th_xs_slug.'%%') );
					$bupo =	$wpdb->get_col( $wpdb->prepare( "SELECT `option_name` FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE %s",'eo_bc_'.$th_xs_slug.'%%') );
					$bups = array_merge($bupt, $bupo);
				}
			}
		}
		else {
					$bupt =	$wpdb->get_col( $wpdb->prepare( "SELECT `option_name` FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE %s",'_transient_eo_bc_'.$th_xs_slug.'%%') );
					$bupo =	$wpdb->get_col( $wpdb->prepare( "SELECT `option_name` FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE %s",'eo_bc_'.$th_xs_slug.'%%') );
					$bups = array_merge($bupt, $bupo);		//	die("Transients deleted");
		}
		
		
	}
	if(is_array($bups) ) {
		if($r) {	return $bups; }
		else {
			set_transient('eo_backup_list_'.$th_xs_slug,$bups, 604800);
		}
	}
	else {
		return false;	
	}
}

add_action("wp_ajax_eo_backup_settings", "eo_backup_settings");
function eo_backup_settings($f='') {
	global $wpdb, $eo_options, $th_xs_slug;
	  if ( !wp_verify_nonce( $_REQUEST['nonce'], "eo_optsave_nonce")) {
		  exit("Cheating ??");
	   }   
	   
	   
	if($eo_options && !empty($eo_options) && is_array($eo_options) ) {
		$opt_data = maybe_serialize($eo_options);
		
			
//	$savetime = str_replace(array(" ",":"),array("_","-"),current_time( 'mysql' ) );
	$savetime = date( 'jMy_G-i', current_time( 'timestamp' ));
	$savenam = "eo_bc_".$th_xs_slug."_".$savetime;
	$bexp = 604800;
	if(isset($_POST["backup_name"]) && !empty($_POST["backup_name"]) ) {
		$sv_shn = substr(sanitize_title($_POST["backup_name"]),0,12);
		$savenam = $savenam.'_bcn_'.$sv_shn;
	}
	if(isset($_POST["backup_exp"]) && !empty($_POST["backup_exp"]) && $_POST["backup_exp"] != "perm" ) {
		if ( $_POST["backup_exp"] == "aday" ) 	$bexp = 86400;
		if ( $_POST["backup_exp"] == "amonth" ) $bexp = 86400 * 30;
		set_transient($savenam, $opt_data, $bexp);
	}
	else if(isset($_POST["backup_exp"]) && !empty($_POST["backup_exp"]) && $_POST["backup_exp"] == "perm" ) {
		update_option($savenam, $opt_data);
	}
	else {
		// no need for this ?
		set_transient($savenam, $opt_data, $bexp);
	}
	eo_gen_backup_list(true);
	header("Location: ".add_query_arg(array("sh_msg"=>"backup_success","sh_msg_cl"=>"success","addinf"=>"saved as <b>".str_replace(array("eo_bc_".$th_xs_slug."_","_bcn_"),array("",""),$savenam)."</b>"),$_SERVER["HTTP_REFERER"]) );

	//	$now = current_time( 'timestamp', 0 ) ;
	//	$export_file = get_template_directory().'settings_'.$now.'.txt';
/*	if(function_exists('file_get_contents') && function_exists('file_get_contents') ) {
		// Append a new person to the file
		foreach($eo_options as $eo_option) {
		//$current .= "Started at: " .$start. "\n";
		}
		// Write the contents back to the file
		file_put_contents($file, serialize($eo_options) );
	}*/
		//return $opt_data;
	}
	else {
		//return false;	
	}
	
}
add_action("wp_ajax_eo_restore_settings", "eo_restore_settings");
function eo_restore_settings() {
		global $eo_options, $theme_opt_slug, $th_xs_slug;
	  if ( !wp_verify_nonce( $_REQUEST['nonce'], "eo_optrestore_nonce")) {
		  exit("Cheating ??");
	   }   
	   
	   
	if(isset($_POST["restore_name"]) && !empty($_POST["restore_name"]) ) {
		$b = $_POST["restore_name"];
		$aback = get_transient($b);
		// No transient, try the option.
		if(!$aback) $aback = get_option($b);
		$resopt_arr = maybe_unserialize($aback);
		$optionz = get_option($theme_opt_slug);
		
		if(!is_array($resopt_arr) || !$resopt_arr || empty($resopt_arr) ) {
				header("Location: ".add_query_arg(array("sh_msg"=>"restore_failed","sh_msg_cl"=>"danger","addinf"=>false),$_SERVER["HTTP_REFERER"]) );		
		}
//		var_dump($resopt_arr);
//		die($resopt_arr);

		
		foreach($resopt_arr as $k=>$resopt) {
			if(array_key_exists($k,$eo_options) ) {
				$eo_options[$k] = $resopt;
			}
			if(array_key_exists($k,$optionz) ) {
				$optionz[$k] = $resopt;
			}
		}
		update_option('eo_options',$eo_options);
		update_option($theme_opt_slug,$optionz);
		
		header("Location: ".add_query_arg(array("sh_msg"=>"restore_success","sh_msg_cl"=>"success","addinf"=>false),$_SERVER["HTTP_REFERER"]) );
	}
}
add_action("wp_ajax_eo_del_backups", "eo_del_backups");
function eo_del_backups() {
	global $wpdb, $eo_options, $th_xs_slug;
	  if ( !wp_verify_nonce( $_REQUEST['nonce'], "eo_delbackups_nonce")) {
		  exit("Cheating ??");
	   }   	
	
		if ( is_multisite() ) {
			$all_sites = $wpdb->get_results( "SELECT * FROM $wpdb->blogs" );
			if ( $all_sites ) {
				foreach ($all_sites as $site) {
					$wpdb->set_blog_id( $site->blog_id );
					$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_eo_bc_bsul_%')" );
					$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('eo_bc_bsul_%')" );
				}
			}
		}
		else {
			$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_eo_bc_bsul_%')" );
			$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('_transient_timeout_eo_bc_bsul_%')" );
			$wpdb->query( "DELETE FROM `{$wpdb->prefix}options` WHERE `option_name` LIKE ('eo_bc_bsul_%')" );
			eo_gen_backup_list(true);
		//	die("Transients deleted");
			header("Location: ".add_query_arg(array("sh_msg"=>"delbacks_success","sh_msg_cl"=>"success","addinf"=>false),$_SERVER["HTTP_REFERER"]) );

		}	
}

function eo_col_cl_maker($dw,$min=NULL,$max=NULL) {
	$szs = array("sm","md","lg");
	(isset($min) && isset($max) ) ? $col_no = range($min, $max) : $col_no = range(-1, 12);
	$cols = array();
	$prev = NULL;

	foreach ($col_no as $i => $col) {
		$cols[$col] = eoperc($col,12) . '%';
		if($col == -1) {
			if(array_key_exists(intval(array_search($dw,$szs)) - 1,$szs) ) $prev = $szs[intval(array_search($dw,$szs)) - 1];
			if(array_key_exists(intval(array_search($dw,$szs)) - 2,$szs) ) $prev = $prev .">".$szs[intval(array_search($dw,$szs)) - 2];
			if(array_key_exists(intval(array_search($dw,$szs)) - 3,$szs) ) $prev = $prev .">".$szs[intval(array_search($dw,$szs)) - 3];

			if($prev) {
				$cols[$col] = "inherit from - " . $prev;
			}
			else {
				$cols[$col] = "inherit";
			}	
		}
		if($col == 0) $cols[$col] = "Hidden";
	//	if($dw == "xs" && $i == 12) $cols[12] = "100%";
	}
	return $cols;
}
function eo_output_sh_msgs() {
$shmsg_arr = array(
	"del_success" => __("Succesfully Deleted"),
	"backup_success" => __("Backup Succesful."),
	"delbacks_success" => __("Backups Deleted Succesfully."),
	"restore_success" => __("Succesfully Restored."),
	"restore_failed" => __("Oops Restore failed !")
);	
	
if(isset($_GET["sh_msg"]) ) {
//	var_dump($_GET);
	(isset($_GET["sh_msg_cl"]) ) ? $smsg_cl = $_GET["sh_msg_cl"] : $smsg_cl ="info";
	(isset($_GET["addinf"]) ) ? $addinf = $_GET["addinf"] : $addinf ="";
	$sh_msgs = explode('|',$_GET["sh_msg"]);
	foreach ($sh_msgs as $sh_msg) {
		echo '<div class="alert alert-'.$smsg_cl.' fade sh_msg">'.$shmsg_arr[$_GET["sh_msg"]]. $addinf .'</div>';
		unset($_GET["sh_msg"]);
		http_build_query($_GET);
	}
}
//return $shmsg_arr["ws"];
}
function eo_get_q_thumb_sizes(){
     global $_wp_additional_image_sizes;
     	$sizes = array();
 		foreach( get_intermediate_image_sizes() as $s ){
 			$sizes[ $s ] = array( 0, 0 );
 			if( in_array( $s, array( 'thumbnail', 'medium', 'large' ) ) ){
 				$sizes[ $s ][0] = get_option( $s . '_size_w' );
 				$sizes[ $s ][1] = get_option( $s . '_size_h' );
 			}else{
 				if( isset( $_wp_additional_image_sizes ) && isset( $_wp_additional_image_sizes[ $s ] ) )
 					$sizes[ $s ] = array( $_wp_additional_image_sizes[ $s ]['width'], $_wp_additional_image_sizes[ $s ]['height'], );
 			}
 		}
				
		$thumb_size_arr = array();
 		foreach( $sizes as $size => $atts ){
			$k = $size;
			$v = $size . ' ' . implode( 'x', $atts ) . "\n";
			
			$thumb_size_arr[$k] = $v; 
		}
		return $thumb_size_arr;
}
?>