<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let savedRules: { [key: string]: IRule } = {};

    const dispatch = createEventDispatcher();

    const deleteRule = (hash: string) => {
        delete savedRules[hash];
        savedRules = { ...savedRules };
    };

    const cancel = () => {
        dispatch("cancel");
    };

    const confirm = () => {
        dispatch("confirm", savedRules);
    };
</script>

<div class="b3-dialog__content">
    <div class="ft__breakword">
        <div class="save-rule-list">
            {#each Object.entries(savedRules) as [hash, rule]}
                <div class="b3-menu__item" data-hash={hash}>
                    <div class="b3-menu__label" contenteditable="true">
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
                    <div class="b3-menu__label">空...</div>
                </div>
            {/each}
        </div>
    </div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel" on:click={() => cancel()}
        >{window.siyuan.languages.cancel}</button
    >
    <div class="fn__space" />
    <button class="b3-button b3-button--text" on:click={() => confirm()}
        >{window.siyuan.languages.confirm}</button
    >
</div>

<style lang="scss">
    div.save-rule-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
</style>
