# 工作流画板

基于 Vue 3 + Vite + Vue Flow 的前端工作流画板。支持多项目（每项目独立画板）、文本 / 图片 / 视频三种节点，以及鼠标拖拽连线。

## 功能

- **多项目**：首页创建 / 打开 / 删除项目，数据持久化到 `localStorage`
- **独立画板**：每个项目独立节点与连线状态
- **三种节点**：文本节点、图片上传节点、视频上传节点
- **连线工作流**：从节点左右端口拖拽连线，形成上下文关系
- **执行预留**：`src/services/workflowEngine.ts` 预留校验、拓扑排序与 `run` 接口

## 启动

```bash
npm install
npm run dev
```

## 目录

```
src/
  components/
    canvas/       # 画布与空状态
    layout/       # 顶栏 / 左侧工具栏 / 底栏
    nodes/        # 文本 / 图片 / 视频节点
  services/       # 工作流引擎预留接口
  stores/         # Pinia 项目管理
  types/          # 类型定义
  views/          # 项目列表 / 画板页
```
