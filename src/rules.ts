/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2023-08-12 15:05:25
 * @Description  : 
 */
import { showMessage } from "siyuan";
import {getBacklink2, sql} from "@/api";
import { getChildDocs } from "./utils";
import { setting } from "./settings";

export abstract class MatchRule {
    title: string = "";
    hash: string;
    type: TRuleType;
    input: any;
    config: {
        scroll: boolean;
        breadcrumb: boolean;
    };

    constructor(type: TRuleType) {
        this.type = type;
        this.hash = "";
        this.input = null;
        this.title = `${this.type}`;
        this.config = {
            scroll: setting.protyleScroll,
            breadcrumb: true
        };
    }

    dump(): IRule {
        return {
            title: this.title,
            hash: this.hash,
            type: this.type,
            input: this.input,
            config: this.config
        }
    }

    load(rule: IRule) {
        this.title = rule.title;
        this.hash = rule.hash;
        this.type = rule.type;
        this.input = rule.input;
        // this.config = rule?.config ?? this.config;
        for (let key in rule.config) {
            this.config[key] = rule.config[key];
        }
    }

    abstract getIds(): DocumentId[] | Promise<DocumentId[]>;
    precheck() { return true; } // 针对输入格式的检查
}

class ChildDocument extends MatchRule {
    constructor() {
        super("ChildDocument");
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
        return child ? [this.input, ...child] : null;
    }
}

class DocBacklinks extends MatchRule {
    constructor() {
        super("DocBacklinks");
        this.input = null;
        const currentDocument = document.querySelector(
            ".layout-tab-container.fn__flex-1>div.fn__flex-1.protyle:not(.fn__none)"
        );
        
        this.hash = `DocBacklinks`;

        if (!currentDocument) {
            return;
        }

        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");
        this.input = dataId;
        this.hash = `DocBacklinks@${dataId}`;
    }

    async getIds() {
        if (!this.input) {
            return [];
        }
        let backlinks = await getBacklink2(this.input);
        let backlinkIds = backlinks.backlinks.map((item) => item.id);
        return backlinkIds ?? [];
    }
}

class DocBackmentions extends MatchRule {
    constructor() {
        super("DocBackmentions");
        this.input = null;
        const currentDocument = document.querySelector(
            ".layout-tab-container.fn__flex-1>div.fn__flex-1.protyle:not(.fn__none)"
        );
        
        this.hash = `DocBackmentions`;

        if (!currentDocument) {
            return;
        }

        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");
        this.input = dataId;
        this.hash = `DocBackmentions@${dataId}`;
    }

    async getIds() {
        if (!this.input) {
            return [];
        }
        let backlinks = await getBacklink2(this.input);
        let backlinkIds = backlinks.backmentions.map((item) => item.id);
        return backlinkIds ?? [];
    }
}


class SQL extends MatchRule {
    constructor(sqlCode: string) {
        super("SQL");
        this.input = sqlCode.toLowerCase();
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
        super("IdList");
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

export const RuleFactory = (type: TRuleType, input?: any) => {
    switch (type) {
        case "ChildDocument":
            return new ChildDocument();
        case "DocBacklinks":
            return new DocBacklinks();
        case "DocBackmentions":
            return new DocBackmentions();
        case "SQL":
            return new SQL(input);
        case "IdList":
            return new IdList(input);
        default:
            return null;
    }
}
