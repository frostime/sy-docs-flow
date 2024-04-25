/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2024-04-25 22:12:03
 * @Description  : 
 */
import { showMessage } from "siyuan";
import * as api from "@/api";
import { getBacklink2, sql, getBlockByID, listDocTree } from "@/api";
import { getChildDocs, getActiveTab } from "./utils";
import { setting } from "./settings";

export abstract class MatchRule {
    title: string = "";
    hash: string;
    type: TRuleType;
    input: any;
    config: IConfig;

    current: IRuleFetchData;

    private date: BlockId[] = [];

    constructor(type: TRuleType) {
        this.type = type;
        this.hash = "";
        this.input = null;
        this.title = `${this.type}`;
        this.config = {
            scroll: setting.protyleScroll,
            breadcrumb: setting.protyleBreadcrumb,
            protyleTitle: setting.protyleTitle,
            readonly: setting.protyleReadonly,
            dynamicLoading: {
                enabled: setting.dynamicLoadingEnabled,
                capacity: setting.dynamicLoadingCapacity,
                shift: setting.dynamicLoadingShift
            }
        };
        this.current = null;
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

    emptyResult(): IRuleFetchData {
        return { ids: [], eof: true };
    }

    abstract next(): IRuleFetchData | Promise<IRuleFetchData>;

    validateInput() { return true; } // 针对输入格式的检查

    mergeConfig(config: any) {
        console.log('Merge config:', config);
        //将 source 的配置合并到 target
        const merge = (target: object, source?: object) => {
            if (source === undefined) {
                return;
            }
            for (let key in target) {
                if (key in source) {
                    if (typeof target[key] === "object") {
                        merge(target[key], source[key]);
                    } else {
                        target[key] = source[key];
                    }
                }
            }
        }
        merge(this.config, config);
    }
}

class ChildDocument extends MatchRule {
    constructor(docId?: DocumentId) {
        super("ChildDocument");
        this.input = null;
        this.hash = `ChildDocument`;

        if (docId === undefined) {
            const currentDocument = getActiveTab();
            if (!currentDocument) {
                return;
            }
            const eleTitle = currentDocument.querySelector(".protyle-title");
            docId = eleTitle.getAttribute("data-node-id");
        }
        this.input = docId;
        this.hash = `ChildDocument@${docId}`;
    }

    async next() {
        if (!this.input) {
            return this.emptyResult();
        }
        let child = await getChildDocs(this.input);
        let ans = child ? [this.input, ...child] : null;
        return { ids: ans ?? [], eof: true };
    }
}

class OffspringDocument extends MatchRule {
    constructor(docId?: DocumentId) {
        super("OffspringDocument");
        this.input = null;
        if (docId === undefined) {
            const currentDocument = getActiveTab();
            if (!currentDocument) {
                return;
            }
            const eleTitle = currentDocument.querySelector(".protyle-title");
            docId = eleTitle.getAttribute("data-node-id");
        }
        this.input = docId;
        this.hash = `OffspringDocument@${docId}`;
        this.config.dynamicLoading.enabled = true; //默认开启
    }

    async next() {
        if (!this.input) {
            return this.emptyResult();
        }
        let block = await getBlockByID(this.input);
        const path = block.path.replace(/\.sy$/, '');
        let nodes: IDocTreeNode[] = await listDocTree(block.box, path);
        let listDocId = [];
        const dfs = (node: IDocTreeNode) => {
            listDocId.push(node.id);
            if (node.children) {
                for (let child of node.children) {
                    dfs(child);
                }
            }
        }
        let root = {
            id: this.input,
            children: nodes
        }
        dfs(root);
        console.log(listDocId);

        return { ids: listDocId, eof: true };
    }
}

class DocBacklinks extends MatchRule {
    constructor() {
        super("DocBacklinks");
        this.input = null;
        const currentDocument = getActiveTab();

        this.hash = `DocBacklinks`;

        if (!currentDocument) {
            return;
        }

        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");
        this.input = dataId;
        this.hash = `DocBacklinks@${dataId}`;
    }

