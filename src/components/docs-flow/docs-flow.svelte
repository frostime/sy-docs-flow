<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/components/docs-flow/docs-flow.svelte
 LastEditTime : 2025-01-18 19:03:34
 Description  : 
-->
<script lang="ts">
    import { showMessage } from "siyuan";
    import Protyle from "./protyle.svelte";
    import { createEventDispatcher, onMount, setContext } from "svelte";
    import { throttle, firstPara2Parent, isMobile } from "@/utils";

    import Toolbar from "./docs-flow-toolbar.svelte";

    import { type MatchRule } from "@/rules";

    export let app: any;
    export let rule: MatchRule;
    export let listDocumentIds: DocumentId[] = []; //所有文档列表

    // const ruleHash: string = rule.hash;
    let config: IConfig = rule.config;

    let loadOffset: number = 0; //当前动态加载的文档偏移量
    let loadLength: number = config.dynamicLoading.capacity; //每次动态加载的文档数量
    let shiftLength: number = config.dynamicLoading.shift; //每次动态加载时的偏移量
    let loadIdList: DocumentId[] = []; //当前动态加载的文档列表

    setContext("getAllDocIds", () => {
        return listDocumentIds;
    });

    setContext("getLoadedDocIds", () => {
        return loadIdList;
    });

    const reInit = async () => {
        let ids = await rule.fetch();
        // listDocumentIds = ids;
        listDocumentIds = await firstPara2Parent(ids);
        if (!ids || ids.length === 0) {
            showMessage("No matching docs found.");
            return;
        }
        updateLoadIdList();
    };

    onMount(async () => {
        reInit();
    });

    const jumpToDoc = (id: BlockId) => {
        console.log("jumpToDoc", id);
        // 如果是动态加载，则先更新 loadOffset，让文档加载到可视区域
        if (config.dynamicLoading.enabled === true) {
            let index = listDocumentIds.indexOf(id);
            if (index === -1) {
                return;
            }
            if (index + loadLength >= listDocumentIds.length) {
                index = listDocumentIds.length - loadLength - 1;
            }
            loadOffset = index;
            updateLoadIdList();
        }
        //然后再滚动到指定文档
        const queryAndScroll = () => {
            const ele = document.querySelector(
                `.docs-flow__doc[data-node-id="${id}"] > .protyle-breadcrumb__item`,
            );
            if (ele) {
                // ele.scrollIntoView({ behavior: "smooth", block: "start" });
                ele.scrollIntoView(true);
                return true;
            }
            return false;
        };

        const MAX_ATTEMPTS = 5;
        const TRY_INTERVAL = 500;
        let attempts = 0;

        const attemptScroll = () => {
            if (queryAndScroll()) {
                console.debug("滚动成功");
            } else if (attempts < MAX_ATTEMPTS) {
                console.debug(
                    `滚动失败，${TRY_INTERVAL * (attempts + 1)}ms 后重试`,
                );
                attempts++;
                setTimeout(attemptScroll, TRY_INTERVAL);
            } else {
                console.debug("滚动失败，已达到最大尝试次数");
            }
        };

        // 立即尝试第一次滚动
        attemptScroll();
    };

    setContext("jumpToDoc", jumpToDoc);

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
        if (
            config.dynamicLoading.enabled !== true ||
            listDocumentIds.length === 0
        ) {
            return;
        }

        const originalOffset = loadOffset;
        let newOffset = loadOffset;
        if (direction === "left" && originalOffset > 0) {
            newOffset = Math.max(originalOffset - shiftLength, 0);
        } else if (
            direction === "right" &&
            originalOffset + loadLength < listDocumentIds.length
        ) {
            newOffset = Math.min(
                originalOffset + shiftLength,
                listDocumentIds.length - loadLength,
            );
            newOffset = Math.max(newOffset, 0); //防止极端情况下 offset 为负数
        }

        if (newOffset !== originalOffset) {
            loadOffset = newOffset;
            updateLoadIdList();
        }
    };

    const shiftThrottle = throttle(shift, 600); //防止滚动过快导致的频繁加载

    const dispatch = createEventDispatcher();

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

        const EPSILON = 5;

        // epsilon 不能太小，否则会导致无法触发
        if (approxEqual(scrollTop, 0, EPSILON) && scrollTop <= lastScrollTop) {
            console.log("到顶了");
            shiftThrottle("left");
        } else if (
            approxEqual(scrollTop + clientHeight, scrollHeight, EPSILON) &&
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

    //全局 css，用于隐藏gutter
    let hideGutterClass: "" | "hide-gutter" = "";
    let docsFlow: HTMLElement;

    setContext("docsFlow", () => docsFlow);

</script>

<main class="docs-flow-container">
    <Toolbar
        bind:rule
        bind:config
        bind:listDocumentIds
        {updateLoadIdList}
        {dispatch}
        {reInit}
    />

    <div
        class="docs-flow fn__flex-1 {hideGutterClass}"
        style="--display-breadcrumb: {isMobile() ? 'none' : 'flex'}"
        bind:this={docsFlow}
    >
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
</main>

<style lang="scss">

    .docs-flow {
        @media (max-width: 767px) {
            width: 100vw;
        }
        :global(div.docs-flow__protyle .protyle-breadcrumb) {
            display: var(--display-breadcrumb);
        }
    }
</style>
