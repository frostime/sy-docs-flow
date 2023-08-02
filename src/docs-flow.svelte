<!--
 Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 Author       : Yp Z
 Date         : 2023-07-28 20:49:27
 FilePath     : /src/docs-flow.svelte
 LastEditTime : 2023-07-29 22:30:54
 Description  : 
-->
<script lang="ts">
    import Protyle from "./protyle.svelte";

    export let app: any;
    export let listDocuemntsId: DocumentId[] = [];
</script>

<div class="docs-flow">
    <!-- <Protyle app={app} blockId={blockID} />
    <Protyle app={app} blockId='20230515005454-d5mob4n' /> -->
    {#each listDocuemntsId as did}
        <Protyle app={app} blockId={did}/>
    {/each}
</div>

