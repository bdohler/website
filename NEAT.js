var specimen

function applySolution(input) {
	//This function is dependant on the game being played.
	//This means it is required to interpret the input nodes.
	var output = [];
	if(input[8][12].ball) {
		output[0] = true;
	}
	return output;
}

function NEAT(inputs, inputsLength, inputsWidth, outputs, fitness) {

var genome = []
var gene = {
	innovationNumber : -1,
	startNode: -1,
	endNode: -1,
	enabled: false,
	weight: 0
}

function mutate() {
	//TODO
}

function addConnection() {
	//TODO: In the add connection mutation, a single new connection gene with a random weight is added connecting two previously unconnected nodes.
}

function addNode() {
	//TODO: In the add node mutation, an existing connection is split and the new node placed where the old connection used to be. The old connection is disabled and two new connections are added to the genome.
	//TODO: The new connection leading into the new node receives a weight of 1, and the new connection leading out receives the same weight as the old connection.
}
}