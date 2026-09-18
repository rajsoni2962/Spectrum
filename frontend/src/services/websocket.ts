type ListenerCallback = (data: any) => void;

class SOCWebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Set<ListenerCallback> = new Set();
  private isConnecting: boolean = false;
  private reconnectInterval: number = 3000;

  constructor() {
    this.connect();
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.isConnecting = true;

    // Detect websocket url
    const isDev = window.location.port === "5173";
    const wsHost = isDev ? "127.0.0.1:8000" : window.location.host;
    const wsUrl = `ws://${wsHost}/api/v1/live/ws`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnecting = false;
      };

      this.socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          this.notify(parsed);
        } catch (err) {
          console.error("[SOC WS Parse Error]", err);
        }
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        this.socket?.close();
      };
    } catch (e) {
      this.isConnecting = false;
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public subscribe(callback: ListenerCallback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(data: any) {
    this.listeners.forEach((callback) => callback(data));
  }
}

export const socWebSocket = new SOCWebSocketClient();
