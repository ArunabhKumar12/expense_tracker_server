const express = require('express') ;

const app = express() ;

const cors = require('cors') ;

require('dotenv').config({path:"./config.env"}) ;

const port = process.env.PORT || 5000 ;

//use middlewares 
app.use(cors()) ;

app.use(express.json()) ; //for lates version of express we dont need BodyParser 

//mongodb connection 
const conn = require('./db/connection.js') ;

//using routes
app.use(require('./routes/route'))

conn.then(db => {
    if(!db) return process.exit(1) ;

    //listen to the http server only when we have the valid connection to the mongodb cluster db

    app.listen(port , () => {
        console.log(`Server is running on port: http://localhost:${port}`) 
    })

    app.on('error' , err => console.log(`Failed to connect to HTTP Server : ${err}`)) ;

    //if there is an error in mongodb connection 
}).catch(error => {
    console.log(`Connection Failed ... ${error}`) ;
})

