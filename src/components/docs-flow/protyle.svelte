<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/components/docs-flow/protyle.svelte
 LastEditTime : 2023-12-24 14:30:29
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { Protyle, TProtyleAction, openTab } from "siyuan";
    import { getBlockByID } from "../../api";
    import { notebooks } from "../../utils";

    import { setting } from "../../settings";

    export let app: any;
    export let index: number;
    export let blockId: BlockId;
    export let config: IConfig;
    export let displayCollapseBar: boolean;  // 当前是否显示折叠按钮
    export let expanded: boolean = true;

    export let isScrolling: boolean = false;

    //把乱七八糟的东西都放到一个对象里面
    const Flag = {
        initialised: false,
        displayGutter: false
    }

    //标识, 防止 afterUpdate 里面执行 Protyle 重载
    const ChangeStatus = {
        scrollingChanged: false,
        collapseBarChanged: false
    }

    $: {
        //protyle 非滚动模式，这个时候需要自己手动处理 gutter
        if (config.scroll === false) {
            //只要 isScorolling 发生变动, 就调用
            isScrolling = isScrolling;
            ChangeStatus.scrollingChanged = true;
            toggleGutterDisplay();
        }
    }

    let scroll: boolean = config.scroll;

    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    let thisBlock: Block;
    let rootDoc: Block;

    let divGutter: HTMLDivElement;

    let heightBreadcrumb: number = 40;

    let styleProtyleMaxHeight: string = "";
    const updateProtyleMaxHeight = () => {
        let maxHeight: number = scroll ? setting.getMaxHeight() : null;
        if (maxHeight) {
            maxHeight = maxHeight - (displayCollapseBar ? heightBreadcrumb : 0);
        }
        styleProtyleMaxHeight = maxHeight ? `max-height: ${maxHeight}px;` : "";
    };

    let styleDisplayLi: string = "";
    $: {
        styleDisplayLi = displayCollapseBar ? "" : "display: none;";
        ChangeStatus.collapseBarChanged = true;
    }

    let classArrowOpen: string = "";
    $: {
        classArrowOpen = expanded ? "b3-list-item__arrow--open" : "";
    }

    onMount(async () => {
        thisBlock = await getBlockByID(blockId);

        //处理 li 下的段落块的特殊情况
        if (thisBlock.type == 'p') {
            let parentBlock: Block = await getBlockByID(thisBlock.parent_id);
            if (parentBlock.type == 'i') {
                thisBlock = parentBlock;
                blockId = thisBlock.id;
                console.debug("Li block", blockId);
            }
        }

        thisBlock.content = null;  //不需要 content，减少占用

        let rootId: BlockId = thisBlock.root_id;
        rootDoc = await getBlockByID(rootId);
        let notebookName: string = notebooks[rootDoc.box];
        let prefix = notebookName ? `/${notebookName}` : "";
        hpath = prefix + rootDoc.hpath;

        console.debug("Mount protyle:", notebookName, hpath, blockId);
        Flag.initialised = true;
        //TODO 这个解决方案很不优雅，后面有空改掉
        ChangeStatus.collapseBarChanged = false;
        ChangeStatus.scrollingChanged = false;
    });
    onDestroy(() => {
        // protyle?.destroy();
        unload();
    });

    afterUpdate(async () => {
        if (!Flag.initialised) {
            return; //由于 onMunt 是 async 所以会出现还没有执行完毕就调用了 afterUpdate 的情况
        }

        if (ChangeStatus.scrollingChanged === true) {
            ChangeStatus.scrollingChanged = false;
            return;
        }

        //TODO 在切换显示面包屑的时候也会重载 protyle，后面想办法解决这个问题
        if (ChangeStatus.collapseBarChanged === true) {
            ChangeStatus.collapseBarChanged = false;
            return;
        }

        if (divProtyle && expanded) {
            load();
        } else if (!divProtyle && !expanded) {
            unload();
        }
    });

    function whichAction(): TProtyleAction[] {
        if (thisBlock.type == 'd') {
            return ['cb-get-context'];
        } else {
            return ['cb-get-all'];
        }
    }

    function load() {
        if (!divProtyle) {
            return;
        }
        updateProtyleMaxHeight();
        protyle = new Protyle(app, divProtyle, {
            mode: config.readonly ? "preview" : "wysiwyg",
            action: whichAction(),
            blockId: blockId,
            render: {
                background: false,
                title: config.protyleTitle,
                gutter: true,
                scroll: scroll,
                breadcrumb: true,
                breadcrumbDocName: false,
            },
        });
        divGutter = divProtyle.querySelector(".protyle-gutters");
        toggleGutterDisplay(false);
    }

    function unload() {
        // console.log('Unload protyle...', blockId);
        protyle?.destroy();
        divGutter = null;
    }

    function toggleGutterDisplay(display?: boolean) {
        if (display !== undefined) {
            Flag.displayGutter = display;
        }

        if (divGutter) {
            if (isScrolling) {
                divGutter.style.display = "none";
            }

            display = !isScrolling && Flag.displayGutter;
            divGutter.style.display = display ? "block" : "none";
        }
    }
</script>

<div class="docs-flow__doc" style="min-height: {heightBreadcrumb}px">
    <li
        class="b3-list-item b3-list-item--hide-action protyle-breadcrumb__item"
        style="gap: 5px; {styleDisplayLi}"
        data-node-id={blockId}
        data-type="NodeDocument"
        on:keypress={() => {}}
        on:click={(e) => {
            openTab({
                app: app,
                doc: {
                    id: blockId,
                    zoomIn: false,
                },
            });
            e.stopPropagation();
        }}
    >
        <span
            style="padding-left: 4px;margin-right: 2px"
            class="b3-list-item__toggle b3-list-item__toggle--hl"
            on:keypress={() => {}}
            on:click={(e) => {
                expanded = !expanded;
                e.stopPropagation();
            }}
        >
            <svg class="b3-list-item__arrow {classArrowOpen}"
                ><use xlink:href="#iconRight" /></svg
            >
        </span>
        <span
            class="b3-list-item__text"
            style="flex: 0; min-width: 25px;"
        >
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
            on:mouseenter={() => toggleGutterDisplay(true)}
            on:mouseleave={() => toggleGutterDisplay(false)}
        />
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
