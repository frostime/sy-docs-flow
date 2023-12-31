<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/components/docs-flow/docs-flow.svelte
 LastEditTime : 2023-12-24 11:46:25
 Description  : 
-->
<script lang="ts">
    import { Dialog } from "siyuan";
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher } from "svelte";
    import { i18n, throttle } from "../../utils";
    import DefaultSetting from "../config/default-setting.svelte";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];
    export let ruleHash: string = "";
    export let config: IConfig;

    let loadOffset: number = 0; //当前动态加载的文档偏移量
    let loadLength: number = config.dynamicLoading.capacity; //每次动态加载的文档数量
    let shiftLength: number = config.dynamicLoading.shift; //每次动态加载时的偏移量
    let loadIdList: DocumentId[] = config.dynamicLoading.enabled
        ? listDocuemntsId.slice(loadOffset, loadOffset + loadLength)
        : listDocuemntsId;
    console.log("loadIdList", loadIdList);

    const updateLoadIdList = () => {
        if (config.dynamicLoading.enabled !== true) {
            loadIdList = listDocuemntsId;
            return;
        }
        if (loadOffset < 0) {
            loadOffset = 0;
        } else if (loadOffset + loadLength > listDocuemntsId.length) {
            loadOffset = listDocuemntsId.length - loadLength;
        }
        loadIdList = listDocuemntsId.slice(loadOffset, loadOffset + loadLength);
        // window.scrollTo(0, 0);
    };

    const shift = (direction: "left" | "right") => {
        if (config.dynamicLoading.enabled !== true) {
            return;
        }

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
        updateLoadIdList();
    };

    const shiftThrottle = throttle(shift, 1000); //防止滚动过快导致的频繁加载

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

    function onOpenConfig() {
        console.log("onOpenConfig", config);
        let dialog = new Dialog({
            title: 'Config',
            content: `<div id="SettingPanel"></div>`,
            width: "780px",
            height: "500px",
            destroyCallback: () => {
                // console.log(changedConfig);
                if (changedConfig?.['protyleScroll'] !== undefined) {
                    config.scroll = changedConfig['protyleScroll'];
                }
                if (changedConfig?.['protyleBreadcrumb'] !== undefined) {
                    config.breadcrumb = changedConfig['protyleBreadcrumb'];
                }
                if (changedConfig?.['protyleTitle'] !== undefined) {
                    config.protyleTitle = changedConfig['protyleTitle'];
                }
                if (changedConfig?.['protyleReadonly'] !== undefined) {
                    config.readonly = changedConfig['protyleReadonly'];
                }
                if (changedConfig?.['dynamicLoadingEnabled'] !== undefined) {
                    config.dynamicLoading.enabled = changedConfig['dynamicLoadingEnabled'];
                }
                if (changedConfig?.['dynamicLoadingCapacity'] !== undefined) {
                    config.dynamicLoading.capacity = changedConfig['dynamicLoadingCapacity'];
                }
                if (changedConfig?.['dynamicLoadingShift'] !== undefined) {
                    config.dynamicLoading.shift = changedConfig['dynamicLoadingShift'];
                }
                onConfigChanged();
            }
        });
        const ele: HTMLElement = dialog.element.querySelector("#SettingPanel");
        ele.style.height = "100%";
        let changedConfig = {};
        let settingComp = new DefaultSetting({
            target: ele,
            props: {
                descriptioin: i18n.defaultSetting.descriptioinSpecific,
                settingValue: {
                    protyleScroll: config.scroll,
                    protyleBreadcrumb: config.breadcrumb,
                    protyleTitle: config.protyleTitle,
                    protyleReadonly: config.readonly,
                    dynamicLoadingEnabled: config.dynamicLoading.enabled,
                    dynamicLoadingCapacity: config.dynamicLoading.capacity,
                    dynamicLoadingShift: config.dynamicLoading.shift
                }
            }
        });
        settingComp.$on("changed", ({detail}) => {
            changedConfig[detail.key] = detail.value;
        });
    }

    const reload = () => {
        loadIdList = [];
        onConfigChanged();
        setTimeout(() => {
            updateLoadIdList();
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
            lastScrollTop = scrollTop;  //记录上一次滚动条的位置, 从而判断滚动方向
            return;
        }

        // epsilon 不能太小，否则会导致无法触发
        if (approxEqual(scrollTop, 0, 3) && scrollTop <= lastScrollTop) {
            console.log("到顶了");
            shiftThrottle("left");
        } else if (
            approxEqual(scrollTop + clientHeight, scrollHeight, 3) &&
            scrollTop > lastScrollTop
        ) {
            console.log("到底了");
            shiftThrottle("right");
        }
    };
    export const onscroll = (e) => {
        window.requestAnimationFrame(() => {
            if (config.dynamicLoading.enabled !== true) {
                return;
            }
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
                {i18n.defaultSetting.scrollMode.title}
            </label>
            <input
                id="enableScroll"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={config.scroll}
                on:change={reload}
            />

            <span class="fn__space" />

            <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.defaultSetting.displayBreadcrumb.title}
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
                {i18n.defaultSetting.dynamicLoading.title}
            </label>
            <input
                id="enableScroll"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={config.dynamicLoading.enabled}
                on:change={reload}
            />

            <span class="fn__space" />

            <button class="b3-button" on:click={onOpenConfig}>
                {i18n.button.moreConfig}
            </button>
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
    {#each loadIdList as did, i (did)}
        <Protyle
            {app}
            index={i + loadOffset}
            blockId={did}
            {config}
            displayCollapseBar={config.breadcrumb}
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
