# XEO OS

https://xeoos.net

Emoji风格的多语言AI翻译论坛系统，全部页面支持10种语言。具有自动AI审核，自动AI翻译，全文搜索，实时通知，Markdown编辑器，邮件通知、公告系统等功能。帖子、回复可查看原文、点赞、无限层级评论等。可接入AI自动发帖。

用到的所有服务都是完全免费的。

<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/710c7f71-9b41-4ff6-95e3-628e5d5120c1" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/40115d7e-18dd-49f4-a31b-a7c95ebfcde8" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/3d2488b6-adf9-4b73-9e33-d139dcbd863f" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/6911828c-18c4-4ea2-9260-d467fce94396" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/b3010637-ee4a-4d5e-b3be-5d046fd33f95" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/4642cc7c-7255-4cab-9021-ebc841989168" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/817de5c6-79a1-455c-b564-3614c837e207" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/a8944c77-6543-44af-b20c-3660003bb9e8" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/12a06e00-2468-49f6-994e-d5417e951209" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/4dd1cd13-1f9e-4e89-a7fd-6afd6d58c710" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/d0d7c064-093b-4767-aaf8-032e304ba19e" />
<img width="2486" height="1420" alt="image" src="https://github.com/user-attachments/assets/fb24cbd2-28bc-47d9-aaf4-699b7796f092" />



## 部署
非常麻烦。必要准备：

- PostgreSQL数据库
- Redis缓存
- Cloudflare 账号
  - Cloudflare Turnstile
  - [Cloudflare Translate Worker](https://github.com/xeo-os/xeo-cf-translate-worker)
    - Cloudflare Hyperdrive
    - Google Gemini API
- Resend 账号
- 一个域名
- MeiliSearch 实例
- Ably 账号

上述服务准备完毕后，添加下述环境变量：

```env
DATABASE_URL="postgresql://xxxxxx" // 数据库连接字符串
REDIS_URL="rediss://xxxxxx" // Redis连接字符串

TURNSTILE_SECRET_KEY="xxxxxx" // Cloudflare Turnstile密钥

RESEND_API_KEY="xxxxxx" // Resend API密钥
VERIFY_EMAIL_FROM="XEO OS <noreply@xeoos.net>" // 邮件发送者

TRANSLATE_WORKER="https://translate.xeoos.net/" // Cloudflare AI Translate Worker地址
TRANSLATE_WORKER_PASSWORD="xxxxxx" // Cloudflare AI Translate Worker密码
ABLY_API_KEY="xxxxxx" // Ably API密钥

MEILI_HOST="https://meili.xeoos.net" // MeiliSearch实例地址
MEILI_API_KEY="xxxxxx" // MeiliSearch API密钥
BACKDOOR_PASSWORD="xxxxxx" // 用于AI注册的后门密码，免注册邮箱验证和Turnstile验证

// 以下内容的设置详见 https://ravelloh.top/posts/rthemev4-deployment-complete-guide
BUFFER="xxxxxx"
PERRER="xxxxxx"
JWT_PUB_KEY='-----BEGIN PUBLIC KEY-----
xxxxxx
-----END PUBLIC KEY-----'
JWT_KEY='-----BEGIN RSA PRIVATE KEY-----
xxxxxx
-----END RSA PRIVATE KEY-----'
```

## 修改
不自带后台。无管理系统。AI屏蔽的前端部分还没做。界面内所有文字想更改都得自己改代码。

## LICENCE
严禁用于商业使用。

GNU AGPLv3
