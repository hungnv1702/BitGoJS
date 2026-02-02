import EthereumCommon from '@ethereumjs/common';
import { coins, EthereumNetwork } from '@bitgo/statics';

export const testnetCommon = EthereumCommon.custom(
  {
    name: 'hemi sepolia',
    networkId: (coins.get('themi').network as EthereumNetwork).chainId,
    chainId: (coins.get('themi').network as EthereumNetwork).chainId,
  },
  {
    baseChain: 'sepolia',
    hardfork: 'london',
    eips: [1559],
  }
);

export const mainnetCommon = EthereumCommon.custom(
  {
    name: 'hemi',
    networkId: (coins.get('hemi').network as EthereumNetwork).chainId,
    chainId: (coins.get('hemi').network as EthereumNetwork).chainId,
  },
  {
    baseChain: 'mainnet',
    hardfork: 'london',
    eips: [1559],
  }
);
