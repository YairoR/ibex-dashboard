import * as React from 'react';
import AuthContext from 'adal-angular';
import { AdalConfig } from '../utils/adal/AdalConfig';
import { ActiveDirectoryAuthenticator } from '../utils/adal/ActiveDirectoryAuthenticator';

export class EnsureLoggedInContainer extends React.Component<any, any> {

  adalConfig: AdalConfig;
  activeDirectoryAuthenticator: ActiveDirectoryAuthenticator;

  constructor() {
    super();
    
    this.adalConfig = new AdalConfig();
    this.activeDirectoryAuthenticator = new ActiveDirectoryAuthenticator(this.adalConfig);
  }

  componentDidMount() {
    this.activeDirectoryAuthenticator.handleCallback();
    
    if (!this.activeDirectoryAuthenticator.isAuthenticated)
    {
      this.activeDirectoryAuthenticator.login();
    }
  }

  render() {
    if (this.activeDirectoryAuthenticator.isAuthenticated) {
      return this.props.children
    }
 
    return null;
  }
}