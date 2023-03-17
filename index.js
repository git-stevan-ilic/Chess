{

    /*--Main-------------------------------------------------------------------------------------------------------------------------------------------*/
    window.oncontextmenu = (e)=>{e.preventDefault()}
    window.onresize = resize;
    window.onload = initLoad;
    
    let game = {};
    function initLoad(){
        loadImages();
        resetBoard();
        resize();
    
        game.mode = 1;
        game.difficulty = 1;
    
        document.querySelector("#game-canvas").onclick = gameClick;
        document.querySelector("#change-mode").onclick = changeGameMode;
        document.querySelector("#diff-e").onclick = ()=>{changeDifficulty(1)}
        document.querySelector("#diff-m").onclick = ()=>{changeDifficulty(2)}
        document.querySelector("#diff-h").onclick = ()=>{changeDifficulty(3)}
    }
    function resize(){
        let computerMask = document.querySelector(".computer-mask");
        let gameCanvas = document.querySelector("#game-canvas");
        if(window.innerHeight < window.innerWidth){
            let startSize = Math.floor(window.innerHeight*0.95);
            let endSize = startSize - startSize % 8;
            gameCanvas.height = endSize;
            gameCanvas.width = endSize;
            computerMask.style.height = endSize+"px";
            computerMask.style.width = endSize+"px";
        }
        else{
            let startSize = Math.floor(window.innerWidth*0.95);
            let endSize = startSize - startSize % 8;
            gameCanvas.height = endSize;
            gameCanvas.width = endSize;
            computerMask.style.height = endSize+"px";
            computerMask.style.width = endSize+"px";
        }
        game.size = gameCanvas.height/8;
        drawBoard();
    }
    function changeGameMode(){
        let button = document.querySelector("#change-mode");
        let difficulty = document.querySelector(".difficulty");
        if(game.mode === 0){
            difficulty.style.display = "block";
            button.innerHTML = "Singleplayer";
            game.mode = 1;
        }
        else{
            difficulty.style.display = "none";
            button.innerHTML = "Multiplayer";
            game.mode = 0;
        }
        resetBoard();
    }
    function changeDifficulty(diff){
        if(game.difficulty != diff){
            game.difficulty = diff;
            let prevSelected = document.querySelector(".selected");
            prevSelected.className = "button diff-button";
            switch(diff){
                default:break;
                case 1:document.querySelector("#diff-e").className = "button diff-button selected";break;
                case 2:document.querySelector("#diff-m").className = "button diff-button selected";break;
                case 3:document.querySelector("#diff-h").className = "button diff-button selected";break;
            }
            resetBoard();
        }
    }
    function resetBoard(){
        game.turn = 0;
        game.enPassant = [];
        game.boardMarks = [];
        game.boardPiece = [];
        game.selectedCoords = [];
        game.selectedPiece = null;
        game.whiteKingCoords = [4,7];
        game.blackKingCoords = [4,0];
        game.possibleMoves = 0;
    
        for(let i = 0; i < 8; i++){
            game.boardMarks.push([]);
            for(let j = 0; j < 8; j++){
                game.boardMarks[i].push(0);
            }
        }
        for(let i = 0; i < 8; i++){
            game.boardPiece.push([]);
            for(let j = 0; j < 8; j++){
                switch(j){
                    default:game.boardPiece[i].push(null);break;
                    case 1:game.boardPiece[i].push({turn:1,type:0,img:game.imgB[0],alreadyMoved:false,enPassant:-1});break;
                    case 6:game.boardPiece[i].push({turn:0,type:0,img:game.imgW[0],alreadyMoved:false,enPassant:-1});break;
                    case 0:
                        if(i === 0 || i === 7) game.boardPiece[i].push({turn:1,type:1,img:game.imgB[1],alreadyMoved:false});
                        else if(i === 1 || i === 6) game.boardPiece[i].push({turn:1,type:2,img:game.imgB[2]});
                        else if(i === 2 || i === 5) game.boardPiece[i].push({turn:1,type:3,img:game.imgB[3]});
                        else if(i === 3) game.boardPiece[i].push({turn:1,type:4,img:game.imgB[4]});
                        else game.boardPiece[i].push({turn:1,type:5,img:game.imgB[5],alreadyMoved:false});
                        break;
                    case 7:
                        if(i === 0 || i === 7) game.boardPiece[i].push({turn:0,type:1,img:game.imgW[1]});
                        else if(i === 1 || i === 6) game.boardPiece[i].push({turn:0,type:2,img:game.imgW[2]});
                        else if(i === 2 || i === 5) game.boardPiece[i].push({turn:0,type:3,img:game.imgW[3]});
                        else if(i === 3) game.boardPiece[i].push({turn:0,type:4,img:game.imgW[4]});
                        else game.boardPiece[i].push({turn:0,type:5,img:game.imgW[5]});
                        break;
                }
            }
        }
        drawBoard();
    }
    
    /*--Drawing----------------------------------------------------------------------------------------------------------------------------------------*/
    function loadImages(){
        let knightW = new Image(); knightW.src = "images/white/knight.png";
        let bishopW = new Image(); bishopW.src = "images/white/bishop.png";
        let queenW  = new Image(); queenW.src  = "images/white/queen.png";
        let kingW   = new Image(); kingW.src   = "images/white/king.png";
        let pawnW   = new Image(); pawnW.src   = "images/white/pawn.png";
        let rookW   = new Image(); rookW.src   = "images/white/rook.png";
    
        let knightB = new Image(); knightB.src = "images/black/knight.png";
        let bishopB = new Image(); bishopB.src = "images/black/bishop.png";
        let queenB  = new Image(); queenB.src  = "images/black/queen.png";
        let kingB   = new Image(); kingB.src   = "images/black/king.png";
        let pawnB   = new Image(); pawnB.src   = "images/black/pawn.png";
        let rookB   = new Image(); rookB.src   = "images/black/rook.png";
    
        game.imgW = [pawnW,rookW,knightW,bishopW,queenW,kingW];
        game.imgB = [pawnB,rookB,knightB,bishopB,queenB,kingB];
        rookB.onload = ()=>{setTimeout(()=>{drawBoard()},100)}
    }
    function drawBoard(){
        let gameCanvas = document.querySelector("#game-canvas");
        let ctx = gameCanvas.getContext("2d");
    
        for(let j = 0; j < 8; j++){
            let type = Math.ceil(j % 2);
            for(let i = 0; i < 8; i++){
                ctx.beginPath();
                if(type === 0) ctx.fillStyle = "rgb(255,220,180)";
                else ctx.fillStyle = "rgb(50,25,0)";
                ctx.fillRect(i*game.size,j*game.size,game.size,game.size);
                ctx.closePath();
                if(type === 0) type = 1;
                else type = 0;
                drawMarks(ctx,i,j);
                drawPieces(ctx,i,j);
            }
        }
        drawCheck(ctx);
    }
    function drawMarks(ctx,i,j){
        switch(game.boardMarks[i][j]){
            default:break;
            case 1:
                ctx.beginPath();
                ctx.fillStyle = "rgb(255,255,255)";
                ctx.fillRect(i*game.size+game.size*0.03,j*game.size+game.size*0.03,game.size*0.94,game.size*0.94);
                ctx.closePath();
                break;
            case 2:
                ctx.beginPath();
                ctx.lineWidth = game.size/10;
                ctx.strokeStyle = "rgba(255,255,255,0.6)";
                ctx.arc(i*game.size+game.size/2,j*game.size+game.size/2,game.size*0.2,0,2*Math.PI);
                ctx.stroke();
                ctx.closePath();
                break;
            case 3:
                ctx.beginPath();
                ctx.fillStyle = "rgb(255,0,0)";
                ctx.fillRect(i*game.size+game.size*0.03,j*game.size+game.size*0.03,game.size*0.94,game.size*0.94);
                ctx.closePath();
                break;
            case 4:
                ctx.beginPath();
                ctx.fillStyle = "rgb(150,0,0)";
                ctx.fillRect(i*game.size+game.size*0.03,j*game.size+game.size*0.03,game.size*0.94,game.size*0.94);
                ctx.closePath();
                break;
        }
    }
    function drawPieces(ctx,i,j){
        let imgWidth = Math.floor(game.size/1.5);
        let imgLeft = (game.size-imgWidth)/2;
        if(game.boardPiece[i][j]){
            ctx.beginPath();
            ctx.drawImage(
                game.boardPiece[i][j].img,
                i*game.size+imgLeft,
                j*game.size,
                imgWidth,
                game.size
                );
            ctx.closePath();
        }
    }
    function drawCheck(ctx){
        let kingX, kingY;
        if(game.turn === 0){
            kingX = game.whiteKingCoords[0];
            kingY = game.whiteKingCoords[1];
        }
        else{
            kingX = game.blackKingCoords[0];
            kingY = game.blackKingCoords[1];
        }
        let checked = checkForCheck(kingX,kingY);
        if(checked > -1){
            if(checked === 0){
                game.boardMarks[game.whiteKingCoords[0]][game.whiteKingCoords[1]] = 4;
                drawMarks(ctx,game.whiteKingCoords[0],game.whiteKingCoords[1]);
                drawPieces(ctx,game.whiteKingCoords[0],game.whiteKingCoords[1]);
            }
            else{
                game.boardMarks[game.blackKingCoords[0]][game.blackKingCoords[1]] = 4
                drawMarks(ctx,game.blackKingCoords[0],game.blackKingCoords[1]);
                drawPieces(ctx,game.blackKingCoords[0],game.blackKingCoords[1]);
            };
        }
    }
    
    /*--Game Logic-------------------------------------------------------------------------------------------------------------------------------------*/
    function gameClick(e,givenX,givenY,compInit){
        let x = Math.floor(e.offsetX/game.size);
        let y = Math.floor(e.offsetY/game.size);
        if(givenX != undefined) x = givenX;
        if(givenY != undefined) y = givenY;
    
        if(!game.selectedPiece){
            let currPiece = game.boardPiece[x][y];
            if(currPiece && currPiece.turn === game.turn){
                game.selectedPiece = currPiece;
                game.selectedCoords = [x,y];
                markBoard(x,y,currPiece.type);
            }
        }
        else{
            let currMark = game.boardMarks[x][y];
            if(currMark === 0){
                demarkBoard();
                if(game.boardPiece[x][y] && game.boardPiece[x][y].turn === game.turn){
                    game.selectedPiece = game.boardPiece[x][y];
                    game.selectedCoords = [x,y];
                    markBoard(x,y,game.selectedPiece.type);
                }
            }
            else if(currMark === 4){
                if(game.boardPiece[x][y].turn === game.turn){
                    demarkBoard();
                }
            }
            else{
                if(x === game.selectedCoords[0] && y === game.selectedCoords[1]) demarkBoard();
                else{
                    game.boardPiece[x][y] = game.selectedPiece;
                    if(game.enPassant.length > 0){
                        game.boardPiece[game.enPassant[0]][game.enPassant[1]] = null;
                        game.enPassant = [];
                    }
                    if(game.selectedPiece.type === 0){
                        if(game.turn === 0 && y === 0) game.boardPiece[x][y] = {turn:0,type:4,img:game.imgW[4]}
                        else if(game.turn === 1 && y === 7) game.boardPiece[x][y] = {turn:1,type:4,img:game.imgB[4]}
                        if(game.turn === 0){
                            if(!game.boardPiece[x][y].alreadyMoved && y === 4){
                                let l = x - 1, r = x + 1;
                                if(l >= 0 && game.boardPiece[l][y] && game.boardPiece[l][y].type === 0 && game.boardPiece[l][y].turn != game.turn) game.boardPiece[l][y].enPassant = 1;
                                if(r <= 7 && game.boardPiece[r][y] && game.boardPiece[r][y].type === 0 && game.boardPiece[r][y].turn != game.turn) game.boardPiece[r][y].enPassant = 0;
                            }
                        }
                        else{
                            if(!game.boardPiece[x][y].alreadyMoved && y === 3){
                                let l = x - 1, r = x + 1;
                                if(l >= 0 && game.boardPiece[l][y] && game.boardPiece[l][y].type === 0) game.boardPiece[l][y].enPassant = 1;
                                if(r <= 7 && game.boardPiece[r][y] && game.boardPiece[r][y].type === 0) game.boardPiece[r][y].enPassant = 0;
                            }
                        }
                        game.boardPiece[x][y].alreadyMoved = true;
                        if(game.boardPiece[x][y].enPassant > -1) game.boardPiece[x][y].enPassant = -1;
                    }
                    if(game.selectedPiece.type === 1 || game.selectedPiece.type === 5) game.boardPiece[x][y].alreadyMoved = true;
                    if(game.selectedPiece.type === 5){
                        if(game.turn === 0){
                            if(game.whiteKingCoords[0]-x === 2){
                                game.boardPiece[3][7] = {turn:0,type:1,img:game.imgW[1],alreadyMoved:true}
                                game.boardPiece[0][7] = null;
                            }
                            else if(game.whiteKingCoords[0]-x === -2){
                                game.boardPiece[5][7] = {turn:0,type:1,img:game.imgW[1],alreadyMoved:true}
                                game.boardPiece[7][7] = null;
                            }
                            game.whiteKingCoords = [x,y];
                        }
                        else{
                            if(game.blackKingCoords[0]-x === 2){
                                game.boardPiece[3][0] = {turn:1,type:1,img:game.imgB[1],alreadyMoved:true}
                                game.boardPiece[0][0] = null;
                            }
                            else if(game.blackKingCoords[0]-x === -2){
                                game.boardPiece[5][0] = {turn:1,type:1,img:game.imgB[1],alreadyMoved:true}
                                game.boardPiece[7][0] = null;
                            }
                            game.blackKingCoords = [x,y];
                        }
                    }
                    game.boardPiece[game.selectedCoords[0]][game.selectedCoords[1]] = null;
                    if(game.turn === 0) game.turn = 1;
                    else game.turn = 0;
                    demarkBoard();
                    if(!compInit) checkForGameOver();
                    if(game.mode === 1 && !compInit) computerTurn();
                }        
            }
        }
        if(!compInit) drawBoard();
    }
    function demarkBoard(){
        game.selectedCoords = [];
        game.selectedPiece = null;
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                game.boardMarks[i][j] = 0;
            }
        }
    }
    function markBoard(i,j,type){
        game.boardMarks[i][j] = 1;
        switch(type){
            default:break;
            case 0:pawnLogic(i,j,false,false);break;
            case 1:rookLogic(i,j,false,false);break;
            case 2:knightLogic(i,j,false,false);break;
            case 3:bishopLogic(i,j,false,false);break;
            case 4:queenLogic(i,j,false,false);break;
            case 5:kingLogic(i,j,false,false);break;
        }
    }
    function checkForCheck(i,j){
        if(i <= 7 && i >= 0 && j <= 7 && j >= 0){
            let tempBoard = JSON.parse(JSON.stringify(game.boardPiece));
            if(i != undefined && j != undefined && game.selectedPiece){
                tempBoard[i][j] = game.selectedPiece;
                tempBoard[game.selectedCoords[0]][game.selectedCoords[1]] = null;
            }
            let kingX, kingY;
            if(game.turn === 0){
                kingX = game.whiteKingCoords[0];
                kingY = game.whiteKingCoords[1];
            }
            else{
                kingX = game.blackKingCoords[0];
                kingY = game.blackKingCoords[1];
            }
            if(i != undefined  && j != undefined  && game.selectedPiece && game.selectedPiece.type === 5){
                kingX = i
                kingY = j
            }
            let y1Index = kingY;
            while(1){
                y1Index--;
                if(y1Index < 0) break;
                if(tempBoard[kingX][y1Index]){
                    if(tempBoard[kingX][y1Index].turn === game.turn) break;
                    else if(tempBoard[kingX][y1Index].type === 1 || tempBoard[kingX][y1Index].type === 4) return game.turn;
                    else break;
                }  
            }
            let y2Index = kingY;
            while(1){
                y2Index++;
                if(y2Index > 7) break;
                if(tempBoard[kingX][y2Index]){
                    if(tempBoard[kingX][y2Index].turn === game.turn) break;
                    else if(tempBoard[kingX][y2Index].type === 1 || tempBoard[kingX][y2Index].type === 4) return game.turn;
                    else break;
                }  
            }
            let x1Index = kingX;
            while(1){
                x1Index--;
                if(x1Index < 0) break;
                if(tempBoard[x1Index][kingY]){
                    if(tempBoard[x1Index][kingY].turn === game.turn) break;
                    else if(tempBoard[x1Index][kingY].type === 1 || tempBoard[x1Index][kingY].type === 4) return game.turn;
                    else break;
                }  
            }
            let x2Index = kingX;
            while(1){
                x2Index++;
                if(x2Index > 7) break;
                if(tempBoard[x2Index][kingY]){
                    if(tempBoard[x2Index][kingY].turn === game.turn) break;
                    else if(tempBoard[x2Index][kingY].type === 1 || tempBoard[x2Index][kingY].type === 4) return game.turn;
                    else break;
                } 
            }
    
            let xD1 = kingX, yD1 = kingY;
            while(1){
                xD1--;
                yD1--;
                if(xD1 < 0 || yD1 < 0) break;
                if(tempBoard[xD1][yD1]){
                    if(tempBoard[xD1][yD1].turn === game.turn) break;
                    else{
                        if(tempBoard[xD1][yD1].type === 3 || tempBoard[xD1][yD1].type === 4) return game.turn;
                        else if(tempBoard[xD1][yD1].type === 0){
                            if(game.turn === 0 && yD1 === kingY - 1) return game.turn;
                            else if(game.turn === 1 && yD1 === kingY + 1) return game.turn;
                        }
                        else break;
                    }
                }
            }
            let xD2 = kingX, yD2 = kingY;
            while(1){
                xD2++;
                yD2--;
                if(xD2 > 7 || yD2 < 0) break;
                if(tempBoard[xD2][yD2]){
                    if(tempBoard[xD2][yD2].turn === game.turn) break;
                    else{
                        if(tempBoard[xD2][yD2].type === 3 || tempBoard[xD2][yD2].type === 4) return game.turn;
                        else if(tempBoard[xD2][yD2].type === 0){
                            if(game.turn === 0 && yD2 === kingY - 1) return game.turn;
                            else if(game.turn === 1 && yD2 === kingY + 1) return game.turn;
                        }
                        else break;
                    }
                }
            }
            let xD3 = kingX, yD3 = kingY;
            while(1){
                xD3--;
                yD3++;
                if(xD3 < 0 || yD3 > 7) break;
                if(tempBoard[xD3][yD3]){
                    if(tempBoard[xD3][yD3].turn === game.turn) break;
                    else{
                        if(tempBoard[xD3][yD3].type === 3 || tempBoard[xD3][yD3].type === 4) return game.turn;
                        else if(tempBoard[xD3][yD3].type === 0){
                            if(game.turn === 0 && yD3 === kingY - 1) return game.turn;
                            else if(game.turn === 1 && yD3 === kingY + 1) return game.turn;
                        }
                        else break;
                    }
                }
            }
            let xD4 = kingX, yD4 = kingY;
            while(1){
                xD4++;
                yD4++;
                if(xD4 > 7 || yD4 > 7) break;
                if(tempBoard[xD4][yD4]){
                    if(tempBoard[xD4][yD4].turn === game.turn) break;
                    else{
                        if(tempBoard[xD4][yD4].type === 3 || tempBoard[xD4][yD4].type === 4) return game.turn;
                        else if(tempBoard[xD4][yD4].type === 0){
                            if(game.turn === 0 && yD4 === kingY - 1) return game.turn;
                            else if(game.turn === 1 && yD4 === kingY + 1) return game.turn;
                        }
                        else break;
                    }
                }
            }
            let indexX1 = kingX - 2, indexX2 = kingX + 2;
            let indexY1 = kingY - 2, indexY2 = kingY + 2;
            for(let m = indexX1; m <= indexX2; m++){
                for(let n = indexY1; n <= indexY2; n++){
                    if(m > indexX1 && m < indexX2 && n > indexY1 && n < indexY2) continue;
                    else{
                        if((m === indexX1 || m === indexX2) && n != game.selectedCoords[1] && n != indexY1 && n != indexY2){
                            if(m >= 0 && m <=7 && n >= 0 && n <= 7){
                                if(tempBoard[m][n] && tempBoard[m][n].turn != game.turn && tempBoard[m][n].type === 2) return game.turn;
                            }
                        }
                        if((n === indexY1 || n === indexY2) && m != game.selectedCoords[0] && m != indexX1 && m != indexX2){
                            if(m >= 0 && m <= 7 && n >= 0 && n <= 7){
                                if(tempBoard[m][n] && tempBoard[m][n].turn != game.turn && tempBoard[m][n].type === 2) return game.turn;
                            }
                        }
                    }
                }
            }
        }
        return -1;
    }
    function checkForGameOver(){
        game.possibleMoves = 0;
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(game.boardPiece[i][j] && game.boardPiece[i][j].turn === game.turn){
                    game.selectedPiece = game.boardPiece[i][j];
                    game.selectedCoords = [i,j];
                    switch(game.boardPiece[i][j].type){
                        default:break;
                        case 0:pawnLogic(i,j,true,false);break;
                        case 1:rookLogic(i,j,true,false);break;
                        case 2:knightLogic(i,j,true,false);break;
                        case 3:bishopLogic(i,j,true,false);break;
                        case 4:queenLogic(i,j,true,false);break;
                        case 5:kingLogic(i,j,true,false);break;
                    }
                }
            }
        }
        game.selectedPiece = null;
        game.selectedCoords = [];
        if(game.possibleMoves === 0){
            if(game.turn === 0){
                let checked = checkForCheck(game.whiteKingCoords[0],game.whiteKingCoords[1]);
                if(checked === -1) gameOver(2);
                else gameOver(1);
            }
            else{
                let checked = checkForCheck(game.blackKingCoords[0],game.blackKingCoords[1]);
                if(checked === -1) gameOver(2);
                else gameOver(0);
            }
        }
    }
    function gameOver(type){
        let gameOverBody = document.querySelector(".game-over-body");
        switch(type){
            default:break;
            case 0:gameOverBody.innerHTML = "Game Over<br>White Wins";break;
            case 1:gameOverBody.innerHTML = "Game Over<br>Black Wins";break;
            case 2:gameOverBody.innerHTML = "Stalemate";break;
        }
        document.querySelector(".game-over-mask").style.display = "block";
    }
    
    /*--Game Piece Logic-------------------------------------------------------------------------------------------------------------------------------*/
    function pawnLogic(i,j,test,compDepth){
        let possible = null;
        if(compDepth) possible = [];
    
        let newJ1,newJ2,firstJ,opTurn;
        if(game.turn === 0){
            newJ1 = j-1;
            newJ2 = j-2;
            firstJ = 6;
            opTurn = 1;
        }
        else{
            newJ1 = j+1;
            newJ2 = j+2;
            firstJ = 1;
            opTurn = 0;
        }
        if(newJ1 >= 0 && newJ1 <= 7 && !game.boardPiece[i][newJ1]){
            if(checkForCheck(i,newJ1) === -1){
                if(compDepth) possible.push({x:i,y:newJ1,initX:i,initY:j});
                else {
                    if(!test) game.boardMarks[i][newJ1] = 2;
                    else game.possibleMoves++;
                }
            }
            if(newJ2 >= 0 && !game.boardPiece[i][newJ2] && j === firstJ && checkForCheck(i,newJ2) === -1){
                if(compDepth) possible.push({x:i,y:newJ2,initX:i,initY:j});
                else{
                    if(!test) game.boardMarks[i][newJ2] = 2;
                    else game.possibleMoves++;
                }
            }
        }
        
        let newX1 = i-1;
        let newX2 = i+1;
        if(checkForCheck(newX1,newJ1) === -1){
            if(newJ1 >= 0 && newX1 >= 0 && game.boardPiece[newX1][newJ1] && game.boardPiece[newX1][newJ1].turn === opTurn){
                if(compDepth) possible.push({x:newX1,y:newJ1,initX:i,initY:j});
                else{
                    if(!test) game.boardMarks[newX1][newJ1] = 3;
                    else game.possibleMoves++;
                }
            }
        }
        if(checkForCheck(newX2,newJ1) === -1){
            if(newJ1 >= 0 && newX2 <= 7 && game.boardPiece[newX2][newJ1] && game.boardPiece[newX2][newJ1].turn === opTurn){
                if(compDepth) possible.push({x:newX2,y:newJ1,initX:i,initY:j});
                else{
                    if(!test) game.boardMarks[newX2][newJ1] = 3;
                    else game.possibleMoves++;
                }
            }
        }
    
        if(game.selectedPiece && game.selectedPiece.enPassant > -1){
            if(game.selectedPiece.enPassant === 0){
                if(!game.boardPiece[newX1][newJ1] && checkForCheck(newX1,newJ1) === -1){
                    if(compDepth) possible.push({x:newX1,y:newJ1,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else{
                            game.boardMarks[newX1][newJ1] = 2;
                            game.enPassant = [newX1,j];
                        }
                    }
                }
            }
            else{
                if(!game.boardPiece[newX2][newJ1] && checkForCheck(newX2,newJ1) === -1){
                    if(compDepth) possible.push({x:newX2,y:newJ1,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else{
                            game.boardMarks[newX2][newJ1] = 2;
                            game.enPassant = [newX2,j];
                        }  
                    }
                }
            }
        }
        return possible;
    }
    function rookLogic(i,j,test,compDepth){
        let possible = null;
        if(compDepth) possible = [];
    
        let y1Index = j;
        while(1){
            y1Index--;
            if(y1Index < 0) break;
            if(game.boardPiece[i][y1Index]){
                if(game.boardPiece[i][y1Index].turn === game.turn) break;
                else if(checkForCheck(i,y1Index) === -1){
                    if(compDepth) possible.push({x:i,y:y1Index,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[i][y1Index] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(i,y1Index) === -1){
                if(compDepth) possible.push({x:i,y:y1Index,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[i][y1Index] = 2;
                }
            }
        }
        let y2Index = j;
        while(1){
            y2Index++;
            if(y2Index > 7) break;
            if(game.boardPiece[i][y2Index]){
                if(game.boardPiece[i][y2Index].turn === game.turn) break;
                else if(checkForCheck(i,y2Index) === -1){
                    if(compDepth) possible.push({x:i,y:y2Index,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[i][y2Index] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(i,y2Index) === -1){
                if(compDepth) possible.push({x:i,y:y2Index,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[i][y2Index] = 2;
                }
            }
        }
        let x1Index = i;
        while(1){
            x1Index--;
            if(x1Index < 0) break;
            if(game.boardPiece[x1Index][j]){
                if(game.boardPiece[x1Index][j].turn === game.turn) break;
                else if(checkForCheck(x1Index,j) === -1){
                    if(compDepth) possible.push({x:x1Index,y:j,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[x1Index][j] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(x1Index,j) === -1){
                if(compDepth) possible.push({x:x1Index,y:j,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[x1Index][j] = 2;
                }
            }
        }
        let x2Index = i;
        while(1){
            x2Index++;
            if(x2Index > 7) break;
            if(game.boardPiece[x2Index][j]){
                if(game.boardPiece[x2Index][j].turn === game.turn) break;
                else if(checkForCheck(x2Index,j) === -1){
                    if(compDepth) possible.push({x:x2Index,y:j,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[x2Index][j] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(x2Index,j) === -1){
                if(compDepth) possible.push({x:x2Index,y:j,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[x2Index][j] = 2;
                }
            }
        }
        return possible;
    }
    function knightLogic(i,j,test,compDepth){
        let possible = null;
        if(compDepth) possible = [];
    
        let indexX1 = i - 2, indexX2 = i + 2;
        let indexY1 = j - 2, indexY2 = j + 2;
        for(let m = indexX1; m <= indexX2; m++){
            for(let n = indexY1; n <= indexY2; n++){
                if(m > indexX1 && m < indexX2 && n > indexY1 && n < indexY2) continue;
                else{
                    if((m === indexX1 || m === indexX2) && n != game.selectedCoords[1] && n != indexY1 && n != indexY2){
                        if(m >= 0 && m <= 7 && n >= 0 && n <= 7 && checkForCheck(m,n) === -1){
                            if(game.boardPiece[m][n] && game.boardPiece[m][n].turn != game.turn){
                                if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                                else{
                                    if(test) game.possibleMoves++;
                                    else game.boardMarks[m][n] = 3;
                                }
                            }
                            else if(!game.boardPiece[m][n]){
                                if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                                else{
                                    if(test) game.possibleMoves++;
                                    else game.boardMarks[m][n] = 2;
                                }
                            }
                        }
                    }
                    if((n === indexY1 || n === indexY2) && m != game.selectedCoords[0] && m != indexX1 && m != indexX2){
                        if(m >= 0 && m <= 7 && n >= 0 && n <= 7 && checkForCheck(m,n) === -1){
                            if(game.boardPiece[m][n] && game.boardPiece[m][n].turn != game.turn){
                                if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                                else{
                                    if(test) game.possibleMoves++;
                                    else game.boardMarks[m][n] = 3;
                                }
                            }
                            else if(!game.boardPiece[m][n]){
                                if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                                else{
                                    if(test) game.possibleMoves++;
                                    else game.boardMarks[m][n] = 2;
                                }
                            }
                        }
                    }
                }
            }
        }
        return possible;
    }
    function bishopLogic(i,j,test,compDepth){
        let possible = null;
        if(compDepth) possible = [];
    
        let xD1 = i, yD1 = j;
        while(1){
            xD1--;
            yD1--;
            if(xD1 < 0 || yD1 < 0) break;
            if(game.boardPiece[xD1][yD1]){
                if(game.boardPiece[xD1][yD1].turn === game.turn) break;
                else if(checkForCheck(xD1,yD1) === -1){
                    if(compDepth) possible.push({x:xD1,y:yD1,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[xD1][yD1] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(xD1,yD1) === -1){
                if(compDepth) possible.push({x:xD1,y:yD1,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[xD1][yD1] = 2;
                }
            }
        }
        let xD2 = i, yD2 = j;
        while(1){
            xD2++;
            yD2--;
            if(xD2 > 7 || yD2 < 0) break;
            if(game.boardPiece[xD2][yD2]){
                if(game.boardPiece[xD2][yD2].turn === game.turn) break;
                else if(checkForCheck(xD2,yD2) === -1){
                    if(compDepth) possible.push({x:xD2,y:yD2,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[xD2][yD2] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(xD2,yD2) === -1){
                if(compDepth) possible.push({x:xD2,y:yD2,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[xD2][yD2] = 2;
                }
            }
        }
        let xD3 = i, yD3 = j;
        while(1){
            xD3--;
            yD3++;
            if(xD3 < 0 || yD3 > 7) break;
            if(game.boardPiece[xD3][yD3]){
                if(game.boardPiece[xD3][yD3].turn === game.turn) break;
                else if(checkForCheck(xD3,yD3) === -1){
                    if(compDepth) possible.push({x:xD3,y:yD3,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[xD3][yD3] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(xD3,yD3) === -1){
                if(compDepth) possible.push({x:xD3,y:yD3,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[xD3][yD3] = 2;
                }
            }
        }
        let xD4 = i, yD4 = j;
        while(1){
            xD4++;
            yD4++;
            if(xD4 > 7 || yD4 > 7) break;
            if(game.boardPiece[xD4][yD4]){
                if(game.boardPiece[xD4][yD4].turn === game.turn) break;
                else if(checkForCheck(xD4,yD4) === -1){
                    if(compDepth) possible.push({x:xD4,y:yD4,initX:i,initY:j});
                    else{
                        if(test) game.possibleMoves++;
                        else game.boardMarks[xD4][yD4] = 3;
                    }
                    break;
                }
            }
            if(checkForCheck(xD4,yD4) === -1){
                if(compDepth) possible.push({x:xD4,y:yD4,initX:i,initY:j});
                else{
                    if(test) game.possibleMoves++;
                    else game.boardMarks[xD4][yD4] = 2;
                }
            }
        }
        return possible;
    }
    function queenLogic(i,j,test,compDepth){
        let possible1 = bishopLogic(i,j,test,compDepth);
        let possible2 = rookLogic(i,j,test,compDepth);
        if(compDepth) return possible1.concat(possible2);
    }
    function kingLogic(i,j,test,compDepth){
        let possible = null;
        if(compDepth) possible = [];
    
        let startI = i - 1, endI = i + 1;
        let startJ = j - 1, endJ = j + 1;
        for(let m = startI; m <= endI; m++){
            for(let n = startJ; n <= endJ; n++){
                if(m >= 0 && m <= 7 && n >= 0 && n <= 7){
                    if(checkForCheck(m,n) === -1){
                        if(!game.boardPiece[m][n]){
                            if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                            else{
                                if(test) game.possibleMoves++;
                                else game.boardMarks[m][n] = 2;
                            }
                        }
                        else if(game.boardPiece[m][n].turn != game.turn){
                            if(compDepth) possible.push({x:m,y:n,initX:i,initY:j});
                            else{
                                if(test) game.possibleMoves++;
                                else game.boardMarks[m][n] = 3;
                            }
                        }
                    }
                }
            }
        }
        if(game.selectedPiece && !game.selectedPiece.alreadyMoved){
            let leftX = i;
            while(1){
                leftX--;
                if(leftX < 0) break;
                if(game.boardPiece[leftX][j]){
                    if(game.boardPiece[leftX][j].type != 1) break;
                    else{
                        if(game.boardPiece[leftX][j].alreadyMoved) break;
                        else{
                            if(compDepth) possible.push({x:i-2,y:j,initX:i,initY:j});
                            else{
                                if(test) game.possibleMoves++;
                                else game.boardMarks[i-2][j] = 2;
                            }
                        }
                    }
                }
            }
            let rightX = i;
            while(1){
                rightX++;
                if(rightX > 7) break;
                if(game.boardPiece[rightX][j]){
                    if(game.boardPiece[rightX][j].type != 1) break;
                    else{
                        if(game.boardPiece[rightX][j].alreadyMoved) break;
                        else{
                            if(compDepth) possible.push({x:i+2,y:j,initX:i,initY:j});
                            else{
                                if(test) game.possibleMoves++;
                                else game.boardMarks[i+2][j] = 2;
                            }
                        }
                    }
                }
            }
        }
        return possible;
    }
    
    /*--Computer AI------------------------------------------------------------------------------------------------------------------------------------*/
    function computerTurn(){
        let computerMask = document.querySelector(".computer-mask");
        computerMask.style.display = "block";
    
        setTimeout(()=>{
            let evalFilter = [];
            game.possibleMoves = 0;
            let possibleDepth0 = calculatePossible();
            let allEvals = [], compTurn0 = game.turn;
            for(let i = 0; i < possibleDepth0.length; i++){
                if(possibleDepth0[i]){
                    let backUpBoard0 = copyBoard();
                    let whiteKingBackup0 = JSON.parse(JSON.stringify(game.whiteKingCoords));
                    let blackKingBackup0 = JSON.parse(JSON.stringify(game.blackKingCoords));
                    gameClick({offsetX:0,offsetY:0},possibleDepth0[i].initX,possibleDepth0[i].initY,true);
                    gameClick({offsetX:0,offsetY:0},possibleDepth0[i].x,possibleDepth0[i].y,true);
    
                    game.possibleMoves = 0;
                    let compTurn1 = game.turn;
                    let possibleDepth1 = calculatePossible();
                    for(let j = 0; j < possibleDepth1.length; j++){
                        if(possibleDepth1[j]){
                            let backUpBoard1 = copyBoard();
                            let whiteKingBackup1 = JSON.parse(JSON.stringify(game.whiteKingCoords));
                            let blackKingBackup1 = JSON.parse(JSON.stringify(game.blackKingCoords));
                            gameClick({offsetX:0,offsetY:0},possibleDepth1[j].initX,possibleDepth1[j].initY,true);
                            gameClick({offsetX:0,offsetY:0},possibleDepth1[j].x,possibleDepth1[j].y,true);
    
                            let eval = evaluateBoard();
                            let currEvalScore = eval[1]-eval[0];
                            evalFilter.push(currEvalScore);
                            evalFilter.sort((a,b)=>{return b-a});
                            while(evalFilter.length > 500) evalFilter.pop();
                            if(currEvalScore >= evalFilter[evalFilter.length-1]){
                                if(game.difficulty === 1) allEvals.push({moves:[possibleDepth0[i],possibleDepth1[j]],diff:eval[1]-eval[0]});
                                else{
                                    // Difficulty 2
                                    game.possibleMoves = 0;
                                    let compTurn2 = game.turn;
                                    let possibleDepth2 = calculatePossible();
                                    for(let k = 0; k < possibleDepth2.length; k++){
                                        if(possibleDepth2[k]){
                                            let backUpBoard2 = copyBoard();
                                            let whiteKingBackup2 = JSON.parse(JSON.stringify(game.whiteKingCoords));
                                            let blackKingBackup2 = JSON.parse(JSON.stringify(game.blackKingCoords));
                                            gameClick({offsetX:0,offsetY:0},possibleDepth2[k].initX,possibleDepth2[k].initY,true);
                                            gameClick({offsetX:0,offsetY:0},possibleDepth2[k].x,possibleDepth2[k].y,true);
        
                                            let eval = evaluateBoard();
                                            let currEvalScore = eval[1]-eval[0];
                                            evalFilter.push(currEvalScore);
                                            evalFilter.sort((a,b)=>{return b-a});
                                            while(evalFilter.length > 500) evalFilter.pop();
                                            if(currEvalScore >= evalFilter[evalFilter.length-1]){
                                                if(game.difficulty === 2) allEvals.push({moves:[possibleDepth0[i],possibleDepth1[j],possibleDepth2[k]],diff:eval[1]-eval[0]});
                                                else{
                                                    // Difficulty 3
                                                    game.possibleMoves = 0;
                                                    let compTurn3 = game.turn;
                                                    let possibleDepth3 = calculatePossible();
                                                    for(let l = 0; l < possibleDepth3.length; l++){
                                                        if(possibleDepth3[k]){
                                                            let backUpBoard3 = copyBoard();
                                                            let whiteKingBackup3 = JSON.parse(JSON.stringify(game.whiteKingCoords));
                                                            let blackKingBackup3 = JSON.parse(JSON.stringify(game.blackKingCoords));
                                                            gameClick({offsetX:0,offsetY:0},possibleDepth3[l].initX,possibleDepth3[l].initY,true);
                                                            gameClick({offsetX:0,offsetY:0},possibleDepth3[l].x,possibleDepth3[k].y,true);
                                                            
                                                            let eval = evaluateBoard();
                                                            let currEvalScore = eval[1]-eval[0];
                                                            evalFilter.push(currEvalScore);
                                                            evalFilter.sort((a,b)=>{return b-a});
                                                            while(evalFilter.length > 500) evalFilter.pop();
            
                                                            if(game.difficulty === 3) allEvals.push({moves:[possibleDepth0[i],possibleDepth1[j],possibleDepth2[k],possibleDepth3[l]],diff:eval[1]-eval[0]});
                                                            game.whiteKingCoords = whiteKingBackup3;
                                                            game.blackKingCoords = blackKingBackup3;
                                                            game.boardPiece = backUpBoard3;
                                                            game.turn = compTurn3;
                                                        }
                                                    }
                                                }
                                            }
                                            game.whiteKingCoords = whiteKingBackup2;
                                            game.blackKingCoords = blackKingBackup2;
                                            game.boardPiece = backUpBoard2;
                                            game.turn = compTurn2;
                                        }
                                    }
                                }
                            }
                            game.whiteKingCoords = whiteKingBackup1;
                            game.blackKingCoords = blackKingBackup1;
                            game.boardPiece = backUpBoard1;
                            game.turn = compTurn1;
                        }
                    }
                    game.whiteKingCoords = whiteKingBackup0;
                    game.blackKingCoords = blackKingBackup0;
                    game.boardPiece = backUpBoard0;
                    game.turn = compTurn0;
                }
            }
            console.log();
            console.log(allEvals);
            if(allEvals.length > 0){
                allEvals.sort((a,b)=>{return b.diff - a.diff});
                console.log(allEvals[0]);
                gameClick({offsetX:0,offsetY:0},allEvals[0].moves[0].initX,allEvals[0].moves[0].initY,true);
                gameClick({offsetX:0,offsetY:0},allEvals[0].moves[0].x,allEvals[0].moves[0].y,true);
            }
            computerMask.style.display = "none";
            drawBoard();
        },100);
    }
    function evaluateBoard(){
        let whiteWeight = 0, blackWeight = 0;
        let pieceWeights = [100,479,280,320,929,60000];
        let boardWeightWhite = {
            p:[
                [ 100, 100, 100, 100, 105, 100, 100,  100],
                [  78,  83,  86,  73, 102,  82,  85,  90],
                [   7,  29,  21,  44,  40,  31,  44,   7],
                [ -17,  16,  -2,  15,  14,   0,  15, -13],
                [ -26,   3,  10,   9,   6,   1,   0, -23],
                [ -22,   9,   5, -11, -10,  -2,   3, -19],
                [ -31,   8,  -7, -37, -36, -14,   3, -31],
                [   0,   0,   0,   0,   0,   0,   0,   0]
            ],
            n:[
                [-66, -53, -75, -75, -10, -55, -58, -70],
                [ -3,  -6, 100, -36,   4,  62,  -4, -14],
                [ 10,  67,   1,  74,  73,  27,  62,  -2],
                [ 24,  24,  45,  37,  33,  41,  25,  17],
                [ -1,   5,  31,  21,  22,  35,   2,   0],
                [-18,  10,  13,  22,  18,  15,  11, -14],
                [-23, -15,   2,   0,   2,   0, -23, -20],
                [-74, -23, -26, -24, -19, -35, -22, -69]
            ],
            b:[
                [-59, -78, -82, -76, -23,-107, -37, -50],
                [-11,  20,  35, -42, -39,  31,   2, -22],
                [ -9,  39, -32,  41,  52, -10,  28, -14],
                [ 25,  17,  20,  34,  26,  25,  15,  10],
                [ 13,  10,  17,  23,  17,  16,   0,   7],
                [ 14,  25,  24,  15,   8,  25,  20,  15],
                [ 19,  20,  11,   6,   7,   6,  20,  16],
                [ -7,   2, -15, -12, -14, -15, -10, -10]
            ],
            r:[
                [ 35,  29,  33,   4,  37,  33,  56,  50],
                [ 55,  29,  56,  67,  55,  62,  34,  60],
                [ 19,  35,  28,  33,  45,  27,  25,  15],
                [  0,   5,  16,  13,  18,  -4,  -9,  -6],
                [-28, -35, -16, -21, -13, -29, -46, -30],
                [-42, -28, -42, -25, -25, -35, -26, -46],
                [-53, -38, -31, -26, -29, -43, -44, -53],
                [-30, -24, -18,   5,  -2, -18, -31, -32]
            ],
            q:[
                [  6,   1,  -8,-104,  69,  24,  88,  26],
                [ 14,  32,  60, -10,  20,  76,  57,  24],
                [ -2,  43,  32,  60,  72,  63,  43,   2],
                [  1, -16,  22,  17,  25,  20, -13,  -6],
                [-14, -15,  -2,  -5,  -1, -10, -20, -22],
                [-30,  -6, -13, -11, -16, -11, -16, -27],
                [-36, -18,   0, -19, -15, -15, -21, -38],
                [-39, -30, -31, -13, -31, -36, -34, -42]
            ],
            k:[
                [  4,  54,  47, -99, -99,  60,  83, -62],
                [-32,  10,  55,  56,  56,  55,  10,   3],
                [-62,  12, -57,  44, -67,  28,  37, -31],
                [-55,  50,  11,  -4, -19,  13,   0, -49],
                [-55, -43, -52, -28, -51, -47,  -8, -50],
                [-47, -42, -43, -79, -64, -32, -29, -32],
                [ -4,   3, -14, -50, -57, -18,  13,   4],
                [ 17,  30,  -3, -14,   6,  -1,  40,  18]
            ]
        }
        let boardWeightBlack = {
            p: boardWeightWhite.p.slice().reverse(),
            n: boardWeightWhite.n.slice().reverse(),
            b: boardWeightWhite.b.slice().reverse(),
            r: boardWeightWhite.r.slice().reverse(),
            q: boardWeightWhite.q.slice().reverse(),
            k: boardWeightWhite.k.slice().reverse()
        }
    
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(game.boardPiece[i][j]){
                    if(game.boardPiece[i][j].turn === 0){
                        switch(game.boardPiece[i][j].type){
                            default:break;
                            case 0:whiteWeight += boardWeightWhite.p[i][j] + pieceWeights[0];break;
                            case 1:whiteWeight += boardWeightWhite.r[i][j] + pieceWeights[1];break;
                            case 2:whiteWeight += boardWeightWhite.n[i][j] + pieceWeights[2];break;
                            case 3:whiteWeight += boardWeightWhite.b[i][j] + pieceWeights[3];break;
                            case 4:whiteWeight += boardWeightWhite.q[i][j] + pieceWeights[4];break;
                            case 5:whiteWeight += boardWeightWhite.k[i][j] + pieceWeights[5];break;
                        }
                    }
                    else{
                        switch(game.boardPiece[i][j].type){
                            default:break;
                            case 0:blackWeight += boardWeightBlack.p[i][j] + pieceWeights[0];break;
                            case 1:blackWeight += boardWeightBlack.r[i][j] + pieceWeights[1];break;
                            case 2:blackWeight += boardWeightBlack.n[i][j] + pieceWeights[2];break;
                            case 3:blackWeight += boardWeightBlack.b[i][j] + pieceWeights[3];break;
                            case 4:blackWeight += boardWeightBlack.q[i][j] + pieceWeights[4];break;
                            case 5:blackWeight += boardWeightBlack.k[i][j] + pieceWeights[5];break;
                        }
                    }
                }
            }
        }
        return [whiteWeight,blackWeight];
    }
    function copyBoard(){
        let backUpBoard = JSON.parse(JSON.stringify(game.boardPiece));
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(backUpBoard[i][j]) backUpBoard[i][j].img = game.boardPiece[i][j].img;
            }
        }
        return backUpBoard;
    }
    function calculatePossible(){
        let possible = [];
        for(let i = 0; i < 8; i++){
            for(let j = 0; j < 8; j++){
                if(game.boardPiece[i][j] && game.boardPiece[i][j].turn === game.turn){
                    game.selectedPiece = game.boardPiece[i][j];
                    game.selectedCoords = [i,j];
                    switch(game.boardPiece[i][j].type){
                        default:break;
                        case 0:possible = possible.concat(pawnLogic(i,j,false,true));break;
                        case 1:possible = possible.concat(rookLogic(i,j,false,true));break;
                        case 2:possible = possible.concat(knightLogic(i,j,false,true));break;
                        case 3:possible = possible.concat(bishopLogic(i,j,false,true));break;
                        case 4:possible = possible.concat(queenLogic(i,j,false,true));break;
                        case 5:possible = possible.concat(kingLogic(i,j,false,true));break;
                    }
                }
            }
        }
        return possible;
    }
    
    }