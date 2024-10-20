

let bodySegmentation;
let video;
let segmentation;
let options = {
  maskType: "person",
};

//emotion tracking
let classifer; 
let imageModelURL = "https://teachablemachine.withgoogle.com/models/Grn6mlVlG/";
let label = "";

function preload() {
  bodySegmentation = ml5.bodySegmentation("SelfieSegmentation", options);
  
  classifier = ml5.imageClassifier(imageModelURL + "model.json", {
    flipped: true,
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create the video
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  bodySegmentation.detectStart(video, gotResults);
  
  classifier.classifyStart(video, gotResult); //classify video
}

function draw() {
  background(0, 102, 255); // Green background

  if (segmentation) {
    // Draw the video and mask the background
    let img = video.get();  // Get current video frame
    img.loadPixels();       // Load the pixels of the video frame
    segmentation.mask.loadPixels(); // Load the pixels of the mask

    // Iterate over each pixel
    for (let x = 0; x < img.width; x++) {
      for (let y = 0; y < img.height; y++) {
        let index = (x + y * img.width) * 4;
        
        let mirroredIndex = ((img.width - x - 1) + y * img.width) * 4; // Calculate the mirrored index

        
        // // If the mask's alpha value is 0 (background), set pixel to transparent
        // if (segmentation.mask.pixels[index + 3] === 0) {
        //   img.pixels[index + 3] = 0; // Set alpha to 0 (transparent)
        
                if (segmentation.mask.pixels[index + 3] !== 0) {
          // Apply a green mask over the bg(non-person pixels)
          img.pixels[mirroredIndex] = 221;   // Red channel
          img.pixels[mirroredIndex + 1] = 255; // Green channel
          img.pixels[mirroredIndex + 2] = 252;   // Blue channel
        } else {
          // For the person , change it to blue
          img.pixels[mirroredIndex] = 180;   // Red channel
          img.pixels[mirroredIndex + 1] = 133;   // Green channel
          img.pixels[mirroredIndex + 2] = 255; // Blue channel
          img.pixels[mirroredIndex + 3] = 255; // Set alpha to opaque
        }
      }
    }

    img.updatePixels();  // Update the video pixels after manipulation
    image(img, 0, 0, width, height, 0, 0, img.width, img.height, COVER);    // Display the video with the mask applied
  }
  
  // Display the label on the canvas
  fill(255);
  textSize(16);
  textAlign(CENTER);
  text(label, width / 2, height - 4);
  
}

// Callback function for body segmentation
function gotResults(result) {
  segmentation = result;
}

function gotResult(results) {
  // Update the label variable which is displayed on the canvas
  label = results[0].label;
  
}

// function mousePressed() {
//   let fs = fullscreen();
//   fullscreen(!fs); // Toggle fullscreen mode on click
// }
