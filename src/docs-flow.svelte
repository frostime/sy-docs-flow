<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/docs-flow.svelte
 LastEditTime : 2023-08-05 23:09:42
 Description  : 
-->
<script lang="ts">
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];

    let showToolbar: boolean = true;
</script>

<div
    class="docs-flow__toolbar"
    on:mouseenter={() => {
        showToolbar = true;
    }}
    on:mouseleave={() => {
        // showToolbar = false;
        showToolbar = true;
    }}
>
    {#if showToolbar}
        <section
            in:fly={{ y: -20, duration: 200 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <div>工具栏</div>
            <div id="space" />
            <button class="b3-button">全部折叠</button>
            <button class="b3-button">命名页签</button>
            <button class="b3-button">保存文档流</button>
        </section>
    {/if}
</div>

<div class="docs-flow">
    <!-- <Protyle app={app} blockId={blockID} />
    <Protyle app={app} blockId='20230515005454-d5mob4n' /> -->
    {#each listDocuemntsId as did}
        <Protyle {app} blockId={did} />
    {/each}
</div>

<style lang="scss">
    .docs-flow__toolbar {
        height: 2rem;
        padding: 0;

        position: absolute;
        width: 60%;
        left: 20%;
        top: 20px;
        z-index: 2;

        > section {
            padding: 0.5rem;
            width: 100%;
            height: 100%;
            background-color: var(--b3-theme-surface);
            opacity: 1;
            border-radius: 0.5rem;
            box-shadow: 0 0.5em 1em -0.125em var(--b3-theme-primary-light),
                0 0 0 1px var(--b3-theme-primary-light);

            display: flex;
            align-items: center;

            >button {
                margin-left: 0.5rem;
            }

            #space {
                flex: 1;
            }
        }
    }
</style>
