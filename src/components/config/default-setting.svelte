<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import SettingPanel from "@/libs/setting-panel.svelte";
    import { setting } from "@/settings";
    import { i18n } from "@/utils";

    export let group: string = "";
    export let display: boolean = true;

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

    const dispatch = createEventDispatcher();

    function onChanged( {detail}) {
        dispatch("changed", detail);
    }

</script>

<SettingPanel
    {group}
    settingItems={DefaultSettingItems}
    {display}
    on:changed={onChanged}
>
    <div slot="top" class="fn__flex b3-label">
        💡 {I18N.descriptioin}
    </div>
</SettingPanel>


<style lang="scss">
    div[slot="top"] {
        color: var(--b3-theme-primary);
        font-weight: bold;
        font-size: 1.2em;
    }
</style>


