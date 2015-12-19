/*

	CWORD JavaScript Crossword Engine

	Copyright (C) 2007-2010 Pavel Simakov
	http://www.softwaresecretweapons.com/jspwiki/cword

	This library is free software; you can redistribute it and/or
	modify it under the terms of the GNU Lesser General Public
	License as published by the Free Software Foundation; either
	version 2.1 of the License, or (at your option) any later version.

	This library is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
	Lesser General Public License for more details.

	You should have received a copy of the GNU Lesser General Public
	License along with this library; if not, write to the Free Software
	Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA

*/

//
// Actions menu
//

var temp_score=0;
var temp_WordLength=0;
var arr = [];
var selectedWord;

function oyCrosswordMenu(puzz){
	this.puzz = puzz;
	
	this.hlist = puzz.hlist;
	this.vlist = puzz.vlist;
	this.footer = puzz.footer;
	
	this.canReveal = puzz.canReveal;
	this.canCheck = puzz.canCheck;	
	this.banglaInput = puzz.banglaInput // Mehedi
	
	this.clues = puzz.clues;
	
	this.currentMenu = null;
	this.over = null;
	
	// cell states
	this.cache = new Array();
	for (var i=0; i < this.puzz.h; i++){	
		for (var j=0; j < this.puzz.w; j++){	  
			var key = j + "_" + i; 
			this.cache[key] = -1; 	// -1 - empty, 0 - full, 1 - guessed, 2 - revealed
		}  
	}
	
	// init scores	
	this.checks = 0;
	this.reveals = 0;
	this.deducts = 0;	
	this.matches = 0;
	this.score = 0;
	
	this.rank = -1; //---------------------------------------------------------------Rank-------------------------------------------------------------------------------
	
	this.xpos = puzz.xpos; 
	this.ypos = puzz.ypos;	
	
	this.name = oyGetCookie("OYG_NICK_NAME"); 
	if (this.name == null || this.name == ""){
		this.name = "Anonymous";
	}
	
	this.server = new oyServer(this.puzz.appHome, this.puzz.ns, this.puzz.canTalkToServer);
	this.scoreSubmittedMatches = 0;	// number of matches for which core was submitted sucesfully
} 

oyCrosswordMenu.prototype.setCellState = function(x, y, value){
	this.cache[x + "_" + y] = value;
}  
 
oyCrosswordMenu.prototype.getCellState = function(x, y){
	return this.cache[x + "_" + y];
}


oyCrosswordMenu.prototype.bind = function(){
	this.inputCache = this.puzz.inputCache;
	 
	this.startOn = new Date();	
}

oyCrosswordMenu.prototype.unbind = function(){
	this.inputCache = null;
}

oyCrosswordMenu.prototype.focusNewCell = function(x, y){
	this.xpos = x; 
	this.ypos = y;
}

oyCrosswordMenu.prototype.invalidateMenu = function(){
	if (this.currentMenu != null){ 
		this.currentMenu();
	}
}

oyCrosswordMenu.prototype.installWelcomeMenu = function(){
	this.currentMenu = this.installWelcomeMenu;

	var target = document.getElementById("oygPuzzleFooter");
	target.innerHTML = "";

	var oThis = this;	
	
	var dispName = escape(this.name);
	dispName = dispName.replace(/%20/g, " ");
	this.addNoneWordAction( 
		target, 
		"Welcome, <a class='oysTextLink' href='' id='oygWelcomeLink'>" + dispName + "</a>! " // Show Welcome Message at the beginning of the game
	);		
	var link = document.getElementById("oygWelcomeLink");
	link.onclick = function(){
		oThis.askNickName(); // Provide Nick Name at the beggining of the game
		oThis.invalidateMenu();
		return false; 
	} 
	 
	this.addNewLine(target);
	
	this.addAction( 
		target, "Start Now", "Starting...", "strt",
		function(){				 
			oThis.puzz.bind();	
			oThis.puzz.hlist.clickItem(0);			
			oThis.installContextMenu();
			
			document.getElementById("oygStatic").innerHTML = "";
			
			oThis.footer.stateOk("Enjoy the game!");
		}
	);	

	this.footer.stateOk("Ready to begin!");
	 
	this.server.trackAction(this.puzz.uid, "wlm");
}

