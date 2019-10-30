import _ws from './ws';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'events';
import { API_URL } from 'frontend/config/api';

const GET_HISTORY_URL = '/getHistory';
const GET_HISTORY_ITEM_URL = '/getHistory/:id';

type EventListener = (...args: any[]) => void;

class Api {
  eve: EventEmitter;
  ws: WebSocket;
  axios: AxiosInstance;

  constructor(ws: WebSocket) {
    this.eve = new EventEmitter();
    this.ws = ws;
    this.ws.onmessage = (...props) => this.emit('message', ...props);
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 1000,
      headers: {'X-Custom-Header': 'foobar'}
    });
  }

  // Events
  on = (event: string | symbol, cb: EventListener) => this.eve.on(event, cb);
  off = (event: string | symbol, cb: EventListener) => this.eve.off(event, cb);
  emit = (event: string | symbol, ...args: any[]) => this.eve.emit(event, ...args);

  // Request base
  get = (url: string, config?: AxiosRequestConfig | undefined) => this.axios.get(url, config);
  post = (url: string, config?: AxiosRequestConfig | undefined) => this.axios.get(url, config);

  // Api Calls
  getHistory = () => this.get(GET_HISTORY_URL);
  getHistoryItem = (id: string) => this.get(GET_HISTORY_ITEM_URL.replace(':id', id));
}

export default new Api(_ws);
