import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as _ from 'lodash';
import TextField from 'react-md/lib/TextFields';
import Button from 'react-md/lib/Buttons/Button';
import Dialog from 'react-md/lib/Dialogs';
import Toolbar from 'react-md/lib/Toolbars';
import Divider from 'react-md/lib/Dividers';
import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import ApplicationInsightsApi from '../../plugins/ApplicationInsights/ApplicationInsightsApi';
import JSONTree from 'react-json-tree';

import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';


interface IQueryTesterState {
  queries: { query: string; response: object }[];
  loadingData: boolean;
  responseExpanded: boolean;
}

interface IQueryTesterProps {
  applicationID: string;
  apiKey: string;
  buttonStyle: any;
}

const styles = {
  json: {
    overflowY: 'scroll',
    height: 'calc(100% - 200px)',
    width: 'calc(100% - 48px)',
  } as React.CSSProperties
};

export default class QueryTesterControl extends React.Component<IQueryTesterProps, IQueryTesterState> {

  state: IQueryTesterState = {
    queries: [
      {
        query: 'customEvents | take 10',
        response: {}
      }
    ],
    loadingData: false,
    responseExpanded: true
  };

  constructor(props: any) {
    super(props);

    this.submitQuery = this.submitQuery.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
    this.collapseResponse = this.collapseResponse.bind(this);
    this.expandResponse = this.expandResponse.bind(this);
  }

  collapseResponse() {
    this.setState({ responseExpanded: false });
  }

  expandResponse() {
    this.setState({ responseExpanded: true });
  }

  submitQuery(index: number) {
    let queries = this.state.queries;
    queries[index].response = {};

    this.setState({ loadingData: true, queries });

    let appInsightsApi = new ApplicationInsightsApi(this.props.applicationID, this.props.apiKey);
    appInsightsApi.callQuery(this.state.queries[index].query, (err, json) => {
      queries[index].response = json;

      if (queries.length === index + 1) {
        queries.push({
          query: 'customEvents | take 5',
          response: {}
        });
      }

      this.setState({ loadingData: false, queries });
    });
  }

  onQueryChange(index:number, value: string, event: any) {
    let queries = this.state.queries;
    queries[index].query = value;
    this.setState({ queries });
  }

  onResponseChange(index: number, value: object, event: any) {
    let queries = this.state.queries;
    queries[index].response = value;
    this.setState({ queries });
  }

  scrollToBottom = () => {
    window.scrollTo(0, document.body.clientHeight);
  }
  
  componentDidMount() {
    this.scrollToBottom();
  }
  
  componentDidUpdate() {
    this.scrollToBottom();
  }

  render() {
    const { queries, loadingData, responseExpanded } = this.state;

    let mapResult = (response) => {
      const result = response && 
                    (response as any).Tables && 
                    (response as any).Tables.length > 0 && 
                    (response as any).Tables[0].Rows || [];
      const rows = result.map((_, i) => (
        <TableRow key={i}>
          {_.map(val => (<TableColumn>{val}</TableColumn>))}
        </TableRow>
      ));

      return rows;
    };

    const queryParts = queries.map((q, i) => {
      return (
        <div key={i}>
          <TextField
            id="query"
            label="Place your query here"
            defaultValue={q.query}
            paddedBlock
            style={{ width: '300px' }}
            onChange={this.onQueryChange.bind(this, i)}
          />
          <Button raised label="Go" onClick={this.submitQuery.bind(this, i)} style={{ width: 100 }} />
          <div style={styles.json}>
            <DataTable plain>
              <TableBody>
                {mapResult(q.response)}
              </TableBody>
            </DataTable>
          </div>
          {
            loadingData &&
            (
              <div style={{ width: '100%', position: 'absolute', top: 130, left: 0 }}>
                <CircularProgress id="testerProgress" />
              </div>
            )
          }
        </div>
      );
    })

    return (
      <div style={{ width: '100%' }}>
        {queryParts}
      </div>
    );
  }
}