oyCrosswordMenu.prototype.installContextMenu = function(){
	this.currentMenu = this.installContextMenu;

	var target = document.getElementById("oygPuzzleFooter");
	target.innerHTML = "";  
	 
	var hidx = this.hlist.getClueIndexForPoint(this.xpos, this.ypos);
	var vidx = this.vlist.getClueIndexForPoint(this.xpos, this.ypos);
	
	//-------------------------------------------------------- Reveal Button--------------------------------------------------------------------------------
	if (!this.canReveal){
		this.addNoneWordAction(target, "Reveal Disabled");
	} else {			
		if (hidx != -1){
			var caption = "Reveal <b>" + (hidx + 1) + "A</b>" // Button
			if (!this.hlist.clues[hidx].completed()){
				this.addRevealWordAction(
					this.hlist.clues[hidx], target, caption
				);
			} else {
				this.addAction(target, caption, "", null, null);
			}
		}
		if (vidx != -1){
			var caption = "Reveal <b>" + (vidx + 1) + "D</b>";
			if (!this.vlist.clues[vidx].completed()){	
				this.addRevealWordAction( 
					this.vlist.clues[vidx], target, caption
				);		
			} else {
				this.addAction(target, caption, "", null, null);
			}	 
		}
	} 
	
	// -----------------------------------------------------------------------Check Button-------------------------------------------------------------------------------------
	if (!this.canCheck){
		this.addNoneWordAction(target, "Check Disabled");
	} else {
		var caption = "Check <b>" + (hidx + 1) + "A</b>";
		if (hidx != -1){
			if (!this.hlist.clues[hidx].completed()){
				this.addCheckWordAction(
					this.hlist.clues[hidx], target, caption
				);
			} else {
				this.addAction(target, caption, "", null, null);
			}
		}
		
		var caption = "Check <b>" + (vidx + 1) + "D</b>";
		if (vidx != -1){
			if (!this.vlist.clues[vidx].completed()){	 
				this.addCheckWordAction(
					this.vlist.clues[vidx], target, caption
				);		
			} else {
				this.addAction(target, caption, "", null, null);
			}	
		}
		 
		
		var oThis = this;
		this.addAction(target, "Check <b>All</b>", "Checking All...", "chkll",
			function(){				
				oThis.checkAll(); 
				oThis.invalidateMenu();		
				return false; 
			}
		); 
		 
		this.addNewLine(target); 
		
		var oThis = this;
		this.addSubmitLeaveMenuItems(target);
	} 
	
/*----------------------------------------------------------------------------------------------- Edit Starts  -------------------------------------------------------------------- */
	
	//##################################################################### (Bangla Input Button) #############################################################
/*	
	if (this.puzz.banglaInput)
	{
		var oThis = this;
		if(this.matches > 0)
		{
			this.addAction2(target, "<b>Bangla Input</b>", "Bengali Meaning...", "lv",
				function(){			
					oThis.bengaliMeaningInput();
					oThis.invalidateMenu();
					return false; 
				} 
			);
		
		}
		else
		{
			this.addAction(target, "Bangla Input", "", null, null);
		}
		
	}
*/
	//############################################################# (Bangla Input Reveal type Button) #######################################################

	if (!this.canReveal)
	{
		this.addNoneWordAction_BanglaMeaning(target, "Banla Input Disabled");
	} 
	else 
	{			
		if (hidx != -1){
			var caption = "Bangla Meaning <b>" + (hidx + 1) + "A</b>" // Button
			if (!this.hlist.clues[hidx].completed__BanglaMeaning())
			{
				/*
				this.addRevealWordAction_BanglaMeaning(
					this.hlist.clues[hidx], target, caption
				); */
				this.addAction2(target, caption, "", null, null);
			} 
			else {
				
				this.addRevealWordAction_BanglaMeaning(
					this.hlist.clues[hidx], target, caption
				);
				//this.addAction2(target, caption, "", null, null);
			}
		}
		if (vidx != -1){
			var caption = "Bangla Meaning <b>" + (vidx + 1) + "D</b>";
			if (!this.vlist.clues[vidx].completed__BanglaMeaning())
			{	
				/*
				this.addRevealWordAction_BanglaMeaning( 
					this.vlist.clues[vidx], target, caption
				);	*/
				
				this.addAction2(target, caption, "", null, null);
			} 
			else {
				
				
				this.addRevealWordAction_BanglaMeaning( 
					this.vlist.clues[vidx], target, caption
				); 
				//this.addAction2(target, caption, "", null, null);
			}	 
		}
	} 


	
/*----------------------------------------------------------------------------------------------- Edit End  -------------------------------------------------------------------- */
	
	// footer
	this.footer.update(); 
	
	// check game over
	var hasNext = false;	
	for (var i=0; i< this.clues.length; i++){
		if (!this.clues[i].completed()){
			hasNext = true; 
			break;
		} 
	}
	if (!hasNext){
		this.over = true;
	}
		 
	if (this.over){ 
		this.over = true;
		this.puzz.unbind();		
		this.installDoneMenu();
	} 
}


