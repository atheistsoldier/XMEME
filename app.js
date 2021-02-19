const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const swaggerApp = express();
const cors = require("cors");
const urlExists = require('url-exists');
const mongoose = require("mongoose");
const isImageUrl = require('is-image-url');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const { forEach } = require("lodash");

app.use(cors());// enabling cors
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' }));
app.use(express.static("public"));

//swagger documentation

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "XMEME",
            description: "XMEME API information"
        },
        host: "localhost:8081"


    },

    apis: ["app.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
swaggerApp.use("/swagger-ui", swaggerUI.serve, swaggerUI.setup(swaggerDocs));

//model


/*mongoose.connect
    ("mongodb://mongo:27017/memeDB",
        { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => */mongoose.connect
        ("mongodb://localhost:27017/memeDB",
            { useUnifiedTopology: true, useNewUrlParser: true });//);



const memeSchema = new mongoose.Schema({
    _id: Number,
    name: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, required: true }

}, {
    versionKey: false
});

const memeList = mongoose.model("memeList", memeSchema);
//routes
/**
 * @swagger
 * 
 * /memes:
 *  post:
 *      summary: Used to send a meme url with owner name and caption to the database
 *      description: 
 *      consumes:
 *          - application/json
 *      parameters:
 *          - in: body
 *            name: meme
 *            description: The meme to create
 *            schema:
 *              type: object
 *              required:
 *                  - name
 *                  - caption
 *                  - url
 *              properties:
 *                  name: 
 *                      type: string
 *                      description: Meme owner name
 *                  caption:
 *                      type: string
 *                      descriptipn: Meme caption
 *                  url:
 *                      type: string
 *                      description: Meme url
 *     
 *      responses:
 *         '200':
 *              description: a successful response and sends the new id of the entry
 *         '415':
 *              description: Unsupported media type if url entered is not a valid image url
 *         '500':
 *              description: In case of a server error
 *         '409':
 *              description: Duplicate entry
 *         '404':
 *              description: In case the url doesn't exist
 *    
 */

app.post("/memes", function (req, res) { //API endpoint to post a meme
    console.log(req.body);
    if (!isImageUrl(req.body.url))
        res.sendStatus(415);//if url is not a image url throw error Unsupported media type


    else {
        memeList.exists(req.body, function (err, result) { // checking if the entry is already present in the database
            if (err) {
                res.sendStatus(500);
            } else {
                if (result) {
                    res.sendStatus(409); // in case of duplicate entry throwing 409(Conflict) error

                }
                else {
                    memeList.find({}).limit(1).sort({ $natural: -1 }).exec(function (err, test) {// finding the id of the last database entry

                        if (err)
                            res.sendStatus(500);
                        else {
                            urlExists(req.body.url, function (err, exists) { // checking if the url exists
                                if (exists) {
                                    var customID;
                                    if (test.length === 0) // base entry in case database is empty
                                        customID = 1;
                                    else
                                        customID = test[0]._id + 1; // new id for the entry
                                    const meme = new memeList({
                                        _id: customID,
                                        name: req.body.name,
                                        url: req.body.url,
                                        caption: req.body.caption
                                    });
                                    try {
                                        const savedMeme = meme.save();

                                        res.json({ "id": customID }); //api output

                                    } catch (error) {
                                        res.sendStatus(404);

                                    }

                                }
                                else {
                                    res.sendStatus(404);
                                }

                            });






                        }
                    });
                }

            }

        })
    }

});
/**
 * @swagger
 * 
 * /memes:
 *  get:
 *      summary: Used to fetch the last 100 memes
 *      responses:
 *         '200':
 *              description: a successful response and sends the last 100 memes or less
 *         '500':
 *              description: In case of a server error
 *    
 */
//GET LAST 100 MEMES ENDPOINT
app.get("/memes", function (req, res) {

    memeList.find({}).limit(100).sort({ $natural: -1 }).exec(function (err, test) {//finding the last 100 database entries
        try {
            test=JSON.parse(JSON.stringify(test).split('"_id":').join('"id":'));
            
            res.json(test);

        } catch (error) {
            res.sendStatus(500);

        }
    });
});
/**
 * @swagger
 *   paths:
 *      /memes/{id}:
 *          get:
 *              summary: Get a meme by ID
 *              parameters:
 *                 - in: path
 *                   name: id
 *                   schema:
 *                    type: integer
 *                   required: true
 *              responses:
 *                  '200':
 *                      description: a successful response and sends the required meme
 *                  '500':
 *                      description: In case of a server error
 *                  '404':
 *                      description: In case a non-existent id is accessed
 */
