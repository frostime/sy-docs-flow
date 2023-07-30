export const setting = {
    protyleScroll: true,
    protyleMaxHeight: "auto",

    getMaxHeight() {
        if (this.protyleMaxHeight !== "auto") {
            return this.protyleMaxHeight;
        }
        let ele = document.querySelector("#layouts .layout__center div[data-type=\"wnd\"]>.layout-tab-container");
        let height = ele.clientHeight;
        console.log("getMaxHeight", height);
        return height;
    }
}