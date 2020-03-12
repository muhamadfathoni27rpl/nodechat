var express = require('express'),
	bodyparser=require('body-parser'),
	cors = require('cors'),	
	sesion = require('express-session'),
    mongoose = require('mongoose'),
    
	app = express();



var port = process.env.PORT || 8080;
var io = require('socket.io').listen(app.listen(port));


app.set('view engine','ejs')
app.use(bodyparser.json())
app.use(cors())
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.static('public'))
app.use(
    sesion({
        secret: 'secret',
        resave: true,
        saveUninitialized:true
    })
)
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/webtoonii",{useNewUrlParser:true, useCreateIndex:true, useUnifiedTopology: true})
.then(()=>console.log("Terhubung Database"))
.catch(err=>console.log("eror"))

require('./routes')(app, io);

console.log('Terhubung nang port : ' + port);