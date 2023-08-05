<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/docs-flow.svelte
 LastEditTime : 2023-08-06 00:58:39
 Description  : 
-->
<script lang="ts">
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher } from "svelte";
    import { setting } from "./settings";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];
    export let ruleHash: string = "";

    let enableScroll: boolean = setting.protyleScroll;

    const dispatch = createEventDispatcher();

    let showToolbar: boolean = false;

    function onRenameThis() {
        dispatch("renameThis", { ruleHash });
    }

    function onSaveThis() {
        dispatch("saveThis", { ruleHash });
    }

    const reload = () => {
        const oldListDocuemntsId = listDocuemntsId;
        listDocuemntsId = [];
        setTimeout(() => {
            listDocuemntsId = oldListDocuemntsId;
        }, 500);
    };
</script>

<div
    class="docs-flow__toolbar"
    on:mouseenter={() => {
        showToolbar = true;
    }}
    on:mouseleave={() => {
        showToolbar = false;
    }}
>
    {#if showToolbar}
        <section
            in:fly={{ y: -20, duration: 200 }}
            out:fly={{ y: -20, duration: 200 }}
        >
            <div>文档数: {listDocuemntsId.length}</div>
            <div id="space" />
            <label class="b3-label__text" for="enableScroll" style="margin-top: 0px;">
                滚动模式
            </label>
            <input
                id="enableScroll"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={enableScroll}
                on:change={reload}
            />
            <span class="fn__space" />
            <button class="b3-button" on:click={onRenameThis}>命名页签</button>
            <span class="fn__space" />
            <button class="b3-button" on:click={onSaveThis}>保存规则</button>
        </section>
    {/if}
</div>

<div class="docs-flow">
    {#each listDocuemntsId as did}
        <Protyle {app} blockId={did} scroll={enableScroll} />
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
        align-items: start;

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

            #space {
                flex: 1;
            }
        }
    }
</style>
