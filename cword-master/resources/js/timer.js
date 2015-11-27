
    var amount=59;
    var i = parseInt($('#sec').val());
    var tim;
	var c=1;
	
	function run(){
			
	   tim = setInterval(function(){
			if(i>=amount){
					i=0;
					$('#min').val('0'+ c++); 
					return;}
	
					if($('#sec').val()<9)
					{
					$('#sec').val('0'+ ++i);
					}
					else
					{
					$('#sec').val(++i);   
					}
			},1000);        
		
		}

		run();
		
	
	
 /*
 var Timer = function(){
	
	this.seconds = 0 ;
	this.minutes = 0;
	this.interval;
	
	this.init = function(){
		
		this.seconds = 0;
		this.minutes = 0;
		
	};
	
	this.start = function(){
		
		this.tick();
        setInterval(this.start(),1000);		
	};
	
	this.tick = function(){
		
		this.seconds ++ ;
		
		console.log(this.seconds);
		
		if( this.seconds >= 60 )
		{
			this.seconds = 0 ;
			this.minutes ++ ; 
		}
		
		$("#sec").val( this.seconds < 10 ? "0"+this.seconds : this.seconds);
		$("#min").val(this.minutes < 10 ? "0"+this.seconds : this.seconds );
	};
	
	this.stop = function(){
		
	   clearInterval(this.interval);	
	};

};
*/