import 'should';
import { TestBitGo, TestBitGoAPI } from '@bitgo/sdk-test';
import { BitGoAPI } from '@bitgo/sdk-api';

import { Hemi, Themi } from '../../src';

describe('Hemi', function () {
  let bitgo: TestBitGoAPI;

  before(function () {
    bitgo = TestBitGo.decorate(BitGoAPI, { env: 'test' });
    bitgo.safeRegister('hemi', Hemi.createInstance);
    bitgo.safeRegister('themi', Themi.createInstance);
    bitgo.initializeTestVars();
  });

  describe('Basic Coin Info', function () {
    it('should return the right info for hemi', function () {
      const hemi = bitgo.coin('hemi');

      hemi.should.be.an.instanceof(Hemi);
      hemi.getChain().should.equal('hemi');
      hemi.getFamily().should.equal('hemi');
      hemi.getFullName().should.equal('Hemi Network');
      hemi.getBaseFactor().should.equal(1e18);
    });

    it('should return the right info for themi', function () {
      const themi = bitgo.coin('themi');

      themi.should.be.an.instanceof(Themi);
      themi.getChain().should.equal('themi');
      themi.getFamily().should.equal('hemi');
      themi.getFullName().should.equal('Testnet Hemi Network');
      themi.getBaseFactor().should.equal(1e18);
    });
  });

  describe('TSS Support', function () {
    it('should support TSS for hemi', function () {
      const hemi = bitgo.coin('hemi');
      hemi.supportsTss().should.be.true();
    });

    it('should support TSS for themi', function () {
      const themi = bitgo.coin('themi');
      themi.supportsTss().should.be.true();
    });

    it('should use ECDSA MPC algorithm', function () {
      const hemi = bitgo.coin('hemi');
      hemi.getMPCAlgorithm().should.equal('ecdsa');
    });
  });

  describe('Address Validation', function () {
    it('should validate valid addresses', function () {
      const hemi = bitgo.coin('hemi');
      hemi.isValidAddress('0x1234567890123456789012345678901234567890').should.be.true();
      hemi.isValidAddress('0xabcdef0123456789abcdef0123456789abcdef01').should.be.true();
    });

    it('should reject invalid addresses', function () {
      const hemi = bitgo.coin('hemi');
      hemi.isValidAddress('invalid').should.be.false();
      hemi.isValidAddress('0x123').should.be.false();
      hemi.isValidAddress('').should.be.false();
    });
  });

  describe('Message and TypedData Signing', function () {
    it('should support message signing', function () {
      const hemi = bitgo.coin('hemi');
      hemi.supportsMessageSigning().should.be.true();
    });

    it('should support signing typed data', function () {
      const hemi = bitgo.coin('hemi');
      hemi.supportsSigningTypedData().should.be.true();
    });
  });
});
