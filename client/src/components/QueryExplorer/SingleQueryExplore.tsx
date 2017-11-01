import * as React from 'react';

import QueryEditor from './QueryEditor';
import DataVisualization from './DataVisualization';
import KustoApi from '../../data-sources/plugins/Kusto';
import { KustoClusterInfo } from './Contracts/KustoClusterInfo';
import QueryExplorerActions from '../../actions/QueryExplorerActions';
import QueryExplorerStore, { IQueryExplorerState, ICellState } from '../../stores/QueryExplorerStore';

import Button from 'react-md/lib/Buttons/Button';

interface ISingleQueryExploreProps {
  id: number;
  kustoClusterInfo: KustoClusterInfo; // TODO - don't think it should be nullable
}

interface ISingleQueryExploreState {
  cellState: ICellState;
}

export default class SingleQueryExplore extends React.Component<ISingleQueryExploreProps,
                                                                ISingleQueryExploreState> {
  constructor(props: any) {
    super(props);
  
    this.onQueryExplorerStoreChange = this.onQueryExplorerStoreChange.bind(this);

    var state = QueryExplorerStore.getState();

    this.state = {
      cellState: state.cells[this.props.id]
    };
  }

  componentDidMount() {   
    QueryExplorerStore.listen(this.onQueryExplorerStoreChange);
  }

  onRenderTypeChanged(newRenderType: any) {
    // this.setState({ renderAs: newRenderType });
  }

  onRunButtonPress() {
    QueryExplorerActions.executeQuery(this.props.id, this.props.kustoClusterInfo.ClusterName,
                                      this.props.kustoClusterInfo.DatabaseName,
                                      this.state.cellState.query);
  }

  onQueryExplorerStoreChange(state: IQueryExplorerState) {
    this.setState({ cellState: state.cells[this.props.id] })
  }

  render() {
    const displayOptions = { 
      'table': 'view_list', 
      'timeline': 'timeline', 
      'bars': 'equalizer', 
      'pie': 'pie_chart' 
    };
    
    return (
      <div>
        <div style={{
                    padding: '30px 30px 25px',
                    background: '#F3F3F3',
                    borderStyle: 'groove',
                    borderWidth: '1px',
                    borderColor: '#E3E3E3',
                    marginBottom: '30px'
      }}>
          <QueryEditor id={this.props.id} />
          <Button primary raised label="Go" style={{ width: 100 }} 
                  onClick={this.onRunButtonPress.bind(this)} />
          <DataVisualization id={this.props.id} 
                             renderAs={this.state.cellState.renderAs}
                             queryResponse={this.state.cellState.response}
                             onRenderTypeChanged={this.onRenderTypeChanged.bind(this)} />
        </div>
      </div>
    );
  }
}