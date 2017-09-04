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
import Radio from 'react-md/lib/SelectionControls/Radio';

import * as moment from 'moment';
import { 
  LineChart, Line, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import ConfigurationsActions from '../../../actions/ConfigurationsActions';
import ConfigurationsStore from '../../../stores/ConfigurationsStore';

import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import TimelineComponent from '../../../components/generic/Timeline';
import ElementConnector from "../../../components/ElementConnector";
import * as TimelineFormater from '../../../utils/data-formats/formats/timeline';
import Card from "../../../components/Card/Card";

interface IQueryState {
  query: string; 
  response: object;
  responseExpanded: boolean;
  loadingData: boolean;
  renderAs: 'table' | 'timeline' | 'bars' | 'pie';
}

interface IQueryTesterState {
  queries: IQueryState[];
  dashboard: IDashboardConfig;
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
    maxHeight: '500px'
  } as React.CSSProperties
};

export default class QueryTesterControl extends React.Component<IQueryTesterProps, IQueryTesterState> {

  state: IQueryTesterState = {
    queries: [
      {
        query: 'customEvents | limit 200 | summarize count() by bin(timestamp, 10m)',
        response: {},
        loadingData: false,
        responseExpanded: true,
        renderAs: 'table'
      }
    ],
    dashboard: null
  };

  constructor(props: any) {
    super(props);

    this.getQueryState = this.getQueryState.bind(this);
    this.setQueryState = this.setQueryState.bind(this);
    this.submitQuery = this.submitQuery.bind(this);
    this.onQueryChange = this.onQueryChange.bind(this);
    this.toggleResponse = this.toggleResponse.bind(this);
    this.configurationLoaded = this.configurationLoaded.bind(this);
    this.handleInlineChange = this.handleInlineChange.bind(this);

    ConfigurationsActions.loadDashboard('bot_analytics_inst');
  }

  getQueryState(index: number, property: string): any {
    let queries = this.state.queries;
    return queries[index][property];
  }

  setQueryState(index: number, property: string, value: any) {
    let queries = this.state.queries;
    queries[index][property] = value;
    return queries;    
  }

  toggleResponse(index: number) {
    let expanded = this.getQueryState(index, 'responseExpanded');
    this.setState({ queries: this.setQueryState(index, 'responseExpanded', !expanded) });
  }

  pinToDashboard(index: number) {
    let { dashboard, queries } = this.state;
    let queryText = queries[index].query;
    let id = (new Date()).getTime().toString();
    dashboard.dataSources.push(
      {
        id: 'e_' + id,
        type: "ApplicationInsights/Query",
        dependencies: {
          timespan: "timespan",
          queryTimespan: "timespan:queryTimespan",
          granularity: "timespan:granularity",
        },
        params: { query: eval(`() => \`${queryText}\``) },
        format: { type: "timeline", args: { timeField: "timestamp",lineField: "channel",valueField: "count" } }
      }
    );

    dashboard.elements.push(
      {
        id: "timeline_" + id,
        type: "Timeline",
        title: "Message Rate",
        subtitle: "How many messages were sent per timeframe",
        size: { w: 5, h: 8 },
        source: 'e_' + id
      }
    );

    ConfigurationsActions.saveConfiguration(dashboard);
  }

  submitQuery(index: number) {
    let queries = this.state.queries;
    queries[index].response = {};
    queries[index].loadingData = true;

    this.setState({ queries });

    let appInsightsApi = new ApplicationInsightsApi(this.props.applicationID, this.props.apiKey);
    appInsightsApi.callQuery(this.state.queries[index].query, (err, json) => {
      queries[index].response = json;
      queries[index].loadingData = false;

      if (queries.length === index + 1) {
        queries.push({
          query: 'customEvents | take 5',
          response: {},
          responseExpanded: true,
          loadingData: false,
          renderAs: 'table'
        });
      }

      this.setState({ queries });
    });
  }

