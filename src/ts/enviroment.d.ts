declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly PORT: string | undefined
      readonly BASE_URL: string
    }
  }
}export {}