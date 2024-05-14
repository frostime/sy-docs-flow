<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/components/docs-flow/docs-flow.svelte
 LastEditTime : 2024-05-14 15:43:09
 Description  : 
-->
<script lang="ts">
    import { Dialog, showMessage } from "siyuan";
    import { fly } from "svelte/transition";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import { i18n, throttle, confirmDialog } from "../../utils";
    import DefaultSetting from "../config/default-setting.svelte";

    import { type MatchRule } from '@/rules';

    export let app: any;
    export let rule: MatchRule;
    export let listDocumentIds: DocumentId[] = [];

    const ruleHash: string = rule.hash;
    const config: IConfig = rule.config;

    let loadOffset: number = 0; //当前动态加载的文档偏移量
    let loadLength: number = config.dynamicLoading.capacity; //每次动态加载的文档数量
    let shiftLength: number = config.dynamicLoading.shift; //每次动态加载时的偏移量
    let loadIdList: DocumentId[] = [];

    const reInit = async () => {
        let ids = await rule.fetch();
        listDocumentIds = ids;
        if (!ids || ids.length === 0) {
            showMessage("No matching docs found.");
            return;
        }
        updateLoadIdList();
    }

    onMount(async () => {
        reInit();
    });

    const updateLoadIdList = () => {
        if (config.dynamicLoading.enabled !== true) {
            loadIdList = listDocumentIds;
            return;
        }
        if (loadOffset < 0) {
            loadOffset = 0;
        } else if (loadOffset + loadLength > listDocumentIds.length) {
            loadOffset = Math.max(listDocumentIds.length - loadLength, 0);
        }
        loadIdList = listDocumentIds.slice(loadOffset, loadOffset + loadLength);
        // window.scrollTo(0, 0);
    };

    const shift = (direction: "left" | "right") => {
        if (config.dynamicLoading.enabled !== true || listDocumentIds.length === 0) {
            return;
        }

        const originalOffset = loadOffset;
        let newOffset = loadOffset;
        if (direction === "left" && originalOffset > 0) {
            newOffset = Math.max(originalOffset - shiftLength, 0);
        } else if (direction === "right" && originalOffset + loadLength < listDocumentIds.length) {
            newOffset = Math.min(originalOffset + shiftLength, listDocumentIds.length - loadLength);
            newOffset = Math.max(newOffset, 0); //防止极端情况下 offset 为负数
        }

        if (newOffset !== originalOffset) {
            loadOffset = newOffset;
            updateLoadIdList();
        }
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
            title: "Config",
            content: `<div id="SettingPanel" style="background: var(--b3-theme-background);"></div>`,
            width: "780px",
            height: "500px",
            destroyCallback: () => {
                // console.log(changedConfig);
                if (changedConfig?.["protyleScroll"] !== undefined) {
                    config.scroll = changedConfig["protyleScroll"];
                }
                if (changedConfig?.["protyleBreadcrumb"] !== undefined) {
                    config.breadcrumb = changedConfig["protyleBreadcrumb"];
                }
                if (changedConfig?.["protyleTitle"] !== undefined) {
                    config.protyleTitle = changedConfig["protyleTitle"];
                }
                if (changedConfig?.["protyleReadonly"] !== undefined) {
                    config.readonly = changedConfig["protyleReadonly"];
                }
                if (changedConfig?.["dynamicLoadingEnabled"] !== undefined) {
                    config.dynamicLoading.enabled =
                        changedConfig["dynamicLoadingEnabled"];
                }
                if (changedConfig?.["dynamicLoadingCapacity"] !== undefined) {
                    config.dynamicLoading.capacity =
                        changedConfig["dynamicLoadingCapacity"];
                }
                if (changedConfig?.["dynamicLoadingShift"] !== undefined) {
                    config.dynamicLoading.shift =
                        changedConfig["dynamicLoadingShift"];
                }
                onConfigChanged();
            },
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
                    dynamicLoadingShift: config.dynamicLoading.shift,
                },
            },
        });
        settingComp.$on("changed", ({ detail }) => {
            changedConfig[detail.key] = detail.value;
        });
    }

    //For refresh button
    // const refresh = () => {
    //     loadIdList = [];
    //     onConfigChanged();
    //     setTimeout(() => {
    //         updateLoadIdList();
    //     }, 500);
    // };

    const onCopyLink = () => {
        const prefix = "siyuan://plugins/sy-docs-flow/open-rule";
        let urlObj = new URLSearchParams();
        urlObj.set("ruleType", rule.type);
        urlObj.set("ruleInput", rule.input);
        urlObj.set("ruleTitle", rule.title);
        if (rule.config) {
            urlObj.set("ruleConfig", JSON.stringify(rule.config));
        }

        let url = `${prefix}?${urlObj.toString()}`;
        let markdown = `[${rule.title}](${url})`;
        navigator.clipboard.writeText(markdown).then(() => {
            showMessage("Copy links to clipboard!");
            console.debug("Copy links to clipboard!", markdown);
        });
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
            lastScrollTop = scrollTop; //记录上一次滚动条的位置, 从而判断滚动方向
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

    let scrollTimeout = null;
    export const onscroll = (e) => {
        window.requestAnimationFrame(() => {
            //滚动时隐藏gutter
            if (hideGutterClass === "") {
                hideGutterClass = "hide-gutter";
            }
            if (scrollTimeout !== null) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                hideGutterClass = "";
                scrollTimeout = null;
            }, 500);

            //动态加载
            if (config.dynamicLoading.enabled !== true) {
                return;
            }
            if (loadIdList.length === 0) {
                return;
            }
            dynamicLoading(e);
        });
    };

    /****** Button reload ******/
    let svgRefresh: SVGElement;
    const onClickReload = () => {
        svgRefresh.classList.add("fn__rotate");
        svgRefresh.style.setProperty("background-color", "unset");
        setTimeout(() => {
            svgRefresh.classList.remove("fn__rotate");
            svgRefresh.style.removeProperty("background-color");
        }, 1000);
        reInit();
        showMessage("Reload completed.");
    };

    const editRuleValue = () => {
        let inputText = rule.input2Text();
        let oldinput = rule.input;
        let oldhash = rule.hash;
        let hint = i18n.editRuleVal[rule.type];
        let textarea = document.createElement("textarea");
        textarea.value = inputText;
        textarea.className = "b3-text-field fn__block";
        textarea.placeholder = hint;
        let lineCnt = inputText.split("\n").length;
        lineCnt = Math.min(Math.max(lineCnt, 2), 10) + 1;
        Object.assign(textarea.style, {
            resize: "vertical",
            height: `${lineCnt * 20}px`,
            whiteSpace: "nowrap",
            fontFamily: "var(--b3-font-family-code)"
        });
        textarea.addEventListener("keydown", (e) => {
            if (e.key === "Enter" && !e.ctrlKey) {
                e.stopPropagation();
            }
        });
        confirmDialog(rule.title, textarea, (element: HTMLElement) => {
                let value = element.querySelector("textarea").value.trim();
                if (value === oldinput) {
                    return;
                }
                rule.updateInput(value);
                if (!rule.validateInput()) {
                    rule.input = oldinput;
                    rule.hash = oldhash;
                    return;
                }
                reInit();
            }
        );
    };

    //全局 css，用于隐藏gutter
    let hideGutterClass: '' | 'hide-gutter' = '';

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
            <div class="toolbar__item toolbar__item--active">
                {i18n.docsCnt}: {listDocumentIds.length}
            </div>
            <span class="fn__space" />
            <svg
                bind:this={svgRefresh}
                class="svg-button ariaLabel"
                aria-label={i18n.button.reload}
                on:click={onClickReload} on:keypress={() => {}}
            >
                <use xlink:href="#iconRefresh"></use>
            </svg>
            <span class="fn__space" />
            <svg
                class="svg-button ariaLabel"
                aria-label={i18n.button.reverse}
                on:click={() => {
                    listDocumentIds = listDocumentIds.reverse();
                    updateLoadIdList();
                }}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconScrollVert"></use>
            </svg>
            <span class="fn__space" />
            <svg
                class="svg-button ariaLabel"
                aria-label="编辑"
                on:click={editRuleValue}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconEdit"></use>
            </svg>

            <div id="space" />

            <!-- <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.defaultSetting.scrollMode.title}
            </label>
            <span class="fn__space" />
            <input
                id="enableScroll"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={config.scroll}
                on:change={refresh}
            /> -->

            <span class="fn__space" />

            <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.defaultSetting.displayBreadcrumb.title}
            </label>
            <span class="fn__space" />
            <input
                id="displayBreadcrumb"
                class="b3-switch fn__flex-center"
                type="checkbox"
                bind:checked={config.breadcrumb}
                on:change={onConfigChanged}
            />

            <!-- <span class="fn__space" />

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
            /> -->

            <span class="fn__space" />

            <button class="b3-button" on:click={onOpenConfig}>
                {i18n.button.moreConfig}
            </button>
            <span class="fn__space" />

            <button class="b3-button" on:click={onRenameThis}
                >{i18n.nameTab}</button
            >
            <span class="fn__space" />

            <button class="b3-button" on:click={onSaveThis}>
                {i18n.saveRule}
            </button>
            <span class="fn__space" />

            <button class="b3-button" on:click={onCopyLink}>
                {i18n.copyLink}
            </button>
        </section>
    {/if}
</div>

<div class="docs-flow {hideGutterClass}">
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
            padding: 4px 5px;
            width: 40rem;

            background-color: var(--b3-theme-surface);
            opacity: 1;
            border-radius: 0.5rem;
            box-shadow:
                0 0.5em 1em -0.125em var(--b3-theme-primary-light),
                0 0 0 1px var(--b3-theme-primary-light);

            display: flex;
            align-items: center;

            #space {
                flex: 1;
            }
        }
    }

    svg.svg-button {
        width: 1em; height: 1em;
        padding: 2px;
        &:hover {
            cursor: pointer;
            color: var(--b3-theme-primary);
            background-color: var(--b3-toolbar-hover);
        }
    }

</style>
