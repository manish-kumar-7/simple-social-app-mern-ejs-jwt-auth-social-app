const mongoose=require('mongoose')
mongoose.connect("mongodb://127.0.0.1:27017/miniproject")
 const usermodel=mongoose.Schema({
  username:String,
  name:String,
  age:Number,
  email:String,
  password:String,
  post:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"post"
  }],
  profilepic:{
    type:String,
    default:"dp.jpeg"
  }
  
 })
module.exports=mongoose.model("user",usermodel)