oyCrosswordMenu.prototype.bengaliMeaningInput = function() //--------------------------------------------------Mehedi
{
	if (this.matches == 0)
	{   
		this.footer.stateError("No English Word is Placed in the Grid for Bengali Meaning");
		alert("Nothing to provide Bengali Meaning yet!\nUncover some words first.");
	} 
	else 
	{
	
		var ms = new Date().getTime() - this.puzz.menu.startOn.getTime();
		this.server.bengaliMeaningInput(
			this, this.puzz.uid, 
			this.score, this.deducts, this.checks, this.reveals, this.matches,
			ms, this.name,
			this.puzz.clues
		); 
		this.footer.stateBusy("Provide Bengali Meaning...");
	}
} 
 
oyCrosswordMenu.prototype.installDoneMenu = function(){	
	this.currentMenu = this.installDoneMenu;

	var target = document.getElementById("oygPuzzleFooter");
	target.innerHTML = "";
	 
	this.addNoneWordAction(target, "Game Over!");	 
	this.addNewLine(target);	     
	
	var msg = "You have <b>" + this.score + "</b> points";
	if (this.rank != -1){
		msg += " (rank <b>" +  this.rank + "</b>)";
	}  
	msg += ".";
	
	this.addNoneWordAction(target, msg);	  
	this.addNewLine(target); 
	
	var oThis = this;
	this.addSubmitLeaveMenuItems(target);
		
	this.footer.stateOk("Game over!");
	 
	this.server.trackAction(this.puzz.uid, "ovr");
	
	this.footer.update();
}
 
 //reviewed
oyCrosswordMenu.prototype.addSubmitLeaveMenuItems = function(target){
	if (this.puzz.canTalkToServer){
		var caption = "Submit <b>Score</b>";   //------------------------------------------------Submit Score Button---------------------------------------------------
		if (this.matches > 0 && this.scoreSubmittedMatches < this.matches){		
			var oThis = this;
			this.addAction(target, caption, "Submitting score...", "sbmt",
				function(){	 	 		 
					oThis.submitScore();
					oThis.invalidateMenu();
					return false; 
				}  
			);
		} else {
			this.addAction(target, caption, "", null, null);
		}
	}
	
	//------------------------------------------------------------------------------Leave Game Button--------------------------------------------------------------------------
	var oThis = this;
	this.addAction(target, "Leave <b>Game</b>", "Leaving...", "lv",
		function(){			
			oThis.leaveGameEarly(oThis.puzz.leaveGameURL);
			oThis.footer.stateOk("Done");
			return false; 
		} 
	); 
}

//reviwed
oyCrosswordMenu.prototype.leaveGameEarly = function(url){
	this.footer.stateBusy("Leaving...");

	var canLeave = true;
	if (this.puzz.started && !this.over){
		canLeave = confirm("Game is in progress. Do you want to leave the game?");
	}	  
	if (canLeave){ 
		window.location = url;
	}
	
	this.footer.stateOk("Done");
}

