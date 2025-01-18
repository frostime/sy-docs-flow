<script lang="ts">
    import { fly } from "svelte/transition";

    import { Dialog, showMessage } from "siyuan";
    import { i18n, confirmDialog, isMobile } from "@/utils";
    import { type MatchRule } from "@/rules";

    import DefaultSetting from "../config/default-setting.svelte";
    import { svelteDialog } from "@/libs/dialog";

    import DocsFlowOutline from "./docs-list.svelte";
    import { getContext } from "svelte";

    export let rule: MatchRule;
    export let config: IConfig;
    export let listDocumentIds: DocumentId[];

    export let dispatch: (key: string, detail: any) => void;
    export let reInit: () => void;
    export let updateLoadIdList: () => void;

    const ruleHash: string = rule.hash;

    let showToolbar: boolean = false;

    const getAllDocIds = getContext("getAllDocIds") as () => BlockId[];
    const getLoadedDocIds = getContext("getLoadedDocIds") as () => BlockId[];
    const jumpToDoc = getContext("jumpToDoc") as (id: BlockId) => void;

    function onConfigChanged() {
        dispatch("configChanged", {
            ruleHash,
            config: config,
        });
    }

    function onRenameThis() {
        dispatch("renameThis", { ruleHash });
    }

    function onSaveThis() {
        dispatch("saveThis", { ruleHash });
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
            fontFamily: "var(--b3-font-family-code)",
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
        });
    };

    const showDocsFlowOutline = () => {
        const { close } = svelteDialog({
            title: "Outline",
            constructor: (container: HTMLElement) => {
                return new DocsFlowOutline({
                    target: container,
                    props: {
                        allDocIds: getAllDocIds(),
                        loadedDocIds: getLoadedDocIds(),
                        jumpToDoc: (id: BlockId) => {
                            jumpToDoc(id);
                            close();
                        },
                    },
                });
            },
            width: "1000px",
            height: "80%",
        });
    };

    /****** Pin toolbar ******/
    let pinToolbar = false;
    let classNamePin: "pin" | "unpin" = "unpin";
    $: {
        if (pinToolbar) {
            showToolbar = true;
            classNamePin = "pin";
        } else {
            classNamePin = "unpin";
        }
    }
</script>

<div
    class="docs-flow__toolbar {classNamePin} {isMobile() ? 'is-mobile' : ''}"
    on:mouseenter={() => {
        if (pinToolbar) return;
        showToolbar = true;
    }}
    on:mouseleave={() => {
        if (pinToolbar) return;
        showToolbar = false;
    }}
>
    {#if showToolbar}
        <section
            class="docs-flow__toolbar-body"
            in:fly={{ y: -20, duration: 500 }}
            out:fly={{ y: -20, duration: 500 }}
        >
            <div class="toolbar__item toolbar__item--active">
                <span class=" {isMobile() ? 'fn__none' : ''}"
                    >{i18n.docsCnt}:</span
                >
                {listDocumentIds.length}
            </div>

            <svg
                class="svg-button ariaLabel"
                aria-label="Outline"
                on:click={showDocsFlowOutline}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconList"></use>
            </svg>

            <svg
                bind:this={svgRefresh}
                class="svg-button ariaLabel"
                aria-label={i18n.button.reload}
                on:click={onClickReload}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconRefresh"></use>
            </svg>

            <svg
                class="svg-button ariaLabel hide-if-very-narrow"
                aria-label={i18n.button.reverse}
                on:click={() => {
                    listDocumentIds = listDocumentIds.reverse();
                    updateLoadIdList();
                }}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconScrollVert"></use>
            </svg>

            <svg
                class="svg-button ariaLabel hide-if-very-narrow"
                aria-label={i18n.button.edit}
                on:click={editRuleValue}
                on:keypress={() => {}}
            >
                <use xlink:href="#iconEdit"></use>
            </svg>
            <svg
                class="svg-button ariaLabel"
                aria-label={i18n.button.pin}
                on:click={() => {
                    pinToolbar = !pinToolbar;
                }}
                on:keypress={() => {}}
            >
                {#if pinToolbar}
                    <use xlink:href="#iconLock"></use>
                {:else}
                    <use xlink:href="#iconUnlock"></use>
                {/if}
            </svg>

            <div id="space" />

            <label
                class="b3-label__text"
                for="enableScroll"
                style="margin-top: 0px;"
            >
                {i18n.defaultSetting.displayBreadcrumb.title}
            </label>

            <input
                id="displayBreadcrumb"
                class="b3-switch fn__flex-center hide-if-very-narrow"
                type="checkbox"
                bind:checked={config.breadcrumb}
                on:change={onConfigChanged}
            />

            <button
                class="b3-button {isMobile()
                    ? 'b3-button--text'
                    : ''}"
                on:click={onOpenConfig}
            >
                {i18n.button.moreConfig}
            </button>

            <div
                id="group-right"
                class="fn__flex {isMobile() ? 'fn__none' : ''}"
                style="gap: 5px;"
            >
                <button class="b3-button hide-if-narrow" on:click={onRenameThis}
                    >{i18n.nameTab}</button
                >
                <button
                    class="b3-button hide-if-very-narrow"
                    on:click={onSaveThis}
                >
                    {i18n.saveRule}
                </button>
                <button class="b3-button hide-if-narrow" on:click={onCopyLink}>
                    {i18n.copyLink}
                </button>
            </div>
        </section>
    {/if}
</div>

<style lang="scss">
    .docs-flow__toolbar {
        height: 3rem;
        padding: 0;
        position: absolute;

        --width: 70%;
        --left: calc(calc(100% - var(--width)) / 2);

        width: var(--width);
        left: var(--left);

        top: 15px;
        z-index: 10;
        display: flex;
        justify-content: center;
        align-items: center;

        container-type: inline-size;
        container-name: docs-flow-toolbar;
    }

    .docs-flow__toolbar section.docs-flow__toolbar-body {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 5px;
        padding: 4px 5px;

        height: 30px;
        background-color: var(--b3-theme-surface);
        opacity: 1;
        border-radius: 10px;
        box-shadow:
            0 0.5em 1em -0.125em var(--b3-theme-primary-light),
            0 0 0 1px var(--b3-theme-primary-light);

        #space {
            flex: 1;
        }

        flex-wrap: nowrap;

        @container docs-flow-toolbar (max-width: 600px) {
            .b3-label__text {
                display: none;
            }
            .hide-if-narrow {
                display: none;
            }
        }

        @container docs-flow-toolbar (max-width: 400px) {
            .hide-if-very-narrow {
                display: none;
            }
        }
    }

    .docs-flow__toolbar.is-mobile {
        --width: 95%;
    }
    .docs-flow__toolbar:not(.is-mobile) {
        @container docs-flow (min-width: 1000px) {
            --width: 72%;
        }

        @container docs-flow (max-width: 800px) {
            --width: 90%;
        }

        section.docs-flow__toolbar-body {
            @container docs-flow-toolbar (min-width: 720px) {
                width: 720px;
            }
            @container docs-flow-toolbar (max-width: 720px) {
                max-width: 100%;
            }
            @container docs-flow-toolbar (max-width: 400px) {
                width: 100%;
            }
        }
    }

    .docs-flow__toolbar svg.svg-button {
        width: 18px;
        height: 18px;
        padding: 2px;
        &:hover {
            cursor: pointer;
            color: var(--b3-theme-primary);
            background-color: var(--b3-toolbar-hover);
        }
    }
</style>
