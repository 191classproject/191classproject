const express=require("express");
const fs = require('fs')
var path = require('path'); 
 
const swal = require('sweetalert');


const ejs=require("ejs");
const mongoose = require("mongoose");
const User=require('./models/User');
const Groups=require('./models/groups');


const session = require('express-session') 


const bodyParser = require("body-parser");
const queryString=require('query-string')
const axios=require('axios')
const { count } = require("./models/User");
const connectionParams={
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true 
}
mongoose.connect("mongodb+srv://191classproject:12345@cluster0.pxhyp.mongodb.net/Books?retryWrites=true&w=majority",connectionParams);
var multer = require('multer'); 
const { Console } = require("console");
  
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
  redirect_uri: 'http://ec2-13-127-209-208.ap-south-1.compute.amazonaws.com:4000/home',
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

  Groups.findOne(
    { _id:img},
    function(error,foundresult){
      if(error)
      {
        res.send(error)
      }
      else{

       

if(foundresult.users.includes(req.session.email))
{


  User.updateOne(
    { email:     req.session.email },
    {$push: { groups: [img] } },
    {$push:{completedbooks:[]}},
    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        Groups.findOne({_id:img}, function(err, dba) {

          if (err)
          {
console.log("NULL")
          }
          else
          {
            if(dba.users.includes(req.session.email))
            {

            }
            else
            {
              Groups.updateOne(
                { _id:img },
                {$push: { users: [req.session.email] } },
                
              );

            }
             
            Groups.findOne(
              { _id:img},
              function(error,foundresult){
                if(error)
                {
                  res.send(error)
                }
                else{

                  res.render('inside_group',{alert:"successalert",currentemail:req.session.email,targetarray:foundresult.targetinfo,userarray:foundresult.users,gname:dba.gname,bname:dba.bname,ctype:dba.img.contentType,imgsrc:dba.img.data,result:img});


                }
              }
            );   
            
          }


        });


      }
    }
  );
  


}
else if(Number(foundresult.max)>=foundresult.users.length){

  User.updateOne(
    { email:     req.session.email },
    {$push: { groups: [img] } },
    {$push: { completedbooks : []  }},

    function(err, result) {
      if (err) {
        res.send(err);
      } else {
        Groups.findOne({_id:img}, function(err, dba) {

          if (err)
          {
console.log("NULL")
          }
          else
          {
            if(dba.users.includes(req.session.email))
            {

            }
            else
            {

              Groups.updateOne(
                { _id:img },
                {$push: { users: [req.session.email] } },
                function(err, result) {
                  if (err) {
                    console.log(err)
                  } 
                  
                }
              );

            }
             
            Groups.findOne(
              { _id:img},
              function(error,foundresult){
                if(error)
                {
                  console.log(error)
                }
                else{


                  res.render('inside_group',{alert:"successalert",currentemail:req.session.email,targetarray:foundresult.targetinfo,userarray:foundresult.users,gname:dba.gname,bname:dba.bname,ctype:dba.img.contentType,imgsrc:dba.img.data,result:img});


                }
              }
            );   
            
          }


        });


      }
    }
  );

}
else{

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


              res.render('home', { items: items,name:req.session.name,mygroups:dba.groups,email:req.session.email}); 

        }
        }) ; 
    } 
}); }
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
            redirect_uri: 'http://ec2-13-127-209-208.ap-south-1.compute.amazonaws.com:4000/home',
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
    var obj = { 
        gname: req.body.gname,
        bname:req.body.bname, 
        max:req.body.maximumnum,
        desc:req.body.dis,
        createdby:req.session.email,
        pagenos:req.body.pagenos,
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










      app.post('/inside_group', (req, res) =>{

        name=req.body.name;
        email=req.body.email;
        resultx=req.body.result;
        var alertvalue=0;

        User.findOne({email:email},


          (err,foundResults)=>{
      
              if(err){


}

if (foundResults)

              
              {

               
                
                User.updateOne(
                  { 
                    email:    email },
                  {$push: { requests : resultx } },
                  function(err, result) {
                    if (err) {


                    } 
                    else {
                      alertvalue=0;


                  }
                  }
                );

                
      
          }
          else{
            alertvalue=1;


          }

          }) ; 
                                
          Groups.findOne(
            { _id:req.body.result},
            function(error,foundresult){
              if(error)
              {
                res.send(error)
              }
              else{


                if(alertvalue==0)
                {
                  res.render('inside_group',{alert:"successalert",msg:"Request Send Succesfullly",targetarray:foundresult.targetinfo,userarray:foundresult.users,gname:foundresult.gname,bname:foundresult.bname,ctype:foundresult.img.contentType,imgsrc:foundresult.img.data,result:req.body.id});

                }
                if(alertvalue==1)
                {

                  res.render('inside_group',{alert:"successalert",msg:"NO user found",targetarray:foundresult.targetinfo,userarray:foundresult.users,gname:foundresult.gname,bname:foundresult.bname,ctype:foundresult.img.contentType,imgsrc:foundresult.img.data,result:req.body.id});


                }



              }
            }
          );     
       

    
    
      });




      app.get('/Requests', (req, res) =>{

        
        User.findOne({email:req.session.email},
          (err,foundResults)=>{
  
              if(err){
                  console.log(err);
              }
              else
              {
                
                Groups.find({}, (err, items) => { 
                  if (err) { 
                      console.log(err); 
                  } 
                  else { 
                    
                    res.render("Requests",{items:items,reqarray:foundResults.requests,email:req.session.email})
              
                  } 
              });   
  
          }
          }) ;

        
        
              });
            


app.post('/accept', (req, res) =>{
  email=req.body.email;
  groupid=req.body.groupid;


  Groups.findOne({_id:groupid},
    (err,foundResults)=>{




        if (foundResults.users.includes(req.session.email)==true)
      {
        console.log("accept clicked");

         User.updateOne( {email:req.session.email}, { $pullAll: {requests: [groupid] } },
          (err,results)=>
          {
            if(err)
            {
              console.log(err);
            }
            else{
            }
          }
           );

      }
    
      else{
        
        User.updateOne( {email:req.session.email}, { $pullAll: {requests: [groupid] } },
          (err,results)=>
          {

            if(err)
            {
              console.log(err);
            }
            else{
            }
          }
           );
        
      }

    }
  );

  User.findOne({email:req.session.email},
    (err,foundResults)=>{

        
       
      

          User.findOne({email:req.session.email}, function(err, dba) {

            if (dba.groups.includes(groupid))
            {

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

            
                          res.render('home', { items: items,name:req.session.name,mygroups:dba.groups,email:req.session.email}); 
            
                    }
                    }) ; 
                } 
            }); 

            }
            else
            {
              console.log("notfound")


              User.updateOne(


                { email:     req.session.email },
                {$push: { groups: [groupid]} },
                function(err, result) {
                  if (err) {
                    res.send(err);
                  } 
                }
              );
          Groups.updateOne(
            {_id:groupid},
            {$push:{users:req.session.email},},
            (err,result)=>
            {if(err)
             {
               console.log(err);

               
             }
             else{
              console.log("foundasas")

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

            
                          res.render('home', { items: items,name:req.session.name,mygroups:dba.groups,email:req.session.email}); 
            
                    }
                    }) ; 
                } 
            }); 
             }

            }

          );
            }});
          
          

    
    }) ;

              



              }); 


              app.post('/reject', (req, res) =>{
                email=req.body.email;
                groupid=req.body.groupid;

                console.log("reject");
                User.updateOne( {email:email}, { $pullAll: {requests: [groupid] } },
                  (err,results)=>
                  {
                    if(err)
                    {
                      console.log(err);
                    }
                  }
                   );
                   
                   User.findOne({email:req.session.email},
                    (err,foundResults)=>{
            
                        if(err){
                            console.log(err);
                        }
                        else
                        {
                          
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
                    }) ;



              });  
  
  app.post('/inside_group_set_target', (req, res) =>{

    Groups.updateOne(
      {_id:req.body.id},
      {$push:{targetinfo:{

        Pagedata:req.body.target,
        days:req.body.number,
        createdby:req.session.email,
        validatedata:"Submitted"

      }}},
      (err,result)=>
      {
        if(err)
        {
console.log("error")
        }
        else
        {
          Groups.findOne(
            { _id:req.body.id},
            function(error,foundresult){
              if(error)
              {
                res.send(err)
              }
              else{

                res.render('inside_group',{alert:"successalert",targetarray:foundresult.targetinfo,userarray:foundresult.users,gname:foundresult.gname,bname:foundresult.bname,ctype:foundresult.img.contentType,imgsrc:foundresult.img.data,result:req.body.id});


              }
            }
          );   
          
        }

      }

    
    );
   
              
              }); 
   app.post('/targetform', (req, res) =>{




    Groups.findOne(
      { _id:req.body.id},
      function(error,foundresult){
        if(error)
        {

        }
        else
        {
          
      
          for(i=0;i<foundresult.targetinfo.length;i++)

          {
           var  Pagedata=foundresult.targetinfo[i].Pagedata;
           var createdby=foundresult.targetinfo[i].createdby;

            

            if(foundresult.targetinfo[i]._id==req.body.objectid)

            {

              if(foundresult.targetinfo[i].validatedata=="Submitted")
              {

              if(foundresult.targetinfo[i].createdby==req.session.email)
              {

              

              




                Groups.updateOne(
                  {
                    "targetinfo._id":req.body.objectid
                  },
                 {
                   $set:
                   {
                    ["targetinfo."+i.toString()+".validatedata"]:"Validated",
                    ["targetinfo."+i.toString()+".targetdata"]:req.body.targetinfo,



                   }

                 },
                 (err,result)=>
                 {
                 }
                );
       
              }}
              else if(foundresult.targetinfo[i].validatedata=="Validated")
              {
                if(foundresult.targetinfo[i].createdby!=req.session.email)
                {

              
                Groups.updateOne(
                  {
                    "targetinfo._id":req.body.objectid
                  },
                 {
                   $set:
                   {
                    ["targetinfo."+i.toString()+".validatedata"]:"Completed"

                   }

                 },
                 (err,result)=>

                 {
                   console.log(Pagedata)
                  if(Number(Pagedata)>=foundresult.pagenos)
                  {
                   if(err)
                   {

                   }
                   else
                   {
                     User.updateOne(
                       {email:createdby},
                       {$push: { completedbooks: [foundresult.bname] } },


                       function(error,foundresult){
                         if(error)
                         {

                         }
                         else
                         {
console.log("done")
                         }

                       }

                        );



                      }


                   }
                 }
                );
       
              }
            }
            }
          

          }
        }
      }
      


      );
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
                  console.log(foundResults)
    
                  res.render('home', { items: items,name:req.session.name,mygroups:foundResults.groups,email:req.session.email}); 
    
            }
            }) ; 
        } 
    }); 
              }); 

  app.get('/achiev', (req, res) =>{

    User.findOne(
      {email:req.session.email},
      (err,result)=>
      {
        if(err)
        {

        }

        else
        {



    Groups.find(
      { bname: result.completedbooks[result.completedbooks.length-1] }, 
      (err, items) => { 
      if (err) { 
          console.log(err); 
      } 
      else { 


        res.render("achiev",{targetarray:items})

      } 
 
    });  


}
},

);










              }); 





app.listen(port,()=>{
console.log("server is running");
});  