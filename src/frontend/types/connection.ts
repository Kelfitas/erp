export type HttpKeys = keyof HttpRequest | keyof HttpResponse | keyof HttpConnection;

export interface HttpHeaders {
  any: string;
}

export interface HttpRequest {
  method: string;
  uri: string;
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

export interface HttpConnection {
  id: string;
}

export interface Data {
  connection: HttpConnection;
  req: HttpRequest;
  res: HttpResponse;
}

export interface DataRow extends HttpRequest, HttpResponse, HttpConnection {}

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
