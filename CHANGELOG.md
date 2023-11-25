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