//reviwed
oyCrosswordMenu.prototype.addAction = function(target, caption, hint, track, lambda){
	caption = caption.replace(" ", "&nbsp;");
	
	var elem = document.createElement("SPAN");
	elem.innerHTML = " &nbsp; ";	
	target.appendChild(elem);	

	var elem = document.createElement("A");
	elem.innerHTML = caption;	
	elem.href = "";				 	
	if (!lambda){
		elem.className = "oyMenuActionDis";
		elem.onclick = function(){
			return false;
		}		
	} else {
		elem.className = "oyMenuAction"; 		
		var oThis = this;
		elem.onclick = function(){
			oThis.footer.stateBusy(hint);
			setTimeout(
				function(){				
					lambda(); 
					oThis.server.trackAction(oThis.puzz.uid, track);
				}, 100
			); 
			return false;
		}		
	}
	
	target.appendChild(elem);	
}

//reviewed
oyCrosswordMenu.prototype.addNewLine = function(target){
	var elem = document.createElement("SPAN");
	elem.innerHTML = "<span style='font-size: 4px;'><br />&nbsp;<br /></span>";
	target.appendChild(elem);	
}

oyCrosswordMenu.prototype.addNoneWordAction = function(target, caption){
	var elem = document.createElement("SPAN");
	elem.className = "oyMenuActionNone";
	elem.innerHTML = caption;	
	target.appendChild(elem);	
	
	var elem = document.createElement("SPAN");
	elem.innerHTML = " ";	
	target.appendChild(elem);		
}

//reviewed
oyCrosswordMenu.prototype.addCheckWordAction = function(clue, target, caption){
	var oThis = this;
	this.addAction(target, caption, "Checking...", "chk",
		function(){				
			oThis.checkWord(clue);						
			oThis.invalidateMenu();		
			return false; 
		}
	);  
}

oyCrosswordMenu.prototype.addRevealWordAction = function(clue, target, caption){
	var oThis = this;
	this.addAction(target, caption, "Revealing...", "rvl",
		function(){				
			oThis.revealWord(clue);			
			oThis.invalidateMenu();		
			return false; 
		}
	); 
} 
 
 //reviewed
oyCrosswordMenu.prototype.getCurrentValueFor = function(x, y){
	var value = this.inputCache.getElement(x, y).value;
	if (value == " " || value == ""){				
		value = null;
	}
	
	return value;
}

oyCrosswordMenu.prototype.getCellPosListFor = function(clue, left, top){
	var all = new Array();
	  
	for (var i=0; i < clue.len; i++){
		all.push(this.charToPos(clue, i));
	}
	
	return all;
}

//reviewed
oyCrosswordMenu.prototype.charToPos = function(clue, offset){
	var pos = new function (){}
	
	if (clue.dir == 0){	
		pos.x = clue.xpos + offset;
		pos.y = clue.ypos;
	} else {
		pos.x = clue.xpos; 
		pos.y = clue.ypos + offset;
	} 
	
	return pos;
}

//reviewed
oyCrosswordMenu.prototype.showAnswer = function(clue, stateCode){
	for (var i=0; i < clue.len; i++){
		var pos = this.charToPos(clue, i);	
		var input = this.inputCache.getElement(pos.x, pos.y);		
		if (!input.readOnly){			
			input.readOnly = true;			
			input.value = clue.answer.charAt(i).toUpperCase();
			
			this.setCellState(pos.x, pos.y, stateCode); 
			
			var cell = document.getElementById("oyCell" + pos.x + "_" + pos.y);		
			switch(stateCode){
				case 1: 
					cell.className = "oyCellGuessed"; 		 		
					break;
				case 2:
					cell.className = "oyCellRevealed"; 		 	
					break; 		 			 
				default: 
					alert("Bad state code!");		
			} 		 	
		}  
	} 	  
	
	this.puzz.invalidate();
}

