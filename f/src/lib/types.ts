export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  files?: UploadedFile[];
  timestamp: Date;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  file?: File;
}

export interface Chat {
  id: string;
  backendId?: number;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}
