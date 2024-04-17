import type {
  BlockTune,
  BlockTool,
  BlockToolConstructable,
  BlockToolConstructorOptions
} from '@editorjs/editorjs'

type WritableKeysOf<T> = {
  [P in keyof T]: T[P] extends () => void ? never : P
}[keyof T]

export type EmbedData = {
  service: keyof EmbedConfig['services']
  source: string
  embed: string
  width?: number
  height?: number
}

type Service = {
  name: string
  regex: RegExp
  embedUrl: string
  html: string
  height?: number
  width?: number
  id?: (groups: string[]) => string | null
}

export type EmbedConfig = {
  services?: {
    facebook?: boolean
    instagram?: boolean
    youtube?: boolean
    twitter?: boolean
    'twitch-video'?: boolean
    'twitch-channel'?: boolean
    miro?: boolean
    vimeo?: boolean
    gfycat?: boolean
    imgur?: boolean
    vine?: boolean
    aparat?: boolean
    'yandex-music-track'?: boolean
    'yandex-music-album'?: boolean
    'yandex-music-playlist'?: boolean
    coub?: boolean
    codepen?: boolean
    pinterest?: boolean
    github?: boolean
  }
}

declare class Embed implements BlockToolConstructable {

  static services:
    | {
        [key in keyof EmbedConfig['services']]: Service
      }
    | undefined

  new(
    config: BlockToolConstructorOptions<
      EmbedData,
      EmbedConfig
    >,
  ): BlockTool

  set data(data: EmbedData | undefined)

  get data(): EmbedData | undefined

  private get CSS(): {
    baseClass: string
    input: string
    container: string
    inputEl: string
    inputHolder: string
    inputError: string
    linkContent: string
    linkContentRendered: string
    linkImage: string
    linkTitle: string
    linkDescription: string
    linkText: string
    progress: string
    progressLoading: string
    progressLoaded: string
    caption: string
    content: string
  }

  render(): HTMLElement

  private makeEmbed(): HTMLElement | null

  private embedIsReady(targetNode: HTMLElement): Promise<void>

  private makeInputHolder(): HTMLElement

  private setData(text: string)

  static prepare(props: { toolName: string, config: EmbedConfig }): void

  static checkServiceConfig(config: Service): boolean

  save(): ImageData

  static get toolbox(): {
    icon: string
    title: string
  }

  private showProgress(): void

  private hideProgress(): Promise<void>

  private make(
    tagName: string,
    classNames?: string | string[],
    attributes?: {
      [key in keyof WritableKeysOf<HTMLElement>]: HTMLElement[keyof HTMLElement]
    },
  ): HTMLElement

  static get enableLineBreaks(): boolean
}

