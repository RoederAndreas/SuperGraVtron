var canvas, ctx, overlay, getParams;

var cfg = {
    width: 1280,
    height: 544,
    bg: {
        enabled: true,
        square_count: 5,
        square_size: 128, // cfg.width / cfg.bg.square_count,
        growth_per_second: 128
    },
    enemy_colors: ['fff', '14E6E6', 'DDDD14', '4CEE49', 'E32525', 'F3147C', '4040E0'],
    bg_bright: ['333', '102221', '221E10', '142210', '221011', '221022', '101022'],
    bg_dark: ['000', '0A100E', '100D0A', '0D100A', '11090B', '0F0A10', '0A0B10'],
    enemy: {
        size: 64,
        speed: 840,
        offset: 800,
        degrees_per_second: 90
    },
    ball: {
        id: 0,
        radius: 32,
        colors: ['75ACA4', 'CD6AC4', 'C8C46A', 'F83838', '60CE6A', '4B4BED'],
        names: ['Viridian', 'Violet', 'Vitellary', 'Vermilion', 'Verdigris', 'Victoria'],
        speed: {
            h: [720, 1080, 540, 360, 1260, 1440],
            v: [1080, 720, 1260, 1440, 540, 360]
        }
    },
    warnings: {
        enabled: true,
        fancy: true,
        color: '#fff',
        min_margin: 16,
        max_margin: 64,
        line_length: 16
    }
};

var global = {
    time: {
        score: ko.observable(0),
        delta: ko.observable(0),
        time_now: 0,
        time_before: 0
    },
    balls: [],
    enemies: [],
    hit: false,
    cleaning: false,
    bg_size: 0,
    enemy_rotation: 0,
    palette: 1,
    paused: false,
    has_focus: true
};

var mouseDown = false;

var initMouseControls = function () {
	window.onmouseup = function() {
		if (!mouseDown) return;
		mousedown = false;
		global.balls[0].moving.right = false;
		global.balls[0].moving.left = false;
	};
	
	canvas.onmousedown = function(event) {
		if (global.balls.length < 1) return;
		mouseDown = true;
		var rect = canvas.getBoundingClientRect();
		var mouseX = event.clientX - rect.left;
		global.balls[0].moving.right = (mouseX > canvas.width / 2);
		global.balls[0].moving.left = !global.balls[0].moving.right;
	};
	
	canvas.onmousemove = function(event) {
		if (mouseDown) canvas.onmousedown(event);
	};
};

window.onkeydown = function(e) {
    if (global.balls.length < 1) return;
    var key = e.keyCode ? e.keyCode : e.which;
    
    switch (key) {
        case 37:
        case 65:
            global.balls[0].moving.left = true;
            break;
        case 39:
        case 68:
            global.balls[0].moving.right = true;
            break;
    }
};

window.onkeyup = function(e) {
    if (global.balls.length < 1) return;
    var key = e.keyCode ? e.keyCode : e.which;

    switch (key) {
        case 37:
        case 65:
            global.balls[0].moving.left = false;
            break;
        case 39:
        case 68:
            global.balls[0].moving.right = false;
            break;
        case 80:
            if (!global.hit) global.paused = !global.paused;
            break;
    }
};

window.onblur = function() {
    global.paused = true;
    global.has_focus = false;
};

window.onfocus = function() {
    global.has_focus = true;
};

var Ball = function(id) {
    this.pos = {
        x: cfg.width / 2,
        y: cfg.height / 2
    };
    this.id = id;
    this.color = cfg.ball.colors[id];
    this.radius = cfg.ball.radius;
    this.dir = 1;
    this.speed = {
        h: cfg.ball.speed.h[id],
        v: cfg.ball.speed.v[id]
    };
    this.moving = {
        left: false,
        right: false
    };
};

Ball.prototype.move = function() {
    this.pos.y += this.speed.v * this.dir * global.time.delta();
    if (this.isOutOfBounds()) {
        this.rebound();
    }
    if (this.moving.left) this.pos.x -= this.speed.h * global.time.delta();
    if (this.moving.right) this.pos.x += this.speed.h * global.time.delta();
    this.wrap();
};

Ball.prototype.rebound = function() {
    while(this.isOutOfBounds()) {
        if (this.lowerEnd() > cfg.height) {
            this.pos.y -= (this.lowerEnd() - cfg.height) * 2;
            this.dir = -1;
        }
        if (this.upperEnd() < 0) {
            this.pos.y += (0 - this.upperEnd()) * 2;
            this.dir = 1;
        }
    }
};

Ball.prototype.wrap = function() {
    if (this.pos.x < 0) this.pos.x += cfg.width;
    else if (this.pos.x > cfg.width) this.pos.x -= cfg.width;
};

Ball.prototype.isOutOfBounds = function() {
    return (this.dir > 0 && this.lowerEnd() > cfg.height)
            || (this.dir < 0 && this.upperEnd() < 0);
};

