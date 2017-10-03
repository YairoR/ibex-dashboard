import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import apiRouter from './routes/api';
import graphQLRouter from './routes/graphql';
import cosmosDBRouter from './routes/cosmos-db';
import azureRouter from './routes/azure';
import dashboardRouter from './routes/dashboardsRouter';

// Creates and configures an ExpressJS web server.
class App {

	public express: express.Application;
	
	constructor() {
		this.express = express();
		this.middleware();
		this.routes();
	}
	
	private middleware(): void {
    this.express.use(cookieParser());
		this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: true }));
    this.express.use(logger(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'));
    this.express.use(express.static(path.resolve(__dirname, '..', 'build')));
	}

	private routes(): void {
    // this.express.use('/cosmosdb', cosmosDBRouter.router);
    // this.express.use('/azure', azureRouter.router);
    // this.express.use('/graphql', graphQLRouter.router);
    console.log(dashboardRouter)
    this.express.use('/dashboards', dashboardRouter);
    
    // this.express.use('/data/kusto', graphQLRouter.router);
    // this.express.use('/data/cosmosdb', graphQLRouter.router);

    // Always return the main index.html, so react-router render the route in the client
    this.express.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
    });
	}
}

export default new App().express;