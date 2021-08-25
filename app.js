const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const {v4:uuid4} = require('uuid');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');



const app = express();

const dataPath = "./db/fakedb.json";

app.use(bodyParser.json());
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

// function token(token, index) {
//     let data = getData();
//     data['users'][index]['token'] = token;
//     saveData(data);
// }



app.post("/users/register", (req,res) => {

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
    let token = uuid4();

    let email = data['users'].map((element) => {
        return element.email;
    })

    let obj = data['users'].find(element => {
        if(element.email == req.body.email)
        {
            return element;
        }
    })

    let index = data["users"].indexOf(obj);


    if(email.includes(req.body.email))
    {
        bcrypt.compare(req.body.password, obj.password, function(err, result) {
            if(result)
            {

                

                data['users'][index]['token'] = token;

                function remove(){
                    data['users'][index]['token'].remove();
                    saveData(data);
                }
                
                saveData(data);

                setTimeout(remove, 60*60);

                res.send(token);

                
            }
            else
            {
                res.send("invalid password");
            }
        });
    }
    else
    {
        res.send("invalid email");
    }


})



app.post("/user/upload" ,(req,res) => {
    let token = req.header('token');
    let data = getData();

    let element = data['users'].find(element => {
        if(element.token == token)
        {
            return element;
        }
    })

    if(!element){
        res.send("invalide token");
    }


    let filedata = req.file;

    console.log(filedata);

    if(filedata)
    {



        let obj = {
            "id" : uuid4(),
            "titile" : "",
            "path" : filedata.path,
            "authorId" : element.id
            }

            data['users'].push(obj);
            saveData(data);
            res.send("Uploaded");
        
    }
    else
    {
         res.send("error");
    }


    


})


app.listen(8080 , () => {
    console.log("server start");
})

