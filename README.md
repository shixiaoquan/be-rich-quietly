# 悄悄变富 - 静俏俏观看自己的财富密码

欢迎使用 "悄悄变富" VS Code 插件！这个插件可以帮助你在 VS Code 状态栏中实时查看你关注的股票价格，让你在编写代码的同时，静俏俏地关注自己的财富密码。

## 功能

- 实时获取并显示你关注的股票价格
- 支持多个股票代码
- 随机化请求，避免被目标网站检测和阻止

## 安装

1. 打开 VS Code
2. 进入扩展视图 (`Ctrl+Shift+X`)
3. 搜索并找到 "悄悄变富" 插件
4. 点击 "安装" 按钮

## 使用方法

1. 安装插件后，打开 VS Code 设置 (`Ctrl+,`)
2. 搜索 `stockPrice.stockCodes` 并添加你关注的股票代码列表，例如：`["AAPL", "GOOGL", "MSFT"]`
3. 在状态栏中查看实时更新的股票价格

## 配置项

此扩展提供以下配置项：

- `stockPrice.stockCodes`: 设置你关注的股票代码列表

## 已知问题

- 某些情况下，可能会由于网络问题或目标网站的防护机制导致请求失败。

## 发行说明

### 1.0.0

- 初始版本发布，支持实时获取并显示多个股票代码的价格。

## 贡献

如果你有任何建议或发现了问题，欢迎提交 [Issue](https://github.com/your-repo/be-rich-quietly/issues) 或 [Pull Request](https://github.com/your-repo/be-rich-quietly/pulls)。

## 许可证

[MIT](LICENSE)

---

## 扩展开发指南

确保你已经阅读并遵循了扩展开发的最佳实践：

* [扩展开发指南](https://code.visualstudio.com/api/references/extension-guidelines)

## Markdown 使用指南

你可以使用 Visual Studio Code 编写你的 README。以下是一些有用的编辑器快捷键：

* 分割编辑器 (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* 切换预览 (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* 按 `Ctrl+Space` (Windows, Linux, macOS) 查看 Markdown 片段列表。

## 更多信息

* [Visual Studio Code 的 Markdown 支持](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown 语法参考](https://help.github.com/articles/markdown-basics/)

**享受编程的乐趣，同时静俏俏地变富！**