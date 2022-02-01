const Item = require("../models/item");
const Category = require("../models/category");
const async = require("async");
const { body, validationResult } = require("express-validator");

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
        category: results.selectedCategory,
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
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
    },
    function (err, results) {
      res.render("item_form", {
        title: "Create new item",
        error: err,
        categories: results.categories,
      });
    }
  );
};

// Handle item create on POST.
exports.item_create_post = [
  // Validate and sanitize the name field.
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),
  body("price", "Price required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number"),
  body("qty", "Qty required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isFloat({ min: 0 })
    .withMessage("Qty must be a number"),
  body("category", "Category required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    async.parallel(
      {
        categories: function (callback) {
          Category.find({}).exec(callback);
        },
      },
      function (err, results) {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.render("item_form", {
            title: "Create new item",
            item: req.body,
            errors: errors.array(),
            categories: results.categories,
          });
          return;
        } else {
          // Data from form is valid.
          // Create an Item object with escaped and trimmed data.
          let item = new Item({
            name: req.body.name,
            price: req.body.price,
            qty: req.body.qty,
            image: req.body.image,
            category: req.body.category,
          });
          item.save(function (err) {
            if (err) {
              return next(err);
            }
            // Successful - redirect to new item record.
            res.redirect(item.url);
          });
        }
      }
    );
  },
];

// Display item delete form on GET.
exports.item_delete_get = function (req, res) {
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
      if (results.item == null) {
        // No results.
        res.redirect("/inventory/items");
      }
      // Successful, so render.
      res.render("item_delete", {
        title: "Delete Item",
        categories: results.categories,
        item: results.item,
      });
    }
  );
};

// Handle item delete on POST.
exports.item_delete_post = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      item: function (callback) {
        Item.findById(req.body.item).exec(callback);
      },
    },
    function (err, results) {
      console.log(req.body);
      if (err) {
        return next(err);
      }
      // Category has no items. Delete object and redirect to the homepage.
      Item.findByIdAndRemove(req.body.item, function deleteItem(err) {
        if (err) {
          return next(err);
        }
        // Success - go to all items list
        res.redirect("/inventory/items");
      });
    }
  );
};

// Display item update form on GET.
exports.item_update_get = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      thisItem: function (callback) {
        Item.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.thisItem == null) {
        // No results.
        var err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("item_form", {
        title: "Update Item",
        categories: results.categories,
        item: results.thisItem,
      });
    }
  );
};

// Handle item update on POST.
exports.item_update_post = [
  // Validate and sanitize the name field.
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),
  body("price", "Price required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isFloat({ min: 0 })
    .withMessage("Price must be a number"),
  body("qty", "Qty required")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .isFloat({ min: 0 })
    .withMessage("Qty must be a number"),
  body("category", "Category required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    async.parallel(
      {
        categories: function (callback) {
          Category.find({}).exec(callback);
        },
        thisItem: function (callback) {
          Item.findById(req.params.id).exec(callback);
        },
      },
      function (err, results) {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.render("item_form", {
            title: "Update Item",
            item: results.thisItem,
            errors: errors.array(),
            categories: results.categories,
          });
          return;
        } else {
          // Data from form is valid.
          //Update the record
          Item.findByIdAndUpdate(
            req.params.id,
            req.body,
            {},
            function (err, theItem) {
              if (err) {
                return next(err);
              }
              // Successful - redirect to the item record.
              res.redirect(theItem.url);
            }
          );
        }
      }
    );
  },
];
