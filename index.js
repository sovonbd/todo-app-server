const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2dhdxvg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const taskCollection = client.db("taskDB").collection("tasks");

    app.get("/tasks/:email", async (req, res) => {
      const email = req.params.email;
      const query = { userEmail: email };
      const result = await taskCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/createTask", async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.patch("/tasks/:id", async (req, res) => {
      const id = req.params.id;
      const updatedTask = req.body;
      console.log(id, updatedTask);

      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          ...(updatedTask.taskName && { taskName: updatedTask.taskName }),
          ...(updatedTask.taskDescription && {
            taskDescription: updatedTask.taskDescription,
          }),
          ...(updatedTask.taskDate && { taskDate: updatedTask.taskDate }),
          ...(updatedTask.taskPriority && {
            taskPriority: updatedTask.taskPriority,
          }),
          ...(updatedTask.droppableId && {
            droppableId: updatedTask.droppableId,
          }),
        },
      };

      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("TODO App running at http://localhost:5000");
});

app.listen(port, () => {
  console.log(`TODO App listening on port ${port}`);
});
