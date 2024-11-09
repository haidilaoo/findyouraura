

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
  createCanvas(windowWidth, windowHeight);  // Attach canvas to the main tag
  // canvas.parent("overlayCanvasContainer"); // Attach canvas to overlay container
  
  // Create the video
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();

  bodySegmentation.detectStart(video, gotResults);
  classifier.classifyStart(video, gotResult); //classify video
}

function draw() {
  // background(0, 102, 255); // Green background
  console.log("Drawing..."); // This will tell you if draw() is being called

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
  text(label, width / 2, height - 4);  // Position it in the center of the canvas

  // emotionDetected(label); // will make alot of empty arrays as it keeps adding to array
  emotionLabel(label); //just to show what emotion in real time 

}

// Callback function for body segmentation
function gotResults(result) {
  segmentation = result;
}

function gotResult(results) {
  // Update the label variable which is displayed on the canvas
  label = results[0].label;
  
}

function emotionLabel(label) {
  document.getElementById('emotion').innerText = label;
}

//sending data to palette
function emotionDetected(label){
  document.getElementById('emotion').innerText = label;
   // Save the label value in localStorage
  //  localStorage.setItem('emotionLabel', label);
   // Get existing emotions from localStorage (if any)
  let emotions = JSON.parse(localStorage.getItem('emotionLabels')) || [];

  console.log(!emotions.includes(label));
  if (label && !emotions.includes(label)) {
  // Add the new emotion to the array
  emotions.push(label);

  // Save the updated array back to localStorage
  localStorage.setItem('emotionLabels', JSON.stringify(emotions));
  }
  
}

// Function to call emotionDetected when "back" is clicked
function saveEmotionAndGoBack() {
  emotionDetected(label); // Call only once when button is clicked
  window.location.href = "palette.html"; // Redirect to palette.html
}

// function mousePressed() {
//   let fs = fullscreen();
//   fullscreen(!fs); // Toggle fullscreen mode on click
// }
