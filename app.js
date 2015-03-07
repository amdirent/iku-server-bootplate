// Author: Christopher Rankin <crankin@amdirent.com>
// TODO: Make sure all responses are application/json
// TODO: Middleware to validate "PUT" has all table columns
var koa                 = require('koa'),
    cors                = require('koa-cors'),
    router              = require('koa-router'),
    forceSSL            = require('koa-force-ssl'),
    https               = require('https'),
    fs                  = require('fs'),
    logger              = require('koa-logger'),
    serve               = require('koa-static'),
    v1                  = require('./v1'),
    database            = require('./lib/database'),
    pangeaApi           = require('./lib/pangea_api'),
    bodyParser          = require('koa-bodyparser'),
    requestBuilder      = require('./middleware/request_builder'),
    authenticate        = require('./middleware/authentication'),
    validateQuery       = require('./middleware/query_validator'),
    buildQuery          = require('./middleware/query_builder'),
    distributionBuilder = require('./middleware/distribution_builder'),
    fetchEntity         = require('./middleware/entity_fetcher'),
    app                 = koa();

app.use(forceSSL(8443));
app.use(logger());
app.use(cors({origin: true, methods: 'POST,GET,PUT,PATCH,DELETE'}));
app.use(serve(__dirname + '/public'));
app.use(database());
app.use(pangeaApi());
app.use(bodyParser({
    extendTypes: {
    json: ['text/plain']
  }
}));
app.use(router(app));

app.post('/v1/accounts', requestBuilder, v1.create);                                                          // POST /accounts
app.post('/v1/:table', authenticate, requestBuilder, validateQuery, v1.create, distributionBuilder);          // POST
app.get('/v1/:table', authenticate, requestBuilder, v1.read, buildQuery);                                                 // GET /table
app.get('/v1/:table/:id', authenticate, requestBuilder, v1.read, buildQuery);                                             // GET /table/id
app.get('/v1/:table/:id/:entity', authenticate, requestBuilder, v1.read, buildQuery, fetchEntity);            // GET /table/id/entity
app.get('/v1/:table/:id/:entity/:entityId', authenticate, requestBuilder, v1.read, buildQuery, fetchEntity);  // GET /table/id/entity/entityId
app.put('/v1/:table/:id', authenticate, requestBuilder, v1.update);                                           // PUT /table/id
app.patch('/v1/:table/:id', authenticate, requestBuilder, v1.update);                                         // PATCH /table/id
app.del('/v1/:table/:id', authenticate, requestBuilder, v1.delete);                                           // DELETE

// SSL Options
// If your developing you'll need to generate your own server key & cert
var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
};

https.createServer(options, app.callback()).listen(8443);
console.log("Server listening on port 8443"); // OUTPUT THIS ONLY FOR DEV ENV
