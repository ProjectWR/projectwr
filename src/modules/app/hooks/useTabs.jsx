import { useCallback } from "react";
import { mainPanelStore } from "../stores/mainPanelStore";
import useMainPanel from "./useMainPanel";
import { equalityDeep } from "lib0/function";


const useTabs = () => {
    const tabs = mainPanelStore((state) => state.tabs);
    const setTabs = mainPanelStore((state) => state.setTabs);
    const mainPanelState = mainPanelStore((state) => state.mainPanelState);

    const { activatePanel } = useMainPanel();

    const closeTab = useCallback(
        (panelType, mode, breadcrumbs) => {
            const newTabs = [...tabs];
            const index = newTabs.findIndex((x) => equalityDeep(x, { panelType, mode, breadcrumbs }));
            if (index === -1) return;
            newTabs.splice(index, 1);
            if (newTabs.length > 0) {
                setTabs(newTabs);
                if (tabs[index] && equalityDeep(tabs[index], mainPanelState)) {
                    // If closing active tab, activate neighbor
                    const nextTab = newTabs[index] || newTabs[index - 1];
                    if (nextTab)
                        activatePanel(nextTab.panelType, nextTab.mode, nextTab.breadcrumbs);
                }
            } else {
                // If all tabs closed? Usually we keep one or go home.
                // For now just empty tabs is fine or handled by store.
                setTabs([]);
                // optionally go home
                activatePanel("home", null, []);
            }
        },
        [tabs, setTabs, mainPanelState, activatePanel],
    );

    return { closeTab }
}

export default useTabs;