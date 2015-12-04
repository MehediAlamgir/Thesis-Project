<?php
	$con = mysql_connect("localhost","root","");
	mysql_set_charset("utf8", $con); 
	$db = mysql_select_db("demo", $con);
	
	$banglaWord = $_POST['banglaWord'];
	$wordId = (int) ($_POST['wordId'] );
	$synsetId = (int) ($_POST['synsetId'] );
	
	$query="INSERT INTO banglameaning  VALUES('$wordId','$synsetId', '$banglaWord')";
	mysql_query($query);
	
?>