function robot(number) {
	this.x = 0;
	this.y = 0;
	this.speed_x = 0;
	this.speed_y = 0;
	this.caminho =[];
	this.cnt = 0;
	this.dir = 0;
    this.number = number;
    this.blocked = false;
	this.color =  Math.floor(random(255));
	
	this.update = function(){
		//this.x += this.speed_x;
		//this.y += this.speed_y;
		//this.speed_x += this.accel_x;
		//this.speed_y += this.accel_y;

	}
	this.show = function(){
		fill(this.color);
		rect(this.x,this.y,width/cols,height/rows);  
        fill(0);
       // text(this.number,this.x + width/cols/2,this.y+ height/rows/2 );
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





//OBJETO DA CELULA. F,H,G VARIAVEIS PARA ALGORITMO?
//STATE 0 -> VERDE LIVRE
//STATE 1 -> VERMELHO OBSTACULO

function Cell(i, j, state) {
	this.x = width / cols * i;
	this.y = height / rows * j;
	this.i = i;
	this.j = j;
	this.f = 0;
	this.h = 0;
	this.g = Math.infinity;
	this.vizinhos = [];
	this.state = state
	this.pai = undefined;
	this.visited = false;
	this.target = 0;
	this.show = function () {
		//rectMode(CENTER);
		switch (this.state) {
			case 0:
				fill(0, 255, 0);
				break;
			case 1:
				fill(255, 0, 0);
				break;
			case 2:
				fill(255, 255, 0);
				break;
		}
		rect(this.x, this.y, width / cols, height / rows);
		if (this.state == 2) {
			fill(0);
			//text(this.target, this.x + width / cols / 2, this.y + height / rows / 2);
		}

	}
	this.pegarVizinhos = function (grid) {
		//ESQUERDO
		if (this.vizinhos) {
			if (this.i > 0) {
				this.vizinhos.push(grid[this.i - 1][this.j])
			}
			//DIREITO
			if (this.i < grid.length - 1) {
				this.vizinhos.push(grid[this.i + 1][this.j])
			}
			//SUPERIOR
			if (this.j < rows - 1) {
				this.vizinhos.push(grid[this.i][this.j + 1])
			}
			//INFERIOR
			if (this.j > 0) {
				this.vizinhos.push(grid[this.i][this.j - 1])
			}
		}
	}

	this.reset = function () {
		this.g = Math.infinity;
		this.pai = undefined;
		this.visited = false;
	}

}