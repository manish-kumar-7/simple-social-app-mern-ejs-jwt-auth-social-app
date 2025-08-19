const mongoose=require('mongoose')

 const postmodel=mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
     ref:"user"
  },
  date:{
    type:Date,
    default:Date.now
  },
  content:String,
  likes:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user"
  }]
 })
module.exports=mongoose.model("post",postmodel)