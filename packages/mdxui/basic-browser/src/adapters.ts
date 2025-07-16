export interface FileItem {
  path: string
  name: string
}

export interface ApiClient {
  getFiles(): Promise<FileItem[]>
  getFile(path: string): Promise<string | null>
  saveFile(path: string, content: string): Promise<void>
}

export class BrowserApiClient implements ApiClient {
  constructor(private baseUrl: string = '') {}

  async getFiles(): Promise<FileItem[]> {
    const response = await fetch(`${this.baseUrl}/api/files`)
    if (!response.ok) {
      throw new Error(`Failed to fetch files: ${response.statusText}`)
    }
    return response.json()
  }

  async getFile(path: string): Promise<string | null> {
    const response = await fetch(`${this.baseUrl}/api/file?path=${encodeURIComponent(path)}`)
    if (response.status === 404) {
      return null
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }
    return response.text()
  }

  async saveFile(path: string, content: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filePath: path,
        markdownContent: content,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.statusText}`)
    }
  }
}

export interface StaticApiClientOptions {
  files: FileItem[]
  content: string
  onSave?: (content: string, file: FileItem | null) => Promise<void>
}

export class StaticApiClient implements ApiClient {
  private files: FileItem[]
  private content: string
  private onSave?: (content: string, file: FileItem | null) => Promise<void>

  constructor(options: StaticApiClientOptions) {
    this.files = options.files
    this.content = options.content
    this.onSave = options.onSave
  }

  async getFiles(): Promise<FileItem[]> {
    return Promise.resolve(this.files)
  }

  async getFile(path: string): Promise<string | null> {
    // For static content, just return the provided content
    // In real usage, you might want to map paths to different content
    return Promise.resolve(this.content)
  }

  async saveFile(path: string, content: string): Promise<void> {
    if (this.onSave) {
      const file = this.files.find((f) => f.path === path) || null
      await this.onSave(content, file)
    }
    // Update the internal content for subsequent reads
    this.content = content
  }
}
