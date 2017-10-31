import * as request from 'xhr-request';

import { ActiveDirectoryAuthenticator } from '../../utils/adal/ActiveDirectoryAuthenticator';
import { AdalConfig } from '../../utils/adal/AdalConfig';

export interface IKustoApi {
  QueryData(clusterName: string, databaseName: string, query: string,
            callback: (error?: Error, json?: any) => void);
}

export const KUSTO_QUERY_URL = `/api/data/kusto`;

export default class KustoApi implements IKustoApi {
  public QueryData(clusterName: string, databaseName: string, query: string,
                   callback: (error?: Error, json?: any) => void) {
    let aadAuthenticator = new ActiveDirectoryAuthenticator(new AdalConfig());

    const body = {
      query: query
    };

    const urlParameters = "/" + clusterName + "/" + databaseName;
    
    try {
      // First get resource token for Kusto
      aadAuthenticator.GetResourceToken('d86f8e09-d5d3-450d-9b6a-21d9394124e5', (err, token) => {
        if (err) {
          return callback(err, null);
        }

        request(KUSTO_QUERY_URL + urlParameters, {
          method: 'POST',
          body: JSON.stringify(body),
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
        }, (error: Error, json: any) => {
          if (error) {
            return callback(error);
          }
          var d = JSON.parse(json).body;
          return callback(null, d);
        });
      });
    } catch (error) {
      callback(error);
    }
  }
}