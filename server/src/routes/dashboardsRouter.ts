import { Router, Request, Response, NextFunction } from 'express';
import DashboardsRepository from './../repository/dashboardsRepository';

export class DashboardsRouter {
  public router: Router;
  
  private _dashboardRepository : DashboardsRepository;

  constructor() {
    this.router = Router();    
    this.Init();
    this._dashboardRepository = new DashboardsRepository();
  }

  public GetDashboards(req:Request, res: Response) {
    var self = this;
    var dashboardRepository = new DashboardsRepository();

    // TODO - 1. Get the user information

    // TODO (for now it will be everything) - 2. Query all the dashboards this user is allow to view

    // 3. Get all the dashboards from the dashboards repository
    var dashboards = dashboardRepository.GetDashboards();

    dashboardRepository.GetDashboards()
    .then(result => {
      res.status(200).send( 
        `
        (function (window) {
          var dashboardTemplate = (function () {
            return ${JSON.stringify(result[0])}
          })();
          window.dashboardTemplates = window.dashboardTemplates || [];
          window.dashboardTemplates.push(dashboardTemplate);
        })(window);

        (function (window) {
          var dashboard = (function () {
            return ${JSON.stringify(result[0])}
          })();
          window.dashboardDefinitions = window.dashboardDefinitions || [];
          window.dashboardDefinitions.push(dashboard);
        })(window);
        `
      );
    })
    .catch(e => {
      console.log(e);
      res.status(400).send({
        message: e.message,
        status: 400
      });
    });
  }

  public GetDashboard(req:Request, res: Response) {
    // 1. Get the user information

    // 2. Query all the dashboards this user is allow to view and check the required dashboard
    // id is in those

    // 3. Get the dashboard from the dashboards repository
  }

  public AddDashboard(req:Request, res: Response, next: NextFunction) {
    
  }

  private Init() {
    this.router.get('/', this.GetDashboards);
    this.router.get('/:id', this.GetDashboards);
    this.router.post('/', this.AddDashboard);
  }

  private convertDashboardJsonToResponse(dashboard: any) : string {
    var dashboardAsString = JSON.stringify(dashboard);
    
    return `
    (function (window) {
      var dashboardTemplate = (function () {
        ${dashboardAsString}
      })();
      window.dashboardTemplates = window.dashboardTemplates || [];
      window.dashboardTemplates.push(dashboardTemplate);
    })(window);
  `;
  }
}

const dashboardRouter = new DashboardsRouter();

export default dashboardRouter.router;