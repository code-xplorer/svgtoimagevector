import { VectorDocument } from '../../types/vector';

export interface HistoryEntry {
  document: VectorDocument;
  description: string;
  timestamp: number;
}

export class HistoryManager {
  private past: HistoryEntry[] = [];
  private future: HistoryEntry[] = [];
  private maxDepth: number;

  constructor(maxDepth: number = 40) {
    this.maxDepth = maxDepth;
  }

  /**
   * Pushes a new snapshot onto the undo stack and clears future
   */
  public push(document: VectorDocument, description: string = 'Edit'): void {
    // Deep clone to ensure immutability
    const snapshot = JSON.parse(JSON.stringify(document)) as VectorDocument;
    this.past.push({
      document: snapshot,
      description,
      timestamp: Date.now(),
    });

    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }

    this.future = [];
  }

  public canUndo(): boolean {
    return this.past.length > 1;
  }

  public canRedo(): boolean {
    return this.future.length > 0;
  }

  /**
   * Undoes to previous entry, returning the restored document
   */
  public undo(currentDocument: VectorDocument): VectorDocument | null {
    if (!this.canUndo()) return null;

    const currentEntry: HistoryEntry = {
      document: JSON.parse(JSON.stringify(currentDocument)),
      description: 'Current',
      timestamp: Date.now(),
    };
    this.future.unshift(currentEntry);

    // Pop the current top
    this.past.pop();
    const previous = this.past[this.past.length - 1];

    return JSON.parse(JSON.stringify(previous.document));
  }

  /**
   * Redoes to next entry, returning the restored document
   */
  public redo(currentDocument: VectorDocument): VectorDocument | null {
    if (!this.canRedo()) return null;

    const next = this.future.shift()!;
    this.past.push({
      document: JSON.parse(JSON.stringify(currentDocument)),
      description: 'Redo step',
      timestamp: Date.now(),
    });

    return JSON.parse(JSON.stringify(next.document));
  }

  public clear(): void {
    this.past = [];
    this.future = [];
  }
}
