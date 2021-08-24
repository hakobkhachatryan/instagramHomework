const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const {v4:uuid4} = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;


const app = express();

const dataPath = "./db/fakedb.json";

app.use(bodyParser.json);
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname));
app.use(multer({dest:"uploads"}).single("filedata"));



const getData = () => {
    let data = fs.readFileSync(dataPath);
    return JSON.parse(data);
}

const saveData = (data) => {
    let stringifyData = JSON.stringify(data);
    fs.writeFileSync(dataPath,stringifyData);
}


app.post("/users/register", (req,res) => {

    res.send("ok");

    let data = getData();
    let id = uuid4();
    let password = req.body.password;
    if(password.length > 6)
    {
        bcrypt.genSalt(saltRounds, function(err, salt) {
            bcrypt.hash(password, salt, function(err, hash) {
                if(!err)
                {
                    let obj = 
                    {
                        "id" : id,
                        "username" : req.body.username,
                        "email" : req.body.email,
                        "password" : hash,
                        "token" : ""
                    }

                    data['users'].push(obj);
                    saveData(data);

                    res.send("ok");
                }
                else
                {
                    res.sendStatus(401);
                }
            });
        });
    }

})


app.post("/users/login", (req,res)=>{
    let data = getData();
    let email = data['users'].map((element) => {
        return element.email;
        res.send(email);
    })

})





app.listen(8000 , () => {
    console.log("server start");
})

