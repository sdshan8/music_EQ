//constant
const audioctx = new AudioContext();
const audio = new Audio();
const source = audioctx.createMediaElementSource(audio);
//creating variables
let microphone, usermedia;
let visualiser, visualiserctx, count, vu_col;
let band_1, band_2, band_3, band_4, comp, gainNode;
let band_5, delay;
//defining variables
usermedia = false;
vu_col = 'rgba(50,125,255,0.5)';
visualiser = document.createElement("canvas");
band_1 = audioctx.createBiquadFilter();
band_2 = audioctx.createBiquadFilter();
band_3 = audioctx.createBiquadFilter();
band_4 = audioctx.createBiquadFilter();
band_5 = audioctx.createBiquadFilter();
delay = new DelayNode(audioctx, {
  delayTime: 0,
});
gainNode = new GainNode(audioctx);
comp = new DynamicsCompressorNode(audioctx);


//setting default values
//audio-loop
audio.loop = false;
//eq-bands
//lowshelf
band_1.type = "lowshelf";
band_1.frequency.value = 100;
band_1.gain.value = 0;
//highshelf
band_2.type = "highshelf";
band_2.frequency.value = 10000;
band_2.gain.value = 0;
//low-mids
band_3.type = "peaking";
band_3.frequency.value = 250;
band_3.Q.value = 0.7;
band_3.gain.value = 0;
//high-mids
band_4.type = "peaking";
band_4.frequency.value = 5000;
band_4.Q.value = 0.7;
band_4.gain.value = 0;
//error-correction
band_5.type = "highshelf";
band_5.frequency.value = 630;
band_5.gain.value = 8;

// connections
source.connect(band_1)
band_1.connect(band_2);
band_2.connect(band_3);
band_3.connect(band_4);
band_4.connect(band_5);
band_5.connect(comp);
comp.connect(gainNode);
gainNode.connect(audioctx.destination);

//Canvas
function updateCanvasDimensions(id) {
  id.width = Math.min(window.innerWidth, window.innerHeight);
  id.height = id.width / 6  * 3;
}
updateCanvasDimensions(visualiser);
function map_range(value, low1, high1, low2, high2) {
  return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function setupMic() {
  if (!navigator.mediaDevices.getUserMedia) {
    alert("Update your Browser ");
    console.log('Update your Browser');
    return;
  }
  navigator.mediaDevices.getUserMedia({
    audio: true, video: false
  })
  .then(function(stream) {
    usermedia = true;
    microphone = audioctx.createMediaStreamSource(stream);
    source.disconnect(band_1);
    microphone.connect(band_1);
    if (audioctx.state === 'suspended') {
      audioctx.resume();
    }
  })
  .catch(function(err) {
    alert("Is the mic plugged in?");
    console.log(err);
  });
}

visualiserctx = visualiser.getContext("2d");
visualiserctx.clearRect(0,
  0,
  visualiser.width,
  visualiser.height);
function log_range(value, low1, high1, low2, high2) {
  let lowlog = Math.log(low2);
  let highlog = Math.log(high2);
  let sccc = (highlog-lowlog) / (high1-low1);
  return Math.round(Math.exp(lowlog + sccc*(value-low1)));
}
function draw() {
  const drawVisual = requestAnimationFrame(draw);
  var grd = visualiserctx.createRadialGradient((visualiser.width/2),
    (visualiser.height),
    10,
    (visualiser.width/2),
    visualiser.height,
    visualiser.height);
  grd.addColorStop(0,
    vu_col);
  grd.addColorStop(1,
    'rgba(50,50,50,0.5)');
  visualiserctx.fillStyle = "black";
  visualiserctx.fillRect(0,
    0,
    visualiser.width,
    visualiser.height);

  const barWidth = 2;
  let barHeight = 100;
  let barLocation;

  vu = comp.reduction + 21;
  const vuStart = visualiser.width / 8;
  const vuStop = visualiser.width - vuStart;
  const vuLength = (vuStop + 7) - (vuStart - 7);
  const vuMark1 = vuLength / 4;
  const vuMark2 = (vuLength / 4) * 2;
  const vuMark3 = (vuLength / 4) * 3;

  visualiserctx.fillStyle = 'rgb(200,200,200)';
  visualiserctx.beginPath();
  visualiserctx.moveTo((vuStart - 7),
    (visualiser.height - (barHeight - 28)));
  visualiserctx.lineTo(vuStart - 7,
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart - 5),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart - 5),
    (visualiser.height - (barHeight - 27)));

  visualiserctx.lineTo((vuStart + vuMark1 - 1),
    (visualiser.height - (barHeight - 27)));
  visualiserctx.lineTo((vuStart + vuMark1 - 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark1 + 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark1 + 1),
    (visualiser.height - (barHeight - 27)));

  visualiserctx.lineTo((vuStart + vuMark2 - 1),
    (visualiser.height - (barHeight - 27)));
  visualiserctx.lineTo((vuStart + vuMark2 - 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark2 + 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark2 + 1),
    (visualiser.height - (barHeight - 27)));

  visualiserctx.lineTo((vuStart + vuMark3 - 1),
    (visualiser.height - (barHeight - 27)));
  visualiserctx.lineTo((vuStart + vuMark3 - 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark3 + 1),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStart + vuMark3 + 1),
    (visualiser.height - (barHeight - 27)));

  visualiserctx.lineTo((vuStop + 5),
    (visualiser.height - (barHeight - 27)));
  visualiserctx.lineTo((vuStop + 5),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStop + 7),
    (visualiser.height - barHeight));
  visualiserctx.lineTo((vuStop + 7),
    (visualiser.height - (barHeight - 28)));
  visualiserctx.closePath();
  visualiserctx.fill();
  barLocation = map_range(vu,
    1,
    21,
    vuStart,
    vuStop);
  visualiserctx.fillStyle = "#FFFFFF";
  visualiserctx.font = "15px Arial";
  visualiserctx.fillText("Gain Reduction",
    (visualiser.width / 2 - 40),
    (visualiser.height / 2 + 50));
  visualiserctx.fillStyle = 'rgb(200,225,255)';
  visualiserctx.fillRect(barLocation,
    (visualiser.height - barHeight),
    barWidth,
    visualiser.height);
  visualiserctx.fillStyle = grd;
  visualiserctx.fillRect(0,
    0,
    visualiser.width,
    visualiser.height);
};
draw();

