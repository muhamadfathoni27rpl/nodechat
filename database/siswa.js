const mongoose = require('mongoose')
const skema = mongoose.Schema //BUAT TABEL di Mongo
const userskema = new skema({
    siswa:{type:String,required:true},        
    nisn:{type:String,required:true,unique:true},
    date:{type:Date,default:Date.now}
})
const siswa = mongoose.model('siswa',userskema)
module.exports=siswa