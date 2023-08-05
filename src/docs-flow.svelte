<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/docs-flow.svelte
 LastEditTime : 2023-08-06 00:31:29
 Description  : 
-->
<script lang="ts">
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher } from "svelte";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];
    export let ruleHash: string = "";

    const dispatch = createEventDispatcher();

    let showToolbar: boolean = false;

    function onRenameThis() {
        dispatch("renameThis", { ruleHash });
    }

    function onSaveThis() {
        dispatch("saveThis", { ruleHash });
    }

</script>

<div
    class="docs-flow__toolbar"
    on:mouseenter={() => {
        showToolbar = true;
    }}
    on:mouseleave={() => {
        showToolbar = false;
        // showToolbar = true;
    }}
>
    {#if showToolbar}
        <section
            in:fly={{ y: -20, duration: 200 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <div>工具栏</div>
            <div id="space" />
            <button class="b3-button" on:click={onRenameThis}>命名页签</button>
            <button class="b3-button" on:click={onSaveThis}>保存规则</button>
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
        height: 5rem;
        padding: 0;

        position: absolute;
        width: 70%;
        left: 15%;
        top: 20px;
        z-index: 2;

        display: flex;
        justify-content: center;
        align-items: center;

        > section {
            padding: 0.5rem;
            width: 40rem;

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