app.get("/memes/:id", function (req, res) {//Get meme by id

    let memeID = req.params.id;
    memeList.findById(memeID, function (err, test) {
        try {
            if (test === null)
                res.sendStatus(404);// if id doesn't exist in database throw error
            else{
                test=JSON.parse(JSON.stringify(test).split('"_id":').join('"id":'));
                res.json(test);
                
            }

        } catch (error) {
            res.sendStatus(500);

        }

    });

});
/**
 * @swagger
 *   paths:
 *      /memes/{id}:
 *          patch:
 *              summary: Update a meme by ID
 *              parameters:
 *                 - in: path
 *                   name: id
 *                   schema:
 *                    type: integer
 *                   required: true
 *                  
 *                 - in: body
 *                   name: meme
 *                   description: The meme to create
 *                   schema:
 *                      type: object
 *                   properties:
 *                      caption:
 *                          type: string
 *                          descriptipn: Meme caption
 *                      url:
 *                          type: string
 *                          description: Meme url
 *                  
 *              responses:
 *                  '200':
 *                      description: a successful response meaning meme of desired id is updated
 *                  '500':
 *                      description: In case of a server error
 *                  '404':
 *                      description: In case a non-existent id is accessed
 *                  '415':
 *                      description: Invalid image url
 *                  '403':
 *                      description: in case someone is trying to change the name
 * */
//Editing (updating a meme's url and caption) endpoint
app.patch("/memes/:id", function (req, res) {

    let memeID = req.params.id;

    if (typeof req.body.name !== "undefined") {//checking if someone's trying to change the name object to throw error as name change is not allowed.
        res.sendStatus(403);
    }
    else if (typeof req.body.url !== "undefined") {// checking if someone's trying to change meme url
        if (!isImageUrl(req.body.url))
            res.sendStatus(415); //if url is not a image url throw error Unsupported media type

        else {
            urlExists(req.body.url, function (err, exists) { // checking if the url exists
                if (exists) {
                    memeList.findByIdAndUpdate(memeID, req.body, function (err, test) {
                        if (err)
                            res.sendStatus(400);
                        else {
                            if (test._id === null)
                                res.sendStatus(404); //throwing 404 error in case the id doesn't exist in database
                            else
                                res.sendStatus(200);
                        }

                    });

                }
                else {
                    res.sendStatus(404);

                }
            });

        }

    }
    else { //in case only cpations' being changed
        memeList.findByIdAndUpdate(memeID, req.body, function (err, test) {
            if (err)
                res.sendStatus(400);
            else {
                if (test._id === null) //throwing 404 error in case the id doesn't exist in database
                    res.sendStatus(404);
                else
                    res.sendStatus(200);
            }

        });
    }


});
/**
 * @swagger
 *   paths:
 *      /memes/{id}:
 *          delete:
 *              summary: Delete a meme by ID
 *              parameters:
 *                 - in: path
 *                   name: id
 *                   schema:
 *                    type: integer
 *                   required: true
 *              responses:
 *                  '200':
 *                      description: a successful response meaning meme of that id is deleted
 *                  '400':
 *                      description: In case of a error on the query
 *                  '404':
 *                      description: In case a non-existent id is deleted
 */
app.delete("/memes/:id", function (req, res) {
    let memeID = req.params.id;
    memeList.findByIdAndRemove(memeID, function (err, test) {
        if (err)
            res.sendStatus(400);
        else {
            if (test._id === null) //throwing 404 error in case the id doesn't exist in database
                res.sendStatus(404);
            else
                res.sendStatus(200);
        }



    });

});
let port = process.env.PORT || 8081;
app.listen(port, function () {
    console.log("Server started on port 8081");
});
swaggerApp.listen(8080, function () {
    console.log("Swagger UI started on port 8080");
})
