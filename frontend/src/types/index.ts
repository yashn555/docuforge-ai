export interface UploadResponse {
  success: boolean;
  sessionId: string;
  file: {
    name: string;
    size: number;
    path: string;
  };
  preview: {
    content: string;
    wordCount: number;
    charCount: number;
  };
  message: string;
}

export interface SessionInfo {
  id: string;
  createdAt: number;
  lastAccessed: number;
  hasTemplate: boolean;
  hasTemplateModel: boolean;
  hasUserInput: boolean;
  hasGeneratedDoc: boolean;
}

export interface FileInfo {
  name: string;
  size: number;
  path?: string;
}