var fs = require('fs');
var pg = require('pg');
var cookieparser = require('cookie-parser');
var multer = require('multer');
var express = require('express');
var SHA512 = require('crypto-js/sha512');

var dotenv = require('dotenv');
var cors = require('cors');
var path = require('path');
const emailer =require('./email/email')

dotenv.config()
var app = express();
var upload = multer();

var appPort=process.env.PORT||8080;
var cookieTimeout=10;

app.use(cors())
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(upload.array()); 
app.use(express.static('public'));


var uid = /^([0-9]|[a-f]){8}-([0-9]|[a-f]){4}-([0-9]|[a-f]){4}-([0-9]|[a-f]){4}-([0-9]|[a-f]){12}$/;

app.get('/test', (req, res) => {
      res.send('OK');
});

app.get('/style/:pageName',(request, response)=>response.sendFile(path.join( __dirname + `/style/${request.params.pageName}.css`)));
app.get('/script/:pageName',(request, response)=>response.sendFile(path.join( __dirname + `/scripts/${request.params.pageName}.js`)));

app.get('/auth',(request, response)=>{
  if(Object.keys(request.cookies).length===0)
    response.sendFile(path.join( __dirname + '/html/auth.html'));
  else{
    checkCookies(request.cookies.auth)
    .then((resp) => {response.redirect('/');console.log('redirect')}) //cookie match 
    .catch(() => {response.cookie('auth',null,{maxAge:0});response.redirect("/auth");}) //false cookie
  }
});
app.get('/',(request, response)=>{
  if(Object.keys(request.cookies).length===0)
    response.redirect("/auth");
  else{
    checkCookies(request.cookies.auth)
    .then(() => {
        response.sendFile(path.join( __dirname + '/html/index.html'));
        console.log(Date(),'cookie user login' ,request.ip );      
      })
    .catch(() => {response.cookie('auth',null,{maxAge:0});response.redirect("/auth");})
  }
});
app.post('/search',(request, response)=>{           
  searchByName(request.body.querry,request.body.limit)
    .then((resp)=>response.send({ok:true,data:resp}))
    .catch(()=>response.send({ok:false}))
});

app.post('/find',(request, response)=>{
  console.log(request.body)
    nearMe(request.body.radius,request.body.limit)
    .then((resp)=>response.send({ok:true,data:resp}))
    .catch(()=>response.send({ok:false}))
});

  app.post('/login',(request,response)=> { 
    if(Object.keys(request.cookies).length===0){
      
        auth(request.body.email,request.body.password).then((stat) =>{
          let hashCookie=SHA512(`${request.body.email}${(new Date()).toUTCString()}`).toString()
          addcookie(request.body.email,hashCookie);
          response.cookie('auth',hashCookie,{maxAge:cookieTimeout*60000});
          response.send(stat);
          console.log(Date(),'manual login successful' ,request.ip );
        }).catch((stat)=>{
          response.send(stat);
          console.log(Date(),'manual login failed',request.ip);
      })
    }
  });
  app.post('/signup',(request,response)=> { 
    if(Object.keys(request.cookies).length===0){
      checkemail(request.body.email).then(()=>{
        response.send({exists:true,verify:true});
      }).catch(()=>{
        checkemailVerify(request.body.email).then(()=>{
          response.send({exists:true,verify:false});
        }).catch(()=>{let linkhash=SHA512(`${request.body.email}${(new Date()).toUTCString()}`).toString()
        SMTP.sendMail({type:"EMAIL_VERIFY",url:`https://it-connects-us.herokuapp.com/verify/${linkhash}`, email:request.body.email,user:request.body.username})
        addUser(request.body.loc,request.body.username,request.body.email,request.body.password,linkhash,request.body.bio,request.body.phone)
      .then(() =>{
        response.send({exists:false,verify:true});
        console.log(Date(),`user ${request.body.username} registered` ,request.ip );
      }).catch((stat)=>{
      response.body=stat
        response.send({exists:false,status:false});
        console.log(Date(),`registration of ${request.body.username} failed`,request.ip);
      })
    })
    })
    }
  });
  app.get('/logout',(request,response)=> {
      response.cookie('auth',null,{maxAge:0});
      response.redirect("/auth");
      console.log(Date(), 'logout', request.ip);
    });
    app.get('/verify/:linkhash',(request, response)=>{

      verifyUser(request.params.linkhash)
      response.sendFile(path.join( __dirname + `/html/verified.html`));
    })
    app.get('/verify',(request, response)=>{
      response.sendFile(path.join( __dirname + `/html/verify.html`));
    })
  
    app.post('/newsletter',async (request, response)=>{
      newsletter(request.body.email,request.body.name)
      .then(()=>{
        SMTP.sendMail({type:"NEWSLETTER_SUBSCRIBED", email:request.body.email,user:request.body.name})
        response.send({status:true})
        
    })
      .catch(()=>response.send({status:false}))
    })


    app.get('/profile/:uid',async (request, response)=>{
      if(request.params.uid.match(uid))
      check(request.params.uid)
      .then(()=>response.sendFile(path.join( __dirname + '/html/profile.html')))
      .catch(()=>response.sendStatus(404))
      else
      response.sendStatus(404)
    })
    app.post('/search/:uid',async (request, response)=>{
      searchByID(request.params.uid)
      .then((resp)=>response.send({ok:true,data:resp}))
      .catch(()=>response.send({ok:false}))
    })
    app.get('/search',async (request, response)=>{
      if(Object.keys(request.cookies).length===0)
      response.redirect("/auth");
    else{
      searchByCookie(request.cookies.auth)
      .then((resp)=>response.send({ok:true,data:resp}))
      .catch(()=>response.send({ok:false}))
    }
    })
    app.post('/save',(request, response)=>{
      if(Object.keys(request.cookies).length===0)
        response.redirect("/auth");
      else{
        checkCookies(request.cookies.auth)
        .then(() => {
            updateProfile(request.body.name,request.body.bio,request.body.phone,request.body.twitter,request.body.insta,request.cookies.auth) 
          })
        .catch(() => {response.cookie('auth',null,{maxAge:0});response.redirect("/auth");})
      }
    });

  app.listen(appPort,()=>{
    console.log(Date(), `APP SERVER ONLINE http://localhost:${appPort}`);
    console.log(Date(), `APP SERVER ONLINE http://localhost:${appPort}/`);

  });

  /////////////////////////////////////////////////////database queries//////////////////////////////////////////////////////////////////////////////////////////////

