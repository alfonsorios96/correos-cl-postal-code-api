import { Page } from 'playwright';
import { normalizeText } from './normalize-text.util';
import { getBrowser } from './browser-provider.util';
import { AppLogger } from '../common/logger/logger.service';

const logger = new AppLogger();
const CONTEXT = 'PostalCodeScraper';

function wait(seconds: number, msg = ''): Promise<void> {
  if (msg) logger.verbose(`[WAIT] ${msg} (${seconds}s)`, CONTEXT);
  return new Promise((res) => setTimeout(res, seconds * 1000));
}

async function autocompleteSelect(
  page: Page,
  selector: string,
  value: string,
): Promise<void> {
  await page.locator(selector).click();
  await wait(0.5);
  await page.locator(selector).fill(value);
  await wait(1.2);
  await page.keyboard.press('ArrowDown');
  await wait(0.3);
  await page.keyboard.press('Enter');
  await wait(1);
}

async function ensureAutocompleteSelected(
  page: Page,
  selector: string,
  expectedValue: string,
  label: string,
  maxRetries = 2,
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    await autocompleteSelect(page, selector, expectedValue);
    const actual = (await page.inputValue(selector)).trim().toUpperCase();
    logger.debug(`Verifying ${label}: attempt ${i + 1} → '${actual}'`, CONTEXT);
    if (actual.includes(expectedValue.toUpperCase())) return;
    logger.warn(`${label} value not correctly applied, retrying...`, CONTEXT);
  }
  throw new Error(
    `Failed to select ${label} correctly after ${maxRetries} attempts.`,
  );
}

async function ensureNumberFilled(
  page: Page,
  selector: string,
  value: string,
): Promise<void> {
  await page.locator(selector).fill(value);
  await wait(0.5);
  const filled = (await page.inputValue(selector)).trim();
  if (filled !== value.trim()) {
    throw new Error(
      `Number field not filled correctly: expected '${value}', got '${filled}'`,
    );
  }
}

export async function scrapePostalCode(
  commune: string,
  street: string,
  number: string,
): Promise<{ postalCode?: string; error?: string }> {
  const normalizedCommune = normalizeText(commune);
  const normalizedStreet = normalizeText(street);
  const normalizedNumber = normalizeText(number);

  logger.log(
    `Scraping started for: '${commune}', '${street}', '${number}'`,
    CONTEXT,
  );

  const browser = await getBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  try {
    logger.log('Opening Correos de Chile postal code page...', CONTEXT);
    await page.goto('https://www.correos.cl/codigo-postal', {
      timeout: 30000,
      waitUntil: 'domcontentloaded',
    });

    await page.waitForSelector('input#mini-search-form-text');
    await wait(1);

    await ensureAutocompleteSelected(
      page,
      'input#mini-search-form-text',
      normalizedCommune,
      'commune',
    );
    await ensureAutocompleteSelected(
      page,
      'input#mini-search-form-text-direcciones',
      normalizedStreet,
      'street',
    );
    await ensureNumberFilled(
      page,
      '#_cl_cch_codigopostal_portlet_CodigoPostalPortlet_INSTANCE_MloJQpiDsCw9_numero',
      normalizedNumber,
    );

    await page
      .locator("label[for='mini-search-form-text']")
      .click({ force: true });
    await wait(1);

    const searchBtn = page.locator(
      '#_cl_cch_codigopostal_portlet_CodigoPostalPortlet_INSTANCE_MloJQpiDsCw9_searchDirection',
    );
    for (let i = 0; i < 20; i++) {
      if (await searchBtn.isEnabled()) break;
      await wait(0.5);
      if (i === 19)
        throw new Error('Search button did not become enabled in time.');
    }

    await searchBtn.click({ force: true });
    await wait(2);

    const resultLocator = page.locator(
      '#_cl_cch_codigopostal_portlet_CodigoPostalPortlet_INSTANCE_MloJQpiDsCw9_ddCodPostal',
    );
    await resultLocator.waitFor({ state: 'visible', timeout: 15000 });

    const code = (await resultLocator.innerText()).trim();
    logger.log(`Postal code retrieved: ${code}`, CONTEXT);
    return { postalCode: code };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(
      `Scraper failed: ${message}`,
      (error as Error)?.stack,
      CONTEXT,
    );
    logger.debug(
      `Scraper context → commune: '${commune}', street: '${street}', number: '${number}'`,
      CONTEXT,
    );
    return { error: `Scraper failed: ${message}` };
  } finally {
    await context.close();
    logger.debug('Context closed after scraping', CONTEXT);
  }
}
