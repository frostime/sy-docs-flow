import {
    Plugin,
    showMessage,
    Dialog,
    getFrontend,
    Menu
} from "siyuan";
import "@/index.scss";

import SavedRules from "@/components/config/saved-rules.svelte";
import GlobalSetting from "@/components/config/global-setting.svelte";

import { confirmDialog, i18n, setI18n } from "@/utils";
import { MatchRule, RuleFactory } from "@/rules";
import { setting } from "@/settings";

import { TabHub, FullScreen } from "@/display";

// import { changelog } from "sy-plugin-changelog";

const frontEnd = getFrontend();
const isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

const SAVE_RULE_NAME = "saved-rules.json";
const DEFAULT_SETTING = "setting.default.json";

function unescapeHTML(htmlString: string) {
    var doc = new DOMParser().parseFromString(htmlString, 'text/html');
    return doc.documentElement.textContent;
}

export default class DocsFlowPlugin extends Plugin {

    tabHub: IOpenHandler;

    savedRules: { [key: string]: IRule } = {};

    declare i18n: typeof i18n;

    async onload() {
        if (isMobile) {
            this.tabHub = new FullScreen(this);
        } else {
            this.tabHub = new TabHub(this);
        }
        // 图标的制作参见帮助文档
        this.addIcons(`<symbol id="iconFlow" viewBox="0 0 32 32"><path d="M1.038 16c0-0.652 0.529-1.181 1.181-1.181v0h2.362c0.652 0 1.181 0.529 1.181 1.181s-0.529 1.181-1.181 1.181v0h-2.362c-0.652 0-1.181-0.529-1.181-1.181v0zM7.338 16c0-0.652 0.529-1.181 1.181-1.181v0h2.363c0.652 0 1.181 0.529 1.181 1.181s-0.529 1.181-1.181 1.181v0h-2.363c-0.652 0-1.181-0.529-1.181-1.181v0zM13.637 16c0-0.652 0.529-1.181 1.181-1.181v0h2.362c0.652 0 1.181 0.529 1.181 1.181s-0.529 1.181-1.181 1.181v0h-2.363c-0.652 0-1.181-0.529-1.181-1.181v0zM19.938 16c0-0.652 0.529-1.181 1.181-1.181v0h2.363c0.652 0 1.181 0.529 1.181 1.181s-0.529 1.181-1.181 1.181v0h-2.363c-0.652 0-1.181-0.529-1.181-1.181v0zM26.237 16c0-0.652 0.529-1.181 1.181-1.181v0h2.363c0.652 0 1.181 0.529 1.181 1.181s-0.529 1.181-1.181 1.181v0h-2.363c-0.652 0-1.181-0.529-1.181-1.181v0zM4.581 0.25c-0.652 0-1.181 0.529-1.181 1.181v0 6.694c0 1.74 1.41 3.15 3.15 3.15v0h18.9c1.74 0 3.15-1.41 3.15-3.15v0-6.694c0-0.652-0.529-1.181-1.181-1.181s-1.181 0.529-1.181 1.181v0 6.694c0 0.435-0.353 0.787-0.788 0.787v0h-18.9c-0.435 0-0.787-0.353-0.787-0.787v0-6.694c0-0.652-0.529-1.181-1.181-1.181v0zM27.419 31.75c0.652 0 1.181-0.529 1.181-1.181v0-6.694c0-1.74-1.41-3.15-3.15-3.15v0h-18.9c-1.74 0-3.15 1.41-3.15 3.15v0 6.694c0 0.652 0.529 1.181 1.181 1.181s1.181-0.529 1.181-1.181v0-6.694c0-0.435 0.353-0.788 0.787-0.788v0h18.9c0.435 0 0.788 0.353 0.788 0.788v0 6.694c0 0.652 0.529 1.181 1.181 1.181z"></path></symbol>`);

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

        await this.loadSetting();
        this.savedRules = await this.loadData(SAVE_RULE_NAME);
        this.savedRules = this.savedRules || {};

        this.eventBus.on("click-blockicon", this.onGutterClicked.bind(this));
        this.eventBus.on("click-editortitleicon", ({ detail }) => {
            const rootID = detail.data.rootID;
            detail.menu.addItem({
                icon: "iconFlow",
                label: `${i18n.name}-${i18n.rules.child}`,
                click: () => {
                    this.tabHub.open(RuleFactory("ChildDocument", rootID));
                }
            });
            detail.menu.addItem({
                icon: "iconFlow",
                label: `${i18n.name}-${i18n.rules.offspringDocument}`,
                click: () => {
                    this.tabHub.open(RuleFactory("OffspringDocument", rootID));
                }
            });

            if (detail.data.refCount === 0) {
                return;
            }
            console.log("click-editortitleicon", detail);
            detail.menu.addItem({
                icon: "iconFlow",
                label: i18n.button.openBackInDocFlow,
                click: () => {
                    this.tabHub.open(RuleFactory("BlockBacklinks", detail.data.rootID), 'Backlinks');
                }
            });
        });

        this.eventBus.on("open-siyuan-url-plugin", ({ detail }) => {
            // siyuan://plugins/sy-docs-flow/(method)?param=xxx
            // e.g. siyuan://plugins/sy-docs-flow/open-rule?ruleType=xxx&ruleInput=xxx
            const urlObj = new URL(detail.url);
            const method = urlObj.pathname.split('/').pop();
            if (method === 'open-rule') {
                const ruleName = urlObj.searchParams.get('ruleType') as TRuleType;
                const input = urlObj.searchParams.get('ruleInput');
                let rule = RuleFactory(ruleName, input);
                if (!rule) {
                    showMessage("Not a valid docs-flow rule!", 3000, 'error');
                    return;
                }
                const title = urlObj.searchParams.get('ruleTitle');
                if (title) {
                    rule.title = title;
                }
                const config = JSON.parse(urlObj.searchParams.get('ruleConfig'));
                if (config) {
                    rule.mergeConfig(config);
                }
                this.tabHub.open(rule);
            }
        });

        //@ts-ignore
        this.eventBus.on('IdList', this.eventCustomIds.bind(this));
        //@ts-ignore
        this.eventBus.on('SQL', this.eventSQL.bind(this));

        // changelog(this, 'i18n/CHANGELOG.md').then((ans) => {
        //     ans?.Dialog?.setSize({ width: '45rem', height: '27rem' });
        //     ans?.Dialog?.setFont('18px');
        // });
    }