const DBSconfig = {
    user: process.env.dbsuser,
    password:process.env.dbspass,
    host: process.env.dbsurl,
    database: process.env.database,
    port: process.env.dbsPORT,
    sslmode: "verify-full",
    options: "--cluster=db-ckroach-657",
    ssl: {
      ca: fs.readFileSync(__dirname+'/certs/cc-ca.crt').toString()
    }
};
const SMTPconfig={
  host:process.env.smtpurl,
  port:process.env.smtpPORT,
  user:process.env.smtpemail,
  pass:process.env.smtppass
}

const client = new pg.Client(DBSconfig);
console.log(SMTPconfig)
let SMTP = new emailer(SMTPconfig)

const connectSMTP =()=>  SMTP.connect()

const connectDatabase = async () => { 
    await client.connect(); 
    await client.query(`USE ${process.env.database};`);
    // await createTable();
};
//############################################root functions############################################################################################
const print = async () => {
  await client.query(`USE ${process.env.database};`);
  const rs = await client.query(`SELECT * FROM users;`);
  s=""
  for(let r of rs.fields)
    s+=r.name+" "
  console.log(s)
  console.log(`Your cluster returned ${rs.rowCount} rows`);
  for(let r of rs.rows){
      console.log(`${r.id}\t|${r.name}\t|${r.email}`)
  }
}
const stop        = async () =>   await client.shutdown();
const createTable = async () =>   {await client.query(
  `CREATE TABLE IF NOT EXISTS users ( 
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    phone BIGINT DEFAULT 9000000000,
    insta VARCHAR(50) NOT NULL DEFAULT '#',
    twitter VARCHAR(50) NOT NULL DEFAULT '#',
    email VARCHAR(50) NOT NULL,
    name VARCHAR(70) NOT NULL,
    bio VARCHAR(500) DEFAULT '',
    loc GEOMETRY NOT NULL DEFAULT ST_GeomFromText('POINT(0 0)'),
    passwordHash VARCHAR(512) NOT NULL,
    cookieHash VARCHAR(512),
    PRIMARY KEY(id));`);
  await client.query(
  `CREATE TABLE IF NOT EXISTS verify ( 
    phone BIGINT DEFAULT 9000000000,
      email VARCHAR(50) NOT NULL,
      name VARCHAR(70) NOT NULL,
      bio VARCHAR(500) DEFAULT '',
      loc GEOMETRY NOT NULL DEFAULT ST_GeomFromText('POINT(0 0)'),
      passwordHash VARCHAR(512) NOT NULL,
      hashlink VARCHAR(512) NOT NULL,
      PRIMARY KEY(email));`);

  await client.query(
  `CREATE TABLE IF NOT EXISTS newsletter ( 
      email VARCHAR(50) NOT NULL,
      name VARCHAR(70) NOT NULL,
      PRIMARY KEY(email));`);
}

const addDummy = async() => {
   await client.query(`INSERT INTO users (email,name,loc,passwordHash,phone,bio) VALUES 
   ('sushree@gmail.com','SHECODERS ARDUINO WEBNAR',ST_GeomFromText('POINT(22.2504642 84.9006881)'), '${SHA512("hackholics")}' ,1234567890,'learn hardware microcontrollers and more');`)
   await client.query(`INSERT INTO users (email,name,loc,passwordHash,phone,bio) VALUES 
   ('satarupa@gmail.com','HACTOBERFEST',ST_GeomFromText('POINT(22.2504642 84.9006881)'), '${SHA512("hackholics")}' ,1234567890,'learn and dig into open source contribution');`)
  


}
const dropTable   = async () =>   await client.query(`DROP TABLE IF EXISTS users;DROP TABLE IF EXISTS verify;`);
const reset       = async () => { await dropTable(); await createTable(); }
const addColumn   = async (col) => await client.query(`ALTER TABLE users ADD ${col} INT NOT NULL DEFAULT 0`).catch((err)=>console.log(`ignoring ${col} column already exists`));