// Check whether the value and original clue answer are same 
oyCrosswordMenu.prototype.checkWordStatus = function(clue){
	var status = new function (){};
	
	status.wrong = 0;
	status.isComplete = true; 
	status.buf = "";
	// dir 0 == Horizontal AND dir 1 == Vertical
	for (var i=0; i < clue.len; i++){			
		var value;
		if (clue.dir == 0){
			value = this.getCurrentValueFor(clue.xpos + i, clue.ypos); // Get the Horizontal Clue ans given by user
		} else {
			value = this.getCurrentValueFor(clue.xpos, clue.ypos + i); // Get the Vertical Clue ans given by user
		}
 
		if (value == null){
			status.isComplete = false;
			status.buf += ".";
		} else {		
			status.buf += value;
		}
		
		//Check whether the value and original clue answer are same 
		if (value != clue.answer.charAt(i).toUpperCase()){
			status.wrong++; 
		}
	} 
	
	return status;
}

// Provide Nick Name at the beggining of the game

oyCrosswordMenu.prototype.askNickName = function(score){
	if (score){
		score = "Score: " + score + ". ";
	} else { 
		score = "";
	}
  
	if (this.name == null){
		this.name = "";
	}

	var oldName = this.name;
	this.name = window.prompt(  
		score + "Enter your NICK NAME or E-MAIL.\n" +  
		"Without e-mail, the score is recorded, but you aren't eligible for the prizes.",
		this.name 
	);
	 
	var result = true; 
	if (this.name == null || this.name == ""){
		this.name = oldName;     
		result = false; 
	} 
	
	if (this.name != null && this.name != ""){  
		oySetCookieForPeriod("OYG_NICK_NAME", this.name, 1000*60*60*24*360, "/");
		return result;
	} else {  
		this.name = "Anonymous";
		return false; 
	}
}

// Return score if given word is correct
oyCrosswordMenu.prototype.getScoreForMatch = function(clue){
	return clue.len; 
}

oyCrosswordMenu.prototype.getDeductsForReveal = function(clue){
	return clue.len * 2;  
} 

//reviewed
oyCrosswordMenu.prototype.getDeductionForCheck = function(clue){
	var CHECK_FRAQ = 3;
	
	var deduction = (clue.len - clue.len % CHECK_FRAQ) / CHECK_FRAQ;
	if (deduction < 1){
		deduction = 1;
	}
	
	return deduction;
}

// Showed answer After Clicking Reveal Button
oyCrosswordMenu.prototype.revealWord = function(clue){
	this.deducts += this.getDeductsForReveal(clue);	
	this.reveals++; 
	this.showAnswer(clue, 2);	  	 
	
	clue.revealed = true; 	// You revealed answer of this clue
	clue.matched = false; 	// As you revealed this clue answer, so this word will not counted as your given answer anymore.
 
	var status = this.checkWordStatus(clue);	  	
	this.footer.stateOk("Revealed [" + status.buf + "]!");
}  

//reviewed

//oyCrosswordMenu.prototype.checkAll = function(){
	
oyCrosswordMenu.prototype.checkAll = function()
{	

	var checked = 0;
	var correct = 0;
	for (var i=0; i < this.clues.length; i++){
		if (this.clues[i].completed()) continue;
		 
		var status = this.checkWordStatus(this.clues[i]);	
		var statusNew = this.checkWordStatus(this.clues[i]);	  
		
		if (status.isComplete){
			
			selectedWord = statusNew.buf; // Save the answer in "selectedWord" variable which is currently given to check.
			
			checked++;
			this.checks++; 
			this.deducts += this.getDeductionForCheck(this.clues[i]);			
			if (status.wrong == 0){				 
				this.showAnswer(this.clues[i], 1);	
				
				this.score += this.getScoreForMatch(this.clues[i]); //--------------------------------------------------- User score calculation---------------------------------------

				temp_score = this.getScoreForMatch(this.clues[i]);


			//	alert("Score: "+this.score);
				temp_WordLength = this.getScoreForMatch(this.clues[i]);
				
				
				temp_score = this.score;
			
			//temp_score = this.getScoreForMatch(this.clues[i]);
		//	alert("Temp_Score: "+temp_score);
				

				this.clues[i].matched = true;
				this.clues[i].revealed = false;	
				
				this.clues[i].matched_BanglaMeaning = false;
				this.clues[i].revealed_BanglaMeaning = true;
				
				selectedWord = statusNew.buf;
				
				correct++; 
				this.matches++;
			}
		} 
	}
		
	if  (checked == 0){
		this.footer.stateError("No complete words found!");
	}
	
	else 
	{
		
		this.footer.stateOk("Checked " + checked + ", " + correct + " matched!"); 
	}
}  
 
