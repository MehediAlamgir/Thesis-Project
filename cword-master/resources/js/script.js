
	  
	 var roundInfo = null;		
	 var startPosition = -1 , endPosition = -1;
	 var moveCounter=0;
	 var timeTaken = 0;
	 var change_div_count=0;  
	 var inputBangla= "";
	 var errorSubmission=0;
	 var bonus=0; 
	 var score=0;
	
	  //initialize the tiles 
	  function initialize(data)
	  {
		  //console.log(data);
		  
		  roundInfo = JSON.parse(data);
		  
		  $('#gameCanvas').empty();
		  
		  $("#clue p").append(roundInfo.clue);
		  
		  //alert(roundInfo.markedPositions);
		  
		  
		  //tiles border is 2px and tiles margin is 5px 
		  //setting tile height and width accordingly
		  var tileWidth = ( $('#gameCanvas').width()- 2 * 2 * roundInfo.cols - 5 * 2 * roundInfo.cols ) / roundInfo.cols;
		  var tileHeight = ( $('#gameCanvas').height() - 2 * 2 * roundInfo.rows- 5 * 2 * roundInfo.rows ) / roundInfo.rows;

		  //alert(tileWidth+ " "+ tileHeight);
		  
		 
		  
		  for(var i=0;i<roundInfo.rows;i++)
		  {
			  
				  for(var j=0;j<roundInfo.cols;j++)
				  {
					    var tileId = (i * roundInfo.cols + j);
						
							  
					     $('#gameCanvas').append('<div id="'+ tileId+'" class="tile" onmousedown="mouseDown(this)"  onmouseup="mouseUp(this)" >'+roundInfo.grid[i][j]+'</div>');  
					  
					      $("#"+tileId).css("width",tileWidth+"px").css("height",tileHeight+"px").css("font-size",tileHeight/2);
						  
						  
						  if(isMarked(i,j))
						    $("#"+tileId).addClass("tile-marked");
						  		 				 
				  }  
				  
				  
		  }
		  
		   $('#gameCanvas').mouseup(function(){
		      
			  if(startPosition!=-1)
			  {
			    //alert("GAME CANVAS");
				$("#"+startPosition).removeClass("tile-touched");
			  }
		  });
		 
		 
	  }
	  
	  
	  
	  
	  //mouse down ... get swap start position
	  function mouseDown(element)
	  {   
	     
		  startPosition = element.id;
		  $("#"+startPosition).addClass("tile-touched");
		 
	  }
	  
	  
	  //mouse up ... get swap end position and swap tiles if possible
	  function mouseUp(element)
	  {
		 endPosition  = element.id;
		
		if( ( 
			  Math.abs(startPosition-endPosition ) == 1 
		      &&   parseInt(startPosition / roundInfo.cols)  ==  parseInt(endPosition / roundInfo.cols)  
			)
      	   || Math.abs(startPosition-endPosition ) == roundInfo.cols )
		 {
			
		
		    var a = $("#"+startPosition).text();
			var b = $("#"+endPosition).text();
			
			if( a != "" && b!= "" ){
				   
				   $("#"+startPosition).text(b);
					$("#"+endPosition).text(a);
                                        playSound("click.wav");
					moveCounter++;
				    $("#moves").val(moveCounter);
					
			}			
			
		
			

		 }
		 
		
		 $("#"+startPosition).removeClass("tile-touched");
		 
		 
		 startPosition = -1;
		 endPosition = -1;
		 
	  }


	  function onSubmit()
	  {
		  if (change_div_count == 0) {
			
			    if(isMatch()){
					
				   
				    
					change_div_count=1;
					clearInterval(tim);
					
				    
					$('#gameCanvas').load("gameover.php #input_word",function(){
						$('textarea, input[type=text]').avro();
						
					});
				    
				        timeTaken = parseInt($("#min").val()) * 60 + parseInt ( $("#sec").val());
				
				         // alert( timeTaken);  

                     playSound("applause.wav"); 					
				
				}else{
				   
					 errorSubmission++;
					 playSound("error.wav");
				   $( "#try-again-dialog" ).dialog( "open" );		
				}
			    
			}
			else if (change_div_count==1) {
				
				
				
				$('#gameCanvas').load("gameover.php #result", function() {
				  
					$('#movesCount').text(moveCounter);
					$('#timeCount').text(timeTaken);
					bonus=calculateBonus(errorSubmission);
					$('#bonus').text(bonus);
					score=calculateScore(moveCounter,timeTaken,bonus);
					$('#score').text(score);
					
					
				});
		         	//alert($('#input-bangla').val());
				inputBangla=$('#input-bangla').val();
				change_div_count = 2;	
				$('.button-new').text("Continue");
				
				playSound("Ta Da.wav"); 
				
				//alert("Time taken "+timeTaken+" Moves Taken"+moveCounter+"input "+inputBangla);
				
			
			}else if(change_div_count == 2){
				
			 window.location.href = "server/SaveInDatebase.php?move="+moveCounter+"&time="+timeTaken+"&score="+score+"&word_id="+
				roundInfo.secretWordId+"&isGRE="+roundInfo.isGRE+"&isTOFEL="+roundInfo.isTOFEL+"&isIELTS="+roundInfo.isIELTS+"&inputBangla="+inputBangla+"&clueId="+roundInfo.clueId;
		        
				 	    	
			}
		
	  }
	  
	  	function isMarked(row,col)
	  	{

		  for(i=0;i<roundInfo.markedPositions.length;i++){
		      
			  if(roundInfo.markedPositions[i][0] == row 
			     && roundInfo.markedPositions[i][1] == col)
				 return true;
		  }
		  
		  return false;
	  	}
		
		function isMatch()
		{
		   var markedPositions = [];
			 
		   for(var i=0;i<roundInfo.markedPositions.length;i++)
		   {
			  markedPositions[i] = roundInfo.markedPositions[i][0] * roundInfo.cols + roundInfo.markedPositions[i][1];
		   }
		   
		   for(var i=0;i<markedPositions.length;i++)
		   {
			   if( $("#"+markedPositions[i]).text() != roundInfo.secretWord[i] )
			   {
				   return false;
			   } 
		   }
		   
		   return true;
		}
	  
	  		
		$(function() {$( "#try-again-dialog" ).dialog(
		    {
			autoOpen: false,
			show: {
			effect: "blind",
			duration: 1000,
			
			},
			hide: {
			effect: "explode",
			duration: 1000
			}
			
		});
		
		});
		
		
	
		function playSound(soundfile) {
		  
		  var soundfile="resources/sounds/"+soundfile;
		  
		  document.getElementById("dummy").innerHTML=
			"<embed src=\""+soundfile+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
		}	
                
		var maxScore = 1000;
		var minMoves = 10;
		var minTime = 60;
		
                function calculateScore(moves,time,bonus){
                       
			score = maxScore  - ( moves - minMoves ) * 50 - ( time - minTime ) * 2 +bonus;
			return score  <100 ? 100:score ;    
                }			
	
	        function calculateBonus(errorSubmission){
			
			var bonus;
			
			if(errorSubmission==0)
			{
				bonus=200;
				return bonus;
			}
			else if(errorSubmission>0 && errorSubmission<=5)
			{
				bonus=100;
				return bonus;
			}
			else
			{
				bonus=0;
				return bonus;
			}
		}
	  
	