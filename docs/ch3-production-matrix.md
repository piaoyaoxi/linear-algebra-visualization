# 第三章制作矩阵

> 内部制作表。对应 `chapter3-visualization-production-blueprint` 与精选参考 PDF。  
> 最后更新：2026-07-17

## 路由与小节 ID

| 小节 | ID | 交互 |
| --- | --- | --- |
| §1 消元法 | `elimination` | 消元手术台 |
| §2 n维向量空间 | `n-vector-space` | 坐标维数台 |
| §3 线性相关性 | `linear-dependence` | 冗余探测器 |
| §4 矩阵的秩 | `matrix-rank` | 秩观测台 |
| §5 有解判别 | `solvability` | 有解闸门 |
| §6 解的结构 | `solution-structure` | 解族生成器 |
| ＊§7 二元高次 | `binary-higher-degree` | 结式消元台 |

## 工程

- 课程引擎沿用通用结构化章节壳：任意含对象小节的章节可走 overview / lesson 路由。
- 内容：`current/content/ch3-*.js`
- 视觉：`current/visuals/ch3/*`
- 共享数学：`current/visuals/ch3/shared-math.js`（有理行变换、RREF、秩、零空间、预设）
- 参考 PDF 不进入公开站点路径。

## 主线

方程组 → 增广矩阵 → 行变换 → 主元/自由变量 → 列空间与秩 → 有解闸门 → 特解 + 零空间 → 高次消元
