//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();
const uri = "mongodb+srv://kafaister:D8FXnwESw5GSl8Ry@cluster0.ct0ukwa.mongodb.net/?retryWrites=true&w=majority";

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
}

connect();

const articleSchema = {
  title: String,
  content: String
};

const Article = mongoose.model("article", articleSchema);

/////////////////////////////////////////////Requests targetting all articles/////////////////////////////////////////////

app.route("/articles")

  .get(function(req, res) {
    Article.find({}, function(err, foundArticles) {
      if (!err) {
        res.send(foundArticles);
      } else {
        res.send(err);
      }
    });
  })

  .post(function(req, res) {

    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });
    //callback function can be added to .save so we can recieve errors if they happen.
    newArticle.save(function(err) {
      if (!err) {
        res.send("Successfully added a new article.");
      } else {
        res.send(err);
      }
    });
  })

  .delete(function(req, res) {
    Article.deleteMany({}, function(err) {
      if (!err) {
        res.send("Successfully deleted all articles.")
      } else {
        res.send(err);
      }
    });
  });

/////////////////////////////////////////////Requests targetting specific article/////////////////////////////////////////////

app.route("/articles/:articleTitle")

  .get(function(req, res) {
    Article.findOne(
      {title: req.params.articleTitle},
      function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send("No articles matching that title was found.");
      }
    });
  })

  .put(function(req, res){
    Article.replaceOne(
      {title: req.params.articleTitle}, //whats being targetted
      {title: req.body.title, content: req.body.content}, //what will replace
      {overwrite: true}, //set to true will overwrite existing document
      function(err) {
        if(!err) {
          res.send("Successfully changed article");
        } else {
          console.log(err);
        }
      }
    )
  })

  .patch(function(req, res) {
    Article.updateOne(
      {title: req.params.articleTitle},
      {$set: req.body}, //retrieves document object {title: "", content: ""}
      function(err) {
        if (!err) {
          res.send("Successfully updated article.");
        } else {
          res.send(err);
        }
      }
    )
  })

  .delete(function(req, res){
    Article.deleteOne(
      {title: req.params.articleTitle},
      function(err){
        if (!err){
          res.send("Sucessfully deleted article.")
        } else {
          res.send(err);
        }
      }
    )
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
