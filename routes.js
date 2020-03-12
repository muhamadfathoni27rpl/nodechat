const gravatar = require('gravatar'),	
	multer = require('multer'),
	path = require('path'),
	fs = require('fs'),
	enkripsi = require('bcrypt');

module.exports = function(app,io){
	var nodemailer = require('nodemailer');
	const user =require('./database/users') //DATABASE
	const Siswa = require('./database/siswa')	
	const dir = ('./uploads')
	var upload = multer({storage: multer.diskStorage({
		destination: function (req, file, callback) {
		  if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		  }
		  callback(null, './uploads');
		},
		filename: function (req, file, callback) 
		{ callback(null, file.fieldname +'-' + Date.now()+path.extname(file.originalname));}
		//field name iku Teko NAMA INPUTAN index.ejs >>> di tambah datenow >>>> di tambah extensi gambar
	  }),
	  
	  fileFilter: function(req, file, callback) {
		var ext = path.extname(file.originalname)
		if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
		  return callback(res.end('GAMBAR TOK WOIII!!!!!!!', false))
		}
		callback(null, true)
	  }
	  });

	  
app.get('/', function(req, res) {
    if(req.session.loggedin){
        res.redirect('/start')
    }
    else{ res.render('masuk')}
})

//login
app.post('/login',function(req,res){   
    var x = req.body.email.toLowerCase();
    user.findOne({email : x})
    .then(user => {
        if(user){
            if(enkripsi.compareSync(req.body.password,user.password)){
                req.session.loggedin = true   
                req.session.data = user.email                         
                res.redirect('/start') 
            }else{res.json({error: "Tydack Ada @_@"})}
        }else{res.json({error: "Tydack ada @_@"})}
    }).catch(err=>{res.send("error"+err)})
})



//daftar
app.post('/daftar',(req,res)=>{
    const today = new Date()
    const data = {    
    nama : req.body.nama,
    email      : req.body.email.toLowerCase(),
    password   : req.body.password,
    created    : today
    }    
    var x = req.body.email.toLowerCase();
    user.findOne({email : x})      
    .then(cek => {
        if(!cek){
            enkripsi.hash(req.body.password,10,(err,hash)=>{
                data.password=hash
                user.create(data)
                console.log("User Berhasil terdaftar >>>>> "+data.nama);
                res.redirect('/')
            })
        }else{console.log("Error Mendaftar");res.redirect('/')}
    })    
})




app.post('/tambah',function(req,res){
    const today = new Date()
    const data = {
        siswa : req.body.siswa,
        nisn : req.body.nisn,
    }
    Siswa.findOne({nisn : data.nomer})
    .then(cek=>{
        if(!cek){
            Siswa.create(data)
            console.log("Siswa berhasil Terdaftar >>>>> "+data.siswa);            
            res.redirect('/crud')
        }
        else{console.log("error , user Terdaftar");res.redirect('/crud')}
    })
})

app.post('/edit/:_id',function(req,res){
    const datas = {
        siswa : req.body.siswas,
        nisn : req.body.nisns,
    }
    const id = req.params._id
    
    console.log(id,datas)
    Siswa.findOne({nisn : datas.nomer})  
    .then(barange => {
        if(!barange){        
            Siswa.findByIdAndUpdate(id,datas)
            .then(barange=>{console.log("Sukses Update");res.redirect('/crud')})
            .catch(err=>{res.send("error :"+err)})
        }else{
            console.log("error , user Terdaftar");
            res.redirect('/crud')
        }
    })    
})

app.post('/editprofile/:_id',function(req,res){
    const datae = {
        nama : req.body.nama,
        email : req.body.email.toLowerCase(),
        hp : req.body.hp,  
        web : req.body.web,      
    }
    const id = req.params._id    
    user.findOne({email : datae.email})    
    .then(barange => {
        if(barange){                               
            user.findByIdAndUpdate(id,datae)
            .then(barange=>{console.log("Sukses Update");res.redirect('/profile')})
            .catch(err=>{res.send("error :"+err)})              
        }
    })    
})

app.post('/editpassword/:_id',function(req,res){
    const data ={ password : req.body.password,}
    
    const id = req.params._id
    user.findOne({_id : id})
    .then(we=>{
        if(we){
            enkripsi.hash(req.body.password,10,(err,hash)=>{
                data.password = hash
                user.findByIdAndUpdate(id,data)
                .then(we=>{console.log("sukses update password");res.redirect('/profile')})
                .catch(err=>{res.send("error :"+err)})
            })
        }
    })
})

app.post('/kirim', function (req, res) {
	const pesan =  req.body.emailku
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
		  user: ,
		  pass: 
		}
	  });
	  
	  var mailOptions = {
		to: req.body.emailwong,
		subject: req.body.subject,
		text: "Pesan dari : " + pesan + " => " + req.body.isi
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);res.redirect('/email')
		} 
		else{console.log("terkirim => "+info.response);res.redirect('/email')}
	  });    
});
    


app.post('/apload/:_id',upload.any(), function(req,res){	
	const id = req.params._id
	if(!req.files){
		res.json({success: false});
	  } else {        
		user.findOne({_id : id},function(err,data){		  
		  var detail = {image1:req.files[0].filename}
		  user.findByIdAndUpdate(id,detail),
		  (function(err, Person){
			if(err)
			  console.log(err);
			else
			  res.redirect('/');
		  });
		}).sort({_id: -1}).limit(1);
	  }

})














