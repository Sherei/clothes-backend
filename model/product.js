    let mongoose = require("mongoose");

    let productSchema = mongoose.Schema({
        
        images: [String],
        title:String,
        descriptionHead1:String,
        description:String,
        descriptionHead2:String,
        description2:String,
        descriptionHead3:String,
        description3:String,
        descriptionHead4:String,
        description4:String,
        featureHead:String,
        feature1:String,
        feature2:String,
        feature3:String,
        feature4:String,
        feature5:String,
        feature6:String,
        feature7:String,
        note2:String,
        dimensionHead:String,
        dimension1:String,
        dimension2:String,
        dimension3:String,
        dimension4:String,
        category: String,
        subCategory:String,
        home:Boolean,
        stock:Boolean,
        double:Number,
        standard:Number,
        king:Number,
        super:Number,
        color1:String,
        color2:String,
        color3:String,
        color4:String,
        color5:String,
        color6:String,
        color7:String,
        color8:String,
        color9:String,
        color10:String,
        sn: {
            type: Number,
            trim: true,
            unique:true,
        },
        discount: {
            type: Number,
            trim: true,
        },
        price: {
            type: Number,
            trim: true,
        },
        Fprice: {
            type: Number,
            trim: true,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    });

    let Product = mongoose.model('product', productSchema);

    module.exports = Product;
