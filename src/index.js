import { IconBrackets } from '@codexteam/icons'
import debounce from 'debounce'

export default class Embed {
  static services

  constructor({ data, api, readOnly }) {
    this.api = api
    this.nodes = {
      wrapper: null,
      container: null,
      progress: null,
      input: null,
      inputHolder: null,
    }
    this._data = Object.keys(data).length !== 0 ? data : undefined
    this.readOnly = readOnly
  }

  set data(data) {
    if (!(data instanceof Object)) {
      throw Error('Embed Tool data should be object')
    }

    this._data = data
    const oldView = this.nodes.wrapper

    if (oldView) {
      oldView.parentNode?.replaceChild(this.render(), oldView)
    }
  }

  get data() {
    return this._data
  }

  get CSS() {
    return {
      baseClass: this.api.styles.block,
      input: this.api.styles.input,
      container: 'embed-tool',
      inputEl: 'embed-tool__input',
      inputHolder: 'embed-tool__input-holder',
      inputError: 'embed-tool__input-holder--error',
      linkContent: 'embed-tool__content',
      linkContentRendered: 'embed-tool__content--rendered',
      linkImage: 'embed-tool__image',
      linkTitle: 'embed-tool__title',
      linkDescription: 'embed-tool__description',
      linkText: 'embed-tool__anchor',
      progress: 'embed-tool__progress',
      progressLoading: 'embed-tool__progress--loading',
      progressLoaded: 'embed-tool__progress--loaded',
      caption: 'embed-tool__caption',
      content: 'embed-tool__content',
    }
  }

  render() {
    if (!this._data) {
      this.nodes.wrapper = this.make('div', this.CSS.baseClass)
      this.nodes.container = this.make('div', this.CSS.container)
      this.nodes.inputHolder = this.makeInputHolder()

      this.nodes.container.appendChild(this.nodes.inputHolder)
      this.nodes.wrapper.appendChild(this.nodes.container)
    } else {
      this.nodes.wrapper = this.makeEmbed() ?? this.make('div', this.CSS.baseClass)
    }
    return this.nodes.wrapper
  }

  makeEmbed() {
    this.showProgress()
    if (!this.data || !Embed.services) return null
    const { html } = Embed.services[this.data.service]
    const wrapper = this.make('div', this.CSS.baseClass)
    const container = this.make('div', this.CSS.container)
    const template = document.createElement('template')

    template.innerHTML = html
    ;template.content.firstChild?.setAttribute('src', this.data.embed)
    ;template.content.firstChild?.classList.add(this.CSS.content)

    this.nodes.container = container
    const embedIsReady = this.embedIsReady(this.nodes.container)

    if (template.content.firstChild) {
      container.appendChild(template.content.firstChild)
    }

    embedIsReady.then(() => {
      this.hideProgress()
    })

    wrapper.appendChild(container)

    return wrapper
  }

  async embedIsReady(targetNode) {
    const PRELOADER_DELAY = 450

    let observer = null

    return new Promise((resolve) => {
      observer = new MutationObserver(debounce(resolve, PRELOADER_DELAY))
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      })
    }).then(() => {
      observer?.disconnect()
    })
  }

  makeInputHolder() {
    const inputHolder = this.make('div', this.CSS.inputHolder)

    this.nodes.progress = this.make('label', this.CSS.progress)
    this.nodes.input = this.make('div', [this.CSS.input, this.CSS.inputEl], {
      contentEditable: !this.readOnly,
    })

    this.nodes.input.dataset.placeholder = this.api.i18n.t('Link')

    this.nodes.input.addEventListener('keydown', (event) => {
      const [ENTER, A] = [13, 65]
      const cmdPressed = event.ctrlKey || event.metaKey

      switch (event.keyCode) {
        case ENTER:
          event.preventDefault()
          event.stopPropagation()

          if (
            event.target &&
            'textContent' in event.target &&
            typeof event.target.textContent === 'string'
          ) {
            this.setData(event.target.textContent)
          }
          break
        case A:
          if (cmdPressed) {
            if (
              event.target &&
              'textContent' in event.target &&
              typeof (event.target.textContent) === 'string'
            ) {
              this.setData(event.target.textContent)
            }
          }
          break
      }
    })

    inputHolder.appendChild(this.nodes.progress)
    inputHolder.appendChild(this.nodes.input)

    return inputHolder
  }

  setData(text) {
    if (!Embed.services) return
    const service = Object.entries(Embed.services).find(([, value]) => {
      return value.regex.test(text)
    })?.[1]
    if (!service) return
    const { regex, embedUrl, width, height, id = (ids) => ids.shift() } = service
    const result = regex.exec(text)?.slice(1)
    if (!result) return
    const embed = embedUrl.replace(/<%= remote_id %>/g, id(result) ?? '')
    this.data = {
      service: service.name,
      source: text,
      embed: embed,
      width,
      height,
    }
  }

  static prepare({ config = {} }) {
    const { services } = config
    if (!services) return

    let entries = Object.entries(SERVICES)

    const enabledServices = Object.entries(services)
      .filter(([, value]) => {
        return typeof value === 'boolean' && value === true
      })
      .map(([key]) => key)

    if (enabledServices.length) {
      entries = entries.filter(([key]) => enabledServices.includes(key))
    }

    Embed.services = entries.reduce((result, [key, service]) => {
      if (!(key in result)) {
        // @ts-ignore
        result[key] = service

        return result
      }
      // @ts-ignore
      result[key] = Object.assign({}, result[key], service)

      return result
    }, {})
  }

  static checkServiceConfig(config) {
    const { regex, embedUrl, html, height, width, id } = config

    let isValid =
      regex &&
      regex instanceof RegExp &&
      embedUrl &&
      typeof embedUrl === 'string' &&
      html &&
      typeof html === 'string'

    isValid = isValid && (id !== undefined ? id instanceof Function : true)
    isValid = isValid && (height !== undefined ? Number.isFinite(height) : true)
    isValid = isValid && (width !== undefined ? Number.isFinite(width) : true)

    return isValid
  }

  save() {
    return this.data
  }

  static get toolbox() {
    return {
      icon: IconBrackets,
      title: 'Embed',
    }
  }

  showProgress() {
    this.nodes.progress?.classList.add(this.CSS.progressLoading)
  }

  hideProgress() {
    return new Promise((resolve) => {
      this.nodes.progress?.classList.remove(this.CSS.progressLoading)
      this.nodes.progress?.classList.add(this.CSS.progressLoaded)

      setTimeout(resolve, 500)
    })
  }

  make(
    tagName,
    classNames,
    attributes,
  ) {
    const el = document.createElement(tagName)

    if (Array.isArray(classNames)) {
      el.classList.add(...classNames)
    } else if (classNames) {
      el.classList.add(classNames)
    }

    for (const attrName in attributes) {
      const key = attrName
      const value = attributes[key]
      if (value !== undefined) {
        el[key] = value
      }
    }

    return el
  }

  static get enableLineBreaks() {
    return true
  }
}

