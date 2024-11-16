#! /usr/bin/env node

console.log(
  'This script populates some test bucket list items to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.cojoign.mongodb.net/local_library?retryWrites=true&w=majority&appName=Cluster0"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const BucketListItem = require("./models/BucketListItems");

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

async function createBucketListItems() {
  const items = [
    {
      nameItem: "Eiffel Tower",
      description: "Visit the Eiffel Tower",
      location: "Paris, France",
      latitude: 48.8584,
      longitude: 2.2945,
      timeWhenOccurs: new Date(),
    },
    {
      nameItem: "Grand Canyon",
      description: "Hike the Grand Canyon",
      location: "Arizona, USA",
      latitude: 36.1069,
      longitude: -112.1129,
      timeWhenOccurs: new Date(),
    },
    {
      nameItem: "Northern Lights",
      description: "See the Northern Lights",
      location: "Reykjavik, Iceland",
      latitude: 64.1466,
      longitude: -21.9426,
      timeWhenOccurs: new Date(),
    },
  ];

  for (const item of items) {
    const bucketListItem = new BucketListItem(item);
    await bucketListItem.save();
    console.log(`Added bucket list item: ${item.description}`);
  }
}