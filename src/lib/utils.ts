import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';

/**
 * Opens a URL in the appropriate way for the current platform.
 * On native platforms, it uses Capacitor's Browser plugin to open in the system browser.
 * On web, it defaults to window.location.href.
 */
export async function openUrl(url: string, external = true) {
  if (Capacitor.isNativePlatform() && external) {
    await Browser.open({ url });
  } else {
    window.location.href = url;
  }
}