const SERVICES = {
  vimeo: {
    name: 'vimeo',
    regex: /(?:http[s]?:\/\/)?(?:www.)?(?:player.)?vimeo\.co(?:.+\/([^\/]\d+)(?:#t=[\d]+)?s?$)/,
    embedUrl: 'https://player.vimeo.com/video/<%= remote_id %>?title=0&byline=0',
    html: '<iframe style="width:100%;" height="320" frameborder="0"></iframe>',
    height: 320,
    width: 580,
  },
  youtube: {
    name: 'youtube',
    regex:
      /(?:https?:\/\/)?(?:www\.)?(?:(?:youtu\.be\/)|(?:youtube\.com)\/(?:v\/|u\/\w\/|embed\/|watch))(?:(?:\?v=)?([^#&?=]*))?((?:[?&]\w*=\w*)*)/,
    embedUrl: 'https://www.youtube.com/embed/<%= remote_id %>',
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
    id: ([id, params]) => {
      if (!params && id) {
        return id
      }

      const paramsMap = {
        start: 'start',
        end: 'end',
        t: 'start',
        // eslint-disable-next-line camelcase
        time_continue: 'start',
        list: 'list',
      }

      const newParams = params
        .slice(1)
        .split('&')
        .map((param) => {
          const [name, value] = param.split('=')

          if (!id) {
            id = value
            return null
          }

          if (!paramsMap[name]) return null

          if (value === 'LL' || value.startsWith('RDMM') || value.startsWith('FL')) return null

          return `${paramsMap[name]}=${value}`
        })
        .filter((param) => !!param)

      return id + '?' + newParams.join('&')
    },
  },
  coub: {
    name: 'coub',
    regex: /https?:\/\/coub\.com\/view\/([^\/\?\&]+)/,
    embedUrl: 'https://coub.com/embed/<%= remote_id %>',
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
  },
  vine: {
    name: 'vine',
    regex: /https?:\/\/vine\.co\/v\/([^\/\?\&]+)/,
    embedUrl: 'https://vine.co/v/<%= remote_id %>/embed/simple/',
    html: '<iframe style="width:100%;" height="320" frameborder="0" allowfullscreen></iframe>',
    height: 320,
    width: 580,
  },
  imgur: {
    name: 'imgur',
    regex: /https?:\/\/(?:i\.)?imgur\.com.*\/([a-zA-Z0-9]+)(?:\.gifv)?/,
    embedUrl: 'http://imgur.com/<%= remote_id %>/embed',
    html: '<iframe allowfullscreen="true" scrolling="no" id="imgur-embed-iframe-pub-<%= remote_id %>" class="imgur-embed-iframe-pub" style="height: 500px; width: 100%; border: 1px solid #000"></iframe>',
    height: 500,
    width: 540,
  },
  gfycat: {
    name: 'gfycat',
    regex: /https?:\/\/gfycat\.com(?:\/detail)?\/([a-zA-Z]+)/,
    embedUrl: 'https://gfycat.com/ifr/<%= remote_id %>',
    html: "<iframe frameborder='0' scrolling='no' style=\"width:100%;\" height='436' allowfullscreen ></iframe>",
    height: 436,
    width: 580,
  },
  'twitch-channel': {
    name: 'twitch-channel',
    regex: /https?:\/\/www\.twitch\.tv\/([^\/\?\&]*)\/?$/,
    embedUrl: 'https://player.twitch.tv/?channel=<%= remote_id %>',
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600,
  },
  'twitch-video': {
    name: 'twitch-video',
    regex: /https?:\/\/www\.twitch\.tv\/(?:[^\/\?\&]*\/v|videos)\/([0-9]*)/,
    embedUrl: 'https://player.twitch.tv/?video=v<%= remote_id %>',
    html: '<iframe frameborder="0" allowfullscreen="true" scrolling="no" height="366" style="width:100%;"></iframe>',
    height: 366,
    width: 600,
  },
  'yandex-music-album': {
    name: 'yandex-music-album',
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/?$/,
    embedUrl: 'https://music.yandex.ru/iframe/#album/<%= remote_id %>/',
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" style="width:100%;" height="400"></iframe>',
    height: 400,
    width: 540,
  },
  'yandex-music-track': {
    name: 'yandex-music-track',
    regex: /https?:\/\/music\.yandex\.ru\/album\/([0-9]*)\/track\/([0-9]*)/,
    embedUrl: 'https://music.yandex.ru/iframe/#track/<%= remote_id %>/',
    html: '<iframe frameborder="0" style="border:none;width:540px;height:100px;" style="width:100%;" height="100"></iframe>',
    height: 100,
    width: 540,
    id: (ids) => ids.join('/'),
  },
  'yandex-music-playlist': {
    name: 'yandex-music-playlist',
    regex: /https?:\/\/music\.yandex\.ru\/users\/([^\/\?\&]*)\/playlists\/([0-9]*)/,
    embedUrl: 'https://music.yandex.ru/iframe/#playlist/<%= remote_id %>/show/cover/description/',
    html: '<iframe frameborder="0" style="border:none;width:540px;height:400px;" width="540" height="400"></iframe>',
    height: 400,
    width: 540,
    id: (ids) => ids.join('/'),
  },
  codepen: {
    name: 'codepen',
    regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
    embedUrl:
      'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
    html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
    height: 300,
    width: 600,
    id: (ids) => ids.join('/embed/'),
  },
  instagram: {
    name: 'instagram',
    regex: /https?:\/\/www\.instagram\.com\/p\/([^\/\?\&]+)\/?.*/,
    embedUrl: 'https://www.instagram.com/p/<%= remote_id %>/embed',
    html: '<iframe width="400" height="505" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 505,
    width: 400,
  },
  twitter: {
    name: 'twitter',
    regex: /^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+?.*)?$/,
    embedUrl: 'https://twitframe.com/show?url=https://twitter.com/<%= remote_id %>',
    html: '<iframe width="600" height="600" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600,
    id: (ids) => ids.join('/status/'),
  },
  pinterest: {
    name: 'pinterest',
    regex: /https?:\/\/([^\/\?\&]*).pinterest.com\/pin\/([^\/\?\&]*)\/?$/,
    embedUrl: 'https://assets.pinterest.com/ext/embed.html?id=<%= remote_id %>',
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 400px; max-height: 1000px;'></iframe>",
    id: (ids) => {
      return ids[1]
    },
  },
  facebook: {
    name: 'facebook',
    regex: /https?:\/\/www.facebook.com\/([^\/\?\&]*)\/(.*)/,
    embedUrl:
      'https://www.facebook.com/plugins/post.php?href=https://www.facebook.com/<%= remote_id %>&width=500',
    html: "<iframe scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%; min-height: 500px; max-height: 1000px;'></iframe>",
    id: (ids) => {
      return ids.join('/')
    },
  },
  aparat: {
    name: 'aparat',
    regex: /(?:http[s]?:\/\/)?(?:www.)?aparat\.com\/v\/([^\/\?\&]+)\/?/,
    embedUrl: 'https://www.aparat.com/video/video/embed/videohash/<%= remote_id %>/vt/frame',
    html: '<iframe width="600" height="300" style="margin: 0 auto;" frameborder="0" scrolling="no" allowtransparency="true"></iframe>',
    height: 300,
    width: 600,
  },
  miro: {
    name: 'miro',
    regex: /https:\/\/miro.com\/\S+(\S{12})\/(\S+)?/,
    embedUrl: 'https://miro.com/app/live-embed/<%= remote_id %>',
    html: '<iframe width="700" height="500" style="margin: 0 auto;" allowFullScreen frameBorder="0" scrolling="no"></iframe>',
  },
  github: {
    name: 'github',
    regex: /https?:\/\/gist.github.com\/([^\/\?\&]*)\/([^\/\?\&]*)/,
    embedUrl:
      'data:text/html;charset=utf-8,<head><base target="_blank" /></head><body><script src="https://gist.github.com/<%= remote_id %>" ></script></body>',
    html: '<iframe width="100%" height="350" frameborder="0" style="margin: 0 auto;"></iframe>',
    height: 300,
    width: 600,
    id: (ids) => `${ids.join('/')}.js`,
  },
}
