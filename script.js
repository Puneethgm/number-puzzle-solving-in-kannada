let puzzle = [];
let size = 6; 
let intervalId = null;
let shuffleMovesCount = 0; 

const puzzleGrid = document.getElementById('puzzleGrid');
const solutionContainer = document.getElementById('solutionContainer');
const movesDisplay = document.getElementById('movesDisplay'); 

// numbers to Kannada numerals
const kannadaNumbers = {
    1: '೧', 2: '೨', 3: '೩', 4: '೪',
    5: '೫', 6: '೬', 7: '೭', 8: '೮',
    9: '೯', 10: '೧೦', 11: '೧೧', 12: '೧೨',
    13: '೧೩', 14: '೧೪', 15: '೧೫', 
    16: '೧೬', 17: '೧೭', 18: '೧೮', 
    19: '೧೯', 20: '೨೦', 21: '೨೧', 
    22: '೨೨', 23: '೨೩', 24: '೨೪', 
    25: '೨೫', 26: '೨೬', 27: '೨೭',
    28: '೨೮', 29: '೨೯', 30: '೩೦',
    31: '೩೧', 32: '೩೨', 33: '೩೩',
    34: '೩೪', 35: '೩೫', 36: '೩೬',
    null: ''
};


// create a puzzle
function createPuzzle() {
    size = parseInt(document.getElementById('gridSize').value);
    puzzleGrid.style.gridTemplateColumns = `repeat(${size}, 65px)`; 
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null); //last block null

    renderPuzzle();
    solutionContainer.innerHTML = '';
    movesDisplay.innerHTML = 'ಚಲನೆಗಳು: 0'; 
}

function renderPuzzle() {
    puzzleGrid.innerHTML = ''; 

    puzzle.forEach((number) => {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        if (number !== null) {
            cell.textContent = kannadaNumbers[number]; 
        } else {
            cell.classList.add('blank');
        }

        puzzleGrid.appendChild(cell);
    });
}

// Fisher-Yates shuffle algorithm to randomly shuffle the puzzle
function shufflePuzzle() {
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null); 
    renderPuzzle();
    const maxShuffleMoves = Math.floor(Math.random() * 21) + 35; 
    let previousState = [...puzzle];
    shuffleMovesCount = 0; 

    while (shuffleMovesCount < maxShuffleMoves) {
        const neighbors = getNeighbors(previousState);
        if (neighbors.length === 0) break; 
        const nextMove = neighbors[Math.floor(Math.random() * neighbors.length)];
        previousState = nextMove;
        puzzle = previousState;
        shuffleMovesCount++;
    }

    renderPuzzle(); 
    movesDisplay.innerHTML = `ಚಲನೆಗಳು: ${shuffleMovesCount}`; 
}
function orderPuzzle() {
    puzzle = Array.from({ length: size * size - 1 }, (_, i) => i + 1);
    puzzle.push(null);
    renderPuzzle();
    solutionContainer.innerHTML = ''; 
    movesDisplay.innerHTML = 'ಚಲನೆಗಳು: 0'; 
}

function findBlank(puzzle) {
    return puzzle.indexOf(null);
}
//display the number of moves
function solvePuzzle() {
    const initialState = puzzle.slice();
    const goalState = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat([null]);

    const solution = aStarSolver(initialState, goalState);

    if (solution.length > 0) {
        const numberOfMoves = solution.length - 1;
        alert(`ಪಜಲ್ ${numberOfMoves} ಚಲನೆಗಳಲ್ಲಿ ಪರಿಹರಿಸಲಾಗಿದೆ.`);
        animateSolution(solution);
        displaySolutionMatrices(solution);
        movesDisplay.innerHTML = `ಚಲನೆಗಳು: ${numberOfMoves}`;
    } else {
        alert('ಯಾವುದೇ ಪರಿಹಾರ ಕಂಡುಬಂದಿಲ್ಲ.');
    }
}

