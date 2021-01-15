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
		if(_obj.x + 20 > this.getX() && _obj.x < this.getX() - 20 + this.W && _obj.y > this.getY() && _obj.y + 5 < this.getY() + this.H){
			return true;
		} else { return false;}
	}
}

class background extends aSprite {
	// moves background down 
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
			playerHealth[i].render(); // display player health
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
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H){ // restart the game
				humanInitSpawnTime = Date.now();
				artilleryInitSpawnTime = Date.now();
				diseaseInitTimer = Date.now();
				fightingMachine.health = 3;
				score = 0;
				ulla.play();
				gameState = gameStates.INGAME;
			}
			break;
			
			case "restart":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H){
				window.location.reload(false); // reload the web page
			}
			break;
			
			default:
			console.log("BUTTON ERROR");
			break;
		}
	}
}

class enemy extends aSprite{
	setTag(_tag) {
		this.tag = _tag;
	}
	
	setType(_type) {
		this.type = _type;
	}
	
	die() {
		switch (this.type) {
			case "human":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H && mouseY < 90){
				score += 5;
				this.x = -Infinity;
				this.y = -Infinity;
				this.vX = 0;
				this.vY = 0; // kill player
			}
			break;
			case "artillery":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H && mouseY < 90){
				this.health--;
				if(this.health <= 0){
					score += 15;
					this.x = -Infinity;
					this.y = -Infinity;
					this.vX = 0;
					this.vY = 0; // kil artillery
				}
			}
			case "boss":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H && mouseY < 90){
				this.health--;
				hmsThunderchild.updateStage();
			}
			break;
			case "ammo":
			if(mouseX > this.getX() && mouseX < this.getX() + this.W && mouseY > this.getY() && mouseY < this.getY() + this.H && mouseY < 90) {
				this.x = -Infinity;
				this.y = -Infinity;
				this.vX = 0; 
				this.vY = 0;// destroy thunderchild shots
			}
		}
	}
}

class human extends enemy {
	setYVel(){
		var direction = Math.round((Math.random()* 2) + 1);
		if (direction == 1) { 
			this.vY = Math.random() - 0.5;
		} else {
			this.vY =((Math.random() - 0.5) * -1); // get a random direction
		}
	}
}

class artilleryClass extends enemy {
	initArtillery(){
		this.moving = true;
		this.shootTimeStart = Date.now();
		this.shootTimer = 0;
		this.health = 3;
	}
	
	stopMoving() {
		if(this.y > 60) {
			this.vY = 0;
			this.moving = false; // stop moving
		}
	}
	
	renderShootBar() {
		canvasContext.fillStyle = 'Red';
		canvasContext.fillRect(this.getX(), this.getY() - 10, this.shootTimer * 5, 2.5); // draw power bar
	}

	shootCalc() {
		this.shootTimer = (Date.now() - this.shootTimeStart)/1000;
		if(this.shootTimer > 3 && !this.moving){
			var xVel = 0;
			switch(this.x){
				case 75:
				xVel = 0.5;
				break;
				case 75 * 2:
				xVel = 0;
				break;
				case 75 * 3:
				xVel = -0.75;
				break;
			} // calulate x velocity
			bullets.push(new aSprite(this.getX(), this.getY() + 2, ASSET_PATH + "Ammo.png", xVel, 0.5, 10, 10)); // shoot
			boom.play();//play audio 
			this.shootTimer = 0; // reset timers
			this.shootTimeStart = Date.now();
		}
	}
}

class boss extends enemy {
	initThunderchild(){
		this.health = 100;
		this.bossStates = {
			NORMAL: 0,
			FASTSHOOTING: 1,
			FASTMOVING: 2,
			FINALSTAGE: 3
		};
		this.bossState = this.bossStates.NORMAL;
		this.TCShootTimeInit = Date.now();
		this.TCShootTimer = 0;
		this.direction = 1;
		this.ammo = [];
	}
	
