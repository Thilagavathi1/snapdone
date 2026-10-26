import * as Network from 'expo-network';

/** True when the device has no connection. SnapDone works offline; this only drives the badge. */
export function useIsOffline(): boolean {
  const state = Network.useNetworkState();
  return state.isConnected === false || state.isInternetReachable === false;
}
