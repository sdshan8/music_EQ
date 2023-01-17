//constant
const audioctx = new AudioContext({
  sampleRate: 44100,
});
const audio = document.getElementById('audioplayer');
const source = new MediaElementAudioSourceNode(audioctx, {
  mediaElement: audio,
})
//creating variables
let microphone, count;
let micbtn = false;
let usermedia = false;
let vu_col = 'rgba(50,125,255,0.5)';
let visualiser = document.createElement("canvas");
let visualiserctx = visualiser.getContext("2d");
let band_1 = new BiquadFilterNode(audioctx, {
  type: "lowshelf",
  frequency: 100,
});
let band_2 = new BiquadFilterNode(audioctx, {
  type: "highshelf",
  frequency: 10000,
});
let band_3 = new BiquadFilterNode(audioctx, {
  type: "peaking",
  frequency: 250,
  q: 0.7,
});
let band_4 = new BiquadFilterNode(audioctx, {
  type: "peaking",
  frequency: 5000,
  q: 0.7,
});
let comp = new DynamicsCompressorNode(audioctx, {
  ratio: 1,
})


source.connect(band_1);
band_1.connect(band_2);
band_2.connect(band_3);
band_3.connect(band_4);
band_4.connect(comp);
comp.connect(audioctx.destination);

//Functions
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
    return;
  }
  navigator.mediaDevices.getUserMedia({
    audio: true, video: false
  }).then(function(stream) {
    usermedia = true;
    microphone = new MediaStreamAudioSourceNode(audioctx, {
      mediaStream : stream,
    });
    source.disconnect(band_1);
    microphone.connect(band_1);
    if (audioctx.state === 'suspended') {
      audioctx.resume();
    }
  }).catch(function(err) {
    alert("Is the mic plugged in?");
    console.log(err);
  });
}
visualiserctx.clearRect(0, 0, visualiser.width, visualiser.height);
function draw() {
  const drawVisual = requestAnimationFrame(draw);
  let grd = visualiserctx.createRadialGradient((visualiser.width/2),
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
document.getElementById('audioFile').onchange = (e) => {
  audio.src = URL.createObjectURL(e.target.files[0]);
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
    alert(JSON.stringify(err));
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
      let sss = Math.round(Math.exp(minv + scale*(value-minp)));
      return sss.toString();
    });
  id.setProperty('fnStringToValue',
    function(string) {
      value = parseFloat(string);
      let vvv = (Math.log(value)-minv) / scale + minp;
      return Math.round(vvv);
    });
}


//knobs defaults
let size_knob = 80;
let size_a_knob = 65;
let size_b_knob = 55;
let size_co_1_knob = 65;
let size_co_2_knob = 60;
let size_co_3_knob = 56;
let band_1_col = "#88ff88";
let band_2_col = "#ff8888";
let band_3_col = "#88ccff";
let band_4_col = "#ffcc88";
let band_5_col = "#fff";


//Band 1
//Frequency
let fre_1 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(fre_1, "Hz", band_1_col, minp, maxp, newUnlog(band_1.frequency.value));
let fre_1_node = fre_1.node();
setupfreq(fre_1);
let listener = function(fre_1, value) {
  band_1.frequency.value = newLog(value);
};
fre_1.addListener(listener);
//Gain
let gain_1 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(gain_1, "dB", band_1_col, -15, 15, 0);
let gain_1_node = gain_1.node();
let listener1 = function(gain_1, value) {
  band_1.gain.value = parseInt(value);
};
gain_1.addListener(listener1);

//Band 2
//Frequency
let fre_2 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(fre_2, "Hz", band_2_col, minp, maxp, newUnlog(band_2.frequency.value))
let fre_2_node = fre_2.node();
setupfreq(fre_2);
let listener2 = function(fre_2, value) {
  band_2.frequency.value = newLog(value);
};
fre_2.addListener(listener2);
//Gain
let gain_2 = pureknob.createKnob(size_knob, size_knob);
newKnobSetup(gain_2, "dB", band_2_col, -15, 15, 0);
let gain_2_node = gain_2.node();
let listener3 = function(gain_2, value) {
  band_2.gain.value = parseInt(value);
};
gain_2.addListener(listener3);

