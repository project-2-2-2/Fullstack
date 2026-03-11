const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

mongoose.connect("mongodb+srv://sughanvasan14_db_user:JUAXqt1afJD3wLNd@cluster0.tnkgahb.mongodb.net/?appName=Cluster0")
.then(()=>console.log("MongoDB Connected"))

const User = require("./models/User")
const Student = require("./models/Student")
const Feedback = require("./models/Feedback")

// ------------------- USER REGISTER -------------------

app.post("/register", async(req,res)=>{
const user = new User(req.body)
await user.save()
res.send("Registered Successfully")
})

// ------------------- USER LOGIN -------------------

app.post("/login", async(req,res)=>{

const user = await User.findOne({
email:req.body.email,
password:req.body.password
})

if(user)
res.json({success:true})
else
res.json({success:false})

})

// ------------------- STUDENT CREATE -------------------

app.post("/students", async(req,res)=>{
const student = new Student(req.body)
await student.save()
res.json(student)
})

// ------------------- STUDENT READ -------------------

app.get("/students", async(req,res)=>{
const students = await Student.find()
res.json(students)
})

// ------------------- STUDENT UPDATE -------------------

app.put("/students/:id", async(req,res)=>{
await Student.findByIdAndUpdate(req.params.id, req.body)
res.send("Updated")
})

// ------------------- STUDENT DELETE -------------------

app.delete("/students/:id", async(req,res)=>{
await Student.findByIdAndDelete(req.params.id)
res.send("Deleted")
})

// ------------------- FEEDBACK CREATE -------------------

app.post("/feedback", async(req,res)=>{
const feedback = new Feedback(req.body)
await feedback.save()
res.json(feedback)
})

// ------------------- FEEDBACK READ -------------------

app.get("/feedback", async(req,res)=>{
const feedback = await Feedback.find()
res.json(feedback)
})

app.listen(3000,()=>{
console.log("Server running on port 3000")
})