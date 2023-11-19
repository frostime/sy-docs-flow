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
    let focusGroup = groups[0];

    /********** Events **********/
    interface ChangeEvent {
        group: string;
        key: string;
        value: any;
    }

    const onChanged = ({ detail }: CustomEvent<ChangeEvent>) => {
        if (detail.group === groups[0]) {
            setting.set(detail.key, detail.value);
        }
    };
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                on:click={() => {
                    focusGroup = group;
                }}
                on:keydown={() => {}}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <DefaultSetting
            group={groups[0]}
            display={focusGroup === groups[0]}
            on:changed={onChanged}
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
