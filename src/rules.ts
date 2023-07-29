import { getChildDocs } from "./utils";

export interface MatchRule {
    getIds(): DocumentId[] | Promise<DocumentId[]>;
}

export const childOfCurrentDocument: MatchRule = {
    getIds: async () => {
        const currentDocument = document.querySelector(
            ".layout-tab-container.fn__flex-1>div.fn__flex-1.protyle:not(.fn__none)"
        );
        if (!currentDocument) {
            return [];
        }
        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");

        let child = await getChildDocs(dataId);
        console.log(child);
        return [dataId, ...child];
    }
};
