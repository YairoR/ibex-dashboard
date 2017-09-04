import * as React from 'react';

import QueryTesterControl from '../data-sources/connections/application-insights/QueryTesterControl';

export default class Explorer extends React.Component<any, any> {

  render() {

    return (
      <div style={{ width: '100%' }}>
        <QueryTesterControl
          applicationID="4d567b3c-e52c-4139-8e56-8e573e55a06c"
          apiKey="tn6hhxs60afz4yzd7cp2nreph1wja3ecxtflq8rs"
          buttonStyle={{ width: '100%' }}
        />
      </div>
    );
  }
}
