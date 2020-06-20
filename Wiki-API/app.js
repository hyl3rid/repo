const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const app = express();

app.set('view-engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = {
    title: String,
    content: String
};

const Article = mongoose.model("Article", articleSchema);


app.route("/articles")
.get(function(req, res){
    Article.find(function(err, foundArticles){
        if (!err) {
            res.send(foundArticles);
        } else {
            res.send(err);
        }
    });
})
.post(function(req, res){

    const newArticle = new Article({
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save(function(err){
        if (!err) {
            res.send(foundArticles);
        } else {
            res.send(err);
        }
    });
})
.delete(function(req, res){
    Article.deleteMany(function(err){
        if (!err) {
            res.send("Deleted all articles.")
        } else {
            res.send(err);
        }
    });
});

//Specific articles

app.route("/articles/:singleArticle")
.get(function(req, res){  
    Article.findOne({title: req.params.singleArticle},
    function(err, foundArticle){
        if (foundArticle) {
            res.send(foundArticle);
        } else {
            res.send("No articles found with that title");
        }
    })
})
.put(function(req, res){
    Article.update(
        {title: req.params.singleArticle},
        {title: req.body.title, content: req.body.content},
        {overwrite: true},
        function(err) {
            if (!err) {
                res.send("Updated article.")
            }
        }
    )
})
.patch(function(req,res){
    Article.update(
        {title: req.params.singleArticle},
        {$set: req.body},
        function(err){
            if(!err) {
                res.send("Updated articles");
            } else {
                res.send(err);
            }
        }
    );
})
.delete(function(req,res){
    Article.deleteOne(
        {title: req.params.singleArticle}, 
        function(err){
            if(!err){
                res.send("Deleted article.")
            } else {
                res.send(err);
            }
        }
    );
});

app.listen(3000, function() {
    console.log("Server stated on port 3000");
});