const express = require("express");
const ejs = require("ejs");
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

// express setup
const app = express();
const portNumber = 5000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/templates'))
app.use(express.json());
app.use(express.urlencoded());

const server = app.listen(portNumber, (err) => {
    if (err) {
        console.log("Starting server failed.");
    } else {
        console.log(`Webserver started and running at http://localhost:${portNumber}`);
    }
})

// mongodb
const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const uri = `mongodb+srv://${username}:${password}@cluster0.doiqlwl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// routing
// GETS
app.get("/", (req, res) => {
    res.render('homepage')
})

app.get("/create", (req, res) => {
    res.render('create')
})

app.get("/tacoStory", (req, res) => {
    res.render('tacoStory')
})

app.get("/pizzaStory", (req, res) => {
    res.render('pizzaStory')
})

app.get("/photoStory", (req, res) => {
    res.render('photoStory')
})

app.get("/select", (req, res) => {
    res.render('select', {errorMessage: ""})
})

app.post("/review", (req, res) => {
    lookUpOneEntry(client, databaseAndCollection, req.body['user']).then((result) => {
        if (result['type'] == 'taco') {
            res.render('tacoPost', result)
        }else if (result['type'] == 'photo') {
            res.render('photoPost', result)
        }else if (result['type'] == 'pizza') {
            res.render('pizzaPost', result)
        }
    }, (result) => {
        res.render('select', {errorMessage: "No application found with that email!"})
    })
})

app.get("/remove", (req, res) => {
    res.render('remove')
})

app.get("/removed", (req, res) => {
    clear(client, databaseAndCollection).then((result) => {
        res.render('removed', {num: result.deletedCount})
    }) 
})

// POSTS
app.post("/tacoPost", (req, res) => {
    res.render('tacoPost', req.body);
})

app.post("/pizzaPost", (req, res) => {
    res.render('pizzaPost', req.body);
})

app.post("/photoPost", (req, res) => {
    res.render('photoPost', req.body);
})

app.post("/submitStory", (req, res) => {
    insertStory(client, databaseAndCollection, req.body);
    res.render("storySubmitted")
})

// mongo functions
async function insertStory(client, databaseAndCollection, story) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(story);
    console.log(`Story entry created with id ${result.insertedId}`);
}

async function clear(client, databaseAndCollection) {
    const result = await client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collection)
    .deleteMany({});

    return new Promise((resolve, reject) => {
        resolve(result);
    })
}

async function lookUpOneEntry(client, databaseAndCollection, email) {
    let filter = {email: email};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .findOne(filter);

    return new Promise((resolve, reject) => {
        if (result) {
            resolve(result)
        }else {
            reject(result)
        }
    });
}
