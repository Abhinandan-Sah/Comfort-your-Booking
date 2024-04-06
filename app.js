const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const listingSchema = require("./schema.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/", (req, res) => {
  res.send("Hello, I am groot");
});

const validateListing = (req, res, next) =>{
  let {error} = listingSchema.validate(req.body);
    if(error){
      let errMsg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(400, errMsg);
    }
    else{
      next();
    }
}

//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs"); 
});

//Create Route and error handling done on it with wrapAsync
app.post("/listings", validateListing, wrapAsync(async (req, res, next)=>{
    // if(!req.body.listing){
    //   throw new ExpressError(404, "Send valid data for listing");
    // }
    // let {title, description, image, price, country, location} = req.body;
    
    let newListing = new Listing(req.body.listing);
    // if(!newListing.title){
    //   throw new ExpressError(400, "Title is missing!");
    // }
    // if(!newListing.description){
    //   throw new ExpressError(400, "Description is missing!");
    // }
    // if(!newListing.price){
    //   throw new ExpressError(400, "Price is missing!");
    // }
    // if(!newListing.country){
    //   throw new ExpressError(400, "Country is missing!");
    // }
    // if(!newListing.location){
    //   throw new ExpressError(400, "Location is missing!");
    // }
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get("/listings/:id/edit", validateListing, wrapAsync(async (req, res, next)=>{
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("listings/edit.ejs", {listing});
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async(req, res, next)=>{
  let {id} = req.params;
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", validateListing, wrapAsync(async (req, res, next)=>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect("/listings");
}));

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send("Invalid ObjectId.");
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const listing = await Listing.findOne({ _id: objectId });

    if (!listing) {
      return res.status(404).send("Listing not found.");
    }

    res.render("listings/show.ejs", { listing });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error.");
  }
}));

//Index Route
app.get("/listings", async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Successful Testing");
// })

app.all("*", (req, res, next)=> {
  next(new ExpressError(404, "Page Not Found!"));
});

//middleware for error handling
app.use((err, req, res, next) => {
  let {statusCode=500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", {message});
  // res.status(statusCode).send(message);
})

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
