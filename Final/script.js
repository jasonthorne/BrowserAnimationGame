

console.log("Yo");
//var canvasBounds = canvas.getBoundingClientRect(); //+++++++++++++++++++++++

var canvas = document.getElementById("canvasId");
var ctx = canvas.getContext("2d");
//document.getElementById("timerId").innerHTML = 0; //set timer element //+++++++++++++++++++
//document.getElementById("scoreId").innerHTML = 0; //set hits element //+++++++++++++++++++

var backgroundImg = new Image(); //background image
backgroundImg.src = 'img/background.png'; //image source


var score = 0;

//----------------------------------------------------------------------------------------------------
/*

//var basketImg = new Image(); //basket image

//onload events:
backgroundImg.onload = function(){
    
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);  //draw background
      
    basketImg.src = 'img/basket.png'; //basket image source (assigned here so that background is drawn first)
    
    //load and draw basket:
    basketImg.onload = function(){
         ctx.drawImage(basketImg, (canvas.width - basketW) /2, (canvas.height - basketH) - 10, basketW, basketH); 
    }
    
}
*/
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
//create basket:

var basketW = 110, basketH = basketW; //width & height of basket

var Basket = {
    img: (function(){ //basket image
       var img =  new Image(110, 110);
       img.src = 'img/baskets/basket0.png';
        return img;
    }()),
    xPos: (canvas.width - basketW) /2, //x pos of basket
    yPos: (canvas.height - basketH) - 10, //y pos of basket
    width: basketW, //width of basket
    height: basketH, //height of basket
    move: function(){
        if (key[37]){ //if left is pressed
            this.xPos -=30; //decrease x pos
            
            if(this.xPos <0){ //check for canvas collision
                this.xPos = 0; //stop at screen edge
            }
        }else if (key[39]){ //if right is pressed
            this.xPos += 30; //increase x pos
          
            if(this.xPos > (canvas.width - this.width)){ //check for canvas collision
                this.xPos = canvas.width - this.width; //stop at screen edge
            }
        }
       //ctx.drawImage(this.img, this.xPos, this.yPos, this.width, this.height); //draw moved basket
    }
};

//----------------------------------------------------------------------------------------------------
//create apples:

var applesArray = []; //array for holding apples 
var appleX = [50, 130, 200, 260, 350, 450, 600]; //x pos of apples  
var appleY = [180, 100, 180, 80, 150, 220, 40]; //y pos of apples  
var appleSpeeds = [3, 6, 12]; //holds apple drop speeds

//prototype function added to Array class, to allow random picking of elements:
Array.prototype.pickElement = function(){ 
    return this[Math.floor(Math.random()*this.length)]; //return a random element
}//https://stackoverflow.com/questions/4550505/getting-a-random-value-from-a-javascript-array

var appleImg = new Image(); //apple image
appleImg.src = 'img/apple.png'; //image source

function Apple(xPos, yPos){
   this.img = (function(){ //apple image
        var img =  new Image();
        img.src = 'img/apple.png';
        return img;
    }());
    this.xPos = xPos; //x pos of apple
    this.yPos = yPos; //y pos of apple
    this.width = 60; //width of apple
    this.height = 60; //height of apple
    this.speed = appleSpeeds.pickElement(); //pick a drop speed
    this.reset = function(){ 
        this.yPos = yPos; //reset y pos
        this.speed = appleSpeeds.pickElement(); //reset drop speed
    };
    this.fall = function(){
        this.yPos += this.speed; //drop apple

        //check for collison with Basket:
        if (this.xPos < (Basket.xPos + Basket.width) && (this.xPos + this.width) > Basket.xPos
            && this.yPos < (Basket.yPos + Basket.height) && (this.yPos + this.height) > Basket.yPos){
            this.reset(); //reset apple
            score ++; //add to score 
            console.log(score); //+++++++++++++++++++++++++++
            if (score < 8) {
               Basket.img.src='img/baskets/basket' + score.toString() + '.png';  
           }
            
            
        }
        //check if apple has hit bottom of canvas:
        if(this.yPos >= ((canvas.height - 10) - this.height)){  //'canvas height -10' to make contact level with basket
            this.reset(); //reset apple
        }
    };

}

	
 //++++++++++++++++++++
var test1 = new Apple(50, 180);
console.log("A is: " + test1.speed);
test1.reset();
console.log("A reset is: " + test1.speed);

var test2 = new Apple(130, 100);
console.log("B is: " + test2.speed);
test2.reset();
console.log("B reset is: " + test2.speed);
 //++++++++++++++++++++
//----------------------------------------------------------------------------------------------------
//animate game:
function animate(){

    ctx.clearRect(0, 0, canvas.width, canvas.height); //clear canvas
    ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);  //draw background
    Basket.move(); //move basket
    ctx.drawImage(Basket.img, Basket.xPos, Basket.yPos, Basket.width, Basket.height); //draw moved basket

    //++++++++++++++++++++
    /*
    test1.fall();
    test2.fall();
    ctx.drawImage(test1.img, test1.xPos, test1.yPos, test1.width, test1.height);
    ctx.drawImage(test2.img, test2.xPos, test2.yPos, test2.width, test2.height);
    */

   for (var i=0; i<applesArray.length; i++){
       applesArray[i].fall(); //invoke fall
       ctx.drawImage(applesArray[i].img, applesArray[i].xPos, applesArray[i].yPos, applesArray[i].width, applesArray[i].height); //draw Apple
    }
     //++++++++++++++++++++
    
    requestAnimationFrame(animate); //continue animation
}


//----------------------------------------------------------------------------------------------------
//initialise the game:

var innit = (function(){

    //create and store Apples:
    for (var i=0; i<3; i++){
        applesArray.push(new Apple(appleX[i], appleY[i])); //add Apple to array 
    }

    //================================
    animate();
    //================================

}());