	bossStages(){
		this.TCShootTimer = (Date.now() - this.TCShootTimeInit)/1000;
		switch (this.bossState) {
			case this.bossStates.NORMAL:
			if (this.TCShootTimer >= 0.5) {
				this.ammo.push(new enemy(this.x, this.y, ASSET_PATH + "Ammo.png", 0, 0.5, 10, 10));
				this.ammo[this.ammo.length - 1].setType("ammo");
				this.TCShootTimeInit = Date.now();
				this.TCShootTimer = 0;
				boom.play();
			}
			this.vX = 0.5;
			break;
			
			case this.bossStates.FASTSHOOTING:
			if(this.TCShootTimer >= 0.25) {
				this.ammo.push(new enemy(this.x, this.y, ASSET_PATH + "Ammo.png", 0, 0.5, 10, 10));
				this.ammo[this.ammo.length - 1].setType("ammo");
				this.TCShootTimeInit = Date.now();
				this.TCShootTimer = 0;
				boom.play();
			}
			this.vX = 0.5;
			break;
			
			case this.bossStates.FASTMOVING:
			if (this.TCShootTimer >= 0.5) {
				this.ammo.push(new enemy(this.x, this.y, ASSET_PATH + "Ammo.png", 0, 0.5, 10, 10));
				this.ammo[this.ammo.length - 1].setType("ammo");
				this.TCShootTimeInit = Date.now();
				this.TCShootTimer = 0;
				boom.play();
			}
			this.vX = 0.75;
			break;
			
			case this.bossStates.FINALSTAGE:
			if(this.TCShootTimer >= 0.25) {
				this.ammo.push(new enemy(this.x, this.y, ASSET_PATH + "Ammo.png", 0, 0.5, 10, 10));
				this.ammo[this.ammo.length - 1].setType("ammo");
				this.TCShootTimeInit = Date.now();
				this.TCShootTimer = 0;
				boom.play();
			}
			this.vX = 0.75;
			break; 
			
			// shoot depending on boss stage and reset timer
		}
	}
	
	updateDirection() {
		if(this.getX() <= 10 || this.getX() >= canvas.width - 50){
			this.direction *= -1; // update direction
		}
	}
	
	shoot(){
		for(var i = 0; i < this.ammo.length; i++) {
			this.ammo[i].render(); // render ammo
		}
	}
	
	updateStage() { // update boss stage
		switch(this.health) {
			case 75:
			this.bossState = this.bossStates.FASTSHOOTING;
			break;
			
			case 50:
			this.bossState = this.bossStates.FASTMOVING;
			break
			
			case 25:
			this.bossState = this.bossStates.FINALSTAGE;
			break;
			
			case 0:
			ulla.play();
			gameState = gameStates.WINSCREEN;
			break;
		}
	}
	
	updateAmmo() { // move shots and calulate collisions
 	for(var i = 0; i < this.ammo.length; i++) {
		hmsThunderchild.ammo[i].y += this.ammo[i].vY; 
		if(fightingMachine.distance(this.ammo[i])) {
			fightingMachine.health--;
			this.ammo[i].x = -Infinity;
			this.ammo[i].y = -Infinity;
			this.ammo[i].vX = 0;
			this.ammo[i].vY = 0;
			if(fightingMachine.health <= 0){
				causeOfDeath = "the Thunderchild";
				gameState = gameStates.GAMEOVER;
			}
		}
	} 
	}
}

// game objects
var bckgrnd;
var fightingMachine;
var playerHealth = [];
var mainMenu;
var startButton;
var humans = [];
var artillery = [];
var bullets = [];
var gameOverScreen;
var thunderchildBay;
var hmsThunderchild;
var TCAmmo = [];
var winScreen;
var restartButton;

//Directory paths
var ASSET_PATH = "Sprites/";
var HUMAN_SPRITE_PATH = "Sprites/Humans/humansSkin"
var AUDIO_PATH = "Audio/";

//game variables
var frameTime;
var travel = 0;
var delta = 0;
var mouseX;
var mouseY;
var heatRay = false;
var lastPt = {x: 0, y: 0};
var humanInitSpawnTime = 0;
var humanCounter = 0;
var score = 0;
var numSkins = 4;
var artilleryInitSpawnTime = 0;
var artilleryCounter = 0;
var diseaseInitTimer = 0;
var diseaseCounter = 0;
var causeOfDeath = "disease";

