<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-11-19 17:53:31
 FilePath     : /src/components/config/global-setting.svelte
 LastEditTime : 2023-11-19 19:35:52
 Description  : 
-->
<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-11-19 17:53:31
 FilePath     : /src/components/config/global-setting.svelte
 LastEditTime : 2023-11-19 19:10:51
 Description  : 
-->
<script lang="ts">
    import DefaultSetting from "./default-setting.svelte";
    import { setting } from "@/settings";

    let groups: string[] = ["🌈 Default"];
    let focusGroup = $state(groups[0]);

    /********** Events **********/
    const handleChanged = (detail: { key: string; value: any }) => {
        setting.set(detail.key, detail.value);
    };
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                onclick={() => {
                    focusGroup = group;
                }}
                onkeydown={() => {}}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <DefaultSetting
            group={groups[0]}
            display={focusGroup === groups[0]}
            onChanged={handleChanged}
        />
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
</style>
