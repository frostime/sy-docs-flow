# Document Flow Plugin

The function of this plugin is to stitch multiple documents (blocks) in the same page for easy viewing.

## Open a document flow via topbar menu

After enabling the plugin, click the icon in the top bar and select the desired rule to generate a document flow.

1. Child document

    Click it to stitch the currently opened document and its child-documents into a document stream.

2. Document backlinks

    Click to open all backlinks to the current document.

3. Document Mentions

    Click to open all backlinks to the current document.

4. SQL Query

    Click it, enter sql statement in the popup window, and then stitch the query blocks into a document stream (similar to embedding blocks).

5. Custom ID

    Click it, enter multiple block IDs in the popup window, the IDs can be separated by space, `\n`, `\t`, `,`, the blocks corresponding to these IDs will be stitched together into a document stream.

6. Offspring document

    Add all the offspring documents under a specific document tree.

## Open a document flow via block menu

1. Clicking on a menu of an SQL embedd block, open the SQL query in the document flow.

2. Clicking on a document block menu, open the backlinks of the document in the document flow.

## Inside the document stream

1. Hover over the top of the document stream to bring up the toolbar.

    - Scroll mode
        - Off: loads each document at once, may cause performance issue if the document is too large.
        - On: dynamically loads each document in a scrolled window.
    - Naming Tab: Name the current document stream.
    - Save Rule: save the rules of the current document flow

2. Click the breadcrumb of each document to open the corresponding document.

3. Click on the icon to the left of the document breadcrumbs to collapse the document and save resources

## Developers

This plugin exposes specific events for external code to call. Here's how to call them:

1. Get the `eventBus` object of this plugin under `window.siyuan.ws.app.plugins`

   ```js
   window.siyuan.ws.app.plugins.find(p => p.name === 'sy-docs-flow')?.eventBus
   ```

2. Use `eventBus.emit(rule: TRuleType, e: CustomEventDetail)` to send a request to open the document flow.

   ```ts
   type TRuleType = "SQL" | "IdList";
   interface CustomEventDetail {
       input: any;
       config?: object;
   }
   ```

   - When `rule` is `"IdList"`, `input` should be an array of `BlockId`
   - When `rule` is `"SQL"`, `input` should be a string.

    `config`'s key could be parts of type `IConfig`.

    ```ts
    interface IConfig {
        scroll: boolean;
        breadcrumb: boolean;
        readonly: boolean;
        dynamicLoading: {
            enabled: boolean;
            capacity: number;
            shift: number;
        };
    }
    ```

    Example:
    ```js
    let eb = window.siyuan.ws.app.plugins.find(p => p.name === 'sy-docs-flow')?.eventBus;
    if (eb === undefined ) {
        return;
    }
    let detail = {
        input: "SELECT * FROM blocks ORDER BY random() LIMIT 3",
        config: {
            readonly: true,
            breadcrumb: false,
            dynamicLoading: { enabled: true }
        }
    };

    eb.emit("SQL", detail);
    ```
