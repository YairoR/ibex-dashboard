import alt, { AbstractStoreModel } from '../../alt';
import 'expose-loader?AuthenticationContext!adal-angular';
import { AdalConfig } from './AdalConfig';
import AccountActions from '../../actions/AccountActions';

let createAuthContextFn: adal.AuthenticationContextStatic = AuthenticationContext; 
 
export class ActiveDirectoryAuthenticator {
  private context: adal.AuthenticationContext; 
  private _oauthData = { isAuthenticated: false, userName: '', loginError: '', profile: '' };
  
  constructor(private adalConfig: AdalConfig) {
    this.context = new createAuthContextFn(adalConfig.getAdalConfig); 
  }

  public login() {
    this.context.login();
  }

  public logout() {
    this.context.logOut();
  }

  public handleCallback() {
    this.context.handleWindowCallback();

    // In case this callback is after the user authenticated, save the login information in the store
    if (this.isAuthenticated)
    {
      AccountActions.setAuthenticationDetails(this.userInfo.profile.given_name,
                                              this.userInfo.profile.given_name);
    }
  }

  public get userInfo() {    
    return this.context.getCachedUser();
  }

  public get accessToken() {
    return this.context.getCachedToken(this.adalConfig.getAdalConfig.clientId); 
  }

  public get isAuthenticated() {
    return this.userInfo && this.accessToken; 
  }
}