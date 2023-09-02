<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/components/docs-flow/protyle.svelte
 LastEditTime : 2023-09-02 15:29:38
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { Protyle, openTab } from "siyuan";
    import { getBlockByID, getBlockDOM, getBlockBreadcrumb } from "../../api";
    import { notebooks } from "../../utils";

    import { setting } from "../../settings";

    export let app: any;
    export let blockId: BlockId;
    export let config: IConfig;
    export let displayBreadcrumb: boolean;
    export let expanded: boolean = true;
    let scroll: boolean = config.scroll;

    let breadcrumbDisplayChanged = false; //标识, 防止更改了面包屑后执行 Protyle 重载

    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    let rootDoc: Block;

    let protyleBacklinkData: IBacklink[]; //如果 scroll 为 false，就需要把这个参数传给 Protyle

    let divGutter: HTMLDivElement;

    let initialised: boolean = false;

    let heightBreadcrumb: number = 40;

    let styleProtyleMaxHeight: string = "";
    const updateProtyleMaxHeight = () => {
        let maxHeight: number = scroll ? setting.getMaxHeight() : null;
        if (maxHeight) {
            maxHeight = maxHeight - 2 * heightBreadcrumb;
        }
        styleProtyleMaxHeight = maxHeight ? `max-height: ${maxHeight}px;` : "";
    };

    let styleDisplayLi: string = "";
    $: {
        styleDisplayLi = displayBreadcrumb ? "" : "display: none;";
        breadcrumbDisplayChanged = true;
    }

    let classArrowOpen: string = "";
    $: {
        classArrowOpen = expanded ? "b3-list-item__arrow--open" : "";
    }

    async function constructDom() {
        let blockDom = await getBlockDOM(blockId);
        let dom = blockDom.dom;
        let breadcrumb = await getBlockBreadcrumb(blockId);
        // console.log(breadcrumb);
        let backlink: IBacklink = {
            dom: dom,
            expand: false,
            blockPaths: breadcrumb
        };
        protyleBacklinkData = [backlink];
        // console.log(blockDom);
    }

    onMount(async () => {
        let doc: Block = await getBlockByID(blockId);
        let rootId: BlockId = doc.root_id;
        doc = await getBlockByID(rootId);
        rootDoc = doc;
        let notebookName: string = notebooks[doc.box];
        let prefix = notebookName ? `/${notebookName}` : "";
        hpath = prefix + doc.hpath;

        console.log('Mount protyle:', notebookName, hpath, blockId);
        initialised = true;
        breadcrumbDisplayChanged = false; //TODO 这个解决方案很不优雅，后面有空改掉
    });
    onDestroy(() => {
        // protyle?.destroy();
        unload();
    });

    afterUpdate(async () => {
        if (!initialised) {
            return; //由于 onMunt 是 async 所以会出现还没有执行完毕就调用了 afterUpdate 的情况
        }
        //初始化后第一次执行 afterUpdate 的时候, 如果为非 scroll 模式, 就需要构造 dom
        if (scroll === false && protyleBacklinkData === undefined) {
            await constructDom();
        }
        //TODO 在切换显示面包屑的时候也会重载 protyle，后面想办法解决这个问题
        if (breadcrumbDisplayChanged) {
            breadcrumbDisplayChanged = false;
            return;
        }

        // console.log("afterUpdated", blockId, expanded);
        if (divProtyle && expanded) {
            load();
        } else if (!divProtyle && !expanded) {
            unload();
        }
    });

    function load() {
        if (!divProtyle) {
            return;
        }
        // console.log("Load protyle...", blockId);
        updateProtyleMaxHeight();
        protyle = new Protyle(app, divProtyle, {
            mode: config.readonly? "preview" : "wysiwyg",
            action: ["cb-get-context"],
            blockId: blockId,
            //@ts-ignore
            backlinkData: protyleBacklinkData,
            render: {
                background: false,
                title: true,
                gutter: true,
                scroll: scroll,
                breadcrumb: true,
                breadcrumbDocName: false,
            },
        });
        if (!scroll) {
            //默认 API 在 backlink 下不会渲染标题, 只能手搓
            //未公开的 api，自己扒拉代码扒出来的 https://github.com/siyuan-note/siyuan/blob/v2.9.9/app/src/protyle/index.ts#L166
            //@ts-ignore
            protyle.protyle.title.setTitle(rootDoc.content);
        } 
        divGutter = divProtyle.querySelector(".protyle-gutters");
        toggleGutterDisplay(false);
    }

    function unload() {
        // console.log('Unload protyle...', blockId);
        protyle?.destroy();
        divGutter = null;
    }

    function toggleGutterDisplay(display: boolean = true) {
        if (divGutter) {
            divGutter.style.display = display ? "block" : "none";
        }
    }
</script>

<div class="docs-flow__doc" style="min-height: {heightBreadcrumb}px">
    <li
        class="b3-list-item b3-list-item--hide-action protyle-breadcrumb__item"
        style="{styleDisplayLi}"
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
        <span class="b3-list-item__text">{hpath}</span>
        <svg class="b3-list-item__graphic popover__block" data-id={blockId}
            ><use xlink:href="#iconFile" /></svg
        >
    </li>
    {#if expanded}
        <div
            class="docs-flow__protyle"
            bind:this={divProtyle}
            style="{styleProtyleMaxHeight}"
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
