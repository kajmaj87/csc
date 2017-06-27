function parseAndPresent() {
	var game = parse(document.getElementById("input")
		.value);
	document.getElementById("mistakes")
		.value = biggestMistakesList(game.moves, -0.05);
	document.getElementById("hotspots")
		.value = findHotspots(game.moves);
}

function biggestMistakesList(moves, threshold) {
	return moves.filter(function(a) {
			return Math.abs(a.diff) > threshold;
		})
		.sort(function(a, b) {
			return b.diff - a.diff;
		})
		.map(function(move) {
		    return '\n' + move.string;
	    });
}

function findHotspots(moves) {
	var hotSpots = new Map(),
	    transformXY = function(move) {
	       var x = ['X','A','B','C','D','E','F','G','H','J','K','L','M','N','O','P','Q','R','S','T']
	       return x[move.UKBX] + ', ' + (20 - move.UKBY);
	    };
	moves.forEach(function(move) {
		var bestMove = transformXY(move);
		// map with moves, each move has a list of turns it occured as a best move found by CS
		if (hotSpots.get(bestMove)) {
			hotSpots.get(bestMove)
				.push(move.move);
		} else {
			hotSpots.set(bestMove, [move.move]);
		}
	});
	return [...hotSpots].filter(function(entry) {
			return entry[1].length > 1;
		})
		.sort(function(a, b) {
			return b[1].length - a[1].length;
		})
		.map(function(entry){
		    return "\n"+entry[1].length + "\t" + entry[0] + ":\tmoves: " + entry[1][0] + " - "+entry[1][entry[1].length-1]+" ("+(entry[1][entry[1].length-1]-entry[1][0])+")"; 
		});
}

function parse(text) {
	var lines, result = {},
		moves = [],
		asString = function(a) {
			return a.move + ":\t" + a.diff;
		};
	lines = text.split(';');
	// get rid of first empty line
	lines.shift();
	lines.forEach(function(line, j) {
		var tokenType = "property",
			currentToken = '',
			value, property, parsedLine = {};
		for (var i = 0, len = line.length; i < len; i++) {
			if (line[i] === '[') {
				tokenType = "value";
				property = currentToken;
				currentToken = '';
			} else if (line[i] === ']') {
				tokenType = "property";
				value = currentToken;
				currentToken = '';
				parsedLine[property] = value;
			} else {
				currentToken += line[i];
			}
		}
		console.log(parsedLine);
		parsedLine.move = j;
		parsedLine.diff = (parsedLine.B ? 1 : -1) * (parsedLine.UKBBWR - parsedLine.UKBWR);
		parsedLine.string = asString(parsedLine);
		moves.push(parsedLine);
	});
	result.meta = moves.shift();
	result.moves = moves;
	return result;
}