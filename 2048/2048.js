var board = {};
var score = 0;

var tileKey = function (col, row){
    return "tile" + col + "-" +row;
}

var createBoard = function () {
    var boardDiv = document.querySelector("#board")

    for (var row = 0; row < 4; row += 1){
        var rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        boardDiv.appendChild(rowDiv);

        for (var col = 0; col < 4; col += 1){
            var tileDiv= document.createElement("div");
            tileDiv.classList.add("tile");
            tileDiv.id = tileKey(col, row);
            rowDiv.appendChild(tileDiv);
        }
    }
};

var updateBoard = function(){
    for (var row = 0; row < 4; row += 1){
        for (var col = 0; col < 4; col += 1){
            var key = tileKey(col, row);
            //TODO #1: query the tile element.
            var tileDiv = document.querySelector("#" + key);
            //TODO#2: retrieve the value from the board object.
            var value= board[key];
            //TODO#3: set the innerHTML of the tile element.
            tileDiv.className = "tile";
            if (value) {
                tileDiv.innerHTML= value;
                tileDiv.classList.add("tile-" + value);
            } else{
                tileDiv.innerHTML="";
            }
        }
    }
    var scoreSpan = document.querySelector("#score");
    scoreSpan.innerHTML = score;
};

var getEmptyTiles = function(){
    var empty = [];
    for (var row = 0; row < 4; row+= 1){
        for (var col = 0; col < 4; col += 1){
            var key = tileKey(col,row);
            var value = board[key];
            if (!value) {
                empty.push(key);
            }
        }
    }
    return empty;
};

var addOneTile = function (){
    var emptyTiles= getEmptyTiles();
    var randomIndex = Math.floor(Math.random() * emptyTiles.length);
    var randomEmptyTile=emptyTiles[randomIndex];
    board[randomEmptyTile]=Math.random() > 0.9 ? 2 : 4;
};

var combineNumbers = function (numbers){
    var newNumbers = [];
    while (numbers.length > 0) {
        if (numbers.length == 1){
            newNumbers.push(numbers[0]);
            numbers.splice(0,1);
        }else if(numbers[0] == numbers[1]){
            var sum = numbers[0] + numbers[1];
            newNumbers.push(sum);
            score += sum;
            numbers.splice(0,2);
        } else{
            newNumbers.push(numbers[0]);
            numbers.splice(0,1);
        }
    }
    while (newNumbers.length < 4){
         newNumbers.push(undefined);
    }
    return newNumbers
};

var getNumbersInRow = function (row) {
    var nums=[];
    for (var col = 0; col < 4; col += 1){
        var key = tileKey(col, row);
        var value = board[key];
        if (value){
            nums.push(value);
        }
    }
    return nums;
}; 

var getNumbersInCol = function (col) {
    var nums=[];
    for (var row = 0; row < 4; row += 1){
        var key = tileKey(col, row);
        var value = board[key];
        if (value){
            nums.push(value);
        }
    }
    return nums;
}; 

var setNumbersInRow = function(row, nums){
    for (var col = 0; col < 4; col += 1){
        var key = tileKey(col, row);
        board[key] = nums[col];

    }
};

var setNumbersInCol = function(col, nums){
    for (var row = 0; row < 4; row += 1){
        var key = tileKey(col, row);
        board[key] = nums[row];
    }
};

var combineRowLeft = function(row) {
    var nums = getNumbersInRow(row);
    var newNums =  combineNumbers(nums);
    setNumbersInRow(row, newNums);
};
var combineColUp = function(col) {
    var nums = getNumbersInCol(col);
    var newNums =  combineNumbers(nums);
    setNumbersInCol(col, newNums);
};

var combineRowRight = function (row) {
    var nums= getNumbersInRow(row);
    nums = nums.reverse();
    var newNums = combineNumbers(nums);
    newNums=newNums.reverse();
    setNumbersInRow(row, newNums);
};
var combineColDown = function(col) {
    var nums= getNumbersInCol(col);
    nums = nums.reverse();
    var newNums = combineNumbers(nums);
    newNums=newNums.reverse();
    setNumbersInCol(col, newNums);
};
var combineDirection = function (direction) {
    //make a (deep) copy of the board
    var oldBoard = Object.assign({}, board);

    for (var n = 0; n < 4; n += 1){
        if (direction == "left"){
            combineRowLeft(n);
        } else if (direction == "right"){
            combineRowRight(n);
        } else if (direction == "up"){
            combineColUp(n);
        }else if (direction == "down"){
            combineColDown(n);
        }

    }   
    if (didBoardChange(oldBoard)) {
        addOneTile();
        updateBoard();
    }
};

var didBoardChange = function (oldBoard){
    for (var row = 0; row < 4; row += 1){
        for(var col= 0; col < 4; col += 1){
            var key =tileKey(col,row);
            if (board[key] != oldBoard[key]){
                return true;
            }
        }
    }
    return false;
};

document.onkeydown = function(e) {
    console.log("key pressed", e);
    if (e.which == 37) {
        combineDirection("left");
    }else if(e.which == 39){
        combineDirection("right");
    }else if (e.which == 40){
        combineDirection("down");
    }else if (e.which == 38){
        combineDirection("up");
    }
};
//this is a good template for working with Ajax 
var getHighScores = function () {
    fetch("https://highscoreapi.herokuapp.com/scores").then(function (response) {
        //this code runs in the FUTURE, when the server responds.
        response.json().then(function (scores) {
            //this code runs even later, when the data is ready.
        console.log("DATA FROM SERVER:",scores); 
        var list = document.querySelector("#high-scores");  
        list.innerHTML = "";  
            scores.forEach(function (score) {
                var item = document.createElement("li");
                item.innerHTML = score.name + ": " + score.score; 
                list.appendChild(item);
            });
        });
    });
    //code here happens immediately, before server responds(too early).
};

var submitScore = function (){
    var initials = prompt("Enter your initials:");
    fetch("https://highscoreapi.herokuapp.com/scores", {
        method: "POST",
        body: JSON.stringify ({
            score: score,
            name: initials
        }),
        headers:{
            "Content-type":"application/json"
        }
    });
};

var startNewGame = function(){
board = {};
score = 0;
addOneTile();
addOneTile();
updateBoard();
};

var newGameButton = document.querySelector("#new-game");
    newGameButton.onclick = function(){
        startNewGame();
};

var getScoresButton = document.querySelector("#get-scores");
getScoresButton.onclick = function () {
    getHighScores();
}

var submitScoreButton = document.querySelector("#submit-score");
submitScoreButton.onclick = function(){
    submitScore();
}

createBoard();
startNewGame();