//////////////////UI////////////

//var
let minp = 1;
let maxp = 100000;
let minv = Math.log(20);
let maxv = Math.log(22050);
let scale = (maxv-minv) / (maxp-minp);

//upload
audioFile.onchange = function() {
  var reader = new FileReader();
  reader.onload = function(e) {
    audio.src = this.result;
    audio.crossOrigin = "anonymous";

  }
  reader.readAsDataURL(this.files[0]);
  audio.pause();
  playButton.dataset.playing = 'false';
  playButton.innerText = "Play";
}

//Play Button
const playButton = document.createElement("button");
playButton.innerText = "Play";
playButton.dataset.playing = "false";
playButton.role = "switch";
playButton.addEventListener("click", () => {
  try {
    if (audioctx.state === 'suspended') {
      audioctx.resume();
    }
    if (playButton.dataset.playing === 'false') {
      audio.play();
      playButton.dataset.playing = 'true';
      playButton.innerText = "Pause";
      if (usermedia) {
        microphone.disconnect(band_1);
        source.connect(band_1);
        usermedia = false;
      }
    } else if (playButton.dataset.playing === 'true') {
      audio.pause();
      playButton.dataset.playing = 'false';
      playButton.innerText = "Play";
    }
  }
  catch(err) {
    alert(err);
    console.log(err);
  }
});

//mic Button
const micButton = document.createElement("button");
micButton.innerText = "Mic";
micButton.addEventListener("click", () => {
  if (!usermedia) {
    if (playButton.dataset.playing === 'true') {
      audio.pause();
      playButton.dataset.playing = 'false';
      playButton.innerText = "Play";
    }
    setupMic();
  }
})

//Loop Button
const loopButton = document.createElement("button");
loopButton.innerText = "Loop";
loopButton.dataset.loop = "false";
loopButton.role = "switch";
loopButton.addEventListener("click", () => {
  if (loopButton.dataset.loop === 'false') {
    audio.loop = true;
    loopButton.dataset.loop = 'true';
    loopButton.innerText = "Unloop";
  } else if (loopButton.dataset.loop === 'true') {
    audio.loop = false;
    loopButton.dataset.loop = 'false';
    loopButton.innerText = "Loop";
  }
});

