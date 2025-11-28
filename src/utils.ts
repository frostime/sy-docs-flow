/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:41:15
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2024-06-15 15:51:22
 * @Description  : 
 */
import { Dialog, getFrontend } from "siyuan";
import { getBlockByID, listDocsByPath, request } from "./api";
import type zh_CN from "@/../dev/i18n/zh_CN.json";

export let i18n: typeof zh_CN;
export function setI18n(i18nData: any) {
    i18n = i18nData;
}


export const firstPara2Parent = async (ids: BlockId[]): Promise<BlockId[]> => {
    let data: {[key: BlockId]: any} = await request('/api/block/getBlockTreeInfos', {
        ids: ids
    });
    let result: BlockId[] = [];
    for (let id of ids) {
        result.push(id);
        let info = data[id];
        if (!info) continue;
        if (info.type !== 'NodeParagraph') continue;
        if (info.previousID !== '') continue;
        if (!['NodeBlockquote', 'NodeListItem'].includes(info.parentType)) continue;
        result[result.length - 1] = info.parentID;
    }
    return result;
}


let crypto = require('crypto');

/**
 * 
 * @param input 输入字符串
 * @param N 输出 hash 的长度
 */
export function simpleHash(input: any): string {
    if (Array.isArray(input)) input = input.toString();
    //might not able to require it
    if (crypto) {
        let hash = crypto.createHash('md5');
        hash.update(input);
        return hash.digest('hex');
    } else {
        return customHash(input);
    }
}

/**
 * Simple hash function as a polyfill
 * @param input 输入字符串
 */
function customHash(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        let chr = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return ('00000000' + (hash >>> 0).toString(16)).slice(-8); // Convert to hex and pad
}


export function throttle<T extends (...args: any[]) => any>(func: T, wait: number = 500) {
    let previous = 0;
    return function (...args: Parameters<T>) {
        let now = Date.now(), context = this;
        if (now - previous > wait) {
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


const frontEnd = getFrontend();
export const isMobile = () => (frontEnd === "mobile" || frontEnd === "browser-mobile");

export const confirmDialog = (title: string, content: string | HTMLElement, confirm?: (ele?: HTMLElement) => void, cancel?: (ele?: HTMLElement) => void, width?: string, height?: string) => {
    const dialog = new Dialog({
        title,
        content: `<div class="b3-dialog__content">
    <div class="ft__breakword">
    </div>
</div>
<div class="b3-dialog__action">
    <button class="b3-button b3-button--cancel">${window.siyuan.languages.cancel}</button><div class="fn__space"></div>
    <button class="b3-button b3-button--text" id="confirmDialogConfirmBtn">${window.siyuan.languages.confirm}</button>
</div>`,
        width: width || (isMobile() ? "92vw" : "520px"),
        height: height
    });
    const target: HTMLElement = dialog.element.querySelector(".b3-dialog__content>div.ft__breakword");
    if (typeof content === "string") {
        target.innerHTML = content;
    } else {
        target.appendChild(content);
    }

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


export const notebooks: { [key: string]: string } = {};
for (let notebook of window.siyuan.notebooks) {
    // console.log(notebook);
    notebooks[notebook.id] = notebook.name;
}
