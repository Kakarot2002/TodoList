//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { name } = require("ejs");

const app = express();

app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-prabhat:Test123@cluster0.sfm2k5m.mongodb.net/todolistDB", { useNewUrlParser: true});



const itemsSchema = ({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!"
});

const item2 = new Item ({
  name: "hit the + button to get a new Item"
});

const item3 = new Item ({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find({})
  .then(function (foundItems){
    
    if (foundItems.length === 0) {
      

      Item.insertMany(defaultItems)
      .then(function () {
        console.log("Successfully add items to todolistDB");
      })
      .catch(function (err) {
        console.log(err);
      });

      res.redirect("/");
      
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }

    
  })
  .catch(function(err){
    console.log(err);
  })

});


app.get("/:customListName", (req,res) => {
  const customListName =_.capitalize(req.params.customListName);

  List.findOne({name: customListName})
  .then(function (foundList) {
    // for creating new list
    if( !foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
    
      list.save();
      res.redirect("/"+ customListName);
    }
    // to show existing list
    else{
      // console.log("Exists!")
      res.render("list", {listTitle:foundList.name, newListItems: foundList.items})
    }
  })
  .catch(function (err) {
    console.log(err);
  });
  

  

  
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today" ){
    item.save();

    res.redirect("/");
  }
  else{
    List.findOne({name: listName})
    .then(function (foundList) {
      // for creating new list
      foundList.items.push(item);
      foundList.save()
      res.redirect("/"+ listName);
    })
    .catch(function (err) {
      console.log(err);
    });
    
  }


});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;


  if(listName === "Today"){

  Item.findByIdAndRemove(checkedItemId)
  .then(function () {
    //console.log("Successfull remove the item from todolistDB");
    res.redirect("/");
  })
  .catch(function (err) {
    console.log(err);
  });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
    .then(function () {
      res.redirect("/"+listName);
    })
    .catch(function (err) {
      console.log(err);
    });
  }


  


});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(4000, function() {
  console.log("Server started on port 4000");
});
 

