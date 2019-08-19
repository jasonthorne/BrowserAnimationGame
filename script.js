
//html canvas layers: 
var backgroundCanvas = document.getElementById("background");
var basketCanvas = document.getElementById("basket");
var apple1Canvas = document.getElementById("apple1");
var apple2Canvas = document.getElementById("apple2"); 
var apple3Canvas = document.getElementById("apple3");
var apple4Canvas = document.getElementById("apple4");
var apple5Canvas = document.getElementById("apple5"); 

var canvasW = backgroundCanvas.width; //canvas width
var canvasH = backgroundCanvas.height; //canvas height

//2D contexts:
var backgroundCtx = backgroundCanvas.getContext("2d"); 
var basketCtx = basketCanvas.getContext("2d"); 

var appleCtxs = [
    apple1Canvas.getContext("2d"), 
    apple2Canvas.getContext("2d"), 
    apple3Canvas.getContext("2d"), 
    apple4Canvas.getContext("2d"), 
    apple5Canvas.getContext("2d")
];

//----------------------------------------------------------------------------------------------------
//image preloads:

//preload basket images:
var basketImgs = [];
for (let i=0;i<=11;i++){
    basketImgs[i] = new Image();
    basketImgs[i].src = 'img/baskets/basket' + i.toString() + '.png';
}

var backgroundImg = new Image(); //background image
backgroundImg.src = 'img/background.png'; //image source 

//after background image load:
backgroundImg.onload = function(){
    backgroundCtx.drawImage(backgroundImg, 0, 0, canvasW, canvasH);  //draw background
    basketCtx.drawImage(basketImgs[0], (canvasW - basketW) /2, (canvasH - basketH) - 10, basketW, basketH); //then draw basket
    document.getElementById("timer").innerHTML = "00"; //show initial time as 00
    document.getElementById("score").innerHTML = "00"; //show initial score as 00
}

//----------------------------------------------------------------------------------------------------
//key event listeners:

var key = []; //for holding keycode values 
window.addEventListener("keydown", function(event){ //listens for key press, adds its keycode 
    key[event.keyCode] = true; 
});

window.addEventListener("keyup", function(event){ //listens for key release, removes its keycode
    key[event.keyCode] = false;
});

//----------------------------------------------------------------------------------------------------
//prototype function added to Array class, to allow random picking of elements:

Array.prototype.pickElement = function(){ 
    return this[Math.floor(Math.random()*this.length)]; //return a random element
}//https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array

//----------------------------------------------------------------------------------------------------
//basket:

var basketW = 110, basketH = basketW; //width & height of basket

var Basket = {
    img: (function(){ //basket image
        let img =  new Image();
        img.src = 'img/baskets/basket0.png';
        return img;
    }()),
    xPos: (canvasW - basketW) /2, //x pos of basket
    yPos: (canvasH - basketH) - 10, //y pos of basket
    width: basketW, //width of basket
    height: basketH, //height of basket
    move: function(){
        if (key[37]){ //if left is pressed:
            this.xPos -=25; //decrease x pos 
            
            if(this.xPos <0){this.xPos = 0;}  //stop at canvas's left edge
               
        }else if (key[39]){ //if right is pressed:
            this.xPos += 25; //increase x pos

            if(this.xPos > (canvasW - this.width)){ this.xPos = canvasW - this.width; } //stop at canvas's right edge
        }
    }
};

//----------------------------------------------------------------------------------------------------
//apples:

var apples = []; //array for holding apples 
var appleX = [120, 273, 518, 632, 720]; //x pos of apples  
var appleY = [176, 132, 231, 119, 188]; //y pos of apples  
var appleSpeeds = [6, 9]; //initial drop speeds 
var applePauses = [1000, 2000, 3000, 4000, 5000]; //pause times

