const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
  image: { type: String },
  price: { type: Number, required: true, min: 0 },
  qty: { type: Number, required: true, min: 0 },
  category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
});

//Virtual for item url
ItemSchema.virtual("url").get(function () {
  return "/inventory/item/" + this._id;
});

//Model export
module.exports = mongoose.model("Item", ItemSchema);
