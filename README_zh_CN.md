# 文档流插件

本插件的功能是将多个文档（块）拼接在同一个页面里，方便用户查看。

> 注意! 一次性打开特别多的文档可能会出现严重的性能问题，推荐使用「动态加载模式」

## 通过顶栏菜单打开文档流

启用插件后，点击顶栏的图标，并选择需要的规则来生成文档流。

1. 子文档

    点击后，将当前打开的文档及其子文档拼接成一个文档流。

2. 文档反链

    点击后，打开当前文档的所有反向链接

3. 文档提及

    点击后，打开当前文档的所有反向链提及（虚拟引用）


4. SQL 查询

    - 点击后，在弹窗内输入 sql 语句，将查询得到的块拼接成一个文档流（和嵌入块差不多）。
    - 注意：SQL 查询的结果会受到思源中最大查询数量的限制；如果想要摆脱限制，要么更改思源内部设置，或者手动增加 `limit` 字段。

5. 自定义 ID

    点击后，在弹窗内输入多个块 ID，ID 之间可以用空格、`\n`、`\t`、`,`隔开，这些 ID 对应的块将拼接成一个文档流。

6. 文档树

    将某个文档下属文档树内所有文档加入流中, 类似子文档

## 通过块菜单打开文档流

1. 点击一个 SQL 嵌入块的菜单，可以将 SQL 代码在文档流中打开

2. 点击一个文档块菜单，可以在文档流中打开

    - 文档的反链
    - 文档的子文裆
    - 文档下属的文档树

## 文档流内

1. 鼠标悬浮在文档流顶部可以唤出工具栏

    - 更多配置：见「文档流配置」
    - 命名页签：命名当前的文档流
    - 保存规则：保存当前文档流的规则
    - 复制链接：见「文档流超链接」

2. 点击每个文档的面包屑，可以打开对应的文档
3. 点击文档面包屑左侧图标，可以折叠文档，节省资源

## 文档流配置

每一个文档流页面都有一个对应的配置规则，用于控制文档流的显示行为。

你可以在插件的全局配置中配置默认的规则，也可以在文档流页面中配置当前文档流的独立规则。

基本规则如下：

- 滚动模式
  - 开启: 单个文档固定高度, 滚动加载其内部内容, 在单个文档较大时, 可以节省内存资源
  - 关闭: 加载全部的文档内容（类似 logseq 那样），在同时加载的文档数量较多时，可能会导致性能问题
- 展示折叠栏
- 展示文档标题
- 只读模式
- **动态加载**
  - 文档流内的文档随着上下滚动动态加载, 在文档数量较多时, 可以节省内存资源
- 动态加载容量
  - 动态加载过程中，一次最多加载的文档数量
- 动态加载增量
  - 开启动态加载后, 每次(上/下)滚动到边缘后继续加载多少文档

> 例如：某个文档下方有 10 篇子文裆，当我们开启了动态加载并设置容量、增量分别为 5、3时；第一次打开文档流时，会显示 1 ~ 5 号文档；当我们滚动到第 5 篇文档时，会动态加载显示 4 ~ 8 号文档。

## 文档流超链接

本插件支持通过超链接格式来快速在思源中打开对应的文档流。基本格式如下：

```
siyuan://plugins/sy-docs-flow/open-rule?ruleType=xxx&ruleInput=xxx
```

实际使用中，只需要两步:

1. 在文档流 tab 页面中，点击「复制链接」按钮，剪贴板中讲复制当前文档流的超链接（markdown格式）
2. 在编辑器中粘贴超链接，点击即可打开对应的文档流

## 开发者

本插件对外暴露特定的 Event 供外部的代码调用。调用方法如下:

1. 获取 `window.siyuan.ws.app.plugins` 下本插件的 `eventBus` 对象

    ```js
    window.siyuan.ws.app.plugins.find(p => p.name === 'sy-docs-flow')?.eventBus
    ```

2. 使用 `eventBus.emit(rule: TRuleType, e: CustomEventDetail)` 来发送打开文档流的请求

    ```ts
    type TRuleType = "SQL" | "IdList";
    interface CustomEventDetail {
        input: any;
        config?: object;
    }
    ```

    - `rule` 为 `IdList`, `input` 为 `BlockId[]`
    - `rule` 为 `SQL`, `input` 为 `string`

    config 参考 `IConfig` 类型

    ```ts
    interface IConfig {
        scroll: boolean;
        breadcrumb: boolean;
        readonly: boolean;
        dynamicLoading: {
            enabled: boolean;
            capacity: number;
            shift: number;
        };
    }
    ```

    config 的实例可以只选取 IConfig 当中的一部分, 剩余的部分会使用默认的配置。

    使用案例:
    ```js
    let eb = window.siyuan.ws.app.plugins.find(p => p.name === 'sy-docs-flow')?.eventBus;
    if (eb === undefined ) {
        return;
    }
    let detail = {
        input: "SELECT * FROM blocks ORDER BY random() LIMIT 3",
        config: {
            readonly: true,
            breadcrumb: false,
            dynamicLoading: {enabled: true}
        }
    };

    eb.emit("SQL", detail);
    ```
