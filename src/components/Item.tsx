import { useContext } from "react";
import { FaCheck, FaCircle } from "react-icons/fa";
import { ApplicationContext } from "./ApplicationContext";

export const Item = (props: { item: any; }) => {
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
            <td style={{ width: "80%", overflow: "auto" }}>{props.item.description}</td>
            <td style={{ width: "15%", overflow: "auto" }}><button onClick={onRemove}>X</button></td>
        </tr>);
};
