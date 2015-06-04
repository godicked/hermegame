//
// Global Variable
//
var game;
var WIDTH  = 800;
var HEIGHT = 600;


//
// Class
//

function Game() {
    this.renderer = PIXI.autoDetectRenderer(WIDTH,
                                            HEIGHT,
                                            {backgroundColor : 0xB0B9C2}
                                            );
    
    document.body.appendChild(this.renderer.view);
    
    this.stage = new PIXI.Container();
    this.stage.interactive = true;
    this.map = new Map();
    
    this.stage.on('click', function(e) {
        console.log(e.data.getLocalPosition(this.map.bombs));
    }.bind(this));
    this.stage.addChild(this.map);
    this.update();
    
}
Game.prototype.update = function() {
    requestAnimationFrame(this.update.bind(this));
    this.map.update();
    this.renderer.render(this.stage);
};



function Map() {
    PIXI.Container.call(this);
    
    this.player;
    this.background = new TilingBackground(WIDTH, HEIGHT, loader.resources.background.texture);
    this.bombContainer = new PIXI.Container();
    this.candyContainer = new PIXI.Container();
    
    this.addChild(this.background);
    this.addChild(this.bombContainer);
    this.addChild(this.candyContainer);
    
    this.bombCounter = 0;
    this.candyCounter = 0;
    this.candySwitch = -1;
}
Map.prototype = Object.create(PIXI.Container.prototype);
Map.prototype.update = function() {
    this.generateCandy();
    this.generateBomb();
    this.moveCandy(5);
    this.moveBombs(5);
};
Map.prototype.generateBomb = function() {
    this.bombCounter += 1;
    if(this.bombCounter == 60) {
        var randomY = (Math.random() * HEIGHT-40) + 20;
        var temp = new Bombs(WIDTH + 100, randomY);
        var bool = true;
        var l = this.candyContainer.children.length;
        for (i = 0 ; i < l ; i += 1) {
            if (BombXCandy(temp, this.candyContainer.children[i])) {
                bool = false;
            }
        }
        if(bool) {
            this.bombContainer.addChild(new Bombs(WIDTH + 100, randomY));
        }
        else {
            this.bombCounter -= 1;
            this.generateBomb();
        }
    }
    if(this.bombCounter > 150) {
            this.bombCounter = 0;
    }
};
Map.prototype.moveBombs = function(speed) {
    var l = this.bombContainer.children.length;
    for (i = 0 ; i < l; i+=1) {
        this.bombContainer.children[i].move(speed);
        if (this.bombContainer.children[i].x < -100) {
            this.bombContainer.removeChildAt(i);
            l -=1;
            i-=1;
        }
    }
};
Map.prototype.moveCandy = function(speed) {
    var l = this.candyContainer.children.length;
    for (i = 0 ; i < l; i+=1) {
        this.candyContainer.children[i].move(speed);
        if (this.candyContainer.children[i].x < -100) {
            this.candyContainer.removeChildAt(i);
            l -= 1;
            i -= 1;
        }
    }
};
Map.prototype.generateCandy = function() {
    if(this.candyCounter == 0) {
        var l = 10;
        var randomY = Math.random() * (HEIGHT-20) + 20; 
        for (i = 0, c = WIDTH, x = ((Math.random()*2) -1); i < l ; i+=1, c += 90, x += this.candySwitch * 0.5) {
            var candy = new Candy(c, (randomY) + 70 * Math.sin(x));
            if(candy.y - candy.height < 0) {
                candy.y = candy.height;
            }
            if(candy.y + candy.height> HEIGHT) {
                candy.y = HEIGHT - candy.height;
            }
            this.candyContainer.addChild(candy);
        }
        this.candySwitch *= -1;
    }
    else if (this.candyCounter > 400) {
        this.candyCounter = -1;
    }
    this.candyCounter +=1;
};

function TilingBackground(w, h, texture) {
    PIXI.extras.TilingSprite.call(this);
    this.width = w;
    this.height = h;
    this.texture = texture;
}
TilingBackground.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
TilingBackground.prototype.move = function(speed) {
    this.tilePosition.x -= speed;
};

function Candy(x, y) {
    PIXI.Sprite.call(this);
    this.texture = loader.resources.candy.texture;
    this.x = x;
    this.y = y;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.switch = 1;
    this.start = Math.random() * 30;
    this.counter = 0;
}
Candy.prototype = Object.create(PIXI.Sprite.prototype);
Candy.prototype.move = function(speed) {
    this.x -= speed;
    if(this.start >= 30) {
        this.counter += 1;
        this.scale.x += this.switch * 0.02;
        this.scale.y += this.switch * 0.02;
        this.rotation += this.switch * 0.02;
        if(this.counter > 30) {
            this.switch *= -1;
            this.counter = 0;
        }
    }
    else {
        this.start += 1;
    }
};


function Bombs(x, y) {
    PIXI.Container.call(this);
    this.x = x;
    this.y = y;
    this.addChild(new Bomb(0,0));
    this.addChild(new Bomb(44,0));
    this.addChild(new Bomb(22,22));
    this.addChild(new Bomb(0,44));
    this.addChild(new Bomb(44,44));
    
    this.pivot.x = 22;
    this.pivot.y = 22;       
}
Bombs.prototype = Object.create(PIXI.Container.prototype);
Bombs.prototype.move = function(speed) {
    this.x -= speed;
    this.rotation +=0.1
};




function Bomb(x, y) {
    PIXI.Sprite.call(this);
    this.texture = loader.resources.bomb.texture;
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.x = x;
    this.y = y;
}
Bomb.prototype = Object.create(PIXI.Sprite.prototype);
















//
// Loader
//


var loader = PIXI.loader;
loader.add('background', '/public/images/background.png');
loader.add('bomb', '/public/images/bomb.png');
loader.add('candy', 'public/images/candy.png');

loader.on('load', function(loader, resources) {
    console.log('file ' + resources.name + ' : loaded');
});

loader.once('complete', function(loader, resources) {
    game = new Game();
});

loader.load();


//
// Helper Funktion
//

function BombXCandy(bomb, candy) {
    var offset = 5;
    if(bomb.x + bomb.width + offset > candy.x
       && bomb.x - offset < candy.x + candy.width
       && bomb.y + bomb.height + offset > candy.y
       && bomb.y - offset < candy.y + candy.height) {
        
        return true;
    }
    else {
        return false;
    }
}