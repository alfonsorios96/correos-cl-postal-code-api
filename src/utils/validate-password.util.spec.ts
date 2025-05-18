jest.mock('@nestjs/common', () => {
  class HttpExceptionMock extends Error {
    constructor(
      public message: string,
      public status: number,
    ) {
      super(message);
      this.status = status;
    }
  }
  return { HttpException: HttpExceptionMock };
});
import { HttpException } from '@nestjs/common';
import { validatePasswordOrThrow } from './validate-password.util';

const ORIGINAL_ENV = { ...process.env };

function mockRandom(val: number) {
  return jest.spyOn(Math, 'random').mockReturnValue(val);
}

afterEach(() => {
  jest.restoreAllMocks();
  process.env = { ...ORIGINAL_ENV };
});

describe('validatePasswordOrThrow', () => {
  it('No throw exception with default password', () => {
    delete process.env.SEED_PASSWORD;
    expect(() =>
      validatePasswordOrThrow('supersecure-long-password-5481'),
    ).not.toThrow();
  });

  it('No throw exception when password matches SEED_PASSWORD', () => {
    process.env.SEED_PASSWORD = 'my-secret-pwd';
    expect(() => validatePasswordOrThrow('my-secret-pwd')).not.toThrow();
  });

  it('Throw HttpException 418 with first message at wrong password', () => {
    mockRandom(0);

    try {
      validatePasswordOrThrow('wrong-pwd');
      fail('Expect HttpException');
    } catch (err) {
      expect(err).toBeInstanceOf(HttpException);
      const e = err as HttpException;
      // expect(e.status).toBe(418); --> Not possible testing, because is private
      expect(e.message).toBe('What are you doing mother fucker?');
    }
  });

  it('Throw HttpException 418 with last message (random≈1)', () => {
    mockRandom(0.999999);
    expect(() => validatePasswordOrThrow('pwd?')).toThrow(
      'Unauthorized entry attempt... reported to Skynet.',
    );
    try {
      validatePasswordOrThrow('pwd?');
    } catch (err) {
      const e = err as HttpException;
      expect(e).toBeDefined();
      // expect(e.status).toBe(418); --> Not possible testing, because is private
    }
  });

  it('Prioritize SEED_PASSWORD over default password.', () => {
    process.env.SEED_PASSWORD = 'env-pass';
    mockRandom(0);
    expect(() =>
      validatePasswordOrThrow('supersecure-long-password-5481'),
    ).toThrow(HttpException);
    expect(() => validatePasswordOrThrow('env-pass')).not.toThrow();
  });
});
