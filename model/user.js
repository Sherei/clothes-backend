let mongoose= require("mongoose");

let userSchema= mongoose.Schema({
    name: String,
    number:Number,
    address:String,
    password:String,
    points:Number,
    role:String,
    level:String,
    email: {
        type:String,
        unique:true,
        trim:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
})

let Users= mongoose.model('user', userSchema);

module.exports= Users;