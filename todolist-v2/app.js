//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();

const user = process.env.USERNAME;
const password = process.env.PASSWORD;
const url = process.env.URL;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://" + user + ":" + password + "@" + url, {useNewUrlParser: true,useUnifiedTopology: true})

const itemsSchema = {
  name: String
}

const Item = mongoose.model(
  "Item",
  itemsSchema
);

const item1 = new Item ({
  name: "Welcome to your todo list!",
});

const item2 = new Item ({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err,result){
    if (result.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Inserted items.")
        }
      });
      res.redirect("/");
    } else {
    res.render("list", {listTitle: "Today", newListItems: result});
    }
  });
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err,result){
    if(!err) {
      console.log(result);
      if (!result) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {listTitle: result.name, newListItems: result.items});
      }
    }
    list.save();
  });

  const list = new List({
    name: customListName,
    items: defaultItems
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const postItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    postItem.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      foundList.items.push(postItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = (req.body.checkbox);
  const listName =req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Removed element" + checkedItemId);
        res.redirect("/")
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    })
  }

});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
