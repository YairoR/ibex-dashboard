import alt, { AbstractActions } from '../alt';

import KustoApi from '../data-sources/plugins/Kusto';

interface IQueryExplorerActions {
  addCell(id: number): any;
  prepareExecuteQuery(id: number): any;
  updateQuery(query: string, id: number): any;
  updateResponse(response: string, id: number): any;
  executeQuery(id: number, clusterName: string, databaseName: string, query: string): any;
  updateShowResults(id: number, showResults: boolean): any;
  updateRenderType(id: number, newRenderType: string): any;
}

class QueryExplorerActions extends AbstractActions implements IQueryExplorerActions {
  constructor(alt: AltJS.Alt) {
    super(alt);
  }

  addCell(id: number) {
    return { id };
  }

  prepareExecuteQuery(id: number) {
    return { id };
  }

  updateQuery(query: string, id: number) {
    return { query, id };
  }
  updateResponse(response: string, id: number) {
    return { response, id };
  }

  updateShowResults(id: number, showResults: boolean) {
    return { id, showResults };
  }

  updateRenderType(id: number, newRenderType: string) {
    return { id, newRenderType };
  }

  executeQuery(id: number, clusterName: string, databaseName: string, query: string) {
    this.prepareExecuteQuery(id);
    
    let kustoApi = new KustoApi();

    kustoApi.QueryData(clusterName,
                       databaseName,
                       query, (err, json) => {
      if (err) {
        console.log('Error reading data from kusto: ' + err);
        return;
      }

      this.updateResponse(json, id);
    });
  }
}

const queryExplorerActions = alt.createActions<IQueryExplorerActions>(QueryExplorerActions);

export default queryExplorerActions;