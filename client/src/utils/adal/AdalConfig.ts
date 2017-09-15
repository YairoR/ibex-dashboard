export class AdalConfig { 
  constructor() { 
  } 

  public get getAdalConfig(): any { 
    return { 
      tenant: 'common', 
      clientId: '0a207019-ba07-4c04-9989-6128c9355b63', 
      redirectUri: window.location.origin + '/', 
      postLogoutRedirectUri: window.location.origin + '/' 
    };
  } 
}