//#######################################################data manupulation###########################################################################
const addUser   =   async (loc,name,email,passwordhash,linkhash,bio,phone)    =>  
await client.query(
  `INSERT INTO verify 
  ( loc, name ,email ,passwordhash,hashlink,phone,bio ) VALUES 
  (ST_GeomFromText('POINT(${loc.lat} ${loc.long})'),'${name}','${email}','${passwordhash}','${linkhash}',${phone},'${bio}');`);

const verifyUser   =   async (linkhash)    =>{
    await client.query(`INSERT INTO users (phone,bio,loc, name ,email ,passwordhash) 
    SELECT phone,bio,loc,name,email,passwordhash FROM verify WHERE hashlink='${linkhash}'`);
    await client.query(`DELETE FROM verify WHERE hashlink='${linkhash}'`);
}

const newsletter   =   async (email,name)    =>{
  await client.query(
    `INSERT INTO newsletter (email,name) VALUES
    ('${email}','${name}')`);
}
const removeUser=   async (cookiehash)    => await client.query(`DELETE FROM users WHERE cookiehash = '${cookiehash} IF EXISTS;`);
const addcookie =   async (email,cookiehash) => await client.query(`UPDATE users SET cookiehash = '${cookiehash}' WHERE EMAIL = '${email}'`)

//######################################################data fetching########################################################################
const checkemail =   async (email) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT email FROM users WHERE email = '${email}';`);
    if(rs.rowCount==1){
      success();
    }else
      fail();
  })
};
const check =   async (id) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT id FROM users WHERE id='${id}'`);
    if(rs.rowCount==1){
      success(rs.rows);
    }else
      fail();
  })
};
const checkemailVerify =   async (email) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT email FROM verify WHERE email = '${email}';`);
    if(rs.rowCount==1){
      success();
    }else
      fail();
  })
};
const nearMe =   async (dist,cookiehash) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT loc,id FROM users WHERE cookiehash = '${cookiehash}' ;`);
    if(rs.rowCount==1){
      rs = await client.query(`select name,dist,id from
      (select name,st_distance(${rs.rows[0].loc},loc) as dist from users
      where id!=${rs.rows[0].id})
      where dist < ${dist} order by  dist asc limit 20;`);
      success(rs.rows);
    }else
      fail();
  })
};

const searchByName =   async (querry,limit) => {
  querry=querry.toUpperCase()
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT name,bio,id FROM users WHERE 
    upper(name) LIKE '${querry}%' OR
    upper(name) LIKE '${querry}' OR
    upper(name) LIKE '%${querry}' OR
    upper(name) LIKE '%${querry}%' OR
    upper(bio) LIKE '%${querry}%'
     LIMIT ${limit} ;`);
    // console.log(rs.rows)
    if(rs.rowCount>=1){
      success(rs.rows);
    }else
      fail();
  })
};

const searchByID =   async (id) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT email,insta,twitter,phone,name,bio FROM users WHERE id='${id}' ;`);
    // console.log(rs.rows)
    if(rs.rowCount==1){
      success(rs.rows[0]);
    }else
      fail();
  })
};
const searchByCookie =   async (cookie) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT email,insta,twitter,phone,name,bio,id FROM users WHERE cookiehash='${cookie}' ;`);
    // console.log(rs.rows)
    if(rs.rowCount==1){
      success(rs.rows[0]);
    }else
      fail();
  })
};


const checkCookies =   async (cookiehash) => {
  return myPromise = new Promise(async(success, fail) =>{
    let rs = await client.query(`SELECT email FROM users WHERE cookiehash = '${cookiehash}' ;`);
    if(rs.rowCount==1){
      success();
    }else
      fail();
  })
};

const updateProfile= async(name,bio,phone,twitter,insta,cookiehash)=>

await client.query(`UPDATE users SET name='${name}',bio='${bio}',phone=${phone},twitter='${twitter}',
insta='${insta}'  WHERE cookiehash = '${cookiehash}' ;`);



const auth =  async (email,passhash)  =>{
  return myPromise = new Promise(async(success, fail) =>{
      let rs = await client.query(`SELECT passwordhash FROM users WHERE email = '${email}' ;`);
      if(rs.rowCount){
          let row=rs.rows[0];
          if(row.passwordhash==passhash)
              success({pass:true});
          else
              fail({pass: false,email:true});
      }else
          fail({pass: false,email:false});
})};


  async function test() {
      await reset();
      await addDummy();
      await print();
  }
  async function setup() {
    await connectDatabase();
    connectSMTP()
  }
setup();
// test();
module.exports = app