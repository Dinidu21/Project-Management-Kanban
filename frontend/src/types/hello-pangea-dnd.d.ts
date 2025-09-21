declare module '@hello-pangea/dnd' {
    import * as React from 'react';

    export type DropResult = any;
    export const DragDropContext: React.FC<{ onDragEnd: (result: DropResult) => void } & any>;
    export const Droppable: React.FC<any>;
    export const Draggable: React.FC<any>;
}
