const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  description: { type: String },
});

//Virtual for category url
CategorySchema.virtual("url").get(function () {
  return "/inventory/category/" + this._id;
});

//Model export
module.exports = mongoose.model("Category", CategorySchema);
