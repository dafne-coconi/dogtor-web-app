const jwt = require("express-jwt");
const jwksRsa = require("jwks-rsa");
require("dotenv").config();

const tenantID = process.env.AZURE_TENANT_ID;
const ClientID = process.env.AZURE_CLIENT_ID;

const checkJwt = jwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    jwksUri: `https://login.microsoftonline.com/${tenantID}/discovery/v2.0/keys`
  }),
  audience: ClientID,
  issuer: `https://sts.windows.net/${tenantID}/`,
  algorithms: ["RS256"]
});

function checkGroup(groupId) {
  return (req, res, next) => {
    const groups = req.user.groups || [];
    if (groups.includes(groupId)) {
      next();
    } else {
      res.status(403).send("Acceso denegado");
    }
  };
}

module.exports = { checkJwt, checkGroup };
