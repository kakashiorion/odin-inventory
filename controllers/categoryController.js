const Category = require("../models/category");
const Item = require("../models/item");
const async = require("async");
const { body, validationResult } = require("express-validator");

// Display list of all Categories.
exports.category_list = function (req, res) {
  res.send("NOT IMPLEMENTED: Category list");
};

// Display detail page for a specific Category.
exports.category_detail = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
    },
    function (err, results) {
      Category.findById(req.params.id).exec(function (err, found_category) {
        if (err) {
          return next(err);
        }
        if (found_category) {
          res.render("category_detail", {
            title: found_category.name,
            error: err,
            categories: results.categories,
            thisCategory: found_category,
          });
        }
      });
    }
  );
};

// Display Category create form on GET.
exports.category_create_get = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
    },
    function (err, results) {
      res.render("category_form", {
        title: "Create new category",
        error: err,
        categories: results.categories,
      });
    }
  );
};

// Handle Category create on POST.
exports.category_create_post = [
  // Validate and sanitize the name field.
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),

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
          res.render("category_form", {
            title: "Create new category",
            category: req.body,
            errors: errors.array(),
            categories: results.categories,
          });
          return;
        } else {
          // Data from form is valid.
          // Create an Category object with escaped and trimmed data.
          let category = new Category({
            name: req.body.name,
            description: req.body.description,
          });
          category.save(function (err) {
            if (err) {
              return next(err);
            }
            // Successful - redirect to new category record.
            res.redirect(category.url);
          });
        }
      }
    );
  },
];

// Display Category delete form on GET.
exports.category_delete_get = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      category: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
      items: function (callback) {
        Item.find({ category: req.params.id }).exec(callback);
      },
    },
    function (err, results) {
      if (results.category == null) {
        // No results.
        res.redirect("/inventory/items");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: "Delete Category",
        category: results.category,
        categories: results.categories,
        items: results.items,
      });
    }
  );
};

// Handle Category delete on POST.
exports.category_delete_post = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      category: function (callback) {
        Category.findById(req.body.category).exec(callback);
      },
      items: function (callback) {
        Item.find({ category: req.body.category }).exec(callback);
      },
    },
    function (err, results) {
      console.log(req.body);
      if (err) {
        return next(err);
      }
      // Success
      if (results.items.length > 0) {
        // Category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: "Delete Category",
          categories: results.categories,
          category: results.category,
          items: results.items,
        });
        return;
      } else {
        // Category has no items. Delete object and redirect to the homepage.
        Category.findByIdAndRemove(
          req.body.category,
          function deleteCategory(err) {
            if (err) {
              return next(err);
            }
            // Success - go to all items list
            res.redirect("/inventory/items");
          }
        );
      }
    }
  );
};

// Display Category update form on GET.
exports.category_update_get = function (req, res) {
  async.parallel(
    {
      categories: function (callback) {
        Category.find({}).exec(callback);
      },
      thisCategory: function (callback) {
        Category.findById(req.params.id).exec(callback);
      },
    },
    function (err, results) {
      if (err) {
        return next(err);
      }
      if (results.thisCategory == null) {
        // No results.
        var err = new Error("Category not found");
        err.status = 404;
        return next(err);
      }
      // Success.
      res.render("category_form", {
        title: "Update Category",
        categories: results.categories,
        category: results.thisCategory,
      });
    }
  );
};

// Handle Category update on POST.
exports.category_update_post = [
  // Validate and sanitize the name field.
  body("name", "Name required").trim().isLength({ min: 1 }).escape(),

  // Process request after validation and sanitization
  (req, res, next) => {
    async.parallel(
      {
        categories: function (callback) {
          Category.find({}).exec(callback);
        },
        thisCategory: function (callback) {
          Category.findById(req.params.id).exec(callback);
        },
      },
      function (err, results) {
        // Extract the validation errors from a request.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          // There are errors. Render form again with sanitized values/errors messages.
          res.render("category_form", {
            title: "Update Category",
            category: results.thisCategory,
            errors: errors.array(),
            categories: results.categories,
          });
          return;
        } else {
          // Data from form is valid.
          //Update the record
          Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {},
            function (err, theCategory) {
              if (err) {
                return next(err);
              }
              // Successful - redirect to the category record.
              res.redirect(theCategory.url);
            }
          );
        }
      }
    );
  },
];
