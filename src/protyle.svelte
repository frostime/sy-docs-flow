<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/protyle.svelte
 LastEditTime : 2023-08-05 22:12:53
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

    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    let divGutter: HTMLDivElement;

    let heightBreadcrumb: number;

    let styleProtyleMaxHeight: string = "";

    $: {
        let maxHeight: number = setting.protyleScroll
            ? setting.getMaxHeight()
            : null;
        if (maxHeight) {
            maxHeight = maxHeight - heightBreadcrumb * 3;
        }
        styleProtyleMaxHeight = maxHeight ? `max-height: ${maxHeight}px;` : "";
    }

    onMount(async () => {
        let doc: Block = await getBlockByID(blockId);
        let rootId: BlockId = doc.root_id;
        doc = await getBlockByID(rootId);
        let notebookName: string = notebooks[doc.box];
        let prefix = notebookName ? `/${notebookName}` : "";
        hpath = prefix + doc.hpath;
        console.log(notebookName, hpath);
        load();
    });
    onDestroy(() => {
        // protyle?.destroy();
        unload();
    });

    function load() {
        protyle = new Protyle(app, divProtyle, {
            blockId: blockId,
            render: {
                background: false,
                title: true, //true will raise error
                gutter: true,
                scroll: setting.protyleScroll,
                breadcrumb: true, //false will raise error
                breadcrumbDocName: false,
            },
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
        divGutter = divProtyle.querySelector(".protyle-gutters");
        toggleGutterDisplay(false);
    }
    
    function unload() {
        protyle?.destroy();
        divProtyle.innerHTML = '';
        divGutter = null;
    }

    
    function toggleGutterDisplay(display: boolean = true) {
        if (divGutter) {
            divGutter.style.display = display ? "block" : "none";
        }
    }
</script>

<div class="docs-flow__doc">
    <span
        class="protyle-breadcrumb__item protyle-breadcrumb__item--active"
        data-id=""
        bind:clientHeight={heightBreadcrumb}
    >
        <svg class="popover__block" data-id=""
            ><use xlink:href="#iconFile" /></svg
        >
        <span class="protyle-breadcrumb__text" title="点击跳转到文档">
            {hpath}
        </span>
    </span>
    <div
        class="docs-flow__protyle"
        bind:this={divProtyle}
        style={styleProtyleMaxHeight}
        on:mouseenter={() => toggleGutterDisplay(true)}
        on:mouseleave={() => toggleGutterDisplay(false)}
    />
</div>

<style lang="scss">
    div.docs-flow__doc {
        background-color: var(--b3-theme-background);
    }
    span.protyle-breadcrumb__item {
        border-top: 3px solid var(--b3-theme-primary);
        border-top-left-radius: 0;
        border-top-right-radius: 0;
        border-bottom: 1px solid var(--b3-theme-primary);
    }
    div.docs-flow__protyle {
        overflow-y: auto;
    }
</style>