// =======================================================
// ################# GET #################################

app.get('/start',function(req,res){
    if(req.session.loggedin){
        var oke = req.session.data        
        user.findOne({email:oke}) 
        .then(datap=>{res.render('home',{ data : datap })})
                
    }else{
    res.redirect('/')}   
})

app.get('/crud',function(req,res){
    if(req.session.loggedin){        
        Siswa.find({}).exec(function(err, data) {   
            if (err) throw err;
            res.render('crud', { "users": data });            
        })
    }else{
    res.redirect('/')}   
})

app.get('/email',function(req,res){
	if(req.session.loggedin){
		res.render('email')
	}
    else{res.redirect('/')}
})

app.get('/hapus/kVmnNhgWOXfYlNMAYoGe8eJC6YCecy44SRNNY5b5fcW0Q56FME2hm/:_id',function(req,res){
    const id = req.params._id
    Siswa.findByIdAndRemove(id,(err,results)=>{
        console.log(id + " Telah Terhapus"); 
        res.redirect('/crud')       
    })
})

app.get('/login',function(req,res){
    res.render('masuk')
})

app.get('/profile',function(req,res){
    if(req.session.loggedin){
        var oke = req.session.data        
        user.findOne({email:oke}) 
        .then(datap=>{res.render('profile',{ data : datap })})    
    }else{
    res.redirect('/')}  
})

app.get('/editprofile',function(req,res){
    if(req.session.loggedin){
        var oke = req.session.data        
        user.findOne({email:oke}) 
        .then(datap=>{res.render('profedit',{ data : datap })})         
    }else{
    res.redirect('/')}  
})
app.get('/out',function(req,res){
    if(req.session.loggedin===true){
        req.session.loggedin=false
        res.redirect('/')
    }
    res.end()
})

	app.get('/buat', function(req, res){		
		if(req.session.loggedin){
			res.render('buat');
		}else{
		res.redirect('/')} 		
	});

	app.get('/create', function(req,res){	
		if(req.session.loggedin){
			var id = Math.round((Math.random() * 1000000));		
			res.redirect('/chat/'+id);
		}else{
		res.redirect('/')} 		
		
	});

	app.get('/chat/:id', function(req,res){	
		if(req.session.loggedin){
			res.render('chat');
		}else{
		res.redirect('/')} 	
		
	});	
	var chat = io.on('connection', function (socket) {

		// When the client emits the 'load' event, reply with the 
		// number of people in this chat room

		socket.on('load',function(data){

			var room = findClientsSocket(io,data);
			if(room.length === 0 ) {

				socket.emit('peopleinchat', {number: 0});
			}
			else if(room.length === 1) {

				socket.emit('peopleinchat', {
					number: 1,
					user: room[0].username,
					avatar: room[0].avatar,
					id: data
				});
			}
			else if(room.length >= 2) {

				chat.emit('tooMany', {boolean: true});
			}
		});

		// When the client emits 'login', save his name and avatar,
		// and add them to the room
		socket.on('login', function(data) {

			var room = findClientsSocket(io, data.id);
			// Only two people per room are allowed
			if (room.length < 2) {

				// Use the socket object to store data. Each client gets
				// their own unique socket object

				socket.username = data.user;
				socket.room = data.id;
				socket.avatar = gravatar.url(data.avatar, {s: '140', r: 'x', d: 'mm'});

				// Tell the person what he should use for an avatar
				socket.emit('img', socket.avatar);


				// Add the client to the room
				socket.join(data.id);

				if (room.length == 1) {

					var usernames = [],
						avatars = [];

					usernames.push(room[0].username);
					usernames.push(socket.username);

					avatars.push(room[0].avatar);
					avatars.push(socket.avatar);

					// Send the startChat event to all the people in the
					// room, along with a list of people that are in it.

					chat.in(data.id).emit('startChat', {
						boolean: true,
						id: data.id,
						users: usernames,
						avatars: avatars
					});
				}
			}
			else {
				socket.emit('tooMany', {boolean: true});
			}
		});

		// Somebody left the chat
		socket.on('disconnect', function() {

			// Notify the other person in the chat room
			// that his partner has left

			socket.broadcast.to(this.room).emit('leave', {
				boolean: true,
				room: this.room,
				user: this.username,
				avatar: this.avatar
			});

			// leave the room
			socket.leave(socket.room);
		});


		// Handle the sending of messages
		socket.on('msg', function(data){

			// When the server receives a message, it sends it to the other person in the room.
			socket.broadcast.to(socket.room).emit('receive', {msg: data.msg, user: data.user, img: data.img});
		});
	});
};

function findClientsSocket(io,roomId, namespace) {
	var res = [],
		ns = io.of(namespace ||"/");    // the default namespace is "/"

	if (ns) {
		for (var id in ns.connected) {
			if(roomId) {
				var index = ns.connected[id].rooms.indexOf(roomId) ;
				if(index !== -1) {
					res.push(ns.connected[id]);
				}
			}
			else {
				res.push(ns.connected[id]);
			}
		}
	}
	return res;
}