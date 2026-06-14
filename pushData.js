import fs from 'fs';

async function push() {
  try {
    const data = fs.readFileSync('./firebase-seed-data.json', 'utf8');
    const url = 'https://the-spark-c4074-default-rtdb.firebaseio.com/.json';
    
    console.log("Pushing data to Firebase Realtime Database via REST API...");
    const res = await fetch(url, {
      method: 'PUT',
      body: data,
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) {
      console.log("Successfully pushed complete data to Firebase RTDB!");
    } else {
      console.log("Failed to push data. Status:", res.status);
      console.log("Response:", await res.text());
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

push();
