import {
    Plugin,
    showMessage,
    Dialog,
    openTab,
    getFrontend,
    getBackend,
    IModel,
    Menu
} from "siyuan";
import "@/index.scss";

import DocsFlow from "@/docs-flow.svelte";
import SettingPannel from "@/libs/setting-panel.svelte";

import { confirmDialog } from "@/utils";
import { MatchRule, RuleFactory } from "@/rules";

const frontEnd = getFrontend();
const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";


class TabHub {
    plugin: Plugin;
    tabs: {
        [key: string]: {
            rule: MatchRule;
            tab: () => IModel;
        }
    }

    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.tabs = {};
    }

    async open(rule: MatchRule) {
        let hash = rule.hash;
        if (this.tabs[hash]) {
            this.openTab(hash);
            return;
        }
        if (!rule.precheck()) {
            return;
        }

        let ids = await rule.getIds();
        if (!ids || ids.length === 0) {
            showMessage("无法匹配对应的文档");
            return;
        }
        let tabDiv = document.createElement("div");
        let flow = new DocsFlow({
            target: tabDiv,
            props: {
                app: this.plugin.app,
                listDocuemntsId: ids,
                ruleHash: hash
            }
        });

        flow.$on("saveThis", ({detail}) => {
            console.log("saveThis", detail);
            let ruleHash = detail.ruleHash;
        });
        flow.$on("renameThis", ({detail}) => {
            console.log("renameThis", detail);
            let ruleHash = detail.ruleHash;
            confirmDialog("重命名",
                `<input type="text" class="b3-text-field fn__block" value="${detail.title}">`,
                (ele) => {
                    let text: HTMLInputElement = ele.querySelector("input");
                    let title = text.value;
                    console.log("rename", title);
                    let tab = this.tabs[ruleHash].tab;
                    console.log(tab);
                }
            );
        });

        const Tabs = this.tabs;
        let tab = this.plugin.addTab({
            type: 'custom_tab',
            init() {
                this.element.appendChild(tabDiv);
            },
            beforeDestroy() {
                flow?.$destroy();
                tabDiv?.remove();
            },
            destroy: () => {
                delete Tabs[hash];
                console.log("destroy tab:", hash);
            }
        });
        this.tabs[hash] = {
            rule,
            tab
        };
        this.openTab(hash);
    }

    private openTab(hash: any) {
        let tab = this.tabs[hash].tab;
        let rule = this.tabs[hash].rule;
        openTab({
            app: this.plugin.app,
            custom: {
                icon: "iconFlow",
                title: `流式文档-${rule.type}`,
                data: hash, //关键, 思源靠这个判断是否是同一个tab
                fn: tab,
            },
            keepCursor: false,
            removeCurrentTab: true
        });
        console.log(this.tabs);
    }
}

export default class DocsFlowPlugin extends Plugin {

    tabHub: TabHub;

    async onload() {
        this.tabHub = new TabHub(this);
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
                this.tabHub.open(RuleFactory("ChildDocument"));
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
                    // this.openFlow(RuleFactory("SQL", sql));
                    this.tabHub.open(RuleFactory("SQL", sql));
                });
            }
        });
        menu.addItem({
            icon: "iconInfo",
            label: "自定义ID",
            click: () => {
                confirmDialog('自定义ID', `<textarea class="b3-text-field fn__block"></textarea>`, (ele) => {
                    let text: HTMLTextAreaElement = ele.querySelector("textarea");
                    let ids = text.value;
                    let idList = ids.split(/[\s,，]/).filter((id) => id);
                    this.tabHub.open(RuleFactory("IdList", idList));
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
