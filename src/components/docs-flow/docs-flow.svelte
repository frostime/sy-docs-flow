<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/components/docs-flow/docs-flow.svelte
 LastEditTime : 2023-09-02 17:02:06
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
    export let config: IConfig;

    let loadOffset: number = 0;
    let loadLength: number = 5;
    let shiftLength: number = 2;
    let loadIdList: DocumentId[] = [];

    $: {
        if (loadOffset < 0) {
            loadOffset = 0;
        } else if (loadOffset + loadLength > listDocuemntsId.length) {
            loadOffset = listDocuemntsId.length - loadLength;
        }
        loadIdList = listDocuemntsId.slice(loadOffset, loadOffset + loadLength);
        window.scrollTo(0, 0);
    }
    const shift = (direction: "left" | "right") => {
        if (direction === "left") {
            if (loadOffset == 0) {
                return;
            }
            loadOffset -= shiftLength;
        } else {
            if (loadOffset + loadLength >= listDocuemntsId.length) {
                return;
            }
            loadOffset += shiftLength;
        }
    };


    const dispatch = createEventDispatcher();

    let showToolbar: boolean = false;

    function onRenameThis() {
        dispatch("renameThis", { ruleHash });
    }

    function onSaveThis() {
        dispatch("saveThis", { ruleHash });
    }

    function onConfigChanged() {
        dispatch("configChanged", {
            ruleHash,
            config: config,
        });
    }

    const reload = () => {
        const oldListDocuemntsId = listDocuemntsId;
        listDocuemntsId = [];
        onConfigChanged();
        setTimeout(() => {
            listDocuemntsId = oldListDocuemntsId;
        }, 500);
    };

    // 用于判断两个数字是否大致相等
    const approxEqual = (a, b, epsilon = 1) => {
        return Math.abs(a - b) < epsilon;
    };

    let lastScrollTop = null;
    const dynamicLoading = (e) => {
        let ele = e.target as HTMLDivElement;
        let scrollTop = ele.scrollTop;
        let scrollHeight = ele.scrollHeight;
        let clientHeight = ele.clientHeight;
        if (lastScrollTop === null) {
            lastScrollTop = scrollTop;
            return;
        }

        // epsilon 不能太小，否则会导致无法触发
        if (approxEqual(scrollTop, 0, 3) && scrollTop <= lastScrollTop) {
            console.log("到顶了");
            shift("left");
            // ele.scrollTop = 5;
        } else if (
            approxEqual(scrollTop + clientHeight, scrollHeight, 3) &&
            scrollTop > lastScrollTop
        ) {
            console.log("到底了");
            shift("right");
        }
    };
    export const onscroll = (e) => {
        window.requestAnimationFrame(() => {
            dynamicLoading(e);
        });
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
                bind:checked={config.breadcrumb}
                on:change={onConfigChanged}
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
                bind:checked={config.scroll}
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
    {#each loadIdList as did (did)}
        <Protyle
            {app}
            blockId={did}
            {config}
            displayBreadcrumb={config.breadcrumb}
        />
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
