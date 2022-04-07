const urlModel = require("../models/urlModel")
const shortid = require("shortid");
const validUrl = require("valid-url");


// .............................REDIS...............................................................


const redis = require("redis");
const { promisify } = require("util");


//.............................Redis Configuration.....................................

const redisClient = redis.createClient(
    16744,  /* port number for Redis*/

    "redis-16744.c212.ap-south-1-1.ec2.cloud.redislabs.com", /*Redis String*/
    { no_ready_check: true }
);
redisClient.auth("ijENF9iTdiDceRpVKvmufPPTgM15lUW0", function (err) {   /*Authentiction key/Password*/
    if (err) throw err;
});

redisClient.on("connect", async function () {    /*WORKS ON 3.1.2 VERSION OF REDIS, npm i redis@3.1.2 */

    console.log("Connected to Redis..");
});



//...................Connection setup for redis........................................

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


// ................................................validaions..........................................


const isValid = function (value) {
    if (typeof value === 'undefined' || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidrequestBody = function (requestbody) {
    return Object.keys(requestbody).length > 0;
}

// ..................................................... first Api.......................................

const createUrl = async function (req, res) {



    const longUrl = req.body.longUrl;
    const baseUrl = 'http://localhost:3000'
    const shortUrl = req.body.shortUrl
    const urlCode = req.body.urlCode
    const querydata = req.query
    console.log("base url " + baseUrl + "   " + longUrl);




    if (Object.keys(req.body).length == 0) {
        return res.status(400).send("pleae enter data in the request body ")

    }

    if (!/(:?^((https|http|HTTP|HTTPS){1}:\/\/)(([w]{3})[\.]{1}|)?([a-zA-Z0-9]{1,}[\.])[\w]*((\/){1}([\w@?^=%&amp;~+#-_.]+))*)$/.test(longUrl)) {

        return res.status(400).send({ status: false, message: `Invalid URL. Please enter a valid url for shortening..` })
    }

    // validations for checking the Long Url


    if (isValidrequestBody(querydata)) {
        return res.status(400).send({ status: false, msg: "You are not allowed to enter data in the query" });

    }
    // validations for for checking if there is no data in query



    
    if (!validUrl.isUri(baseUrl)) {
        return res.status(401).send("Internal error. Please come back later.");
    }

    if (isValid(urlCode) || (shortUrl)) {
        return res.status(400).send("you are not allowed to enter shorturl or urlcode ")

    }




    if (validUrl.isUri(longUrl)) {

        try {

            let cachedData = await GET_ASYNC(`${longUrl}`)
            if (cachedData) {
                let parsedData = JSON.parse(cachedData)
                return res.status(200).send(parsedData)
            }

            const urlCode = shortid.generate().toLowerCase();
            const myurl = await urlModel.findOne({ longUrl: longUrl }).select({ _id: 0, __v: 0 })
            console.log(myurl);


            if (myurl) {
                await SET_ASYNC(`${longUrl}`, JSON.stringify(myurl))
                return res.status(201).send({ status: true, data: myurl });
            } else {

                const shortUrl = baseUrl + "/" + urlCode.toLowerCase();


                const newurl = ({
                    longUrl,
                    shortUrl,
                    urlCode,

                });

                await urlModel.create(newurl)

                const newdata =
                {
                    longUrl: newurl.longUrl,
                    shortUrl: newurl.shortUrl,
                    urlCode: newurl.urlCode
                }
                return res.status(201).send({ status: true, data: newdata });
            }
        } catch (err) {
            console.error(err.message);
            return res.status(500).send("Internal Server error " + err.message);
        }
    } else {
        res.status(400).send("Invalid URL. Please enter a valid url for shortening.");
    }
};

// ......................Second Api............................................................

const getShorturl = async function (req, res) {
    try {
        let urlCode = req.params.urlCode
        if (!isValid(urlCode.trim())) {
            return res.status(400).send({ status: false, msg: "Please provide urlCode" })
        }

        let cahcedProfileData = await GET_ASYNC(`${urlCode}`)
        if (cahcedProfileData) {
            let datatype = JSON.parse(cahcedProfileData)
            console.log(datatype)
            return res.status(302).redirect(datatype.longUrl)
        } 
        else {
            const profile = await urlModel.findOne({ urlCode: urlCode });
            if (!profile) {
                return res.status(404).send({ status: false, msg: "No url found" })
            }

            else {
                await SET_ASYNC(`${urlCode}`, JSON.stringify(profile))
                return res.status(302).redirect(profile.longUrl);
            }



        }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        return res.status(500).send({ status: false, msg: err.message })
    }

};




module.exports.createUrl = createUrl;
module.exports.getShorturl = getShorturl


