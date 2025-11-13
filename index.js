const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@first-project.21znaun.mongodb.net/?appName=first-project`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db('food_db');
    const reviewCollection = db.collection('review');

    // all review
    app.get('/review', async (req, res) => {
      const cursor = reviewCollection.find().sort({ review_date: "desc" });
      const result = await cursor.toArray();
      res.send(result)
    })
    // leatest review
    app.get('/featuredReview', async (req, res) => {
      const result = await reviewCollection.find().sort({ rating: -1 }).limit(6).toArray();
      res.send(result);
    })

    // review detailes by id
    app.get('/review/:id', async (req, res) => {
      const { id } = req.params;
      const objectId = new ObjectId(id);
      const result = await reviewCollection.findOne({ _id: objectId })
      res.send(result)
    })


    app.get("/my-review", async (req, res) => {
      const email = req.query.email
      const result = await reviewCollection.find({ email: email }).toArray()
      res.send(result)
    })

    app.post('/review', async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result)
    })

    // review search api
    app.get('/search', async (req, res) => {
      const search_text = req.query.search;
      const result = await reviewCollection.find({ food_name: { $regex: search_text, $options: "i" } }).toArray();
      res.send(result)
    })

    // review delete
    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})