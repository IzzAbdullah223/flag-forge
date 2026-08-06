type Client = {
  controller: ReadableStreamDefaultController;
};

declare const globalThis: {
  sseClientsGlobal: Map<string, Set<Client>>;
} & typeof global;

const clientsByEnvironment =
  globalThis.sseClientsGlobal ?? new Map<string, Set<Client>>();

if (process.env.NODE_ENV !== "production") {
  globalThis.sseClientsGlobal = clientsByEnvironment;
}

export function addClient(environmentId: string, controller: ReadableStreamDefaultController) {
  const client: Client = { controller };

  if (!clientsByEnvironment.has(environmentId)) {
    clientsByEnvironment.set(environmentId, new Set());
  }
  clientsByEnvironment.get(environmentId)!.add(client);

  return client;
}

export function removeClient(environmentId: string, client: Client) {
  clientsByEnvironment.get(environmentId)?.delete(client);
}

export function broadcastFlagChange(environmentId: string, flagKey: string) {
  const clients = clientsByEnvironment.get(environmentId);
  if (!clients) return;

  const message = `data: ${JSON.stringify({ flagKey })}\n\n`;
  const encoded = new TextEncoder().encode(message);

  for (const client of clients) {
    client.controller.enqueue(encoded);
  }
}