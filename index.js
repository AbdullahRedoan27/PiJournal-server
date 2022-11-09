const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
require("dotenv").config();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zpaqsgt.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
        const servicesCollection = client.db('PiJournal').collection('services');
        const reviewCollection = client.db('PiJournal').collection('reviews')

        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services =await cursor.toArray();
            res.send(services);
        })
        app.get('/home/services', async(req, res)=>{
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.limit(3).toArray();
            res.send(services);
        })
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id
            const query = {_id: ObjectId(id)}
            const result =await servicesCollection.findOne(query);
            res.send(result);
        })
        app.get('/reviews', async(req, res) => {
            const id = req.query.id;
            const query = {serviceId: id}
            const cursor = reviewCollection.find(query).sort({time: -1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.get('/myReviews', async(req, res) => {
            const email = req.query.email;
            const query = {email: email}
            const cursor = reviewCollection.find(query).sort({time: -1});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.get('/myReviews/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await reviewCollection.findOne(query);
            res.send(result)
        })

        app.patch('/editReview/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const updatedmessage = req.body.updatedReview;
            console.log(updatedmessage);
            const updatedReview = {
                $set: {
                    review: updatedmessage
                }
            }
            const result = await reviewCollection.updateOne(query, updatedReview)
            res.send(result);
        })

        app.delete('/myReviews/:id', async(req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = {_id: ObjectId(id)};
            const result =await reviewCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/reviews', async(req, res)=>{
            const review = req.body;
            console.log(review);
            const result = await reviewCollection.insertOne(review);
            res.send(result);
        })

        app.post('/addService', async(req, res) => {
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.send(result);
        })
    }
    finally{

    }
}
run().catch(error => console.error(error))

app.get('/', (req, res)=>{
    res.send('pijournal server is running')
})

app.listen(port, ()=>{
    console.log('pijournal server running');
})