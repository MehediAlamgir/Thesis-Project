<?php
	$con = mysql_connect("localhost","root","");
	mysql_set_charset("utf8", $con); 
<<<<<<< HEAD
	$db = mysql_select_db("demo", $con);
	$text = $_POST['text'];
	
	$query="INSERT INTO banglameaning  VALUES('2','101', '$text')";
	mysql_query($query);
	
	 echo $text;
=======
	$db = mysql_select_db("wordnet_bangla", $con);
	
	$banglaWord = $_POST['banglaWord'];
	$wordId = (int) ($_POST['wordId'] );
	$synsetId = (int) ($_POST['synsetId'] );
	
	if($banglaWord == "")
		echo "No empty submit allowed";
	
	else
	{
		$query="INSERT INTO banglameaning  VALUES('$wordId','$synsetId', '$banglaWord')";
		mysql_query($query);
	}
	
	//echo $banglaWord + " "+ $wordId +" "+$synsetId
	
>>>>>>> temp
?>