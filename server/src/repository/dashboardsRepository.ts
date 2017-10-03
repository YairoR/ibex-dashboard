import { DocumentClient, RetrievedDocument, QueryError } from 'documentdb'

export default class DashboardsRepository {

	//private _config:LocationDataConfig;
	private _client: DocumentClient;

	constructor(){
    this._client = new DocumentClient("https://omsfdspository-prod.documents.azure.com:443/",
                                      {masterKey: "xdlPpyxKHsAwtOZlwDnqhikw0fN2EEifjlLLGva84RjvLaaVz0bgqspNhHS5HrX6fX8SrQHTc2Hq00T5lOqSpA=="});
		//this._config = new LocationDataConfig();
    // this._client = new DocumentClient("this._config.host", {masterKey: "this._config.authKey"},
    //                                   this._config.connectionPolicy);	
	}

  public GetDashboards() : Promise<any> {
    return new Promise<any>((resolve, reject) => {
      var collectionUrl = 'dbs/Ibex/colls/Dashboards';
      
      this._client.queryDocuments(collectionUrl, "select * from dashboards")
                  .toArray((error: QueryError, resource: RetrievedDocument[], responseHeaders: any) => {
                    if (error) {
                      reject("Failed to query DocDB " + error.body);
                    }

                    resolve(resource);
                    }
                  );
    });
  }

  public GetDashboard(string id) : Promise<any> {

  }
}