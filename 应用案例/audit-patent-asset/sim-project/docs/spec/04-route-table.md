# 04 - 路由表 (技术规格)

> 本文档定义前端路由配置，覆盖路径、组件、权限、布局等。

---

## 1. 文档说明

本文档基于需求模型中的 4 个页面生成路由表，作为前端路由配置的依据。

---

## 2. 路由总表

| 路由路径 | 页面 ID | 页面名称 | 页面类型 | 关联实体 | 允许角色 |
|---------|---------|---------|---------|---------|---------|
| /patent-assets | P01 | patent-asset-list | CRUD 列表页 | patent-asset | 企业IPR / 资产经理 / 银行风控 |
| /patent-assets/:id | P02 | patent-asset-detail | 详情页 | patent-asset | 企业IPR / 资产经理 / 银行风控 |
| /patent-assets/:id/evaluate | P03 | patent-asset-evaluate | 表单页 | patent-asset | 企业IPR / 资产经理 / 银行风控 |
| /patent-assets/dashboard | P04 | asset-dashboard | 仪表盘页 | patent-asset | 企业IPR / 资产经理 / 银行风控 |

---

## 3. 路由配置示例

```typescript
// router/routes.ts
import { lazy } from "react";

const P01Page = lazy(() => import("@/pages/P01"));
const P02Page = lazy(() => import("@/pages/P02"));
const P03Page = lazy(() => import("@/pages/P03"));
const P04Page = lazy(() => import("@/pages/P04"));

export const routes = [
  {
    path: "/patent-assets",
    element: <P01Page />,
    meta: {
      pageId: "P01",
      title: "patent-asset-list",
      entity: "patent-asset",
      type: "crud_list",
    },
  },
  {
    path: "/patent-assets/:id",
    element: <P02Page />,
    meta: {
      pageId: "P02",
      title: "patent-asset-detail",
      entity: "patent-asset",
      type: "detail_view",
    },
  },
  {
    path: "/patent-assets/:id/evaluate",
    element: <P03Page />,
    meta: {
      pageId: "P03",
      title: "patent-asset-evaluate",
      entity: "patent-asset",
      type: "form_page",
    },
  },
  {
    path: "/patent-assets/dashboard",
    element: <P04Page />,
    meta: {
      pageId: "P04",
      title: "asset-dashboard",
      entity: "patent-asset",
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T10:12:23.241Z）
