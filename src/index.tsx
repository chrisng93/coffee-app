import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import MediaQuery from 'react-responsive';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

const SMALL_SCREEN_WIDTH = 991;

ReactDOM.render(
  <MuiThemeProvider>
    <MediaQuery maxDeviceWidth={SMALL_SCREEN_WIDTH}>
      {matches => <App isSmallScreen={matches} />}
    </MediaQuery>
  </MuiThemeProvider>,
  document.getElementById('root'),
);

registerServiceWorker();
