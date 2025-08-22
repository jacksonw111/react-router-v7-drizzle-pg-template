# 概述 
React Router V7 融合了 remix，是一个服务器端渲染的框架。 分为服务器端和客户端，客户端为SPA准备。 

# 路由
路由的配置分为两部分
1. 配置路由
2. 文件路由
3. 混合路由
 
## 配置路由
以下是配置型的路由
```ts
import {
  type RouteConfig,
  route,
  index,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  index("./home.tsx"),   // index 表示主页， 也就是根路由
  route("about", "./about.tsx"),   // 普通的路由由两部分组成： URL + file path 

  layout("./auth/layout.tsx", [    // 框架型路由组成： File path + 数组。 注意这里layout 不加入路由组成
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [         // 前缀路由， URL + 数组组成。 
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;

```

## 文件型路由

```ts
import { type RouteConfig } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default flatRoutes({
  ignoredRouteFiles: [],
}) satisfies RouteConfig;

```

文件夹结构一般为如下
```
- routes 
    - login.tsx  ==> /login 
    - _layout.admin.users.tsx ==> /admin/users 
```
不当作路由的我们需要用 `_` 开头 


## 混合路由 
```ts
import {
  type RouteConfig,
  route,
} from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  route("/", "./home.tsx"),

  ...(await flatRoutes()),
] satisfies RouteConfig;
```

路由最主要的点在于嵌套路由的问题， 很容易会忽视一个错误：
⚠️ /admin/users 和 /admin/users/:userId 有共享路由. 也就是说这两个路由，最后指向的都是 /admin/users 渲染出来的页面！所以我们需要非常注意，尤其是文件型路由！！
 
