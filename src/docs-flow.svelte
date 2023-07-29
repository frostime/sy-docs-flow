<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/docs-flow.svelte
 LastEditTime : 2023-07-29 15:15:27
 Description  : 
-->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    // import { sql as query } from "@/api";
    import { showMessage } from "siyuan";
    import Protyle from "./protyle.svelte";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];

    // let blockID: string = '20230612122134-9g2m0ky';

    onMount(async () => {
        // let sql = "SELECT * FROM blocks where type = \"d\" ORDER BY RANDOM () LIMIT 1;";
        // let blocks: Block[] = await query(sql);
        // blockID = blocks[0].id;
    });

    onDestroy(() => {
        showMessage("Hello panel closed");
    });

</script>

<div class="docs-flow">
    <!-- <Protyle app={app} blockId={blockID} />
    <Protyle app={app} blockId='20230515005454-d5mob4n' /> -->
    {#each listDocuemntsId as did}
        <Protyle app={app} blockId={did} />
    {/each}
</div>

