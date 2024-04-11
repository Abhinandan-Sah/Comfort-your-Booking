const Joi = require("joi");

//creating validation schema for listing new homestay(error handling)
const listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(), 
        description: Joi.string().required(), 
        location: Joi.string().required(), 
        country: Joi.string().required(), 
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null)
    }).required(),
});

module.exports= listingSchema;

//Review Schema for error handling. So that the user cannot break the schema design
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
})

