// Author: Christopher Rankin <crankin@amdirent.com>      
// License: MIT
//
// TODO: Make sure all responses are application/json                 
// TODO: Middleware to validate "PUT" has all table columns

var                                         
koa=require('koa'),                         
                                            
cors=require('koa-cors'),                   
                                            
router=require('koa-router'),               
                                            
forceSSL=require('koa-force-ssl'),          

https=require('https'),

fs=require('fs'),

logger=require('koa-logger'),

serve=require('koa-static'),

v1=require('./v1'),

database=require('./lib/database'),

bodyParser=require('koa-bodyparser'),

requestBuilder= 
  require('./middleware/request_builder'),

authenticate= 
  require('./middleware/authentication'),

validateQuery= 
  require('./middleware/query_validator'),

buildQuery= 
  require('./middleware/query_builder'),

fetchEntity= 
  require('./middleware/entity_fetcher'),

app=koa();

app.use(forceSSL(8443));
app.use(logger());
app.use(cors({
  origin: true, 
  methods: 'POST,GET,PUT,PATCH,DELETE'
}));
app.use(serve(__dirname + '/public'));
app.use(database());
app.use(bodyParser({
  extendTypes: {
    json: ['text/plain']
  }
}));
app.use(router(app));

app.post(                                   // POST /accounts
  '/v1/accounts',                            
  requestBuilder, 
  v1.create
);                               

app.post(                                   // POST
  '/v1/:table', 
  authenticate, 
  requestBuilder, 
  validateQuery, 
  v1.create
);       


app.get(                                    // GET /table
  '/v1/:table', 
  authenticate, 
  requestBuilder, 
  v1.read, 
  buildQuery
);                                     


app.get(                                    // GET /table/id 
  '/v1/:table/:id', 
  authenticate, 
  requestBuilder, 
  v1.read, 
  buildQuery
);                                 

app.get(                                    // GET /table/id/entity
  '/v1/:table/:id/:entity', 
  authenticate, 
  requestBuilder, 
  v1.read, 
  buildQuery, 
  fetchEntity
);            


app.get(                                    // GET /table/id/entity/entityId
  '/v1/:table/:id/:entity/:entityId', 
  authenticate, 
  requestBuilder, 
  v1.read, 
  buildQuery, 
  fetchEntity
);  

app.put(                                    // PUT /table/id
  '/v1/:table/:id', 
  authenticate, 
  requestBuilder, 
  v1.update
);                                           

app.patch(
  '/v1/:table/:id',                         // PATCH /table/id
  authenticate, 
  requestBuilder, 
  v1.update
);                                         

app.del(                                    // DELETE
  '/v1/:table/:id', 
  authenticate, 
  requestBuilder, 
  v1.delete
);                                           
                                            
var options = {                              // SSL Options                    
  key: fs.readFileSync('./server.key'),      // These files don't exist.       
  cert: fs.readFileSync('./server.crt')      // Generate a server key & cert by
};                                           // following the directions in the
                                             // README.md file.                
https.createServer(
  options, 
  app.callback()
)
.listen(8443);
