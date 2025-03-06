import { useContext, useState } from "react";
import { FaCheck, FaCircle } from "react-icons/fa";
import { ApplicationContext } from "./ApplicationContext";
import React from "react";

export const Item = (props: { item: any; }) => {
    const [expand, setExpand] = React.useState<boolean>();
    const appContext = useContext(ApplicationContext);
    const onRemove = () => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            appContext.deleteItem(props.item.id);
        }
    };

    const onToggleStatus = () => {
        appContext.toggleStatus(props.item.completed, props.item.id);
    };

    return (
        <tr className={props.item.completed ? "completed" : "open"} key={props.item.id}>
            <td style={{ width: "15%", overflow: "auto" }}>
                <button onClick={onToggleStatus}>
                    {props.item.completed === true ? <FaCheck style={{ color: "green" }} /> : <FaCircle style={{ color: "lightblue" }} />}
                </button>
            </td>
            <td onDoubleClick={() => setExpand(prev => !prev)} style={{ width: "65%", placeContent:"baseline", height: expand ? "200px" : "auto" , cursor: "pointer", overflow: "auto" }}>
                <div style={{display: "flex", flexDirection: "column",width: "100%", height: "100%"}}>
                    <span>{props.item.description}</span>
                    {expand && <ItemDetail item={props.item}/>}
                </div>
             </td>
            <td style={{ width: "15%", overflow: "auto" }}>{props.item.due}</td>
            <td style={{ width: "15%", overflow: "auto" }}><button onClick={onRemove}>X</button></td>
        </tr>);
};


export const ItemDetail = (props: {item:any}) => {
    const [detail, setDetail] = useState(props.item.detail);
    const appContext = useContext(ApplicationContext);

    return (<>
        <div style={{flex: 1}}>
            <textarea value={detail} onChange={(e) => setDetail(e.target.value)} />
        </div>
        <button onClick={() => appContext.updateItem({...props.item, detail})}>Update</button>
    </>);
}