<!--
 Copyright (c) 2024 by frostime. All Rights Reserved.
 Author       : frostime
 Date         : 2024-10-01 20:33:19
 FilePath     : /src/components/docs-flow/docs-list.svelte
 LastEditTime : 2025-01-18 19:20:08
 Description  : 

 显示所有的文档

 foreach 文档列表
    每个文件
        文档名称
        最右侧：按钮
        背景颜色：如果是 loadedDocIds，则显示背景颜色
-->
<script lang="ts">
    import { getBlocksByIds } from "@/api";
    import { notebooks } from "@/utils";
    import { onMount } from "svelte";

    export let allDocIds: BlockId[];
    export let hightlightIds: BlockId[];
    export let jumpToDoc: (id: BlockId) => void;

    let docInfo: Record<BlockId, { title: string; hpath: string; box: string }> = {};

    onMount(async () => {
        const blocks: Block[] = await getBlocksByIds(...allDocIds);
        blocks.forEach((block: Block) => {
            docInfo[block.id] = {
                // title: truncateString(block.fcontent || block.content, 40),
                title: block.fcontent || block.content,
                hpath: block.hpath,
                box: notebooks?.[block.box] || ""
            };
        });

        // Scroll to first loaded item
        scrollToFirstLoadedItem();
    });

    // function truncateString(str: string, maxLength: number): string {
    //     return str.length > maxLength
    //         ? str.substring(0, maxLength) + "..."
    //         : str;
    // }

    function isLoaded(id: BlockId): boolean {
        return hightlightIds.includes(id);
    }

    function scrollToDoc(id: BlockId) {
        jumpToDoc(id);
    }

    function scrollToFirstLoadedItem() {
        const firstLoadedItem = document.querySelector(".loaded");
        if (firstLoadedItem) {
            firstLoadedItem.scrollIntoView({ behavior: "instant" });
        }
    }
</script>

<div class="docs-flow-list">
    <h3>Documents List</h3>
    <ul>
        {#each allDocIds as docId, index}
            <li class:loaded={isLoaded(docId)} data-node-id={docId}>
                <span class="doc-number">{index + 1}.</span>
                <span class="doc-title">
                    {docInfo[docId]?.title || `Document ${index + 1}`}
                </span>
                <span class="doc-hpath">{docInfo[docId]?.box}{docInfo[docId]?.hpath || ""}</span>
                <button class="jump-button popover__block" data-id={docId} on:click={() => scrollToDoc(docId)}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M5 12h14"></path>
                        <path d="M12 5l7 7-7 7"></path>
                    </svg>
                </button>
            </li>
        {/each}
    </ul>
</div>

<style>
    .docs-flow-list {
        /* max-height: 400px; */
        overflow-y: auto;
        padding: 10px;
        border: 1px solid var(--b3-theme-surface-lighter);
        border-radius: 4px;
        flex: 1;
    }

    h3 {
        margin-top: 0;
        margin-bottom: 10px;
    }

    ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
    }

    li {
        display: flex;
        align-items: center;
        justify-content: space-between;
        /* margin-bottom: 5px; */
        margin: 0;
        padding: 5px;
        /* border-radius: 4px; */
        border-radius: 0px;
        transition: background-color 0.3s ease;
        cursor: default;

        &:hover {
            color: var(--b3-theme-primary);
        }
    }

    li.loaded {
        background-color: var(--b3-theme-primary-lightest);
    }

    li.loaded:first-child {
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
    }

    li.loaded:last-child {
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }

    .doc-number {
        margin-right: 5px;
        font-weight: bold;
    }

    .doc-title {
        flex-grow: 1;
        margin-right: 10px;
        /* 隐藏超过限度的文字 */
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .doc-hpath {
        font-size: 12px;
        color: var(--b3-theme-on-surface-light);
        margin-right: 10px;
        white-space: nowrap;
    }

    .jump-button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .jump-button:hover {
        background-color: var(--b3-theme-background-light);
        border-radius: 50%;
    }

    button {
        background: none;
        border: none;
        cursor: pointer;
        color: var(--b3-theme-on-background);
        text-align: left;
        padding: 0;
        font-size: 14px;
    }

    button:hover {
        text-decoration: underline;
    }
</style>
