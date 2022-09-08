import React from 'react';
import ReactDOM from 'react-dom/client';
import Toggle from 'react-toggle'
import './index.css';

// Square as a function component, the styling will change if the square is part of the
// winner row of Xs or Os, also renders a button with the given value inside,
// declares a onClick prop that calls another onClick prop of a parent component.
function Square(props) {
    return (
        <button
            key={props.keyValue}
            className={props.squareClass}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

//Toggle function component to change the order in which the moves show
// ascending or descending
function ToggleOrder(props) {
    return (
        <div className='toggleButton'>
            <label>
                <span>ASCENDING </span>
                <Toggle
                    defaultChecked={false}
                    icons={false}
                    disabled={!props.enableToggle}
                    onChange={props.handleToggleChange}
                />
                <span> DESCENDING</span>
            </label>


        </div>
    );
}

// Board component
// renders the board with 9 squares in it
// for that it uses the renderSquare function that returns a Square component
// with a value and a onClick prop that calls a onClick function of a parent component,
// also added a squareClass prop that is used to define if the square is part of the
// winner row or just part of the board.
class Board extends React.Component {

    renderSquare(i, j, k, squareClass) {
        return <Square
            keyValue={`square#${i}`}
            value={this.props.squares[i]}
            squareClass={squareClass}
            onClick={() => this.props.onClick(i, j, k)}
        />;
    }

    // Renders the board of squares with two loops, the lower loop is used to generate
    // the squares components of each row and the upper loop is used to generate
    // each row (a div) with the squares,
    // also checks if the indexes of the squares that are going to be rendered 
    // are part of the winner row.
    render() {
        const rowWinner = this.props.rowWinner;
        let squareClass = 'square';
        let i = 0;
        let key = '';
        const rows = [];
        for (let j = 0; j < 3; j++) {
            const cols = [];
            key = `row#${j}`;
            for (let k = 0; k < 3; k++) {
                if (rowWinner) {
                    if (i === rowWinner[0] || i === rowWinner[1] || i === rowWinner[2]) {
                        squareClass = 'square won';
                    } else {
                        squareClass = 'square';
                    }
                }
                cols.push(this.renderSquare(i, j, k, squareClass));
                i++;
            }
            rows.push(
                <div key={key} className='board-row'>
                    {cols}
                </div>
            );
        }
        return (
            <div>
                {rows}
            </div>
        );
    }
}

// Game component, with state that is used to save the history of the board
// the current step (changes if the game goes back to an old move),
// the locations (row, col) of the squares as they get clicked
// and a variable to control if the next turn is a X or an O.
class Game extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            stepsLocation: [],
            xIsNext: true,
            ascending: true,
            won: false,
            rowWinner: null,
        };
    }

    // handler for a click in any of the buttons of the board
    // takes the number of the button (0-9) and the position in which the button shows (row, col)
    handleClick(i, j, k) {
        // Takes a copy (slice) of the history with all the versions of the squares, if  a back-to-move was made
        // it takes the history up until the selected move (the step).
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        // Takes a copy of the latest square in the history.
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        // Takes a copy of the locations in which the Xs and Os were clicked and drawn
        // if a back-to-move was made, takes a copy of the locations up until that move
        const locations = this.state.stepsLocation.slice(0, this.state.stepNumber);
        // Declares a new location that has the coordinates (j,k) of the square that was clicked
        const newLocation = `(${j}, ${k})`
        // Checks if theres a winner or if that square was already clicked
        if (calculateWinner(squares) || squares[i]) {
            return;
        }

        // Checks if the letter to draw is a X or a O and 
        // puts it in the correct number (0-9) of the square.
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        // Updates the state of the Game component with a new version of the squares board
        // a new value for the current step (this is the latest move), 
        // a new version of the locations of the squares that were already clicked
        // and changes the state of xIsNext (if true, now is false, if false, now is true)
        // renders again the game component.
        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            stepsLocation: locations.concat(newLocation),
            xIsNext: !this.state.xIsNext,
        });
    }

    // Updates the value of the step (after a click to a 'Go to move #' button) 
    // and checks if the new value of the step is odd or even to then
    // define if the next turn is a X or a O,
    // renders again the game component.
    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    // Handles the change of the toggle button, used to change the order in which are
    // rendered the list moves, ascending or descending.
    handleToggleChange() {
        console.log('WORKS!');
        this.setState({
            ascending: !this.state.ascending,
        });

    }

    //Render method for the game component
    render() {
        //Entire history of the game (all squares).
        const history = this.state.history;
        //Takes current version of the squares and checks if the someone won
        const current = history[this.state.stepNumber];
        const won = calculateWinner(current.squares);

        // Creates a button for every version of the squares board and 
        // shows the number of the move and the position that was clicked on (row, col)
        // the first button is used to restart the board
        // also, checks what is the current move and bolds the button that
        // corresponds it.
        let moves = history.map((step, move) => {
            const location = this.state.stepsLocation[move - 1];
            const desc = move ?
                `Go to move #${move} with the location ${location}` :
                'Go to game start';
            let boldness = '';
            if (move === this.state.stepNumber) {
                boldness = <strong>{desc}</strong>;
            } else {
                boldness = desc;
            }
            return (
                <li key={move}>
                    <button onClick={() =>
                        this.jumpTo(move)}>{boldness}</button>
                </li >
            );
        });

        // Reverse the order of the moves components if the order is descending
        if (this.state.ascending === false) {
            moves = moves.map(move => move).reverse();
        }

        // Shows information about the next turn or if there's a winner or a tie.
        let status;
        let classStatus;
        let rowWinner = null;
        if (won) {
            status = 'Winner: ' + won[0];
            rowWinner = [won[1], won[2], won[3]];
            classStatus = 'status winner';
        } else if (this.state.stepNumber === 9) {
            status = 'It\'s a tie!';
            classStatus = 'status tie'
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
            classStatus = 'status';
        }

        let enableToggle = false;
        if (this.state.stepsLocation.length > 0) {
            enableToggle = true;
        }

        // Renders the game with the board react component and the props
        // of the squares object and onClick handler
        // also renders the toggle button to change the order of the moves
        // and the list of moves itself.
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        rowWinner={rowWinner}
                        onClick={(i, j, k) => this.handleClick(i, j, k)}
                    />
                </div>
                <div className="game-info">
                    <div className={classStatus}>{status}</div>
                    <ToggleOrder
                        enableToggle={enableToggle}
                        handleToggleChange={() => this.handleToggleChange()}
                    />
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

//Calculates the winner if the square has one row or diagonal of full Xs or Os
function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return [squares[a], a, b, c];
        }
    }
    return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);