/**
 * @prettier
 */
import 'should';
import { sanitize } from '../../../src/utils/sanitizeLog';

describe('Sanitize Log', () => {
  describe('Sensitive Keys', () => {
    it('should redact exact key matches (case-insensitive)', () => {
      const data = {
        token: 'secret-token',
        TOKEN: 'another-token',
        bearer: 'Bearer xyz123',
        password: 'mypassword',
        prv: 'xprv123456',
        privatekey: 'private-key-value',
        otp: '123456',
      };

      const result = sanitize(data);

      result.should.have.property('token', '<REMOVED>');
      result.should.have.property('TOKEN', '<REMOVED>');
      result.should.have.property('bearer', '<REMOVED>');
      result.should.have.property('password', '<REMOVED>');
      result.should.have.property('prv', '<REMOVED>');
      result.should.have.property('privatekey', '<REMOVED>');
      result.should.have.property('otp', '<REMOVED>');
    });

    it('should NOT redact keys that contain sensitive words but are not exact matches', () => {
      const data = {
        userToken: 'should-be-visible',
        _token: 'should-be-visible',
        tokenId: 'should-be-visible',
        myPassword: 'should-be-visible',
        privateKeyEncrypted: 'should-be-visible',
      };

      const result = sanitize(data);

      result.should.have.property('userToken', 'should-be-visible');
      result.should.have.property('_token', 'should-be-visible');
      result.should.have.property('tokenId', 'should-be-visible');
      result.should.have.property('myPassword', 'should-be-visible');
      result.should.have.property('privateKeyEncrypted', 'should-be-visible');
    });

    it('should preserve non-sensitive keys', () => {
      const data = {
        user: 'alice',
        publicKey: 'pub123',
        apiKey: 'api-key-123',
        metadata: 'some-data',
      };

      const result = sanitize(data);

      result.should.have.property('user', 'alice');
      result.should.have.property('publicKey', 'pub123');
      result.should.have.property('apiKey', 'api-key-123');
      result.should.have.property('metadata', 'some-data');
    });
  });

  describe('V2x Token Pattern', () => {
    it('should redact v2x tokens (32+ hex chars)', () => {
      const validV2xToken = 'v2xea99e123bba182f1360ad35529a7a6ae77cfc0bc4e5dcb4f88a6dd4e4bf6a8db';

      const result = sanitize(validV2xToken);
      result.should.equal('<REMOVED>');
    });

    it('should redact v2x tokens in object values', () => {
      const data = {
        accessToken: 'v2xea99e123bba182f1360ad35529a7a6ae77cfc0bc4e5dcb4f88a6dd4e4bf6a8db',
        user: 'alice',
      };

      const result = sanitize(data);

      result.should.have.property('accessToken', '<REMOVED>');
      result.should.have.property('user', 'alice');
    });

    it('should NOT redact short v2x-like strings', () => {
      const shortV2x = 'v2x123'; // Too short (< 32 hex chars)

      const result = sanitize(shortV2x);
      result.should.equal('v2x123');
    });

    it('should NOT redact v2x with non-hex characters', () => {
      const invalidV2x = 'v2xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz';

      const result = sanitize(invalidV2x);
      result.should.equal('v2xzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
    });

    it('should redact v2x tokens case-insensitively', () => {
      const upperV2x = 'V2XEA99E123BBA182F1360AD35529A7A6AE77CFC0BC4E5DCB4F88A6DD4E4BF6A8DB';

      const result = sanitize(upperV2x);
      result.should.equal('<REMOVED>');
    });
  });

  describe('Nested Objects', () => {
    it('should sanitize deeply nested objects', () => {
      const data = {
        user: {
          name: 'bob',
          credentials: {
            token: 'secret-token',
            otp: '123456',
            metadata: {
              password: 'deep-password',
              publicKey: 'pub123',
            },
          },
        },
      };

      const result = sanitize(data);

      result.user.name.should.equal('bob');
      result.user.credentials.token.should.equal('<REMOVED>');
      result.user.credentials.otp.should.equal('<REMOVED>');
      result.user.credentials.metadata.password.should.equal('<REMOVED>');
      result.user.credentials.metadata.publicKey.should.equal('pub123');
    });

    it('should handle mixed nested structures', () => {
      const data = {
        level1: {
          level2: {
            level3: {
              token: 'secret',
              safeData: 'visible',
            },
          },
        },
      };

      const result = sanitize(data);

      result.level1.level2.level3.token.should.equal('<REMOVED>');
      result.level1.level2.level3.safeData.should.equal('visible');
    });
  });

  describe('Arrays', () => {
    it('should sanitize objects in arrays', () => {
      const data = [
        { name: 'user1', password: 'pass1' },
        { name: 'user2', token: 'token2' },
        { name: 'user3', publicKey: 'pub3' },
      ];

      const result = sanitize(data);

      result[0].name.should.equal('user1');
      result[0].password.should.equal('<REMOVED>');
      result[1].name.should.equal('user2');
      result[1].token.should.equal('<REMOVED>');
      result[2].name.should.equal('user3');
      result[2].publicKey.should.equal('pub3');
    });

    it('should sanitize v2x tokens in arrays', () => {
      const data = ['v2xea99e123bba182f1360ad35529a7a6ae77cfc0bc4e5dcb4f88a6dd4e4bf6a8db', 'safe-string', 'v2x123'];

      const result = sanitize(data);

      result[0].should.equal('<REMOVED>');
      result[1].should.equal('safe-string');
      result[2].should.equal('v2x123');
    });

    it('should handle nested arrays', () => {
      const data = [[{ token: 'secret1' }], [{ token: 'secret2' }, { password: 'secret3' }]];

      const result = sanitize(data);

      result[0][0].token.should.equal('<REMOVED>');
      result[1][0].token.should.equal('<REMOVED>');
      result[1][1].password.should.equal('<REMOVED>');
    });
  });

  describe('Circular References', () => {
    it('should handle circular references without infinite loops', () => {
      const data: any = {
        user: 'alice',
        token: 'secret',
      };
      data.self = data; // Circular reference

      const result = sanitize(data);

      result.user.should.equal('alice');
      result.token.should.equal('<REMOVED>');
      result.self.should.equal('[Circular]');
    });

    it('should handle deeply nested circular references', () => {
      const data: any = {
        level1: {
          level2: {
            token: 'secret',
          },
        },
      };
      data.level1.level2.circular = data.level1;

      const result = sanitize(data);

      result.level1.level2.token.should.equal('<REMOVED>');
      result.level1.level2.circular.should.equal('[Circular]');
    });
  });

  describe('Max Depth Protection', () => {
    it('should stop recursion at max depth', () => {
      // Create a deeply nested object (51 levels)
      let data: any = { value: 'deepest' };
      for (let i = 0; i < 51; i++) {
        data = { nested: data };
      }

      const result = sanitize(data);

      // Should have stopped at depth 50
      let current = result;
      let depth = 0;
      while (current.nested && depth < 60) {
        current = current.nested;
        depth++;
      }

      // Should hit '[Max Depth]' at level 50
      (typeof current === 'string' && current === '[Max Depth]').should.be.true();
    });
  });

  describe('Primitives', () => {
    it('should handle null and undefined', () => {
      const nullResult = sanitize(null);
      const undefinedResult = sanitize(undefined);

      (nullResult === null).should.be.true();
      (undefinedResult === undefined).should.be.true();
    });

    it('should handle numbers, booleans, and safe strings', () => {
      sanitize(123).should.equal(123);
      sanitize(true).should.equal(true);
      sanitize(false).should.equal(false);
      sanitize('safe-string').should.equal('safe-string');
    });

    it('should redact v2x token strings', () => {
      const token = 'v2xea99e123bba182f1360ad35529a7a6ae77cfc0bc4e5dcb4f88a6dd4e4bf6a8db';
      sanitize(token).should.equal('<REMOVED>');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty objects', () => {
      const result = sanitize({});
      Object.keys(result).length.should.equal(0);
    });

    it('should handle empty arrays', () => {
      const result = sanitize([]);
      result.length.should.equal(0);
    });

    it('should handle objects with null values', () => {
      const data = {
        token: null,
        user: 'alice',
      };

      const result = sanitize(data);

      result.token.should.equal('<REMOVED>'); // Key is sensitive, even if value is null
      result.user.should.equal('alice');
    });

    it('should handle mixed data types', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 2, 3],
        object: { nested: 'value' },
        token: 'secret',
      };

      const result = sanitize(data);

      result.string.should.equal('text');
      result.number.should.equal(42);
      result.boolean.should.equal(true);
      (result.null === null).should.be.true();
      result.array.should.deepEqual([1, 2, 3]);
      result.object.should.deepEqual({ nested: 'value' });
      result.token.should.equal('<REMOVED>');
    });
  });
});
