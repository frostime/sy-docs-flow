<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/protyle.svelte
 LastEditTime : 2023-07-29 22:29:01
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Protyle } from "siyuan";
    import { getBlockByID } from "./api";
    import { notebooks } from "./utils";

    import { setting } from "./settings";

    export let app: any;
    export let blockId: BlockId;

    let title: string;
    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    let heightBreadcrumb: number;
    let heightTitle: number;

    let styleProtyleMaxHeight: string = "";

    $: {
        let maxHeight: number = setting.protyleScroll? setting.getMaxHeight() : null;
        if (maxHeight) {
            maxHeight = maxHeight - heightBreadcrumb * 3 - heightTitle;
        }
        styleProtyleMaxHeight = maxHeight? `max-height: ${maxHeight}px;` : "";
    }

    let titleMargin: number = 434;

    function updateWidth() {
        let wysiwyg: HTMLElement = divProtyle.querySelector(".protyle-wysiwyg");
        let left = parseInt(wysiwyg.style.paddingLeft);
        console.log(left);
        titleMargin = left;
    }

    onMount(async () => {
        let doc: Block = await getBlockByID(blockId);
        let rootId: BlockId = doc.root_id;
        doc = await getBlockByID(rootId);
        title = doc.content;
        let notebookName: string = notebooks[doc.box];
        let prefix = notebookName? `/${notebookName}` : '';
        hpath = prefix + doc.hpath;
        console.log(notebookName, hpath);
        protyle = new Protyle(app, divProtyle, {
            blockId: blockId,
            render: {
                background: false,
                title: false,  //true will raise error
                gutter: false,
                scroll: setting.protyleScroll,
                breadcrumb: true, //false will raise error
                breadcrumbDocName: false,
            }
            // default
            // render: {
            //     background: false,
            //     title: false,
            //     gutter: true,
            //     scroll: false,
            //     breadcrumb: true,
            //     breadcrumbDocName: false,
            // }
        });
        updateWidth();
    });
    onDestroy(() => {
        protyle.destroy();
    });
</script>

<div class="docs-flow__doc">
    <span class="protyle-breadcrumb__item protyle-breadcrumb__item--active" data-id=""
        bind:clientHeight={heightBreadcrumb}
    >
        <svg class="popover__block" data-id=""><use xlink:href="#iconFile"></use></svg>
        <span class="protyle-breadcrumb__text" title="点击跳转到文档">
            {hpath}
        </span>
    </span>
    <div class="docs-flow__title protyle-content" bind:clientHeight={heightTitle}>
        <div
            class="protyle-title protyle-wysiwyg--attr"
            style="margin: 16px {titleMargin}px 0px;"
            data-node-id={blockId}
        >
            <div
                contenteditable="false"
                data-position="center"
                spellcheck="false"
                class="protyle-title__input"
                data-render="true"
            >
                {title}
            </div>
            <div class="protyle-attr" />
        </div>
    </div>
    <div class="docs-flow__protyle" bind:this={divProtyle} style="{styleProtyleMaxHeight}"/>
</div>

<style lang="scss">
    div.docs-flow__doc {
        background-color: var(--b3-theme-background);
    }
    span.protyle-breadcrumb__item {
        border-top: 3px solid var(--b3-theme-primary);
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }
    div.docs-flow__title {
        border-bottom: 1px solid var(--b3-theme-primary);
    }
    div.docs-flow__protyle {
        overflow-y: auto;
    }
</style>
