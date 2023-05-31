const express = require('express');
const mongoose = require('mongoose');
const Registeruser = require('./model');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware')
const Msgmodel = require('./Msgmodel');
const cors = require('cors');
const app =express();

mongoose.connect('mongodb+srv://knagesh023:knagesh023@cluster0.v7fmbeg.mongodb.net/?retryWrites=true&w=majority',
).then(
    ()=>console.log('DB connected ....')
).catch(
    err => console.log(err));

app.use(express.json()) 
app.use(cors({origin:'*'}))

app.post('/register',async(req,res)=>{
    
    try{
        const {username,email,password,confirmpassword}=req.body;
        let exist = await Registeruser.findOne({email})
        if(exist){
            return res.status(400).send('user already exist');
        }
        if(password !== confirmpassword){
            return res.status(400).send('passwords not matched');
        }

        let newUser = new Registeruser({
            username,email,password,confirmpassword
        })
        await newUser.save();
        res.status(200).send('Registerd successfully')
        
    }catch(err){
        console.log(err)
    }
})

app.post('/login',async(req,res)=>{
    try{
        const {password,email}=req.body;
        let exist = await Registeruser.findOne({email})
        if(!exist){
            return res.status(400).send('user not found');
        }
        if(exist.password !== password){
            return res.status(400).send('Invalid credentials');
        }
        let payload = {
            user:{
                id:exist.id
            }
        }
        jwt.sign(payload,'jwtsecure',{expiresIn:36000000},
        
            (err,token)=>{
                if(err) throw err;
                return res.json({token})
        }
        )
    }
    catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})
app.get('/myprofile',middleware,async(req,res)=>{
    try{
        let exist = await Registeruser.findById(req.user.id);
        if(!exist){
            return res.status(400).send('user not found');
        }
        res.json(exist);
    }catch(err){
        console.log(err);
        return res.status(500).send('server error')
    }
})

app.listen(3004,()=>console.log('server is running...'))


app.post('/addmsg',middleware,async(req,res)=>{
    try{
        const {text}=req.body;
        const exist = await Registeruser.findById(req.user.id);
        let newmsg=new Msgmodel({
            user:req.user.id,
            username:exist.username,
            text
        })
        await newmsg.save();
        let allmsg = await Msgmodel.find();
        return res.json(allmsg)
    }catch(err){
        console.log(err)
        return res.status(500).send('server error..')
    }
})

app.get('/getmsg',middleware,async(req,res)=>{
    try{
        let allmsg = await Msgmodel.find();
        return res.json(allmsg)
    }catch(err){
        console.log(err)
        return res.status(500).send('server error..')
    }
})