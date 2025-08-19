const express = require("express");
const app = express();
const usermodel = require("./model/user");
const postmodel = require("./model/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path=require('path');
const upload=require('./config/multerconfig')


app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")))
app.use(cookieParser());



app.get("/", (req, res) => {
  res.render("index");
});
app.post("/register", async (req, res) => {
  let { username, name, age, email, password } = req.body;
  if (await usermodel.findOne({ email: email })) {
    return res.status(500).send("User Already Exist Please Login");
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
      let user = await usermodel.create({
        username: username,
        name: name,
        age: age,
        email: email,
        password: hash,
      });
      //secret key is not given directly 
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.redirect("/login");
    });
  });
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  let user = await usermodel.findOne({ email: email });
  //console.log(user)
  if (!user) {
    return res.status(500).send("something wrong");
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = jwt.sign({ email: email, userid: user._id }, "shhhh");
      res.cookie("token", token);
      res.status(200).redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});
app.get("/profile", isLoggedIn, async (req, res) => {
  const user = await usermodel
    .findOne({ email: req.user.email })
    .populate("post");
  //console.log(user);
  res.render("profile", { user });
});

app.post("/post", isLoggedIn, async (req, res) => {
  const founduser = await usermodel.findOne({ email: req.user.email });
  //console.log(founduser)
  let { content } = req.body;
  let postdata = await postmodel.create({
    user: founduser._id,
    content: content,
  });
  founduser.post.push(postdata._id);
  await founduser.save();
  res.redirect("/profile");
});
app.get("/like/:id", isLoggedIn, async (req, res) => {
  const post = await postmodel.findOne({ _id: req.params.id }).populate("user");
  if (post.likes.indexOf(req.user.userid) === -1) {
    post.likes.push(req.user.userid);
  } else {
    post.likes.splice(post.likes.indexOf(req.user.userid), 1);
  }

  await post.save();

  res.redirect("/profile");
});
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  const post = await postmodel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
});
app.post("/update/:id", isLoggedIn, async (req, res) => {
  const post = await postmodel.findOneAndUpdate(
    { _id: req.params.id },
    { content: req.body.content }
  );
  res.redirect("/profile");
});

app.get("/logout", (req, res) => {
  res.cookie("token", "");
  res.redirect("/login");
});
function isLoggedIn(req, res, next) {
  if (req.cookies.token === "") {
    res.redirect("/login");
  } else {
    let data = jwt.verify(req.cookies.token, "shhhh");
    //console.log(data)
    req.user = data;
    next();
  }
}
app.get("/profile/upload", (req, res) => {
 res.render('profileUpload');
});
//multer
app.post("/upload",isLoggedIn,upload.single("image"),async (req, res) => {
 let user= await usermodel.findOne({email:req.user.email});
 console.log(req.file);
 user.profilepic=req.file.filename;
  await user.save();
  res.redirect('/profile')
});
const PORT=3000;
app.listen(PORT,(error)=>{
if(error){
  console.log(error.message);
}
console.log(`server is running on http://localhost:${PORT}`);
});
