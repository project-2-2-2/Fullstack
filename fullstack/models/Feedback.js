const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
name:String,
message:String
})

module.exports = mongoose.model("Feedback",feedbackSchema)