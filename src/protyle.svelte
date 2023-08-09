<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/protyle.svelte
 LastEditTime : 2023-08-09 21:07:20
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Protyle, openTab } from "siyuan";
    import { getBlockByID } from "./api";
    import { notebooks } from "./utils";

    import { setting } from "./settings";

    export let app: any;
    export let blockId: BlockId;
    export let scroll: boolean;

    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    let divGutter: HTMLDivElement;

    let heightBreadcrumb: number;

    let styleProtyleMaxHeight: string = "";

    $: {
        let maxHeight: number = scroll ? setting.getMaxHeight() : null;
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
                title: true,
                gutter: true,
                scroll: scroll,
                breadcrumb: true,
                breadcrumbDocName: false,
            }
        });
        divGutter = divProtyle.querySelector(".protyle-gutters");
        toggleGutterDisplay(false);
    }

    function unload() {
        protyle?.destroy();
        divProtyle.innerHTML = "";
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
        class="protyle-breadcrumb__item"
        data-id=""
        bind:clientHeight={heightBreadcrumb}
        on:keypress={() => {}}
        on:click={() => {
            openTab({
                app: app,
                doc: {
                    id: blockId,
                    zoomIn: false,
                },
            });
        }}
    >
        <!-- <svg class="popover__block" data-id=""
            ><use xlink:href="#iconFile" /></svg
        > -->
        <span class="protyle-breadcrumb__text">
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
        border-radius: 0;
        border-bottom: 1px solid var(--b3-theme-primary);
    }
    div.docs-flow__protyle {
        overflow-y: auto;
    }
</style>
