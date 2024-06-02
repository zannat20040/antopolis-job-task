const express = require('express');
const cors = require('cors')

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(cors({
    origin: 'https://antopolis-client.vercel.app',
    credentials: true
}));


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uvkap0c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;



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

        const database = client.db("Antopolis");
        const animalsDB = database.collection("animals");
        const catagoriesDB = database.collection("catagories");

        const count = await catagoriesDB.countDocuments();
        if (count === 0) {
            await catagoriesDB.insertOne({ categories: [] });
        }

        app.post('/allAnimals', async (req, res) => {
            const data = req.body
            const result = await animalsDB.insertOne(data);
            res.send(result)
        })

        app.put('/allCategories', async (req, res) => {
            const category = req.body.catagory;

            try {
                // Check if the category already exists in the database
                const existingCategory = await catagoriesDB.findOne({ categories: category });

                if (existingCategory) {
                    return res.status(400).json({ message: 'Category already exists' });
                }

                // Update the existing document by adding the new category to the array
                const result = await catagoriesDB.updateOne({}, { $push: { categories: category } });

                res.json(result);
            } catch (error) {
                console.error("Error adding category:", error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });

        app.get('/allCategories', async (req, res) => {
            try {
                const categories = await catagoriesDB.findOne({});
                res.json(categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
                res.status(500).json({ message: 'Internal server error' });
            }
        });


        app.get('/allAnimals', async (req, res) => {
          const result =await animalsDB.find().toArray()
          res.json(result)
        });
        

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})