// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBqq5uFvuul59UZKh_7_WDHM0i3e5w6EZg",
  authDomain: "harmonyhushmonitor.firebaseapp.com",
  databaseURL: "https://harmonyhushmonitor-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "harmonyhushmonitor",
  storageBucket: "harmonyhushmonitor.appspot.com",
  messagingSenderId: "353494293835",
  appId: "1:353494293835:web:ee78564b64148bcbcc9cce",
  measurementId: "G-DBZ6NYWCK4"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the file storage service
const storage = firebase.storage();
// Get a reference to the database service
const database = firebase.database();

// Create camera database reference
const camRef = database.ref("file");

// Load the MobileNet model
let model;

// Log TensorFlow.js and MobileNet model loading
console.log("TensorFlow.js and MobileNet model loading...");

// Ensure the model is loaded before using it
async function loadModel() {
  model = await mobilenet.load({ version: 2, alpha: 0.5 });
  console.log("TensorFlow.js and MobileNet model loaded successfully.");
}

// Perform image classification with TensorFlow.js
async function classifyImage(imgElement) {
  const predictions = await model.classify(imgElement);
  console.log("Predictions:", predictions);

  // Check if there are predictions and display the result
  if (predictions.length > 0) {
    const topPrediction = predictions[0];
    const result = `Prediction: ${topPrediction.className}, Probability: ${topPrediction.probability.toFixed(4)}`;
    console.log("Result:", result);

    // Update your HTML to display the result as needed
    document.getElementById("time").innerText = `${getCurrentTime()} - ${result}`;
  }
}

// Helper function to get the current time
function getCurrentTime() {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
}

// Sync on any updates to the DB. THIS CODE RUNS EVERY TIME AN UPDATE OCCURS ON THE DB.
camRef.limitToLast(1).on("value", function (snapshot) {
  snapshot.forEach(function (childSnapshot) {
    const image = childSnapshot.val()["image"];
    const time = childSnapshot.val()["timestamp"];

    console.log("Timestamp from Firebase:", time);

    const storageRef = storage.ref(image);

    storageRef.getDownloadURL().then(function (url) {
      console.log("Image URL:", url);

      // Display the image
      document.getElementById("photo").src = url;

      // Classify the image
      const imgElement = document.getElementById("photo");
      classifyImage(imgElement);
    }).catch(function (error) {
      console.log(error);
    });
  });
});

// Load the model when the script is executed
loadModel();