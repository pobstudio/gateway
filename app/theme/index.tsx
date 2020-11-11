import { createGlobalStyle } from 'styled-components';
export const ThemedGlobalStyle = createGlobalStyle`
    body, html, * {
        box-sizing: border-box;
        font-family: Helvetica, sans-serif, Arial;
    }
    html {
    }
    body {
        min-height: 100vh;
        width: 100%;
        margin: 0;
    }
`;
