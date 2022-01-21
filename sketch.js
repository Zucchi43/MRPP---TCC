let robot_speed = 5;
let width = 1200; //TAMANHO HORIZONTAL DO MAPA
let height = 1200; //TAMANHO VERTICAL DO MAPA
let cols = 50; // COLUNAS PARA DIVISÃO DO MAPA EM CELULAS
let rows = 50;
let num_robots = 10;
let grid = [];
let checkbox;
//COORDENADAS PARA TESTE HARDCODE
let coords_test = [
	[3, 0],
	[3, 3],
	[25, 3],
	[25, 15],
	[10, 15],
	[3, 15],
	[3, 3],
	[3, 0],
	[0, 0]
];
let i = 0;
var r = [];

function removeFromArray(arr, elt) {
	// Could use indexOf here instead to be more efficient
	for (var i = arr.length - 1; i >= 0; i--) {
		if (arr[i] == elt) {
			arr.splice(i, 1);
		}
	}
}

function heuristic(a, b) {
	var d = dist(a.i, a.j, b.i, b.j);
	// var d = abs(a.i - b.i) + abs(a.j - b.j);
	return d;
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
		rect(this.x, this.y, width / cols, height / rows)

	}
	this.pegarVizinhos = function (grid) {
		//ESQUERDO
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

	this.reset = function () {
		this.g = Math.infinity;
		this.pai = undefined;
		this.visited = false;
	}





}

function RandomValidCell(grid) {

	let Cell_try = grid[Math.floor(Math.random() * cols)][Math.floor(Math.random() * rows)]
	if (!Cell_try.vizinhos[0]) Cell_try.pegarVizinhos(grid);
	//CONSERTAR PARA O CASO DA CELULA ESTAR NA BEIRADA E NAO POSSUIR ALGUM DOS VIZINHOS
	if (Cell_try.state != 1) { //&& (Cell_try.vizinhos[0].state !=1  || Cell_try.vizinhos[1].state !=1  || Cell_try.vizinhos[2].state !=1  || Cell_try.vizinhos[3].state != 1  ) ){
		return Cell_try;
	}
	return RandomValidCell(grid);

}


function setup() {
	//INTERFACE: BOTAO
	button = createButton('START/STOP');
	button.position(width + 20, 10);
	button.size(100, 50);
	button.mousePressed(Start_Stop_Simu);

	//INTERFACE : SLIDER DE FRAMERATE	  
	slider = createSlider(1, 60, 15, 1);
	slider.position(width + 20, 80);
	slider.style('width', '360px');
	slider.size(100, 20);

	//INTERFACE: MODO STEP
	checkbox = createCheckbox('STEP_MODE', false);
	checkbox.position(width + 20, 150);
	checkbox.size(100, 50);
	checkbox.changed(STEP_CHANGED);



	//2d Array for the map grid
	for (let j = 0; j < cols; j++) {
		grid.push(new Array(rows));
	}
	//creating the cell object for each space
	for (let j = 0; j < cols; j++) {
		for (let k = 0; k < rows; k++) {
			grid[j][k] = new Cell(j, k, (Math.random() > 0.8) ? 1 : 0);
		}
	}
	for (let k = 0; k < num_robots; k++) {
		r.push(new robot()); // ROBO/CARRINHO
		console.log(k);
		r[k].caminho = Dijkstra(grid, RandomValidCell(grid), RandomValidCell(grid));
		r[k].x = r[k].caminho[r[k].caminho.length - 1].x;
		r[k].y = r[k].caminho[r[k].caminho.length - 1].y;
	}



	createCanvas(width * 2, height * 2);
}

function draw() {
	frameRate(slider.value());
	background(255);
	stroke(0);
	fill(0);
	let m = millis();
	textSize(48);
	text(int(m / (1000 * 60)) + "min :" + int(m / 1000 % 60) + "seg", 20, height + 50); //TIMER
	text("FRAMERATE: " + slider.value(), width - 100, height + 50); //FRAMERATE
	translate(0, height);
	scale(1, -1);


	//GOTO COORDENADAS DE TESTE
	for (let i = 0; i < num_robots; i++) {


		//console.log(i)
		if (r[i].goto(r[i].caminho[r[i].caminho.length - 1 - r[i].cnt].x, r[i].caminho[r[i].caminho.length - 1 - r[i].cnt].y)) {

			if (r[i].cnt == r[i].caminho.length - 1) {
				r[i].cnt = 0;
				//console.log(r[i].caminho);
				r[i].caminho[0].state = 0;
				r[i].caminho = Dijkstra(grid, grid[r[i].caminho[0].i][r[i].caminho[0].j], RandomValidCell(grid));
				//r[i].caminho = Dijkstra(grid,r[i].caminho[0],grid[Math.floor(Math.random()*cols)][Math.floor(Math.random()*rows)]);
			}
			if (r[i].cnt < r[i].caminho.length - 1) r[i].cnt++;
		}
	}




	//DISPLAY O GRID
	for (let j = 0; j < cols; j++) {
		for (let k = 0; k < rows; k++) {
			grid[j][k].show();
		}
	}
	//DISPLAY O CARRINHO
	for (let i = 0; i < num_robots; i++) {
		r[i].update();
		r[i].show();
	}
	//DISPLAY TIMER




}

