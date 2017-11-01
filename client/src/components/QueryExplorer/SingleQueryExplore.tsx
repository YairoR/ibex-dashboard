import * as React from 'react';
import QueryEditor from './QueryEditor';
import DataVisualization from './DataVisualization';
import KustoApi from '../../data-sources/plugins/Kusto';
import { KustoClusterInfo } from './Contracts/KustoClusterInfo';

interface ISingleQueryExploreProps {
  id: string;
  kustoClusterInfo: KustoClusterInfo; // TODO - don't think it should be nullable
}

interface ISingleQueryExploreState {
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  queryResponse?: string;
}

export default class SingleQueryExplore extends React.Component<ISingleQueryExploreProps,
                                                                ISingleQueryExploreState> {
  constructor(props: any) {
    super(props);
    
    this.executeQuery = this.executeQuery.bind(this);
    
    this.state = {
      renderAs: null,
      queryResponse: null
    };
  }
  
  executeQuery(query: string) {
    let kustoApi = new KustoApi();

    // Force component to update in order to show the loading circle
    this.setState({ renderAs: 'loading' });

    kustoApi.QueryData(this.props.kustoClusterInfo.ClusterName,
                       this.props.kustoClusterInfo.DatabaseName,
                       query, (err, json) => {
      if (err) {
        console.log('Error reading data from kusto: ' + err);
        return;
      }

      this.setState({ renderAs: 'table', queryResponse: json });
    });
  }

  onRenderTypeChanged(newRenderType: any) {
    this.setState({ renderAs: newRenderType });
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
          <QueryEditor onRunButtonPressed={(query) => this.executeQuery(query)} />

          <DataVisualization id={this.props.id} 
                             renderAs={this.state.renderAs}
                             queryResponse={this.state.queryResponse}
                             onRenderTypeChanged={this.onRenderTypeChanged.bind(this)} />
        </div>
      </div>
    );
  }
}