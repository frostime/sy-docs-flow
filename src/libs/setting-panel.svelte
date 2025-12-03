<!--
 Copyright (c) 2023 by frostime All Rights Reserved.
 Author       : frostime
 Date         : 2023-07-01 19:23:50
 FilePath     : /src/libs/setting-panel.svelte
 LastEditTime : 2023-11-19 19:00:06
 Description  : 
-->
<script lang="ts">
    import SettingItem from "./setting-item.svelte";

    interface Props {
        group: string;
        settingItems: ISettingItem[];
        display?: boolean;
        top?: import("svelte").Snippet;
        bottom?: import("svelte").Snippet;
        onClick?: (detail: { key: string }) => void;
        onChanged?: (detail: {
            detail: { group: string; key: string; value: any };
        }) => void;
    }

    let {
        group,
        settingItems,
        display = true,
        top,
        bottom,
        onClick,
        onChanged,
    }: Props = $props();

    function handleClick(detail: { key: string }) {
        onClick?.({ key: detail.key });
    }
    function handleChanged(detail: { key: string; value: any }) {
        onChanged?.({ detail: { group: group, ...detail } });
    }

    let fn__none = $derived(display ? "" : "fn__none");
</script>

<div class="config__tab-container {fn__none}" data-name={group}>
    {@render top?.()}
    {#each settingItems as item (item.key)}
        <SettingItem
            type={item.type}
            title={item.title}
            text={item.text}
            settingKey={item.key}
            settingValue={item.value}
            placeholder={item?.placeholder}
            options={item?.options}
            slider={item?.slider}
            onClick={handleClick}
            onChanged={handleChanged}
        />
    {/each}
    {@render bottom?.()}
</div>
