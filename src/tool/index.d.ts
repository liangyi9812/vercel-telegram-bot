declare global {
  interface Promise<T> {
    delay(ms: number): Promise<T>
  }
}

export {}