    async next() {
        if (!this.input) {
            return this.emptyResult();
        }
        let backlinks = await getBacklink2(this.input);
        let backlinkIds = backlinks.backlinks.map((item) => item.id);
        return { ids: backlinkIds ?? [], eof: true };
    }
}

class DocBackmentions extends MatchRule {
    constructor() {
        super("DocBackmentions");
        this.input = null;
        const currentDocument = getActiveTab();

        this.hash = `DocBackmentions`;

        if (!currentDocument) {
            return;
        }

        const eleTitle = currentDocument.querySelector(".protyle-title");
        let dataId = eleTitle.getAttribute("data-node-id");
        this.input = dataId;
        this.hash = `DocBackmentions@${dataId}`;
    }

    async next() {
        if (!this.input) {
            return this.emptyResult();
        }
        let backlinks = await getBacklink2(this.input);
        let backlinkIds = backlinks.backmentions.map((item) => item.id);
        return { ids: backlinkIds ?? [], eof: true };
    }
}

class BlockBacklinks extends MatchRule {
    constructor(id: BlockId) {
        super("BlockBacklinks");
        this.input = id;
        this.hash = `BlockBacklinks@${id}`;
    }

    async next() {
        if (!this.input) {
            return this.emptyResult();
        }
        // const sql = `
        // select * from blocks where id in (
        //     select block_id from refs where def_block_id = '${this.input}'
        // ) 
        // order by updated desc
        // limit 999;
        // `;
        const sql = `
            select blocks.* 
            from blocks 
            join refs on blocks.id = refs.block_id 
            where refs.def_block_id = '${this.input}' 
            order by blocks.updated desc 
            limit 999;
        `;
        const blocks = await api.sql(sql);
        const ids = blocks?.map((item) => item.id);
        return { ids: ids ?? [], eof: true };
    }

}

class SQL extends MatchRule {
    constructor(sqlCode: string) {
        super("SQL");
        // 将 SQL 语句中的 \*、\[、\] 和 \S 替换为 \\*、\\[、\\] 和 \\S
        // 这样在 JavaScript 中，它们将被解析为原本期望的正则表达式
        this.input = sqlCode.replace(/\\(\*|\[|\]|\S)/g, '\\\\$1');
        this.hash = `SQL@${sqlCode.replace(/\s+/g, "$")}`;
    }

    validateInput(): boolean {
        //是否是 SQL 语法
        let pat = /select\s+([\s\S]+?)\s+from\s+([\s\S]+?)\s*$/i;
        if (!pat.test(this.input)) {
            showMessage("SQL语句不正确");
            return false;
        }
        return true;
    }

    async next() {
        let result = await sql(this.input);
        let ids = result?.map((item) => item?.id).filter((item) => typeof item === "string");
        // return ids ?? [];
        return { ids: ids ?? [], eof: true };
    }
}


class IdList extends MatchRule {
    constructor(ids: BlockId[]) {
        super("IdList");
        this.input = ids;
        this.hash = `IdList@${ids.sort().join("$")}`;
    }

    validateInput(): boolean {
        //20230612122134-urgfgsx
        let pat = /^\d{14}-[a-z0-9]{7}$/
        for (let id of this.input) {
            if (!pat.test(id)) {
                showMessage(`Invalid ID: ${id}`);
                return false;
            }
        }
        return true;
    }

    async next() {
        // return this.input;
        return { ids: this.input, eof: true };
    }
}

export const RuleFactory = (type: TRuleType, input?: any) => {
    switch (type) {
        case "ChildDocument":
            return new ChildDocument(input);
        case "OffspringDocument":
            return new OffspringDocument(input);
        case "DocBacklinks":
            return new DocBacklinks();
        case "DocBackmentions":
            return new DocBackmentions();
        case "BlockBacklinks":
            return new BlockBacklinks(input);
        case "SQL":
            return new SQL(input);
        case "IdList":
            return new IdList(input);
        default:
            return null;
    }
}
