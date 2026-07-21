# 04 - 路由表 (技术规格)

> 本文档定义前端路由配置，覆盖路径、组件、权限、布局等。

---

## 1. 文档说明

本文档基于需求模型中的 3 个页面生成路由表，作为前端路由配置的依据。

---

## 2. 路由总表

| 路由路径 | 页面 ID | 页面名称 | 页面类型 | 关联实体 | 允许角色 |
|---------|---------|---------|---------|---------|---------|
| /green-patents | P01 | green-patent-list | CRUD 列表页 | green-patent | 企业IPR / 绿色技术研究员 / 布局规划师 |
| /green-patents/:id | P02 | green-patent-detail | 详情页 | green-patent | 企业IPR / 绿色技术研究员 / 布局规划师 |
| /green-patents/form | P03 | green-patent-layout | 表单页 | green-patent | 企业IPR / 绿色技术研究员 / 布局规划师 |

---

## 3. 路由配置示例

```typescript
// router/routes.ts
import { lazy } from "react";

const P01Page = lazy(() => import("@/pages/P01"));
const P02Page = lazy(() => import("@/pages/P02"));
const P03Page = lazy(() => import("@/pages/P03"));

export const routes = [
  {
    path: "/green-patents",
    element: <P01Page />,
    meta: {
      pageId: "P01",
      title: "green-patent-list",
      entity: "green-patent",
      type: "crud_list",
    },
  },
  {
    path: "/green-patents/:id",
    element: <P02Page />,
    meta: {
      pageId: "P02",
      title: "green-patent-detail",
      entity: "green-patent",
      type: "detail_view",
    },
  },
  {
    path: "/green-patents/form",
    element: <P03Page />,
    meta: {
      pageId: "P03",
      title: "green-patent-layout",
      entity: "green-patent",
      type: "form_page",
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

> 本文档由 generate-prd.mjs (v5.2.2) 基于 requirement-model.yaml 自动生成（2026-07-21T09:57:34.143Z）
