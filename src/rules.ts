/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2023-07-29 21:37:06
 * @Description  : 
 */
import {sql} from "@/api";
import { getChildDocs } from "./utils";

export abstract class MatchRule {
    hash: string;
    type: string;
    input: any;
    abstract getIds(): DocumentId[] | Promise<DocumentId[]>;
}

class ChildDocument extends MatchRule {
    constructor() {
        super();
        this.type = "ChildDocument";
        this.input = null;
        const currentDocument = document.querySelector(
            ".layout-tab-container.fn__flex-1>div.fn__flex-1.protyle:not(.fn__none)"
        );
        
        this.hash = `ChildDocument`;

        if (!currentDocument) {
            return;
        }

        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");
        this.input = dataId;
        this.hash = `ChildDocument@${dataId}`;
    }

    async getIds() {
        if (!this.input) {
            return [];
        }
        let child = await getChildDocs(this.input);
        return [this.input, ...child];
    }
}


class SQL extends MatchRule {
    constructor(sqlCode: string) {
        super();
        this.type = "SQL";
        this.input = sqlCode;
        this.hash = `SQL@${sqlCode.toLowerCase().replace(/\s+/g, "$")}`;
    }

    async getIds() {
        let result = await sql(this.input);
        let ids = result.map((item) => item?.id).filter((item) => typeof item === "string");
        return ids ?? [];
    }
}

export const RuleFactory = (type: string, input?: any) => {
    switch (type) {
        case "ChildDocument":
            return new ChildDocument();
        case "SQL":
            return new SQL(input);
        default:
            return null;
    }
}
