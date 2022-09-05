import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={props.onClick}
        >
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i, j, k) {
        return <Square
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i, j, k)}
        />;
    }

    renderAll() {
        //With only one for loop, render all divs 'board-row'
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0, 0, 0)}
                    {this.renderSquare(1, 0, 1)}
                    {this.renderSquare(2, 0, 2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3, 1, 0)}
                    {this.renderSquare(4, 1, 1)}
                    {this.renderSquare(5, 1, 2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6, 2, 0)}
                    {this.renderSquare(7, 2, 1)}
                    {this.renderSquare(8, 2, 2)}
                </div>
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
        };
    }

    // handler for a click in any of the buttons of the board
    // takes the number of the button (0-9) and the position that in which the button shows (row, col)
    handleClick(i, j, k) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        const locations = this.state.stepsLocation.slice(0, this.state.stepNumber);
        const newLocation = `(${j}, ${k})`
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';

        this.setState({
            history: history.concat([{
                squares: squares,
            }]),
            stepNumber: history.length,
            stepsLocation: locations.concat(newLocation),
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        console.log(step);
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        });
    }

    //Render method for the game component
    render() {
        //Entire history of the game (all squares).
        const history = this.state.history;
        //Takes current version of the squares and checks if the someone won
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        // Creates a button for every version of the squares board and 
        // shows the number of the move and the position that was clicked on (row, col)
        // the first button is used to restart the board
        const moves = history.map((step, move) => {
            const location = this.state.stepsLocation[move - 1];
            const desc = move ?
                `Go to move #${move} with the location ${location}` :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        // Shows information about the next turn or if there's a winner 
        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        // Renders the game with the board react component and the props
        // of the squares object and onClick handler
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={(i, j, k) => this.handleClick(i, j, k)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
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
            return squares[a];
        }
    }
    return null;
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);