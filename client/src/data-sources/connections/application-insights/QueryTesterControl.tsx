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
import ElementConnector from '../../../components/ElementConnector';
import * as TimelineFormater from '../../../utils/data-formats/formats/timeline';
import Card from '../../../components/Card/Card';

interface IQueryState {
  query: string; 
  response: any;
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
  results: {
    overflowY: 'scroll',
    height: 'calc(100% - 200px)',
    width: 'calc(100% - 200px)',
    maxHeight: '300px',
    display: 'inline-block'
  } as React.CSSProperties,
  resultsOptions: {
    height: 'calc(100% - 200px)',
    width: '200px',
    maxHeight: '300px',
    float: 'right'
  } as React.CSSProperties
};

export default class QueryTesterControl extends React.Component<IQueryTesterProps, IQueryTesterState> {

  state: IQueryTesterState = {
    queries: [
      {
        query: 'customEvents | limit 200 | summarize count() by bin(timestamp, 10m)',
        response: null,
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

  pinToDashboard(index: number, redirect: boolean) {
    let { dashboard, queries } = this.state;
    let { query, response, renderAs } = queries[index];
    let id = (new Date()).getTime().toString();
    
    if (!response || !response.Tables || response.Tables.length < 1 || response.Tables[0].Columns.length < 1) { 
      return; 
    }

    const columns = response.Tables[0].Columns;

    let dataSource: DataSource = {
      id: 'ds_' + id,
      type: 'ApplicationInsights/Query',
      dependencies: {
        timespan: 'timespan',
        queryTimespan: 'timespan:queryTimespan',
        granularity: 'timespan:granularity'
      },
      params: { query: eval(`() => \`${query}\``) }, // tslint:disable-line
      format: null
    };

    let element: IElement = {
      id: 'el_' + id,
      type: null,
      title: 'Message Rate',
      subtitle: 'How many messages were sent per timeframe',
      size: { w: 5, h: 8 },
      source: dataSource.id
    };

    switch (renderAs) {
      case 'timeline':

        if (response.Tables[0].Columns.length < 2) { return; }

        dataSource.format = { 
          type: 'timeline', 
          args: { 
            timeField: response.Tables[0].Columns[0].ColumnName, 
            valueField: response.Tables[0].Columns[1].ColumnName,
            lineField: response.Tables[0].Columns.length > 2 ? response.Tables[0].Columns[2].ColumnName : undefined
          }
        };
        element.type = 'Timeline';

        break;

      case 'bars':
        dataSource.format = { 
          type: 'bars', 
          args: { 
            barsField: response.Tables[0].Columns[0].ColumnName,
            seriesField: response.Tables[0].Columns.length > 1 ? response.Tables[0].Columns[1].ColumnName : undefined,
            valueField: response.Tables[0].Columns.length > 2 ? response.Tables[0].Columns[2].ColumnName : undefined
          }
        };
        element.type = 'BarData';
        break;

      case 'pie':
    
        if (response.Tables[0].Columns.length < 2) { return; }
      
        dataSource.format = { 
          type: 'pie',
          args: {
            label: response.Tables[0].Columns[0].ColumnName,
            value: response.Tables[0].Columns[1].ColumnName, 
          }
         };
         element.type = 'PieData';
         break;

      default:
        return;
    }

    dashboard.dataSources.push(dataSource);
    dashboard.elements.push(element);

    ConfigurationsActions.saveConfiguration(dashboard);

    if (redirect) {
      setTimeout(() => window.location.replace('/dashboard/bot_analytics_inst'), 1000);
    }
  }

  submitQuery(index: number) {
    let queries = this.state.queries;
    queries[index].response = null;
    queries[index].loadingData = true;

    this.setState({ queries });

    let appInsightsApi = new ApplicationInsightsApi(this.props.applicationID, this.props.apiKey);
    appInsightsApi.callQuery(this.state.queries[index].query, (err, json) => {
      queries[index].response = json;
      queries[index].loadingData = false;

      // Entering a new, automatic new cell to the explorer
      if (queries.length === index + 1) {
        queries.push({
          query: 'customEvents | take 5',
          response: null,
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

  dateFormat(time: string) {
    return moment(time).format('MMM-DD');
  }

  handleInlineChange(index: number, value: string) {
    // Basically how the `SelectionControlGroup` works
    let queries = this.state.queries;
    queries[index].renderAs = value as any;
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

    let formatForRender = (response) => {
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

    const displayOptions = { 
      'table': 'view_list', 
      'timeline': 'timeline', 
      'bars': 'equalizer', 
      'pie': 'pie_chart' 
    };
    let renderDisplayOptions = (q: IQueryState, index: number) => (
      <span>
        {
          Object.keys(displayOptions).map((option, oi) => (
              <Button
                id={'inlineRadio_0_' + oi}
                name={'inlineRadios' + oi}
                primary={q.renderAs === option}
                secondary={q.renderAs !== option}
                onClick={this.handleInlineChange.bind(this, index, option)}
              >{displayOptions[option]}</Button>
            )
          )
        }
      </span>
    );

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
          {renderDisplayOptions(q, i)}
          {
            (q.responseExpanded && q.response && !q.loadingData) &&
            (
              <div>
                <div style={styles.results}>
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
                        <LineChart width={730} height={250} 
                          data={formatForRender(q.response)} 
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis dataKey="time" tickFormatter={this.dateFormat} minTickGap={20} />
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
                        <BarChart width={730} height={250} 
                          data={formatForRender(q.response)} 
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <XAxis />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3"/>
                          <Bar dataKey="value" fill="#8884d8"/>
                          <Legend />
                          <Tooltip />
                        </BarChart>
                      </Card>
                    ) ||
                    q.renderAs === 'pie' && (
                      <Card id="myid" title="my title" subtitle="my subtitle">
                        <PieChart width={730} height={250}>
                          <Pie
                            data={formatForRender(q.response)} 
                            cx={300} 
                            cy={100} 
                            outerRadius={80} 
                            fill="#8884d8"
                          >
                            {
                              formatForRender(q.response).map((entry, index) => (
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
                <div style={styles.resultsOptions}>
                  <Button raised label="Pin" onClick={this.pinToDashboard.bind(this, i, false)} />
                  <Button raised label="Pin &amp; Jump" onClick={this.pinToDashboard.bind(this, i, true)} />
                </div>
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
    });

    return (
      <div style={{ width: '100%' }}>
        {queryParts}
      </div>
    );
  }
}