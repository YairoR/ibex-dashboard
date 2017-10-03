import {Router, Request, Response, NextFunction} from 'express';
import * as request from 'xhr-request';

export class GraphQL {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public GetData(req:Request, res: Response) {
    var { serviceUrl, query, variables } = req.body;
    
    var requestOptions = {
      method: 'POST',
      json: true,
      body: {
        query: query,
        variables: variables
      },
    };

    request(serviceUrl, requestOptions, function(err, data) {
      if (err) {
         throw err; 
      }
      
      res.json(data);
    });
  }

  /**
   * Take each handler, and attach to one of the Express.Router's
   * endpoints.
   */
  init() {
    this.router.post('/query', this.GetData);
  }
}

const graphQLRouter = new GraphQL();
graphQLRouter.init();

export default graphQLRouter.router;


