<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import SettingPanel from "@/libs/setting-panel.svelte";
    import { setting } from "@/settings";
    import { i18n } from "@/utils";

    const I18N = i18n.defaultSetting;

    export let group: string = "";
    export let display: boolean = true;
    export let settingValue = {};

    export let descriptioin = I18N.descriptioin;

    const SettingItemsValue = {
        protyleScroll: setting.protyleScroll,
        protyleBreadcrumb: setting.protyleBreadcrumb,
        protyleTitle: setting.protyleTitle,
        protyleReadonly: setting.protyleReadonly,
        dynamicLoadingEnabled: setting.dynamicLoadingEnabled,
        dynamicLoadingCapacity: setting.dynamicLoadingCapacity,
        dynamicLoadingShift: setting.dynamicLoadingShift,
    };

    let DefaultSettingItems: ISettingItem[] = [];

    onMount(() => {
        for (let key in settingValue) {
            if (key in SettingItemsValue) {
                SettingItemsValue[key] = settingValue[key];
            }
        }
        DefaultSettingItems = [
            {
                type: "checkbox",
                title: I18N.scrollMode.title,
                text: I18N.scrollMode.text,
                key: "protyleScroll",
                value: SettingItemsValue.protyleScroll,
            },
            {
                type: "checkbox",
                title: I18N.displayBreadcrumb.title,
                text: I18N.displayBreadcrumb.text,
                key: "protyleBreadcrumb",
                value: SettingItemsValue.protyleBreadcrumb,
            },
            {
                type: "checkbox",
                title: I18N.protyleTitle.title,
                text: I18N.protyleTitle.text,
                key: "protyleTitle",
                value: SettingItemsValue.protyleTitle,
            },
            {
                type: "checkbox",
                title: I18N.protyleReadonly.title,
                text: I18N.protyleReadonly.text,
                key: "protyleReadonly",
                value: SettingItemsValue.protyleReadonly,
            },
            {
                type: "checkbox",
                title: I18N.dynamicLoading.title,
                text: I18N.dynamicLoading.text,
                key: "dynamicLoadingEnabled",
                value: SettingItemsValue.dynamicLoadingEnabled,
            },
            {
                type: "number",
                title: I18N.dynamicLoadingCapacity.title,
                text: I18N.dynamicLoadingCapacity.text,
                key: "dynamicLoadingCapacity",
                value: SettingItemsValue.dynamicLoadingCapacity,
            },
            {
                type: "number",
                title: I18N.dynamicLoadingShift.title,
                text: I18N.dynamicLoadingShift.text,
                key: "dynamicLoadingShift",
                value: SettingItemsValue.dynamicLoadingShift,
            },
        ];
    });

    const dispatch = createEventDispatcher();

    function onChanged({ detail }) {
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
        💡 {descriptioin}
    </div>
</SettingPanel>

<style lang="scss">
    div[slot="top"] {
        color: var(--b3-theme-primary);
        font-weight: bold;
        font-size: 1.2em;
    }
</style>
