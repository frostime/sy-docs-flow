<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-08-09 18:08:55
 FilePath     : /src/components/config/saved-rules.svelte
 LastEditTime : 2024-04-23 11:52:25
 Description  : 
-->
<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { i18n } from "@/utils";

    export let savedRules: { [key: string]: IRule } = {};

    const dispatch = createEventDispatcher();

    const deleteRule = (hash: string) => {
        // delete savedRules[hash];
        // savedRules = { ...savedRules };
        let newSavedRules = {};
        for (let key in savedRules) {
            if (key !== hash) {
                newSavedRules[key] = savedRules[key];
            }
        }
        savedRules = newSavedRules;
    };

    const onTextChange = (e) => {
        let ele = e.target as HTMLInputElement;
        let hash = ele.getAttribute("data-hash");
        savedRules[hash].title = ele.innerText;
        // savedRules = { ...savedRules };
    };

    const cancel = () => {
        dispatch("cancel");
    };

    const confirm = () => {
        dispatch("confirm", savedRules);
    };

    /********** Dragging **********/
    let draggedItem = null;

    function onDragStart(event: DragEvent, hash: string) {
        draggedItem = hash;
        event.dataTransfer.effectAllowed = "move";
        // Optional: add a drag image or some effect
    }

    function onDrop(event: DragEvent, targetHash: string) {
        event.preventDefault();
        if (draggedItem && draggedItem !== targetHash) {
            let newSavedRules = {};
            let keys = Object.keys(savedRules);
            let draggedIndex = keys.indexOf(draggedItem);
            let targetIndex = keys.indexOf(targetHash);

            keys.splice(draggedIndex, 1);
            keys.splice(targetIndex, 0, draggedItem);

            keys.forEach((key) => {
                newSavedRules[key] = savedRules[key];
            });
            savedRules = newSavedRules;
        }
        draggedItem = null;
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    function onDragEnd() {
        draggedItem = null;
    }
</script>

<div class="b3-dialog__content">
    <div class="ft__breakword">
        <div class="b3-menu__item" style="text-align: end;">
            {i18n.configSavedRule}
        </div>
        <div class="b3-menu__separator" />
        <div class="save-rule-list">
            {#each Object.entries(savedRules) as [hash, rule]}
                <div
                    class="b3-menu__item"
                    draggable="true"
                    on:dragstart={(e) => onDragStart(e, hash)}
                    on:drop={(e) => onDrop(e, hash)}
                    on:dragover={(e) => onDragOver(e)}
                    on:dragend={() => onDragEnd()}
                >
                    <div
                        class="b3-menu__label"
                        contenteditable="true"
                        data-hash={hash}
                        on:input={(e) => onTextChange(e)}
                    >
                        {rule.title}
                    </div>
                    <span class="fn__space" />
                    <svg
                        class="b3-menu__icon"
                        on:click={() => deleteRule(hash)}
                        on:keypress={() => {}}
                    >
                        <use xlink:href="#iconClose" />
                    </svg>
                </div>
            {:else}
                <div class="b3-menu__item">
                    <div class="b3-menu__label">{i18n.empty}</div>
                </div>
            {/each}
        </div>
    </div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel" on:click={() => cancel()}>
        {window.siyuan.languages.cancel}
    </button>
    <div class="fn__space" />
    <button class="b3-button b3-button--text" on:click={() => confirm()}>{
        window.siyuan.languages.confirm}
    </button>
</div>

<style lang="scss">
    div.save-rule-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>
