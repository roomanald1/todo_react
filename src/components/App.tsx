import React, { useCallback } from "react";

const baseUrl = "https://todo-okla.onrender.com";
export const App = () => {
    const [viewMode, setViewMode] = React.useState<"all" | "completed" | "open">("open");
    const [items, setItems] = React.useState<any[]>([]);

    const fetchItems = useCallback(() => {
        const action = viewMode === "all" ? "/all" : viewMode === "completed" ? "/done" : "";
        fetch(baseUrl + "/api/items"+ action).then(res => res.json()).then(data => {
            setItems(data)
        });
    }, [setItems, viewMode]);

    React.useEffect(() => {
        fetchItems();
    }, [viewMode]);

    const onCompletedToggle = (value: boolean, id: string) => () => {
        console.log(value);
        const action = !value ? "done" : "open";
        fetch(baseUrl + `/api/items/${id}/${action}`, {method: "PUT", headers: {'Content-Type': 'application/json'}, body: `"${id}"`}).then(_ => {
            _.text().then(data => {
                console.log(data);
                fetchItems();
            });
        });
    }

    return (
        
        <div>
            <div style={{width: "100%"}} onChange={(e:any) => setViewMode(e.target.value)}>
                <h3>View Mode</h3>
                <div><input type="radio" value="all" name="viewMode" defaultChecked={viewMode ==="all"}/>ALL</div>
                <div><input type="radio" value="completed" name="viewMode" defaultChecked={viewMode ==="completed"}/>COMPLETED</div>
                <div><input type="radio" value="open" name="viewMode" defaultChecked={viewMode ==="open"}/>OPEN</div>
            </div>
            <h1>TODO list</h1>
            <table>
                <thead>
                    <th>ID</th>
                    <th>Description</th>
                    <th>Completed</th>
                    <th>Added On</th>
                </thead>
                <tbody>
                    {items.map(item => 
                        <tr className={item.completed ? "completed": "open"} key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.description}</td>
                            <td><button onClick={onCompletedToggle(item.completed, item.id)}>{item.completed?.toString()}</button></td>
                            <td>{item.added_on}</td>
                        </tr>)}
                </tbody>
            </table>

        </div>
        )
}