// Types for Editor State, Tools, Canvas, Selection

export type EditorTool = 
  | 'select'
  | 'direct-select' // Node editing tool
  | 'pen'           // Bezier path tool
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'line'
  | 'polygon'       // Regular polygon / star
  | 'pan';

export interface ViewportState {
  zoom: number;       // 1 = 100%
  panX: number;       // Pan offset X in px
  panY: number;       // Pan offset Y in px
  showGrid: boolean;
  gridSize: number;   // 1, 2, 4, 8, 16, etc.
  snapToGrid: boolean;
  showRulers: boolean;
}

export interface SelectionState {
  selectedIds: string[];
  activeNodeIndex?: number; // Selected anchor point in direct-select mode
  handleType?: 'point' | 'handleIn' | 'handleOut';
}

export type ResizeHandle = 
  | 'nw' | 'n' | 'ne' 
  | 'e'  | 'se' | 's' 
  | 'sw' | 'w' 
  | 'rot';

export interface InteractionState {
  isDragging: boolean;
  isResizing: boolean;
  isRotating: boolean;
  isPanning: boolean;
  isDrawing: boolean;
  resizeHandle?: ResizeHandle;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}
