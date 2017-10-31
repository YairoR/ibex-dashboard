import * as React from 'react';

import DialogContainer from 'react-md/lib/Dialogs/DialogContainer';
import TextField from 'react-md/lib/TextFields/TextField';

interface IClusterChangeFormProps {
  visible: boolean;
  onHide: () => void;
  activeClusterName: string;
  activeDatabaseName: string;
}

interface IClusterChangeFormState {
}

export default class ClusterChangeForm extends React.Component<IClusterChangeFormProps, IClusterChangeFormState> {
  constructor(props: any) {
    super(props);

    this.state = {
    }
  };

  render() {
    return (
      <div>
        <DialogContainer
          id="simple-list-dialog"
          visible={this.props.visible}   
          title="Change cluster"
          onHide={this.props.onHide}
          dialogStyle={{ width: '50%', overflow: 'auto' }}
          contentStyle={{ padding: '0' }}
        >
          <div style={{ margin: '20px' }}>
            <p style={{ fontSize: '24px'}}><b><u>Current cluster in use:</u></b></p>
            <TextField
              label="Cluster name"
              lineDirection="center"
              style={{ width: '30%' }}
              defaultValue={this.props.activeClusterName}
              disabled
            />
            &nbsp;&nbsp;&nbsp;
            <TextField
              label="Database name"
              lineDirection="center"
              style={{ width: '30%' }}
              defaultValue={this.props.activeDatabaseName}
              disabled
            />
          </div>
        </DialogContainer>
      </div>  
    );
  }
}