# 04 - 路由表 (技术规格)

> 本文档定义前端路由配置，覆盖路径、组件、权限、布局等。

---

## 1. 文档说明

本文档基于需求模型中的 6 个页面生成路由表，作为前端路由配置的依据。

---

## 2. 路由总表

| 路由路径 | 页面 ID | 页面名称 | 页面类型 | 关联实体 | 允许角色 |
|---------|---------|---------|---------|---------|---------|
| /dashboard | P01 | executive-dashboard | 仪表盘页 | PatentAsset | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |
| /patents | P02 | patent-ledger | CRUD 列表页 | PatentAsset | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |
| /valuations | P03 | valuation-center | CRUD 列表页 | ValuationRecord | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |
| /portfolio | P04 | portfolio-strategy | 详情页 | PatentAsset | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |
| /matches | P05 | match-channel | CRUD 列表页 | MatchDeal | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |
| /pledges | P06 | pledge-transfer | CRUD 列表页 | PledgeTransferRecord | 企业IPR（A级） / 资产经理（B级） / 银行风控（B级） / 高管（C级） |

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

export const routes = [
  {
    path: "/dashboard",
    element: <P01Page />,
    meta: {
      pageId: "P01",
      title: "executive-dashboard",
      entity: "PatentAsset",
      type: "dashboard",
    },
  },
  {
    path: "/patents",
    element: <P02Page />,
    meta: {
      pageId: "P02",
      title: "patent-ledger",
      entity: "PatentAsset",
      type: "crud_list",
    },
  },
  {
    path: "/valuations",
    element: <P03Page />,
    meta: {
      pageId: "P03",
      title: "valuation-center",
      entity: "ValuationRecord",
      type: "crud_list",
    },
  },
  {
    path: "/portfolio",
    element: <P04Page />,
    meta: {
      pageId: "P04",
      title: "portfolio-strategy",
      entity: "PatentAsset",
      type: "detail_view",
    },
  },
  {
    path: "/matches",
    element: <P05Page />,
    meta: {
      pageId: "P05",
      title: "match-channel",
      entity: "MatchDeal",
      type: "crud_list",
    },
  },
  {
    path: "/pledges",
    element: <P06Page />,
    meta: {
      pageId: "P06",
      title: "pledge-transfer",
      entity: "PledgeTransferRecord",
      type: "crud_list",
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-28T16:41:57.844Z）
