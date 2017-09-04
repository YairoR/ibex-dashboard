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
import * as moment from 'moment';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import TimelineComponent from '../../../components/generic/Timeline'
import ElementConnector from "../../../components/ElementConnector";
import * as TimelineFormater from '../../../utils/data-formats/formats/timeline'
import Card from "../../../components/Card/Card";

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
        query: 'customEvents | limit 200 | summarize count() by bin(timestamp, 10m)',
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

  hourFormat(time: string) {
    return moment(time).format('HH:mm');
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

    let formatResult = (response) => {
      const result = response &&
                     (response as any).Tables &&
                     (response as any).Tables.length > 0 &&
                     (response as any).Tables[0].Rows || [];
      const rows = result.map((_, i) => (
        { time: (new Date(_[0])).getTime(), value: _[1] }
      ));
      
      console.dir(rows);

      return rows;
    }

    let datatemp = [
      {time: 1499677200000, value: 114},
      {time: 1498841400000, value: 7},
      {time: 1498036200000, value: 11},
      {time: 1498044000000, value: 16},
      {time: 1503390600000, value: 6},
      {time: 1499173800000, value: 3}
    ];

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
            {/* <DataTable plain>
              <TableBody>
                {mapResult(q.response)}
              </TableBody>
            </DataTable> */}
            <Card id="myid" title="my title" subtitle="my subtitle">
              <LineChart data={formatResult(q.response)} width={730} height={250} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="time" tickFormatter={this.hourFormat} minTickGap={20} />
                <YAxis/>
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            </Card>
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