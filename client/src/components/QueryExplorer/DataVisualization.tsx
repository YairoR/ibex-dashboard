import * as React from 'react';

import CircularProgress from 'react-md/lib/Progress/CircularProgress';

import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';
import SelectionControl from 'react-md/lib/SelectionControls/SelectionControl';
import Collapse from 'react-md/lib/Helpers/Collapse';

interface IDataVisualizationState {
  showResult: boolean;
}

interface IDataVisualizationProps {
  id: string;
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  queryResponse?: string;
}

export default class DataVisualization extends React.Component<IDataVisualizationProps,
                                                               IDataVisualizationState> {
  constructor() {
    super();
    
    this.onChange = this.onChange.bind(this);

    this.state = {
      showResult: true
    };
  } 

  onChange(checked : boolean, changeEvent: any) {
    this.setState({ showResult: checked });
  }

  render() {
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

    return (
      <div>
        <SelectionControl
          id={this.props.id}
          type="switch"
          label="Results"
          onChange={this.onChange}
          style={{ fontSize: '19px' }}
          defaultChecked
        />
        {
          ((this.props.renderAs === 'loading') && (
            <div style={{ width: '100%', top: 130, left: 0 }}>
              <CircularProgress id="testerProgress" />
            </div>
          )) || 
          ((this.props.renderAs === 'table') && (
            <Collapse collapsed={!this.state.showResult}>
              <div style={{ background: 'white',
                            border: '1px',
                            borderStyle: 'groove'
                        }}>
                <DataTable plain>
                  <TableBody>
                    {mapResult(this.props.queryResponse)}
                  </TableBody>
                </DataTable>
              </div>
            </Collapse>
          ))
        }
      </div>      
    );
  }
}