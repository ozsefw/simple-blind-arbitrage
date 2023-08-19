// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import "./uni-v3/IUniswapV3PoolState.sol";
import "./uni-v3/IUniswapV3PoolImmutables.sol";
import "./uni-v3/IUniswapV3PoolActions.sol";

interface IUniswapV3Pair is
IUniswapV3PoolState,
IUniswapV3PoolImmutables,
IUniswapV3PoolActions
{}
