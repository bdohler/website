
var NEAT = (function (game, canvas, onInit) {

//TODO: Linearize inputs
var Inputs = 24*16+20*8+24+4+4*6; 
var Outputs = 2;
var pool;
var ctx = canvas.getContext("2d");

const bigPixelSize = 20;
const littlePixelSize = 10;
const inputWidth = 480/bigPixelSize;
const inputHeight = 320/bigPixelSize;

const Population = 20;
const DeltaDisjoint = 2.0;
const DeltaWeights = 0.4;
const DeltaThreshold = 1.0;
 
const StaleSpecies = 15;
 
const MutateConnectionsChance = 0.25;
const PerturbChance = 0.90;
const CrossoverChance = 0.75;
const LinkMutationChance = 2.0;
const NodeMutationChance = 0.50;
const BiasMutationChance = 0.40;
const StepSize = 0.1;
const DisableMutationChance = 0.4;
const EnableMutationChance = 0.2;
 
const TimeoutConstant = 20;
const MaxNodes = 50000;

function getBricks() {
    var bricks = [];
    for(c=0; c<game.columns; c++) {
        for(r=0; r<game.rows; r++) {
            
            bricks[bricks.length] = game.input[2*c+2][r+2].brick;
            bricks[bricks.length] = game.input[2*c+3][r+2].brick;
        } 
        if(onInit) {
        //console.log((2*c+2)+" "+(r+2));
        //console.log((2*c+3)+" "+(r+2));           
        }

    } 
    //console.log(bricks.length);
    return bricks;
}

function getPaddle() {
    var paddle = [];
    for(var c=0; c < inputWidth; c++) {
        paddle[c] = game.input[c][15].paddle;
    }
    //console.log("inputWidth: "+inputWidth);
    //console.log(paddle.length);
    return paddle;
}

function getVelocity() {
    var velocity = [];

    for( var c = 2; c <= 7; c++) {
        velocity[velocity.length] = game.input[1][c].velocity;
        velocity[velocity.length] = game.input[8][c].velocity;
        velocity[velocity.length] = game.input[c][1].velocity;
        velocity[velocity.length] = game.input[c][8].velocity;        
    }

    velocity[velocity.length] = game.input[2][2].velocity;
    velocity[velocity.length] = game.input[2][7].velocity;
    velocity[velocity.length] = game.input[7][2].velocity;
    velocity[velocity.length] = game.input[7][7].velocity;

    //onsole.log(velocity.length);
    return velocity;
}

function getBall() {
    var ball = [];
    for(var c = 0; c < inputWidth; c++) {
        for(var r = 0; r < inputHeight; r++) {
            ball[ball.length]=game.input[c][r].ball;
        }
    }
    //console.log(ball.length);
    return ball;
}

function getInputs() {
    var bricks = getBricks(); 
    var paddle = getPaddle();
    var velocity = getVelocity();
    var ball = getBall();
    var inputs = bricks.concat(paddle,velocity,ball);
    //console.log("Input array is:"+inputs);

    //Inputs = inputs.length;
    return inputs;
}

function getPointfromInputIndex(inputnumber) {

	var point = {};
	if(inputnumber < 160 && inputnumber >= 0) {
		point.x = 0;
		point.y = 0; 
	}
	else if(inputnumber >= 160 && inputnumber < 184) {
		point.x = 0;
		point.y = 20;
	}
	else if(inputnumber >= 184 && inputnumber < 212) {
		point.x = 0;
		point.y = 40;
	}
	else if(inputnumber >= 212 && inputnumber < Inputs) {
		point.x = 0;
		point.y = 60;
	}
	else {
		alert("Accessing input index for display which does not exist.");
	}
	return point;
}


function sigmoid (x) {
	return 2/(1+Math.exp(-4.9*x))-1;
}

function newInnovation() {
        pool.innovation++;
        return pool.innovation;
}

function newPool() {

        var pool = {};
        pool.species = [];
        pool.generation = 0;
        pool.innovation = Outputs;
        pool.currentSpecies = 0;
        pool.currentGenome = 0;
        //pool.currentFrame = 0;
        pool.maxFitness = 0;
        return pool;
}

function newSpecies() {

        var species = {};
        species.topFitness = 0;
        species.staleness = 0;
        species.genomes = [];
        species.averageFitness = 0;
        return species
}

function newGenome() {

	    var genome = {};
        genome.genes = [];
        genome.fitness = 0;
        genome.adjustedFitness = 0;
        genome.network = {};
        genome.maxneuron = 0;
        genome.globalRank = 0;
        genome.mutationRates = {};
        genome.mutationRates.connections = MutateConnectionsChance;
        genome.mutationRates.link = LinkMutationChance;
        genome.mutationRates.bias = BiasMutationChance;
        genome.mutationRates.node = NodeMutationChance;
        genome.mutationRates.enable = EnableMutationChance;
        genome.mutationRates.disable = DisableMutationChance;
        genome.mutationRates.step = StepSize;
        return genome;
}

function copyGenome(genome) {

        var genome2 = newGenome();
        for (g=0; g < genome.genes.length; g++) {
        	tableInsert(genome2.genes, copyGene(genome.genes[g]));
        }
        genome2.maxneuron = genome.maxneuron;
        genome2.mutationRates.connections = genome.mutationRates.connections;
        genome2.mutationRates.link = genome.mutationRates.link;
        genome2.mutationRates.bias = genome.mutationRates.bias;
        genome2.mutationRates.node = genome.mutationRates.node;
        genome2.mutationRates.enable = genome.mutationRates.enable;
        genome2.mutationRates.disable = genome.mutationRates.disable;
       
        return genome2;
}

function tableInsert(arr, position, value) {
	if(value == undefined) {
		arr.push(position);
	}
	else {
		arr.splice(position, 0, value);
	}
}

function basicGenome() {
        var genome = newGenome();
        //TODO: determine effect
        var innovation = 0;
        genome.maxneuron = Inputs;
        console.log("Mutating Genome");
        mutate(genome);
        console.log("Returning basicGenome");
        return genome;
}

function newGene() {
        var gene = {};
        gene.into = 0;
        gene.out = 0;
        gene.weight = 0.0;
        gene.enabled = true;
        gene.innovation = 0;
       
        return gene;
}

function copyGene(gene) {
        var gene2 = newGene();
        gene2.into = gene.into;
        gene2.out = gene.out;
        gene2.weight = gene.weight;
        gene2.enabled = gene.enabled;
        gene2.innovation = gene.innovation;
       
        return gene2;
}

function newNeuron() {
        var neuron = {};
        neuron.incoming = [];
        neuron.value = 0.0;
       
        return neuron
}

function generateNetwork(genome) {

		//console.log("Executing generateNetwork");
		//Generate the neural network for each genome
        var network = {};
        network.neurons = [];
       
       	//Create new neurons for all of the possible inputs
        for (var i=0; i < Inputs; i++) {
                network.neurons[i] = newNeuron();
        }
       
       	//Create new neurons for all of the outputs at indexes past the maximum number of Input && Hidden Hodes
        for (var o=0; o < Outputs; o++) {
        		network.neurons[MaxNodes+o] = newNeuron();
        }
       
       	//Sort the genome based on the order of the output of the genes. 
        tableSort(genome.genes, function (a,b) {
                return (a.out < b.out);
        });

        //Interate through the genome && build a neuron where required for each active genome.
        for (var i=0; i < genome.genes.length; i++) {
                var gene = genome.genes[i];
                if(gene.enabled) {
                        if (network.neurons[gene.out] == undefined) {
                                network.neurons[gene.out] = newNeuron();
                        }
                        var neuron = network.neurons[gene.out];
                        tableInsert(neuron.incoming, gene);
                        if (network.neurons[gene.into] == undefined) {
                        		network.neurons[gene.into] = newNeuron();
                        }              	
                }
        } 
        genome.network = network;
        //console.log("Generated network is: "+JSON.stringify(genome.network,null,4));
}

function tableSort(arr, compareFunction) {
 	arr.sort(compareFunction);
}

function evaluateNetwork(network, inputs) {
		// console.log("Running evaluateNetwork");
		// console.log("network is"+network.neurons);
		// //console.log("last output is:"+network.neurons[Inputs-1]);
		// console.log(JSON.stringify(network.neurons[Inputs-1], null, 4));
		// console.log(JSON.stringify(network.neurons[Inputs], null, 4));
  //      // tableInsert(inputs, 0);
        if (inputs.length != Inputs) {
        		console.log("Incorrect number of neural network inputs.");
                return {};
        }
        for (i=0; i < Inputs; i++) {
        		network.neurons[i].value = inputs[i];
        }

        //Iffy translation	
        var k = 0;
        while(network.neurons[k] !== undefined) {
        		var sum = 0;
        		var neuron = network.neurons[k]; //Especially iffy translation

        		for(var j = 0; j < neuron.incoming.length; j++) {
						var incoming = neuron.incoming[j];
						var other = network.neurons[incoming.into];
						sum = sum + incoming.weight*other.value;
				}
				if(neuron.incoming.length > 0) {
					neuron.value = sigmoid(sum);
				}
				k++;
        }
        var k = MaxNodes;
        while(network.neurons[k] !== undefined) {
        		if(k == MaxNodes) {
        			//console.log(JSON.stringify(network.neurons[k],null,4));	
        		}
        		var sum = 0;
        		var neuron = network.neurons[k]; //Especially iffy translation
        		for(var j = 0; j < neuron.incoming.length; j++) {
						var incoming = neuron.incoming[j];
						var other = network.neurons[incoming.into];
						sum = sum + incoming.weight*other.value;
				}
				if(neuron.incoming.length > 0) {
					neuron.value = sigmoid(sum);
				}
				k++;
        }
        //console.log("Output neuron values are:"+network.neurons[MaxNodes].value+" and "+network.neurons[MaxNodes].value);
        var outputs = [];
        for (var o=0; o < Outputs; o++) {
        		//Iffy translation
        		//var button = "P1 " .. ButtonNames[o]
        		//console.log(JSON.stringify(network.neurons[MaxNodes+o], null, 4));
        		//console.log(network.neurons[MaxNodes+o].value);
                if (network.neurons[MaxNodes+o].value > 0) {
                		outputs[o] = true;
                } 
                else {
                        outputs[o] = false;            	
                }

        } 

        return outputs;
}

function crossover(g1, g2) {
        // Make sure g1 is the higher fitness genome
        if (g2.fitness > g1.fitness) {
                tempg = g1;
                g1 = g2;
                g2 = tempg;
        }
 
        var child = newGenome();
       
        var innovations2 = [];
        for (var i=0; i < g2.genes.length; i++) {
                var gene = g2.genes[i];
                innovations2[gene.innovation] = gene;
        }
       
        for (var i=0; i < g1.genes.length; i++) {
                var gene1 = g1.genes[i];
                var gene2 = innovations2[gene1.innovation];
                if (gene2 !== undefined && Math.random(2) < 0.5 && gene2.enabled) {
                        tableInsert(child.genes, copyGene(gene2));
                }
                else {
                        tableInsert(child.genes, copyGene(gene1));                	
                }
        }

        child.maxneuron = Math.max(g1.maxneuron,g2.maxneuron);       	
       	//Iffy translation again
       	child.mutationRates = g1.mutationRates;
       
        return child;
}

function randomNeuron(genes, nonInput) {
	    var neurons = [];
	    console.log("NonInput: "+nonInput);
        if (!nonInput) {
        		for (var i=0; i < Inputs; i++) {
        				neurons[i] = true;
        		}
        }
        for (var o=0; o < Outputs; o++) {
        		neurons[MaxNodes+o] = true;
        }
        console.log("randomNeuron: Initialized inputs and outputs to true");


        for (var i=0; i < genes.length; i++) {
                if (!nonInput || genes[i].into > Inputs) {
                		neurons[genes[i].into] = true;
                }
                if (!nonInput || genes[i].out > Inputs) {
                        neurons[genes[i].out] = true;
                }
        }
 
        var count = 0
        var j = 0
        while(neurons[j] !== undefined) {
        		count++;
        		j++;
        }

        k = 0;
        while(neurons[MaxNodes+k] !== undefined) {
        		k++;
        		count++;
        }

        var n = randomIntFromInterval(0,count-1);
       	
       	if ( n < j ) {
       			console.log("Returning randomNeuron: returning an input or hidden node");
       			return n;
       	}

       	else if (n - j < k ) {
       			console.log("Returning randomNeuron: returning an output");
       			return MaxNodes + n - j;
       	}

       	console.log("randomNeuron function count failure"); {
       		return -1;
       	}
}

function randomIntFromInterval(min, max) {
    	return Math.floor(Math.random()*(max-min+1)+min);
}

function containsLink(genes, link) {
		for( var i = 0; i < genes.length; i++ ) {
				var gene = genes[i];
				if(gene.into == link.into && gene.out == link.out) {
						return true;
				}
		}
		return false;
}

function pointMutate(genome) {
		var step = genome.mutationRates.step;
		for( var i = 0; i < genome.genes.length; i++ ) {
				var gene = genome.genes[i];
				if(Math.random() < PerturbChance) {
						gene.weight = gene.weight + Math.random() * step*2 - step;
				}
				else {
					gene.weight = Math.random()*4-2;
				}
		}
}
        
function linkMutate(genome, forceBias) {
		console.log("Running linkMutate");
		
        var neuron1 = randomNeuron(genome.genes, false);
        var neuron2 = randomNeuron(genome.genes, true);
        
        var newLink = newGene();
        if ( neuron1 <= Inputs && neuron2 <= Inputs) {
                //Both input nodes
                console.log("Returning linkMutate: Both neurons are input nodes - Very likely");
                return;
        }
        if ( neuron2 <= Inputs ) {
                //Swap output and input
                var temp = neuron1;
                neuron1 = neuron2;
                neuron2 = temp;
        }
 
        newLink.into = neuron1;
        newLink.out = neuron2;
        if ( forceBias ) {
                newLink.into = Inputs;
        }
       
        if ( containsLink(genome.genes, newLink)) {
        		console.log("Returning linkMutate: Link already exists - very unlikely");
                return;
        }
        newLink.innovation = newInnovation();
        newLink.weight = Math.random()*4-2;
       
        tableInsert(genome.genes, newLink);	
        console.log("Returning linkMutate: added new link");
}

function nodeMutate(genome) {
        if (genome.genes.length == 0 ) {
                return;
        }
 
        genome.maxneuron = genome.maxneuron + 1;
 
        var gene = genome.genes[randomIntFromInterval(0,genome.genes.length-1)];
        if ( !gene.enabled ) {
                return;
        }
        gene.enabled = false;
       
        var gene1 = copyGene(gene);
        gene1.out = genome.maxneuron;
        gene1.weight = 1.0;
        gene1.innovation = newInnovation();
        gene1.enabled = true;
        tableInsert(genome.genes, gene1);
       
        var gene2 = copyGene(gene);
        gene2.into = genome.maxneuron;
        gene2.innovation = newInnovation();
        gene2.enabled = true;
        tableInsert(genome.genes, gene2);
}

function enableDisableMutate(genome, enable) {
        var candidates = [];
        for ( var i = 0; i < genome.genes; i++) {
                if (gene.enabled == !enable) {
                        tableInsert(candidates, gene);
                }        	
        }
        if (candidates.length == 0) {
                return;
        }       
        var gene = candidates[randomIntFromInterval(0,candidates.length-1)];
        gene.enabled = !gene.enabled;
}

function mutate(genome) {
		//return;

		var obj = genome.mutationRates;
		Object.getOwnPropertyNames(obj).forEach(function(val, idx, array) {
    			if(randomIntFromInterval(1,2)==1) {
    					obj[val] = 0.95*obj[val];
    			}
    			else {
    					obj[val] = 1.05263*obj[val];
    			}
    			console.log(val+": "+obj[val])
		});
		
        if (Math.random() < genome.mutationRates.connections) {
                pointMutate(genome);
        }
        
       	//Seems broken. Can not ascertain the original function
        var p = genome.mutationRates.link;
        while (p > 0) {
                if (Math.random() < p) {
                        linkMutate(genome, false);
                }
                p--;       	
        }
        return;
        p = genome.mutationRates.bias;
        while (p > 0) {
                if (Math.random() < p) {
                        linkMutate(genome, true);
                }
                p--;       	
        }
       
        p = genome.mutationRates.node;
        while (p > 0) {
                if (Math.random() < p) {
                        nodeMutate(genome, true);
                }
                p--;       	
        }

        p = genome.mutationRates.enable;
        while (p > 0) {
                if (Math.random() < p) {
                        enableDisableMutate(genome, true);
                }
                p--;       	
        }
 
        p = genome.mutationRates.disable;
        while (p > 0) {
                if (Math.random() < p) {
                        enableDisableMutate(genome, false);
                }
                p--;       	
        }
        console.log("Mutated a genome");
}
       
function disjoint(genes1, genes2) {

        var i1 = [];
        for (var i = 0; i < genes1.length; i++ ) {
                var gene = genes1[i];
                i1[gene.innovation] = true;
        }
        var i2 = [];
        for (var i = 0; i < genes2.length; i++ ) {
                var gene = genes2[i];
                i2[gene.innovation] = true;
        }
        console.log("Added all innovations to i1 and i2");
        var disjointGenes = 0
        for ( var i = 0; i < genes1.length; i++ ) {
                var gene = genes1[i];
                if ( !i2[gene.innovation]) {
                		disjointGenes++;
                }
        }
        for ( var i = 0; i < genes2.length; i++ ) {
                var gene = genes2[i];
                if ( !i1[gene.innovation]) {
                		disjointGenes++;
                }
        }
        var n = Math.max(genes1.length, genes2.length);
        return disjointGenes / n;
        console.log("Returning disjoint");
}

function weights(genes1, genes2) {
        var i2 = [];
        for (var i = 0; i < length.genes2; i++) {
        	var gene = genes2[i];
        	i2[gene.innovation] = gene;
        }
 
        var sum = 0;
        var coincident = 0;
        for (var i = 0; i < length.genes1; i++) {
                var gene = genes1[i];
                if (i2[gene.innovation] != undefined) {
                        var gene2 = i2[gene.innovation];
                        sum = sum + Math.abs(gene.weight - gene2.weight);
                        coincident = coincident + 1;
	            }
        }
       
        return sum / coincident;
}

function sameSpecies(genome1, genome2) {
        var dd = DeltaDisjoint*disjoint(genome1.genes, genome2.genes);
        var dw = DeltaWeights*weights(genome1.genes, genome2.genes);
        return (dd + dw) < DeltaThreshold;
}
 
function rankGlobally() {
        var globalList = [];
        for ( var s = 0; s < pool.species.length; s++ ) { 
                var species = pool.species[s];
                for ( var g = 0; g < species.genomes.length; g++ ) {
                        tableInsert(globalList, species.genomes[g]);
                }
        }
        console.log("Added all genomes from all species to a globall list ");
        tableSort(globalList, function (a,b) {
        	return (a.fitness < b.fitness);
        });
        console.log("sorted the list of all genomes according to fitness");
        //console.log("Rank 0 Genome is:"+JSON.stringify(globalList[0]));

        for ( var g=0; g < globalList.length; g++) {
                globalList[g].globalRank = g;
        }
}

function calculateAverageFitness(species) {
        var total = 0;

        for ( var g=0; g < species.genomes.length; g++) {
                var genome = species.genomes[g];
                total = total + genome.globalRank;
        }

        species.averageFitness = total / species.genomes.length;
}

function totalAverageFitness() {
        var total = 0;
        for ( var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
                total = total + species.averageFitness;
        }
 
        return total;
}

function cullSpecies(cutToOne) {
        for (var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
               
                tableSort(species.genomes, function (a,b) {
                        return (a.fitness > b.fitness); 
                });
               
                var remaining = Math.ceil(species.genomes.length/2);
                if (cutToOne) {
                		remaining = 1;
                }

                while (species.genomes.length > remaining) {
                        tableRemove(species.genomes);
                }
        }
}

function tableRemove(arr) {
		arr.pop();
}

function breedChild(species) {
        var child = {};
        if (Math.random() < CrossoverChance) {
                var g1 = species.genomes[randomIntFromInterval(0, species.genomes.length-1)];
                var g2 = species.genomes[randomIntFromInterval(0, species.genomes.length-1)];
                child = crossover(g1, g2);
        }
        else {
                g = species.genomes[randomIntFromInterval(0, species.genomes.length-1)];
                child = copyGenome(g);
        }
       
        mutate(child);
        return child;
}

function removeStaleSpecies() {
        var survived = [];
 
        for (var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
               
                tableSort(species.genomes, function (a,b) {
                        return (a.fitness > b.fitness);
                });
               
                if (species.genomes[0].fitness > species.topFitness) { 
                        species.topFitness = species.genomes[0].fitness;
                        species.staleness = 0;
                }
                else {
                        species.staleness = species.staleness + 1;
                }

                if (species.staleness < StaleSpecies || species.topFitness >= pool.maxFitness) {
                        tableInsert(survived, species);
                }
        }
 
        pool.species = survived;
}

function removeWeakSpecies() {
        var survived = [];
 
        var sum = totalAverageFitness();
        for (var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
                breed = Math.floor(species.averageFitness / sum * Population);
                if (breed >= 1) {
                        tableInsert(survived, species);
                }
        }
 
        pool.species = survived;
}

function addToSpecies(child) {
        var foundSpecies = false;
        for ( var s=0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
                console.log("Inputs: "+Inputs);
                console.log("First genome in species genes: "+species.genomes[0].genes);
                if (!foundSpecies && sameSpecies(child, species.genomes[0])) { 
                        tableInsert(species.genomes, child);
                        foundSpecies = true;
                }
        }
       
        if (!foundSpecies) {
                var childSpecies = newSpecies();
                tableInsert(childSpecies.genomes, child);
                tableInsert(pool.species, childSpecies);
                console.log("A new species has been created");
        }
        console.log("Returning addToSpecies");
}

function newGeneration() {
        cullSpecies(false); //Cull the bottom half of each species
        console.log("Culled bottom half of each species. Should remove nothing for species of one");
        rankGlobally();
        console.log("Ranked species globally");
        removeStaleSpecies();
        console.log("removed stale species");
        rankGlobally();
        console.log("Ranked species globally again");

        for ( var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];
                calculateAverageFitness(species);
        }
        removeWeakSpecies();
        console.log("Removed all the weak species");
        var sum = totalAverageFitness();
        var children = [];
        console.log(pool.species.length+" species remaining");
        for (var s = 0; s < pool.species.length; s++ ) {
                var species = pool.species[s];

                breed = Math.floor(species.averageFitness / sum * Population) - 1;
                console.log("Breeding "+breed+" children from species "+s);
                console.log("If error, should read undefined: "+species);
                for (var i=0; i < breed; i++) {
                        tableInsert(children, breedChild(species));
                }
        }
        cullSpecies(true); // Cull all but the top member of each species
        console.log("culled all but the top member of each species");
        while (children.length + pool.species.length < Population) {
                var species = pool.species[randomIntFromInterval(0, pool.species.length-1)];
                tableInsert(children, breedChild(species));
        }
        for (var c=0; c < children.length; c++) {
                var child = children[c];
                addToSpecies(child);
        }
       
        pool.generation++;
       
        //TODO
        //writeFile("backup." .. pool.generation .. "." .. forms.gettext(saveLoadFile))
}

function initializePool() {
        console.log("initializePool");
        pool = newPool();
        for (var i=0; i < Population; i++) {
                basic = basicGenome();
                console.log(JSON.stringify(basic,null,4));
                addToSpecies(basic);
        }
 
        initializeRun();
}

function initializeOutputs() {
        for(var b = 0; b < game.output.length; b++); {
        		game.output[b] = false;
        }
}

function initializeRun() {
        //savestate.load(Filename);
        rightmost = 0;
        //pool.currentFrame = 0;
        timeout = TimeoutConstant;
        initializeOutputs();
       
        var species = pool.species[pool.currentSpecies];
        var genome = species.genomes[pool.currentGenome];
        //console.log("Genome to have network generated is: "+JSON.stringify(genome,null,4));
        generateNetwork(genome);
        evaluateCurrent();
}

function evaluateCurrent() {
        var species = pool.species[pool.currentSpecies];
        //console.log("Pool's current genome is: "+pool.currentGenome);
        var genome = species.genomes[pool.currentGenome];
 
        inputs = getInputs();
        var tempOutputs = evaluateNetwork(genome.network, inputs);
       
        if (tempOutputs[0] && tempOutputs[1] ) {
                tempOutputs[0] = false;
                tempOutputs[1] = false;
        }
        //console.log("Outputs are: "+tempOutputs[0]+"and"+tempOutputs[1]);
        game.output = tempOutputs;
}


function nextGenome() {
        pool.currentGenome = pool.currentGenome + 1;
        //console.log("Executing nextGenome");
        //console.log("the length of the current species is "+pool.species[pool.currentSpecies].genomes.length);
        //console.log("the new current genome in the species is "+pool.currentGenome);
        if ( pool.currentGenome > pool.species[pool.currentSpecies].genomes.length-1 ) {
        		//console.log("The new genome is outside of the length of the current species, so move to the next species");
                pool.currentGenome = 0;
                pool.currentSpecies = pool.currentSpecies+1;
                if ( pool.currentSpecies > pool.species.length-1 ) {
                		console.log("creating a new generation");
                        newGeneration();
                        pool.currentSpecies = 0;
                }
        }
        //console.log("nextGenome moved current species to: "+pool.currentSpecies+" and currentGenome to: "+[pool.currentGenome]);
}
 
function fitnessAlreadyMeasured() {
        var species = pool.species[pool.currentSpecies];
        var genome = species.genomes[pool.currentGenome];
        //console.log("currentGenome: "+pool.currentGenome);
        return ( genome.fitness != 0 );
}

function drawline(point1, point2) {
		var ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.moveTo(point1.x,point1.y);
		ctx.lineTo(point2.x,point2.y);
		ctx.strokeStyle = "#00FF00";
		ctx.stroke();
		ctx.closePath();
}

function drawNeuron(x,y,value) {
		if(value > 0 ) {
				ctx.beginPath();
				ctx.rect(240+x*littlePixelSize, y*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#00FF00";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();
				ctx.rect(240+x*littlePixelSize+1, y*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#00DD00";
				ctx.fill();
				ctx.closePath();
		}
		else {
				ctx.beginPath();
				ctx.rect(240+x*littlePixelSize, y*littlePixelSize, littlePixelSize, littlePixelSize);
				ctx.fillStyle = "#FF0000";
				ctx.fill();
				ctx.closePath();
				ctx.beginPath();			
				ctx.rect(240+x*littlePixelSize+1, y*littlePixelSize+1, littlePixelSize-2, littlePixelSize-2);
				ctx.fillStyle = "#DD0000";
				ctx.fill();
				ctx.closePath();	
		}
		
}

function getPointformOutputIndex(outputnumber) {
	var point = {};
	if(outputnumber == 0) {
		point.y = littlePixelSize/2;
		point.x = 480-littlePixelSize/2;
	}
	else if(outputnumber == 1) {
		point.y = 160 - littlePixelSize/2;
		point.x = 480 - littlePixelSize/2;
	}
	else
		alert("Acessing illegal output array index");
	return point;
}

function getGeneDisplayLocation(index) {
	var point = {};
	if(index >= 0 && index < Inputs) {
		point = getPointfromInputIndex(index);
	}
	else if(index >= MaxNodes && index < MaxNodes + Outputs) {
		point = getPointformOutputIndex(index-MaxNodes);
	}
	//else if TODO include hidden neurons 
	else
		console.log("Accessing incorrect gene indexing, including possibly a hidden node index.");
	return point;
}

function displayGenome(genome) {
		//TODO: Display Genome

		var network = genome.network;

		 drawNeuron(4,4,5); 
		// drawNeuron(1,1,5);
		//console.log("drawing hiddenNeurons");
		//console.log(JSON.stringify(genome.genes,null,4));
		var k = Inputs;
		while(network.neurons[k] !== undefined) { 
			if(network.neurons[k].incoming.enabled == true) {
					var hiddenNeuron
					hiddenNeuron.number = k-Inputs;
					hiddenNeuron.y = hiddenNeuron.number % inputWidth;
					hiddenNeuron.x  = (hiddenNeuron.number - hiddenNeuron.y) / inputWidth;
					hiddenNeuron.value = network.neurons[k].value;
					drawNeuron(hiddenNeuron.x, hiddenNeuron.y,hiddenNeuron.value);
					console.log("drew hiddenNeuron");
			}
			console.log("hiddenNeuron present but not enabled");
			k++;
		}

		for( var o = 0; o < Outputs; o++) {
				//console.log("Trying to draw output neuron o: "+o);
				//console.log("The output neuron is enabled: "+network.neurons[MaxNodes+o].value);
				drawNeuron(23,15*o,network.neurons[MaxNodes+o].value); 
				//console.log("output node is enabled");
		}

		for( var j = 0; j < genome.genes.length; j++) {
			//console.log("Getting points of indexes "+genome.genes[j].into+" and "+genome.genes[j].out);
			var point1 = getGeneDisplayLocation(genome.genes[j].into);
			var point2 = getGeneDisplayLocation(genome.genes[j].out);
			drawline(point1,point2);
			//console.log("Drawing line: "+point1.x+" "+point1.y+" "+point2.x+" "+point2.y);
		}
		
		//console.log(JSON.stringify(network.neurons[MaxNodes],null,4));
		return;
}

function writeFile() {
		//TODO: Write Progress To File
		return;
}

function savePool() {
		//TODO: Write Progress To File
		return;
}

function loadFile() {
		//TODO: Write Progress To File
		return;
}

function loadPool() {
		//TODO: Write Progress To File
		return;
}



return {
    execute: function (game, canvas, onInit) {

        var d = new Date();

        if (pool == undefined) {
                initializePool();
        }

        //console.log(pool);
        var species = pool.species[pool.currentSpecies];
        // if(onInit) {
        // 	console.log("indicator");
        // 	console.log(JSON.stringify(species, null, 4));
        // }

        //console.log("currentGenome: "+pool.currentGenome);
        var genome = species.genomes[pool.currentGenome];
        if(game.gameTime > 0.03) {
        	displayGenome(genome);
        	evaluateCurrent();
        }
        
      
        if(game.flags.gameLostByAI) {

                var fitness = game.fitness;
                game.fitness = 0;
                if(fitness === 0) {
                        fitness = -1;
                }
                genome.fitness = fitness;
                if(fitness > pool.maxFitness) {
                        pool.maxFitness = fitness;
                }
                pool.currentSpecies = 0;
                pool.currentGenome = 0;
                while(fitnessAlreadyMeasured()) {
                        nextGenome();
                }
                game.flags.gameLostByAI = false;
                initializeRun();
        }

 		

        var n = new Date();
        game.functionTimes[2] = n - d;
    }
};


});