    onunload() {
    }

    onGutterClicked({ detail }) {
        let blockElements: any[] = detail.blockElements;
        if (blockElements.length > 1) {
            return;
        }
        let blockEle: HTMLDivElement = blockElements[0];
        let datatype = blockEle.getAttribute("data-type");
        if (datatype !== "NodeBlockQueryEmbed") {
            return;
        }
        let blockQuery = blockEle.getAttribute("data-content");
        blockQuery = unescapeHTML(blockQuery);
        let menu: Menu = detail.menu;
        menu.addItem({
            icon: "iconFlow",
            label: i18n.button.openInDocFlow,
            click: () => {
                if (blockQuery.startsWith('//!js')) {
                    this.tabHub.open(RuleFactory("JS", blockQuery));
                } else {
                    this.tabHub.open(RuleFactory("SQL", blockQuery));
                }
            }
        });
    }

    open(type: TRuleType, input: any, config?: any) {
        let rule = RuleFactory(type, input);
        if (rule === null) return;
        if (config) {
            rule.mergeConfig(config);
        }
        this.tabHub.open(rule);
    }

    eventCustomIds(event: CustomEvent<CustomEventDetail<BlockId[]>>) {
        console.groupCollapsed("DocsFlowPlugin Eventbus");
        console.log("CustomEvent[IdList] detail:");
        console.log(event.detail);
        console.groupEnd();
        let ids = event.detail.input;
        let config = event.detail.config;
        let rule = RuleFactory("IdList", ids);
        rule.mergeConfig(config);
        this.tabHub.open(rule);
    }

