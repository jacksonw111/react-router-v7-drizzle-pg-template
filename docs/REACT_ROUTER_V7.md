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
  index("./home.tsx"), // index 表示主页， 也就是根路由
  route("about", "./about.tsx"), // 普通的路由由两部分组成： URL + file path

  layout("./auth/layout.tsx", [
    // 框架型路由组成： File path + 数组。 注意这里layout 不加入路由组成
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    // 前缀路由， URL + 数组组成。
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
import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  route("/", "./home.tsx"),

  ...(await flatRoutes()),
] satisfies RouteConfig;
```

路由最主要的点在于嵌套路由的问题， 很容易会忽视一个错误：
⚠️ /admin/users 和 /admin/users/:userId 有共享路由. 也就是说这两个路由，最后指向的都是 /admin/users 渲染出来的页面！所以我们需要非常注意，尤其是文件型路由！！

# 路由的模式

所谓路由的模式，也就是说用户在一次请求页面中，我们可以操作的部分

## loader

```ts
export async function loader() {
  return { message: "Hello, world!" };
}

export default function MyRoute({ loaderData }) {
  return <h1>{loaderData.message}</h1>;
}
```

loader 函数会在界面渲染前调用， 只用于服务器端或者在build过程中，对于预渲染界面的数据获取。

## clientLoader

只用于浏览器端，所有关于node 服务器端的函数都不可用。

```ts
export async function clientLoader({ serverLoader }) {
  // call the server loader
  const serverData = await serverLoader();
  // And/or fetch data on the client
  const data = getDataFromClient();
  // Return the data to expose through useLoaderData()
  return data;
}
clientLoader.hydrate = true as const; // 在服务端渲染的时候，可以混合加载
```

## action

action 是服务器端的增删改操作，并且会自动触发 data load

```ts
// route("/list", "./list.tsx")
import { Form } from "react-router";
import { TodoList } from "~/components/TodoList";

// this data will be loaded after the action completes...
export async function loader() {
  const items = await fakeDb.getItems();
  return { items };
}

// ...so that the list here is updated automatically
export default function Items({ loaderData }) {
  return (
    <div>
      <List items={loaderData.items} />
      <Form method="post" navigate={false} action="/list">
        <input type="text" name="title" />
        <button type="submit">Create Todo</button>
      </Form>
    </div>
  );
}

export async function action({ request }) {
  const data = await request.formData();
  const todo = await fakeDb.addItem({
    title: data.get("title"),
  });
  return { ok: true };
}
```

主要由 `<Form>`, `useFetcher`, `useSubmit` 三种方式触发

什么时候使用？

1. useSubmit
   useSubmit 可以将表单数据提交给服务器， 但是这会导致浏览器的一个导航跳转。

2. useFetcher
   如果你不想多一个跳转或者导航的话， 你需要使用 useFetcher

```tsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/update-task/123">
      <input type="text" name="title" />
      <button type="submit">{busy ? "Saving..." : "Save"}</button>
    </fetcher.Form>
  );
}
```

3. Form
   Form 具体的使用跟 useSubmit 相同。 但是这里你必须使用 react-router 的 `<Form>` 标签。 如果你使用自定义的 `<form>` 标签，你需要使用 useSubmit 来提交数据。

## ErrorBoundary

```tsx
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
```

每个页面的组件最好都单独设置错误处理。提供更好的用户体验

## HydrateFallback

```tsx
export async function clientLoader() {
  const data = await fakeLoadLocalGameData();
  return data;
}

export function HydrateFallback() {
  return <p>Loading Game...</p>;
}

export default function Component({ loaderData }) {
  return <Game data={loaderData} />;
}
```

初始化页面的时候，往往需要一些 loading 的效果，这个时候可以使用 `HydrateFallback`。 它会在客户端 load 完数据之后，立马显示，然后再渲染页面。 提供一个比较好的用户交互体验

## Meta

用于 SEO， 我们可以为每个页面定义 Meta，主要用于 SEO优化

```ts
export function meta() {
  return [
    { title: "Very cool app" },
    {
      property: "og:title",
      content: "Very cool app",
    },
    {
      name: "description",
      content: "This app is the best",
    },
  ];
}
```

## links

```ts
export function links() {
  return [
    {
      rel: "icon",
      href: "/favicon.png",
      type: "image/png",
    },
    {
      rel: "stylesheet",
      href: "https://example.com/some/styles.css",
    },
    {
      rel: "preload",
      href: "/images/banner.jpg",
      as: "image",
    },
  ];
}
```

可以为不同的页面定义 links， 用于加载外部资源

## handle

用于跟 useMatches 配合， 比如用于一些面包屑导航

# 渲染策略

客户端渲染
服务器端渲染
静态资源渲染

# 导航

## NavLink

具有 `active` 样式的导航

## Link

普通的导航，不具有 `active` 样式

## Form

```ts
<Form action="/search">
  <input type="text" name="q" />
</Form>
```

会导航至

```
/search?q=journey
```

更加接近浏览器原生的导航， 可以结合 `nuqs` 使用， 也是SEO 优化

## redirect

常用于loaders 和 actions ，用于比如认证检查后的跳转等等

## useNavigate

用于浏览器中的跳转

# 待处理页面

前面我们在load 数据的时候会有一个 loading 的提示来提供给用户更好的交互体验，不会让用户觉得页面无响应。 同样的，当用户提交数据的时候，我们也需要提供一个待处理状态
比如说
1. 全局导航

```tsx
import { useNavigation } from "react-router";

export default function Root() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <html>
      <body>
        {isNavigating && <GlobalSpinner />}
        <Outlet />
      </body>
    </html>
  );
}
```

每次提交数据会有一个导航跳转，我们可以利用这个特点提供一个待处理的状态显示

2. 本地待定导航

```tsx
import { NavLink } from "react-router";

function Navbar() {
  return (
    <nav>
      <NavLink to="/home">
        {({ isPending }) => (
          <span>Home {isPending && <Spinner />}</span>
        )}
      </NavLink>
      <NavLink
        to="/about"
        style={({ isPending }) => ({
          color: isPending ? "gray" : "black",
        })}
      >
        About
      </NavLink>
    </nav>
  );
}
```
主要用于链接跟链接之间的跳转， 不会让用户觉得没有响应

3. 提交表格后
如果我们使用 fetcher ，那就没有跳转， 这个使用它自己提供了一个状态
```tsx
import { useFetcher } from "react-router";

function NewProjectForm() {
  const fetcher = useFetcher();

  return (
    <fetcher.Form method="post">
      <input type="text" name="title" />
      <button type="submit">
        {fetcher.state !== "idle"
          ? "Submitting..."
          : "Submit"}
      </button>
    </fetcher.Form>
  );
}
```


# 模板 
```shell
npx create-react-router@latest --template remix-run/react-router-templates/node-postgres
```