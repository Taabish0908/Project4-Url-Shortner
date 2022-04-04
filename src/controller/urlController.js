const urlModel = require("../models/urlModel")
const shortid = require("shortid");
const validUrl = require("valid-url");




const createUrl = async function(req, res){


    const longUrl = req.body.longUrl;
    const baseUrl = 'http://localhost:3000'

    
    console.log("base url " + baseUrl + "   " + longUrl);
    if(!validUrl.isUri(baseUrl)){
        return res.status(401).send("Internal error. Please come back later.");
    }

    const urlCode = shortid.generate();

    if(validUrl.isUri(longUrl)){

        try{
            const myurl = await urlModel.findOne({longUrl : longUrl}).select({longUrl:1,shortUrl:1,urlCode:1,_id:0})
            console.log(myurl);
            if(myurl){
                return  res.status(201).send({status:true,data:myurl});
            }else{

                const shortUrl = baseUrl + "/" + urlCode;
                newurl  = new urlModel({
                    longUrl,
                    shortUrl,
                    urlCode,
                    
                });
                
                await urlModel.create(newurl)
                return res.status(201).send(newurl);
            }
        }catch(err){
            console.error(err.message);
            return res.status(500).send("Internal Server error " + err.message);
        }
    }else{
        res.status(400).send("Invalid URL. Please enter a vlaid url for shortening.");
    }    
};


const getShorturl = async function(req, res){
    try{
        const shortUrlCode = req.params.urlCode;
    const url = await urlModel.findOne({ urlCode: shortUrlCode });

    if(url){
        return res.status(302).redirect(url.longUrl);
        } else {
            return res.status(400).send("The short url doesn't exists in our system.");
        }
    }

    
catch(err){
    console.error(err.message);
    return res.status(500).json("Internal Server error " + err.message);
}
}





module.exports.createUrl = createUrl;
module.exports.getShorturl=getShorturl