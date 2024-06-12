<?php require_once('../../../../wp-load.php'); 
show_admin_bar(false);
get_header();?>
<?php include_once('head.php');  ?>

<?php
if(isset($_GET["page"]) )  {
	include_once($_GET["page"].'.php');  
}
else {
	include_once('thanks.php');  
}

?>
<?php include_once('footer.php');  ?>