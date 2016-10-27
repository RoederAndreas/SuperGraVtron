var patternDiamond = function() {
    var dir = randomDir();
    var wave = [
        {
            dir: dir,
            offset: 1,
            y: WaveGen.sixth[1]
        },{
            dir: dir,
            offset: 0,
            y: WaveGen.sixth[2]
        },{
            dir: dir,
            offset: 2,
            y: WaveGen.sixth[2]
        },{
            dir: dir,
            offset: 0,
            y: WaveGen.sixth[3]
        },{
            dir: dir,
            offset: 2,
            y: WaveGen.sixth[3]
        },{
            dir: dir,
            offset: 1,
            y: WaveGen.sixth[4]
        }
    ];
    return wave;
};

var patternSlash = function() {
    var dir = randomDir();
    var invert = randomDir() > 0;
    
    var wave = [
        {
            dir: dir,
            offset: 0,
            y: invert ? WaveGen.sixth[5] : WaveGen.sixth[0]
        },{
            dir: dir,
            offset: 0.8,
            y: invert ? WaveGen.sixth[4] : WaveGen.sixth[1]
        },{
            dir: dir,
            offset: 3.2,
            y: invert ? WaveGen.sixth[1] : WaveGen.sixth[4]
        },{
            dir: dir,
            offset: 4,
            y: invert ? WaveGen.sixth[0] : WaveGen.sixth[5]
        }
    ];
    
    return wave;
};

var patternCrush = function() {
    var dir = randomDir();
    
    var wave = [
        {
            dir: dir,
            offset: 0,
            y: WaveGen.fourth[0]
        },{
            dir: -dir,
            offset: 0,
            y: WaveGen.fourth[1]
        },{
            dir: -dir,
            offset: 0,
            y: WaveGen.fourth[2]
        },{
            dir: dir,
            offset: 0,
            y: WaveGen.fourth[3]
        }
    ];
    
    return wave;
};

var patternSymmetry = function() {
    var dir = randomDir();
    var y1 = WaveGen.sixth[Math.floor(WaveGen.random() * WaveGen.sixth.length)];
    var y2 = WaveGen.sixth[Math.floor(WaveGen.random() * WaveGen.sixth.length)];
    var y3 = WaveGen.sixth[Math.floor(WaveGen.random() * WaveGen.sixth.length)];
    
    var wave = [
        {
            dir: dir,
            offset: 0,
            y: y1
        },{
            dir: dir,
            offset: 0,
            y: 1 - y1
        },{
            dir: dir,
            offset: 8,
            y: y2
        },{
            dir: dir,
            offset: 8,
            y: 1 - y2
        },{
            dir: dir,
            offset: 16,
            y: y3
        },{
            dir: dir,
            offset: 16,
            y: 1 - y3
        }
    ];
    
    return wave;
};

var patternZigzag = function() {
    var dir = randomDir();
    var invert = randomDir();
    if (invert < 0) invert = 0; else invert = 1;
    var y_values = [
        WaveGen.sixth[0 + 5 * invert],
        WaveGen.sixth[1 + 3 * invert],
        WaveGen.sixth[2 + 1 * invert],
        WaveGen.sixth[3 - 1 * invert],
        WaveGen.sixth[4 - 3 * invert],
        WaveGen.sixth[5 - 5 * invert]
    ];
    
    var wave = [
        {
            dir: dir,
            offset: 0,
            y: y_values[0]
        },{
            dir: dir,
            offset: 0,
            y: y_values[1]
        },{
            dir: dir,
            offset: 0,
            y: y_values[2]
        },{
            dir: dir,
            offset: 5,
            y: y_values[3]
        },{
            dir: dir,
            offset: 5,
            y: y_values[4]
        },{
            dir: dir,
            offset: 5,
            y: y_values[5]
        },{
            dir: dir,
            offset: 10,
            y: y_values[0]
        },{
            dir: dir,
            offset: 10,
            y: y_values[1]
        },{
            dir: dir,
            offset: 10,
            y: y_values[2]
        },{
            dir: dir,
            offset: 15,
            y: y_values[3]
        },{
            dir: dir,
            offset: 15,
            y: y_values[4]
        },{
            dir: dir,
            offset: 15,
            y: y_values[5]
        },{
            dir: dir,
            offset: 20,
            y: y_values[0]
        },{
            dir: dir,
            offset: 20,
            y: y_values[1]
        },{
            dir: dir,
            offset: 20,
            y: y_values[2]
        },{
            dir: dir,
            offset: 25,
            y: y_values[3]
        },{
            dir: dir,
            offset: 25,
            y: y_values[4]
        },{
            dir: dir,
            offset: 25,
            y: y_values[5]
        }
    ];
    
    return wave;
};

var patternRandom = function() {
    var dir = randomDir();
    var wave = [];
    
    for (var i = 0; i < 7; i++) {
        wave.push({
            dir: dir,
            offset: i * 4,
            y: WaveGen.sixth[Math.floor(WaveGen.random() * WaveGen.sixth.length)]
        });
    }
    
    return wave;
};

var patternReflection = function() {
    var dir = randomDir();
    var wave = [];
    
    for (var i = 0; i < 6; i++) {
        wave.push({
            dir: dir,
            offset: i * 9,
            y: WaveGen.sixth[i]
        });
        wave.push({
            dir: -dir,
            offset: i * 9,
            y: WaveGen.sixth[5 - i]
        });
    }
    
    return wave;
};

var patternRandomReflection = function() {
    var dir = randomDir();
    var wave = [];
    
    for (var i = 0; i < 6; i++) {
        var y = Math.floor(WaveGen.random() * 6);
        wave.push({
            dir: dir,
            offset: i * 11,
            y: WaveGen.sixth[y]
        });
        wave.push({
            dir: -dir,
            offset: i * 11,
            y: WaveGen.sixth[5 - y]
        });
    }
    
    return wave;
};

var generator = function* () {
  var x = WaveGen.seed || Date.now();
  while (true) {
    x++;
    yield '0.' + Math.sin(x).toString().substr(5);
  }
};

var WaveGen = {
    fourth: [0.2, 0.4, 0.6, 0.8],
    sixth: [0.14, 0.28, 0.42, 0.58, 0.72, 0.86],
    patterns: [patternDiamond, patternSlash, patternCrush, patternSymmetry, patternZigzag, patternRandom, patternReflection, patternRandomReflection],
    gen: generator(),
    
    random: function() {
      return this.gen.next().value;
    },
    
    generate: function() {
        var id = 0;
        do {
            id = Math.floor(WaveGen.random() * this.patterns.length);
        } while (id < 0 || id >= this.patterns.length);
        
        return this.patterns[id]();
    },
    
    reset: function() {
      this.gen = generator();
    }
};

Object.defineProperty(WaveGen, 'seed', {get: function() {
  return this._seed;
}, set: function(value) {
  if (parseInt(value)) value = parseInt(value);
  switch (typeof value) {
    case 'number':
      this._seed = value;
      break;
    case 'string':
      result = 0;
      for (var char of value) {
        result += char.charCodeAt(0);
      }
      this._seed = result;
      break;
    default:
      this._seed = null;
      break;
  }
}});

function randomDir() {
    return WaveGen.random() <= 0.5 ? -1 : 1;
}
