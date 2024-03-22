const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

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

//New Route
app.get("/listing/new", (req, res)=>{
    res.render("listing/new.ejs");
});

//Show Route
app.get("/listings/:id", async (req, res) => {
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
});

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

app.listen(8080, () => {
  console.log("server is listening to port 8080");
});
