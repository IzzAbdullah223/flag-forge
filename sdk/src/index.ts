export interface FlagForgeUser {
  userId: string;
  [key: string]: string | number;
}

export interface EvaluationResult {
  flagKey: string;
  enabled: boolean;
  reason: string;
}

export interface FlagChangeEvent {
  flagKey: string;
}

export interface FlagForgeClientOptions {
  apiKey: string;
  baseUrl?: string;
}

export class FlagForgeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(options: FlagForgeClientOptions) {
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? "https://your-flag-forge-domain.com";
  }

  async getFlag(flagKey: string, user: FlagForgeUser): Promise<EvaluationResult> {
    const response = await fetch(`${this.baseUrl}/api/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ flagKey, user }),
    });

    if (!response.ok) {
      throw new Error(`Flag Forge request failed: ${response.status}`);
    }

    return response.json();
  }

  async subscribe(onChange: (event: FlagChangeEvent) => void): Promise<() => void> {
    const controller = new AbortController();

    const response = await fetch(`${this.baseUrl}/api/stream`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      signal: controller.signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Flag Forge stream connection failed: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    (async () => {
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";

          for (const message of messages) {
            const line = message.trim();
            if (!line.startsWith("data:")) continue;

            const json = line.replace("data:", "").trim();
            try {
              const event = JSON.parse(json) as FlagChangeEvent;
              onChange(event);
            } catch {
              // ignore malformed messages
            }
          }
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        throw err;
      }
    })();

    return () => controller.abort();
  }
}