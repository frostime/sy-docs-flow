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

import DocsFlow from "@/components/docs-flow/docs-flow.svelte";
import SettingPannel from "@/libs/setting-panel.svelte";
import SavedRules from "@/components/config/saved-rules.svelte";

import { confirmDialog, i18n, setI18n } from "@/utils";
import { MatchRule, RuleFactory } from "@/rules";

const frontEnd = getFrontend();
const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";


class TabHub {
    plugin: DocsFlowPlugin;
    tabs: {
        [key: string]: {
            rule: MatchRule;
            tab: () => IModel;
        }
    }

    constructor(plugin: DocsFlowPlugin) {
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
                ruleHash: hash,
                config: rule.config
            }
        });

        flow.$on("configChanged", ({ detail }) => {
            console.log("configChanged", detail);
            let ruleHash = detail.ruleHash;
            const rule = this.tabs[ruleHash].rule;
            let config = detail.config;
            for (let key in config) {
                rule.config[key] = config[key];
                console.log("configChanged", key, config[key]);
            }
        });
        flow.$on("saveThis", ({ detail }) => {
            console.log("saveThis", detail);
            let ruleHash = detail.ruleHash;
            const rule = this.tabs[ruleHash].rule;
            this.plugin.saveRule(rule);
        });
        flow.$on("renameThis", ({ detail }) => {
            console.log("renameThis", detail);
            let ruleHash = detail.ruleHash;
            const rule = this.tabs[ruleHash].rule;

            confirmDialog(i18n.renameRule,
                `<input type="text" class="b3-text-field fn__block" value="${rule.title}">`,
                (ele) => {
                    let text: HTMLInputElement = ele.querySelector("input");
                    let title = text.value;
                    // console.log("rename", title);
                    rule.title = title;
                    const span: HTMLSpanElement = document.querySelector(
                        "ul.layout-tab-bar>li.item--focus>span.item__text"
                    );
                    span.innerText = title;
                    showMessage(i18n.msg.saveDone);
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
                title: rule.title,
                data: hash, //关键, 思源靠这个判断是否是同一个tab
                fn: tab,
            },
            keepCursor: false,
            removeCurrentTab: true
        });
        console.log(this.tabs);
    }
}

// const SETTING_NAME = "docs-flow-setting.json";
const SAVE_RULE_NAME = "saved-rules.json";

export default class DocsFlowPlugin extends Plugin {

    tabHub: TabHub;

    savedRules: { [key: string]: IRule } = {};

    async onload() {
        this.tabHub = new TabHub(this);
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFlow" viewBox="0 0 1024 1024"><path d="M1024 640v384H0v-384h128v256h768v-256zM192 704h640v128H192z m15.168-138.56l27.712-124.992 624.832 138.496L832 703.936zM279.68 308.544l54.08-116.032 580.032 270.464-54.08 116.032z m712.064 52.928l-77.952 101.568-507.776-389.632L462.336 0h58.24z" p-id="7558"></path></symbol>`);

        const topBarElement = this.addTopBar({
            icon: "iconFlow",
            title: this.i18n.name,
            position: "left",
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
        setI18n(this.i18n);

        this.savedRules = await this.loadData(SAVE_RULE_NAME);
        this.savedRules = this.savedRules || {};
    }

    onLayoutReady() {
        console.log(`frontend: ${getFrontend()}; backend: ${getBackend()}`);
    }

    onunload() {
    }

    addMenu(rect?) {
        const menu = new Menu();
        menu.addItem({
            label: this.i18n.rules.child,
            click: () => {
                this.tabHub.open(RuleFactory("ChildDocument"));
            }
        });
        menu.addItem({
            label: this.i18n.rules.sql,
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
            label: this.i18n.rules.customID,
            click: () => {
                confirmDialog(this.i18n.rules.customID, `<textarea class="b3-text-field fn__block"></textarea>`, (ele) => {
                    let text: HTMLTextAreaElement = ele.querySelector("textarea");
                    let ids = text.value;
                    let idList = ids.split(/[\s,，]/).filter((id) => id);
                    this.tabHub.open(RuleFactory("IdList", idList));
                });
            }
        });

        menu.addSeparator();

        let submenu = [];
        for (let key in this.savedRules) {
            submenu.push({
                label: this.savedRules[key].title,
                click: () => {
                    let rule = RuleFactory(this.savedRules[key].type, this.savedRules[key].input);
                    rule.load(this.savedRules[key]);
                    this.tabHub.open(rule);
                }
            });
        }
        if (submenu.length > 0) {
            submenu.push({
                type: "separator"
            });
            submenu.push({
                label: this.i18n.button.alterSaved,
                click: () => {
                    let dialog = new Dialog({
                        title: this.i18n.msg.alterSaved,
                        width: "20rem",
                        content: `<div id="AlterSavedRules" style="height: 100%; width: 100%;"></div>`,
                    });
                    dialog.element.style.maxHeight = "70%";
                    const div = dialog.element.querySelector("#AlterSavedRules");
                    const compo = new SavedRules({
                        target: div,
                        props: {
                            savedRules: this.savedRules,
                        },
                    });
                    compo.$on("cancel", () => { dialog.destroy() });
                    compo.$on("confirm", ({ detail }) => {
                        this.savedRules = detail;
                        this.saveData(SAVE_RULE_NAME, this.savedRules);
                        showMessage(this.i18n.msg.alterDone);
                        dialog.destroy();
                    });
                }
            });
        }

        menu.addItem({
            label: this.i18n.button.saved,
            type: "submenu",
            icon: "iconInbox",
            submenu: submenu
        });
        // menu.addItem({
        //     label: "设置",
        //     icon: "iconSettings",
        //     click: () => {
        //         showMessage("暂无，敬请期待");
        //         this.openSetting();
        //     }
        // });

        if (isMobile) {
            menu.fullscreen();
        } else {
            menu.open({
                x: rect.left,
                y: rect.bottom,
                isLeft: false,
            });
        }
    }

    saveRule(rule: MatchRule) {
        let rule_obj: IRule = rule.dump();
        this.savedRules[rule_obj.hash] = rule_obj;
        this.saveData(SAVE_RULE_NAME, this.savedRules);
        showMessage(this.i18n.msg.saveDone);
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
