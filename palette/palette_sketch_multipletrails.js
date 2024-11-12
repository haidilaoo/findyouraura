//sounds
var wind_chime;
var currentSound = null;
let emotion_sound = null;
const emotionSounds = {};
var isFadingOut = false;

// texture for the particle
let particle_texture = null;
let textures = {}; // Object to hold textures for each emotion

// variable holding our particle system
let ps = null;

let canvas;
let smokeParticles = [];
let Particles = []; // Array to hold trailing particles

// To store the recorded trail path for looping
// let savedTrails = [];
// let currentTrail = [];      // Current trail being recorded
// Array to hold multiple trails
let trails = [];
let currentTrail = null;
let maxTrailLength = 30; // Set a limit for trail length

// let isReplaying = false;
// let replayTrailIndex = 0;

// Sound playback settings
let loopStartTime = 0; // Start time in seconds
let loopEndTime = 10;   // End time in seconds

function preload() {
  textures.sad = loadImage("assets/blue_particle.svg");
  textures.happy = loadImage("assets/yellow_particle.svg");
  textures.default = loadImage("assets/green_particle.png"); // Default texture


  //causing some issue for some reason 
  emotionSounds.happy = loadSound('sounds/windchime.wav');
  emotionSounds.sad = loadSound('sounds/sad.wav');
  emotionSounds.default = loadSound('sounds/windchime.wav');
  wind_chime = loadSound('sounds/windchime.wav');

}

// Use off-screen buffer for particles
let particleBuffer;

function setup() {

  //set the canvas size
  createCanvas(windowWidth, windowHeight);
  particle_texture = textures.default; // Default texture
  currentSound = emotionSounds.default; //Default sound
  //initialize our particle system
  ps = new ParticleSystem(0, createVector(width / 2, height - 60), particle_texture);

  // Initialize an off-screen buffer for particles
  particleBuffer = createGraphics(width, height);
  particleBuffer.clear();
}

function draw() {
  background(255, 254, 251);

  // Draw particles to the buffer instead of directly to the canvas
  particleBuffer.clear(); // Clear previous frame

  //Moving mouse without pressing 
  ps.origin = createVector(mouseX, mouseY);
  let dx = map(mouseX, 0, width, -0.2, 0.2);
  let wind = createVector(dx, 0);

  ps.applyForce(wind);
  ps.run();

  for (let i = 0; i < 2; i++) {
    ps.addParticle();
  }

   // Fade out current sound when needed
   fadeOutSound();

  // Update and display all smoke particles
  if (mouseIsPressed) {
    createTrail();
    // playSoundLoopSection(currentSound);
    if (currentSound && !currentSound.isPlaying()) {
      playSound(currentSound);
    }
  }

  // Replay each trail
  for (let trail of trails) {
    if (trail.isReplaying) {
      replayTrail(trail);
      // checkLoopingSound(trail.sound); // Check if sound needs to loop
    }
  }
  image(particleBuffer, 0, 0); // Draw the buffer to the main canvas

}

function fadeOutSound() {

  // If sound is fading out, gradually decrease volume
  if (isFadingOut && currentSound && currentSound.isPlaying()) {
    let volume = currentSound.getVolume();
    if (volume > 0.01) {
      currentSound.setVolume(volume - 0.01); // Decrease volume gradually
    } else {
      currentSound.stop(); // Stop sound when volume is close to 0
      isFadingOut = false; // Reset fading state
    }
  }
}


// Function to create a new trail when the mouse is pressed
function createTrail() {

  if (!currentTrail) {
    currentTrail = {
      path: [],
      isReplaying: false,
      replayIndex: 0,
      sound: currentSound, // Assign wind_chime to each trail
      playing: false,
    };
    trails.push(currentTrail);
  }

  let trailParticle = new Particle(createVector(mouseX, mouseY), particle_texture);
  Particles.push(trailParticle);

  let smoke = new SmokeParticle(mouseX, mouseY);
  smokeParticles.push(smoke);

  // Add to current trail path and limit the length of trails
  currentTrail.path.push({ x: mouseX, y: mouseY });
  if (currentTrail.path.length > maxTrailLength) {
    currentTrail.path.shift(); // Remove oldest position if trail exceeds max length
  }
}

function mouseReleased() {
  if (currentTrail) {
    currentTrail.isReplaying = true;
    currentTrail.playing = true;
    // playSoundLoopSection(currentTrail.sound); // Start looping section on replay
    currentTrail = null;
  }
  isFadingOut = true; // Start fading out
  fadeOutSound();
}

// Function to play and loop a portion of the sound
function playSoundLoopSection(sound) {
  if (sound && !sound.isPlaying()) {
    sound.playMode('sustain');
    sound.play();
    sound.jump(loopStartTime, loopEndTime - loopStartTime);
  }
}

