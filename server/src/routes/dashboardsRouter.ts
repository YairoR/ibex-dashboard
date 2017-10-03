import { Router, Request, Response, NextFunction } from 'express';
import DashboardsRepository from './../repository/dashboardsRepository';

export class DashboardsRouter {
  public router: Router;
  
  private _dashboardRepository : DashboardsRepository;

  constructor() {
    this.router = Router();    
    this.Init();
    this._dashboardRepository = new DashboardsRepository();
    console.log("Hi There");
  }

  public GetDashboards(req:Request, res: Response) {
    var dashboardRepository = new DashboardsRepository();

    // TODO - 1. Get the user information

    // TODO (for now it will be everything) - 2. Query all the dashboards this user is allow to view

    // 3. Get all the dashboards from the dashboards repository
    console.log("repo: "+ dashboardRepository);
    var dashboards = dashboardRepository.GetDashboards();

    res.send(dashboards);
  }

  public GetDashboard(req:Request, res: Response) {
    // 1. Get the user information

    // 2. Query all the dashboards this user is allow to view and check the required dashboard
    // id is in those

    // 3. Get the dashboard from the dashboards repository
  }

  public AddDashboard(req:Request, res: Response, next: NextFunction) {
    
  }

  Init() {
    this.router.get('/', this.GetDashboards);
    this.router.get('/:id', this.GetDashboards);
    this.router.post('/', this.AddDashboard);
  }
}

const dashboardRouter = new DashboardsRouter();

export default dashboardRouter.router;