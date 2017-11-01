import * as React from 'react';

import Button from 'react-md/lib/Buttons/Button';
import Collapse from 'react-md/lib/Helpers/Collapse';

export interface IVisualBaseProps {
  id: string;
  onRenderChanged: (newRenderType: string) => void;
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  queryResponse: string;
  showDataVisual: boolean;
}

export interface IVisualBaseState {

}

export abstract class VisualBase<T1 extends IVisualBaseProps, T2 extends IVisualBaseState> 
                                extends React.Component<IVisualBaseProps, IVisualBaseState> {
  constructor(props: any) {
    super(props);
  }

  abstract renderVisual() : JSX.Element;

  onRenderChanged(value: string) {
    this.props.onRenderChanged(value as any);
  }

  render() {
    const displayOptions = { 
      'table': 'view_list', 
      'timeline': 'timeline', 
      'bars': 'equalizer', 
      'pie': 'pie_chart' 
    };

    let renderDisplayOptions = (currentRenderType: string, index: string) => (
      <span>
        {
          Object.keys(displayOptions).map((option, oi) => (
              <Button
                id={'inlineRadio_' + index + '_' + oi}
                name={'inlineRadios' + oi}
                primary={currentRenderType === option}
                secondary={currentRenderType !== option}
                onClick={this.onRenderChanged.bind(this, option)}
              >{displayOptions[option]}</Button>
            )
          )
        }
      </span>
    );

    return (
      <div>
        <Collapse collapsed={!this.props.showDataVisual}>
          <div>
            {renderDisplayOptions(this.props.renderAs, this.props.id)}
          </div>
        </Collapse>
        <Collapse collapsed={!this.props.showDataVisual}>
          {this.renderVisual()}
        </Collapse>
      </div>
    );
  }
}