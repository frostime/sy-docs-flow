# Document Flow Plugin

The function of this plugin is to stitch multiple documents (blocks) in the same page for easy viewing.

## Create a document flow

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

## Inside the document stream

1. Hover over the top of the document stream to bring up the toolbar.

    - Scroll mode
        - Off: loads each document at once, may cause performance issue if the document is too large.
        - On: dynamically loads each document in a scrolled window.
    - Naming Tab: Name the current document stream.
    - Save Rule: save the rules of the current document flow

2. Click the breadcrumb of each document to open the corresponding document.

3. Click on the icon to the left of the document breadcrumbs to collapse the document and save resources
