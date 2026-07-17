# 第一章制作矩阵

> 内部制作表。对应 `chapter1-visualization-production-blueprint` 与精选参考 PDF。  
> 最后更新：2026-07-17

## 路由与小节 ID

| 小节 | ID | 交互 |
| --- | --- | --- |
| §1 数域 | `number-fields` | 数域透镜 + 系数合法性 |
| §2 一元多项式 | `univariate-polynomials` | 系数带工作台（固定相机图像） |
| §3 整除的概念 | `polynomial-divisibility` | 除法阶梯步进 |
| §4 最大公因式 | `gcd-polynomials` | 欧几里得瀑布 |
| §5 因式分解定理 | `factorization-theorem` | 因式树 × 数域切换 |
| §6 重因式 | `multiple-factors` | 根重数实验室（固定相机） |
| §7 多项式函数 | `polynomial-functions` | 代入机器 / 插值 |
| §8 实复因式分解 | `complex-real-factorization` | 共轭锁复平面 |
| §9 有理系数 | `rational-polynomials` | 有理根 + Eisenstein |
| §10 多元多项式 | `multivariate-polynomials` | 指数格点 |
| §11 对称多项式 | `symmetric-polynomials` | 变量交换与轨道 |

## 工程

- 课程引擎通用化：任意含对象小节的章节可走 overview / lesson 路由。
- 内容：`current/content/ch1-*.js`
- 视觉：`current/visuals/ch1/*`
- 精确有理多项式：`poly-math.js`
- 参考 PDF / 蓝图不进入公开站点路径。

## 验收红线（相对第二章踩坑）

- 全部公式走本地 KaTeX（`texInline` / `texDisplay`），禁止生肉 `a11` 式字符串。
- Canvas 舞台固定高度（340px），世界坐标锁定，禁止“点一下放大一次”。
- 交互 teardown 随路由离开；重置回到稳定初态。
- 学生页无“开发中 / 占位”用语。
