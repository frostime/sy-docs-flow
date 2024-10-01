## v0.12.0

- ✨ feat: 增加了大纲跳转功能

## v0.11.3

- 🐛 移动端无法正常打开 [#67](https://github.com/frostime/sy-docs-flow/issues/67)


## v0.10.0

- ✨ 支持执行 JS 查询[#61](https://github.com/frostime/sy-docs-flow/issues/61)

## v0.9.0

- 🔨 重构文档反链、提及的显示[#62](https://github.com/frostime/sy-docs-flow/issues/62)
- 🔨 使用 blockTree 关系来重构块的显示，当查询到列表块和引述块的第一个子段落块时，会完整显示其整个父容器块


## v0.8.0

- 使用了全局 css + class name 的方案，解决了之前滚动时 gutter 显示异常的 bug

## v0.7.2

- 允许用户更改文档流规则内部的 value 字段

## v0.7.1

- 调整工具栏样式
- 增加逆序展示的按钮
- 为 svg 按钮添加样式

## v0.7.0

- 重构 rule.next 为 rule.fetch
- 支持重载文档流


## v0.6.1

- ⚡ 优化拷贝文档流 `siyuan://` 超链接的一些不足细节
  - 拷贝的链接没有保存 title 和 config 的问题

## v0.6.0

- ✨ 通过 `siyuan://` 超链接直接打开某个文档流tab页 [#21](https://github.com/frostime/sy-docs-flow/issues/21)
   1. 在文档流界面中，增加按钮「复制链接」，点击后复制当前文档流的链接 (markdown 格式)
   2. 点击超链接，可以直接打开对应文档流 tab 页

## v0.5.2

- ✨ feat: saved-rules 对话框添加拖拽重排序功能

## v0.5.1

- fix: 优化文本框输入 [#55](https://github.com/frostime/sy-docs-flow/issues/55)


## v0.5.0

- 修复设置面板样式错误
- 「显示文档树」的规则改为深度优先顺序 [#53](https://github.com/frostime/sy-docs-flow/issues/53)
- 文档块菜单添加按钮，通过文档流打开文档的反链 [#34](https://github.com/frostime/sy-docs-flow/issues/34)
- 文档块菜单添加按钮，通过文档流打开文档的子文裆/文档树 [#30](https://github.com/frostime/sy-docs-flow/issues/30)


## v0.4.3

- 允许不显示文档标题 [#51](https://github.com/frostime/sy-docs-flow/issues/51)
- 显示列表项中的段落块时，自动显示完整的列表项 [#42](https://github.com/frostime/sy-docs-flow/issues/42)
- SQL 规则无法正常解析正则表达式的问题 [#40](https://github.com/frostime/sy-docs-flow/issues/40)


## v0.4.2

为滚轮动态加载增加了节流, 避免因为频繁触发而导致的奇怪行为

## v0.4.1

- 优化了显示方式, 对非文档块聚焦显示 fix [#31](https://github.com/frostime/sy-docs-flow/issues/31)
- 更换了非滚动模式的实现方式
    - fix [#28](https://github.com/frostime/sy-docs-flow/issues/28)
    - fix [#32](https://github.com/frostime/sy-docs-flow/issues/32)
    - fix [#33](https://github.com/frostime/sy-docs-flow/issues/33)
- 修复 SQL 规则的小 bug

## v0.4.0

- Fix bug: [#35](https://github.com/frostime/sy-docs-flow/issues/35)
- 增加设置功能, 允许用户配置文档流的默认选项
- 允许用户完整配置单个文档流内所有选项
- 更换了图标

## v0.3.0

- 支持文档动态加载
- 新的规则: 文档树下所有的文档

## v0.2.3

- fix

## v0.2.2

- fix: 分屏的tab中，菜单命令获取到的tab不是当前屏的tab，似乎是第一屏的tab [#25](https://github.com/frostime/sy-docs-flow/issues/25)

## v0.2.1

- 允许不显示文档顶栏 [#11](https://github.com/frostime/sy-docs-flow/issues/11)
- 将嵌入块在文档流中打开 [#20](https://github.com/frostime/sy-docs-flow/issues/20)
- 对外暴露 EventBus, 允许外部代码打开文档流 (见 README) [#22](https://github.com/frostime/sy-docs-flow/issues/22)
