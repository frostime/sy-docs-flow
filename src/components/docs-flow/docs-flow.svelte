<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/components/docs-flow/docs-flow.svelte
 LastEditTime : 2023-08-12 14:57:50
 Description  : 
-->
<script lang="ts">
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher } from "svelte";
    import { i18n } from "../../utils";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];
    export let ruleHash: string = "";
    export let config: any = {};
    let enableScroll: boolean = config.scroll;
    let displayBreadcrumb: boolean = true;

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
        dispatch("configChanged", {
            ruleHash,
            config: { scroll: enableScroll },
        });
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
            <div>{i18n.docsCnt}: {listDocuemntsId.length}</div>
            <div id="space" />

            <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.displayBreadcrumb}
            </label>
            <input
                id="displayBreadcrumb"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={displayBreadcrumb}
            />

            <span class="fn__space" />

            <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.scrollMode}
            </label>
            <input
                id="enableScroll"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={enableScroll}
                on:change={reload}
            />
            <span class="fn__space" />
            <button class="b3-button" on:click={onRenameThis}
                >{i18n.nameTab}</button
            >
            <span class="fn__space" />
            <button class="b3-button" on:click={onSaveThis}
                >{i18n.saveRule}</button
            >
        </section>
    {/if}
</div>

<div class="docs-flow">
    {#each listDocuemntsId as did}
        <Protyle {app} blockId={did} scroll={enableScroll} displayBreadcrumb={displayBreadcrumb} />
    {/each}
</div>

<style lang="scss">
    .docs-flow__toolbar {
        height: 5rem;
        padding: 0;

        position: absolute;
        width: 60%;
        left: 20%;
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
