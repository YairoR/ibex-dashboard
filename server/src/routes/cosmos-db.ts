import {Router, Request, Response, NextFunction} from 'express';
import * as request from 'xhr-request';
import * as crypto from 'crypto';

export class CosmosDBRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public GetData(req:Request, res: Response) {
    const { host, key, verb, resourceType, databaseId, collectionId, query, parameters } = req.body;

    if ( !host || !key || !verb || !resourceType || !databaseId || !collectionId || !query ) {
      console.log('Invalid request parameters');
      res.send({ error: 'Invalid request parameters' });
      
      return;
    }

    const date = new Date().toUTCString();
    const resourceLink = `dbs/${databaseId}/colls/${collectionId}`;
    const auth = this.getAuthorizationTokenUsingMasterKey(verb, resourceType, resourceLink, date, key);
  
    let cosmosQuery = {
      query: query,
      parameters: parameters || [],
    };

    const url = `https://${host}.documents.azure.com/${resourceLink}/docs`;
    
    request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/query+json',
        'Accept': 'application/json',
        'Authorization': auth,
        'x-ms-date': date,
        'x-ms-version': '2015-04-08',
        'x-ms-documentdb-isquery': true,
      },
      body: cosmosQuery,
      responseType: 'json',
      json: true,
    }, (err, doc) => {
      if (err) {
        console.log(err);
        res.send({ error: err });
      }
      
      res.send(doc);
    });
  }

  private getAuthorizationTokenUsingMasterKey(verb: string, resourceType: string, resourceLink: string,
                                              date: string, masterKey: string) : string {
    var key = new Buffer(masterKey, "base64");
    var text = (verb || "").toLowerCase() + "\n" +
               (resourceType || "").toLowerCase() + "\n" +
               (resourceLink || "") + "\n" +
               date.toLowerCase() + "\n" +
               "" + "\n";
    
    var body = new Buffer(text, "utf8");
    var signature = crypto.createHmac("sha256", key).update(body).digest("base64");
    var MasterToken = "master";
    var TokenVersion = "1.0";
    
    return encodeURIComponent("type=" + MasterToken + "&ver=" + TokenVersion + "&sig=" + signature);                                              
  }

  private init() {
    this.router.post('/query', this.GetData);
  }
}

const cosmosDBRouter = new CosmosDBRouter();

export default cosmosDBRouter.router;

