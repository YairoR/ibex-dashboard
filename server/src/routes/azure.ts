import {Router, Request, Response, NextFunction} from 'express';
import * as msRestAzure from 'ms-rest-azure';

const AzureServiceClient = msRestAzure.AzureServiceClient;

export class AzureRoute {
  router: Router;
  
  constructor() {
    this.router = Router();
    this.init();
  }

  public GetData(req:Request, res: Response) {
    var { servicePrincipalId, servicePrincipalKey, servicePrincipalDomain, subscriptionId, options } = req.body;

    // Interactive Login 
    msRestAzure.loginWithServicePrincipalSecret(servicePrincipalId, servicePrincipalKey, servicePrincipalDomain,
      function(err, credentials, subscriptions) {
        if (err) {
          return this.failure(err); 
        }
    
        let client = new AzureServiceClient(credentials, null);
    
        options.method = options.method || 'GET';
        options.url = `https://management.azure.com` + options.url;
    
        return client.sendRequest(options, (err, result: any) => {
          if (err) {
            throw err;
          }
    
          let values = result.value || [];
          res.json(values);
        });
      });
    }

    init() {
      this.router.post('/query', this.GetData);
    }
}

const azureRouter = new AzureRoute();

export default azureRouter.router;