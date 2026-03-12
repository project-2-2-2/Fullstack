import mongo from "./db.js";
import express from "express";
import cors from "cors";
import User from "./models/User.js";
import Task from "./models/Task.js";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send("You've reached the backend");
});

app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ name: username });
    if (userExists)
        return res.status(401).json({ message: "User already exists" });
    const user = await User.create({ name: username, password: password });
    return res.status(200).json({ user_id: user._id });
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userExists = await User.findOne({ name: username });
    if (!userExists)
        return res.status(401).json({ message: "user doesn't exist" });
    if (userExists.password !== password)
        return res.status(400).json({ message: "wrong password" });
    return res.status(200).json({ user_id: userExists._id });
});


app.post('/addTask', async (req, res) => {
    const { userId, title, content } = req.body;
    const newTask = await Task.create({
        user: userId,
        title: title,
        content: content,
        marked_finish: false
    });
    return res.status(200).json(newTask);
});


app.post('/getTasks', async (req, res) => {
    const { userId } = req.body;
    const tasks = await Task.find({ user: userId });
    return res.status(200).json({ tasks: tasks });
});


app.put('/toggleComplete', async (req, res) => {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    const updatedTask = await Task.findByIdAndUpdate(
        taskId,
        { marked_finish: !task.marked_finish },
        { returnDocument: "after" }
    );
    return res.status(200).json(updatedTask);
});


app.delete('/deleteTask/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task)
        return res.status(404).json({ message: "task not found" });
    return res.status(200).json({ message: "Deletion Success" });
});


app.listen(3000, () => {
    mongo();
    console.log("Server started on port 3000");
});