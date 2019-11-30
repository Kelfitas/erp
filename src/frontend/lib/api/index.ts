import WS from './ws';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { EventEmitter } from 'events';
import { API_URL } from 'frontend/config/api';

const GET_HISTORY_URL = '/getHistory';
const GET_HISTORY_ITEM_URL = '/getHistory/:id';
const GET_HISTORY_LIST_URL = '/getHistoryList/';
const REPEAT_URL = '/repeat/:id';

type EventListener = (...args: any[]) => void;

class Api {
  eve: EventEmitter;
  ws: WS;
  axios: AxiosInstance;

  constructor() {
    this.eve = new EventEmitter();
    this.ws = new WS();
    this.ws.connect();
    this.ws.onmessage = (...props) => this.emit('message', ...props);
    this.axios = axios.create({
      baseURL: API_URL,
      timeout: 30 * 1000,
    });
  }

  // Events
  on = (event: string | symbol, cb: EventListener) => this.eve.on(event, cb);
  off = (event: string | symbol, cb: EventListener) => this.eve.off(event, cb);
  emit = (event: string | symbol, ...args: any[]) => this.eve.emit(event, ...args);

  // Request base
  get = (url: string, config?: AxiosRequestConfig | undefined) => this.axios.get(url, config);
  post = (url: string, data?: any, config?: AxiosRequestConfig | undefined) => this.axios.post(url, data, config);

  // Api Calls
  getHistory = () => this.get(GET_HISTORY_URL);
  getHistoryItem = (id: string) => this.get(GET_HISTORY_ITEM_URL.replace(':id', id));
  getHistoryList = (ids: string[]) => this.post(GET_HISTORY_LIST_URL, { data: ids });
  repeat = (id: string, data: string) => this.post(REPEAT_URL.replace(':id', id), { data });
}

export default new Api();
