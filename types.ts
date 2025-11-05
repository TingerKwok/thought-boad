
export interface Note {
  id: string;
  content: string;
  timestamp: string;
}

export interface Topic {
  id:string;
  title: string;
  notes: Note[];
  createdAt: string;
}