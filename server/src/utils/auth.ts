import * as jwt from 'jsonwebtoken';
import * as xpath from 'xpath';
import * as xmldom from 'xmldom';
import * as request from 'request';

/**
* 
* Auth Client configuration values
*/
export interface AuthConfiguration {
	Audience: string;
	
	Resource: string;
	
	Tenant: string;
	
	ClientId: string;
	
	CertificateThumbprint: string;
  
  // Certificate Private Key in PEM format (because multiple supported)
	CertificateKey: string;
}

/**
* Values Parsed from WS Metadata from AAD 
*/
export interface WsMetadataParseResult {
	// If an error occurred stored here, otherwise null
	Error: string;
	
	// First Issuer in the metadata
	Issuer: string;
	
	// All the Public Signing Keys from metadata
	AuthKeys: string[];
}

// Number of Times to Retry Remote Requests
const TokenRetryCount: number = 0;
const WsMetaRetryCount: number = 3;

// The URL to Look up AAD information from, need to replace <tenant>
const SecurityTokenServiceAddressFormat: string = "https://login.microsoftonline.com/<tenant>/federationmetadata/2007-06/federationmetadata.xml";

  // The URL to request AAD Tokens from
  const AuthorityHostUrl: string = "https://login.microsoftonline.com/";

  // The Header containing Authorization Token
  const AuthorityHeaderName: string = 'Authorization';
  const AuthorityHeaderNameLower: string = 'authorization';

  // Begining of the Authority Header Token
  const BearerToken: string = 'Bearer ';

  // XML Namespaces for WS Metadata XML Document
  const wsfedns: { [name: string]: string} = {
	"root": "urn:oasis:names:tc:SAML:2.0:metadata",
	"ds": "http://www.w3.org/2000/09/xmldsig#",
	"xsi": "http://www.w3.org/2001/XMLSchema-instance",
	"fed": "http://docs.oasis-open.org/wsfed/federation/200706",
};

/**
* 
* Auth Client for Validating Requests and getting Auth Tokens
*/
export class AuthClient {
  private configuration: AuthConfiguration;
	private signingKeys: string[];
  private options: any;
  
  constructor(authConfig: AuthConfiguration, metadata: WsMetadataParseResult) {            
		if (!authConfig) {
			throw "Empty authConfig Paramter";
		}
		
		if (!metadata) {
			throw "Empty metadata";
		}
		
		if (!metadata.Issuer) {
			throw "Missing metadata authIssuer";
		}
		
		if (!metadata.AuthKeys) {
			throw "Missing metadata authKeys";
		}
		
		if (!authConfig.Audience) {
			throw "Missing Audience from Auth Configuration";
		}
		
		this.configuration = authConfig;		
		this.signingKeys = metadata.AuthKeys;
		this.options = {
			// Do *not* add hmac algos (it is insecure to mix the two!)
			algorithms: ["RS256"], 
			audience: this.configuration.Audience,
			issuer: metadata.Issuer,
            ignoreExpiration: false
		};
  }
  
  	/**
	* Gets a new instance of Auth Client
	* 
	* @param authconfig		Azure AAD Configuration to use for Client
	* @param done			Callback taking (error, AuthClient)
	*/
	public static GetClient(authconfig: AuthConfiguration, done: any) {
		AuthClient.GetWsMetaData(authconfig.Tenant, function(error: any, metadata: WsMetadataParseResult) {
			if (error) {
				done(error, null);
			} else {
				var authClient: AuthClient = new AuthClient(authconfig, metadata);
				done(null, authClient);			
			}
		});
  }
  
  /**
	* 
	* PEM Encodes a Public Key Certificate
	* 
	* @param key 	string to encode
	* Returns the PEM Encoded Certificate
	*/
private static PEMifyCertificate(key: string): string {
	return AuthClient.PEMify(key, "CERTIFICATE");
}

	/**
	* 
	* PEM Encodes a value
	* 
	* @param key 	string to encode
	* @param kind	kind to encode
	* Returns the PEM encoded Value
	*/
private static PEMify(key: string, kind: string): string {
	const linesz = 76; /* per PEM specification */
	var result: string = "";

	result += "-----BEGIN " + kind + "-----\n";
	for (var i = 0; i < key.length; i += linesz) {
		result += key.substring(i, i + linesz) + "\n";
	}
	result += "-----END " + kind + "-----\n";

	return result;
}

  /**
  * Gets the Meta Data from Azure AAD for a tenant
  * 
  * @param tenant 	Azure AAD Tenant Getting Metadata for
  * @param any		Callback (error, WSMetadataParseResult)
  */
  private static GetWsMetaData(tenant: string, done: any) {
    if (!tenant) {
      done("Tenant parameter is blank", null);
    } else {
      var url: string = SecurityTokenServiceAddressFormat.replace("<tenant>", tenant);			
      AuthClient.GetWsMetaDataRecurse(url, 1, done);
    }
  }

  /**
	* Recursively make a request to get the WS Metadata fron endpoint
	* 
	* @param url		Url to make the request from
	* @param attempt	Current attempt number 
	* @param any		Callback (error, WSMetadataParseResult)
	*/
  private static GetWsMetaDataRecurse(url: string, attempt: number, done: any) {
    request(url, function (error: any, response: any, body: any) {
      if (!error && response.statusCode === 200) {
        var metadata: WsMetadataParseResult = AuthClient.ParseWsMetaData(body);
        if (metadata.Error) {
          console.log("Failed to query WsMetadata after " + attempt + " attempts. Retrying: " + error);
          done(metadata.Error, null);
                return;
			  }
			done(null, metadata);
      } else {					
        if (attempt > WsMetaRetryCount) {
          // return last error
          if (error) {
            done(error, null);
          } else {
            console.log("Failed to query WsMetadata after " + attempt + " attempts. Failed: " + error);
            done("Metadata Request Reponse was " + response.statusCode, null); 
          }
        } else {
          attempt++;
          AuthClient.GetWsMetaDataRecurse(url, attempt, done);
        }
      }
	  });
  }

  /**
	* 
	* Parses the WS Metadata XML Document from AAD
	* 
	* @param body		The HTTP Request Response Body from AAD
	* Returns a WsMetadataParseResult
	*/
  private static ParseWsMetaData(body: string) : WsMetadataParseResult {
    var result: WsMetadataParseResult = <WsMetadataParseResult> {
      Error: null,
      Issuer: null,
      AuthKeys: null	
    };
    
    if (!body) {
      result.Error = "No WsMetadata document found in body";
      return result; 
    }
    
    try  {
      var doc: any = new xmldom.DOMParser().parseFromString(body); 
      var select: any = xpath.useNamespaces(wsfedns);
      
      var keys: any = select(
        "/root:EntityDescriptor/root:RoleDescriptor[@xsi:type='fed:SecurityTokenServiceType']" +
        "/root:KeyDescriptor[@use='signing']//ds:X509Certificate/text()", 
        doc);
      var authKeys: string[] = keys.map((x: any) => x.nodeValue);
      if (!authKeys || authKeys.length < 1) {
        result.Error = "Failed to find Auth Signing Keys in WS Metadata";
        return result; 
      }
      result.AuthKeys  = authKeys.map(AuthClient.PEMifyCertificate);
      
      var issuers: any = select('/root:EntityDescriptor/@entityID', doc);
      if (!issuers || issuers.length < 1) {
        result.Error = "Failed to find issuer in WS Metadata";
        return result;
      }

      var issuer: string = issuers[0].value;
      result.Issuer = issuer;
      
      return result;
    } catch(exception) {
      result.Error = exception;
      return result;
    }
  }
}