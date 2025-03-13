export type Delta = AddDelta | MarkDelta | DeleteDelta | AmendDelta | undefined;

export type AddDelta = {
    id: number;
    type: "Add";
    description: string;
}

export type MarkDelta = {
    type: "Mark";
    id: number;
    completed: boolean;
}

export type DeleteDelta = {
    type: "Delete";
    id: number;
}

export type AmendDelta = {
    type: "Amend";
    item: any;
    id: number;
}