//FUNÇÂO DE INTERFACE BOTAO
function Start_Stop_Simu() {
	if (isLooping()) noLoop();
	else loop()

}

function STEP_CHANGED() {
	if (checkbox.checked()) noLoop();
	else loop();
}


function mousePressed() {
	if (checkbox.checked()) redraw();
}




/* 1 -Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.

2-Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[15]

3-For the current node, consider all of its unvisited neighbours and calculate their tentative distances[Note 1] through the current node. Compare the newly calculated tentative distance to the current assigned value and assign the smaller one. For example, if the current node A is marked with a distance of 6, and the edge connecting it with a neighbour B has length 2, then the distance to B through A will be 6 + 2 = 8. If B was previously marked with a distance greater than 8 then change it to 8. Otherwise, the current value will be kept.

4-When we are done considering all of the unvisited neighbours of the current node, mark the current node as visited and remove it from the unvisited set. A visited node will never be checked again.

5-If the destination node has been marked visited (when planning a route between two specific nodes) or if the smallest tentative distance among the nodes in the unvisited set is infinity (when planning a complete traversal; occurs when there is no connection between the initial node and remaining unvisited nodes), then stop. The algorithm has finished.

6-Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new "current node", and go back to step 3 */

function Dijkstra(grid, start, end) {
	i = 0;
	start.g = 0;
	start.state = 0;
	end.state = 2;
	var OpenSet = [];
	OpenSet.push(start);
	var ClosedSet = [];
	var winner = 0;
	//console.log(end)
	while (OpenSet.length > 0) {

		for (let i = 0; i < OpenSet.length; i++) {
			var lowest = 0;
			if (OpenSet[i].f < lowest) {
				lowest = OpenSet[i].f
				winner = i;
			}
		}
		var atual = OpenSet[i];
		if (atual == end) {
			//STOP and return path
			end.state = 2;
			//console.log("VICTORY ROYALE")
			var path = []
			var temp = atual;
			path.push(temp);
			while (temp.pai) {
				path.push(temp.pai);
				temp = temp.pai
			}

			for (let j = 0; j < cols; j++) {
				for (let k = 0; k < rows; k++) {
					grid[j][k].reset();
				}
			}
			return path;
		}
		//RETIRAR O ATUAL DO OPENSET
		removeFromArray(OpenSet, atual);
		ClosedSet.push(atual);
		//PEGAR OS VIZINHOS DO ATUAL
		if (!atual.vizinhos[0]) atual.pegarVizinhos(grid);
		var vizinhos = atual.vizinhos;
		for (let i = 0; i < vizinhos.length; i++) {
			var vizinho = vizinhos[i];

			if (!ClosedSet.includes(vizinho) && (vizinho.state == 0 || vizinho.state == 2)) { //incluir aqui os obstaculos
				var tempg = atual.g + heuristic(vizinho, atual);

				//new better path
				var newPath = false;
				if (OpenSet.includes(vizinho)) {
					if (tempg < vizinho.g) {
						vizinho.g = tempg;
						newPath = true;
						OpenSet.push(vizinho);
					}
				} else {
					vizinho.g = tempg;
					newPath = true;
					OpenSet.push(vizinho);
				}
				if (newPath) {
					vizinho.h = heuristic(vizinho, end);
					vizinho.f = vizinho.g + vizinho.h;
					vizinho.pai = atual;
				}
			}


		}

		//console.log("TA INDO");
	}
	var path = []
	var temp = atual;
	while (temp.pai) {
		path.push(temp.pai);
		temp = temp.pai
	}
	for (let j = 0; j < cols; j++) {
		for (let k = 0; k < rows; k++) {
			grid[j][k].reset();
		}
	}
	return path;
}