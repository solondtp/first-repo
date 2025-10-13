# Hikvision K44H iOS 智能控制 App 开发方案

## 1. 项目概述
- **目标设备**：海康威视 K44H 系列网络摄像头。
- **目标平台**：iOS 16+，要求支持 Apple Silicon Mac 模拟器与真机部署。
- **主要功能**：
  1. 本地语音识别（Apple Speech Framework 离线语音包）。
  2. 后端语义解释（通过自建服务安全访问通义千问 Qwen）。
  3. 视频预览（RTSP 流播放，优先 VLCKit，WebRTC 作为备选方案）。
  4. 双向语音对讲（手机端与摄像头麦克风/扬声器互通）。
  5. PTZ、变倍、对焦及预置位控制（ISAPI / ONVIF）。
  6. 人形检测与自动跟踪（端侧 OpenCV/YOLO 推理或摄像头事件订阅）。

## 2. 技术架构
```
+-----------------+       HTTPS/TLS        +--------------------------+
|  iOS 客户端      | <--------------------> |  应用服务（Node.js/Go）   |
|-----------------|                        |--------------------------|
| SwiftUI UI 层   |                        |  Qwen 代理接口           |
| AVFoundation    |                        |  WebSocket/REST          |
| VLCKit/WebRTC   |                        |  身份认证服务            |
| Network/URLSess |                        +--------------------------+
| CoreML/OpenCV   |
+--------+--------+
         | RTSP / RTP / ISAPI / ONVIF
         v
+-----------------+
|  Hikvision K44H |
+-----------------+
```

- **本地处理**：视频解码、语音录制、语音识别、部分人形检测。
- **后端处理**：语义解释（调用 Qwen）、用户认证、日志、远程配置。
- **通信协议**：
  - 设备控制：ONVIF（SOAP over HTTP/S）或海康 ISAPI（RESTful）。
  - 视频流：RTSP/RTP（H.264/H.265）。
  - 对讲：海康 SDK 双向音频通道，或 RTP over RTSP。

## 3. 模块设计

### 3.1 语音交互模块
- 使用 `SFSpeechRecognizer` + 离线语音模型，提前下载所需语言包。
- 建立语音指令解析器，将识别文本发送至后端语义解释服务。
- 后端调用通义千问 Qwen，返回结构化指令（意图、参数）。
- 客户端根据指令执行操作：PTZ、预览、告警查询等。
- 对讲：使用 `AVAudioEngine` 采集麦克风音频，编码为 AAC/G711，通过摄像头对讲通道发送；从摄像头接收音频并播放。

### 3.2 视频预览模块
- 首选 VLCKit：直接接入 RTSP URL（含认证）。
  - 优点：快速集成、多协议支持、软硬解码切换。
  - 工作流：
    1. 通过 ONVIF 获取媒体配置与流地址。
    2. 使用 VLCKit `VLCMediaPlayer` 播放。
    3. 提供截图、录像、音量控制等功能。
- 若需低延迟/云端部署，则引入 WebRTC：
  - 使用摄像头网关（NVR/媒体服务器）转推 RTSP → WebRTC。
  - iOS 端集成 `WebRTC.framework` 进行播放。

### 3.3 PTZ 与摄像头控制
- **ISAPI**：
  - 认证：Digest 或 Token（推荐后端代理）。
  - API：`/ISAPI/PTZCtrl/channels/1/continuous` 等控制接口。
  - 变倍/对焦：`/ISAPI/Custom/Focus` 等专用接口。
  - 预置位：创建、调用、删除接口。
- **ONVIF**：
  - 使用 `ONVIF PTZ` 服务 SOAP 消息（Swift 侧封装或后端代理转换为 REST）。
- 客户端实现：
  - 统一指令模型（如 `enum CameraCommand { case pan, tilt, zoom, preset(id) }`）。
  - 长按/拖动 UI → 连续控制；轻点 → 触发预置位。
  - 状态反馈：轮询或事件订阅获取当前 PTZ 状态。

### 3.4 人形检测与自动跟踪
- **端上检测**：
  - 基于 Core ML 的 YOLOv5/YOLOv8 转换模型。
  - 视频帧抽样（如每秒 5 帧），送入模型推理。
  - 检测到目标后，调用 PTZ 调整镜头对准。
- **摄像头事件**：
  - 订阅海康智能事件接口（ISAPI `/Event/triggers`）。
  - 处理人形/越界告警，实现自动跟踪指令。
- 自动跟踪策略：
  - 目标位置映射到 PTZ 控制矢量。
  - 若无目标，回归预设巡航位。

## 4. 安全与隐私
- 所有与后端通信使用 HTTPS/TLS，启用双向证书可选。
- 存储敏感凭据（摄像头账号、token）使用 iOS Keychain。
- 语音数据默认本地处理，后端仅接受识别文本。
- 后端调用 Qwen 时进行内容过滤与操作权限校验。
- 日志与审计：重要操作发送到后端保存，符合监管要求。

## 5. 开发计划
| 阶段 | 周期 | 里程碑 |
|------|------|--------|
| 需求与方案确认 | 1 周 | 确认设备接口、语音指令列表、UI 原型 |
| 原型开发 | 3 周 | 完成 RTSP 播放、基础 PTZ 控制、语音识别流程 |
| 功能完善 | 4 周 | 完成对讲、预置位管理、人形检测、Qwen 集成 |
| 测试与优化 | 3 周 | 真机兼容、延迟优化、安全加固 |
| 上线与交付 | 1 周 | App Store/企业分发、部署后端服务 |

## 6. 关键依赖
- **Apple Speech Framework**：离线语音包（通过 `SFSpeechRecognizer.requestAuthorization`、`AVAudioSession`）。
- **VLCKit**：CocoaPods/SPM 集成，需处理 bitcode/签名。
- **Hikvision ISAPI/SDK**：官方 iOS SDK、ISAPI 文档。
- **OpenCV / Core ML Tools**：模型转换、图像处理。
- **后端服务**：
  - 身份认证：JWT/OAuth2。
  - Qwen 代理：限制速率、审计、缓存。
  - 设备接入：与摄像头通讯的安全代理（避免直接暴露）。

## 7. 风险与对策
- **RTSP 播放延迟**：优化缓冲、选择硬解码、调整 `network-caching` 参数。
- **语音识别准确度**：设计指令关键词、增加确认对话、提供手动控制备用。
- **对讲回声/噪声**：AEC/ANS 处理，限制同时播放与采集。
- **人形检测性能**：采用轻量模型，或通过摄像头内置事件减负。
- **安全风险**：强制 HTTPS、IP 白名单、操作日志审计。

## 8. 后续扩展
- 多摄像头管理、云端录像回放、告警推送。
- 与 HomeKit/Shortcut 集成，实现联动自动化。
- 支持语音唤醒词与离线指令缓存。
- 增加 AI 分析（如行为识别、车辆检测）。

