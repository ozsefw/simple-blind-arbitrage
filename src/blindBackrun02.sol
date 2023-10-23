// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "openzeppelin-contracts/access/Ownable.sol";
import "./interface/IUniswapV3Pair.sol";
import "./interface/IUniswapV2Pair.sol";

contract BlindBackrun02 is Ownable{

    address public immutable WETH_ADDRESS;

    IUniswapV2Pair uni_v2_pair;
    IUniswapV3Pair uni_v3_pair;
    uint critical_price_ratio; // 990*990*997
    uint sqrt_critical_prica_ratio_x32;
    int24 tick;
    int24 tick_spacing;
    uint128 uni_v2_liquidity;
    bool is_weth_zero;
    bool v3_to_v2;

    struct SwapCallBackData{
        // address token0;
        // address token1;
        address payer;
    }

    function execute_arbitrage(
        address _uni_v2_address,
        address _uni_v3_address,
        int24 _tick,
        int24 _tick_spacing,
        bool _v3_to_v2,
        bool _is_weth_zero,
        uint24 _v2_fee,      // 997
        uint24 _erc20_fee,   // 990
        uint24 _v3_fee,      // 990
        uint160 _sqrt_critical_ratio_x32, // \sqrt{v3_fee * erc20_fee * v2_fee}
        uint128 _uni_v2_liquidity_sqrt_ref,
        uint _percentage_to_pay_to_coinbase
    ) external onlyOwner{

        uni_v2_pair = IUniswapV2Pair(_uni_v2_address);
        uni_v3_pair = IUniswapV3Pair(_uni_v3_address);
        uni_v2_liquidity = cacl_uni_v2_liquidity(_uni_v2_liquidity_sqrt_ref);
        tick = _tick;
        tick_spacing = _tick_spacing;
        critical_price_ratio = uint(_v2_fee * _v3_fee * _erc20_fee);
        sqrt_critical_ratio_x32 = _sqrt_critical_ratio_x32;
        is_weth_zero = _is_weth_zero;
        v3_to_v2 = _v3_to_v2;

        // swap from v3 to v2, eth is token0
        if (_v3_to_v2){
            swap_from_v3_to_v2();
        }
        else{
            swap_from_v2_to_v3();
        }

        uint256 balanceAfter = IERC20(WETH_ADDRESS).balanceOf(address(this));
        require(balanceAfter > balanceBefore, "Arbitrage failed");
        uint profit = balanceAfter.sub(balanceBefore);

        console.log("profit", profit);

        uint profitToCoinbase = profit.mul(percentage_to_pay_to_coinbase).div(100);
        IWETH(WETH_ADDRESS).withdraw(profitToCoinbase);
        block.coinbase.transfer(profitToCoinbase);
    }

    function swap_from_v3_to_v2_2(){
        (uint160 best_v3_price ,uint v3_token_out)= cacl_best_v3_sqrt_price_x96_and_token_out();

        uni_v3_pair.swap(
            uni_v2_address,
            true,
            max_available_eth_amount,
            swap_price_in_v3
        );
        uint v2_eth_out = cacl_uni_v2_amount_out(v3_token_out);
        uni_v2_pair.swap(v2_eth_out, 0, address(this), "");
    }

    function cacl_best_v3_sqrt_price_x96_and_token_out() returns (uint160 sqrt_price_x96, uint token_out){
        while(true){
            (uint cur_final_v3_price, bool stop) = (cur_best_v3_price < last_v3_price) ?
                (cur_best_v3_price,true) : (last_v3_price, false);
            token_out += cur_liquidity*(cur_final_v3_price - cur_start_v3_price);
            if (stop){
                break;
            }
            cur_start_v3_price = cur_start_v3_price;
            // uint liquidity_net = get_net_liquidity();
            cur_liquidity += get_liquidity_net(); 
        }
    }

    function swap_from_v3_to_v2(){
        if (is_weth_zero){
            bool able_to_arbitarge = check_if_able_to_arbitarge(true, is_weth_zero);
            require(able_to_arbitarge, "no profit");

            uint v2_amount_out; 
            while (true){
                uint next_v3_lower_price = get_next_v3_lower_price_x96(uni_v3_address);
                uint best_v3_price = cacl_best_v3_arbitarge_price_x96(uni_v3_address, uni_v2_address);

                uint swap_price_in_v3 = (best_v3_price_x96 < next_v3_lower_price_x96) ?
                    best_v3_price_x96 : next_v3_lower_price_x96 ;

                // swap eth into uni_v3
                uni_v3_pair.swap(
                    uni_v2_address,
                    true,
                    max_available_eth_amount,
                    swap_price_in_v3
                );

                v2_amount_out = cacl_uni_v2_amount_out();
                // swap eth out from uni_v2
                uni_v2_pair.swap(v2_amount_out, 0, address(this), "");

                // reach final swap stage
                if (swap_price_in_v3 == best_v3_price){
                    break;
                }

                // v3 amount_in is not enough
                if (cur_uni_v3_price < swap_price_in_v3){
                    break;
                }
            }
        }
        // weth is not zero
        else{
            revert("v3_to_v2 weth_not_zero not support now");
        }
    }

    function cacl_uni_v2_amount_out() returns (uint amount_out){
        uint amount_in_erc20 = token_erc20.balanceOf(address(uni_v2_addr)); 
        (uint reserve_0, uint reserve_1, ) = uni_v2_pair.getReserves();

        (uint reserve_in, uint reserve_out) = is_weth_zero?
            (reserve_0, reserve_1):(reserve_1, reserve_0);

        uint amount_in = amount_in_erc20 - reserve_in;

        uint amount_in_with_fee = amount_in.mul(997);
        uint numerator = amount_in_with_fee.mul(reserve_out);
        uint denominator = reserve_in.mul(1000).add(amount_in_with_fee);
        amount_out = numerator / denominator;
    }

    function swap_from_v2_to_v3(){
        revert("v2_to_v3 not support now");
    }

    function get_next_v3_lower_price_x96() returns (uint160 sqrt_price_next_x96) {
        bool zero_for_one = is_weth_zero;
        (next_tick, ) = tickBitmap.nextInitializedTickWithinOneWord(
            uni_v3_pair,
            state_tick,
            tick_spacing,
            zero_for_one
        );

        sqrt_price_next_x96 = TickMath.getSqrtRatioAtTick(next_tick); 
    }

    function cacl_best_v3_arbitarget_price_x96() returns (uint160 best_price_x96){
        if (v3_to_v2){
            if (is_weth_zero){
                uint liquidity_v3 = uni_v3_pair.liquidity();
                uint numerator_1_x64 = (liquidity_a * sqrt_price_a_x64)/liquidity_b * erc20_fee * uni_v2_fee / 1e6;
                uint numerator_2_x64 = sqrt_price_b_64;
                uint numerator_x64 = numerator_1_x64 + numerator_2_x64;
                uint denominator_1_x32 = sqrt_critical_ratio_x32;
                uint denominator_2_x32 = ecr20_fee * uni_v2_fee * (liquidity_a<<32)/ (liuqidity_b * 1e6);
                uint denominator_x32 = denominator_1_x32 + denomitor_2_x32;
                uint best_price_x96 = (numerator_x64 / denominator_x32)<<64;
            }
            else{
                revert("not supprot yet");
            }
        }
        else{
            revert("not support yet");
        }
    }

    function cacl_uni_v2_liquidity(uint ref_num) returns (uint liquidity){
        (uint reserve0, uint reserve1, ) = uni_v2_pair.getReserves();
        liquidity_x64 = sqrt_x64(reserve_0*reserve_1, ref_num);
    }

    function sqrt_x64(uint112 n, uint112 ref) returns (uint res){
        uint init_n = (n << 128);
        uint next_n = (ref + init_n/ref)>>1;

        while (next_n < n){
            n = next_n;
            next_n = (n + init_n/n)>>1;
        }

        res = n;
    }

    function check_if_able_to_arbitarge(bool v3_to_v2, i) returns (bool){
        if(v3_to_v2){
            if (is_weth_zero){
                // example: price_v2/price_v3 > 0.99*0.99*0.997
                return v2_v3_price_ratio > critical_price_ratio;
            }
            else{
                return v2_v3_price_ratio < critical_price_ratio;
            }
        }
        else{
            if (is_weth_zero){
                // example: price_v3/price_v2 > 0.99*0.99*0.997
                revert ("check_if_able_to_arbitarge() not support");
            }
            else{
                revert ("check_if_able_to_arbitarge() not support");
            }
        }
    }

    function cacl_price_ratio_v2_to_v3() returns (uint){
    }

    // call from uniswap pool, so msg.sender is pool
    function uniswapV3SwapCallback(
        int256 _amount0Delta,
        int256 _amount1Delta,
        bytes calldata _data
    ) external {
        // console.log("callback: ", uint(amount0Delta), uint(amount1Delta));
        require(_amount0Delta > 0 || _amount1Delta > 0); // swaps entirely within 0-liquidity regions are not supported
        SwapCallBackData memory data = abi.decode(_data, (SwapCallBackData));

        if (_amount0Delta > 0){
            IERC20(data.token0).transferFrom(data.payer, msg.sender, uint(_amount0Delta));
        }
        if (_amount1Delta > 0){
            IERC20(data.token1).transferFrom(data.payer, msg.sender, uint(_amount1Delta));
        }
    }
}