//log button
const logButton = document.createElement("button");
logButton.innerText = "Log";
logButton.addEventListener("click", () => {
  console.log(band_3.Q.value);
})

//functions
function newLog(position) {
  return Math.round(Math.exp(minv + scale*(position-minp)));
}
function newUnlog(value) {
  return Math.round((Math.log(value)-minv) / scale + minp);
}
function newKnobSetup(id, label, color, min, max, defaultValue) {
  id.setProperty('angleStart',
    -0.75 * Math.PI);
  id.setProperty('angleEnd',
    0.75 * Math.PI);
  id.setProperty('colorFG',
    color);
  id.setProperty('colorBG',
    "#444444");
  id.setProperty('trackWidth',
    0.4);
  id.setProperty('valMin',
    min);
  id.setProperty('valMax',
    max);
  id.setProperty('label',
    label);
  id.setValue(defaultValue);
}
function setupQ(id) {
  id.setProperty('fnValueToString',
    function(value) {
      let string = value.toString();
      let n = string.length;
      if (n < 2) {
        string = '0' + string;
        n += 1;
      }
      const prefix = string.slice(0, n - 2);
      const suffix = string.slice(n - 2, n);
      const result = prefix + '.' + suffix;
      return result;
    });
  id.setProperty('fnStringToValue',
    function(string) {
      let val = 0;
      const numerals = string.match(/\d*(\.\d*)?/);
      if (numerals !== null) {
        if (numerals.length > 0) {
          const numeral = numerals[0];
          const f = parseFloat(numeral);
          val = Math.round(100 * f);
        }
      }
      return val;
    });
}

function setupfreq(id) {
  id.setProperty('fnValueToString',
    function(value) {
      var sss = Math.round(Math.exp(minv + scale*(value-minp)));
      return sss.toString();
    });
  id.setProperty('fnStringToValue',
    function(string) {
      value = parseFloat(string);
      var vvv = (Math.log(value)-minv) / scale + minp;
      return Math.round(vvv);
    });
}


//knobs defaults
var size_knob = 80;
var size_a_knob = 65;
var size_b_knob = 55;
var size_co_knob = 90;
var band_1_col = "#88ff88";
var band_2_col = "#ff8888";
var band_3_col = "#88ccff";
var band_4_col = "#ffcc88";
var band_5_col = "#fff";


//Band 1
//Frequency
var fre_1 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(fre_1, "Hz", band_1_col, minp, maxp, newUnlog(band_1.frequency.value));
var fre_1_node = fre_1.node();
setupfreq(fre_1);
var listener = function(fre_1, value) {
  band_1.frequency.value = newLog(value);
};
fre_1.addListener(listener);
//Gain
var gain_1 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(gain_1, "dB", band_1_col, -15, 15, 0);
var gain_1_node = gain_1.node();
var listener1 = function(gain_1, value) {
  band_1.gain.value = parseInt(value);
};
gain_1.addListener(listener1);

//Band 2
//Frequency
var fre_2 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(fre_2, "Hz", band_2_col, minp, maxp, newUnlog(band_2.frequency.value))
var fre_2_node = fre_2.node();
setupfreq(fre_2);
var listener2 = function(fre_2, value) {
  band_2.frequency.value = newLog(value);
};
fre_2.addListener(listener2);
//Gain
var gain_2 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(gain_2, "dB", band_2_col, -15, 15, 0);
var gain_2_node = gain_2.node();
var listener3 = function(gain_2, value) {
  band_2.gain.value = parseInt(value);
};
gain_2.addListener(listener3);

//Band 3
//Frequency
var fre_3 = pureknob.createKnob(size_a_knob, size_a_knob);
newKnobSetup(fre_3, "Hz", band_3_col, minp, maxp, newUnlog(band_3.frequency.value));
var fre_3_node = fre_3.node();
setupfreq(fre_3);
var listener4 = function(fre_3, value) {
  band_3.frequency.value = newLog(value);
};
fre_3.addListener(listener4);
//Gain
var gain_3 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(gain_3, "dB", band_3_col, -15, 15, 0);
var gain_3_node = gain_3.node();
var listener5 = function(gain_3, value) {
  band_3.gain.value = parseInt(value);
};
gain_3.addListener(listener5);
//Quality
var q_3 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(q_3, "Q", band_3_col, 1, 1200, 70);
var q_3_node = q_3.node();
setupQ(q_3);
var listener6 = function(q_3, value) {
  band_3.Q.value = value/100;
};
q_3.addListener(listener6);

