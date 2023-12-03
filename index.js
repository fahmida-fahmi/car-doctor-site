const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000 
// const { log } = require('console');
require('dotenv').config()
const app = express()

// middleware

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@cluster0.cmyv688.mongodb.net/?retryWrites=true&w=majority"`;

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const servicesDb = client.db('carDoctor').collection('services')
    const ordersDb = client.db('carDoctor').collection('orders')

    app.get('/services',async(req,res) =>{
        const query = servicesDb.find()
        const result = await query.toArray()
        res.send(result)
    })

    app.get('/services/:id', async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      // const options = {
      //   // Include only the `title` and `imdb` fields in the returned document
      //   projection: {  title: 1, img: 1, price: 1, service_id: 1 },
      // };
      const result = await servicesDb.findOne(query)
      res.send(result)
    })
    
    app.get('/services/checkout/:id', async(req,res) =>{
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const options = { 
        projection :{ _id: 1, price : 1, title: 1, img: 1 }

      }
      const result = await servicesDb.findOne(query, options)
      res.send(result)
    })

    app.post('/bookings', async(req,res)=>{
      const booking = req.body
      console.log(booking);
      const result = await ordersDb.insertOne(booking)
      res.send(result)
    })
    app.get('/bookings', async(req,res)=>{
      console.log(req.query.email);
      let query = {}
      if(req.query?.email){
        query ={
          email: req.query.email
        }
      }
      const result = await ordersDb.find(query).toArray()
      res.send(result)
    })

    app.delete('/bookings/:id', async(req, res) =>{
        const id = req.params.id 
        const query = { _id: new ObjectId(id)}
        const result = await ordersDb.deleteOne(query)
        res.send(result)
    })
    app.delete('/bookings', async(req,res) =>{
      const services = req.body 
      const result = await ordersDb.deleteMany(services)
      res.send(result)
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


app.get('/', (req,res)=>{
    res.send('This car master is running funning tunning he he he he he')
})
app.listen(port , ()=>{
    console.log(`this server is running is ${port} number`)
})