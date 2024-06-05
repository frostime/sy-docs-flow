/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:17:15
 * @FilePath     : /src/rules.ts
 * @LastEditTime : 2024-06-05 20:41:14
 * @Description  : 
 */
import { showMessage, fetchPost } from "siyuan";
import * as api from "@/api";
import {
    getBacklink2, sql, getBlockByID, listDocTree, getBacklinkDoc, getBackmentionDoc, request
} from "@/api";
import { getChildDocs, getActiveTab, simpleHash } from "./utils";
import { setting } from "./settings";

import PromiseLimitPool from "./libs/promise-pool";

export abstract class MatchRule {
    title: string = "";
    hash: string;
    type: TRuleType;
    input: any;
    config: IConfig;

    protected eof: boolean = false;

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

    // emptyResult(): IRuleFetchData {
    //     return { ids: [], eof: true };
    // }

    abstract fetch(): BlockId[] | Promise<BlockId[]>;

    iseof() {
        return this.eof;
    }

    reset() {
        this.eof = false;
    }

    input2Text() {
        if (this.input === null) {
            return "";
        }
        if (Array.isArray(this.input)) {
            return this.input.join("\n");
        }
        return `${this.input}`;
    }

    abstract updateInput(input: any);

    validateInput() { return true; } // 检查输入的 this.input 的格式是否符合要求

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

const matchIDFormat = (id: string) => {
    let match = id.match(/^\d{14}-[a-z0-9]{7}$/);
    if (match) {
        return true;
    } else {
        showMessage("Invalid ID Format", 5000, 'error');
        return false;
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
        this.updateInput(docId);
    }

    updateInput(docId: DocumentId) {
        this.input = docId;
        this.hash = `ChildDocument@${docId}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
        let child = await getChildDocs(this.input);
        let ans = child ? [this.input, ...child] : [];
        return ans ?? [];
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
        this.config.dynamicLoading.enabled = true; //默认开启
        this.updateInput(docId);
    }

    updateInput(docId: DocumentId) {
        this.input = docId;
        this.hash = `OffspringDocument@${docId}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
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
        // console.log(listDocId);

        return listDocId ?? [];
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
        this.updateInput(dataId);
    }

    updateInput(dataId: DocumentId) {
        this.input = dataId;
        this.hash = `DocBacklinks@${dataId}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
        let resBacklink2 = await getBacklink2(this.input);
        let backlinkDocIds = resBacklink2.backlinks.map((item) => item.id);

        const pool = new PromiseLimitPool<any>(16);
        for (let id of backlinkDocIds) {
            pool.add(() => getBacklinkDoc(this.input, id));
        }
        let backlinks = await pool.awaitAll();
        let resultIds = [];
        for (let backlink of backlinks) {
            backlink.backlinks.forEach((item) => {
                if (item?.blockPaths) {
                    const blockPaths = item.blockPaths;
                    //这个 API 挺好的地方在于会自动处理 li&p 问题
                    resultIds.push(blockPaths[blockPaths.length - 1].id);
                }
            });
        }
        return resultIds ?? [];
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
        this.updateInput(dataId);
    }

    updateInput(dataId: DocumentId) {
        this.input = dataId;
        this.hash = `DocBackmentions@${dataId}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
        let resBacklink2 = await getBacklink2(this.input);
        let backmentionDocIds = resBacklink2.backmentions.map((item) => item.id);
        const pool = new PromiseLimitPool<any>(16);
        for (let id of backmentionDocIds) {
            pool.add(() => getBackmentionDoc(this.input, id));
        }
        let backmentions = await pool.awaitAll();
        let resultIds = [];
        for (let backmention of backmentions) {
            backmention.backmentions.forEach((item) => {
                if (item?.blockPaths) {
                    const blockPaths = item.blockPaths;
                    resultIds.push(blockPaths[blockPaths.length - 1].id);
                }
            });
        }
        return resultIds ?? [];
    }
}

class BlockBacklinks extends MatchRule {
    constructor(id: BlockId) {
        super("BlockBacklinks");
        this.updateInput(id);
    }

