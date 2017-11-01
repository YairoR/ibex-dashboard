import * as React from 'react';

import { VisualBase, IVisualBaseProps, IVisualBaseState } from './VisualBase';

import DataTable from 'react-md/lib/DataTables/DataTable';
import TableHeader from 'react-md/lib/DataTables/TableHeader';
import TableBody from 'react-md/lib/DataTables/TableBody';
import TableRow from 'react-md/lib/DataTables/TableRow';
import TableColumn from 'react-md/lib/DataTables/TableColumn';

interface ITableVisualProps extends IVisualBaseProps {
}

interface ITableVisualState extends IVisualBaseState {
}

export default class TableVisual extends VisualBase<ITableVisualProps, ITableVisualState> {
  constructor(props: any) {
    super(props);
  }

  renderVisual() {
        // Map between the Kusto response to table view
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
    );
  }
}