  onQueryChange(index: number, value: string, event: any) {
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

  configurationLoaded(state: { dashboard: IDashboardConfig }) {
    let { dashboard } = state;
    this.setState({ dashboard });
  }
  
  componentDidMount() {
    this.scrollToBottom();

    let state = ConfigurationsStore.getState();
    this.configurationLoaded(state);
    ConfigurationsStore.listen(this.configurationLoaded);
  }

  componentWillUnmount() {
    ConfigurationsStore.unlisten(this.configurationLoaded);    
  }
  
  componentDidUpdate() {
    this.scrollToBottom();
  }

  hourFormat(time: string) {
    return moment(time).format('HH:mm');
  }

  handleInlineChange(index: number, e: UIEvent) {
    // Basically how the `SelectionControlGroup` works
    let queries = this.state.queries;
    queries[index].renderAs = (e.target as any).value;
    this.setState({ queries });
  }

  render() {
    const { queries } = this.state;

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

    let formatTimeline = (response) => {
      const result = response &&
                     (response as any).Tables &&
                     (response as any).Tables.length > 0 &&
                     (response as any).Tables[0].Rows || [];
      const rows = result.map((_, i) => (
        { time: (new Date(_[0])).getTime(), value: _[1] }
      ));
      
      console.dir(rows);

      return rows;
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    
    const queryParts = queries.map((q, i) => {
      return (
        <div key={i}>
          <TextField
            id="query"
            label="Place your query here"
            defaultValue={q.query}
            paddedBlock
            rows={3}
            style={{ width: '800px' }}
            onChange={this.onQueryChange.bind(this, i)}
          />
          <Button primary raised label="Go" onClick={this.submitQuery.bind(this, i)} style={{ width: 100 }} />
          <Button raised label="Toggle Results" onClick={this.toggleResponse.bind(this, i)} style={{ width: 150 }} />
          <Button raised label="Pin" onClick={this.pinToDashboard.bind(this, i)} style={{ width: 100 }} />
          <fieldset
            id={'fs' + i}
            style={{
              display: 'inline',
              border: 'none',
              padding: 0,
              position: 'relative',
              top: '6px'
            }}
            onChange={this.handleInlineChange.bind(this, i)}>
            <Radio
              id="inlineRadio1"
              inline
              name={'inlineRadios' + i}
              value="table"
              label="Table"
              checked={q.renderAs === 'table'}
            />
            <Radio
              id="inlineRadio2"
              inline
              name={'inlineRadios' + i}
              value="timeline"
              label="Timeline"
              checked={q.renderAs === 'timeline'}
            />
            <Radio
            id="inlineRadio3"
            inline
            name={'inlineRadios' + i}
            value="bars"
            label="Bars"
            checked={q.renderAs === 'bars'}
            />
            <Radio
              id="inlineRadio4"
              inline
              name={'inlineRadios' + i}
              value="pie"
              label="Pie"
              checked={q.renderAs === 'pie'}
            />
          </fieldset>
          {
            q.responseExpanded &&
            (
              <div style={styles.json}>
                {
                  q.renderAs === 'table' && (
                    <DataTable plain>
                      <TableBody>
                        {mapResult(q.response)}
                      </TableBody>
                    </DataTable>
                  ) ||
                  q.renderAs === 'timeline' && (
                  
                    <Card id="myid" title="my title" subtitle="my subtitle">
                      <LineChart 
                        data={formatTimeline(q.response)} 
                        width={730} 
                        height={250} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="time" tickFormatter={this.hourFormat} minTickGap={20} />
                        <YAxis/>
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="value" stroke="#8884d8" />
                      </LineChart>
                    </Card>
                  ) ||
                  q.renderAs === 'bars' && (
                  
                    <Card id="myid" title="my title" subtitle="my subtitle">
                      <BarChart 
                        data={formatTimeline(q.response)} 
                        width={730} 
                        height={250} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3"/>
                        <Bar dataKey='value' fill='#8884d8'/>
                        <Legend />
                        <Tooltip />
                      </BarChart>
                    </Card>
                  ) ||
                  q.renderAs === 'pie' && (
                    <Card id="myid" title="my title" subtitle="my subtitle">
                      <PieChart width={730} height={250}>
                        <Pie
                          data={formatTimeline(q.response)} 
                          cx={300} 
                          cy={100} 
                          outerRadius={80} 
                          fill="#8884d8"
                        >
                          {
                            formatTimeline(q.response).map((entry, index) => (
                              <Cell label key={index} fill={COLORS[index % COLORS.length]}/>
                              )
                            )
                          }
                        </Pie>
                      </PieChart>
                    </Card>
                  )
                }
              </div>
            )
          }
          {
            q.loadingData &&
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