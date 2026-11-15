import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { cascadeApiManager } from '../cascadeApiManager';
import { coinGeckoService } from '../coingecko';

interface ClientConnection {
  ws: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
}

class BitcoinWebSocketServer {
  private wss: WebSocketServer | null = null;
  private clients = new Map<string, ClientConnection>();
  private priceUpdateInterval: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  initialize(server: Server) {
    // Create WebSocket server on distinct path to avoid Vite HMR conflicts
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      clientTracking: true
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      const client: ClientConnection = {
        ws,
        subscriptions: new Set(),
        lastPing: Date.now()
      };

      this.clients.set(clientId, client);
      console.log(`🔗 WebSocket client connected: ${clientId} (Total: ${this.clients.size})`);

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(clientId, message);
        } catch (error) {
          console.error('WebSocket message parse error:', error);
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`🔌 WebSocket client disconnected: ${clientId} (Total: ${this.clients.size})`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'welcome',
        clientId,
        timestamp: Date.now(),
        features: ['price-updates', 'market-data', 'news-alerts']
      });
    });

    // Start real-time data streams
    this.startPriceUpdates();
    this.startPingPong();

    console.log('🚀 WebSocket server initialized on /ws');
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleClientMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'subscribe':
        if (message.channel) {
          client.subscriptions.add(message.channel);
          this.sendToClient(clientId, {
            type: 'subscribed',
            channel: message.channel,
            timestamp: Date.now()
          });
        }
        break;

      case 'unsubscribe':
        if (message.channel) {
          client.subscriptions.delete(message.channel);
          this.sendToClient(clientId, {
            type: 'unsubscribed',
            channel: message.channel,
            timestamp: Date.now()
          });
        }
        break;

      case 'pong':
        // Client responded to our ping - update last activity
        client.lastPing = Date.now();
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  private sendToClient(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending to client:', error);
        this.clients.delete(clientId);
      }
    }
  }

  private broadcast(data: any, channel?: string) {
    const message = JSON.stringify(data);
    let sentCount = 0;

    for (const [clientId, client] of this.clients.entries()) {
      if (client.ws.readyState === WebSocket.OPEN) {
        // If channel specified, only send to subscribed clients
        if (!channel || client.subscriptions.has(channel)) {
          try {
            client.ws.send(message);
            sentCount++;
          } catch (error) {
            console.error('Broadcast error:', error);
            this.clients.delete(clientId);
          }
        }
      } else {
        // Clean up dead connections
        this.clients.delete(clientId);
      }
    }

    return sentCount;
  }

  private async startPriceUpdates() {
    const updatePrices = async () => {
      try {
        // Get latest Bitcoin price
        const priceResult = await cascadeApiManager.getCurrentBitcoinPrice();
        
        // Broadcast to price subscribers
        const sentCount = this.broadcast({
          type: 'price-update',
          data: {
            price: priceResult.price,
            source: priceResult.source,
            timestamp: priceResult.timestamp,
            confidence: priceResult.confidence
          }
        }, 'price-updates');

        if (sentCount > 0) {
          console.log(`📡 Price update broadcast to ${sentCount} clients: $${priceResult.price.toLocaleString()}`);
        }
      } catch (error) {
        console.error('WebSocket price update error:', error);
      }
    };

    // Initial update
    await updatePrices();

    // Update every 10 seconds for real-time feel
    this.priceUpdateInterval = setInterval(updatePrices, 10000);
  }

  private startPingPong() {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [clientId, client] of this.clients.entries()) {
        // Send application-level ping to check connection health
        if (client.ws.readyState === WebSocket.OPEN) {
          try {
            // Send JSON ping message instead of native WebSocket ping (browser compatible)
            client.ws.send(JSON.stringify({ type: 'ping', timestamp: now }));
            
            // Only remove clients that haven't responded in 5 minutes (more lenient)
            if (now - client.lastPing > 300000) {
              console.log(`🧹 Cleaning up inactive client: ${clientId}`);
              client.ws.terminate();
              this.clients.delete(clientId);
            }
          } catch (error) {
            // Connection is broken, clean up
            this.clients.delete(clientId);
          }
        } else {
          // Connection is not open, clean up
          this.clients.delete(clientId);
        }
      }
    }, 60000); // Check every 60 seconds (less aggressive)
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      activeSubscriptions: Array.from(this.clients.values())
        .reduce((total, client) => total + client.subscriptions.size, 0)
    };
  }

  shutdown() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.wss) {
      this.wss.close();
    }
    console.log('🔌 WebSocket server shutdown');
  }
}

export const websocketServer = new BitcoinWebSocketServer();