import * as React from 'react';

import ITableVisualState from './DataVisualizations/TableVisual';

import QueryExplorerActions from '../../actions/QueryExplorerActions';
import QueryExplorerStore, { IQueryExplorerState, ICellState } from '../../stores/QueryExplorerStore';

import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import SelectionControl from 'react-md/lib/SelectionControls/SelectionControl';

interface IDataVisualizationState {
  cellState: ICellState;
}

interface IDataVisualizationProps {
  id: number;
  queryResponse?: string;
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  onRenderTypeChanged: (newRenderType: string) => void;
}

export default class DataVisualization extends React.Component<IDataVisualizationProps,
                                                               IDataVisualizationState> {
  constructor(props: any) {
    super(props);
    
    this.onShowResultsSelectChange = this.onShowResultsSelectChange.bind(this);
    this.onQueriesExplorerStoreChange = this.onQueriesExplorerStoreChange.bind(this);

    var cellState = QueryExplorerStore.getState();

    this.state = {
      cellState: cellState.cells[this.props.id]
    };
  } 

  componentDidMount() {
    QueryExplorerStore.listen(this.onQueriesExplorerStoreChange);
  }

  onShowResultsSelectChange(checked : boolean, changeEvent: any) {
    QueryExplorerActions.updateShowResults(this.props.id, checked);
  }

  onRenderChanged(value: string) {
    this.props.onRenderTypeChanged(value as any);
  }

  onQueriesExplorerStoreChange(state: IQueryExplorerState) {
    this.setState({ cellState: state.cells[this.props.id] })
  }

  render() {
    return (
      <div>
        <SelectionControl
          id={this.props.id}
          type="switch"
          label="Results"
          onChange={this.onShowResultsSelectChange}
          style={{ fontSize: '19px' }}
          defaultChecked
        />
        {
          ((this.state.cellState.isLoading) && (
            <div style={{ width: '100%', top: 130, left: 0 }}>
              <CircularProgress id="testerProgress" />
            </div>
          )) || 
          (
            (this.state.cellState.renderAs === 'table') && (
                <ITableVisualState id={this.props.id}
                                   queryResponse={this.props.queryResponse}
                                   renderAs={this.props.renderAs}
                                   onRenderChanged={this.onRenderChanged.bind(this)}
                                   showDataVisual={this.state.cellState.showResult}
                />
          ))
        }
      </div>      
    );
  }
}