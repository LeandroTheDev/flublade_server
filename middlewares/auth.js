//Dependencies
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

//Exports globally
module.exports = {
    eAdmin: async function (req, res, next) {
        const authHeaders = req.headers.authorization;

        //Token parameters check
        if (!authHeaders) {
            return res.status(400).json({
                error: true,
                message: "Token Error"
            });
        }
        const [, token] = authHeaders.split(' ');
        //Token exist check
        if (!token) {
            return res.status(400).json({
                error: true,
                message: "Token Error"
            });
        }

        //Token verification check
        try {
            const decode = await promisify(jwt.verify)(token, "2!@MDKIOSLAMCM@K!OM#K<LZXA!@#$)S(&*A!11234MkI");
            req.userId = decode.id;
            return next();
        } catch (error) {
            return res.status(400).json({
                error: true,
                message: "Invalid Token"
            });
        }
    }
}