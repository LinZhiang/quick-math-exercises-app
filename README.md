# 口算练习（独立项目）

从「温故智学网」拆出的口算练习模块，可单独 `git init` 后推送到独立仓库。

## 功能

- 四则口算、2 的 n 次幂、平方与立方、估算分数
- 二十四点、数独、图形推理
- 练习攻略与键盘作答（1～5 选项）

## 开发

```bash
npm install
npm run dev
```

默认端口 **5174**（与主站 `my-learning-app` 的 5173 错开）。

## 与主站联动

主站 `my-learning-app` 菜单「口算练习」会通过环境变量跳转到本项目：

- 开发：`.env` 中 `VITE_QUICK_MATH_APP_URL=http://localhost:5174`
- 生产：部署本仓库静态资源后，将上述变量改为实际 URL

主站仍保留 `/tools/mental-math` 路由作重定向，兼容旧书签。

## 构建

```bash
npm run build
npm run preview
```
