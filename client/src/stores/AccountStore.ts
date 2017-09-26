import alt, { AbstractStoreModel } from '../alt';

import accountActions from '../actions/AccountActions';

interface IAccountStoreState {
  account: IDictionary;
  userFirstName: string;
  userLastName: string;
  isAuthenticated: boolean;
}

class AccountStore extends AbstractStoreModel<IAccountStoreState> implements IAccountStoreState {

  account: IDictionary;
  userFirstName: string;
  userLastName: string;
  isAuthenticated: boolean;

  constructor() {
    super();

    this.account = null;
    this.userFirstName = null;
    this.userLastName = null;

    this.bindListeners({
      updateAccount: accountActions.updateAccount,
      setAuthenticationDetails: accountActions.setAuthenticationDetails
    });
  }
  
  updateAccount(state: any) {
    this.account = state.account;
  }

  setAuthenticationDetails(state: any)
  {
    this.userFirstName = state.userFirstName;
    this.userLastName = state.userLastName;
    this.isAuthenticated = true;
  }
}

const accountStore = alt.createStore<IAccountStoreState>((AccountStore as AltJS.StoreModel<any>), 'AccountStore');

export default accountStore;
