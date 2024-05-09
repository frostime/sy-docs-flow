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

    - Click it, enter sql statement in the popup window, and then stitch the query blocks into a document stream (similar to embedding blocks).
    - Notice: The number of results is limited by SiYuan's configuration, you can use `LIMIT` in the SQL statement to bypass this limit.

5. Custom ID

    Click it, enter multiple block IDs in the popup window, the IDs can be separated by space, `\n`, `\t`, `,`, the blocks corresponding to these IDs will be stitched together into a document stream.

6. Offspring document

    Add all the offspring documents under a specific document tree.

## Open a document flow via block menu

1. Clicking on a menu of an SQL embedd block, open the SQL query in the document flow.

2. Clicking on a document block menu, open these in a document flow:

    - The backlinks of the document
    - The child document
    - The offspring document

## Inside the document stream

1. Hover over the top of the document stream to bring up the toolbar.

    - Reload: Reload the current Doc-flow
    - Reverse: Sort the current Doc-flow in reverse order
    - Edit: Manually change the values within the current Doc-flow rules (such as SQL statements, parent document ID, etc.)
    - More Config: See "Doc-flow Configuration"
    - Naming Tab: Name the current document stream.
    - Save Rule: save the rules of the current document flow
    - Copy Link: See "Hyperlinks"

2. Click the breadcrumb of each document to open the corresponding document.

3. Click on the icon to the left of the document breadcrumbs to collapse the document and save resources

Here is the translation of the markdown:

## Doc-flow Configuration

Each document flow page has a corresponding configuration rule that controls the display behavior of the document flow.

You can configure the default rule in the global configuration of the plugin, or configure an independent rule for the current document flow on the document flow page.

Basic rules are as follows:

- Scroll Mode
  - Enabled: Single document fixed height, scroll to load its internal content, can save memory resources when a single document is relatively large
  - Disabled: Load all document content (similar to Logseq), may cause performance issues when loading a large number of documents simultaneously
- Display Collapse Bar
- Display Title
- Read-only Mode
- **Dynamic Loading**
  - Documents in the document flow are dynamically loaded as you scroll up and down, can save memory resources when there are many documents
- Dynamic Loading Capacity
  - The maximum number of documents loaded at once during dynamic loading
- Dynamic Loading Increment
  - When dynamic loading is enabled, how many more documents are loaded each time you scroll to the edge (up/down)

> For example: If there are 10 sub-documents below a certain document, and we have enabled dynamic loading and set the capacity and increment to 5 and 3 respectively; when opening the document flow for the first time, documents 1 to 5 will be displayed; when we scroll to the 5th document, documents 4 to 8 will be dynamically loaded and displayed.


## Hyperlinks

This plugin supports quickly opening the corresponding document flow in SiYuan through a hyperlink format. The basic format is as follows:

```
siyuan://plugins/sy-docs-flow/open-rule?ruleType=xxx&ruleInput=xxx
```

In actual use, it only takes two steps:

1. On the document flow tab page, click the "Copy Link" button, and the hyperlink (in markdown format) of the current document flow will be copied to the clipboard.
2. Paste the hyperlink in the editor and click to open the corresponding document flow.

