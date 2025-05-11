const express=require('express')
const sql=require('mssql')
const cors=require('cors')
require('dotenv').config();

const Config={
    server:process.env.DB_SERVER,
    database:process.env.DB_DATABASE,
    user:process.env.DB_USERNAME,
    password:process.env.DB_PASSWORD,
    options:{
encrypt:false,
enableArithAbort:true,
    },
    port:parseInt(process.env.DB_PORT)

}

const poolPromise=new sql.ConnectionPool(Config)
.connect()
.then(pool=>{
console.log("Connected to Databse")
return pool;
})
.catch(err=>{
    console.error("Error connecting to Databse",err)
    throw err;
})


module.exports={
    sql,
    poolPromise
};