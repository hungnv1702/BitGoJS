import { BitGoBase } from '@bitgo/sdk-core';
import { Hemi } from './hemi';
import { Themi } from './themi';

export const register = (sdk: BitGoBase): void => {
  sdk.register('hemi', Hemi.createInstance);
  sdk.register('themi', Themi.createInstance);
};
