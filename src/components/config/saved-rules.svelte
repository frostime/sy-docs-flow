<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-08-09 18:08:55
 FilePath     : /src/components/config/saved-rules.svelte
 LastEditTime : 2024-04-23 11:52:25
 Description  : 
-->
<script lang="ts">
    import { i18n } from "@/utils";

    interface Props {
        savedRules?: { [key: string]: IRule };
        onCancel?: () => void;
        onConfirm?: (savedRules: { [key: string]: IRule }) => void;
    }

    let { savedRules = $bindable({}), onCancel, onConfirm }: Props = $props();

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
        onCancel?.();
    };

    const confirm = () => {
        onConfirm?.(savedRules);
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
        <div class="b3-menu__separator"></div>
        <div class="save-rule-list">
            {#each Object.entries(savedRules) as [hash, rule]}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                    class="b3-menu__item"
                    draggable="true"
                    ondragstart={(e) => onDragStart(e, hash)}
                    ondrop={(e) => onDrop(e, hash)}
                    ondragover={(e) => onDragOver(e)}
                    ondragend={() => onDragEnd()}
                >
                    <div
                        class="b3-menu__label"
                        contenteditable="true"
                        data-hash={hash}
                        oninput={(e) => onTextChange(e)}
                    >
                        {rule.title}
                    </div>
                    <span class="fn__space"></span>
                    <svg
                        class="b3-menu__icon"
                        onclick={() => deleteRule(hash)}
                        onkeypress={() => {}}
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
    <button class="b3-button b3-button--cancel" onclick={() => cancel()}>
        {window.siyuan.languages.cancel}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--text" onclick={() => confirm()}>{
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
