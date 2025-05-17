import { chromium, Browser, LaunchOptions } from 'playwright';
import { AppLogger } from '../common/logger/logger.service';

const logger = new AppLogger();
const CONTEXT = 'BrowserProvider';

let browserInstance: Browser | null = null;
let launching = false;

const MAX_LAUNCH_WAIT_RETRIES = 10;
const RETRY_DELAY_MS = 300;

const launchOptions: LaunchOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--disable-extensions',
    '--disable-background-networking',
    '--disable-default-apps',
    '--disable-sync',
    '--metrics-recording-only',
    '--mute-audio',
  ],
  timeout: 30000,
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getBrowser(): Promise<Browser> {
  if (browserInstance) return browserInstance;

  if (launching) {
    logger.debug('Browser is currently launching. Waiting...', CONTEXT);
    let retries = 0;

    while (launching && retries < MAX_LAUNCH_WAIT_RETRIES) {
      await sleep(RETRY_DELAY_MS);
      retries++;
    }

    if (!browserInstance) {
      throw new Error('Browser instance was not initialized after waiting.');
    }

    return browserInstance;
  }

  try {
    launching = true;
    logger.log('Launching new Playwright browser instance...', CONTEXT);
    browserInstance = await chromium.launch(launchOptions);
    logger.log('Browser instance is ready.', CONTEXT);
    return browserInstance;
  } catch (error) {
    logger.error('Failed to launch browser', (error as Error)?.stack, CONTEXT);
    throw error;
  } finally {
    launching = false;
  }
}

export async function closeBrowser(): Promise<void> {
  if (!browserInstance) return;

  try {
    logger.log('Closing browser instance...', CONTEXT);
    await browserInstance.close();
    logger.log('Browser instance closed.', CONTEXT);
  } catch (error) {
    logger.error('Failed to close browser', (error as Error)?.stack, CONTEXT);
  } finally {
    browserInstance = null;
  }
}
