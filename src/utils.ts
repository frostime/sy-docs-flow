/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 15:41:15
 * @FilePath     : /src/utils.ts
 * @LastEditTime : 2023-08-09 18:11:02
 * @Description  : 
 */
import { Dialog, getFrontend } from "siyuan";
import { getBlockByID, listDocsByPath } from "./api";

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
