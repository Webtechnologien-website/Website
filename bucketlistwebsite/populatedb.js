#! /usr/bin/env node

console.log(
  'This script populates some test bucket list items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const BucketListItem = require("./models/BucketListItems");

const bucketListItems = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Connected to MongoDB");

  await createBucketListItems();
  console.log("Debug: Bucket list items created");

  mongoose.connection.close();
}

async function bucketListItemCreate(username, description, location, timeWhenOccurs) {
  const bucketListItem = new BucketListItem({ username, description, location, timeWhenOccurs });
  await bucketListItem.save();
  bucketListItems.push(bucketListItem);
  console.log(`Added bucket list item: ${username}`);
}

async function createBucketListItems() {
  console.log("Adding bucket list items");
  await bucketListItemCreate("Skydiving", "Experience the thrill of freefalling from an airplane.", "California", new Date(2025, 6, 15));
  await bucketListItemCreate("Visit the Great Wall of China", "Walk along the historic Great Wall of China.", "China", new Date(2025, 4, 10));
  await bucketListItemCreate("Learn to play the guitar", "Take guitar lessons and learn to play your favorite songs.", "New York", new Date(2025, 9, 1));
  await bucketListItemCreate("Scuba diving in the Great Barrier Reef", "Explore the underwater world of the Great Barrier Reef.", "Australia", new Date(2025, 11, 20));
  await bucketListItemCreate("Run a marathon", "Train and complete a full marathon.", "Boston", new Date(2025, 3, 18));
}