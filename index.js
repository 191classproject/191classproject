const express=require("express");
const fs = require('fs')
var path = require('path'); 
var JSAlert = require("js-alert");
 
const swal = require('sweetalert');


const ejs=require("ejs");
const mongoose = require("mongoose");
const User=require('./models/User');
const Groups=require('./models/groups');

const session = require('express-session') 


const bodyParser = require("body-parser");
const queryString=require('query-string')
const axios=require('axios')
const window=require('window');
const { count } = require("./models/User");
const connectionParams={
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true 
}
mongoose.connect("mongodb+srv://191classproject:12345@cluster0.pxhyp.mongodb.net/Books?retryWrites=true&w=majority",connectionParams);
var multer = require('multer'); 
  
var storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, 'uploads') 
    }, 
    filename: (req, file, cb) => { 
        cb(null, file.fieldname + '-' + Date.now()) 
    } 
}); 
  
var upload = multer({ storage: storage }); 
const port=4000;
const app=express();
app.use(express.static("public"));

app.use(session({ 
  
  // It holds the secret key for session 
  secret: '170399', 

  // Forces the session to be saved 
  // back to the session store 
  resave: true, 

  // Forces a session that is "uninitialized" 
  // to be saved to the store 
  saveUninitialized: true,
  secure: true


})) 

const stringifiedParams = queryString.stringify({
  client_id: "82196192223-m9ceu30331dm4uetb1a1luhugmjpmop7.apps.googleusercontent.com",
  redirect_uri: 'http://127.0.0.1:4000/home',
  scope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ].join(' '), // space seperated string
  response_type: 'code',
  access_type: 'offline',
  prompt: 'consent',
});
const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${stringifiedParams}`;
app.use(bodyParser.urlencoded({extended:true}));

app.set("view engine","ejs");

app.get('/', (req, res) =>{
  res.render('login',{ name: googleLoginUrl,alert:"noalert",msg:"Update Succesfull"});
});
app.post('/', (req, res) =>{
  res.render('register',{alert:"noalert",swal:swal,message:"Length of Password should be greater than 5"});
});   
app.get('/register', (req, res) =>{
  res.render('register',{alert:"noalert",swal:swal,message:"Length of Password should be greater than 5"});
});    
app.get('/login', (req, res) =>{
  res.render('login',{ name: googleLoginUrl,alert:"noalert",msg:"Update Succesfull"});
}); 
  

app.get('/home', (req, res) =>{
  var  id= req.query.code;
  if(id)
  {
    req.session.code=id


  }
  else
  {

    req.session.code="123456";
  }
  name=getAccessTokenFromCode( req.session.code,res,req);


    });
app.post('/home', (req, res) =>{
  var img= req.body.id;
  User.updateOne(
    { email:     req.session.email },
    {$push: { groups: [img] } },
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
      });
      
    
  async function getAccessTokenFromCode(code,res,req) {
    if(code!="123456")
    {

    

        const { data } = await axios({
          url: `https://accounts.google.com/o/oauth2/token`,
          method: 'post',
          data: {
            client_id:"82196192223-m9ceu30331dm4uetb1a1luhugmjpmop7.apps.googleusercontent.com",
            client_secret: "u-5hXIZaDL0lWcR0_G9y9dSU",
            redirect_uri: 'http://127.0.0.1:4000/home',
            grant_type: 'authorization_code',
            code:code,
          },
        });
      
        var Authorizationas= 'Bearer '+ data.access_token;     
        var config = {
          method: 'get',
          withCredentials: true,
          url: 'https://www.googleapis.com/oauth2/v3/userinfo',
          headers: { 
            'Authorization': Authorizationas
          }
        };
        axios(config,)
        .then(function (response) {
        Groups.find({}, (err, items) => { 
          if (err) { 
              console.log(err); 
          } 
          else { 
            req.session.name=response.data.name;
            req.session.email=response.data.email;
            req.session.loginmode="google"

          console.log(JSON.stringify(response.data.email));
          User.findOne({email:  req.session.email}, function(err, user){
            if(err) {
              console.log(err);
            }
            if(user) {
              User.findOne({email:req.session.email},
                (err,foundResults)=>{
        
                    if(err){
                        console.log(err);
                    }
                    else
                    {
                      
        
                      res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 
        
                }
                }) ; 
              
            } else {
              
       
              const newUser= new User({
                name:  req.session.name,
                email:req.session.email,
  
                password:"loggedinusinggmail"
            });
    newUser.save((err=>
        {
          err?console.log(err):   
                
                
          User.findOne({email:req.session.email},
            (err,foundResults)=>{
    
                if(err){
                    console.log(err);
                }
                else
                {
                  
    
                  res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 
    
            }
            }) ;  
    
            
        }));
               
            }
        });
    

     
 
          } 
      }); 

          
        
        })
        .catch(function (error) {
          console.log(error);
        });
      }
      else{
console.log(req.session.email);
        User.findOne({email:req.session.email},
          (err,foundResults)=>{
  
              if(err){
                  console.log(err);
              }
              if(foundResults)
              {
                Groups.find({}, (err, items) => { 
                    if (err) { 
                        console.log(err); 
                    } 
                    else { 
                      req.session.name=foundResults.name;
                      req.session.loginmode="email"
                      res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 
  
  
  
                    } 
                });                      
  
              
          }
          else{
            res.render('login',{ name: googleLoginUrl,alert:"alert",msg:"Email not found!,Please Register"});
  
          }
          }); 





      }
      };  
      



        
