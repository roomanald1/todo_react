import { useContext, useState } from "react";
import { FaCheck, FaCircle } from "react-icons/fa";
import { ApplicationContext } from "./ApplicationContext";
import React from "react";
import {  map } from "rxjs";
import { useObservable } from "../utils/useObservable";
import moment from "moment";
import { Todo } from "src/model/applicationState";

export const Item = (props: { item: any; }) => {
    const [expand, setExpand] = React.useState<boolean>();
    const appContext = useContext(ApplicationContext);

    const isDue = useObservable(() => appContext?.getNotifiedMessages$().pipe(map(_ => _.has(props.item.id))));

    const onRemove = () => {
        if (window.confirm("Are you sure you want to remove this item?")) {
            appContext?.deleteItem(props.item.id);
        }
    };

    const onToggleStatus = () => {
        appContext?.toggleStatus(props.item.completed, props.item.id);
    };

    const onDone = () => {
        setExpand(false);
    }

    const className = isDue 
        ? "due" 
        : props.item.completed 
            ? "completed" 
            : "open";

    const onExpand = (e: React.MouseEvent<HTMLTableRowElement>) => {
        setExpand(prev => !prev)

        e.currentTarget.scrollIntoView()
    }

    return (
        <tr onDoubleClick={onExpand} className={className} key={props.item.id}>
            <td style={{ width: "15%", overflow: "auto" }}>
                <button onClick={onToggleStatus}>
                    {props.item.completed === true ? <FaCheck style={{ color: "green" }} /> : <FaCircle style={{ color: "lightblue" }} />}
                </button>
            </td>
            <td style={{ width: "65%", placeContent:"baseline", height: expand ? "200px" : "auto" , cursor: "pointer", overflow: "auto" }}>
                <div style={{display: "flex", flexDirection: "column",width: "100%", height: "100%"}}>
                    <span>{props.item.description}</span>
                    {expand && <ItemDetail item={props.item} onDone={onDone}/>}
                </div>
             </td>
            <td style={{ width: "25%", overflow: "auto" }}>
                <div style={{display: "flex", flexDirection: "column",width: "100%", height: "100%"}}>
                    <span>{moment(props.item.due).fromNow()}</span>
                    {expand && <DueDetail onDone={onDone} item={props.item}/>}
                </div>
            </td>
            <td style={{ width: "23px", overflow: "auto" }}><button onClick={onRemove}>X</button></td>
        </tr>);
};


export const ItemDetail = (props: {item:Todo, onDone: () => void}) => {
    const [detail, setDetail] = useState(props.item.detail);
    const appContext = useContext(ApplicationContext);

    React.useEffect(() => {
        setDetail(prev => props.item.detail ?? prev);
    }, [props.item.detail]);

    return (<>
        <div style={{flex: 1, minHeight: 300}}>
            <textarea value={detail ?? undefined} onChange={(e) => setDetail(e.target.value)} />
        </div>
        <button onClick={() => {
            appContext?.updateItem({...props.item, detail});
            props.onDone();
        }}>Update</button>
    </>);
}

export const DueDetail = (props: {item:any, onDone: () => void}) => {
    const [due, setDue] = useState(props.item.due);
    const appContext = useContext(ApplicationContext);
    return (<>
        <div style={{flex: 1}}>
            <input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
        </div>
        <button onClick={() => {
            appContext?.updateItem({...props.item, due});
            props.onDone();
        }}>Update</button>
    </>);
}