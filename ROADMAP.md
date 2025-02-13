# WebAudio Simple Synth Roadmap

## Phase 1: 基础音频引擎 - Core Audio Engine

- [ ] 实现基础的 AudioContext 管理

  - 创建和管理 WebAudio Context
  - 实现主音量控制
  - 添加基础的音频路由系统

- [ ] FM 合成器核心
  - 实现载波（Carrier）和调制器（Modulator）
  - 基础的 FM 合成算法
  - 包络发生器（ADSR Envelope）

## Phase 2: FM 参数控制 - FM Parameters

- [ ] 主要 FM 参数

  - 载波频率（Carrier Frequency）
  - 调制指数（Modulation Index）
  - 调制比率（FM Ratio）
  - 音高控制（Fine Tune）

- [ ] 包络控制
  - 音量包络（Volume Envelope）
  - 调制包络（Modulation Envelope）
  - Attack, Decay, Sustain, Release 控制

## Phase 3: UI 开发 - User Interface

- [ ] 基础布局

  - 合成器主界面设计
  - 参数旋钮和滑块
  - 预设管理界面

- [ ] 交互控制
  - MIDI 键盘输入支持
  - 虚拟键盘界面
  - 实时参数调节

## Phase 4: 预设和效果器 - Presets & Effects

- [ ] 预设系统

  - 预设保存和加载
  - 默认音色库
  - 预设分类管理

- [ ] 效果器
  - 混响（Reverb）
  - 延迟（Delay）
  - 均衡器（EQ）

## Phase 5: 高级功能 - Advanced Features

- [ ] 性能优化

  - 音频处理优化
  - UI 渲染优化
  - 内存管理

- [ ] 额外功能
  - MIDI CC 控制支持
  - 音频录制功能
  - 预设导入/导出

## 技术栈

### 核心技术

- Web Audio API
- TypeScript
- React
- Next.js

### UI 组件

- Styled Components / Tailwind CSS
- React-use-gesture（控制旋钮）

### 音频处理

- WebAudio Worklet
- WebMIDI API

## 文件结构

```typescript
// 项目源码结构
src/
├── audio/
│   ├── context/
│   │   └── AudioEngine.ts      // 音频引擎核心
│   ├── synth/
│   │   ├── FMSynth.ts         // FM合成器实现
│   │   ├── Envelope.ts        // ADSR包络
│   │   └── Voice.ts           // 声部管理
│   └── effects/
│       └── index.ts           // 效果器集合
├── components/
│   ├── synth/
│   │   ├── Knob.tsx          // 旋钮组件
│   │   ├── Slider.tsx        // 滑块组件
│   │   └── Keyboard.tsx      // 键盘组件
│   └── layout/
│       └── SynthLayout.tsx    // 布局组件
└── hooks/
    ├── useAudioEngine.ts     // 音频引擎Hook
    └── useMIDI.ts           // MIDI控制Hook
```

## 参考资源

1. [Apple EFM1 手册][efm1]：了解基本 FM 合成参数
2. [Web Audio API 文档][web-audio]
3. [FM 合成基础理论][fm-theory]
4. [现代 Web 音频开发指南][web-audio-guide]

[efm1]: https://support.apple.com/guide/logicpro/efm1-overview-lgsiefece1fd/mac
[web-audio]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
[fm-theory]: https://github.com/teropa/ext-js-web-audio
[web-audio-guide]: https://webaudioapi.com/
