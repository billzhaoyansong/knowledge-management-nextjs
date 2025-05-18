# Mathematical Optimization

## Convex Optimization

- Special Subclasses
  - Least-Square Problems
    - Analytical Solution: $x=(A^TA)^{-1}A^Tb$
  - Linear Programming Problems
    - Simplex Method
    - Interior Method

- Convex Functions
  - Conditions
    - Basic Conditions: $f\left(\theta x_1+(1-\theta)x_2\right)\leq\theta f(x_1)+(1-\theta)f(x_2), \forall x_1,x_2\in\text{dom}f$ and $0\leq\theta\leq1$
    - First-Order Conditions $f(x_2)\geq f(x_1)+\nabla f(x_1)^T(x_2-x_1)$
    - Second-Order Conditions $\nabla^2f\succeq0$
  - Typical Functions
    - on $R$
      - $e^{ax} \text{ convex on }R, \forall a\in R$
      - $x^{a} \text{ convex on }R_{++} \text{when } a\geq1 \text{ or } a\leq0$
      - $x^{a} \text{ concave on }R_{++} \text{when } 0\leq a\leq1$
      - $|x|^{p} \text{ convex on }R, \forall p\geq1$
      - $-\log{x} \text{ convex on } R_{++}$
      - $x\log{x} \text{ strictly convex on } R_{++}$
    - on $R^n$
      - $\Vert x\Vert_p=\left(\sum_{i=1}^n|x_i|^p\right)^{1/p},p\geq1$ is convex on $R^n$
      - $f(x)=\max\{x_1,...,x_n\}$ is convex on $R^n$
      - $f(x,y)=\frac{x^2}{y}, \text{with } \text{dom}f=R\times R_{++}=\{(x,y)\in R^2 | y>0\}$
      - $f(x)=\log\left(\sum_{k=1}^n e^{x_k}\right)$ on $R^n$
      - $f(x)=\left(\prod_{i=1}^n x_i\right)^{1/n} \text{ concave on } R^n_{++}$
  - Concepts
    - $\alpha$-sublevel sets
    - graph and epigraph:
      *surface and inner space of convex function (conversion between convex set and convex functions)*
    - Jensen's Inequality
      *Generalization of definition for convex function*
  - Operations
  - Conjugate
    - Geometric Intepretation
      - Difference between $yx$ and original $f(x)$
      - Shifting $yx$ downwards
- **strong** ~~del~~ *italic* ==highlight==
- multiline
  text
- `inline code`
-
    ```js
    console.log('code block');
    ```
- Katex
  - $x = {-b \pm \sqrt{b^2-4ac} \over 2a}$
  - [More Katex Examples](#?d=gist:af76a4c245b302206b16aec503dbe07b:katex.md)
- Now we can wrap very very very very long text based on `maxWidth` option

## Nonconvex Optimization

- No efficient methods