function Apple(xPos, yPos, i){
    this.img = (function(){ //apple image
        let img =  new Image();
        img.src = 'img/apple.png';
        return img;
    }());
    this.xPos = xPos; //x pos of apple
    this.yPos = yPos; //y pos of apple
    this.width = 60; //width of apple
    this.height = 60; //height of apple
    this.gravity = 0.3; //gravity force
    this.bounce = 0.1; //bounce factor
    this.speed = appleSpeeds.pickElement(); //picks a speed
    this.canFall = false; //if apple can drop
    this.canScore = true; //if apple can score
    this.canFadeOut = false; //if apple can fade out
    this.canFadeIn = true; //if apple can fade in
    this.pauseTime = applePauses.pickElement(); //picks a pause time
    this.reset = function(){ //resets apple vars

        this.yPos = yPos; //reset y pos
        this.speed = appleSpeeds.pickElement(); //reset speed
        this.canScore = true; //reset ability to score
        this.canFadeOut = false; //prevent fade out 
        this.canFadeIn = true;  //allow fade in 
        this.pauseTime = progress + applePauses.pickElement(); //re-assign pause time
    };
    this.fall = function(){ //falling apple

        this.yPos += this.speed; //drop apple
        this.speed += this.gravity; //add gravity to drop speed
    
        //check for collison with Basket:
        if (this.xPos < (Basket.xPos + Basket.width) && (this.xPos + this.width) > Basket.xPos
        && this.yPos < (Basket.yPos + Basket.height) && (this.yPos + this.height) > Basket.yPos
        && this.canScore){
            score++; //add to score 
            
            if (score <10){ //if score is less than 10:
                Basket.img.src = basketImgs[score].src; //update basket img
                score = "0" + score; //add leading 0
            }else{ //score is >= 10:
                if(score%2 == 0){ Basket.img.src = basketImgs[10].src; } //update to this img when an even score
                else{ Basket.img.src = basketImgs[11].src; } //update to this img when an odd score
            }

            document.getElementById("score").innerHTML = score; //show score
            appleCtxs[i].globalAlpha = 0; //remove apple from screen
            this.reset(); //reset apple 
        }

        //check if apple has hit bottom of canvas:
        if(this.yPos >= ((canvasH - 10) - this.height)){  //'canvas height -10' to make level with basket
            this.canScore = false; //prevent scoring 
            this.yPos = (canvasH - 10) - this.height; //repostion at bottom of canvas
            this.speed *= -this.bounce; //bounce apple
        }

        if(this.speed == -0.05454545454545454){ //apple has stopped bouncing
            this.canFall = false; //prevent falling
            this.canFadeOut = true; //allow fading
        }  
    };
}

//----------------------------------------------------------------------------------------------------
//animate game:

var start = 0; //animation start time
var progress = 0; //animation progress
var animationFrameRef = null; //animationFrame reference

function animate(timestamp){

    if (!start) { start = timestamp; } //mark start time
    progress = timestamp - start; //track progress
    
    //draw background:
    backgroundCtx.clearRect(0, 0, canvasW, canvasH); //clear background canvas
    backgroundCtx.drawImage(backgroundImg, 0, 0, canvasW, canvasH);  //draw background

    //draw basket:
    basketCtx.clearRect(0, 0, canvasW, canvasH); //clear basket canvas
    Basket.move(); //move basket
    basketCtx.drawImage(Basket.img, Basket.xPos, Basket.yPos, Basket.width, Basket.height); //draw basket

    //draw apples:
    for (let i=0; i<apples.length; i++){

        if (progress < apples[i].pauseTime) { //if apple can't yet fall 
            apples[i].canFall = false; //dont allow fall
        }else{ 

            if(apples[i].canFadeIn){ //if apple can fade in
                appleCtxs[i].globalAlpha +=0.05; //fade in apple's opacity

                if (appleCtxs[i].globalAlpha >= 0.95){ apples[i].canFall = true; } //allow apple to fall when visible
            }
        }
    
        if (apples[i].canFall){ apples[i].fall(); } //make apple fall if able
           
        if (apples[i].canFadeOut){ //if apple can fade out
            appleCtxs[i].globalAlpha -= 0.1; //fade out apple's opacity
            
            if (appleCtxs[i].globalAlpha <= 0.01){ apples[i].reset(); } //reset apple when faded
        }

        appleCtxs[i].clearRect(0, 0, canvasW, canvasH); //clear apple canvas
        appleCtxs[i].drawImage(apples[i].img, apples[i].xPos, apples[i].yPos, apples[i].width, apples[i].height); //draw apple
    }

    animationFrameRef = requestAnimationFrame(animate); //continue animation 
}

