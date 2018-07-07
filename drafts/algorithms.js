// min length algorithm
// when would I want infinite indexes?
	// repeat? but no because it has the same indexes every time
	// maybe a pattern for consecutive numbers, like a list of numbers
	// 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30
	// this is not a simple pattern, so it generates patterns every time a new index is used
	// OH SHIT this is crazy
		// when a new pattern is generated, the pattern list structure changes and possible following characters also change
		// unless I use some trickery from the generation side
		// hmmmm
		// maybe I can circumvent the infinite patterns because all the patterns have the same character range
		// or, if the computational complexity isn't too big, I can determine the patterns parse-time
			// parse-time acceleration
			// hmmmmm
			// hmmmmm
		// I think I can finangle that mess if I try
        // I need to figure out a way to remove ranges and have range counts
        // hash tables
        // I can hash the state of the board and remember which states ended in FAILURE which will reduce redundancy and drastically reduce the runtime
            // also means lazier move programming
            // not all moves can be tried, depends on the state of the parser
        // Then I won't have to worry about move associativity
        // this is a state machine that I can set up by performing moves
        // every move can be undone when a dead end is reached
        // all dead ends are hashed so they can be remembered
/*
two types of indentations
1. lines are grouped separately and each line starts with a line start pattern
horizontal first vs vertical first
    vertical first seems better except it is a little more complicated
    horizontal first is easier to implement but less powerful
*/

// I like
    // cheese
    // and
    // stuff
        // and
        // thing
// end

// I like
//     cheese
//     and
//     stuff
//         and
//         thing
// end

// 1 + (
    // 2 + 3 + 4
// ) + 5

// the line approach
// every line can have certain patterns or formatting
// ooh, this has potential
// or, delimiters separate items in a list
// certain characters can follow delimiters
// or patterns can preceed items in a list

line1
line2
line3
line4

[line1, line2, line3, line4] with delimiter \n

word, repeat(', ', word)

comment(
    spaces(
        add(
            [
                1,
                parenthases(
                    outer_spaces(
                        inner_spaces(
                            add(
                                [2,3,4]
                            )
                        )
                    )
                ),
                5
            ]
        )
    )
)

function get_min_length() {
	if (base.can_skip()) {
		return 0;
	}

	var len = 0;
	for (var i = 0; i < base.last_unique_index(); i++) {
		if (!base.can_skip_index(i)) {
			var takes = base.takes(i);
			
			// get min length from PatternSet
			len += takes.min_length;
		}
	}

	return len;
}

function required_patterns() {
	var res = new PatternSet();


}

function mark_unchanging_loops() {
	// node - edge notation
	// patterns is an array of nodes
	// they have already been marked as changing or unchanging
	// every node has an array of edge in the form of {index, to}
	// this algorithm marks the edges as changing or unchanging

	// make array of unchanging nodes
	var unchanging_nodes = ...;
	var node_visited = [false, false, ...];

	var edges = ...; // {node_index, edge_index (inside node)}
	var edge_visited = [false, false, ...];

	// loop through all the nodes
	for (var node_i in unchanging_nodes) {

		// make sure the node is unvisited
		if (node_visited[node_i]) {
			continue;
		}

		// make the connected node stack
		var node_stack = [node at node_i];
		var edge_stack = [];

		// now the main algorithm
		while (stack.length !== 0) {
			cur_node = node_stack.top();

			if (cur_node has been visited) {
				// retrace steps until cur_node repeats
				// mark retraced edges

				for (var i = node_stack.length - 2; i >= 0; i--) {
					// mark the edge
					edge_stack[i].invalid = true;

					if (node_stack[i] is cur_node) {
						break;
					}
				}
				node_stack.pop();
				continue;
			}



			// else, search for an untracked edge to go along
			for (edge in edges connected to cur_node) {

			}
		}
	}
}

/*
When a pattern is included (upgraded or collapsed), add to all trigger stacks

*/