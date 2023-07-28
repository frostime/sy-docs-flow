<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    // import { sql as query } from "@/api";
    import { showMessage } from "siyuan";
    import Protyle from "./protyle.svelte";

    export let app;

    let blockID: string = '20230612122134-9g2m0ky';

    onMount(async () => {
        // let sql = "SELECT * FROM blocks where type = \"d\" ORDER BY RANDOM () LIMIT 1;";
        // let blocks: Block[] = await query(sql);
        // blockID = blocks[0].id;
    });

    onDestroy(() => {
        showMessage("Hello panel closed");
    });

</script>

<div>
    <Protyle app={app} blockId={blockID} />
    <Protyle app={app} blockId='20230515005454-d5mob4n' />
</div>