var gameStates = {
	MAINMENU: 0,
	INGAME: 1,
	BOSSSTAGE: 2,
	GAMEOVER: 3,
	WINSCREEN: 4
};
var gameState = gameStates.MAINMENU;

var bckgMuisc;
var ulla;
var boom;
var heatRaySound;

function load(){
	canvas = document.getElementById('gameCanvas'); // get canvas
	canvasContext = canvas.getContext('2d'); // get canvas context
	init();
}

function resizeCanvas(){ // set canvas to screen size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function init(){
	if(canvas.getContext) {
		// event listeners
		window.addEventListener('resize', resizeCanvas, false); 
        window.addEventListener('orientationchange', resizeCanvas, false);
		
		canvas.addEventListener("touchstart", touchDown, false);
        canvas.addEventListener("touchmove", touchXY, true);
        canvas.addEventListener("touchend", touchUp, false);
        canvas.addEventListener("click", touchDown, false);

        document.addEventListener("touchcancel", touchUp, false);
		
		// backgrounds
		bckgrnd = new background(0, 0, ASSET_PATH + "Background.png", 0, 50, canvas.width, canvas.height);
		mainMenu = new background(0, 0, ASSET_PATH + "startScreen.png", 0, 0, canvas.width, canvas.height);
		gameOverScreen = new background(0, 0, ASSET_PATH + "gameOver.png", 0, 0, canvas.width, canvas.height);
		thunderchildBay = new background(0, -canvas.height, ASSET_PATH + "thunderchildbay.png", 0, 0.5, canvas.width, canvas.height);
		winScreen = new background(0, 0, ASSET_PATH + "WinScreen.png", 0, 0, canvas.width, canvas.height);
		
		// boss
		hmsThunderchild = new boss(canvas.width/2, -canvas.height, ASSET_PATH + "thunderchild.png", 0.5, 0.5, 32, 32);
		hmsThunderchild.initThunderchild();
		hmsThunderchild.setType("boss");
		
		// buttons
		startButton = new button(20, 60, ASSET_PATH + "startbuttonO.png", 0, 0, 60, 30);
		startButton.setTag("start");
		restartButton = new button(20, 60, ASSET_PATH + "startbuttonO.png", 0, 0, 60, 30);
		restartButton.setTag("restart");
		
		//player
		fightingMachine = new player(canvas.width/2 - 30, 90, ASSET_PATH + "FightingMachine.png", 0, 0, 60, 60);
		fightingMachine.initPlayer();
		
		// health icons
		playerHealth[0] = new aSprite(canvas.width - 32, 10, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		playerHealth[1] = new aSprite(canvas.width - 32, 43, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		playerHealth[2] = new aSprite(canvas.width - 32, 75, ASSET_PATH + "FightingMachine.png", 0, 0, 32, 32);
		
		// audio
		bckgMuisc = document.createElement("AUDIO");
		bckgMuisc.src = "Audio/POL-no-way-out-short.wav";
		bckgMuisc.loop = true;
		bckgMuisc.volume = 0.25;
		bckgMuisc.play();
		
		ulla = document.createElement("AUDIO");
		ulla.src = "Audio/Ulla SFX (Jeff Wayne's War of the Worlds).wav";
		boom = document.createElement("AUDIO");
		boom.src = "Audio/cannon.wav";
		heatRaySound = document.createElement("AUDIO");
		heatRaySound.src = "Audio/heatRay.wav";
		
		frameTime = Date.now(); // first frame time
		gameLoop(); // initialise game loop
	}
}

function gameLoop(){
	delta = (Date.now() - frameTime)/1000; // calulate delta time
	switch(gameState){
		case gameStates.MAINMENU:
		renderMainMenu();
		break;
	
		case gameStates.INGAME:
		update(delta);
		render(delta);
		frameTime = Date.now();
		diseaseCounter = (Date.now() - diseaseInitTimer)/1000; // calulate time for death
		if (diseaseCounter > 60) {
			causeOfDeath = "disease";
			gameState = gameStates.GAMEOVER; // game over
		}
		if(score >= 300) {
			gameState = gameStates.BOSSSTAGE; // switch to boss stage
		}
		break;
	
		case gameStates.BOSSSTAGE:
		frameTime = Date.now();
		renderThunderchild(delta);
		updateThunderchild(delta);
		break;
	
		case gameStates.GAMEOVER:
		humans.length = 0;
		artillery.length = 0;
		bullets.length = 0;
		renderGameOver();
		break;
	
		case gameStates.WINSCREEN:
		renderWinScreen();
		break;
	
		default:
		console.log("LOOP ERROR");
		break;
	}
	requestAnimationFrame(gameLoop); // recall game loop
}

function render(_delta) {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear screen
	
	travel += _delta * bckgrnd.vY; // update travel
	if(travel > bckgrnd.H) { 
		travel = 0; // reset travel
	}
	bckgrnd.scrollDwn(travel); // scroll the game background
	
	//draw score
	styleText('black', "italic bold 15px arial,serif", 'left', 'middle');
	canvasContext.fillText(score, 15, 20);
	
	// draw artilley and thier power bars
	for(var i = 0; i < artillery.length; i++){
		artillery[i].render();
		artillery[i].renderShootBar();
	}
	
	// draw bullets
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].render();
	}
	// render humans
	for (var i = 0; i < humans.length; i++){
		humans[i].render();
	}
	// render fighting machine and heat ray
	renderHeatRay();
	fightingMachine.render();
	fightingMachine.renderHealth();
}