//reviewed 
oyCrosswordMenu.prototype.checkWord = function(clue){
	var status = this.checkWordStatus(clue);	  
	if (!status.isComplete){
		this.footer.stateError("The word [" + status.buf + "] is incomplete!");
	} 
	else 
	{ 
		this.checks++; 
		this.deducts += this.getDeductionForCheck(clue);			
		if (status.wrong != 0)
		{		  
			this.footer.stateError("[" + status.buf + "] didn't match!");
		} 
		else 
		{ 
			this.matches++;  // Number of word matches by user
			this.showAnswer(clue, 1);	 	
			
			this.score += this.getScoreForMatch(clue); //-------------------------------------- User score calculation---------------------------------------

			temp_score = this.getScoreForMatch(clue);


		//	alert(this.score);
			
			temp_WordLength = this.getScoreForMatch(clue);
			
			temp_score = this.score;
			
		//	this.temp_score = this.getScoreForMatch(clue);
		//	alert(temp_score);
			

			clue.revealed = false; 	
			clue.matched = true; 	
			
			clue.matched_BanglaMeaning = false;
			clue.revealed_BanglaMeaning = true;
			
			selectedWord = status.buf; // Save the answer in "selectedWord" variable which is currently given to check.
			
			this.footer.stateOk("[" + status.buf + "] matched!");
		}
	}
}


//return object of a specific clue to get details of that object(Ex: wordid,synsetid etc..)
function getAnswerObject (clue)
{
	//alert("1");
	for(var i=0;i<arr.length;i++)
	{
		//alert(arr[i].answer);
		if(arr[i].answer == clue.toLowerCase())
			return arr[i];
	}
}

oyCrosswordMenu.prototype.submitScore = function(){
	if (this.matches == 0){   
		this.footer.stateError("Nothing to submit yet!");
		alert("Nothing to submit yet!\nUncover some words first.");
	} else {		  
		var ms = new Date().getTime() - this.puzz.menu.startOn.getTime();
		this.server.submitScore(
			this, this.puzz.uid, 
			this.score, this.deducts, this.checks, this.reveals, this.matches,
			ms, this.name,
			this.puzz.clues
		); 
		this.footer.stateBusy("Submitting score...");
	}
}

//################################################## Mehedi Starts ################################################################

//Clear prompt text area
function cancel(){
     document.getElementById('bm').value = "";
}

//oyCrosswordMenu.prototype.addAction2 = function(target, caption, hint, track, lambda){
oyCrosswordMenu.prototype.addAction2 = function(target, caption, hint, track, lambda){
	
	//alert("AddAction2");
	caption = caption.replace(" ", "&nbsp;");
	
	var elem = document.createElement("SPAN");
	elem.innerHTML = " &nbsp; ";	
	target.appendChild(elem);	

	var elem = document.createElement("A");
	elem.innerHTML = caption;	
	elem.href = "javascript:void(0);";
	elem.name= "demo";				 	
	if (!lambda)
	{
	//	alert("addAction2 IF block without lamda Value");
		elem.className = "oyMenuActionDis";
		elem.onclick = function(){
			return false;
		}		
	} 
	else 
	{
	//	alert("addAction2 ELSE block with lamda Value");
		elem.className = "oyMenuAction"; 		
		var oThis = this;
		elem.onclick = function(){

			/*########################### Avro Plugin  #######################################*/


			$(function(){
			
				$("a[name=demo]").on("click", function () {
					$('#banglaInputBoxId').bPopup({
						//appendTo: 'form',
						zIndex: 2,
						modalClose: false,
						closeClass: 'b-close',
						easing: 'easeOutBack',
						speed: 450,
						transition: 'slideDown',
						escClose: true
					}); 
				});				
				
				$('textarea, input[type=text]').avro();
<<<<<<< HEAD
				var value = $(".banglaMeaning").val();
				
/*				if(value != null)
					this.score += temp_score;
				
				console.log(value);
				console.log(parseInt(score));
				console.log(temp_score);*/
				//alert(temp_score);


			//	var value = $(".banglaMeaning").val();				
		
				cancel();

							
			}); 


	/*##################################################################*/

			oThis.footer.stateBusy(hint);
			setTimeout(
				function(){				
					lambda(); 
					oThis.server.trackAction(oThis.puzz.uid, track);
				}, 100
			); 
			return false;
		}		
	}
	
	target.appendChild(elem);	
}