Ball.prototype.upperEnd = function() {
    return this.pos.y - this.radius;
};

Ball.prototype.lowerEnd = function() {
    return this.pos.y + this.radius;
};

var Enemy = function(x, y, dir) {
    this.pos = {
        x: x,
        y: y
    };
    this.dir = dir;
};

Enemy.prototype.move = function() {
    var change = cfg.enemy.speed * global.time.delta();
    if (global.cleaning) change *= 4;
    if (this.dir > 0) this.pos.x += change;
    else this.pos.x -= change;
};

Enemy.prototype.hasAppeared = function() {
    return (this.dir > 0 && this.pos.x >= 0)
            || (this.dir < 0 && this.pos.x <= cfg.width);
};

Enemy.prototype.isOutOfBounds = function() {
    return this.pos.x + cfg.enemy.size < 0
            || this.pos.x - cfg.enemy.size > cfg.width;
};

Enemy.prototype.distanceFromEntering = function() {
    return this.dir > 0 ? -this.pos.x : this.pos.x - cfg.width;
};

var GetParams = function() {
  var queryString = window.location.search.substr(1);
  var pairs = queryString.split('&');
  this.params = {};
  for (var pair of pairs) {
    var splitPair = pair.split('=', 2);
    var key = decodeURIComponent(splitPair[0]);
    var value = decodeURIComponent(splitPair[1]);
    this.params[key] = value;
  }
};

//remove if another script is added before
window.onload = function() {
	  ko.applyBindings(new ViewModel());
    init();
    start();
    frame();
};

function init() {
    getParams = new GetParams();
    if (getParams.params.seed) WaveGen.seed = getParams.params.seed;
    canvas = document.getElementById('gamecanvas');
    ctx = canvas.getContext('2d');
    overlay = new Image();
    overlay.src = 'res/ball_overlay.png';
	  initMouseControls();
}

function start() {
    WaveGen.reset();
    global.balls.push(new Ball(cfg.ball.id));
    global.time.score(0);
}

function frame() {
    updateDelta();
    
    if (global.cleaning) {
        clearEnemies();
    }
    
    if (!global.paused && !global.hit) {
        updateTimer();
        moveBalls();
        moveEnemies();
        checkCollision();
        callWave();
        rotateEnemies();
    }
    animateBackground();
    
    render();
    requestAnimationFrame(frame);
}

function moveBalls() {
    for (var i = 0; i < global.balls.length; i++) {
        global.balls[i].move();
    }
}

function moveEnemies() {
    for (var i = 0; i < global.enemies.length; i++) {
        var enemy = global.enemies[i];
        enemy.move();
        if (enemy.hasAppeared() && enemy.isOutOfBounds()) {
            global.enemies.splice(i, 1);
            i--;
        }
    }
}

function checkCollision() {
    if (collision()) {
        global.hit = true;
        setTimeout(function() {
            global.balls = [];
            global.cleaning = true;
        }, 1000);
    }
}

function collision() {
    for (var b = 0; b < global.balls.length; b++) {
        var ball = global.balls[b];
        var enemy_count = global.enemies.length;
        
        for (var e = 0; e < enemy_count; e++) {
            var enemy = global.enemies[e];
            if (ball.pos.x + ball.radius > enemy.pos.x - cfg.enemy.size / 2
                    && ball.pos.x - ball.radius < enemy.pos.x + cfg.enemy.size / 2
                    && ball.pos.y + ball.radius > enemy.pos.y - cfg.enemy.size / 2
                    && ball.pos.y - ball.radius < enemy.pos.y + cfg.enemy.size / 2) {
                return true;
            }
        }
    }
    
    return false;
}

function clearEnemies() {
    for (var i = 0; i < global.enemies.length; i++) {
        var enemy = global.enemies[i];
        enemy.move();
        if (enemy.isOutOfBounds()) {
            global.enemies.splice(i, 1);
            i--;
        }
    }
    
    if (global.enemies.length < 1) {
        global.hit = false;
        global.cleaning = false;
        start();
    }
}

function callWave() {
    if (global.enemies.length > 0
            && !global.enemies[global.enemies.length - 1].hasAppeared()) return;
    
    var pattern = WaveGen.generate();
    
    for (var i = 0; i < pattern.length; i++) {
        var data = pattern[i];
        var dir = data.dir;
        var x = 0;
        var y = data.y * cfg.height;
        
        if (dir > 0) x = -cfg.enemy.offset - data.offset * cfg.enemy.size;
        else x = cfg.width + cfg.enemy.offset + data.offset * cfg.enemy.size;
        
        global.enemies.push(new Enemy(x, y, dir));
    }
}

function rotateEnemies() {
    global.enemy_rotation += cfg.enemy.degrees_per_second * global.time.delta();
    if (global.enemy_rotation >= 90) global.enemy_rotation -= 90;
}

