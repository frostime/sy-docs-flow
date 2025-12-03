import {
    showMessage,
    Dialog,
    openTab,
    type Custom,
} from "siyuan";

import type DocsFlowPlugin from ".";
import DocsFlow from "@/components/docs-flow/docs-flow.svelte";
import { MatchRule } from "@/rules";
import { confirmDialog, i18n } from "@/utils";
import { mount, unmount } from "svelte";

export class TabHub {
    plugin: DocsFlowPlugin;
    tabs: {
        [key: string]: {
            rule: MatchRule;
            tab: () => Custom;
        }
    }

    constructor(plugin: DocsFlowPlugin) {
        this.plugin = plugin;
        this.tabs = {};
    }

    async open(rule: MatchRule, tabTitle?: string) {
        if (!rule) return;

        let hash = rule.hash;
        if (this.tabs[hash]) {
            this.openTab(hash);
            return;
        }
        if (!rule.validateInput()) {
            return;
        }

        // let result = await rule.next();
        // let ids = result.ids;
        // if (!ids || ids.length === 0) {
        //     showMessage("No matching docs found.");
        //     return;
        // }

        let tabDiv = document.createElement("div");
        tabDiv.classList.add("docs-flow-page");
        let flow = mount(DocsFlow, {
            target: tabDiv,
            props: {
                app: this.plugin.app,
                // listDocuemntsId: ids,
                rule: rule,
                onConfigChanged: ({ ruleHash, config }) => {
                    console.log("configChanged", { ruleHash, config });
                    const rule = this.tabs[ruleHash].rule;
                    for (let key in config) {
                        rule.config[key] = config[key];
                        console.log("configChanged", key, config[key]);
                    }
                },
                onSaveThis: ({ ruleHash }) => {
                    console.log("saveThis", { ruleHash });
                    const rule = this.tabs[ruleHash].rule;
                    this.plugin.saveRule(rule);
                },
                onRenameThis: ({ ruleHash }) => {
                    // console.log("renameThis", { ruleHash });
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
                }
            }
        });

        const Tabs = this.tabs;
        const dynamicLoadingEnabled = rule.config.dynamicLoading?.enabled;
        let tab = this.plugin.addTab({
            type: hash,
            init() {
                this.element.appendChild(tabDiv);
                if (dynamicLoadingEnabled === true) {
                    this.element.addEventListener("scroll", flow.onscroll);
                }
            },
            beforeDestroy() {
                // this.element.removeEventListener("scroll", flow.onscroll);
                if (dynamicLoadingEnabled === true) {
                    this.element.removeEventListener("scroll", flow.onscroll);
                }
                unmount(flow);
                tabDiv?.remove();
            },
            destroy: () => {
                delete Tabs[hash];
                // console.log("destroy tab:", hash);
            }
        });
        this.tabs[hash] = {
            rule,
            tab
        };
        this.openTab(hash, tabTitle);
    }

    private openTab(hash: any, title?: string) {
        // let tab = this.tabs[hash].tab;
        // console.log(`Open tab ${hash}`)
        let rule = this.tabs[hash].rule;
        title = title || rule.title;
        rule.title = title;
        openTab({
            app: this.plugin.app,
            custom: {
                icon: "iconFlow",
                title: title,
                data: hash,
                id: this.plugin.name + hash
            },
            keepCursor: false,
            removeCurrentTab: true
        }).then(tab => {
            // console.log(tab);
            if (window.siyuan.config.fileTree.openFilesUseCurrentTab) {
                let dblclickEvent = new MouseEvent('dblclick', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });
                tab.headElement.dispatchEvent(dblclickEvent);
            }
        })
    }
}


export class FullScreen {
    plugin: DocsFlowPlugin;
    dialog: Dialog;

    rule: MatchRule;

    constructor(plugin: DocsFlowPlugin) {
        this.plugin = plugin;
    }

    async open(rule: MatchRule, tabTitle?: string) {
        if (!rule) return;

        if (!rule.validateInput()) {
            return;
        }

        if (this.dialog) {
            this.dialog.destroy();
        }

        this.rule = rule;

        let tabDiv = document.createElement("div");
        tabDiv.classList.add("docs-flow-page", "fn__flex-1", "fn__flex");
        let flow = mount(DocsFlow, {
            target: tabDiv,
            props: {
                app: this.plugin.app,
                // listDocuemntsId: ids,
                rule: rule,
                onConfigChanged: ({ ruleHash, config }) => {
                    console.log("configChanged", { ruleHash, config });
                    // let ruleHash = detail.ruleHash;
                    const rule = this.rule;
                    for (let key in config) {
                        rule.config[key] = config[key];
                        console.log("configChanged", key, config[key]);
                    }
                },
                onSaveThis: ({ ruleHash }) => {
                    console.log("saveThis", { ruleHash });
                    // let ruleHash = detail.ruleHash;
                    const rule = this.rule;
                    this.plugin.saveRule(rule);
                },
                onRenameThis: ({ ruleHash }) => {
                    console.log("renameThis", { ruleHash });
                    // let ruleHash = detail.ruleHash;
                    const rule = this.rule;

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
                }
            }
        });

        //Close the side panel
        const menu = document.querySelector('#menu') as HTMLElement;
        const commonMenu = document.querySelector('#commonMenu') as HTMLElement;
        commonMenu.classList.toggle('fn__none', false);
        menu.style.setProperty('transform', '');

        this.dialog = new Dialog({
            title: tabTitle || rule.title,
            content: '<main id="docs-flow-fullscreen" class="fn__flex fn__flex-1"/>',
            width: '100%',
            height: '100%',
            destroyCallback: () => {
                unmount(flow);
                this.dialog = null;
            }
        });
        this.dialog.element.querySelector('#docs-flow-fullscreen').appendChild(tabDiv);
        (this.dialog.element.querySelector('.b3-dialog__container') as HTMLElement).style.maxWidth = 'unset';
        const closeBtn = (this.dialog.element.querySelector('svg.b3-dialog__close') as HTMLElement);
        closeBtn.style.right = '20px';
        closeBtn.style.top = '5px';
    }
}
