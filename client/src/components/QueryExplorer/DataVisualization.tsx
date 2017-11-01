import * as React from 'react';

import TimelineVisual from './DataVisualizations/TimelineVisual';

import CircularProgress from 'react-md/lib/Progress/CircularProgress';
import SelectionControl from 'react-md/lib/SelectionControls/SelectionControl';

interface IDataVisualizationState {
  showResult: boolean;
}

interface IDataVisualizationProps {
  id: string;
  queryResponse?: string;
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  onRenderTypeChanged: (newRenderType: string) => void;
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

  onRenderChanged(value: string) {
    this.props.onRenderTypeChanged(value as any);
  }

  render() {
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
          (
            (this.props.renderAs === 'table') && (
                <TimelineVisual id={this.props.id}
                                queryResponse={this.props.queryResponse}
                                renderAs={this.props.renderAs}
                                onRenderChanged={this.onRenderChanged.bind(this)}
                                showDataVisual={this.state.showResult}
                />
          ))
        }
      </div>      
    );
  }
}