function animateBackground() {
    if (!cfg.bg.enabled) return;
    global.bg_size = global.bg_size + cfg.bg.growth_per_second * global.time.delta();
    while (global.bg_size > cfg.bg.square_size) {
        global.bg_size = global.bg_size - cfg.bg.square_size;
        global.palette = (global.palette >= cfg.enemy_colors.length - 1) ? 1 : global.palette + 1;
    }
}

function render() {
    drawBackground();
    drawBalls();
    drawEnemies();
    drawWarnings();
    drawPaused();
}

function drawBackground() {
    var start_x, start_y, size;
    for (var i = cfg.bg.square_count; i >= 0; i--) {
        ctx.fillStyle = '#' + cfg.bg_bright[global.palette];
        start_x = cfg.width / 2 - (global.bg_size + cfg.bg.square_size * i);
        start_y = cfg.height / 2 - (global.bg_size + cfg.bg.square_size * i);
        size = global.bg_size * 2 + cfg.bg.square_size * i * 2;
        ctx.fillRect(start_x, start_y, size, size);
        
        ctx.fillStyle = '#' + cfg.bg_dark[global.palette];
        start_x += cfg.bg.square_size / 2;
        start_y += cfg.bg.square_size / 2;
        size -= cfg.bg.square_size;
        if (size >= 0) ctx.fillRect(start_x, start_y, size, size);
    }
}

function drawBalls() {
    for (var i = 0; i < global.balls.length; i++) {
        var ball = global.balls[i];
        ctx.fillStyle = '#' + ball.color;
        if (global.hit) ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.arc(ball.pos.x, ball.pos.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.drawImage(overlay, ball.pos.x - ball.radius, ball.pos.y - ball.radius, ball.radius * 2, ball.radius * 2);
    }
}

function drawEnemies() {
    ctx.strokeStyle = '#' + cfg.enemy_colors[global.palette];
    ctx.lineWidth = cfg.enemy.size / 8;
    var offset = cfg.enemy.size / 2 - cfg.enemy.size / 8;
    var size = cfg.enemy.size - cfg.enemy.size / 4;
    for (var i = 0; i < global.enemies.length; i++) {
        var enemy = global.enemies[i];
        ctx.save();
        ctx.translate(enemy.pos.x, enemy.pos.y);
        ctx.rotate((Math.PI / 180) * global.enemy_rotation * enemy.dir);
        ctx.strokeRect(-offset, -offset, size, size);
        ctx.restore();
    }
}

function drawWarnings() {
    if (!cfg.warnings.enabled) return;
    
    ctx.fillStyle = cfg.warnings.color;
    var len = cfg.warnings.line_length;
    
    for (var i = 0; i < global.enemies.length; i++) {
        var enemy = global.enemies[i];
        if (enemy.hasAppeared()
                || enemy.distanceFromEntering() > cfg.enemy.offset) continue;
        
        var x = cfg.warnings.min_margin;
        var y = enemy.pos.y;
        
        if (cfg.warnings.fancy) {
            var percentage = enemy.distanceFromEntering() / cfg.enemy.offset;
            x = cfg.warnings.max_margin * percentage + cfg.warnings.min_margin;
            ctx.globalAlpha = 1 - percentage;
        }
        
        if (enemy.dir < 0) x = cfg.width - x;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + len * enemy.dir, y + len);
        ctx.lineTo(x + len * enemy.dir, y - len);
        ctx.fill();
    }
    
    ctx.globalAlpha = 1;
}

function drawPaused() {
    if (!global.paused) return;
    ctx.font = '64px ffffff';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', cfg.width / 2, cfg.height / 2);
    
    ctx.font = '32px ffffff';
    ctx.textBaseline = 'top';
    var message = (global.has_focus) ? '([P] drücken)' : '(Spiel hat keinen Fokus)';
    ctx.fillText(message, cfg.width / 2, cfg.height / 2 + 16);
}

var updateDelta = function() {
	global.time.now = Date.now();
	if (global.time.before > 0) global.time.delta((global.time.now - global.time.before) / 1000);
	global.time.before = global.time.now;
	//fps_counter.text(Math.floor(1 / global.time.delta) + ' fps');
};

var updateTimer = function() {
	global.time.score(global.time.score() + global.time.delta());
	//var minutes = Math.floor(global.time.score / 60);
	//var seconds = global.time.score - minutes * 60;
	//min_counter.text(minutes);
	//sec_counter.text((seconds < 10 ? '0' : '') + seconds.toFixed(2));
};

var ViewModel = function() {
	var self = this;
	
	self.minutes = ko.computed(function() {
		return Math.floor(global.time.score() / 60);
	});
	
	self.seconds = ko.computed(function() {
		var seconds = global.time.score() - self.minutes() * 60;
		return (seconds < 10 ? '0' : '') + seconds.toFixed(2);
	});
	
	self.fullscreen = function() {
		return (window.self !== window.top || window.location.href.indexOf('mobile') > -1);
	};
}
