export const setting = {
    protyleScroll: false,
    protyleMaxHeight: "auto",

    getMaxHeight() {
        if (this.protyleMaxHeight !== "auto") {
            return this.protyleMaxHeight;
        }
        let ele = document.querySelector("#layouts .layout__center div[data-type=\"wnd\"]>.layout-tab-container");
        let height = ele.clientHeight;
        return height;
    }
}