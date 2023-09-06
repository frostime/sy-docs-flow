# 文档流插件

本插件的功能是将多个文档（块）拼接在同一个页面里，方便用户查看。

> 注意! 如果一次性打开特别多的文档可能会出现严重的性能问题。

## 创建一个文档流

启用插件后，点击顶栏的图标，并选择需要的规则来生成文档流。

1. 子文档

    点击后，将当前打开的文档及其自文档拼接成一个文档流。

2. 文档反链

    点击后，打开当前文档的所有反向链接

3. 文档提及

    点击后，打开当前文档的所有反向链提及（虚拟引用）


4. SQL 查询

    点击后，在弹窗内输入 sql 语句，将查询得到的块拼接成一个文档流（和嵌入块差不多）。

5. 自定义 ID

    点击后，在弹窗内输入多个块 ID，ID 之间可以用空格、`\n`、`\t`、`,`隔开，这些 ID 对应的块将拼接成一个文档流。

6. 文档树

    将某个文档下属文档树内所有文档加入流中, 类似子文档

## 文档流内

1. 鼠标悬浮在文档流顶部可以唤出工具栏。

    - 滚动模式
        - 关闭: 将各个文档一次性全部加载, 类型反链窗口中的行为
        - 开启: 将各个文档在一个固定窗口内动态加载
    - 命名页签：命名当前的文档流
    - 保存规则：保存当前文档流的规则

2. 点击每个文档的面包屑，可以打开对应的文档
3. 点击文档面包屑左侧图标，可以折叠文档，节省资源

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
