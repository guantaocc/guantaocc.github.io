---
title:  Vue3封装 xgplayer播放器
date: 2021-08-20
categories:
  - Vue组件
tags: 
  - Vue3
  - 组件
  - 组件库封装
---

### xgplayer(西瓜播放器)
xg-video-player.vue

```vue
<template>
  <div id="player" ref="playerRef"></div>
</template>

<script>
import { ref, onMounted, reactive, computed, onBeforeUnmount } from 'vue'

// 播放/暂停、全屏、进度条、封面图、播放时间、重播
import Player from 'xgplayer/dist/simple_player';
import volume from 'xgplayer/dist/controls/volume';
import playbackRate from 'xgplayer/dist/controls/playbackRate';
import makeBullet from 'xgplayer/dist/controls/danmu'
import screenShot from 'xgplayer/dist/controls/screenShot'
import Keyboard from 'xgplayer/dist/controls/keyboard'

import HlsJsPlayer from "xgplayer-hls.js";
import FlvPlayer from "xgplayer-flv";

import playerEvents from './player-event'

export default {
  name: 'xg-video-player',
  props: {
    url: {
      type: String,
      default: '',
      required: true
    }
  },
  emits: [...playerEvents],
  setup(props, { attrs, emit }) {
    const player = ref(null)
    const playerRef = ref(null)

    // 根据后缀判断 type
    const videoType = computed(() => {
      const url = props.url
      return url.substring(url.lastIndexOf(".") + 1)
    })

    // 弹幕选项配置
    const danmu = reactive({
      panel: true,
      comments: [  //弹幕数组
        {
          duration: 5000, //弹幕持续显示时间,毫秒(最低为5000毫秒)
          id: '1', //弹幕id，需唯一
          start: 1000, //弹幕出现时间，毫秒
          prior: true, //该条弹幕优先显示，默认false
          color: true, //该条弹幕为彩色弹幕，默认false
          txt: '长弹幕', //弹幕文字内容
          style: {  //弹幕自定义样式
            color: '#fff',
            fontSize: '20px',
            border: 'solid 1px #ff9500',
            borderRadius: '20px',
            padding: '2px 4px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          },
          mode: 'top'
        }
      ],
      area: {  //弹幕显示区域
        start: 0, //区域顶部到播放器顶部所占播放器高度的比例
        end: 1 //区域底部到播放器顶部所占播放器高度的比例
      },
      closeDefaultBtn: true, //开启此项后不使用默认提供的弹幕开关，默认使用西瓜播放器提供的开关
      defaultOff: false //开启此项后弹幕不会初始化，默认初始化弹幕
    })

    // 外挂字幕
    const textTrackOptions = reactive({

    })

    // 进度点的特殊标记
    const progressDot = ref([
      {
        time: 10, //展示标记的时间
        text: '标记文字', //鼠标hover在标记时展示的文字
        duration: 8, //标记段长度（以时长计算）
        style: { //标记样式
          background: 'blue'
        }
      }, {
        time: 22,
        text: '标记文字'
      }, {
        time: 56,
        duration: 8,
      }, {
        time: 76,
      }
    ])


    const videoOptions = reactive({
      el: null,
      url: props.url,
      playsinline: true,
      autoplay: false,
      width: 600,
      height: 337.5,
      // 设置播放器是否根据外部宽度适配
      fluid: true,
      // 'fixWidth' | 'fixHeight' | 'auto' 设置视频根据容器宽度或高度变化
      fitVideoSize: 'fixHeight',
      // 默认音量
      volume: 0.6,
      // 是否自动播放
      autoplay: false,
      // 循环播放
      loop: false,
      // 视频封面
      poster: 'https://i.ytimg.com/vi/lK2ZbbQSHww/hqdefault.jpg',
      // 视频首帧
      videoInit: true,
      lastPlayTime: 20, //视频起播时间（单位：秒）
      lastPlayTimeHideDelay: 5, //提示文字展示时长（单位：秒）
      playbackRate: [0.5, 0.75, 1, 1.5, 2],
      defaultPlaybackRate: 1.5,
      // 旋转
      rotate: false,
      download: true,
      // 弹幕
      danmu: danmu,
      // 支持画中画模式
      pip: true,
      // 如果在移动端需要横屏全屏显示
      // rotateFullscreen: true,

      // 小窗模式：实际上是改变 position:fixed;布局模式
      miniplayer: true,
      miniplayerConfig: {
        bottom: 200,
        right: 0,
        width: 320,
        height: 180
      },

      // 截屏
      screenShot: {
        saveImg: true,
        quality: 0.92,
        type: 'image/png',
        format: '.png'
      },

      // 进度条标记
      progressDot: progressDot.value,

      // 自定义错误标记
      errorTips: `请<span>刷新</span>试试`,

      // 键盘快捷键
      keyShortcut: 'on',
      keyShortcutStep: { //设置调整步长
        currentTime: 15, //播放进度调整步长，默认10秒
        volume: 0.2 //音量调整步长，默认0.1
      },

      // 引入插件
      controlPlugins: [
        volume,
        playbackRate,
        makeBullet,
        screenShot,
        Keyboard
      ],


      allowPlayAfterEnded: true,
      allowSeekAfterEnded: true,
      "x5-video-player-type": "h5-page",
      "x5-video-player-fullscreen": false,
    })

    // 初始化事件
    const initEventListener = () => {
      if (player) {
        playerEvents.forEach(playEvent => {
          player.value.on(playEvent, () => {
            emit(playEvent, player)
          })
          // 注册 ready事件
          player.value.once('ready', () => {
            emit('ready', player)
          })
          // 视频全部下载完成事件
          player.value.once('complete', () => {
            emit('complete', player)
          })
        })
      }
    }

    const initPlayer = (options) => {
      console.log('options', options)
      switch (videoType.value.toLowerCase()) {
        case "mp4":
          player.value = new Player(options);
          break;
        case "m3u8":
          player.value = new HlsJsPlayer(options);
          break;
        case "flv":
          player.value = new FlvPlayer(options);
          break;
        default:
          console.log("不支持该视频格式");
          break;
      }

      // 注册播放器事件
      initEventListener()
    }

    onMounted(() => {
      // 一定要在 Mounted中初始化, xgplayer依赖 占位 DOM元素
      // initPlayer()
      videoOptions.el = playerRef.value
      initPlayer(videoOptions)
    })

    onBeforeUnmount(() => {
      // 一定要对 player进行销毁
      if (player.value && typeof player.value.destory === 'function') {
        player.value.destory()
      }
    })
    return {
      playerRef,
      player,
      videoType,
      videoOptions
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
```

