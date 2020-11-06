const mongoose= require('mongoose');
const connectionParams={
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true 
}
mongoose.connect("mongodb+srv://191classproject:12345@cluster0.pxhyp.mongodb.net/Books?retryWrites=true&w=majority",connectionParams);const groupschema = new mongoose.Schema({
  gname: String, 
  bname: String,
  max:String,

  desc: String, 
  createdby:String,
  pagenos:Number,
  users:[{
    type:String

  }],
  targetinfo:[
    {
      Pagedata: Number, 
      date: {
        type: Date,
        default: Date.now
      },
      validatedata:String,
      days:String,
      
      createdby:String,
      targetdata:String
      



    }
  ],


  
    img: 
    { 
        data: Buffer, 
        contentType: String 
    } 
  });
  
  const groups=mongoose.model('groups',groupschema);
  module.exports=groups;