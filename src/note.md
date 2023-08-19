### 如何在合约内计算 $\sqrt{P_{A}^{'}}$

$$\sqrt{P_{A}^{'}} = \frac{M\sqrt{P_A} + \sqrt{P_B}}{\sqrt{C} + M}$$

$$\sqrt{C} = F_A * F_B$$
- $F_A$ A的手续费
- $F_B$ B的手续费 * erc_20转账的手续费

$$ M = \frac{F_B * L_A}{L_B} $$

> 如果直接计算, 很有可能出现溢出的情况, 对于$\sqrt{P_{A}^{'}}$, 上半部分使用64位表示小数部分, 下半部分用32位表示小数部分, 计算完之后, 结果有32位小数部分, 精度应该足够了

# 08.11
## 开根号的算法 [链接](https://learnblockchain.cn/question/60)
 - t02.py/show_sqrt()
    $$x_{n+1} = \frac{1}{2}(x_n + \frac{M}{x_n})$$

 - 以100为例，计算查找过程 100，50，26，14，10

## 算法原理和计算机中处理的情况 t02.py/show_test06()

## 合约内开根号的gas费的消耗, 如何对这个算法进行优化
 - AB.sol/sqrt_test()
 - t02.py/show_test03()

## 计算uni_v2的liquidity
 - 线下计算好通过参数传入
 - access_list读取

## 如何计算uni_v2的sqrt_price_x96
 $$ \sqrt{\frac{y}{x}} \times 2^{96}$$
 $$ \sqrt{\frac{y \times 2^{192}}{x}} $$
  - 方案1 $ \sqrt{y \times 2^{144}} \times 2^{24} $
  - 方案2 计算的时候，把uni_v3的价格简化成Q64.72的格式
  - 方案3 找到一个数n，满足 $y \times 2^{2n} <= 2^{256} < y \times 2^{2(n+1)}$

## 公式推导

如果 $$ a < x^2 $$
那么 $$\frac{1}{2}(x + \frac{a}{x}) < x $$

## 原理解释
$$ x \geq \sqrt{M}$$
$$\frac{1}{2}(x + \frac{M}{x}) \leq x $$

- 曲线最小值是 $ \sqrt{M} $
$$ (x-y)^2 \geq 0$$
$$ x^2 -2xy + y^2 \geq 0$$
$$ x^2 + y^2 \geq 2xy $$
$$ \frac{1}{2}(x + \frac{M}{x}) \geq  \sqrt{M} $$

# 08.04
### 如何在同样的流动性范围内进行swap
### 如何获取同样流动性范围内的价格极限值
### 在当前区域内如何计算最佳价格

$$\sqrt{P_{A}^{'}} = \frac{M\sqrt{P_A} + \sqrt{P_B}}{\sqrt{C} + M}$$

$$\sqrt{C} = F_A * F_B$$
- $F_A$ A的手续费
- $F_B$ B的手续费 * erc_20转账的手续费

$$ M = \frac{F_B * L_A}{L_B} $$


### amount_in对比(印象笔记7.21)
