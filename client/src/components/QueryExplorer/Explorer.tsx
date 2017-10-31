import * as React from 'react';

import SingleQueryExplore from './SingleQueryExplore';
import ClusterChangeForm from './ClusterChangeForm';
import { KustoClusterInfo } from './Contracts/KustoClusterInfo';

import Divider from 'react-md/lib/Dividers/Divider';
import FontIcon from 'react-md/lib/FontIcons/FontIcon';

interface IQueryState {
  query: string;
  kustoCluster: KustoClusterInfo;
}

interface IExplorerProps {
  
}

interface IExplorerState {
  showChangeClusterForm: boolean;
  currentKustoClusterInUse: KustoClusterInfo;
  activeSingleExplorers: number[];
}

export default class Explorer extends React.Component<IExplorerProps, IExplorerState> {

  constructor(props: any) {
    super(props);

    this.showChangeClusterForm = this.showChangeClusterForm.bind(this);
    this.hideChangeClusterForm = this.hideChangeClusterForm.bind(this);
    this.addSingleQueryExplorer = this.addSingleQueryExplorer.bind(this);

    this.state = {
      showChangeClusterForm : false,
      currentKustoClusterInUse: {
        ClusterName: 'laint',
        DatabaseName: '_LongTail01'
      },
      activeSingleExplorers: [ 0 ]
    };
  }

  showChangeClusterForm() {
    this.setState({ showChangeClusterForm: true });
  }

  hideChangeClusterForm() {
    this.setState({ showChangeClusterForm: false });
  }

  addSingleQueryExplorer() {
    let currentActiveSingleExplorers = this.state.activeSingleExplorers;
    currentActiveSingleExplorers.push(currentActiveSingleExplorers.length + 1);

    this.setState({ activeSingleExplorers: currentActiveSingleExplorers });
  }

  render() {
    let queriesView = this.state.activeSingleExplorers.map((v, i) => (
      <SingleQueryExplore id={v.toString()} kustoClusterInfo={this.state.currentKustoClusterInUse} />
    ));

    return (
      <div style={{ width: '100%' }}>
        <div>
          <div style={{fontSize: '20px', fontWeight: 400, margin: '1%' }}>
            <a onClick={this.showChangeClusterForm} href="#">
              <FontIcon style={{ fontWeight: 'bold',
                                fontSize: '25px',
                                verticalAlign: 'sub',
                                marginRight: '17px' }}>
                insert_link
              </FontIcon>
            </a>
            <div style={{ display: 'inline' }}>
              <p style={{ fontSize: '21px', position: 'absolute', display: 'inline' }}>
                Cluster: laint &nbsp;&nbsp;&nbsp; Database: _longTail01
              </p>
            </div>
          </div>
          <ClusterChangeForm visible={this.state.showChangeClusterForm}
                               onHide={this.hideChangeClusterForm}
                               activeClusterName='laint'
                               activeDatabaseName='_LongTail01'/>
          <Divider />
        </div>
        <div style={{ padding: '30px' }}>
          {queriesView}
          <a onClick={this.addSingleQueryExplorer} href='#'>
            <FontIcon style={{ fontSize: '30px',
                              fontWeight: 'bold',
                              marginTop: '15px' }}>
              add
            </FontIcon>
          </a>
        </div>
    </div>
    );
  }
}