    updateInput(id: BlockId) {
        this.input = id;
        this.hash = `BlockBacklinks@${id}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
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
        return ids ?? [];
    }

}

class SQL extends MatchRule {
    constructor(sqlCode: string) {
        super("SQL");
        this.updateInput(sqlCode);
    }

    updateInput(sqlCode: any) {
        // 将 SQL 语句中的 \*、\[、\] 和 \S 替换为 \\*、\\[、\\] 和 \\S
        // 这样在 JavaScript 中，它们将被解析为原本期望的正则表达式
        this.input = sqlCode.replace(/\\(\*|\[|\]|\S)/g, '\\\\$1');
        this.hash = `SQL@${simpleHash(this.input)}`;
    }

    validateInput(): boolean {
        //是否是 SQL 语法
        let pat = /select\s+([\s\S]+?)\s+from\s+([\s\S]+?)\s*$/i;
        if (!pat.test(this.input)) {
            showMessage("Invalid SQL Syntax", 5000, "error");
            return false;
        }
        return true;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
        let result = await sql(this.input);
        let ids = result?.map((item) => item?.id).filter((item) => typeof item === "string");
        return ids ?? [];
    }
}



class JavaScript extends MatchRule {
    constructor(code: string) {
        super("JS");
        this.updateInput(code);
    }

    updateInput(code: any) {
        this.input = code;
        this.hash = `JS@${simpleHash(code)}`;
    }

    validateInput(): boolean {
        return true;
    }

    async fetch() {
        this.eof = true;
        if (!this.input) {
            return [];
        }
        const code = `
        async function main(){
            ${this.input}
        }
        return main();
        `;
        const kits: IKits = {
            request: request, // request backend api
            sql: sql, // fetch sql backend api
            where: async (where: string) => {
                return sql(`select * from blocks where ${where}`);
            },
            backlink: async (id: BlockId, limit?: number) => {
                return sql(`
                select * from blocks where id in (
                    select block_id from refs where def_block_id = '${id}'
                ) order by updated desc ${limit ? `limit ${limit}` : ''};
                `);
            },
            attr: async (name: string, val?: string, valMatch: '=' | 'like' = '=') => {
                return sql(`
                SELECT B.*
                FROM blocks AS B
                WHERE B.id IN (
                    SELECT A.block_id
                    FROM attributes AS A
                    WHERE A.name = '${name}'
                    ${val ? `AND A.value ${valMatch} '${val}'` : ''}
                );
                `);
            },
            activeDoc: () => {
                const currentDocument = getActiveTab();
                if (!currentDocument) {
                    return;
                }
                const eleTitle = currentDocument.querySelector(".protyle-title");
                let docId = eleTitle.getAttribute("data-node-id");
                return docId;
            },
            b2id: (b: Block | Block[]) => {
                if (Array.isArray(b)) {
                    return b.map((item) => item.id);
                } else {
                    return b.id;
                }
            }
        }
        let result: BlockId[];

        try {
            let func = new Function('kits', 'fetchPost', code);
            let data = await func(kits, fetchPost);
            console.debug('JS result:', data);
            if (data instanceof Promise) {
                data = await data;
            }
            if (data?.length > 0 && data[0]?.id) {
                result = data.map((item) => item.id);
            } else {
                result = data;
            }
        } catch (e) {
            console.error('JS Error:', e);
            showMessage(`JavaScript Error: ${e.message}`, 5000, 'error');
        }

        return result ?? [];
    }
}


class IdList extends MatchRule {
    constructor(ids: BlockId[]) {
        super("IdList");
        this.updateInput(ids);
    }

    updateInput(input: string | BlockId[]) {
        if (typeof input === "string") {
            let idList = input.split(/[\s,，]/).filter((id) => id);
            this.input = idList;
        } else if (Array.isArray(input)) {
            this.input = input;
        }
        this.hash = `IdList@${simpleHash(this.input)}`;
    }

    validateInput(): boolean {
        //20230612122134-urgfgsx
        for (let id of this.input) {
            if (!matchIDFormat(id)) {
                return false;
            }
        }
        return true;
    }

    async fetch() {
        this.eof = true;
        return this.input ?? [];
    }
}

class DailyNote extends MatchRule {
    constructor(ids: NotebookId) {
        super("DailyNote");
        this.updateInput(ids);
    }

    updateInput(input: NotebookId) {
        this.input = input;
        this.hash = `DailyNote@${this.input}`;
    }

    validateInput(): boolean {
        return matchIDFormat(this.input) !== null;
    }

    async fetch() {
        this.eof = true;
        const sql = `
        select distinct B.* from blocks as B join attributes as A
        on B.id = A.block_id
        where A.name like 'custom-dailynote-%' and B.box = '${this.input}'
        order by A.value desc limit 999;
        `;
        const blocks = await api.sql(sql);
        const ids = blocks?.map((item) => item.id);
        return ids ?? [];
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
        case "JS":
            return new JavaScript(input);
        case "IdList":
            return new IdList(input);
        case "DailyNote":
            return new DailyNote(input);
        default:
            return null;
    }
}
