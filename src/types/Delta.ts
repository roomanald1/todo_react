export type Delta = AddDelta | MarkDelta | DeleteDelta | undefined;

export type AddDelta = {
    id: string;
    type: "Add";
    description: string;
}

export type MarkDelta = {
    type: "Mark";
    id: string;
    completed: boolean;
}

export type DeleteDelta = {
    type: "Delete";
    id: string;
}
