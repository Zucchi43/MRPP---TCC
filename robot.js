function robot() {
	this.x = 0;
	this.y = 0;
	this.speed_x = 0;
	this.speed_y = 0;
	this.accel_x = 0;
	this.accel_y = 0;
	this.caminho =[];
	this.cnt = 0;
	this.dir = 0;
	
	this.update = function(){
		//this.x += this.speed_x;
		//this.y += this.speed_y;
		//this.speed_x += this.accel_x;
		//this.speed_y += this.accel_y;

	}
	this.show = function(){
		fill(255);
		rect(this.x,this.y,width/cols,height/rows);
	}
	this.goto = function(x,y){
		if (x > this.x){
			this.x += width/cols;
		}
		else if(x < this.x){
			this.x +=  -width/cols;
		}
		else{
			this.speed_x = 0;
		}
		if (y > this.y){
			this.y += height/rows;
		}
		else if(y < this.y){
			this.y +=  -height/rows;
		}
		else{
			this.speed_y = 0;
		}

		if (this.x == x && this.y == y){
			return true;
		}
		else return false;
	}
}