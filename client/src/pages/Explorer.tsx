import * as React from 'react';
import TextField from 'react-md/lib/TextFields';
import * as _ from 'lodash';

import QueryTesterControl from '../data-sources/connections/application-insights/QueryTesterControl';

import QueryExplorer from '../components/QueryExplorer/Explorer';

interface IExplorerProps { }
  
interface IExplorerState {
  appId: string;
  apiKey: string;
}

export default class Explorer extends React.Component<IExplorerProps, IExplorerState> {

  constructor(props: IExplorerProps) {
    super(props);

    this.onApiKeyChange = this.onApiKeyChange.bind(this);
    this.onAppIdChange = this.onAppIdChange.bind(this);

    let { apiKey, appId } = JSON.parse(localStorage.getItem('ExplorerConnection') || '{ }');
    
    this.state = { apiKey, appId };
  }

  onApiKeyChange(value: string) {
    this.setState({ apiKey: value });
  }

  onAppIdChange(value: string) {
    this.setState({ appId: value });
  }

  render() {
    // Saving state for future renderings from fresh
    localStorage.setItem('ExplorerConnection', JSON.stringify(this.state));
    
    const options = {
      selectOnLineNumbers: true
    };

    return (
      <div style={{ width: '100%' }}>
        {/* <div>
          <TextField
            label="App Id"
            defaultValue={this.state.appId}
            //style={{ width: '300px' }}
            onChange={this.onAppIdChange}
          />
          &nbsp;
          <TextField
            label="Api Key"
            defaultValue={this.state.apiKey}
            //style={{ width: '300px' }}
            onChange={this.onApiKeyChange}
          />
        </div> */}
        {/* <QueryTesterControl
          applicationID={this.state.appId}
          apiKey={this.state.apiKey}
          buttonStyle={{ width: '100%' }}
        /> */}
        {
          <QueryExplorer />
        }
      </div>
    );
  }
}