index.vue
```vue
<template>
  <div class="player-container" :style="containerStyle">
    <!-- 进行其他功能的增强, 广告行为等 -->
    <div class="xg-ad" v-if="showAd">
      <slot name="ad">
        <xg-ad></xg-ad>
      </slot>
    </div>

    <!-- 将配置属性传递到子组件 -->
    <xg-video-player v-bind="$attrs" ref="videoPlayer"></xg-video-player>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import XgVideoPlayer from './xg-video-player.vue'
import XgAd from './xg-ad.vue'

export default {
  // 主要进行 插件的增强
  name: 'xg-player',
  props: {
    config: {
      type: Object,
      default: () => { }
    },
    showAd: {
      type: Boolean,
      default: false
    },
    width: {
      type: Number,
      default: 500
    }
  },
  components: {
    XgVideoPlayer,
    XgAd
  },
  setup(props) {
    // 播放器实例，便于外部调用
    const videoPlayer = ref(null)

    const containerStyle = computed(() => {
      const width = typeof props.width === 'string' ? props.width : props.width + 'px'
      return {
        width: width
      }
    })
    return {
      url: props.url,
      containerStyle,
      videoPlayer,
      showAd: props.showAd
    }
  }
}
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
}
.xg-ad {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  z-index: 110;
}
</style>
```

player-events.js

```js
const playerEvents = [
  'ready',
  'complete',
  'play',
  'playing',
  'pause',
  'ended',
  'error',
  'seeking',
  'seeked',
  'timeupdate',
  'waiting',
  'canplay',
  'canplaythrough',
  'durationchange',
  'volumechange',
  'bufferedChange',
  'definitionChange',
  'playbackrateChange',
  'screenShot',
  'requestFullscreen',
  'exitCssFullscreen',
  'controlShow',
  'controlHide'
]

export default playerEvents
```

xg-ad.vue

```vue
<template>
  <div class="default-ad">
    <span class="ad-text" :style="defaultAdStyle">这是 xxxx 广告的形式</span>
  </div>
</template>

<script>
import { computed, reactive } from 'vue'
export default {
  name: 'xg-ad',
  props: {
    adConfig: {
      type: Object,
      default: () => { }
    }
  },
  emits: ['ad-close'],
  setup() {
    const defaultAdStyle = computed(() => {
      return {
        fontSize: '18px',
        color: '#fff'
      }
    })
    return {
      defaultAdStyle
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
```

## 使用
App.vue

```vue
<template>
<xg-player ref="player" @canplay="videoCanplay" url="https://sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-720p.mp4" showAd>

</xg-player>
</template>

<script>
import XgPlayer from './components/xg-player/index.vue'

export default {
 components: {
  XgPlayer
 },
 setup() {
    const player = ref(null)
    const videoCanplay = (player) => {
      console.log('video ready', player)
      // player.value.play()
    }
    onMounted(() => {
      console.log("父级player", player.value)
    })
    return {
      player,
      videoCanplay
    }
  }
}
</script>

```