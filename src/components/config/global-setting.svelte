<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-11-19 17:53:31
 FilePath     : /src/components/config/global-setting.svelte
 LastEditTime : 2023-11-19 19:10:51
 Description  : 
-->
<script lang="ts">
    import SettingPanel from "@/libs/setting-panel.svelte";
    import { setting } from "@/settings";
    import { i18n } from "@/utils";

    let groups: string[] = ["🌈 Default"];
    let focusGroup = groups[0];

    const I18N = i18n.defaultSetting;

    const DefaultSettingItems: ISettingItem[] = [
        {
            type: 'checkbox',
            title: I18N.scrollMode.title,
            text: I18N.scrollMode.text,
            key: 'protyleScroll',
            value: setting.protyleScroll
        },
        {
            type: 'checkbox',
            title: I18N.displayBreadcrumb.title,
            text: I18N.displayBreadcrumb.text,
            key: 'protyleBreadcrumb',
            value: setting.protyleBreadcrumb
        },
        {
            type: 'checkbox',
            title: I18N.protyleReadonly.title,
            text: I18N.protyleReadonly.text,
            key: 'protyleReadonly',
            value: setting.protyleReadonly
        },
        {
            type: 'checkbox',
            title: I18N.dynamicLoading.title,
            text: I18N.dynamicLoading.text,
            key: 'dynamicLoadingEnabled',
            value: setting.dynamicLoadingEnabled
        },
        {
            type: 'number',
            title: I18N.dynamicLoadingCapacity.title,
            text: I18N.dynamicLoadingCapacity.text,
            key: 'dynamicLoadingCapacity',
            value: setting.dynamicLoadingCapacity
        },
        {
            type: 'number',
            title: I18N.dynamicLoadingShift.title,
            text: I18N.dynamicLoadingShift.text,
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
        >
            <div slot="top" class="fn__flex b3-label">
                💡 {I18N.descriptioin}
            </div>
        </SettingPanel>
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
    .config__tab-wrap {
        div[slot="top"] {
            color: var(--b3-theme-primary);
            font-weight: bold;
            font-size: 1.2em;
        }
    }

</style>
