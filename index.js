const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

// Middleware

app.use(cors())
app.use(express.json())

function verifyJwt(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized Access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (error, decoded) {
        if (error) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


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
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token })
            }
            res.status(403).send('unauthorized access')
        })

        // User POST...........
        app.put('/users/:email', async (req, res) => {
            const user = req.body;
            const email = req.params.email;
            const filter = { email: email }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: user.name,
                    email: user.email,
                    photo: user.photo,
                    userRole: user.userRole,
                    verified: false
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        });

        //  User GET for admin............
        app.get('/users', verifyJwt, async (req, res) => {
            const userRole = req.query.userRole;
            const query = { userRole: userRole };
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        })

        //  User GET for Verification............
        app.get('/user/:email', async (req, res) => {
            const userEmail = req.params.email;
            const query = { email: userEmail };
            const user = await usersCollection.findOne(query);
            console.log(user.userRole);
            res.send(user);
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
            const query = {
                category: category,
                status: true
            }
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

        // Products GET for Homepage Featured Products.................
        app.get('/featured', async (req, res) => {
            const query = { adStatus: true }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // Product DELETE from myproducts of Seller.............
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.send(result)
        })

        // Product Status UPDATE/PATCH by Seller..........
        app.patch('/product/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            const query = { _id: ObjectId(id) }
            const updatedStaus = {
                $set: {
                    status: status
                }
            }
            const result = await productsCollection.updateOne(query, updatedStaus);
            res.send(result);
        });

        // Product Ad Status UPDATE by Seller...........
        app.patch('/productad/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.adStatus;
            const query = { _id: ObjectId(id) }
            const updatedStaus = {
                $set: {
                    adStatus: status
                }
            }
            const result = await productsCollection.updateOne(query, updatedStaus);
            res.send(result);
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