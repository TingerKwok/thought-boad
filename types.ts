
export interface Note {
  id: string;
  content: string;
}

export interface Topic {
  id:string;
  title: string;
  notes: Note[];
}
