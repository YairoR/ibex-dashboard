import alt, { AbstractStoreModel } from '../alt';

import queryExplorerActions from '../actions/QueryExplorerActions';

export interface ICellState {
  id: number;
  query: string;
  response: string;
  isLoading: boolean;
  renderAs: 'table' | 'timeline' | 'bars' | 'pie';
  showResult: boolean;
}

export interface IQueryExplorerState {
  cells: ICellState[]
}

class QueryExplorerStore extends AbstractStoreModel<IQueryExplorerState> implements IQueryExplorerState {
  cells: ICellState[];

  constructor() {
    super();
    
    // TODO - get the values from a cookie, else initialize it
    this.cells = [];

    this.bindListeners({
      addCell: queryExplorerActions.addCell,
      prepareExecuteQuery: queryExplorerActions.prepareExecuteQuery,
      updateQuery: queryExplorerActions.updateQuery,
      updateResponse: queryExplorerActions.updateResponse,
      updateShowResults: queryExplorerActions.updateShowResults,
      updateRenderType: queryExplorerActions.updateRenderType
    });
  }
  
  addCell(state: any) {
    this.cells[state.id] = { id: state.id, isLoading: false,
                             query: "", response: "",
                             showResult: true, renderAs: "table" };
  }

  prepareExecuteQuery(state: any) {
    this.cells[state.id].isLoading = true;
  }

  updateQuery(state: any) {
    this.cells[state.id].query = state.query;
  }

  updateResponse(state : any) {
    this.cells[state.id].isLoading = false;
    this.cells[state.id].response = state.response;
  }

  updateShowResults(state: any) {
    this.cells[state.id].showResult = state.showResults;
  }

  updateRenderType(state: any) {
    this.cells[state.id].renderAs = state.newRenderType;
  }
}

const queryExplorerStore = alt.createStore<IQueryExplorerState>((QueryExplorerStore as AltJS.StoreModel<any>), 'QueryExplorerStore');

export default queryExplorerStore;
