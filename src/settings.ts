// import { sql } from "./api";

import { isMobile } from "./utils";

/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 23:24:33
 * @FilePath     : /src/settings.ts
 * @LastEditTime : 2024-05-11 21:39:51
 * @Description  : 
 */
export const setting = {
    protyleScroll: true as boolean,
    protyleMaxHeight: "auto" as number | "auto",
    protyleBreadcrumb: true as boolean,
    protyleTitle: true as boolean,
    protyleReadonly: false as boolean,

    dynamicLoadingEnabled: false as boolean,
    dynamicLoadingCapacity: 15 as number,
    dynamicLoadingShift: 10 as number,

    enable: {
        //这里名称保证和 I18N 中的名称一致
        topBar: {
            child: true,
            offspringDocument: true,
            docBacklinks: true,
            docBackmentions: true,
            sql: true,
            customID: true,
            dailynote: true,
        },
        blockIcon: {
            blockBacklinks: true,
        },
        docIcon: {
            child: true,
            offspringDocument: true,
            openBackInDocFlow: true
        },
    },

    set(key: string, value: any) {
        if (key in this) {
            this[key] = value;
        }
    },

    getMaxHeight() {
        if (this.protyleMaxHeight === "auto") {
            let selector = ''
            if (isMobile()) {
                selector = 'main#docs-flow-fullscreen'
            } else {
                selector = '#layouts .layout__center div[data-type=\"wnd\"]>.layout-tab-container';
            }
            let ele = document.querySelector(selector);
            let height = ele.clientHeight;
            // console.log("getMaxHeight", height);
            return height;
        }
        return this.protyleMaxHeight;
    }
}