function submitBanglaMeaning()
{
	
		var value = $(".banglaMeaning").val();
		//alert(value);

		var meaning = $("#bm").val();

		$.ajax({

		type: 'POST',
		url: './oy-cword-1.0/js/process.php',
		data: {text:meaning},
		success: function(response){
		$('#result').html(response);
		}

		});;
			
/*	$('btn_ok').click( function(){
	
		var meaning = $("#bm").val();
		alert(meaning);
		
		$.ajax({
		
			type: 'POST',
			url: 'process.php',
			data: {text:meaning},
			success: function(response){			
				$('#result').html(response);			
			}
		
		}); 
	
	}); */
}

	var value = $(".banglaMeaning").val();
	//alert(selectedWord);
	
	var clueObject = getAnswerObject(selectedWord);
	
	//alert(clueObject.answer + " " + selectedWord);
	var meaning = $("#bm").val();
	$.ajax({

			type: 'POST',
			url: './oy-cword-1.0/js/process.php',	
				
			data: {
					banglaWord:meaning,
					wordId:clueObject.wordid,
					synsetId:clueObject.synsetid
				},
				
			success: function(response){
			$('#result').html(response);
			}
		});
		
	//	totalScore = getTotalScore();
		
		if(meaning != null)
			temp_score += temp_WordLength;
			
			$('#hiddenField').val(temp_score);
		//update2(temp_score);
				
		
	//	alert("Score_OK: "+ temp_score);
		alert(meaning);
		
	//	alert("Temp Score_OK: "+temp_score);
		//alert(temp_score);
			
}

var cnt=0;

// Save every words (which creates the grid) object(to get details of a particular word like wordid,synsetid etc.) in a array
function getClueObject(clueObject)
{
	//alert(clueObject.answer);
	this.arr.push(clueObject);
	//alert( arr[cnt++].wordid);
	
}

oyCrosswordMenu.prototype.addNoneWordAction_BanglaMeaning = function(target, caption){
	var elem = document.createElement("SPAN");
	elem.className = "oyMenuActionNone";
	elem.innerHTML = caption;	
	target.appendChild(elem);	
	
	var elem = document.createElement("SPAN");
	elem.innerHTML = " ";	
	target.appendChild(elem);		
}


oyCrosswordMenu.prototype.addRevealWordAction_BanglaMeaning = function(clue, target, caption){
	var oThis = this;	
	
	this.addAction2(target, caption, "Meaning...", "mng",
		function(){			
			
			oThis.provideWordInput(clue);
			oThis.bengaliMeaningInput();						
			oThis.invalidateMenu();
		//	oThis.provideWordInput(clue);			
		//	oThis.invalidateMenu();		
			return false; 
		}
	); 
	
} 



// Pop Up Window for Providing Bangla Meaning
oyCrosswordMenu.prototype.provideWordInput = function(clue){
/*	this.deducts += this.getDeductsForReveal(clue);	
	this.reveals++; 
	this.showAnswer(clue, 2);	  	 
*/	
	clue.revealed_BanglaMeaning = true; 	
	//clue.matched_BanglaMeaning = true; 	
 
	var status = this.checkWordStatus(clue);	  	
	this.footer.stateOk("Meaning of  [" + status.buf + "]!");


} 
//################################################## Mehedi End ################################################################  
