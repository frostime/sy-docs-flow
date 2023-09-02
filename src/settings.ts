/*
 * Copyright (c) 2023 by Yp Z (frostime). All Rights Reserved.
 * @Author       : Yp Z
 * @Date         : 2023-07-29 23:24:33
 * @FilePath     : /src/settings.ts
 * @LastEditTime : 2023-09-02 18:03:16
 * @Description  : 
 */
export const setting = {
    protyleScroll: true as boolean,
    protyleMaxHeight: "auto" as number | "auto",
    protyleBreadcrumb: true as boolean,
    protyleReadonly: false as boolean,

    dynamicLoadingEnabled: false as boolean,
    dynamicLoadingCapacity: 15 as number,
    dynamicLoadingShift: 10 as number,

    getMaxHeight() {
        if (this.protyleMaxHeight === "auto") {
            let ele = document.querySelector("#layouts .layout__center div[data-type=\"wnd\"]>.layout-tab-container");
            let height = ele.clientHeight;
            // console.log("getMaxHeight", height);
            return height;
        }
        return this.protyleMaxHeight;
    }
}