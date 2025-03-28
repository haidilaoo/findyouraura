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




function preload() {
  textures.sad = loadImage("assets/blue_particle.svg");
  textures.happy = loadImage("assets/yellow_particle.svg");
  textures.eh = loadImage("assets/beige_particle.svg"); 
  textures.angry = loadImage("assets/red_particle.svg");
  textures.shy = loadImage("assets/pink_particle.svg");
  textures.tired = loadImage("assets/grey_particle.svg");
  textures.meh = loadImage("assets/purple_particle.svg");
  textures.default = loadImage("assets/green_particle.png"); // Default texture


  //causing some issue for some reason 
  emotionSounds.happy = loadSound('sounds/windchime.wav');
  emotionSounds.sad = loadSound('sounds/sad.wav');
  emotionSounds.meh = loadSound('sounds/meh.wav');
  emotionSounds.angry = loadSound('sounds/angry.wav');
  emotionSounds.shy = loadSound('sounds/shy.mp3');
  emotionSounds.tired = loadSound('sounds/tired.wav');
  emotionSounds.eh = loadSound('sounds/eh.wav');
  emotionSounds.default = loadSound('sounds/default.mp3');


}

function setup() {

  //set the canvas size
  createCanvas(windowWidth, windowHeight);
  particle_texture = textures.default; // Default texture
  currentSound = emotionSounds.default; //Default sound
  //initialize our particle system
  ps = new ParticleSystem(0, createVector(width / 2, height - 60), particle_texture);
}

function draw() {
  background(240,240, 240);



  // Fade out current sound when needed
  fadeOutSound();

  //Moving mouse without pressing 
  ps.origin = createVector(mouseX, mouseY);
  let dx = map(mouseX, 0, width, -0.2, 0.2);
  let wind = createVector(dx, 0);

  ps.applyForce(wind);
  ps.run();

  for (let i = 0; i < 2; i++) {
    ps.addParticle();
  }


  // Check if mouse is pressed to create smoke particles
  if (mouseIsPressed) {

    let trailParticle = new Particle(createVector(mouseX, mouseY), particle_texture);
    Particles.push(trailParticle);

    //to draw trail with the current texture
    let smoke = new SmokeParticle(mouseX, mouseY, particle_texture);
    smokeParticles.push(smoke);

    //sound when mouse is pressed
    if (currentSound && !currentSound.isPlaying()) {
      playSound(currentSound);
    }



  } else {



    // Stop the current sound if playing
    isFadingOut = true; // Start fading out

    fadeOutSound();


  }



  // Update and display all smoke particles
  for (let i = smokeParticles.length - 1; i >= 0; i--) {
    smokeParticles[i].update();
    smokeParticles[i].display();

  }

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


function keyPressed() {
  // Clear canvas when 'c' key is pressed
  if (key === 'c' || key === 'C') {
    clearCanvas();
  }
}


function clearCanvas() {
  // Clear the canvas by filling it with white color
  background(240, 240, 240);
  // Clear the array of smoke particles
  smokeParticles = [];
  Particles = []; // Array to hold trailing particles
}

//smokeparticle class

class SmokeParticle {
  constructor(x, y, texture) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.5));
    this.size = random(10, 30); // to set size of particles
    this.lifetime = random(60, 100); // Set a lifespan
    this.age = 0;
    this.opacity = 200; // Initial opacity for fade-out effect
    this.texture = texture; // Store the texture when the particle is created
  }

  update() {
    this.pos.add(this.vel);
    this.age++;
    if (this.age >= this.lifetime) {
      this.opacity -= 0; // Gradually decrease opacity //put to 0 to make particles not fade away
    }
  }

  display() {
    imageMode(CENTER);
    tint(255, this.opacity); // Adjust opacity based on age
    image(this.texture, this.pos.x, this.pos.y, this.size, this.size);
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
