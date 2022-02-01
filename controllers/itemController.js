const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");

// Display list of all items.
exports.item_list = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}, callback);
      },
      items: function (callback) {
        Item.find({}, callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: "All Items",
        error: err,
        categories: results.categories,
        items: results.items,
      });
    }
  );
};

//Display list of items for a specific category
exports.item_list_by_category = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}, callback);
      },
      items: function (callback) {
        Item.find({ category: req.params.cid }).exec(callback);
      },
      selectedCategory: function (callback) {
        Category.findById(req.params.cid).exec(callback);
      },
    },
    function (err, results) {
      res.render("index", {
        title: results.selectedCategory.name + " Items",
        error: err,
        categories: results.categories,
        items: results.items,
      });
    }
  );
};

// Display detail page for a specific item.
exports.item_detail = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      item: function (callback) {
        Item.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      Category.findById(results.item.category).exec(function (
        err,
        found_category
      ) {
        if (err) {
          return next(err);
        }
        if (found_category) {
          res.render("item_detail", {
            title: results.item.name,
            error: err,
            categories: results.categories,
            item: results.item,
            selectedCategory: found_category,
          });
        }
      });
    }
  );
};

// Display item create form on GET.
exports.item_create_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Item create GET");
};

// Handle item create on POST.
exports.item_create_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Item create POST");
};

// Display item delete form on GET.
exports.item_delete_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Item delete GET");
};

// Handle item delete on POST.
exports.item_delete_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Item delete POST");
};

// Display item update form on GET.
exports.item_update_get = function (req, res) {
  res.send("NOT IMPLEMENTED: Item update GET");
};

// Handle item update on POST.
exports.item_update_post = function (req, res) {
  res.send("NOT IMPLEMENTED: Item update POST");
};
