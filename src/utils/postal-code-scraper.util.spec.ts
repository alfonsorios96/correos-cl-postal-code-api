/* eslint-disable @typescript-eslint/unbound-method */
import type { Browser, BrowserContext, Page } from 'playwright';
import type { scrapePostalCode as ScrapeFn } from './postal-code-scraper.util';

jest.mock('../common/logger/logger.service', () => {
  const LoggerMock = jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    verbose: jest.fn(),
  }));
  return { AppLogger: LoggerMock };
});

jest.mock('./normalize-text.util', () => ({
  normalizeText: jest.fn((v: string) => v.toUpperCase()),
}));

jest.mock('./browser-provider.util', () => ({
  getBrowser: jest.fn(),
}));
import { getBrowser } from './browser-provider.util';

const realSetTimeout = global.setTimeout;
beforeAll(() => {
  jest
    .spyOn(global, 'setTimeout')
    .mockImplementation((cb: any /* fn */, _ms?: number) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      cb();
      return 0 as unknown as NodeJS.Timeout;
    });
});
afterAll(() => {
  global.setTimeout = realSetTimeout;
});

function buildPlaywrightMocks(
  opts: { searchBtnEnables?: boolean | 'delayed' } = {},
): {
  browser: jest.Mocked<Browser>;
  context: jest.Mocked<BrowserContext>;
  page: jest.Mocked<Page>;
} {
  const genericLocator = () => ({
    click: jest.fn().mockResolvedValue(undefined),
    fill: jest.fn().mockResolvedValue(undefined),
    press: jest.fn().mockResolvedValue(undefined),
    waitFor: jest.fn().mockResolvedValue(undefined),
  });

  let enabledCalls = 0;
  const isEnabled = jest.fn<Promise<boolean>, []>().mockImplementation(() => {
    if (opts.searchBtnEnables === 'delayed') {
      enabledCalls += 1;
      return Promise.resolve(enabledCalls > 2);
    }
    return Promise.resolve(!!opts.searchBtnEnables);
  });
  const searchBtnLocator = { ...genericLocator(), isEnabled };

  const resultLocator = {
    ...genericLocator(),
    innerText: jest.fn().mockResolvedValue('7654321'),
  };

  const inputVals: Record<string, string> = {
    'input#mini-search-form-text': 'SANTIAGO',
    'input#mini-search-form-text-direcciones': 'ALAMEDA',
    '#_cl_cch_codigopostal_portlet_CodigoPostalPortlet_INSTANCE_MloJQpiDsCw9_numero':
      '123',
  };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const page: jest.Mocked<Page> = {
    locator: jest.fn().mockImplementation((sel: string) => {
      if (sel.includes('searchDirection')) return searchBtnLocator;
      if (sel.includes('ddCodPostal')) return resultLocator;
      return genericLocator();
    }),
    inputValue: jest
      .fn()
      .mockImplementation((sel: string) =>
        Promise.resolve(inputVals[sel] ?? ''),
      ),
    setDefaultTimeout: jest.fn(),
    goto: jest.fn().mockResolvedValue(undefined),
    waitForSelector: jest.fn().mockResolvedValue(undefined),
    keyboard: { press: jest.fn().mockResolvedValue(undefined) },
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const context: jest.Mocked<BrowserContext> = {
    newPage: jest.fn().mockResolvedValue(page),
    close: jest.fn().mockResolvedValue(undefined),
  } as any;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const browser: jest.Mocked<Browser> = {
    newContext: jest.fn().mockResolvedValue(context),
  } as any;

  return { browser, context, page };
}

describe('scrapePostalCode', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Returns zip code', async () => {
    const { browser, context, page } = buildPlaywrightMocks({
      searchBtnEnables: 'delayed',
    });
    (getBrowser as jest.Mock).mockResolvedValue(browser);

    let scrapePostalCode!: typeof ScrapeFn;

    await jest.isolateModulesAsync(async () => {
      ({ scrapePostalCode } = await import('./postal-code-scraper.util'));
    });

    const result = await scrapePostalCode('Santiago', 'Alameda', '123');

    expect(result).toEqual({ postalCode: '7654321' });

    expect(page.goto).toHaveBeenCalledWith(
      'https://www.correos.cl/codigo-postal',
      expect.objectContaining({ timeout: 30000 }),
    );
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(browser.newContext).toHaveBeenCalledTimes(1);
  });

  it('Returns an error when the button search is disabled.', async () => {
    const { browser, context } = buildPlaywrightMocks({
      searchBtnEnables: false,
    });
    (getBrowser as jest.Mock).mockResolvedValue(browser);

    let scrapePostalCode!: typeof ScrapeFn;

    await jest.isolateModulesAsync(async () => {
      ({ scrapePostalCode } = await import('./postal-code-scraper.util'));
    });

    const res = await scrapePostalCode('Santiago', 'Alameda', '123');

    expect(res.error).toMatch(/Search button did not become enabled/);
    expect(context.close).toHaveBeenCalledTimes(1);
  });
});
