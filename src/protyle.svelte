<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 21:14:31
 FilePath     : /src/protyle.svelte
 LastEditTime : 2023-07-28 22:50:09
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { Protyle } from "siyuan";
    import { getBlockByID } from "./api";

    export let app: any;
    export let blockId: BlockId;

    let title: string;
    let divProtyle: HTMLDivElement;
    let protyle: Protyle;

    onMount(async () => {
        let doc: Block = await getBlockByID(blockId);
        title = doc.content;
        protyle = new Protyle(app, divProtyle, {
            blockId: blockId,
            render: {
                background: false,
                title: false,
                gutter: true,
                scroll: true,
                breadcrumb: true,
                breadcrumbDocName: false,
            }
        });
    });
    onDestroy(() => {
        protyle.destroy();
    });
</script>

<div class="docs-flow__doc">
    <div class="docs-flow__protyle protyle-content">
        <div
            class="protyle-title protyle-wysiwyg--attr"
            style="margin: 16px 434px 0px;"
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
    <div class="docs-flow__protyle" bind:this={divProtyle} />
</div>

<style>
    div.docs-flow__doc {
        background-color: var(--b3-theme-background);
        border-bottom: 1px solid var(--b3-theme-primary);
    }
</style>
