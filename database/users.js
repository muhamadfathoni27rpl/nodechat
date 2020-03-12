const mongoose = require('mongoose')
const skema = mongoose.Schema //BUAT TABEL di Mongo
const userskema = new skema({
    nama:{type:String},    
    email:{type:String,required:true,unique:true}, //unique = supaya data tidak ada yang sama
    password:{type:String,required:true},
    hp:{type:Number},    
    web:{type:String},
    status:{type:String},
    date:{type:Date,default:Date.now},
    Name: {type :String},
    image1: {type : String},
    added_date:{
      type: Date,
      default: Date.now
    }
})
const user = mongoose.model('user',userskema)
module.exports=user