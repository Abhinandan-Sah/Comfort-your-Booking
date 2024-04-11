const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Review = require("./models/review.js");
const { log } = require("console");

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
  res.render("listings/home.ejs");
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

const validateReview = (req, res, next) =>{
  let {error} = reviewSchema.validate(req.body);
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
app.get("/listings/:id/edit", wrapAsync(async (req, res, next)=>{
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
app.delete("/listings/:id", wrapAsync(async (req, res, next)=>{
  let {id} = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  // console.log(deletedListing);
  res.redirect("/listings");
}));

//Reviews
// Post Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res, next) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();
  
  res.redirect(`/listings/${listing.id}`);
}))

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res, next) => {

    const { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
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
