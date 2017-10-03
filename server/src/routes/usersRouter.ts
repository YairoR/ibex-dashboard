import {Router, Request, Response, NextFunction} from 'express';
import * as UsersDashboardRepository from './../repository/usersDashboardsRepository';

export class UsersRouter {
  router: Router;  

  constructor() {
    this.router = Router();
    this.init();
  }

  public GetUser(req: Request, res: Response) {

  }

  public CreateUser(req: Request, res: Response) {
    
  }

  private init() {
    this.router.get('/:id', this.GetUser);
    this.router.post('', this.CreateUser);
  }
}

const usersRouter = new UsersRouter();

export default usersRouter.router;