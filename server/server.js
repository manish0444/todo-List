import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Todo Model
const todoSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  completed: {
    type: Boolean,
    default: false,
  },
  assignee: {
    type: String,
    default: "Unassigned",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Todo = mongoose.model("Todo", todoSchema);

// Routes
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await Todo.find().sort({ createdAt: -1 });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/todos", async (req, res) => {
  try {
    const todo = new Todo({
      text: req.body.text,
      notes: req.body.notes || "",
      assignee: req.body.assignee || "Unassigned",
    });
    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/todos/:id", async (req, res) => {
  try {
    const updateData = {};

    // Only include fields that are present in the request
    if (req.body.completed !== undefined) {
      updateData.completed = req.body.completed;
    }
    if (req.body.notes !== undefined) {
      updateData.notes = req.body.notes;
    }
    if (req.body.text !== undefined) {
      updateData.text = req.body.text;
    }
    if (req.body.assignee !== undefined) {
      updateData.assignee = req.body.assignee;
    }

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true } // Return the updated document
    );

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/todos/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
