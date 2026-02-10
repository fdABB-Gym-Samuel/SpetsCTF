<script lang="ts">
    interface Props {
        checked?: boolean;
        name?: string;
    }

    let { checked = $bindable(false), name }: Props = $props();
</script>

<label class="switch">
    <input type="checkbox" bind:checked {name} />
    <span class="slider"></span>
</label>

<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 24px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--color-bg-850);
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 32px;
    }
    .slider:before {
        position: absolute;
        content: '';
        height: 22px;
        width: 25px;
        left: 2px;
        bottom: 1px;
        background-color: var(--color-bg-700);
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border: 2px solid var(--color-bg-800);
        border-radius: 32px;
    }
    input:checked + .slider {
        background: linear-gradient(
            45deg,
            var(--color-primary),
            var(--color-primary-light)
        );
    }
    input:checked + .slider:before {
        background-color: var(--color-primary-extra-light);
        border-color: var(--color-primary-light);
        -webkit-transform: translateX(32px);
        -ms-transform: translateX(32px);
        transform: translateX(32px);
    }
</style>
