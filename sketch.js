//MAP VARIABLES
let width = 1200; //TAMANHO HORIZONTAL DO MAPA
let height = 1200; //TAMANHO VERTICAL DO MAPA
let cols = 50; // COLUNAS PARA DIVISÃO DO MAPA EM CELULAS
let rows = 50;
let grid = [];
let OBS_RATIO = 0.8;
let canvas;

//ROBOTS VARIABLES
let num_robots = 20;
let robots_locations = new Array(num_robots);
let checkbox;

//SIMU VARIABLES
let colisao = true;
let i = 0;

//CONTROL AND OBSERVE VARIABLES
let timer = 0;
let millisec = 0;
let score = 0;
let Simulation_Control = false;
let Simulation_Start_Time = 0;
let Simulation_Collect_Time = 0;
let Data_Array = [];


function setup() {
	noLoop();

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
	checkbox = createCheckbox('STEP_MODE', true);
	checkbox.position(width + 20, 150);
	checkbox.size(100, 50);
	checkbox.changed(STEP_CHANGED);

	//INTERFACE RESET
	var Reset_Button = createButton("Reset");
	Reset_Button.position(width + 20, 200);
	Reset_Button.size(100, 50);
	Reset_Button.mousePressed(Reset);

	//INTERFACE: SIMULACAO
	Simulation_Button = createButton('START SIMULATION');
	Simulation_Button.position(width + 20, 280);
	Simulation_Button.size(100, 50);
	Simulation_Button.mousePressed(Simulation);

	//INTERFACE: ALGORITMO
	Alg_Selec = createSelect();
	Alg_Selec.position(width + 20, 350);
	Alg_Selec.size(150, 50);
	Alg_Selec.option("RANDOM WALK");
	Alg_Selec.option("NO COLLISION");

	Alg_Selec.changed(Alg_Selec_Changed);

	try {
		Reset();
	} catch (err) {
		Reset();
	}
	canvas = createCanvas(width * 2, height * 2);
}