//Band 3
//Frequency
let fre_3 = pureknob.createKnob(size_a_knob, size_a_knob);
newKnobSetup(fre_3, "Hz", band_3_col, minp, maxp, newUnlog(band_3.frequency.value));
let fre_3_node = fre_3.node();
setupfreq(fre_3);
let listener4 = function(fre_3, value) {
  band_3.frequency.value = newLog(value);
};
fre_3.addListener(listener4);
//Gain
let gain_3 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(gain_3, "dB", band_3_col, -15, 15, 0);
let gain_3_node = gain_3.node();
let listener5 = function(gain_3, value) {
  band_3.gain.value = parseInt(value);
};
gain_3.addListener(listener5);
//Quality
let q_3 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(q_3, "Q", band_3_col, 1, 1200, 70);
let q_3_node = q_3.node();
setupQ(q_3);
let listener6 = function(q_3, value) {
  band_3.Q.value = value/100;
};
q_3.addListener(listener6);

//Band 4
//Frequency
let fre_4 = pureknob.createKnob(size_a_knob, size_a_knob);
newKnobSetup(fre_4, "Hz", band_4_col, minp, maxp, newUnlog(band_4.frequency.value));
let fre_4_node = fre_4.node();
setupfreq(fre_4);
let listener7 = function(fre_4, value) {
  band_4.frequency.value = newLog(value);
};
fre_4.addListener(listener7);
//Gain
let gain_4 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(gain_4, "dB", band_4_col, -15, 15, 0);
let gain_4_node = gain_4.node();
let listener8 = function(gain_4, value) {
  band_4.gain.value = parseInt(value);
};
gain_4.addListener(listener8);
//Quality
let q_4 = pureknob.createKnob(size_b_knob, size_b_knob);
newKnobSetup(q_4, "Q", band_4_col, 1, 1200, 70);
let q_4_node = q_4.node();
setupQ(q_4);
let listener9 = function(q_4, value) {
  band_4.Q.value = value/100;
};
q_4.addListener(listener9);


//Compressor
//attack
let compAttack = pureknob.createKnob(size_co_3_knob, size_co_3_knob);
newKnobSetup(compAttack, "Attack", band_5_col, 0, 1000, (comp.attack.value * 1000));
let compAttackNode = compAttack.node();
let attacklistener = function(compAttack, value) {
  comp.attack.value = value/1000;
};
compAttack.addListener(attacklistener);
//release
let compRelease = pureknob.createKnob(size_co_3_knob, size_co_3_knob);
newKnobSetup(compRelease, "Release", band_5_col, 0, 1000, (comp.release.value * 1000));
let compReleaseNode = compRelease.node();
let Releaselistener = function(compRelease, value) {
  comp.release.value = value/1000;
};
compRelease.addListener(Releaselistener);
//knee
let compKnee = pureknob.createKnob(size_co_2_knob, size_co_2_knob);
newKnobSetup(compKnee, "Knee", band_5_col, 0, 40, comp.knee.value);
let compKneeNode = compKnee.node();
let Kneelistener = function(compKnee, value) {
  comp.knee.value = value;
};
compKnee.addListener(Kneelistener);
//Ratio
let compRatio = pureknob.createKnob(size_co_1_knob, size_co_1_knob);
newKnobSetup(compRatio, "Ratio", band_5_col, 1, 20, comp.ratio.value);
let compRatioNode = compRatio.node();
let Ratiolistener = function(compRatio, value) {
  comp.ratio.value = value;
};
compRatio.addListener(Ratiolistener);
//Threshold
let compThres = pureknob.createKnob(size_co_2_knob, size_co_2_knob);
newKnobSetup(compThres, "Threshold", band_5_col, -100, 0, comp.threshold.value);
let compThresNode = compThres.node();
let Threslistener = function(compThres, value) {
  comp.threshold.value = value;
};
compThres.addListener(Threslistener);

//elements
let player_div = document.getElementById("player");
let canvas_div = document.getElementById("canvas");
let eq_div_1 = document.getElementById("eq_1");
let eq_div_2 = document.getElementById("eq_2");
let eq_div_3 = document.getElementById("eq_3");
let eq_div_4 = document.getElementById("eq_4");
let comp_div = document.getElementById("con_ch");

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
comp_div.appendChild(compAttackNode);
comp_div.appendChild(compThresNode);
comp_div.appendChild(compRatioNode);
comp_div.appendChild(compKneeNode);
comp_div.appendChild(compReleaseNode);


player_div.appendChild(playButton);
if(micbtn) {
  player_div.appendChild(micButton);
}
player_div.appendChild(loopButton);