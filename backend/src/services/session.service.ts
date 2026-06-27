import { v4 as uuidv4 } from 'uuid';

interface SessionData {
  id: string;
  createdAt: number;
  lastAccessed: number;
  templateFile?: {
    originalName: string;
    path: string;
    size: number;
  };
  templateModel?: any;
  userInput?: any;
  generatedDocument?: {
    sections: Record<string, any>;
    totalSections: number;
    aiGenerated: number;
    fallbackGenerated: number;
    totalTime: number;
    success: boolean;
    errors: string[];
  };
  composedFile?: {
    path: string;
    fileName: string;
    sectionsMapped: number;
    totalSections: number;
    createdAt: number;
  };
}

class SessionService {
  private sessions: Map<string, SessionData> = new Map();
  private TTL = 3600000; // 1 hour

  createSession(id?: string): SessionData {
    const sessionId = id || uuidv4();
    const session: SessionData = {
      id: sessionId,
      createdAt: Date.now(),
      lastAccessed: Date.now()
    };
    this.sessions.set(sessionId, session);
    
    // Auto cleanup after TTL
    setTimeout(() => {
      this.cleanup();
    }, this.TTL);
    
    return session;
  }

  getSession(id: string): SessionData | undefined {
    const session = this.sessions.get(id);
    if (session) {
      session.lastAccessed = Date.now();
    }
    return session;
  }

  updateSession(id: string, data: Partial<SessionData>): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    Object.assign(session, data);
    session.lastAccessed = Date.now();
    return true;
  }

  deleteSession(id: string): boolean {
    return this.sessions.delete(id);
  }

  cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;
    for (const [id, session] of this.sessions) {
      if (now - session.lastAccessed > this.TTL) {
        this.sessions.delete(id);
        deletedCount++;
      }
    }
    if (deletedCount > 0) {
      console.log(`🧹 Cleaned up ${deletedCount} expired sessions`);
    }
  }

  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  // Get session count
  getSessionCount(): number {
    return this.sessions.size;
  }

  // Clear all sessions (useful for testing)
  clearAllSessions(): void {
    this.sessions.clear();
    console.log('🧹 All sessions cleared');
  }

  // Get session by template path (for cleanup)
  getSessionByTemplatePath(path: string): SessionData | undefined {
    for (const session of this.sessions.values()) {
      if (session.templateFile?.path === path) {
        return session;
      }
    }
    return undefined;
  }

  // Update composed file with additional metadata
  updateComposedFile(id: string, composedFile: SessionData['composedFile']): boolean {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    session.composedFile = composedFile;
    session.lastAccessed = Date.now();
    return true;
  }

  // Get composed file info
  getComposedFile(id: string): SessionData['composedFile'] | undefined {
    const session = this.sessions.get(id);
    return session?.composedFile;
  }

  // Check if session has composed file
  hasComposedFile(id: string): boolean {
    const session = this.sessions.get(id);
    return !!session?.composedFile;
  }
}

export default new SessionService();