function draw() {
	let last_place = 0;
	frameRate(slider.value());
	background(255);
	stroke(0);
	fill(0);
	millisec = millis() - timer;
	textSize(48);
	text(int(millisec / (1000 * 60) % 60) + "min :" + int(millisec / 1000 % 60) + "seg", 20, height + 50); //TIMER
	text("FRAMERATE: " + slider.value(), width - 100, height + 50); //FRAMERATE
	text("SCORE:" + int(score) + " POINTS", width / 2, height + 50); //FRAMERATE
	translate(0, height);
	scale(1, -1);

	//GOTO COORDENADAS DE TESTE
	for (let i = 0; i < num_robots; i++) {
		if (!Iminent_Collision(i)) {
			if (r[i].goto(r[i].caminho[r[i].caminho.length - 1 - r[i].cnt].x, r[i].caminho[r[i].caminho.length - 1 - r[i].cnt].y)) {
				last_place = 1;
				robots_locations[i] = (r[i].caminho[r[i].caminho.length - 1 - r[i].cnt]);

				if (r[i].cnt == r[i].caminho.length - 1) {
					r[i].cnt = 0;
					score = score + 1 / frameRate();
					r[i].caminho[0].state = 0;
					r[i].caminho = A_STAR(grid, grid[r[i].caminho[0].i][r[i].caminho[0].j], RandomValidCell(grid), i);

				}


				if (r[i].cnt < r[i].caminho.length - 1) r[i].cnt++;

			}
		} else if (Alg_Selec.value() == "RANDOM WALK") {
			//ROBOTS STILL SWITCHING PLACES
			//1- RANDOM WALK TO A VALID CELL
			let vizinhos;
			let counting = 0;
			if (r[i].cnt != 0) {
				vizinhos = r[i].caminho[r[i].caminho.length - r[i].cnt].vizinhos;
			}
			let vizinho_valido;
			if (vizinhos) {
				vizinho_valido = robots_locations[i];
				while (vizinho_valido.state == 1 || is_in_Array(vizinho_valido, robots_locations)) {
					if (vizinhos) vizinho_valido = random(vizinhos);
					if (counting > 5) {
						break;
					}
					counting++;
				}
				if (vizinho_valido.state != 1 && !is_in_Array(vizinho_valido, robots_locations)) {
					r[i].goto(vizinho_valido.x, vizinho_valido.y);
					last_place = 2

					//2- RUN A_STAR WITH NEW BEGGINING AND SAME ENDING
					robots_locations[i] = vizinho_valido;
					r[i].caminho = A_STAR(grid, robots_locations[i], r[i].caminho[0], i);
					r[i].cnt = 0;
				}
			}
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
		r[i].show();

	}

	//SIMULATION ROUTINE
	if (Simulation_Control) {
		if (millis() - Simulation_Start_Time > 1000 * 60) { //1000 -> 1 segundo
			Simulation()
			Data_Array = [];
		}
		if ((millis() - Simulation_Collect_Time) > 1000) {
			Simulation_Collect_Time = millis();
			//HERE IT COLLECTS AND ADDS TO AN ARRAY
			Data_Array.push([millisec, score])
		}

	}

}


/*---------------------------------------------------------------------------------------------------------

										FUNÇÕES GERAIS DA SIMULAÇÃO
---------------------------------------------------------------------------------------------------------*/

//FUNÇÃO RESET. TAMBÉM INICIALIZA O SISTEMA
function Reset() {
	timer = millis();
	millisec = 0;
	score = 0;
	grid = [];
	i = 0;
	r = [];
	robots_locations = new Array(num_robots);

	//2d Array for the map grid
	for (let j = 0; j < cols; j++) {
		grid.push(new Array(rows));
	}
	//creating the cell object for each space
	for (let j = 0; j < cols; j++) {
		for (let k = 0; k < rows; k++) {
			grid[j][k] = new Cell(j, k, (Math.random() > OBS_RATIO) ? 1 : 0);
		}
	}
	//PEGAR TODOS OS VIZINHOS
	for (let j = 0; j < cols; j++) {
		for (let k = 0; k < rows; k++) {
			grid[j][k].pegarVizinhos(grid);
		}
	}
	//CRIAR E INICIALIZAR OS ROBOS
	for (let k = 0; k < num_robots; k++) {
		r.push(new robot(k)); // ROBO/CARRINHO
		r[k].caminho = A_STAR(grid, RandomValidCell(grid), RandomValidCell(grid), i);
		r[k].x = r[k].caminho[r[k].caminho.length - 1].x;
		r[k].y = r[k].caminho[r[k].caminho.length - 1].y;
		robots_locations[k] = r[k].caminho[r[k].caminho.length];
	}
}

//FUNÇÃO DE FINALIZAÇÃO E INICIALIZAÇÃO DA COLETA DE DADOS DA SIMULAÇÃO
function Simulation() {

	if (!Simulation_Control) {
		console.log("Simualtion Started");
		score = 0;
		Simulation_Start_Time = millis();
		Simulation_Collect_Time = millis();
	} else {
		console.log("Simualtion Ended");
		console.log(Data_Array);
		let filename = str(day()) + "_" + str(hour()) + "_" + str(minute()) + str(Alg_Selec.value());
		export_csv(["Time", "Score"], Data_Array, ',', filename)
		saveCanvas(canvas, filename, 'jpg')
		Simulation_Start_Time = 0;
		Simulation_Collect_Time = 0;

	}

	Simulation_Control = !Simulation_Control;
}





//REMOVER ELEMENTO ELT DE UM ARRAY ARR
function removeFromArray(arr, elt) {
	// Could use indexOf here instead to be more efficient
	for (var i = arr.length - 1; i >= 0; i--) {
		if (arr[i] == elt) {
			arr.splice(i, 1);
		}
	}
}

//FUNÇÃO HEURISTICA PARA DISTANCIA ENTRE CELULAS
function heuristic(a, b) {
	var d = dist(a.i, a.j, b.i, b.j);
	return d;
}

//FUNÇÃO DEBUG PARA VERIFICAR SE DOIS ROBOS OCUPARAM O MESMO LUGAR
function Same_place(i) {
	for (let j = 0; j < num_robots; j++) {
		for (let k = 0; k < num_robots; k++) {
			if (r[j].x == r[k].x && r[j].y == r[k].y && k != j) {
				noLoop();
				console.log("MESMO LUGAR");
				console.log(j);
				console.log(k);
				console.log("FOI AQUI");
				console.log(i);
			}
		}
	}
}

//FUNÇAO DE VERIFICACAO DE UM ELEMENTO NO ARRAY
function is_in_Array(Elemento, Arr) {
	if (Arr) {
		for (let i = 0; i < Arr.length; i++) {
			if (Elemento == Arr[i]) return true;
		}
	}
	return false;
}
//FUNCAO DE SELECIONAR UMA CELULA ALEATORIA NAO OCUPADA
function RandomValidCell(grid) {

	let Cell_try = grid[Math.floor(Math.random() * cols)][Math.floor(Math.random() * rows)]
	if (!Cell_try.vizinhos[0]) Cell_try.pegarVizinhos(grid);
	//CONSERTAR PARA O CASO DA CELULA ESTAR NA BEIRADA E NAO POSSUIR ALGUM DOS VIZINHOS
	if (Cell_try.state == 0 && !is_in_Array(Cell_try, robots_locations)) { //&& (Cell_try.vizinhos[0].state !=1  || Cell_try.vizinhos[1].state !=1  || Cell_try.vizinhos[2].state !=1  || Cell_try.vizinhos[3].state != 1  ) ){
		return Cell_try;
	}
	return RandomValidCell(grid);

}

//FUNÇÂO DE INTERFACE BOTAO
function Start_Stop_Simu() {
	if (isLooping()) noLoop();
	else {
		timer = millis() - millisec;
		loop()
	}
}

//FUNÇÃO STEP CHECKBOX
function STEP_CHANGED() {
	if (checkbox.checked()) noLoop();
	else loop();
}

//FUNÇÃO DE SELECAO DE ALGORITMO
function Alg_Selec_Changed() {
	if (Alg_Selec.value() !== "NO COLLISION") colisao = true
	else colisao = false;
	score = 0;
}

//FUNÇÃO DE AVANÇAR STEP COM O MOUSE
function mousePressed() {
	if (checkbox.checked() && mouseX < width && mouseY < height) redraw();
}

//FUNÇÂO DE PREVISAO DE COLISAO
function Iminent_Collision(Current_Robot) {
	for (let i = 0; i < num_robots; i++) {
		//CHECK IF PREVIOUS AND FOLLOWING ROBOTS WILL MOVE TO THE SAME PLACE AS ME IN THEIR NEXT TURN
		if (i != Current_Robot) {
			if (r[Current_Robot].caminho[r[Current_Robot].caminho.length - 1 - r[Current_Robot].cnt] == robots_locations[i]) {
				return colisao;
			}
		}
	}
	r[Current_Robot].blocked = false;
	return false;
}

//FUNÇÃO DE EXPORTAÇÃO DE CSV
const export_csv = (arrayHeader, arrayData, delimiter, fileName) => {
	let header = arrayHeader.join(delimiter) + '\n';
	let csv = header;
	arrayData.forEach(array => {
		csv += array.join(delimiter) + "\n";
	});

	let csvData = new Blob([csv], {
		type: 'text/csv'
	});
	let csvUrl = URL.createObjectURL(csvData);
	let hiddenElement = document.createElement('a');
	hiddenElement.href = csvUrl;
	hiddenElement.target = '_blank';
	hiddenElement.download = fileName + '.csv';
	hiddenElement.click();
}

/*---------------------------------------------------------------------------------------------------------

										ALGORITMO A_STAR
---------------------------------------------------------------------------------------------------------*/


/* 1 -Mark all nodes unvisited. Create a set of all the unvisited nodes called the unvisited set.

2-Assign to every node a tentative distance value: set it to zero for our initial node and to infinity for all other nodes. Set the initial node as current.[15]

3-For the current node, consider all of its unvisited neighbours and calculate their tentative distances[Note 1] through the current node. Compare the newly calculated tentative distance to the current assigned value and assign the smaller one. For example, if the current node A is marked with a distance of 6, and the edge connecting it with a neighbour B has length 2, then the distance to B through A will be 6 + 2 = 8. If B was previously marked with a distance greater than 8 then change it to 8. Otherwise, the current value will be kept.

4-When we are done considering all of the unvisited neighbours of the current node, mark the current node as visited and remove it from the unvisited set. A visited node will never be checked again.

5-If the destination node has been marked visited (when planning a route between two specific nodes) or if the smallest tentative distance among the nodes in the unvisited set is infinity (when planning a complete traversal; occurs when there is no connection between the initial node and remaining unvisited nodes), then stop. The algorithm has finished.

6-Otherwise, select the unvisited node that is marked with the smallest tentative distance, set it as the new "current node", and go back to step 3 */

function A_STAR(grid, start, end, robot) {
	i = 0;
	start.g = 0;
	start.state = 0;
	end.state = 2;
	end.target = robot;
	var OpenSet = [];
	OpenSet.push(start);
	var ClosedSet = [];
	var winner = 0;
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

/*---------------------------------------------------------------------------------------------------------

										CLASSES DOS ROBÔS E CÉLULAS
---------------------------------------------------------------------------------------------------------*/

function robot(number) {
	this.x = 0;
	this.y = 0;
	this.speed_x = 0;
	this.speed_y = 0;
	this.caminho = [];
	this.cnt = 0;
	this.dir = 0;
	this.number = number;
	this.blocked = false;
	this.color = Math.floor(random(255));

	//DIPLSY ROBOS NA POSIÇÃO ATUAL
	this.show = function () {
		fill(this.color);
		rect(this.x, this.y, width / cols, height / rows);
		fill(0);
	}

	//FUNÇÃO DE MOVIMENTAÇÃO DOS ROBOS
	this.goto = function (x, y) {
		if (x > this.x) {
			this.x += width / cols;
		} else if (x < this.x) {
			this.x += -width / cols;
		} else {
			this.speed_x = 0;
		}
		if (y > this.y) {
			this.y += height / rows;
		} else if (y < this.y) {
			this.y += -height / rows;
		} else {
			this.speed_y = 0;
		}

		if (this.x == x && this.y == y) {
			return true;
		} else return false;
	}
}

//CLASSE DA CELULA
//OBJETO DA CELULA. F,H,G VARIAVEIS PARA ALGORITMO A_STAR
//STATE 0 -> VERDE LIVRE
//STATE 1 -> VERMELHO OBSTACULO
//STATE 2 -> OBJETIVO

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



/*TENTATIVA DE REALIZAR PLANEJAMENTO BRUTO DE ESPAÇO-TEMPO - NÃO FUNCIONAL
function A_Space_Time(grid, start, end, robot , blocked) {
	i = 0;
	start.g = 0;
	start.state = 0;
	end.state = 2;
	end.target = robot;
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
			
			for (let i =0; i< path.length ; i++){
				if(!is_in_Array(path[path.lenght - 1 - i], Space_Time_Array[i])) {
					//blocked.push(path[path.lenght - 1 - i])
					//return  A_Space_Time(grid, start, end, robot , blocked)
				}
			}
			Add_To_SpaceTime(path, robot.number);
			return path;
		}
		//RETIRAR O ATUAL DO OPENSET
		removeFromArray(OpenSet, atual);
		ClosedSet.push(atual);
		//PEGAR OS VIZINHOS DO ATUAL
		var vizinhos = atual.vizinhos;

		for (let i = 0; i < vizinhos.length; i++) {
			var vizinho = vizinhos[i];

			if (!ClosedSet.includes(vizinho) && (vizinho.state !== 1) && (!is_in_Array(vizinho, blocked) ) ) { //incluir aqui os obstaculos
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
	//Add_To_SpaceTime(path, robot.number);
	return path;
}

function Add_To_SpaceTime(PATH, robot_num) {
	//ARRAY [TIME][SPACE]

	//INVERT THE PATH 
	let temp = [];
	for (let i = PATH.length - 1; i >= 0; i--) {
		temp.push(PATH[i]);
	}

	//IF THE TIME DOENST EXIST IN THE ARRAY PUSH A NEW ARRAY (NumRobots)
	//IF THERE IS THE TIME IN THE ARRAY JUST ADD THE SPACE (robotnum) IN IT
	for (let i = 0; i < temp.length; i++) {
		if (!Space_Time_Array[i]) Space_Time_Array.push(new Array(num_robots));
		Space_Time_Array[i][robot_num] = temp[i];
	}
}


//DADO UMA CELULA (ATUAL) VERIFICAR QUANTOS PAI a celula tem até chegar em (START)
function Geneologic_Tree(Atual, Start) {
	let counter = 0;

	let temp = Atual;
	while (temp !== Start) {
		temp = temp.pai;
		counter++;
	}
	return counter;
}
*/