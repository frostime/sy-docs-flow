/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2023-08-05 23:45:36
 * @Description  : 
 */
import { showMessage } from "siyuan";
import {sql} from "@/api";
import { getChildDocs } from "./utils";

export abstract class MatchRule {
    title: string = "";
    hash: string;
    type: string;
    input: any;
    abstract getIds(): DocumentId[] | Promise<DocumentId[]>;
    precheck() { return true; } // 针对输入格式的检查
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

    precheck(): boolean {
        //是否是 SQL 语法
        let pat = /select\s+([\s\S]+?)\s+from\s+([\s\S]+?)\s*$/i;
        if (!pat.test(this.input)) {
            showMessage("SQL语句不正确");
            return false;
        }
        return true;
    }

    async getIds() {
        let result = await sql(this.input);
        let ids = result.map((item) => item?.id).filter((item) => typeof item === "string");
        return ids ?? [];
    }
}


class IdList extends MatchRule {
    constructor(ids: BlockId[]) {
        super();
        this.type = "IdList";
        this.input = ids;
        this.hash = `IdList@${ids.sort().join("$")}`;
    }

    precheck(): boolean {
        //20230612122134-urgfgsx
        let pat = /^\d{14}-[a-z0-9]{7}$/
        for (let id of this.input) {
            if (!pat.test(id)) {
                showMessage(`ID格式不正确: ${id}`);
                return false;
            }
        }
        return true;
    }

    async getIds() {
        return this.input;
    }
}

export type TRuleType = "ChildDocument" | "SQL" | "IdList";

export const RuleFactory = (type: TRuleType, input?: any) => {
    switch (type) {
        case "ChildDocument":
            return new ChildDocument();
        case "SQL":
            return new SQL(input);
        case "IdList":
            return new IdList(input);
        default:
            return null;
    }
}
