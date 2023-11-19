<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-11-19 17:53:31
 FilePath     : /src/components/config/global-setting.svelte
 LastEditTime : 2023-11-19 18:25:26
 Description  : 
-->
<script lang="ts">
    import SettingPanel from "@/libs/setting-panel.svelte";
    import { setting } from "@/settings";
    import { i18n } from "@/utils";

    let groups: string[] = ["Default"];
    let focusGroup = groups[0];

    const DefaultSettingItems: ISettingItem[] = [
        {
            type: 'checkbox',
            title: i18n.scrollMode,
            text: '滚动模式',
            key: 'protyleScroll',
            value: setting.protyleScroll
        },
        {
            type: 'checkbox',
            title: i18n.displayBreadcrumb,
            text: '展示面包屑',
            key: 'protyleBreadcrumb',
            value: setting.protyleBreadcrumb
        },
        {
            type: 'checkbox',
            title: '只读',
            text: '只读模式打开',
            key: 'protyleReadonly',
            value: setting.protyleReadonly
        },
        {
            type: 'checkbox',
            title: i18n.dynamicLoading,
            text: '动态加载',
            key: 'dynamicLoadingEnabled',
            value: setting.dynamicLoadingEnabled
        },
        {
            type: 'number',
            title: '动态加载最大数量',
            text: '动态加载',
            key: 'dynamicLoadingCapacity',
            value: setting.dynamicLoadingCapacity
        },
        {
            type: 'number',
            title: '动态加载增量',
            text: '动态加载增量',
            key: 'dynamicLoadingShift',
            value: setting.dynamicLoadingShift
        },
    ];

    /********** Events **********/
    interface ChangeEvent {
        group: string;
        key: string;
        value: any;
    }

    const onChange = ({detail}: CustomEvent<ChangeEvent>) => {
        if (detail.group === 'Default') {
            setting.set(detail.key, detail.value);
        }
    }

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
        <SettingPanel
            group={groups[0]}
            settingItems={DefaultSettingItems}
            display={focusGroup === groups[0]}
            on:changed={onChange}
        />
    </div>
</div>

<style>
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
</style>
