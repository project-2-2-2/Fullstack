import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true,
    },
    marked_finish: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Task = mongoose.model("Task", TaskSchema);

export default Task;