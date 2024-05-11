/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:41:15
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2024-05-11 19:49:15
 * @Description  : 
 */
import { Dialog, getFrontend } from "siyuan";
import { getBlockByID, listDocsByPath } from "./api";
import zh_CN from "./i18n/zh_CN.json";

export let i18n: typeof zh_CN;
export function setI18n(i18nData: any) {
    i18n = i18nData;
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
const isMobile = () => (frontEnd === "mobile" || frontEnd === "browser-mobile");

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
