<?php
if($_SERVER["REQUEST_METHOD"] == "POST")
{
	require_once("./config/db.conf.php");

	// Save in database...

	// Get template's file
	// include_once('./templates/_____.html');
}
else
{

	// Buffering
	ob_start();

	// Get template's file
	include_once('./templates/index.html');

	// Load content in container
	$template = ob_get_clean();

	// View
	echo $template;

}