    eventSQL(event: CustomEvent<CustomEventDetail<string>>) {
        console.groupCollapsed("DocsFlowPlugin Eventbus");
        console.log("CustomEvent[SQL] detail:");
        console.log(event.detail);
        console.groupEnd();
        let sql = event.detail.input;
        let config = event.detail.config;
        let rule = RuleFactory("SQL", sql);
        rule.mergeConfig(config);
        this.tabHub.open(rule);
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
            label: this.i18n.rules.offspringDocument,
            click: () => {
                this.tabHub.open(RuleFactory("OffspringDocument"));
            }
        });
        menu.addItem({
            label: this.i18n.rules.docBacklinks,
            click: () => {
                this.tabHub.open(RuleFactory("DocBacklinks"));
            }
        });
        menu.addItem({
            label: this.i18n.rules.docBackmentions,
            click: () => {
                this.tabHub.open(RuleFactory("DocBackmentions"));
            }
        });
        menu.addItem({
            label: this.i18n.rules.sql,
            click: () => {
                const textarea = document.createElement("textarea");
                textarea.className = "b3-text-field fn__block";
                textarea.style.height = "10em";
                textarea.style.fontSize = "1.1em";
                textarea.style.lineHeight = "1.25em";
                textarea.style.fontFamily = 'var(--b3-font-family-code)';
                textarea.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.ctrlKey) {
                        e.stopPropagation();
                    }
                });

                confirmDialog('SQL', textarea, () => {
                    let sql = textarea.value;
                    let pat = /select\s+([\s\S]+?)\s+from\s+([\s\S]+?)\s*$/i;
                    if (!pat.test(sql)) {
                        showMessage("Invalid SQL!");
                        return;
                    }
                    // this.openFlow(RuleFactory("SQL", sql));
                    this.tabHub.open(RuleFactory("SQL", sql));
                }, undefined, '650px');
            }
        });
        menu.addItem({
            label: this.i18n.rules.js,
            click: () => {
                const textarea = document.createElement("textarea");
                textarea.className = "b3-text-field fn__block";
                textarea.style.height = "10em";
                textarea.style.fontSize = "1.1em";
                textarea.style.lineHeight = "1.25em";
                textarea.style.fontFamily = 'var(--b3-font-family-code)';
                textarea.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.ctrlKey) {
                        e.stopPropagation();
                    }
                });

                confirmDialog('JS', textarea, () => {
                    let js = textarea.value;
                    this.tabHub.open(RuleFactory("JS", js));
                }, undefined, '650px');
            }
        });
        menu.addItem({
            label: this.i18n.rules.customID,
            click: () => {
                const textarea = document.createElement("textarea");
                textarea.className = "b3-text-field fn__block";
                textarea.style.height = "4em";
                textarea.style.fontSize = "1.1em";
                textarea.style.lineHeight = "1.25em";
                textarea.style.fontFamily = 'var(--b3-font-family-code)';
                textarea.addEventListener('keydown', (e: KeyboardEvent) => {
                    if (e.key === 'Enter' && !e.ctrlKey) {
                        e.stopPropagation();
                    }
                });

                confirmDialog(this.i18n.rules.customID, textarea, () => {
                    let ids = textarea.value;
                    let idList = ids.split(/[\s,，]/).filter((id) => id);
                    this.tabHub.open(RuleFactory("IdList", idList));
                });
            }
        });
        menu.addItem({
            label: this.i18n.rules.dailynote,
            click: () => {
                let lastOpen = sessionStorage.getItem(`${this.name}::LastOpenedDN`);
                lastOpen = lastOpen ?? '';
                let notebooks = window.siyuan.notebooks.filter(n => !n.closed);
                let options = notebooks.map((n: Notebook) => {
                    return `<option value="${n.id}" ${lastOpen === n.id ? 'selected' : ''}>${n.name}</option>`;
                });
                
                let html = `
                <select class="b3-select fn__flex-center" style="width: 100%;">
                    ${options.join('\n')}
                </select>
                `;
                confirmDialog(this.i18n.selectNotebook, html, (ele: HTMLElement) => {
                    let select: HTMLSelectElement = ele.querySelector('select');
                    let val = select.value;
                    let name = select.options[select.selectedIndex].text;
                    this.tabHub.open(RuleFactory("DailyNote", val), name);
                    sessionStorage.setItem(`${this.name}::LastOpenedDN`, val);
                }, null, '350px');
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
                        width: "30rem",
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

        if (!isMobile) {
            menu.addItem({
                label: this.i18n.button.saved,
                type: "submenu",
                icon: "iconInbox",
                submenu: submenu
            });
        } else {
            menu.addItem({
                label: this.i18n.button.saved,
                type: "readonly",
                icon: "iconInbox"
            });
            submenu.forEach(item => {
                menu.addItem(item);
            })
        }
        
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

    openSetting(): void {
        let dialog = new Dialog({
            title: this.i18n.name,
            content: `<div id="SettingPanel"></div>`,
            width: "780px",
            height: "500px",
            destroyCallback: () => {
                pannel.$destroy();
                this.saveSetting();
            }
        });
        const ele: HTMLElement = dialog.element.querySelector("#SettingPanel");
        ele.style.height = "100%";
        let pannel = new GlobalSetting({
            target: ele,
        });
    }

    async loadSetting() {
        let default_setting = await this.loadData(DEFAULT_SETTING);
        default_setting = default_setting || {};
        console.debug("LoadSetting", default_setting);
        for (let key in default_setting) {
            setting.set(key, default_setting[key]);
        }
    }

    async saveSetting() {
        console.debug("SaveSetting", setting);
        this.saveData(DEFAULT_SETTING, setting);
    }

}
