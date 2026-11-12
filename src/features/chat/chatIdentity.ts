import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const CLIENT_ID_KEY = 'solace.chat-client-id.v1';
let clientIdPromise: Promise<string> | null = null;

export function getChatClientId(): Promise<string> {
  if (!clientIdPromise) {
    clientIdPromise = (async () => {
      const existing = await SecureStore.getItemAsync(CLIENT_ID_KEY);
      if (existing) return existing;
      const created = Crypto.randomUUID();
      await SecureStore.setItemAsync(CLIENT_ID_KEY, created);
      return created;
    })().catch((error) => {
      clientIdPromise = null;
      throw error;
    });
  }
  return clientIdPromise;
}
