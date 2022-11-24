const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        const categoriesCollection = client.db('oldgold').collection('categories');

        app.get('/categories', async (req, res) => {
            const query = {};
            const categories = await categoriesCollection.find(query).limit(3).toArray();
            res.send(categories);
        })

    }
    finally {

    }

}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('OLDGOLD running')
})

app.listen(port, () => console.log(`OldGold running on port ${port}`))