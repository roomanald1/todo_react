import { Add } from "./Add";
import { Header } from "./Header";
import { Items } from "./Items";

export const App = () => {
    return (
        <div style={{display: "flex", flexDirection: "column", height: "100%", padding: 10, boxSizing: "border-box"}}>      
            <Header/>
            <Items/>
            <Add/>
        </div>
        )
}
