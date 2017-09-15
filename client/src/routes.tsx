import * as React from 'react';
import { Route } from 'react-router';

import App from './components/App';
import { EnsureLoggedInContainer } from './components/EnsureLoggedInContainer'; 
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Setup from './pages/Setup';
import Explorer from './pages/Explorer';

export default (
  <Route component={App}>
      <Route component={EnsureLoggedInContainer}>
        <Route path="/" component={Home} />
        <Route path="/home" component={Home} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard/:id" component={Dashboard}/>
        <Route path="/setup" component={Setup} />
        <Route path="/explorer" component={Explorer} />
        <Route path="*" component={NotFound} />
      </Route>
  </Route>
);