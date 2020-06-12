import { AppTypes } from 'src/types';

export let constNavBarEntries: AppTypes.NavBarChild[] = [
    {
        name: "Dashboard",
        routerLinkUrl: "/",
        icon: "dashboard"
    },
    {
        name: "Settings",
        routerLinkUrl: "/settings/",
        icon: "settings"
    },
];