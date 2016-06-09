
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

const Population = 300;
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
            
            bricks.push(game.input[2*c+2][r+2].brick);
            bricks.push(game.input[2*c+3][r+2].brick);
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
        paddle.push(game.input[c][15].paddle);
    }
    //console.log("inputWidth: "+inputWidth);
    //console.log(paddle.length);
    return paddle;
}

function getVelocity() {

    var velocity = [];

    for( var c = 2; c <= 7; c++) {
        velocity.push(game.input[1][c].velocity);
        velocity.push(game.input[8][c].velocity);
        velocity.push(game.input[c][1].velocity);
        velocity.push(game.input[c][8].velocity);  
    }
    velocity.push(game.input[2][2].velocity);
    velocity.push(game.input[2][7].velocity);
    velocity.push(game.input[7][2].velocity);
    velocity.push(game.input[7][7].velocity);

    return velocity;
}

function getBall() {

    var ball = [];

    for(var c = 0; c < inputWidth; c++) {
        for(var r = 0; r < inputHeight; r++) {
            ball.push(game.input[c][r].ball);
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

function getPointFromInputIndex(inputnumber) {

	var point = {x:0, y:0};
	if(inputnumber < 160 && inputnumber >= 0) {
		point.y = 25 + (inputnumber%8)*10;
		point.x = 25 + (inputnumber-inputnumber%8)/8*10; 
	}
	else if(inputnumber >= 160 && inputnumber < 184) {
		point.x = (inputnumber-160)*10+5;
		point.y = 155;
	}
	else if(inputnumber >= 184 && inputnumber < 212) {
		var temp = inputnumber-184;
		var velocityXYLocations = 
			[15, 25,
			85, 25,
			25, 15,
			25, 85,
			15, 35,
			85, 35,
			35, 15,
			35, 85,
			15, 45,
			85, 45,
			45, 15,
			45, 85,
			15, 55,
			85, 55,
			55, 15,
			55, 85,
			15, 65,
			85, 65,
			65, 15,
			65, 85,
			15, 75,
			85, 75,
			75, 15,
			75, 85,
			25, 25,
			25, 75,
			75, 25,
			75, 75];
		point.x = velocityXYLocations[temp*2];
		point.y = velocityXYLocations[temp*2+1];
	}
	else if(inputnumber >= 212 && inputnumber < Inputs) {
		var temp = inputnumber-212;
		point.y = 5 + (temp%16)*10;
		point.x = 5 + (temp-temp%16)/16*10; 
		if(point.x>240) {alert("fuckup");}
	}
	else {
		alert("Accessing input index for display which does not exist.");
	}
	point.firing = inputs[inputnumber];
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
          genome2.genes[g] = copyGene(genome.genes[g]);
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
        genome.maxneuron = Inputs - 1;
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
        genome.genes.sort(function(a, b) {
            return (a.out < b.out);
        });

        //Interate through the genome && build a neuron where required for each active genome.
        genome.genes.forEach(function(gene) {
                if(gene.enabled) {
                        if (network.neurons[gene.out] == undefined) {
                                network.neurons[gene.out] = newNeuron();
                        }
                        var neuron = network.neurons[gene.out];
                        neuron.incoming.push(gene);
                        if (network.neurons[gene.into] == undefined) {
                        		network.neurons[gene.into] = newNeuron();
                        }              	
                }
        });
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
      //  tableInsert(inputs, 0);
        if (inputs.length != Inputs) {
        		console.error("Incorrect number of neural network inputs.");
                return {};
        }
        for (i=0; i < Inputs; i++) {
        		network.neurons[i].value = inputs[i];
        }

        network.neurons.forEach(function(neuron) {
          if(!neuron) {
            return;
          }
          var sum = 0;
          neuron.incoming.forEach(function(incoming) {
            var other = network.neurons[incoming.into];
            sum += incoming.weight * other.value;
          });
          if(neuron.incoming.length > 0) {
            neuron.value = sigmoid(sum);
          }
        });
        
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
                var tempg = g1;
                g1 = g2;
                g2 = tempg;
        }
 
        var child = newGenome();
       
        var innovations2 = [];
        g2.genes.forEach(function(gene) {
            innovations2[gene.innovation] = gene;
        });
       
        g1.genes.forEach(function(gene1) {
          var gene2 = innovations2[gene1.innovation];
          if(gene2 !== undefined && Math.random() < 0.5 && gene2.enabled) {
            child.genes.push(copyGene(gene2));
          } else {
            child.genes.push(copyGene(gene1));
          }
        });

        child.maxneuron = Math.max(g1.maxneuron,g2.maxneuron);       	
       	
        Object.keys(g1.mutationRates).forEach(function(mutation) {
          child.mutationRates[mutation] = g1.mutationRates[mutation];
        });
       
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

        genes.forEach(function(gene) {
          if(!nonInput || gene.into >= Inputs) {
            neurons[gene.into] = true;
          }
          if(!nonInput || gene.out >= Inputs) {
            neurons[gene.out] = true;
          }
        });
        
        var trueNeurons = neurons.filter(function(e) {return e == true;});

        var count = trueNeurons.length;

        return Object.keys(neurons)[randomIntFromInterval(0, count)];
}

function randomIntFromInterval(min, max) {
    	return Math.floor(Math.random()*(max-min)+min);
}

function containsLink(genes, link) {
  genes.forEach(function(gene) {
    if(gene.into == link.into && gene.out == link.out) {
      return true;
    }
  });
  return false;
}

function pointMutate(genome) {
		var step = genome.mutationRates.step;
    genome.genes.forEach(function(gene) {
      if(Math.random() < PerturbChance) {
        gene.weight += Math.random() * step * 2 - step;
      } else {
        gene.weight = Math.random() * 4 - 2;
      }
    });
}
        
function linkMutate(genome, forceBias) {
		console.log("Running linkMutate");
		
        var neuron1 = randomNeuron(genome.genes, false);
        var neuron2 = randomNeuron(genome.genes, true);
        
        var newLink = newGene();
        if ( neuron1 < Inputs && neuron2 < Inputs) {
                //Both input nodes
                console.log("Returning linkMutate: Both neurons are input nodes - Very likely");
                return;
        }
        if ( neuron2 < Inputs ) {
                //Swap output and input
                var temp = neuron1;
                neuron1 = neuron2;
                neuron2 = temp;
        }
 
        newLink.into = neuron1;
        newLink.out = neuron2;
        if ( forceBias ) {
                newLink.into = Inputs-1;
        }
       
        if ( containsLink(genome.genes, newLink)) {
        		console.log("Returning linkMutate: Link already exists - very unlikely");
                return;
        }
        newLink.innovation = newInnovation();
        newLink.weight = Math.random()*4-2;
       
        genome.genes.push(newLink);
        console.log("Returning linkMutate: added new link");
}

function nodeMutate(genome) {
        if (genome.genes.length == 0 ) {
                return;
        }
 
        genome.maxneuron = genome.maxneuron + 1;
 
        var gene = genome.genes[randomIntFromInterval(0,genome.genes.length)];
        if ( !gene.enabled ) {
                return;
        }
        gene.enabled = false;
       
        var gene1 = copyGene(gene);
        gene1.out = genome.maxneuron;
        gene1.weight = 1.0;
        gene1.innovation = newInnovation();
        gene1.enabled = true;
        genome.genes.push(gene1);
       
        var gene2 = copyGene(gene);
        gene2.into = genome.maxneuron;
        gene2.innovation = newInnovation();
        gene2.enabled = true;
        genome.genes.push(gene2);
}

function enableDisableMutate(genome, enable) {
        var candidates = genome.genes.filter(function(gene) {
          return gene.enabled == !enable;
        });
        
        if (candidates.length == 0) {
                return;
        }       
        var gene = candidates[randomIntFromInterval(0,candidates.length)];
        gene.enabled = !gene.enabled;
}

function mutate(genome) {
		//return;
    Object.keys(genome.mutationRates).forEach(function(mutation) {
      if(Math.random() <= 0.5) {
        genome.mutationRates[mutation] = 0.95*genome.mutationRates[mutation];
      } else {
        genome.mutationRates[mutation] = 1.05263*genome.mutationRates[mutation];
      }
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
                    nodeMutate(genome);
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
        genes1.forEach(function(gene) {
          i1[gene.innovation] = true;
        });

        var i2 = [];
        genes2.forEach(function(gene) {
          i2[gene.innovation] = true;
        });
        
        console.log("Added all innovations to i1 and i2");
        var disjointGenes = 0
        genes1.forEach(function(gene) {
          if(!i2[gene.innovation]) {
            disjointGenes++;
          }
        });
        
        genes2.forEach(function(gene) {
          if(!i1[gene.innovation]) {
            disjointGenes++;
          }
        });
        
        var n = Math.max(genes1.length, genes2.length);
        return disjointGenes*1.0 / n;
        console.log("Returning disjoint");
}

function weights(genes1, genes2) {
        var i2 = [];
        genes2.forEach(function(gene) {
          i2[gene.innovation] = gene;
        });
 
        var sum = 0;
        var coincident = 0;
        genes1.forEach(function(gene) {
          if(i2[gene.innovation] != undefined) {
            var gene2 = i2[gene.innovation];
            sum += Math.abs(gene.weight - gene2.weight);
            coincident++;
          }
        });
       
        return sum*1.0 / coincident;
}

function sameSpecies(genome1, genome2) {
        var dd = DeltaDisjoint*disjoint(genome1.genes, genome2.genes);
        var dw = DeltaWeights*weights(genome1.genes, genome2.genes);
        return (dd + dw) < DeltaThreshold;
}
 
function rankGlobally() {
        var globalList = [];
        pool.species.forEach(function(species) {
          species.genomes.forEach(function(genome) {
            globalList.push(genome);
          });
        });

        console.log("Added all genomes from all species to a globall list ");
        globalList.sort(function(a, b) {
          return a.fitness < b.fitness;
        });
        console.log("sorted the list of all genomes according to fitness");
        //console.log("Rank 0 Genome is:"+JSON.stringify(globalList[0]));

        globalList.forEach(function(genome, index) {
          genome.globalRank = index + 1;
        });
}

function calculateAverageFitness(species) {
        var total = 0;
        
        species.genomes.forEach(function(genome) {
          total += genome.globalRank;
        });

        species.averageFitness = total*1.0 / species.genomes.length;
}

function totalAverageFitness() {
        var total = 0;
        pool.species.forEach(function(species) {
          total += species.averageFitness;
        });
 
        return total;
}

function cullSpecies(cutToOne) {
  pool.species.forEach(function(species) {
    species.genomes.sort(function(a,b) {
      return a.fitness > b.fitness;
    });
    
    var remaining = Math.ceil(species.genomes.length*1.0/2);
    if(cutToOne) {
      remaining = 1;
    }
    species.genomes = species.genomes.slice(0, remaining);
  });
}

function breedChild(species) {
        var child = {};
        if (Math.random() < CrossoverChance) {
                var g1 = species.genomes[randomIntFromInterval(0, species.genomes.length)];
                var g2 = species.genomes[randomIntFromInterval(0, species.genomes.length)];
                child = crossover(g1, g2);
        }
        else {
                g = species.genomes[randomIntFromInterval(0, species.genomes.length)];
                child = copyGenome(g);
        }
       
        mutate(child);
        return child;
}

function removeStaleSpecies() {
        var survived = [];
        pool.species.forEach(function(species) {
          
          species.genomes.sort(function(a,b) {
            return a.fitness > b.fitness;
          });
          
          if (species.genomes[0].fitness > species.topFitness) {
            species.topFitness = species.genomes[0].fitness;
            species.staleness = 0;
          } else {
            species.staleness++;
          }
          
          if(species.staleness < StaleSpecies || species.topFitness >= pool.maxFitness) {
            survived.push(species);
          }
        });
        
        pool.species = survived;
}

function removeWeakSpecies() {
        var survived = [];
 
        var sum = totalAverageFitness();
        pool.species.forEach(function(species) {
          var breed = Math.floor(species.averageFitness*1.0 / sum * Population);
          if(breed >= 1) {
            survived.push(species);
          }
        });
        
        pool.species = survived;
}

function addToSpecies(child) {
        var foundSpecies = false;
        pool.species.forEach(function(species) {
                if (!foundSpecies && sameSpecies(child, species.genomes[0])) { 
                        species.genomes.push(child);
                        foundSpecies = true;
                }
        });
       
        if (!foundSpecies) {
                var childSpecies = newSpecies();
                childSpecies.genomes.push(child);
                pool.species.push(childSpecies);
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

        pool.species.forEach(function(species) {
          calculateAverageFitness(species);
        });
        removeWeakSpecies();
        console.log("Removed all the weak species");
        var sum = totalAverageFitness();
        var children = [];
        console.log(pool.species.length+" species remaining");
        pool.species.forEach(function(species, index) {

                var breed = Math.floor(species.averageFitness*1.0 / sum * Population) - 1;
                console.log("Breeding "+breed+" children from species "+index);
                console.log("If error, should read undefined: "+species);
                for (var i=0; i < breed; i++) {
                        children.push(breedChild(species));
                }
        });
        cullSpecies(true); // Cull all but the top member of each species
        console.log("culled all but the top member of each species");
        while (children.length + pool.species.length < Population) {
                var species = pool.species[randomIntFromInterval(0, pool.species.length)];
                children.push(breedChild(species));
        }
        children.forEach(function(child) {
                addToSpecies(child);
        });
       
        pool.generation++;
       
        //TODO
        //writeFile("backup." .. pool.generation .. "." .. forms.gettext(saveLoadFile))
}

function initializePool() {
        console.log("initializePool");
        pool = newPool();
        for (var i=0; i < Population; i++) {
                var basic = basicGenome();
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
        pool.currentGenome++;
        //console.log("Executing nextGenome");
        //console.log("the length of the current species is "+pool.species[pool.currentSpecies].genomes.length);
        //console.log("the new current genome in the species is "+pool.currentGenome);
        if ( pool.currentGenome >= pool.species[pool.currentSpecies].genomes.length ) {
        		//console.log("The new genome is outside of the length of the current species, so move to the next species");
                pool.currentGenome = 0;
                pool.currentSpecies++;
                if ( pool.currentSpecies >= pool.species.length ) {
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
		if(point1.firing) {ctx.strokeStyle = "#00FF00";}
		else {ctx.strokeStyle = "#FF0000";}
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

function getPointFromOutputIndex(outputnumber) {
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

function getPointFromHiddenNode(index) {
	var point = {x:0, y:0};
	index -= Inputs;
	point.x = 245 + (index-index%16)/16*10; 
	point.y = 5 + (index%16)*10;
	return point;
}

function getGeneDisplayLocation(index) {
	var point = {x:0, y:0};
	if(index >= 0 && index < Inputs) {
		point = getPointFromInputIndex(index);
	}
	else if(index >= MaxNodes && index < MaxNodes + Outputs) {
		point = getPointFromOutputIndex(index-MaxNodes);
	}
	else
		point = getPointFromHiddenNode(index);
	return point;
}

function displayGenome(genome) {
		//TODO: Display Genome

		var network = genome.network;

		//Test Neuron for draw neuron drawNeuron(4,4,5); 
		//console.log(JSON.stringify(genome.genes,null,4));
		var k = Inputs;
		while(network.neurons[k] !== undefined) { 

				var hiddenNeuron = {};
				hiddenNeuron.number = k-Inputs;
				hiddenNeuron.y = hiddenNeuron.number % inputWidth;
				hiddenNeuron.x  = (hiddenNeuron.number - hiddenNeuron.y) / inputWidth;
				hiddenNeuron.value = network.neurons[k].value;
				drawNeuron(hiddenNeuron.x, hiddenNeuron.y,hiddenNeuron.value);
				//console.log("drew hiddenNeuron");
				for( var j = 0; j < network.neurons[k].incoming.length; j++) {
						if(network.neurons[k].incoming[j].enabled) {
								var point1 = getGeneDisplayLocation(network.neurons[k].incoming[j].into);
								var point2 = getGeneDisplayLocation(network.neurons[k].incoming[j].out);
								//console.log("Drawing neuron with input: "+network.neurons[MaxNodes+o].incoming.into);
								drawline(point1,point2);
								//console.log("Called drawline");						
						}	
				}

			//console.log("hiddenNeuron present but not enabled");
			k++;
			//alert("Drew a hiddenNeuron"); //THIS LINE WILL CAUSES SLOW DOWN IF ALERTS ARE IGNORED BY BROWSER. REMOVE ONCE HIDDEN NEURONS ARE SEEN
		}

		for( var o = 0; o < Outputs; o++) {
				//console.log("Trying to draw output neuron o: "+o);
				//console.log("The output neuron is enabled: "+network.neurons[MaxNodes+o].value);
				drawNeuron(23,15*o,network.neurons[MaxNodes+o].value); 

				for( var j = 0; j < network.neurons[MaxNodes+o].incoming.length; j++) {
						if(network.neurons[MaxNodes+o].incoming[j].enabled) {
								var point1 = getGeneDisplayLocation(network.neurons[MaxNodes+o].incoming[j].into);
								var point2 = getGeneDisplayLocation(network.neurons[MaxNodes+o].incoming[j].out);
								//console.log("Drawing neuron with input: "+network.neurons[MaxNodes+o].incoming.into);
								drawline(point1,point2);
								//console.log("Called drawline");						
						}
				}
				//console.log(JSON.stringify(network.neurons[MaxNodes],null,4));
		}
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

