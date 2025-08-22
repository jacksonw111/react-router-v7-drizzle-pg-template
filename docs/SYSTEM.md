# 系统设计 
架构：
React router v7 + pgsql + drizzle + better auth 
前后端一体化 


使用 better auth 来做登录认证和用户管理 

前端用户 => user + 角色： customer
后端用户 => user 角色和权限更加细化定义 
admin => 所有权限 
user-manager => 只有用户管理权限
business => 需要业务管理权限， 要可定义


同时需要引入 jwt 这样一来方便跟任何后端集成 

所以 better auth 要理解这几个方面
1. 前端如何跟 github / X / facebook / google 集成
2. 后端如何跟 admin / org / jwt 集成， 用户鉴权部分，定义权限，菜单等等
3. 共同部分： 更新用户资料， 忘记密码功能，重置密码， 注册， 登录功能， 验证码功能




路由定义 
/login 登录 
/register 注册
/forget-password 忘记密码
/reset-password 重置密码
/profile 个人用户信息/更新用户信息
/bo/dashboard 后端 dashboard
/bo/users 后端用户管理
/bo/roles 后端角色管理 / 权限配置 / 组织配置 
/bo/menus 后端菜单配置， 主要是针对一些业务菜单
/bo/settings 后端系统的设置， 比如说侧边栏，主题
 

认证逻辑
所以我们要实现3种全局情况
1. 已登录 跳转到首页
2. 未登录 跳转到登录页面
3. 跟登录状态无关 

已登录都要跳转到根目录： 
/login： 
  用户 -> 
    未登录: 邮箱密码登录/第三方登录 -> /login -> 成功后到根目录
    已登录: 再访问，直接跳转根目录

/register：
  用户 -> 
    未登录： 注册， 提示去邮箱验证， 异步发送邮件，跳转到登录页面
    已登录： 直接跳转根目录

/forget-password:
  用户 -> 
    未登录：显示输入邮箱，用户输入邮箱后，不管邮箱是否存在， 直接提示用户去邮箱接收邮件。 
      有2种情况
        有注册 -> 发送邮件 -> 用户点击邮件 -> 打开用户重置密码
        没注册 -> 不做任何操作

    已登录: 直接跳转根目录



未登录要跳转到登录页面
/profile：
  用户 ->
    未登录：跳转到登录页面
    已登录：显示/更新用户信息详情： name / email / 头像 / 其他自定义字段...

跟登录情况无关
/reset-password?token=xxxx
  用户 -> <一般是点击邮箱链接才能到这里>
    token是否存在
        不存在 -> 跳转首页
        存在 -> 让用户修改密码
    安全限制：
      token 有限期只能存在 24 小时。 


