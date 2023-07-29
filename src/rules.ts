/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2023-07-29 20:28:02
 * @Description  : 
 */
import {sql} from "@/api";
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

export const sqlQuery = (sqlCode: string): MatchRule => {
    return {
        getIds: async () => {
            let result = await sql(sqlCode);
            let ids = result.map((item) => item?.id).filter((item) => typeof item === "string");
            return ids ?? [];
        }
    };
}
