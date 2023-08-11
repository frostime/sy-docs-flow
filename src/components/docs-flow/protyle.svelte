<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/components/docs-flow/protyle.svelte
 LastEditTime : 2023-08-11 15:20:07
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount, afterUpdate } from "svelte";
    import { Protyle, openTab } from "siyuan";
    import { getBlockByID } from "../../api";
    import { notebooks } from "../../utils";

    import { setting } from "../../settings";

    export let app: any;
    export let blockId: BlockId;
    export let scroll: boolean;

    let hpath: string = "";
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

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

    let expanded: boolean = true;
    let classArrowOpen: string = "";
    $: {
        classArrowOpen = expanded ? "b3-list-item__arrow--open" : "";
    }

    onMount(async () => {
        let doc: Block = await getBlockByID(blockId);
        let rootId: BlockId = doc.root_id;
        doc = await getBlockByID(rootId);
        let notebookName: string = notebooks[doc.box];
        let prefix = notebookName ? `/${notebookName}` : "";
        hpath = prefix + doc.hpath;
        console.log('Mount protyle:', notebookName, hpath, blockId);
        initialised = true;
    });
    onDestroy(() => {
        // protyle?.destroy();
        unload();
    });

    afterUpdate(() => {
        if (!initialised) {
            return; //由于 onMunt 是 async 所以会出现还没有执行完毕就调用了 afterUpdate 的情况
        }
        console.log("afterUpdated", blockId, expanded);
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
        console.log("Load protyle...", blockId);
        updateProtyleMaxHeight();
        protyle = new Protyle(app, divProtyle, {
            mode: "wysiwyg",
            blockId: blockId,
            render: {
                background: false,
                title: true,
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
        console.log('Unload protyle...', blockId);
        protyle?.destroy();
        divGutter = null;
    }

    function toggleGutterDisplay(display: boolean = true) {
        if (divGutter) {
            divGutter.style.display = display ? "block" : "none";
        }
    }
</script>

<div class="docs-flow__doc">
    <li
        class="b3-list-item b3-list-item--hide-action protyle-breadcrumb__item"
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
        background-color: var(--b3-theme-background);
    }
    li.protyle-breadcrumb__item {
        border-top: 3px solid var(--b3-theme-primary);
        border-radius: 0;
        border-bottom: 1px solid var(--b3-theme-primary);
    }
    div.docs-flow__protyle {
        overflow-y: auto;
    }
</style>
