const urlModel = require("../models/urlModel")
const shortid = require("shortid");
const validUrl = require("valid-url");
const redis = require("redis");
const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
    16744,
    "redis-16744.c212.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
  );
  redisClient.auth("ijENF9iTdiDceRpVKvmufPPTgM15lUW0", function (err) {
    if (err) throw err;
  });

  redisClient.on("connect", async function () {
     
    console.log("Connected to Redis..");
  });
  
  //1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValid = function(value){
    if(typeof value ==='undefined' || typeof value === null) return false
    if(typeof value === 'string' && value.trim().length ===0) return false
    return true
}


const isValidLink = function(value) {
    if (!(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%.\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.~#?&//=]*)/g.test(value.trim()))) {
        return false
    }
    return true
}

const createUrl = async function(req, res){


    const longUrl = req.body.longUrl;
    const baseUrl = 'http://localhost:3000'
    const shortUrl = req.body.shortUrl
    const urlCode = req.body.urlCode

   


    if(Object.keys(req.body).length==0){
        return res.status(400).send("pleae enter data in the request body ")
        
    }

    if(!isValidLink(longUrl)){
        return res.status(400).send("Invalid URL. Please enter a valid url for shortening.. ")
    }
    


    
    console.log("base url " + baseUrl + "   " + longUrl);
    if(!validUrl.isUri(baseUrl)){
        return res.status(401).send("Internal error. Please come back later.");
    }

    if(isValid(urlCode)||(shortUrl)){
        return res.status(400).send("you are not allowed to enter shorturl or urlcode ")
        
    }
    // if(isValid(shortUrl)){
    //     return res.status(400).send("you are not allowed to enter shortUrl here ") 
    // }
    
    // if(isValid(urlCode)){
    //     return res.status(400).send("you are not allowed to enter Urlcode here ")
    // }
    

    
    if(validUrl.isUri(longUrl)){

        try{
            const urlCode = shortid.generate();
            const myurl = await urlModel.findOne({longUrl : longUrl}).select({_id:0,__v:0})
            console.log(myurl);
            if(myurl){
                return  res.status(201).send({status:true,data:myurl});
            }else{

                const shortUrl = baseUrl + "/" + urlCode;

                
               const  newurl  = ({
                    longUrl,
                    shortUrl,
                    urlCode,
                    
                });
                
                await urlModel.create(newurl)
                const newdata = {longUrl:newurl.longUrl,shortUrl:newurl.shortUrl,urlCode:newurl.urlCode}
                return res.status(201).send({status:true,data:newdata});
            }
        }catch(err){
            console.error(err.message);
            return res.status(500).send("Internal Server error " + err.message);
        }
    }else{
        res.status(400).send("Invalid URL. Please enter a valid url for shortening.");
    }    
};

const getShorturl = async function (req, res) {
    let urlCode = req.params.urlCode
    let cahcedProfileData = await GET_ASYNC(`${urlCode}`)
    if(cahcedProfileData) {
        let datatype = JSON.parse(cahcedProfileData)
        console.log(datatype)
      return res.status(302).redirect(datatype.longUrl)
    } else {
      const profile = await urlModel.findOne({urlCode:urlCode});
      if(profile){
        await SET_ASYNC(`${urlCode}`, JSON.stringify(profile))
      return res.status(302).redirect(profile.longUrl );}
      
      
      
    }
  
  };
// const getShorturl = async function(req, res){
//     try{
//         const shortUrlCode = req.params.urlCode;
//     const url = await urlModel.findOne({ urlCode: shortUrlCode });

//     if(url){
//         return res.status(302).redirect(url.longUrl);
//         } else {
//             return res.status(400).send("The short url doesn't exists in our system.");
//         }
//     }

    
// catch(err){
//     console.error(err.message);
//     return res.status(500).json("Internal Server error " + err.message);
// }
// }





module.exports.createUrl = createUrl;
module.exports.getShorturl=getShorturl