//Band 4
//Frequency
var fre_4 = pureknob.createKnob(size_a_knob, size_a_knob);
newKnobSetup(fre_4, "Hz", band_4_col, minp, maxp, newUnlog(band_4.frequency.value));
var fre_4_node = fre_4.node();
setupfreq(fre_4);
var listener7 = function(fre_4, value) {
  band_4.frequency.value = newLog(value);
};
fre_4.addListener(listener7);
//Gain
var gain_4 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(gain_4, "dB", band_4_col, -15, 15, 0);
var gain_4_node = gain_4.node();
var listener8 = function(gain_4, value) {
  band_4.gain.value = parseInt(value);
};
gain_4.addListener(listener8);
//Quality
var q_4 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(q_4, "Q", band_4_col, 1, 1200, 70);
var q_4_node = q_4.node();
setupQ(q_4);
var listener9 = function(q_4, value) {
  band_4.Q.value = value/100;
};
q_4.addListener(listener9);


//Compressor
//attack
var compAttack = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compAttack, "ms", band_5_col, 0, 1000, (comp.attack.value * 1000));
var compAttackNode = compAttack.node();
var attacklistener = function(compAttack, value) {
  comp.attack.value = value/1000;
};
compAttack.addListener(attacklistener);
//release
var compRelease = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compRelease, "ms", band_5_col, 0, 1000, (comp.release.value * 1000));
var compReleaseNode = compRelease.node();
var Releaselistener = function(compRelease, value) {
  comp.release.value = value/1000;
};
compRelease.addListener(Releaselistener);
//knee
var compKnee = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compKnee, "Knee", band_5_col, 0, 40, comp.knee.value);
var compKneeNode = compKnee.node();
var Kneelistener = function(compKnee, value) {
  comp.knee.value = value;
};
compKnee.addListener(Kneelistener);
//Ratio
var compRatio = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compRatio, "Ratio", band_5_col, 1, 20, comp.ratio.value);
var compRatioNode = compRatio.node();
var Ratiolistener = function(compRatio, value) {
  comp.ratio.value = value;
};
compRatio.addListener(Ratiolistener);
//Threshold
var compThres = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compThres, "dB", band_5_col, -100, 0, comp.threshold.value);
var compThresNode = compThres.node();
var Threslistener = function(compThres, value) {
  comp.threshold.value = value;
};
compThres.addListener(Threslistener);
//Gain
var compGain = pureknob.createKnob(size_co_knob, size_co_knob);
newKnobSetup(compGain, "0.0001x", band_5_col, 0, 40000, 10000);
var compGainNode = compGain.node();
var Gainlistener = function(compGain, value) {
  gainNode.gain.value = value/10000;
};
compGain.addListener(Gainlistener);

//elements
var player_div = document.getElementById("player");
var canvas_div = document.getElementById("canvas");
var eq_div_1 = document.getElementById("eq_1");
var eq_div_2 = document.getElementById("eq_2");
var eq_div_3 = document.getElementById("eq_3");
var eq_div_4 = document.getElementById("eq_4");
var comp_attk = document.getElementById("attack");
var comp_rele = document.getElementById("release");
var comp_knee = document.getElementById("knee");
var comp_ratio = document.getElementById("ratio");
var comp_thres = document.getElementById("threshold");
var comp_gain = document.getElementById("gain");

// appending stuff
canvas_div.appendChild(visualiser);
eq_div_1.appendChild(fre_1_node);
eq_div_1.appendChild(gain_1_node);
eq_div_2.appendChild(fre_2_node);
eq_div_2.appendChild(gain_2_node);
eq_div_3.appendChild(gain_3_node);
eq_div_3.appendChild(fre_3_node);
eq_div_3.appendChild(q_3_node);
eq_div_4.appendChild(gain_4_node);
eq_div_4.appendChild(fre_4_node);
eq_div_4.appendChild(q_4_node);
comp_attk.appendChild(compAttackNode);
comp_rele.appendChild(compReleaseNode);
comp_knee.appendChild(compKneeNode);
comp_ratio.appendChild(compRatioNode);
comp_thres.appendChild(compThresNode);
comp_gain.appendChild(compGainNode);


//player_div.appendChild(logButton);
//player_div.appendChild(micButton);
player_div.appendChild(playButton);
player_div.appendChild(loopButton);