//----------------------------------------------------------------------------------------------------
//game timer:

var time = 0; //time

function startTimer(){
    time = 30; //(re)set time
    document.getElementById("timer").innerHTML = time; //show starting time
    
    let timer = setInterval(function(){ 
        time--; //reduce time
        if (time<10){ 
            time = "0" + time; //add leading 0
            document.getElementById("timer").style.color = "#ff0000"; //turn red to warn user
        }
        if(time<=0){ //timer has run out
            clearInterval(timer); //clear timer 
            cancelAnimationFrame(animationFrameRef); //cancel animation
            showScoreModal(); //show game score modal
        } 
        document.getElementById("timer").innerHTML = time; //show new time
    
    }, 1000); //run timer every second
}

//----------------------------------------------------------------------------------------------------
//start the game:

var score = 0;

function startGame(){

    //create and store apples: 
    for (let i=0; i<5; i++){
        let apple = new Apple(appleX[i], appleY[i], i); //create new apple
        appleCtxs[i].globalAlpha = 0; //make apple initially invisible
        apples.push(apple); //add apple to array 
    }

    startTimer(); //start game timer
    requestAnimationFrame(animate); //animate game
}

//----------------------------------------------------------------------------------------------------
//intro modal:

var introModal = document.getElementById("intro-modal"); //intro modal
var playBtn = document.getElementById("play-button"); //play button

//show intro modal:
function showIntroModal(){
	introModal.style.display = "block"; //display introModal
}

//play game:
playBtn.onclick = function() {
    introModal.style.display = "none";  //close introModal
    startGame(); //start game
}

//----------------------------------------------------------------------------------------------------
//score modal:

var scoreModal = document.getElementById("score-modal"); //score modal
var replayBtn = document.getElementById("replay-button"); //replay button

//show score modal:
function showScoreModal(){
    scoreModal.style.display = "block"; //display scoreModal
    document.getElementById("final-score").innerHTML = score; //show final score


    /////////////////////////////////////////////////
    for (let i=0; i<6; i++){
        makeScores();
    }

    ////////////////////////////////////////////////

}

//replay game:
replayBtn.onclick = function() {
    scoreModal.style.display = "none";  //close scoreModal

    //reset vars:
    document.getElementById("score").innerHTML = "00"; //show score as 00
    document.getElementById("timer").style.color = "#808080"; //reset timer colour
    score = 0; //reset score counter
    apples.length = 0; //reset apples array
    start = 0; //reset animation start time
    progress = 0; //reset animation progress
    animationFrameRef = null; //reset animationFrame reference
    Basket.img.src = basketImgs[0].src; //reset basket img

    startGame(); //start game
}

//----------------------------------------------------------------------------------------------------

var testNameArray  = [ "bob",  "frank", "cuthbert" ];
var testScoreArray  = [ 5,  3, 20 ];
   
function makeScores(){ //SHOULD PROBABLY PASS IN AN ARRAY OF OBJECTS HOLSING PLAYER NAMES AND SCORES ++++++++++++++++++++++++++++++++++++++++

    //div for holding player name & score divs:
    let scoreVals = document.createElement("div"); //create div
    scoreVals.className = "score-values"; //give classname for styling

    //player name div:
    let playerName = document.createElement("div"); //create div
    playerName.className = "player-name"; //give classname for styling
    let playerNameTxt = document.createTextNode("player's name"); //create text node for player name  //+++++++++++++++++++++++++++PULL FROM DB TO PROVIDE THIS!! 
    playerName.appendChild(playerNameTxt); //add text to div

    //player score div:
    let playerScore = document.createElement("div"); //create div
    playerScore.className = "player-score"; //give classname for styling
    let playerScoreTxt = document.createTextNode("00"); //create text node for player score  //+++++++++++++++++++++++++++PULL FROM DB TO PROVIDE THIS!! 
    playerScore.appendChild(playerScoreTxt); //add text to div

    //add playerName & playerScore to scoreVals:
    scoreVals.appendChild(playerName);
    scoreVals.appendChild(playerScore);

    document.getElementById("scores-container").appendChild(scoreVals); //add div to scores-container

}