// Function to check if the sound needs to be looped manually
function checkLoopingSound(sound) {
  if (sound && sound.isPlaying()) {
    let currentTime = sound.currentTime();
    if (currentTime >= loopEndTime) {
      sound.jump(loopStartTime); // Restart at the beginning of the loop section
    }
  }
}

function replayTrail(trail) {
  if (trail.replayIndex < trail.path.length) {
    let pos = trail.path[trail.replayIndex];
    let smoke = new SmokeParticle(pos.x, pos.y);
    smokeParticles.push(smoke);
    trail.replayIndex++;
  } else {
    trail.replayIndex = 0; // Loop back to the start of the trail
  }

  // Display replayed smoke particles
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    smokeParticles[i].update();
    smokeParticles[i].display();
  }
}


//sound
function playSound(sound) {

  if (currentSound && currentSound.isPlaying()) {
    currentSound.stop();  // Stop any currently playing sound
  }
  currentSound = sound;
  currentSound.play();
  currentSound.setVolume(1); // Start at full volume
  isFadingOut = false;
}

//smokeparticle class

class SmokeParticle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.5));
    this.size = random(10, 30);
    this.lifetime = random(60, 100); // Set a lifespan
    this.age = 0;
    this.opacity = 200; // Initial opacity for fade-out effect
  }

  update() {
    this.pos.add(this.vel);
    this.age++;
    if (this.age >= this.lifetime) {
      this.opacity -= 5; // Gradually decrease opacity
    }
  }

  display() {
    imageMode(CENTER);
    tint(255, this.opacity); // Adjust opacity based on age
    image(particle_texture, this.pos.x, this.pos.y, this.size, this.size);
  }


}

//========= PARTICLE SYSTEM ===========

/**
 * A basic particle system class
 * @param num the number of particles
 * @param v the origin of the particle system
 * @param img_ a texture for each particle in the system
 * @constructor
 */
let ParticleSystem = function (num, v, img_) {

  this.particles = [];
  this.origin = v.copy(); // we make sure to copy the vector value in case we accidentally mutate the original by accident
  this.img = img_
  for (let i = 0; i < num; ++i) {
    this.particles.push(new Particle(this.origin, this.img));
  }
};

/**
 * This function runs the entire particle system.
 */
ParticleSystem.prototype.run = function () {

  // cache length of the array we're going to loop into a variable
  // You may see <variable>.length in a for loop, from time to time but
  // we cache it here because otherwise the length is re-calculated for each iteration of a loop
  let len = this.particles.length;

  //loop through and run particles
  for (let i = len - 1; i >= 0; i--) {
    let particle = this.particles[i];
    particle.run();

    // if the particle is dead, we remove it.
    // javascript arrays don't have a "remove" function but "splice" works just as well.
    // we feed it an index to start at, then how many numbers from that point to remove.
    if (particle.isDead()) {
      this.particles.splice(i, 1);
    }
  }
}

/**
 * Method to add a force vector to all particles currently in the system
 * @param dir a p5.Vector describing the direction of the force.
 */
ParticleSystem.prototype.applyForce = function (dir) {
  let len = this.particles.length;
  for (let i = 0; i < len; ++i) {
    this.particles[i].applyForce(dir);
  }
}

/**
 * Adds a new particle to the system at the origin of the system and with
 * the originally set texture.
 */
ParticleSystem.prototype.addParticle = function () {
  this.particles.push(new Particle(this.origin, this.img));
}

//========= PARTICLE  ===========
/**
 *  A simple Particle class, renders the particle as an image
 */
let Particle = function (pos, img_) {
  this.loc = pos.copy();

  let vx = randomGaussian() * 0.3;
  let vy = randomGaussian() * 0.3 - 1.0;

  this.vel = createVector(vx, vy);
  this.acc = createVector();
  this.lifespan = 100.0;
  this.texture = img_;
}

/**
 *  Simulataneously updates and displays a particle.
 */
Particle.prototype.run = function () {
  this.update();
  this.render();
}

/**
 *  A function to display a particle
 */
Particle.prototype.render = function () {
  imageMode(CENTER);
  tint(255, this.lifespan);
  image(this.texture, this.loc.x, this.loc.y);
}

/**
 *  A method to apply a force vector to a particle.
 */
Particle.prototype.applyForce = function (f) {
  this.acc.add(f);
}

/**
 *  This method checks to see if the particle has reached the end of it's lifespan,
 *  if it has, return true, otherwise return false.
 */
Particle.prototype.isDead = function () {
  if (this.lifespan <= 0.0) {
    return true;
  } else {
    return false;
  }
}

/**
 *  This method updates the position of the particle.
 */
Particle.prototype.update = function () {
  this.vel.add(this.acc);
  this.loc.add(this.vel);
  this.lifespan -= 2.5;
  this.acc.mult(0);
}
