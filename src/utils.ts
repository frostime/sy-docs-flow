/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:41:15
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2023-11-25 20:10:43
 * @Description  : 
 */
import { Dialog, getFrontend } from "siyuan";
import { getBlockByID, listDocsByPath, readDir } from "./api";
import zh_CN from "./i18n/zh_CN.json";

export let i18n: typeof zh_CN;
export function setI18n(i18nData: any) {
    i18n = i18nData;
}


export function throttle<T extends (...args: any[]) => any>(func: T, wait: number = 500){
    let previous = 0;
    return function(...args: Parameters<T>){
        let now = Date.now(), context = this;
        if(now - previous > wait){
            func.apply(context, args);
            previous = now;
        }
    }
}

export function getActiveTab() {
    let tab = document.querySelector("div.layout__wnd--active ul.layout-tab-bar>li.item--focus");
    let dataId: string = tab?.getAttribute("data-id");
    if (!dataId) {
        return null;
    }
    const activeTab: HTMLDivElement = document.querySelector(
        `.layout-tab-container.fn__flex-1>div.protyle[data-id="${dataId}"]`
    ) as HTMLDivElement;
    return activeTab;
}

export async function getChildDocs(documentId: DocumentId) {
    let doc: Block = await getBlockByID(documentId);
    if (!doc) {
        return null;
    }
    let box = doc.box;
    let path = doc.path;

    let data = await listDocsByPath(box, path);
    let ids = data?.files.map((item) => item.id);
    return ids ?? [];
}


async function readDocPath(path: string) {
    let paths = await readDir(path);
    // "20230723152605-n01h94z.sy"
    let pat = /^\d+-\w+(\.sy)?$/
    // let pat = /([0-9a-z\-]+)(\.sy)?$/;
    return paths.filter((item) => pat.test(item.name));
}

export class TreeItem {
    docId: DocumentId;
    childDocsCount: number = 0;
    offspringDocsCount: number = 0;
    childDocs: TreeItem[];

    path = '';


    constructor(docDir: string, docId: DocumentId) {
        this.docId = docId;
        this.childDocs = [];
        this.path = `${docDir}/${this.docId}`;
    }

    /**
     * 递归地构建树结构
     * @param currentPath 当前文档所在的路径, 路径内容不包括 .sy 后缀名
     * @returns `Array<TreeItem>` 节点遍历的结果列表
     */
    async buildTree() {
        // this.path = currentPath + '.sy';
        let currentPath = this.path;
        let childPath = await readDocPath(`${currentPath}`);
        let childInfo = {};
        for (let child of childPath) {
            let name = child.name.replace(/\.sy$/, '');
            childInfo[name] = child.isDir || childInfo[name] ? true : false;
        }
        let dirItems: TreeItem[] = [];
        for (let id of Object.keys(childInfo)) {
            let tree_item = new TreeItem(currentPath, id);
            this.childDocs.push(tree_item);
            if (childInfo[id]) {
                dirItems.push(tree_item);
            }
        }
        this.childDocsCount = this.childDocs.length;

        let allItems: TreeItem[] = [];
        allItems.push(...this.childDocs); // 遍历所有的子节点
        let retrieve = await Promise.all(dirItems.map((item) => item.buildTree()));
        allItems.push(...retrieve.flat()); // 遍历所有的子节点的子节点
        this.offspringDocsCount = allItems.length;
        return allItems;
    }
}



const frontEnd = getFrontend();
const isMobile = () => (frontEnd === "mobile" || frontEnd === "browser-mobile");

export const confirmDialog = (title: string, text: string, confirm?: (ele?: HTMLElement) => void, cancel?: (ele?: HTMLElement) => void) => {
    const dialog = new Dialog({
        title,
        content: `<div class="b3-dialog__content">
    <div class="ft__breakword">${text}</div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text" id="confirmDialogConfirmBtn">${window.siyuan.languages.confirm}</button>
</div>`,
        width: isMobile() ? "92vw" : "520px",
    });
    const target: HTMLElement = dialog.element.querySelector(".b3-dialog__content>div.ft__breakword");
    const btnsElement = dialog.element.querySelectorAll(".b3-button");
    btnsElement[0].addEventListener("click", () => {
        if (cancel) {
            cancel(target);
        }
        dialog.destroy();
    });
    btnsElement[1].addEventListener("click", () => {
        if (confirm) {
            confirm(target);
        }
        dialog.destroy();
    });
};


export const notebooks: {[key: string]: string} = {};
for (let notebook of window.siyuan.notebooks) {
    console.log(notebook);
    notebooks[notebook.id] = notebook.name;
}
