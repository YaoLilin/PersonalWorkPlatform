import {createContext} from "react";

const ThemeContext = createContext();

function ThemProvider({children}) {
    const theme = {
        styleColor :{
            accentColor:'rgb(22, 119, 255)'
        }
    }

    return <ThemeContext.Provider value={theme}>
        {children}
    </ThemeContext.Provider>
}

export {ThemeContext,ThemProvider}