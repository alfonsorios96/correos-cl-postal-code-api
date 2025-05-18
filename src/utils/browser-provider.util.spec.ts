/* eslint-disable @typescript-eslint/unbound-method */
import { chromium, Browser } from 'playwright';
import * as BrowserProvider from './browser-provider.util';

jest.mock('playwright', () => {
  const mBrowser = { close: jest.fn() };
  return {
    chromium: {
      launch: jest.fn(() => Promise.resolve(mBrowser)),
    },
  };
});

jest.mock('../common/logger/logger.service', () => {
  const MockedLogger = jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  }));

  return { AppLogger: MockedLogger };
});

describe('BrowserProvider', () => {
  let mBrowser: jest.Mocked<Browser>;

  beforeAll(() => {
    jest.clearAllMocks();
    mBrowser = { close: jest.fn() } as unknown as jest.Mocked<Browser>;
    (chromium.launch as jest.Mock).mockResolvedValue(mBrowser);
  });

  describe('getBrowser', () => {
    it('Throw a new browser on first call.', async () => {
      const browser = await BrowserProvider.getBrowser();

      expect(chromium.launch).toHaveBeenCalledTimes(1);
      expect(browser).toBe(mBrowser);
    });

    it('Reuse the current instance for further calls.', async () => {
      const first = await BrowserProvider.getBrowser();
      const second = await BrowserProvider.getBrowser();

      expect(first).toBe(second);
      expect(chromium.launch).toHaveBeenCalledTimes(1);
    });
  });

  describe('closeBrowser', () => {
    it('Close instance and reboot  it.', async () => {
      await BrowserProvider.getBrowser();
      await BrowserProvider.closeBrowser();

      expect(mBrowser.close).toHaveBeenCalledTimes(1);

      await BrowserProvider.getBrowser();
      expect(chromium.launch).toHaveBeenCalledTimes(2);
    });
  });
});