// Display solution matrix
function displaySolutionMatrices(solution) {
    solutionContainer.innerHTML = ''; 
    solution.forEach((step, index) => {
        const matrixDiv = document.createElement('div');
        matrixDiv.classList.add('matrix');
        matrixDiv.style.gridTemplateColumns = `repeat(${size}, 65px)`; 

        const stepLabel = document.createElement('div');
        stepLabel.classList.add('stepLabel');
        stepLabel.textContent = `ಹಂತ ${index}`; 
        solutionContainer.appendChild(stepLabel);

        step.forEach((number) => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = kannadaNumbers[number];
            matrixDiv.appendChild(cell);
        });

        solutionContainer.appendChild(matrixDiv); 
    });

     const thankYouMessage = document.createElement('div');
     thankYouMessage.classList.add('thankYouMessage');
     thankYouMessage.textContent = 'ಧನ್ಯವಾದಗಳು!'; 
     thankYouMessage.style.fontSize = '24px'; 
     thankYouMessage.style.fontWeight = 'bold'; 
     thankYouMessage.style.marginTop = '20px'; 
     solutionContainer.appendChild(thankYouMessage);
}

// A* algorithm to find the shortest path
function aStarSolver(initialState, goalState) {
    const openSet = [initialState];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();

    gScore.set(initialState.toString(), 0);
    fScore.set(initialState.toString(), manhattanDistance(initialState, goalState));

    while (openSet.length > 0) {
        const current = openSet.reduce((a, b) => fScore.get(a.toString()) < fScore.get(b.toString()) ? a : b);

        if (arraysEqual(current, goalState)) {
            return reconstructPath(cameFrom, current);
        }

        openSet.splice(openSet.indexOf(current), 1);

        getNeighbors(current).forEach(neighbor => {
            const tentative_gScore = gScore.get(current.toString()) + 1;

            if (!gScore.has(neighbor.toString()) || tentative_gScore < gScore.get(neighbor.toString())) {
                cameFrom.set(neighbor.toString(), current);
                gScore.set(neighbor.toString(), tentative_gScore);
                fScore.set(neighbor.toString(), tentative_gScore + manhattanDistance(neighbor, goalState));

                if (!openSet.some(p => arraysEqual(p, neighbor))) {
                    openSet.push(neighbor);
                }
            }
        });
    }

    return [];
}

// Manhattan distance heuristic
function manhattanDistance(state, goalState) {
    let distance = 0;
    const size = Math.sqrt(state.length);

    state.forEach((value, index) => {
        if (value !== null) {
            const goalIndex = goalState.indexOf(value);
            const x1 = Math.floor(index / size);
            const y1 = index % size;
            const x2 = Math.floor(goalIndex / size);
            const y2 = goalIndex % size;
            distance += Math.abs(x1 - x2) + Math.abs(y1 - y2);
        }
    });

    return distance;
}

// Get neighboring states
function getNeighbors(state) {
    const neighbors = [];
    const blankIndex = findBlank(state);
    const size = Math.sqrt(state.length);
    const row = Math.floor(blankIndex / size);
    const col = blankIndex % size;

    const directions = [
        { r: -1, c: 0 }, 
        { r: 1, c: 0 },  
        { r: 0, c: -1 }, 
        { r: 0, c: 1 } 
    ];

    directions.forEach(({ r, c }) => {
        const newRow = row + r;
        const newCol = col + c;
        if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
            const newIndex = newRow * size + newCol;
            const newState = state.slice();
            [newState[blankIndex], newState[newIndex]] = [newState[newIndex], newState[blankIndex]];
            neighbors.push(newState);
        }
    });

    return neighbors;
}

// Animate the solution
function animateSolution(moves) {
    let index = 0;

    const displayNextMove = () => {
        if (index < moves.length) {
            puzzle = moves[index];
            renderPuzzle();
            index++;
            setTimeout(displayNextMove, 500); 
        }
    };

    displayNextMove(); 
}


// Reconstruct path from A* algorithm
function reconstructPath(cameFrom, current) {
    const totalPath = [current];
    while (cameFrom.has(current.toString())) {
        current = cameFrom.get(current.toString());
        totalPath.unshift(current);
    }
    return totalPath;
}
function arraysEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}
createPuzzle();
