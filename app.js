const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();
mongoose.connect("mongodb+srv://admin-sanskar:test123@cluster0.ynpanxk.mongodb.net/todolistDB");
mongoose.set('strictQuery', true);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


// database commands
const itemSchema= {
    name:String

}

const Item=mongoose.model("Item",itemSchema);

const Item1=new Item({
    name:"Welcome to your to-do list"
})
const Item2=new Item({
    name:"Hit the + button to add a new item"
})
const Item3=new Item({
    name:"Hit the - button to delete a item"
})
const defaultItems=[Item1,Item2,Item3]


const listSchema={
    name:String,
    items:[itemSchema]
}
const List=mongoose.model("List",listSchema);



// end database commands






// server commands
app.get("/", function (req, res) {
    Item.find({},function(err,foundItems) {
        if(foundItems.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("items insert succesfully");
                }
            });
            
        }
        res.render("list",{ListTitle:"Today",newListItem:foundItems });
        
    })
})


app.get("/:customListName",function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName},function(err,foundList){
        if(!err){
            if(!foundList){
                const list=new List({
                    name:customListName,
                    items:defaultItems
                })
                list.save();
                res.redirect("/"+customListName);

            }
            else{
                res.render("list",{ListTitle:foundList.name,newListItem:foundList.items});
            }
        }
    })
    
})

    
    




app.post("/",function(req,res){
    const itemName=req.body.newItem;
    const listName=req.body.list;
    const item=new Item({
        name:itemName
    })
    if(listName==="Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name:listName},function(err,foundList){
            if(!err){
                foundList.items.push(item);
                foundList.save();
                res.redirect("/"+listName);
            }
        })
    }
    

    
})
app.post("/delete",function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==="Today"){
        Item.findByIdAndRemove(checkedItemId,function(err){
            if(!err){
                console.log("delete succesfull");
                res.redirect("/");
            }
        })
    }
    else{
        List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }

    
})



// end server commands

app.listen(3000, function () {
    console.log("server is running");
})





    
