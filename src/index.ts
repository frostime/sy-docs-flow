import {
    Plugin,
    showMessage,
    Dialog,
    openTab,
    getFrontend,
    getBackend,
    Menu
} from "siyuan";
import "@/index.scss";

import DocsFlow from "@/docs-flow.svelte";
import SettingPannel from "@/libs/setting-panel.svelte";

import { confirmDialog } from "@/utils";
import { MatchRule, RuleFactory } from "@/rules";

const frontEnd = getFrontend();
const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

export default class DocsFlowPlugin extends Plugin {

    tab: any;

    async onload() {

        console.log("loading plugin-sample", this.i18n);
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFlow" viewBox="0 0 1024 1024"><path d="M1024 640v384H0v-384h128v256h768v-256zM192 704h640v128H192z m15.168-138.56l27.712-124.992 624.832 138.496L832 703.936zM279.68 308.544l54.08-116.032 580.032 270.464-54.08 116.032z m712.064 52.928l-77.952 101.568-507.776-389.632L462.336 0h58.24z" p-id="7558"></path></symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFlow",
            title: this.i18n.addTopBarIcon,
            position: "right",
            callback: () => {
                if (isMobile) {
                    this.addMenu();
                } else {
                    let rect = topBarElement.getBoundingClientRect();
                    // 如果被隐藏，则使用更多按钮
                    if (rect.width === 0) {
                        rect = document.querySelector("#barMore").getBoundingClientRect();
                    }
                    if (rect.width === 0) {
                        rect = document.querySelector("#barPlugins").getBoundingClientRect();
                    }
                    this.addMenu(rect);
                }
                // this.openFlow(childOfCurrentDocument);
            }
        });
    }

    onLayoutReady() {
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
        console.log(this.i18n.byePlugin);
        showMessage("Goodbye SiYuan Plugin");
        console.log("onunload");
    }

    addMenu(rect?) {
        const menu = new Menu();
        menu.addItem({
            icon: "iconInfo",
            label: "子文裆",
            click: () => {
                this.openFlow(RuleFactory("ChildDocument"));
            }
        });
        menu.addItem({
            icon: "iconInfo",
            label: "SQL查询文档",
            click: () => {
                confirmDialog('SQL', `<textarea class="b3-text-field fn__block"></textarea>`, (ele) => {
                    let text: HTMLTextAreaElement = ele.querySelector("textarea");
                    let sql = text.value;
                    let pat = /select\s+([\s\S]+?)\s+from\s+([\s\S]+?)\s*$/i;
                    if (!pat.test(sql)) {
                        showMessage("SQL语句不正确");
                        return;
                    }
                    this.openFlow(RuleFactory("SQL", sql));
                });
            }
        });


        if (isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.right,
                y: rect.bottom,
                isLeft: true,
            });
        }
    }

    async openFlow(rule: MatchRule) {
        let ids = await rule.getIds();
        if (!ids || ids.length === 0) {
            showMessage("无法匹配对应的文档");
            return;
        }

        let tabDiv = document.createElement("div");
        new DocsFlow({
            target: tabDiv,
            props: {
                app: this.app,
                listDocuemntsId: ids
            }
        });
        let tab = this.addTab({
            type: 'custom_tab',
            init() {
                this.element.appendChild(tabDiv);
                console.log(this.element);
            },
            beforeDestroy() {
            },
            destroy() {
            }
        });
        // this.tab.open();
        openTab({
            app: this.app,
            custom: {
                icon: "iconFlow",
                title: "流式文档",
                fn: tab
            },
        })
    }

    /**
     * A custom setting pannel provided by svelte
     */
    openDIYSetting(): void {
        let dialog = new Dialog({
            title: "SettingPannel",
            content: `<div id="SettingPanel"></div>`,
            width: "600px",
            destroyCallback: (options) => {
                console.log("destroyCallback", options);
                //You'd better destroy the component when the dialog is closed
                pannel.$destroy();
            }
        });
        let pannel = new SettingPannel({
            target: dialog.element.querySelector("#SettingPanel"),
        });
    }
}

const tabhub = {
    tabs: [],
};
