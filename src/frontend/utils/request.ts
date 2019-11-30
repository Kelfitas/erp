import { HttpHeaders, HttpRequest } from 'frontend/types/connection';
import get from 'lodash/get';

export const parseRawHttpHeaders = (rawHeaders: string): HttpHeaders => {
  const headers: HttpHeaders = {};
  const headerLines = rawHeaders.split('\r\n');
  for (let i = 0; i < headerLines.length; i++) {
    const [key, value] = headerLines[i].split(': ');
    headers[key] = value;
  }

  return headers;
}

export const httpHeadersToStr = (headers: HttpHeaders): string => {
  const headerKeys = Object.keys(headers);
  const headerLines = [];
  for (let i = 0; i < headerKeys.length; i++) {
    const key = headerKeys[i];
    const value = headers[key];
    if (value) {
      headerLines.push(`${key}: ${value}`);
    }
  }

  return headerLines.join('\r\n');
}

export const requestObjToStr = (request: HttpRequest): string => {
  const rawHeaders = httpHeadersToStr(request.headers);
  let rawRequest = [
    `${request.method} ${request.uri} ${request.protocolVersion}`,
    `${rawHeaders}`,
    ``,
    request.body || '',
  ];

  // if (request.body) {
  //   rawRequest.push(request.body);
  // }

  return rawRequest.join('\r\n');
}

export const requestStrToObj = (rawRequest: string): HttpRequest => {
  const [headersRaw, body] = rawRequest.split('\r\n\r\n');
  const headerLines = headersRaw.split('\r\n');
  const [method, uri, protocolVersion] = headerLines[0].split(' ');
  const headers = parseRawHttpHeaders(headerLines.slice(1).join('\r\n'));

  return {
    method,
    uri,
    protocolVersion,
    headers,
    body,
  } as HttpRequest;
};

export const sanitizeRequest = (rawRequest: string): string => {
  if (rawRequest.indexOf('\r\n') === -1) {
    rawRequest = rawRequest.replace(/\n/g, '\r\n');
  }

  const request = requestStrToObj(rawRequest);
  const contentLength = get(request, 'body.length', 0);
  if (contentLength > 0) {
    request.headers['Content-Length'] = contentLength + '';
  }

  return requestObjToStr(request);
}
