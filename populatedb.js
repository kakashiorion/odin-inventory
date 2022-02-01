#! /usr/bin/env node

// console.log(
//   "This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true"
// );

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require("async");
var Item = require("./models/item");
var Category = require("./models/category");

var mongoose = require("mongoose");
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

var categories = [];
var items = [];

function categoryCreate(name, description, cb) {
  categorydetail = { name: name, description: description };

  var category = new Category(categorydetail);

  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Category: " + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, image, price, qty, category, cb) {
  var item = new Item({
    name: name,
    image: image,
    price: price,
    qty: qty,
    category: category,
  });

  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log("New Item: " + item);
    items.push(item);
    cb(null, item);
  });
}

function createItems(cb) {
  async.series(
    [
      function (callback) {
        itemCreate("Amul Butter (100g)", "", 200, 5, categories[0], callback);
      },
      function (callback) {
        itemCreate(
          "Amul Cheese (10 slices)",
          "",
          120,
          3,
          categories[0],
          callback
        );
      },
      function (callback) {
        itemCreate("Eggs (6pc)", "", 50, 8, categories[0], callback);
      },
      function (callback) {
        itemCreate("Nestle Milk (500ml)", "", 60, 2, categories[0], callback);
      },
      function (callback) {
        itemCreate("Bru Coffee (100g)", "", 100, 3, categories[1], callback);
      },
      function (callback) {
        itemCreate("Tata Tea (200g)", "", 150, 7, categories[1], callback);
      },
      function (callback) {
        itemCreate(
          "Tropicana Orange Juice (300ml)",
          "",
          80,
          1,
          categories[1],
          callback
        );
      },
      function (callback) {
        itemCreate("Potato (100g)", "", 40, 15, categories[2], callback);
      },
      function (callback) {
        itemCreate("Cucumber (200g)", "", 65, 6, categories[2], callback);
      },
      function (callback) {
        itemCreate("Onions (50g)", "", 70, 10, categories[2], callback);
      },
      function (callback) {
        itemCreate("Apple (500g)", "", 120, 9, categories[3], callback);
      },
      function (callback) {
        itemCreate("Mango (5pc)", "", 200, 14, categories[3], callback);
      },
      function (callback) {
        itemCreate("Pineapple (500g)", "", 120, 25, categories[3], callback);
      },
      function (callback) {
        itemCreate("Chicken (500g)", "", 240, 12, categories[4], callback);
      },
      function (callback) {
        itemCreate("Pork (200g)", "", 320, 5, categories[4], callback);
      },
      function (callback) {
        itemCreate("Fish (300g)", "", 150, 7, categories[4], callback);
      },
      function (callback) {
        itemCreate(
          "Pantene Shampoo (500ml)",
          "",
          190,
          11,
          categories[5],
          callback
        );
      },
      function (callback) {
        itemCreate("Cinthol Soap (3pc)", "", 145, 20, categories[5], callback);
      },
      function (callback) {
        itemCreate(
          "Old Spice Shaving Cream (50g)",
          "",
          60,
          4,
          categories[5],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Huggies Diaper (10pc)",
          "",
          130,
          7,
          categories[6],
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Eveready AAA Batteries (2pc)",
          "",
          40,
          4,
          categories[6],
          callback
        );
      },
    ],
    // optional callback
    cb
  );
}

function createCategories(cb) {
  async.parallel(
    [
      function (callback) {
        categoryCreate(
          "Dairy",
          "All products that are made from milk",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Beverages",
          "Liquid products that can be drunk",
          callback
        );
      },
      function (callback) {
        categoryCreate("Vegetables", "Fresh vegetable products", callback);
      },
      function (callback) {
        categoryCreate("Fruits", "Fresh fruit products", callback);
      },
      function (callback) {
        categoryCreate("Meat", "Non-veg fresh products", callback);
      },
      function (callback) {
        categoryCreate(
          "Personal Care",
          "Products used for personal care and hygiene",
          callback
        );
      },
      function (callback) {
        categoryCreate("Other", "All other misc products", callback);
      },
    ],
    // optional callback
    cb
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Items: " + items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
