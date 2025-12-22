export interface Theme {
    id: string;
    name: string;
    background: string;
    paper: string;
    primary: string;
    text: string;
    textSecondary: string;
}

export const themes: Theme[] = [
    // Light themes
    {
        id: 'light',
        name: 'Light',
        background: '#fafafa',
        paper: '#ffffff',
        primary: '#e03e3e',
        text: '#1a1a1a',
        textSecondary: '#666666',
    },
    {
        id: 'serika',
        name: 'Serika',
        background: '#e1e1e3',
        paper: '#f5f5f5',
        primary: '#e2b714',
        text: '#323437',
        textSecondary: '#646669',
    },
    {
        id: 'solarizedlight',
        name: 'Solarized Light',
        background: '#fdf6e3',
        paper: '#eee8d5',
        primary: '#268bd2',
        text: '#657b83',
        textSecondary: '#839496',
    },
    {
        id: '9009',
        name: '9009',
        background: '#e0e0df',
        paper: '#f0f0ee',
        primary: '#99856a',
        text: '#3d3a32',
        textSecondary: '#5d5a52',
    },
    {
        id: 'olivia',
        name: 'Olivia',
        background: '#e8c4b8',
        paper: '#fafafa',
        primary: '#363434',
        text: '#363434',
        textSecondary: '#5d5a52',
    },
    // Dark themes
    {
        id: 'dark',
        name: 'Dark',
        background: '#121212',
        paper: '#1E1E1E',
        primary: '#e03e3e',
        text: '#fafafa',
        textSecondary: '#a0a0a0',
    },
    {
        id: 'dracula',
        name: 'Dracula',
        background: '#282a36',
        paper: '#44475a',
        primary: '#bd93f9',
        text: '#f8f8f2',
        textSecondary: '#6272a4',
    },
    {
        id: 'nord',
        name: 'Nord',
        background: '#2e3440',
        paper: '#3b4252',
        primary: '#88c0d0',
        text: '#eceff4',
        textSecondary: '#d8dee9',
    },
    {
        id: 'gruvbox',
        name: 'Gruvbox',
        background: '#282828',
        paper: '#3c3836',
        primary: '#d79921',
        text: '#ebdbb2',
        textSecondary: '#a89984',
    },
    {
        id: 'monokai',
        name: 'Monokai',
        background: '#272822',
        paper: '#3e3d32',
        primary: '#a6e22e',
        text: '#f8f8f2',
        textSecondary: '#75715e',
    },
    {
        id: 'solarizeddark',
        name: 'Solarized Dark',
        background: '#002b36',
        paper: '#073642',
        primary: '#b58900',
        text: '#839496',
        textSecondary: '#657b83',
    },
    {
        id: '8008',
        name: '8008',
        background: '#333a45',
        paper: '#3c4756',
        primary: '#f44c7f',
        text: '#e9ecf0',
        textSecondary: '#a2aebd',
    },
    {
        id: 'carbon',
        name: 'Carbon',
        background: '#313131',
        paper: '#575d5e',
        primary: '#ed6b21',
        text: '#e3d9c6',
        textSecondary: '#9d9b92',
    },
    {
        id: 'nautilus',
        name: 'Nautilus',
        background: '#132237',
        paper: '#1d3b53',
        primary: '#ebb723',
        text: '#cad2db',
        textSecondary: '#8ba5b9',
    },
    {
        id: 'oblivion',
        name: 'Oblivion',
        background: '#313231',
        paper: '#3e403e',
        primary: '#a5c261',
        text: '#f2f2f2',
        textSecondary: '#9c9e9c',
    },
    {
        id: 'mizu',
        name: 'Mizu',
        background: '#253746',
        paper: '#2f4254',
        primary: '#7fb4c3',
        text: '#cbd9e3',
        textSecondary: '#8aa7b8',
    },
    {
        id: 'burgundy',
        name: 'Burgundy',
        background: '#1a1a1a',
        paper: '#2a2a2a',
        primary: '#8c1c13',
        text: '#e3ddd1',
        textSecondary: '#a09889',
    },
    {
        id: 'eclipse',
        name: 'Eclipse',
        background: '#1b1d20',
        paper: '#25282c',
        primary: '#f47954',
        text: '#d1d6db',
        textSecondary: '#9099a1',
    },
    {
        id: 'hyperfuse',
        name: 'Hyperfuse',
        background: '#2b2a33',
        paper: '#3b3a44',
        primary: '#a37acc',
        text: '#c7ccd1',
        textSecondary: '#9598a0',
    },
    {
        id: 'phantom',
        name: 'Phantom',
        background: '#211333',
        paper: '#2d1b45',
        primary: '#f14e77',
        text: '#eed5ff',
        textSecondary: '#b490d0',
    },
    {
        id: 'aurora',
        name: 'Aurora',
        background: '#011926',
        paper: '#021e2e',
        primary: '#00e980',
        text: '#ffffff',
        textSecondary: '#6edaff',
    },
    {
        id: 'vilebloom',
        name: 'Vilebloom',
        background: '#1f202e',
        paper: '#292a3a',
        primary: '#b74c7e',
        text: '#e9e2da',
        textSecondary: '#9b8fad',
    },
    {
        id: 'cobalt',
        name: 'Cobalt',
        background: '#002240',
        paper: '#00305a',
        primary: '#ffc600',
        text: '#ffffff',
        textSecondary: '#00aeff',
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        background: '#2b213a',
        paper: '#3b2d4d',
        primary: '#ff7edb',
        text: '#ffffff',
        textSecondary: '#7ee8fa',
    },
];

export const getThemeById = (id: string): Theme => {
    return themes.find(t => t.id === id) || themes[0];
};

export const isDarkTheme = (theme: Theme): boolean => {
    // Calculate relative luminance to determine if theme is dark
    const hex = theme.background.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
};
