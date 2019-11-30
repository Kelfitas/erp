export type HttpKeys = keyof HttpRequest | keyof HttpResponse | keyof Connection;

export interface HttpHeaders {
  [k: string]: string;
}

export interface HttpRequest {
  method: string;
  uri: string;
  protocolVersion: string;
  headers: HttpHeaders;
  body: string;
}

export interface HttpResponse {
  protocolVersion: string;
  statusCode: string;
  statusMessage: string | number;
  headers: HttpHeaders;
  body: string;
}

interface Connection { id: string };
interface JSONEncodedBuffer {
  type: string;
  data: Uint8Array;
}
export interface HttpConnection {
  id: string;
  // headers
  // proto: string;
  // headers: any;
  // host: string;
  // port: string;

  // data: any;
  requestBuffer: JSONEncodedBuffer;
  responseBuffer: JSONEncodedBuffer;

  // requestStatus: any;
  // responseStatus: any;

  // eve: any;
  // socket: any;
  // tlsOptions: any;
  // originSocket: any;
  // targetSocket: any;
}

export interface Data {
  connection: HttpConnection;
  req: HttpRequest;
  res: HttpResponse;
}

export interface DataRow extends HttpRequest, HttpResponse, Connection {}

export const DataToDataRow = (data: Data[]) => {
   return data.map((d: Data) => ({
    id: d.connection.id,
    method: d.req.method,
    uri: d.req.uri,
    headers: d.req.headers,
    body: d.req.body,
    protocolVersion: d.res.protocolVersion,
    statusCode: d.res.statusCode,
    statusMessage: d.res.statusMessage,
  }));
}
