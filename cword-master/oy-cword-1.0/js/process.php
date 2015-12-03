<?php
	$con = mysql_connect("localhost","root","");
	$db = mysql_select_db("demo", $con);

	$text = $_POST['text'];
	
	$query="INSERT INTO banglameaning  VALUES('1','100', '$text')";
	mysql_query($query);
	
	// echo $text;
?>