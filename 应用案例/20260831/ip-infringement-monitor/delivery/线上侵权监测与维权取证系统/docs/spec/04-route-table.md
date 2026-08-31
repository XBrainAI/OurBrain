# 04 - 路由表 (技术规格)

> 本文档定义前端路由配置，覆盖路径、组件、权限、布局等。

---

## 1. 文档说明

本文档基于需求模型中的 6 个页面生成路由表，作为前端路由配置的依据。

---

## 2. 路由总表

| 路由路径 | 页面 ID | 页面名称 | 页面类型 | 关联实体 | 允许角色 |
|---------|---------|---------|---------|---------|---------|
| /dashboard | P01 | monitor-dashboard | 仪表盘页 | InfringementLead | 品牌方IPR / 维权律师 / 监测分析师 |
| /leads | P02 | infringement-leads | CRUD 列表页 | InfringementLead | 品牌方IPR / 维权律师 / 监测分析师 |
| /evidence | P03 | evidence-detail | 详情页 | EvidenceRecord | 品牌方IPR / 维权律师 / 监测分析师 |
| /cases | P04 | rights-cases | CRUD 列表页 | RightsCase | 品牌方IPR / 维权律师 / 监测分析师 |
| /rules | P05 | cross-border-rules | CRUD 列表页 | CrossBorderRule | 品牌方IPR / 维权律师 / 监测分析师 |
| /analytics | P06 | rights-analytics | 仪表盘页 | RightsCase | 品牌方IPR / 维权律师 / 监测分析师 |

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
      title: "monitor-dashboard",
      entity: "InfringementLead",
      type: "dashboard",
    },
  },
  {
    path: "/leads",
    element: <P02Page />,
    meta: {
      pageId: "P02",
      title: "infringement-leads",
      entity: "InfringementLead",
      type: "crud_list",
    },
  },
  {
    path: "/evidence",
    element: <P03Page />,
    meta: {
      pageId: "P03",
      title: "evidence-detail",
      entity: "EvidenceRecord",
      type: "detail_view",
    },
  },
  {
    path: "/cases",
    element: <P04Page />,
    meta: {
      pageId: "P04",
      title: "rights-cases",
      entity: "RightsCase",
      type: "crud_list",
    },
  },
  {
    path: "/rules",
    element: <P05Page />,
    meta: {
      pageId: "P05",
      title: "cross-border-rules",
      entity: "CrossBorderRule",
      type: "crud_list",
    },
  },
  {
    path: "/analytics",
    element: <P06Page />,
    meta: {
      pageId: "P06",
      title: "rights-analytics",
      entity: "RightsCase",
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-08-29T15:52:07.057Z）
