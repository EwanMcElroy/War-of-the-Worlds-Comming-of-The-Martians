class aSprite {
	constructor(_x, _y, _imageSRC, _velX, _velY, _width, _height) {
		this.x = _x;
        this.y = _y;
        this.vX = _velX;
        this.vY = _velY;
        this.sprite = new Image();
        this.sprite.src = _imageSRC;
        this.W = _width;
        this.H = _height;
    }
	
	
    // getters
    getX(){
        return this.x;
    }

    getY(){
        return this.y;
    }

    getPos(){
        return {x: this.x, y: this.y};
    }

    getVelX(){
        return this.vX;
    }

    getVelY(){
        return this.vY;
    }

    // setters
    setPos(_xPos, _yPos) {
        this.x = _xPos;
        this.y = _yPos;
    }

    setScale(_xScale, _yScale) {
        this.sprite.style.width = _xScale;
        this.sprite.style.height = _yScale;
    }

    // methods
    render() {
        canvasContext.drawImage(this.sprite, this.x, this.y, this.W, this.H);
    }
	
	distance(_obj){
		if(Math.sqrt(((this.x - _obj.x) * (this.x - _obj.x)) + ((this.y - _obj.y) * (this.y - _obj.y)))){
			return true;
		} else { return false;}
	}
}

class background extends aSprite {
	scrollDwn(_delta) {
        canvasContext.save();
        canvasContext.translate(0 , _delta);
        canvasContext.drawImage(this.sprite, 0, 0, this.W, this.H);
        canvasContext.drawImage(this.sprite, 0, -this.H, this.W, this.H);
        canvasContext.restore();
	}
}

class player extends aSprite {
	initPlayer() {
		this.health = 3;
	}
	
	renderHealth() {
		for(var i = 0; i < this.health; i++){
			playerHealth[i].render();
		}
	}
}

class button extends aSprite{
	setTag(_tag) {
		this.tag = _tag;
	}
	
	pressed() {
		switch (this.tag) {
			case "start":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H){
				gameState = gameStates.INGAME;
			}
			break;
			
			default:
			console.log("BUTTON ERROR");
			break;
		}
	}
}

// game objects
var bckgrnd;
var fightingMachine;
var playerHealth = [];
var mainMenu;
var startButton;

//Directory paths
var ASSET_PATH = "Sprites/";

//game variables
var frameTime;
var travel = 0;
var delta = 0;
var mouseX;
var mouseY;
var heatRay = false;
var lastPt = {x: 0, y: 0};

var gameStates = {
	MAINMENU: 0,
	INGAME: 1,
	BOSSSTAGE: 2,
	GAMEOVER: 3,
	WINSCREEN: 4
};
var gameState = gameStates.MAINMENU;

function load(){
	canvas = document.getElementById('gameCanvas');
	canvasContext = canvas.getContext('2d');
	init();
}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init(){
	if(canvas.getContext) {
		window.addEventListener('resize', resizeCanvas, false);
        window.addEventListener('orientationchange', resizeCanvas, false);
		
		canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);
        canvas.addEventListener("click", touchDown, false);

        document.addEventListener("touchcancel", touchUp, false);
		
		bckgrnd = new background(0, 0, ASSET_PATH + "Background.png", 0, 50, canvas.width, canvas.height);
		mainMenu = new background(0, 0, ASSET_PATH + "startScreen.png", 0, 0, canvas.width, canvas.height);
		
		startButton = new button(20, 60, ASSET_PATH + "startbuttonO.png", 0, 0, 60, 30);
		startButton.setTag("start");
		
		fightingMachine = new player(canvas.width/2 - 30, 90, ASSET_PATH + "FightingMachine.png", 0, 0, 60, 60);
		fightingMachine.initPlayer();
		
		playerHealth[0] = new aSprite(canvas.width - 32, 10, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		playerHealth[1] = new aSprite(canvas.width - 32, 43, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		playerHealth[2] = new aSprite(canvas.width - 32, 75, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		
		frameTime = Date.now();
		gameLoop();
	}
}

function gameLoop(){
	delta = (Date.now() - frameTime)/1000;
	switch(gameState){
		case gameStates.MAINMENU:
		renderMainMenu();
		break;
	
		case gameStates.INGAME:
		update(delta);
		render(delta);
		frameTime = Date.now();
		break;
	
		case gameStates.BOSSSTAGE:
	
		break;
	
		case gameStates.GAMEOVER:
	
		break;
	
		case gameStates.WINSCREEN:
	
		break;
	
		default:
		console.log("LOOP ERROR");
		break;
	}
	requestAnimationFrame(gameLoop);
}

function render(_delta) {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	
	travel += _delta * bckgrnd.vY;
	if(travel > bckgrnd.H) {
		travel = 0;
	}
	bckgrnd.scrollDwn(travel);
	
	renderHeatRay();
	fightingMachine.render();
	fightingMachine.renderHealth();
}

function renderHeatRay(){
	if(heatRay && mouseY < fightingMachine.getY() + 10){
		canvasContext.strokeStyle = 'red';
		canvasContext.lineWidth = 1;
		canvasContext.beginPath();
		canvasContext.moveTo(fightingMachine.getX() + 29, fightingMachine.getY() + 10);
		canvasContext.lineTo(mouseX, mouseY);
		canvasContext.stroke();
		heatRay = false;
	}
}

function renderMainMenu(){
	canvasContext.clearRect(0, 0, canvas.width, canvas.height);
	mainMenu.render();
	styleText('black', "italic bold 15px arial,serif", 'left', 'middle');
	canvasContext.fillText("The War of the Worlds", 20, 10);
	canvasContext.fillText("The Coming of the Martians", 20, 30);
	startButton.render();
	canvasContext.fillText("Start", startButton.getX() + 10, startButton.getY() + 15.5);
}

function update(_delta){

}

function styleText (_colour, _font, _Align, _baseline) {
	canvasContext.fillStyle = _colour;
	canvasContext.font = _font;
	canvasContext.textAlign = _Align;
	canvasContext.textBaseline = _baseline;
}

function touchUp(evt){
    evt.preventDefault();
    // terminate touch path
    lastPt = null;
    heatRay = false;
}

function touchDown(evt){
    evt.preventDefault();
	mouseX = canvas.relMouseCoords(evt).x;
	mouseY = canvas.relMouseCoords(evt).y;
	
	switch(gameState) {
		case gameStates.MAINMENU:
		console.log("HERE");
		startButton.pressed();
		break;
	}
    touchXY(evt);
}

function touchXY(evt) {
    evt.preventDefault();
    if(lastPt != null) {
        var touchX = evt.pageX - canvas.offsetLeft;
        var touchY = evt.pageY - canvas.offsetTop;
    }
	

    lastPt = {x:evt.pageX, y:evt.pageY};
    heatRay = true;
}

 HTMLCanvasElement.prototype.relMouseCoords = function (event) {
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var currentElement = this;

	do {
		totalOffsetX += currentElement.offsetLeft;
		totalOffsetY += currentElement.offsetTop;
	}
	while (currentElement = currentElement.offsetParent)

	canvasX = event.pageX - totalOffsetX;
	canvasY = event.pageY - totalOffsetY;

	// Fix for variable canvas width
	canvasX = Math.round( canvasX * (this.width / this.offsetWidth) );
	canvasY = Math.round( canvasY * (this.height / this.offsetHeight) );

	return {x:canvasX, y:canvasY}
}