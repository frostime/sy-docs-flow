/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2024-10-01 20:28:45
 * @FilePath     : /src/libs/dialog.ts
 * @LastEditTime : 2024-10-01 21:24:04
 * @Description  : 
 */
import { Dialog } from "siyuan";
import type { SvelteComponent } from "svelte";

export const simpleDialog = (args: {
    title: string;
    ele: HTMLElement | DocumentFragment;
    width?: string;
    height?: string;
    maxWidth?: string;
    maxHeight?: string;
    callback?: () => void;
}) => {
    const dialog = new Dialog({
        title: args.title,
        content: `<div class="dialog-content" style="display: flex; height: 100%;"/>`,
        width: args.width,
        height: args.height,
        destroyCallback: args.callback
    });
    dialog.element.querySelector(".dialog-content").appendChild(args.ele);
    const container = dialog.element.querySelector(".b3-dialog__container") as HTMLElement;
    if (container) {
        Object.assign(container.style, {
            maxWidth: args.maxWidth,
            maxHeight: args.maxHeight
        });
    }
    return dialog;
}


export const svelteDialog = (args: {
    title: string, constructor: (container: HTMLElement) => SvelteComponent,
    width?: string, height?: string,
    callback?: () => void;
}) => {
    let container = document.createElement('div')
    container.style.display = 'contents';
    let component = args.constructor(container);
    const dialog = simpleDialog({
        ...args, ele: container, callback: () => {
            component.$destroy();
            if (args.callback) args.callback();;
        }
    });
    return {
        component,
        dialog: dialog,
        close: () => {
            dialog.destroy();
        }
    }
}
