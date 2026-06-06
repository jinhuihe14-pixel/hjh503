# 🌸 花艺工作室全栈管理系统

一套完整的花艺工作室管理系统，包含**客户下单H5**、**花艺师移动端H5**、**老板管理后台**三个端，覆盖订单管理、花材库存、薪资核算、数据统计等核心业务。

## ✨ 功能特性

### 🎯 业务覆盖
- **三大业务板块**：日常零售花束、节日预定单、婚礼花艺布置
- **两类花艺师岗位**：花艺制作、场地布置
- **薪资结算方式**：成品花束计件 + 布置项目提成 + 全勤绩效

### 📱 客户下单H5
- 花束浏览与分类筛选
- 在线下单，填写款式、取花时间
- 订单状态实时追踪
- 个人中心管理

### 💐 花艺师移动端H5
- 工作台数据概览
- 订单接单与制作进度更新
- 线上申领花材，自动扣减库存
- 损耗鲜花报废台账录入
- 薪资明细查询

### 🖥️ 老板管理后台
- **数据仪表盘**：今日订单、待排单、本月营收、低库存预警
- **订单管理**：订单列表、指派花艺师、状态流转
- **产品管理**：花束产品CRUD、计件单价配置
- **库存管理**：花材管理、库存流水、智能补货
- **领料管理**：领料申请审核、自动扣减库存
- **报废管理**：花材报废审批、损耗统计
- **采购管理**：采购单管理、一键入库
- **花艺师管理**：人员信息、岗位、薪资配置
- **薪资管理**：自动核算计件工资、全勤奖惩、手动调整锁定
- **数据统计**：营收趋势、产品销量排行、花艺师业绩、损耗率分析

## 🏗️ 技术架构

### 后端
- **框架**：Node.js + Express
- **数据库**：PostgreSQL
- **ORM**：Sequelize
- **认证**：JWT
- **其他**：bcryptjs、dayjs

### 管理后台
- **框架**：React 18 + Vite
- **UI组件**：Ant Design 5
- **图表**：ECharts
- **路由**：React Router v6
- **HTTP**：Axios

### 客户端H5 / 花艺师H5
- **框架**：React 18 + Vite
- **UI组件**：Ant Design Mobile
- **路由**：React Router v6
- **HTTP**：Axios

## 📁 项目结构

```
flower-studio-system/
├── packages/
│   ├── server/          # 后端 API 服务
│   │   ├── src/
│   │   │   ├── config/      # 配置文件
│   │   │   ├── models/      # 数据模型
│   │   │   ├── controllers/ # 控制器
│   │   │   ├── routes/      # 路由
│   │   │   ├── middleware/  # 中间件
│   │   │   └── seeders/     # 种子数据
│   │   └── package.json
│   │
│   ├── admin/           # 管理后台
│   │   ├── src/
│   │   │   ├── pages/       # 页面组件
│   │   │   ├── layout/      # 布局组件
│   │   │   ├── api/         # API 封装
│   │   │   └── utils/       # 工具函数
│   │   └── package.json
│   │
│   ├── customer-h5/     # 客户下单H5
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   ├── api/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   └── florist-h5/      # 花艺师端H5
│       ├── src/
│       │   ├── pages/
│       │   ├── api/
│       │   └── utils/
│       └── package.json
│
├── package.json         # Monorepo 根配置
└── README.md
```

## 🚀 快速开始

### 环境要求
- Node.js >= 16.x
- PostgreSQL >= 12.x
- Yarn 或 npm

### 1. 安装依赖

```bash
# 根目录执行
yarn install
# 或
npm install
```

### 2. 配置数据库

1. 创建 PostgreSQL 数据库 `flower_studio`
2. 复制并修改后端环境变量

```bash
cd packages/server
cp .env.example .env
```

修改 `.env` 文件中的数据库连接信息：
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=flower_studio
DB_USER=postgres
DB_PASSWORD=your_password
```

### 3. 初始化数据

```bash
# 后端目录下执行
yarn seed
```

> 种子数据会自动创建以下测试账号：
> - 管理员：admin / 123456
> - 花艺师：florist1 / 123456（花艺制作）
> - 花艺师：florist2 / 123456（花艺制作）
> - 花艺师：decorator1 / 123456（场地布置）
> - 客户：customer1 / 123456

### 4. 启动服务

**启动后端服务（端口 3001）：**
```bash
yarn dev:server
```

**启动管理后台（端口 3002）：**
```bash
yarn dev:admin
```

**启动客户H5（端口 3003）：**
```bash
yarn dev:customer
```

**启动花艺师H5（端口 3004）：**
```bash
yarn dev:florist
```

## 📊 核心业务流程

### 订单流程
```
客户下单 → 待排单 → 管理员指派花艺师 → 花艺师接单 → 花艺师领料 →
制作中 → 完成制作 → 订单完成 → 自动计入业绩
```

### 库存流程
```
采购入库 → 库存增加 → 花艺师领料申请 → 管理员审核 → 自动扣减库存 →
库存低于安全线 → 自动生成采购清单 → 发起采购
```

### 薪资核算流程
```
订单完成 → 自动累计计件数量 → 月末一键核算 → 
自动计算：基本工资 + 计件工资 + 全勤奖 ± 奖惩 → 确认 → 锁定
```

## 🔐 权限角色

| 角色 | 说明 | 权限范围 |
|------|------|----------|
| admin | 管理员/老板 | 全部功能 |
| florist | 花艺师 | 订单查看、领料、报废登记、薪资查询 |
| customer | 客户 | 浏览商品、下单、查看自己的订单 |

## 📝 数据库表说明

- **users** - 用户表（管理员、花艺师、客户）
- **products** - 花束产品表
- **orders** - 订单表
- **flower_materials** - 花材物料表
- **stock_records** - 库存流水表
- **material_requisitions** - 领料单表
- **scrap_records** - 报废记录表
- **purchase_orders** - 采购单表
- **salary_records** - 薪资记录表
- **attendances** - 考勤表
- **wedding_projects** - 婚礼项目表

## 🎨 特色功能

1. **智能补货** - 库存低于安全线自动生成采购清单
2. **自动薪资核算** - 计件工资、全勤奖自动计算
3. **损耗率统计** - 按月统计各类花材损耗率，优化采购
4. **多端数据同步** - 三端数据实时同步
5. **薪资锁定** - 确认后的数据可锁定，防止误修改
6. **多维度统计** - 营收趋势、产品销量、花艺师业绩、损耗分析

## 📄 License

MIT
