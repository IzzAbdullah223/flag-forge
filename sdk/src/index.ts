export interface FlagForgeUser {
  userId: string;
  [key: string]: string | number;
}

export interface EvaluationResult {
  flagKey: string;
  enabled: boolean;
  reason: string;
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
}