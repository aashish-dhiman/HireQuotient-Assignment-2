/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{html, jsx}", "./src/**/*"],
    theme: {
        extend: {
            colors: {
                bgDark: "#121212",
                textPara: "#57556C",
                heading: "#3182CE",
                textWhite: "#FAF7F2",
                textLight: "#9ca3af",
                darkHover: "#18191E",
            },
        },
    },
    darkMode: "class",
    plugins: [],
};
