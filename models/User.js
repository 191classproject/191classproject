const mongoose= require('mongoose');
const connectionParams={
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true 
}
mongoose.connect("mongodb+srv://191classproject:12345@cluster0.pxhyp.mongodb.net/Books?retryWrites=true&w=majority",connectionParams);
const UserSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique:true
    },
    password: {
      type: String,
      required: true
    },
    requests:[{
      type:String

    }],
    completedbooks:[{
      type:String

    }],

    groups: [{
      type: String
  }],
    date: {
      type: Date,
      default: Date.now
    }
  });
  
  const User = mongoose.model('User', UserSchema);
  module.exports = User;