function renderHeatRay(){
	// draw line to mouse
	if(heatRay && mouseY < fightingMachine.getY() + 10){
		canvasContext.strokeStyle = 'red';
		canvasContext.lineWidth = 1;
		canvasContext.beginPath();
		canvasContext.moveTo(fightingMachine.getX() + 29, fightingMachine.getY() + 10);
		canvasContext.lineTo(mouseX, mouseY);
		canvasContext.stroke();
		heatRaySound.play();
		heatRay = false;
	}
}

function renderMainMenu(){
	canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear screen
	mainMenu.render();// render main menu screen
	styleText('black', "italic bold 15px arial,serif", 'left', 'middle'); // configure text
	canvasContext.fillText("The War of the Worlds", 20, 10); // draw title
	canvasContext.fillText("The Coming of the Martians", 20, 30); // draw subtitle
	startButton.render(); // render start button
	canvasContext.fillText("Start", startButton.getX() + 10, startButton.getY() + 15.5); // render button text
}

function renderGameOver() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear screen
	gameOverScreen.render(); // render game over screen
	styleText('black', "italic bold 15px arial,serif", 'left', 'middle'); // configure text
	canvasContext.fillText("Game Over", 20, 10); // render game over
	canvasContext.fillText("You have been killed by", 20, 25); // render text
	canvasContext.fillText(causeOfDeath, 20, 40); // render cause of death
	canvasContext.fillText("Score: " + score, 20, 55); // render score
	startButton.render(); // render buton
	canvasContext.fillText("Replay", startButton.getX() + 5, startButton.getY() + 15.5); // render button text
}

function renderWinScreen() {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear screen
	winScreen.render(); // render win screen
	styleText('black', "italic bold 15px arial,serif", 'left', 'middle'); // configure text
	canvasContext.fillText("The Earth belongs to the Martians", 20, 10); // render text
	restartButton.render(); // render button
	canvasContext.fillText("Restart", startButton.getX() + 5, startButton.getY() + 15.5); // render button text 
	
}

function renderThunderchild(_delta) {
	canvasContext.clearRect(0, 0, canvas.width, canvas.height); // clear screen
	travel += _delta * bckgrnd.vY; // update travel
	if(travel > bckgrnd.H) {
		travel = 0;
	} // reset travel
	if(thunderchildBay.y <= -0.1) {
		bckgrnd.scrollDwn(travel);
	} else {
		bckgrnd.render();
	} // decide wheter to scroll or just render background
	
	// render thunderchild, boss background and boss shots
	thunderchildBay.render();
	hmsThunderchild.render();
	hmsThunderchild.shoot();
	
	// render fighting machine, heat ray and health
	renderHeatRay();
	fightingMachine.render();
	fightingMachine.renderHealth();
}

