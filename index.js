const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// Middleware

app.use(cors())
app.use(express.json())


// MongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@oldisgold.25tnzm5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {

        const usersCollection = client.db('oldgold').collection('users');
        const categoriesCollection = client.db('oldgold').collection('categories');
        const productsCollection = client.db('oldgold').collection('products');
        const bookingsCollection = client.db('oldgold').collection('bookings');


        // JWT API
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send('unauthorized User')
        })

        // User POST...........
        app.post('/users', async (req, res) => {
            const user = req.body;
            const users = await usersCollection.insertOne(user);
            res.send(users);
        })
        //  User GET
        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        // Categories Get..................
        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).limit(3).toArray();
            res.send(categories);
        });

        // Products POST from add products page.......................
        app.post('/products', async (req, res) => {
            const product = req.body;
            const products = await productsCollection.insertOne(product);
            res.send(products);
        });

        // Products GET for single category Products..................
        app.get('/products/:name', async (req, res) => {
            const category = req.params.name;
            const query = { category: category }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // Products GET for My Products.................
        app.get('/products', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // Bookings POST from products page.................
        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const bookings = await bookingsCollection.insertOne(booking);
            res.send(bookings);
        });

        // Bookings GET by buyer in my bookings page of buyer..............
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { sellerEmail: email }
            const myBookings = await bookingsCollection.find(query).toArray();
            res.send(myBookings);
        });


    }
    finally {

    }

}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('OLDGOLD running')
})

app.listen(port, () => console.log(`OldGold running on port ${port}`))