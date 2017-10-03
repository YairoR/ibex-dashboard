export class AdalConfig { 

  public get getAdalConfig(): any { 
    return { 
      tenant: 'microsoft.onmicrosoft.com', 
      clientId: '68e765dd-d04b-4a78-ac60-d5c0537fdbbe',
      redirectUri: window.location.origin + '/', 
      postLogoutRedirectUri: window.location.origin + '/',
      extraQueryParameter: 'nux=1'
    };
  }
}