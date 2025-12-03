<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/components/docs-flow/protyle.svelte
 LastEditTime : 2025-01-18 16:46:30
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount, tick } from "svelte";
    import { Protyle, openTab } from "siyuan";
    // import { type TProtyleAction } from "siyuan";
    import { getBlockByID } from "../../api";
    import { notebooks } from "../../utils";

    import { setting } from "../../settings";

    interface Props {
        app: any;
        index: number;
        blockId: BlockId;
        config: IConfig;
        displayCollapseBar: boolean;
        expanded?: boolean;
    }

    let {
        app,
        index,
        blockId,
        config,
        displayCollapseBar,
        expanded = $bindable(true),
    }: Props = $props();

    //状态标识符
    let initialised = $state(false);

    let hpath: string = $state("");
    let divProtyle: HTMLDivElement = $state();
    let protyle: Protyle;

    let thisBlock: Block;
    let rootDoc: Block;

    let heightBreadcrumb: number = 40;

    let styleProtyleMaxHeight: string = $state("");
    const updateProtyleMaxHeight = () => {
        let maxHeight: number = config.scroll ? setting.getMaxHeight() : null;
        if (maxHeight) {
            maxHeight = maxHeight - (displayCollapseBar ? heightBreadcrumb : 0);
        }
        styleProtyleMaxHeight = maxHeight ? `max-height: ${maxHeight}px;` : "";
    };

    let styleDisplayLi: string = $derived(
        displayCollapseBar ? "" : "display: none;",
    );
    let classArrowOpen: string = $derived(
        expanded ? "b3-list-item__arrow--open" : "",
    );

    onMount(async () => {
        thisBlock = await getBlockByID(blockId);

        thisBlock.content = null; //不需要 content，减少占用

        let rootId: BlockId = thisBlock.root_id;
        rootDoc = await getBlockByID(rootId);
        let notebookName: string = notebooks[rootDoc.box];
        let prefix = notebookName ? `/${notebookName}` : "";
        hpath = prefix + rootDoc.hpath;

        initialised = true;

        // 初始化完成后，如果是展开状态则加载 protyle
        await tick();
        if (expanded && divProtyle) {
            load();
        }
    });

    onDestroy(() => {
        unload();
    });

    // 监听 expanded 变化来加载/卸载 protyle
    $effect(() => {
        if (!initialised) return;

        // 读取 expanded 来建立依赖
        const shouldExpand = expanded;

        // 需要等待 DOM 更新后再操作
        tick().then(() => {
            if (shouldExpand && divProtyle) {
                load();
            } else if (!shouldExpand) {
                unload();
            }
        });
    });

    // 监听 config 变化来重新加载 protyle
    $effect(() => {
        if (!initialised || !expanded) return;

        // 读取 config 的关键属性来建立依赖
        void [config.scroll, config.readonly, config.protyleTitle];

        // 需要等待 DOM 更新后再操作
        tick().then(() => {
            if (divProtyle && protyle) {
                // config 变化时，先卸载再重新加载
                unload();
                load();
            }
        });
    });

    function load() {
        if (!divProtyle || protyle) {
            return;
        }
        updateProtyleMaxHeight();
        protyle = new Protyle(app, divProtyle, {
            mode: config.readonly ? "preview" : "wysiwyg",
            action: ["cb-get-all"],
            blockId: blockId,
            render: {
                background: false,
                title: config.protyleTitle,
                gutter: true,
                scroll: config.scroll,
                breadcrumb: true,
                breadcrumbDocName: false,
            },
        });
    }

    function unload() {
        protyle?.destroy();
        protyle = null;
    }
</script>

<div
    class="docs-flow__doc"
    style="min-height: {heightBreadcrumb}px;"
    data-node-id={blockId}
>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <li
        class="b3-list-item b3-list-item--hide-action protyle-breadcrumb__item"
        style="gap: 5px; {styleDisplayLi}"
        data-node-id={blockId}
        data-type="NodeDocument"
        onkeypress={() => {}}
        onclick={(e) => {
            e.stopPropagation();
            if (e.ctrlKey) {
                openTab({
                    app: app,
                    doc: {
                        id: blockId,
                        zoomIn: false,
                    },
                });
            } else {
                expanded = !expanded;
            }
        }}
    >
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <span
            style="padding-left: 4px;margin-right: 2px"
            class="b3-list-item__toggle b3-list-item__toggle--hl"
            onkeypress={() => {}}
            onclick={(e) => {
                expanded = !expanded;
                e.stopPropagation();
            }}
        >
            <svg class="b3-list-item__arrow {classArrowOpen}"
                ><use xlink:href="#iconRight" /></svg
            >
        </span>
        <span class="b3-list-item__text" style="flex: 0; min-width: 25px;">
            {index + 1}
        </span>
        <span class="b3-list-item__text">{hpath}</span>
        <svg class="b3-list-item__graphic popover__block" data-id={blockId}
            ><use xlink:href="#iconFile" /></svg
        >
    </li>
    {#if expanded}
        <div
            class="docs-flow__protyle"
            bind:this={divProtyle}
            style={styleProtyleMaxHeight}
        ></div>
    {/if}
</div>

<style lang="scss">
    div.docs-flow__doc {
        border-top: 3px solid var(--b3-theme-primary);
        background-color: var(--b3-theme-background);
    }
    li.protyle-breadcrumb__item {
        border-radius: 0;
        border-bottom: 1px solid var(--b3-theme-primary);
    }
    div.docs-flow__protyle {
        overflow-y: auto;
    }
</style>
