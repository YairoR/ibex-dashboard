import alt, { AbstractStoreModel } from '../../alt';
import 'expose-loader?AuthenticationContext!adal-angular';
import { AdalConfig } from './AdalConfig';

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