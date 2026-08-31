# 04 - 路由表 (技术规格)

> 本文档定义前端路由配置，覆盖路径、组件、权限、布局等。

---

## 1. 文档说明

本文档基于需求模型中的 8 个页面生成路由表，作为前端路由配置的依据。

---

## 2. 路由总表

| 路由路径 | 页面 ID | 页面名称 | 页面类型 | 关联实体 | 允许角色 |
|---------|---------|---------|---------|---------|---------|
| /patents | P01 | patent-ledger | CRUD 列表页 | Patent | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /patents/:id | P02 | patent-detail | 详情页 | Patent | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /valuations | P03 | valuation | CRUD 列表页 | Valuation | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /fees | P04 | fee-monitor | CRUD 列表页 | AnnualFee | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /pledges | P05 | pledge-transfer | CRUD 列表页 | Pledge | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /portfolio | P06 | portfolio | 仪表盘页 | Portfolio | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /match | P07 | match | CRUD 列表页 | MatchDemand | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |
| /cockpit | P08 | executive-cockpit | 仪表盘页 | Patent | 企业IPR专员 / 资产经理 / 银行风控 / C级高管 |

---

## 3. 路由配置示例

```typescript
// router/routes.ts
import { lazy } from "react";

const P01Page = lazy(() => import("@/pages/P01"));
const P02Page = lazy(() => import("@/pages/P02"));
const P03Page = lazy(() => import("@/pages/P03"));
const P04Page = lazy(() => import("@/pages/P04"));
const P05Page = lazy(() => import("@/pages/P05"));
const P06Page = lazy(() => import("@/pages/P06"));
const P07Page = lazy(() => import("@/pages/P07"));
const P08Page = lazy(() => import("@/pages/P08"));

export const routes = [
  {
    path: "/patents",
    element: <P01Page />,
    meta: {
      pageId: "P01",
      title: "patent-ledger",
      entity: "Patent",
      type: "crud_list",
    },
  },
  {
    path: "/patents/:id",
    element: <P02Page />,
    meta: {
      pageId: "P02",
      title: "patent-detail",
      entity: "Patent",
      type: "detail_view",
    },
  },
  {
    path: "/valuations",
    element: <P03Page />,
    meta: {
      pageId: "P03",
      title: "valuation",
      entity: "Valuation",
      type: "crud_list",
    },
  },
  {
    path: "/fees",
    element: <P04Page />,
    meta: {
      pageId: "P04",
      title: "fee-monitor",
      entity: "AnnualFee",
      type: "crud_list",
    },
  },
  {
    path: "/pledges",
    element: <P05Page />,
    meta: {
      pageId: "P05",
      title: "pledge-transfer",
      entity: "Pledge",
      type: "crud_list",
    },
  },
  {
    path: "/portfolio",
    element: <P06Page />,
    meta: {
      pageId: "P06",
      title: "portfolio",
      entity: "Portfolio",
      type: "dashboard",
    },
  },
  {
    path: "/match",
    element: <P07Page />,
    meta: {
      pageId: "P07",
      title: "match",
      entity: "MatchDemand",
      type: "crud_list",
    },
  },
  {
    path: "/cockpit",
    element: <P08Page />,
    meta: {
      pageId: "P08",
      title: "executive-cockpit",
      entity: "Patent",
      type: "dashboard",
    },
  },
];
```

---

## 4. 路由守卫

```typescript
// router/guard.ts
export function requireAuth(to: RouteLocation, from: RouteLocation, next: Function) {
  const user = useUserStore();
  if (!user.isLoggedIn) {
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }
  // 检查角色权限
  const allowedRoles = to.meta?.allowedRoles as string[] | undefined;
  if (allowedRoles && !allowedRoles.some(r => user.roles.includes(r))) {
    next({ path: "/403" });
    return;
  }
  next();
}
```

---

## 5. 特殊路由

| 路由 | 用途 |
|------|------|
| /login | 登录页（无需鉴权） |
| /403 | 无权限页 |
| /404 | 未找到页 |
| / | 默认重定向到第一个有权限的页面 |



---

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-30T00:54:23.755Z）
