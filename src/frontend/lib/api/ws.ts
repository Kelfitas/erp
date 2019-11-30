import { WS_URL } from 'frontend/config/api';

class WS {
  socket?: WebSocket;
  onmessage: (e: MessageEvent) => void;
  onopen: (e: Event) => void;
  onclose: (e: CloseEvent) => void;
  onerror: (e: any) => void;

  constructor() {
    this.onmessage = () => {};
    this.onopen = () => {};
    this.onclose = () => {};
    this.onerror = () => {};
  }

  connect() {
    this.socket = new WebSocket(WS_URL);

    this.socket.onopen = (event: Event) => {
      console.log("[open] Connection established");
      this.onopen(event);
    };

    this.socket.onmessage = (event: MessageEvent) => {
      console.log(`[message] Data received from server: ${event.data}`);
      this.onmessage(event);
    };

    this.socket.onclose = (event: CloseEvent) => {
      this.onclose(event);
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
      }
      this.connect();
    };

    this.socket.onerror = (error: any) => {
      this.onerror(error);
      console.log(`[error] ${error.message}`);
    };
  }
}

export default WS;
