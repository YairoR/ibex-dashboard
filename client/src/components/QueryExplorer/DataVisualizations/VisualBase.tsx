import * as React from 'react';

import QueryExplorerActions from '../../../actions/QueryExplorerActions';
import QueryExplorerStore, { IQueryExplorerState, ICellState } from '../../../stores/QueryExplorerStore';

import Button from 'react-md/lib/Buttons/Button';
import Collapse from 'react-md/lib/Helpers/Collapse';

export interface IVisualBaseProps {
  id: number;
  onRenderChanged: (newRenderType: string) => void;
  renderAs?: 'loading' | 'table' | 'timeline' | 'bars' | 'pie';
  queryResponse: string;
  showDataVisual: boolean;
}

export interface IVisualBaseState {
  showResults: boolean;
  renderType: string;
}

export abstract class VisualBase<T1 extends IVisualBaseProps, T2 extends IVisualBaseState> 
                                extends React.Component<IVisualBaseProps, IVisualBaseState> {
  constructor(props: any) {
    super(props);

    var cellState = QueryExplorerStore.getState();

    this.onQueryExplorerStoreChange = this.onQueryExplorerStoreChange.bind(this);

    this.state = {
      showResults: cellState.cells[this.props.id].showResult,
      renderType: cellState.cells[this.props.id].renderAs
    };
  }

  componentDidMount() {   
    QueryExplorerStore.listen(this.onQueryExplorerStoreChange);
  }

  abstract renderVisual() : JSX.Element;

  onQueryExplorerStoreChange(state: IQueryExplorerState) {
    this.setState({ showResults: state.cells[this.props.id].showResult,
                    renderType: state.cells[this.props.id].renderAs })
  }

  onRenderTypeChange(newRenderType: string) {
    QueryExplorerActions.updateRenderType(this.props.id, newRenderType);
  }

  render() {
    const displayOptions = { 
      'table': 'view_list', 
      'timeline': 'timeline', 
      'bars': 'equalizer', 
      'pie': 'pie_chart' 
    };

    let renderDisplayOptions = (currentRenderType: string, id: number) => (
      <span>
        {
          Object.keys(displayOptions).map((option, oi) => (
              <Button
                id={'inlineRadio_' + id + '_' + oi}
                name={'inlineRadios' + oi}
                primary={currentRenderType === option}
                secondary={currentRenderType !== option}
                onClick={this.onRenderTypeChange.bind(this, option)}
              >{displayOptions[option]}</Button>
            )
          )
        }
      </span>
    );

    return (
      <div>
        <Collapse collapsed={!this.state.showResults}>
          <div>
            {renderDisplayOptions(this.state.renderType, this.props.id)}
          </div>
        </Collapse>
        <Collapse collapsed={!this.state.showResults}>
          {this.renderVisual()}
        </Collapse>
      </div>
    );
  }
}