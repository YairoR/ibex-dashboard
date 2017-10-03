import { Router, Request, Response, NextFunction } from 'express';

export class AuthRouter {
  public router: Router;
  
  constructor() {
    this.router = Router();   
    this.init(); 
  }

  public BasicAuthCheck(req:Request, res: Response, next: NextFunction) {
    return next();
  }

  private init() {
    this.router.get('/', this.BasicAuthCheck);
  }
}

const authRouter = new AuthRouter();

export default authRouter.router;