app.post('/register', (req, res) =>{

    const name= req.body.name;
    const email=req.body.email;
    const pw=req.body.password;
    const pw2=req.body.password2;

    if(pw.length<5)
    {
      res.render('register',{alert:"alert",swal:swal,message:"Length of Password should be greater than 5"});

    }
    else if(pw!=pw2)
    {
      res.render('register',{alert:"alert",swal:swal,message:"Passsword and Confirm Password should be Same"});

    }

    else
    {

      User.findOne({email: email}, function(err, user){
        if(err) {
          console.log(err);
        }
        var message;
        if(user) {
          res.render('register',{alert:"alert",swal:swal,message:"User Already Exists"});

          
        } else {
          
    const newUser= new User({
      name:name,
      email:email,
      password:pw
  });
newUser.save((err=>
    {
      res.render('login',{ name: googleLoginUrl,alert:"noalert",msg:"Update Succesfull"});

        
    }));
           
        }
    });

   
  
}

});    


app.post('/login', (req, res) =>{
    const email=req.body.email;
    const pw=req.body.password;
    if(pw.length<5)
    {
      res.render('login',{ name: googleLoginUrl,alert:"alert",msg:"Length of the Password should be  greater than 5"});

    }
    else
    {

    
   
    req.session.email=email;

    User.findOne({email:email},
        (err,foundResults)=>{

            if(err){
                console.log(err);
            }
            if(foundResults)
            {
                if( foundResults.password==pw){

          
                Groups.find({}, (err, items) => { 
                  if (err) { 
                      console.log(err); 
                  } 
                  else { 
                    req.session.name=foundResults.name;
                    req.session.loginmode="email"
                    res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 



                  } 
              });                      

                }
            else{
              res.render('login',{ name: googleLoginUrl,alert:"alert",msg:"Incorrect email or password"});
            }
        }
        else{
          res.render('login',{ name: googleLoginUrl,alert:"alert",msg:"Email not found!,Please Register"});

        }
        }); 


}});  
  
app.get('/create_group', (req, res) =>{
  Groups.find({}, (err, items) => { 
    if (err) { 
        console.log(err); 
    } 
    else { 
    User.findOne({email:req.session.email},
        (err,foundResults)=>{

            if(err){
                console.log(err);
            }
            else
            {
              

              res.render('create_group', { items: items,name:req.session.name,mygroups:foundResults.groups}); 

        }
        }) ; 
    } 
}); 

  });

app.post('/create_group', upload.single('image'), (req, res, next) => { 
    console.log(req.session.email);
    var obj = { 
        gname: req.body.gname,
        bname:req.body.bname, 
        maxiumnum:req.body.maximnum,
        desc:req.body.dis,
        createdby:req.session.email,
        count:0,
        img: { 
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)), 
            contentType: 'image/png'
        } 
    } 
    console.log(req.body.gname);
    console.log(req.body.bname);

    Groups.create(obj, (err, item) => { 
        if (err) { 
            console.log(err); 
        } 

        else { 
            // item.save(); 
            Groups.find({}, (err, items) => { 
              if (err) { 
                  console.log(err); 
              } 
              else { 
                User.findOne({email:req.session.email},
                  (err,foundResults)=>{
          
                      if(err){
                          console.log(err);
                      }
                      else
                      {
                        
          
                        res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 
          
                  }
                  }) ; 
              } 
          }); 

        } 
    }); 
}); 




