<script lang="ts">
    //Optional
    interface Props {
        type: string;
        title: string;
        text: string;
        settingKey: string;
        settingValue: any;
        placeholder?: string;
        options?: { [key: string]: string };
        slider?: {
            min: number;
            max: number;
            step: number;
        };
        onClick?: (detail: { key: string }) => void;
        onChanged?: (detail: { key: string; value: any }) => void;
    }

    let {
        type,
        title,
        text,
        settingKey,
        settingValue = $bindable(),
        placeholder = "",
        options = {},
        slider = { min: 0, max: 100, step: 1 },
        onClick,
        onChanged,
    }: Props = $props();

    function clicked() {
        onClick?.({ key: settingKey });
    }

    function changed() {
        onChanged?.({ key: settingKey, value: settingValue });
    }
</script>

<label class="fn__flex b3-label">
    <div class="fn__flex-1">
        {title}
        <div class="b3-label__text">
            {@html text}
        </div>
    </div>
    <span class="fn__space"></span>
    <!-- <slot /> -->
    {#if type === "checkbox"}
        <!-- Checkbox -->
        <input
            class="b3-switch fn__flex-center"
            id={settingKey}
            type="checkbox"
            bind:checked={settingValue}
            onchange={changed}
        />
    {:else if type === "input"}
        <!-- Text Input -->
        <input
            class="b3-text-field fn__flex-center fn__size200"
            id={settingKey}
            {placeholder}
            bind:value={settingValue}
            onchange={changed}
        />
    {:else if type === "number"}
        <input
            class="b3-text-field fn__flex-center fn__size200"
            id={settingKey}
            type="number"
            bind:value={settingValue}
            onchange={changed}
        />
    {:else if type === "button"}
        <!-- Button Input -->
        <button
            class="b3-button b3-button--outline fn__flex-center fn__size200"
            id={settingKey}
            onclick={clicked}
        >
            {settingValue}
        </button>
    {:else if type === "select"}
        <!-- Dropdown select -->
        <select
            class="b3-select fn__flex-center fn__size200"
            id={settingKey}
            bind:value={settingValue}
            onchange={changed}
        >
            {#each Object.entries(options) as [value, text]}
                <option {value}>{text}</option>
            {/each}
        </select>
    {:else if type == "slider"}
        <!-- Slider -->
        <div class="b3-tooltips b3-tooltips__n" aria-label={settingValue}>
            <input
                class="b3-slider fn__size200"
                id={settingKey}
                min={slider.min}
                max={slider.max}
                step={slider.step}
                type="range"
                bind:value={settingValue}
                onchange={changed}
            />
        </div>
    {/if}
</label>
