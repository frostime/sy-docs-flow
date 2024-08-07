/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-28 20:49:27
 * @FilePath     : /src/types/index.d.ts
 * @LastEditTime : 2024-06-15 14:16:39
 * @Description  : 
 */

/**
 * Frequently used data structures in SiYuan
 */
type DocumentId = string;
type BlockId = string;
type NotebookId = string;
type PreviousID = BlockId;
type ParentID = BlockId | DocumentId;

type Notebook = {
    id: NotebookId;
    name: string;
    icon: string;
    sort: number;
    closed: boolean;
}

type NotebookConf = {
    name: string;
    closed: boolean;
    refCreateSavePath: string;
    createDocNameTemplate: string;
    dailyNoteSavePath: string;
    dailyNoteTemplatePath: string;
}

type BlockType = "d" | "s" | "h" | "t" | "i" | "p" | "f" | "audio" | "video" | "other";

type BlockSubType = "d1" | "d2" | "s1" | "s2" | "s3" | "t1" | "t2" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "table" | "task" | "toggle" | "latex" | "quote" | "html" | "code" | "footnote" | "cite" | "collection" | "bookmark" | "attachment" | "comment" | "mindmap" | "spreadsheet" | "calendar" | "image" | "audio" | "video" | "other";

type Block = {
    id: BlockId;
    parent_id?: BlockId;
    root_id: DocumentId;
    hash: string;
    box: string;
    path: string;
    hpath: string;
    name: string;
    alias: string;
    memo: string;
    tag: string;
    content: string;
    fcontent?: string;
    markdown: string;
    length: number;
    type: BlockType;
    subtype: BlockSubType;
    /** string of { [key: string]: string } 
     * For instance: "{: custom-type=\"query-code\" id=\"20230613234017-zkw3pr0\" updated=\"20230613234509\"}" 
     */
    ial?: string;
    sort: number;
    created: string;
    updated: string;
}

type doOperation = {
    action: string;
    data: string;
    id: BlockId;
    parentID: BlockId | DocumentId;
    previousID: BlockId;
    retData: null;
}

interface Window {
    siyuan: {
        notebooks: any;
        menus: any;
        dialogs: any;
        blockPanels: any;
        storage: any;
        user: any;
        ws: any;
        languages: any;
        config: any;
    };
}

type TRuleType = "ChildDocument" 
    | "SQL" 
    | "IdList" 
    | "DocBacklinks"  //反链面板中看到的，一个文档中所有反链
    | "DocBackmentions" 
    | "OffspringDocument" 
    | "BlockBacklinks"  //一个块对应的所有反链
    | "DailyNote"
    | "JS";

interface IConfig {
    scroll: boolean;
    protyleTitle: boolean;
    breadcrumb: boolean;
    readonly: boolean;
    dynamicLoading: {
        enabled: boolean;
        capacity: number;
        shift: number;
    };
}
interface IRule {
    title: string;
    hash: string;
    type: TRuleType;
    input: any;
    config: IConfig;
}

interface IOpenHandler {
    open(rule: MatchRule, tabTitle?: string);
}

// interface IRuleFetchData {
//     ids: BlockId[];
//     eof: boolean;
// }

interface IBreadcrumb {
    id: string,
    name: string,
    type: string,
    subType: string,
    children: []
}

interface IBacklink {
    blockPaths: IBreadcrumb[],
    dom: string
    expand: boolean
}


interface CustomEventDetail<T> {
    input: T;
    config?: any;
}


interface IKits {
    // async request backend api
    request: (url: string, data: any) => Promise<any>,
    // async, fetch sql backend api, input sql code
    sql: (code: string) => Promise<Block[]>,
    // async, input condition after 'where' in sql
    where: (where: string) => Promise<Block[]>,
    // async, query backlink of block
    backlink: (id: BlockId) => Promise<Block[]>,
    // async, query block of attribute <name>
    attr: (name: string, val?: string, valMatch: '=' | 'like' = '=') => Promise<Block[]>,
    //Get current active document id
    activeDoc: () => DocumentID,
    b2id: (b: Block | Block[]) => BlockID | BlockID[]
}


/********** Setting **********/
type TSettingType = "checkbox" | "input" | "button" | "select" | "slider" | "number";

interface ISettingItem {
    type: TSettingType;
    title: string;
    text: string;
    key: string;
    value: any;
    direction?: "row" | "column";
    placeholder?: string;
    options?: { [key: string]: string };
    slider?: {
        min: number;
        max: number;
        step: number;
    };
}