app.get('/view_p_create', (req, res) =>{
  Groups.find({}, (err, items) => { 
    if (err) { 
        console.log(err); 
    } 
    else { 
      User.findOne({email:req.session.email},
        (err,foundResults)=>{

            if(err){
                console.log(err);
            }
            else
            {
              

              res.render('view_p_create',{items:items,email:req.session.email,mygroups:Array.from(new Set(foundResults.groups))});

        }
        }) ; 

    } 
}); 
});

app.get('/profile', (req, res) =>{
  console.log(req.session.name)
  res.render('profile',{ name:req.session.name,email:req.session.email });
  });


  app.get('/edit_profile', (req, res) =>{
    if(req.session.loginmode=="email")
    {
      res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"email",alert:"nolaert",msg:"no" });


    }
    if(req.session.loginmode=="google")
    {
      res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"google",alert:"nolaert",msg:"no" });


    }


    });
  
  app.post('/edit_profile', (req, res) =>{

       const current= req.body.current;
        const password=req.body.password;
        const change=req.body.change;
if(password.length<5 || change.length<5 || current.lenght<5)
{
  if(req.session.loginmode=="email")
  {
    res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"email",alert:"alert",msg:" Length of Password should be greater than 5"});


  }
  if(req.session.loginmode=="google")
  {
    res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"google",alert:"alert",msg:" Length of Password should be greater than 5" });


  }
}

else if(password!=change)
{
  if(req.session.loginmode=="email")
  {
    res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"email",alert:"alert",msg:"Password and Confirm Password should be Same" });


  }
  if(req.session.loginmode=="google")
  {
    res.render('edit_profile',{ name:req.session.name,email:req.session.email,loginmode:"google",alert:"alert",msg:"Password and Confirm Password should be Same"  });


  }
}
else
{
    User.findOne({email:req.session.email},
    (err,foundResults)=>{

        if(err){
            console.log(err);
        }
        else
        {
          if(foundResults.password==current)
          {
            User.updateOne(
              { email:     req.session.email },
              {$set: { password:change } },
              function(err, result) {
                if (err) {
                  res.send(err);
                } else {
                  res.render('login',{ name: googleLoginUrl,alert:"sucessalert",msg:"Update Succesfull"});
                }
              }
            );
          }

    }
    }) ; 

}

  





});
  


    app.get('/edit_username', (req, res) =>{
      if(req.session.loginmode=="email")
      {
        res.render('edit_username',{ name:req.session.name,email:req.session.email,loginmode:"email",msg:"no",alert:"noalert" });
  
  
      }
      if(req.session.loginmode=="google")
      {
        res.render('edit_username',{ name:req.session.name,email:req.session.email,loginmode:"google",msg:"no",alert:"noalert" });
  
  
      }
  
  
      });
    
    app.post('/edit_username', (req, res) =>{
    
         const username= req.body.username;
          const password=req.body.password;
          const change=req.body.change;
          if(password.length<5 || change.length<5)
          {
            if(req.session.loginmode=="email")
            {
              res.render('edit_username',{ alert:"alert",name:req.session.name,email:req.session.email,loginmode:"email",msg:" Length of Password should be greater than 5" });
        
        
            }
            if(req.session.loginmode=="google")
            {
              res.render('edit_username',{ alert:"alert",name:req.session.name,email:req.session.email,loginmode:"google" ,msg:" Length of Password should be greater than 5" });
        
        
            }
      
          }
          else if(password!=change)
        {
   

          if(req.session.loginmode=="email")
          {
            res.render('edit_username',{ alert:"alert",name:req.session.name,email:req.session.email,loginmode:"email",msg:"Password and Confirm Password should be Same" });
      
      
          }
          if(req.session.loginmode=="google")
          {
            res.render('edit_username',{alert:"alert", name:req.session.name,email:req.session.email,loginmode:"google" ,msg:"Password and Confirm Password should be Same" });
      
      
          }

        }

          else
          {

          
     
  if(password==change)
  {
    User.findOne({email:req.session.email},
      (err,foundResults)=>{
  
          if(err){
              console.log(err);
          }
          else
          {
            if(foundResults.password==change)
            {
              req.session.name=username;
              console.log(req.session.name);

              User.updateOne(
                { email:     req.session.email },
                {$set: { name:username } },
                function(err, result) {
                  if (err) {
                    res.send(err);
                  } else {
                    req.session.
                    reload(function(err) {
                      res.render('login',{ name: googleLoginUrl,alert:"sucessalert",msg:"Update Succesfull"});

                      // session updated
                    })
                  }
                }
              );
            }
  
      }
      }) ; 
    
  
  
  
  
  
  }
  
  
  
  
  
  
      }});
    
  






app.listen(port,()=>{
console.log("server is running");
});  