function update(_delta){
	humanCounter = (Date.now() - humanInitSpawnTime)/1000; // add to counter
	artilleryCounter = (Date.now() - artilleryInitSpawnTime)/1000; // add to counter
	if(humanCounter >= 0.75){ // if timer has elapsed
		
		var side = Math.round((Math.random() * 2) + 1); // get a side to spawn on
		var skin = Math.round(Math.random() * numSkins + 1); // get a random skin
		while (skin < 1 || skin > numSkins) {
			skin = Math.round(Math.random() * numSkins + 1);
		}

		
		if(side == 1){
			humans.push(new human(-10, (Math.random() * 90) + 1, HUMAN_SPRITE_PATH + skin.toString() + ".png", 0.5, 0, 10, 10));
		} else {
			humans.push(new human(canvas.width + 10, (Math.random() * 90) + 1, HUMAN_SPRITE_PATH + skin.toString() + ".png", -0.5, 0, 10, 10));
		}
		// spawn human on appropriate side
		
		humans[humans.length - 1].setType("human"); // set type
		humans[humans.length - 1].setTag("h" + humans.length); // set tag
		humans[humans.length - 1].setYVel(); // get random y velocity
		
		// reset timer
		humanCounter = 0;
		humanInitSpawnTime = Date.now();
	}
	
	if(artilleryCounter >= 5) { // if timer has elapsed

		for(var i = 1; i < 4; i++){
			artillery.push(new artilleryClass(i * 75, -10, ASSET_PATH + "artillery.png", 0, 0.5, 20, 15));
			artillery[artillery.length - 1].initArtillery();
			artillery[artillery.length - 1].setType("artillery");
			artillery[artillery.length - 1].setTag("a" + artillery.length);
		} // spawn 3 artiller
		
		// reset timer
		artilleryCounter = 0;
		artilleryInitSpawnTime = Date.now();
	}
	
	for(var i = 0; i < artillery.length; i++){
		artillery[i].y += artillery[i].vY;
		artillery[i].stopMoving(); 
		artillery[i].shootCalc();
	} // update position of artillery
	
	
	for (var i = 0; i < bullets.length; i++) {
		bullets[i].x += bullets[i].vX;
		bullets[i].y += bullets[i].vY;
		if(fightingMachine.distance(bullets[i])) {
			fightingMachine.health--;
			bullets[i].x = -Infinity;
			bullets[i].y = -Infinity;
			bullets[i].vX = 0;
			bullets[i].vY = 0;
			if(fightingMachine.health <= 0){
				causeOfDeath = "artillery";
				gameState = gameStates.GAMEOVER;
			}
		}
	} // uipdate positions of bullets and calulate if the player has been hit
	
	for(var i = 0; i < humans.length; i++){
		humans[i].x += humans[i].vX;
		humans[i].y += humans[i].vY;
	} // update human positions
}

function updateThunderchild(_delta) {
	if(thunderchildBay.y >= 0) {
		thunderchildBay.vY = 0;
		hmsThunderchild.vY = 0;
	} // calulate when to stop moving
	
	hmsThunderchild.updateDirection(); // update direction
	hmsThunderchild.bossStages(); // update stage
	hmsThunderchild.updateAmmo(); // move ammo
	
	// move thunderchild
	hmsThunderchild.y += hmsThunderchild.vY;
	hmsThunderchild.x += hmsThunderchild.vX * hmsThunderchild.direction;
	
	// move background
	thunderchildBay.y += thunderchildBay.vY;
}

function styleText (_colour, _font, _Align, _baseline) { // configure text
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
	
	for(var i = 0; i < humans.length; i++) {
		humans[i].die(); // calulate if humans have been shot
	}
	for(var i = 0; i < artillery.length; i++) {
		artillery[i].die(); // calulate if artillery have been shot
	}
	if (gameState == gameStates.BOSSSTAGE) {
		for(var i = 0; i < hmsThunderchild.ammo.length; i++) {
			hmsThunderchild.ammo[i].die(); // calulate if the thunderchild's bullets ahve been shot
		}
		
		hmsThunderchild.die(); // calculate if the thunderchild has been shot
	}
	switch(gameState) {
		case gameStates.MAINMENU:
		startButton.pressed();
		break;
		case gameStates.GAMEOVER:
		startButton.pressed();
		break;
		case gameStates.WINSCREEN:
		restartButton.pressed();
		break;
	} // button presses
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