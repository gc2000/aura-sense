# PRD: Aura Personalized Visual Assistant Mobile App (PWA) and Multi-Agent System

## 1. Product overview

Aura is a mobile visual assistant (Progressive Web Application) for blind and severely visually impaired users. Through voice, camera, AI visual understanding, and personalized memory, it helps users identify objects, read tags, understand their environment, locate personal items, and engage in natural conversations with AI in non-emergency scenarios. Leverage Gemini Live API multi-modal capability.

Aura is not positioned as a real-time obstacle avoidance or hazard navigation tool. Due to potential delays in cloud-based video understanding, the system must use conservative language and remind users to stop and use a white cane or other reliable auxiliary tools to confirm when encountering high-risk scenarios such as steps, vehicles, or road crossings.

## 2. Product objective

- Provides a voice-interactive visual support assistant for blind users.
- Supports real-time two-way voice, video, and text interaction via the Gemini Live API.
- Utilizes the Google ADK to build a multi-agent architecture of Manager Agent + Specialized Subagents.
- Records user's personal items, preferences, and context information through Personal Memory.
- Allows users to add, query, update, and delete memories via voice.
- Supports dedicated subagents for different scenarios, such as finding items, hospital assistance, and travel support.
- Enhances the accessibility experience through voice, on-screen text, and vibration feedback.
- Persistently saves conversation history for easy user review.

## 3. 目标用户

### 3.1 主要用户

- 盲人用户。
- 重度视障用户。
- 需要语音和 AI 视觉辅助完成日常任务的人。

### 3.2 辅助用户

- 家人。
- 护理者。
- 志愿者。
- 可帮助用户配置记忆、Agent 或场景信息的人。

## 4. 技术栈

- Frontend: React, Tailwind CSS, PWA
- Backend: TypeScript/Node.js
- Multimodal AI: Google Gemini Live API / Multimodal Live API
- Agent Framework: Google Agent Development Kit, ADK
- 支持 WebSocket 以支持实时互动
- Deployment: Google Agent Platform (prefer in Singapore region)
- Configuration: `.env` / environment variables
- Security: 禁止硬编码 API key、password、credential
- Use type hints for all Python code.
- Comments generated should be in english
- Implement robust error handling for API calls.
- 自动生成lint和unit test用例，每次完成一个功能，都必须进行测试。
- Code and comments should be in English
- Authentication：Firebase Authentication,使用 Google Sign-in, 或用户名、密码

## 4.1 UIUX
- Mobile-first design
- Mobile Vertical layout (9:16)
- Futuristic, minimalist design mobile ui with dark mood, "breathing" concept
- UI language in English


## 5. 架构概念

Aura 使用multi-agent架构。

### 5.1 Manager Agent: Aura

Aura 是主 Agent，也是 Orchestrator / Manager Agent。

职责：

- 作为通用视觉助手，与用户进行语音和视觉对话。
- 接收用户的高层请求。
- 判断用户意图和场景。
- 将任务拆分为逻辑子任务。
- 选择并调用合适的 Subagent。
- 整合 Subagent 的结果并返回给用户。
- 使用 Personal Memory 提供个性化回答。
- 在不确定或高风险场景中使用保守、安全的表达。

Aura is the general purpose visual assistant agent and also the Orchestrator/Manager agent.
Responsibilities:
- Act as a general visual assistant, engaging in voice and visual conversations with users.
- Receive high-level requests from users.
- Determine user intent and context.
- Break down tasks into logical sub-tasks.
- Select and invoke the appropriate Subagent.
- Integrate the results from the Subagents and return them to the user.
- Provide personalized responses using Personal Memory.
- Use conservative and safe expressions in uncertain or high-risk scenarios.

示例：

用户说：

```text
帮我找钥匙。
```

Aura 判断这是 Find Item 场景，调用 Find Items Subagent，并把相关 Personal Memory 输入给该 Subagent，例如：

- 钥匙常放位置。
- 钥匙上次看见位置。
- 用户家中区域信息。
- 用户偏好的回答语言。

### 5.2 Specialized Subagents: Worker Agents

Subagents 是针对特定场景的专用 Agent。

示例 Subagents：

- Find Items Agent: 寻找常用物品。
- Medication Agent: 药品识别与药盒辅助。
- Shopping Agent: 商品、标签、价格、过敏原识别。
- Hospital Support Agent: 医院环境、科室、指示牌辅助。
- Mobility / Transportation Agent: 公共交通、站牌、车号、入口方向辅助。
- Home Assistant Agent: 家庭物品、家电按钮、室内环境辅助。

Subagent 职责：

- 根据特定 System Instruction 提供场景化支持。
- 使用与该场景相关的 Personal Memory。
- 支持语音和视觉交互。
- 返回结构化结果给 Aura。
- 允许用户创建和配置自定义 Subagent。

## 6. Agent 配置能力

系统允许在 Manager Agent 和 Subagent 级别配置以下内容：

- Name
- Description / Specialization
- System Instruction
- Personal Memory
- Visual Focus Detective
- Voice Model
- Voice Tone & Phrase Style

Voice Model 示例：

- Zephyr
- Kore
- Puck
- Charon
- Fenrir

Voice Tone & Phrase Style 示例：

- 简短直接。
- 温和安抚。
- 详细解释。
- 高安全提醒优先。
- 中英双语。
- 只中文。
- 只英文。

## 7. General Configuration

用户可配置：

- Location: 国家、城市。
- Preferred Language: 用户首选语言。
- Display Conversation on Screen: 是否在屏幕显示对话内容。
- Voice Output: 是否开启语音播报。
- Vibration Feedback: 是否开启震动反馈。
- Internet Search Permission: 是否允许 Agent 搜索互联网。

## 8. Gemini Live API 使用方式

Aura 应使用 Gemini Live API / Multimodal Live API 支持：

- 实时双向语音交互。
- 视频帧输入。
- 文本输入与输出。
- 多轮对话。
- 语音状态反馈。
- 与 Manager Agent / Subagent 的任务流集成。

系统需要明确区分：

- 实时 Live 对话。
- 自动采样视频帧分析。
- 历史 Personal Memory 查询。

## 9. 视频上传控制
上传视频帧采样率： 1 FPS  


## 10. Personal Memory
Personal Memory 是 Aura 的核心个性化能力，可服务于 Manager Agent 和 Subagent。

### 10.1 功能

用户可以：

- 新增 Memory。
- 查询 Memory。
- 更新 Memory。
- 删除 Memory。
- 将 Memory 分配给 Manager Agent 或指定 Subagent。
- 通过语音添加 Memory。
- 在 Agent 推理时把相关 Memory 作为输入。

### 10.2 示例

Personal Memory数据结构：

```text
Type: Item location
Description: 常见物品存放
Key: 钥匙
Value: 门口的篮子里

Key: 手机
Value: 门口的篮子里

Key: 白杖
Value: 门口

Key: 钱包
Value: 门口的篮子里
```

用户可说：

```text
记住，钥匙放在门口的篮子里。
```

系统保存后回答：

```json
{
  "zh": "好的，我记住了。钥匙通常放在门口的篮子里。",
  "en": "Got it. I will remember that your keys are usually kept in the basket near the entrance."
}
```

### 10.3 Memory 类型

建议支持下列类型,允许用户继续CURD：

- Item Location Memory: 常用物品位置。
- Last Seen Memory: 上次看见的位置。
- Household Label Memory: 家庭物品标签。
- Medication Memory: 药物信息。
- User Preference Memory: 语言、语速、回答风格。
- Place Memory: 家中区域、常去地点。
- Safety Note Memory: 用户自定义注意事项。


## 11. 常用物品位置记忆

用户可以说：

```text
记住，我的钥匙通常放在门口的蓝色托盘。
```

之后用户问：

```text
我的钥匙在哪？
```

App 回答：

```json
{
  "zh": "你记录的钥匙常放位置是门口的蓝色托盘。上次确认是在今天早上。",
  "en": "Your saved usual location for the keys is the blue tray near the entrance. It was last confirmed this morning."
}
```

适合：

- 钥匙。
- 钱包。
- 手机。
- 白杖。
- 耳机。
- 药盒。
- 遥控器。
- 充电器。

## 12. “上次看见”记录

当用户使用摄像头识别物品时，App 可以询问：

```text
要不要记录这个位置？
```

示例：

```json
{
  "zh": "我看到钱包可能在床头柜右侧。是否保存为上次看见的位置？",
  "en": "I can see what looks like your wallet on the right side of the bedside table. Would you like me to save this as its last-seen location?"
}
```

该记录必须包含：

- itemName
- locationDescription
- timestamp
- confidence
- source
- userConfirmed

## 13. 家庭物品标签库

用户可以教 App：

```text
这是我的降压药。
这是我的维生素。
这是洗衣液，不是饮料。
```

未来识别时，App 不应只说：

```text
这是一个瓶子。
```

而应说：

```json
{
  "zh": "这看起来像你之前登记的洗衣液，但请再次确认。",
  "en": "This looks like the laundry detergent you previously registered, but please confirm it again."
}
```

## 14. 联网搜索

Agent 可在用户允许的情况下搜索互联网。

适合场景：

- 查询公共交通信息。
- 查询医院或商场开放时间。
- 查询地点信息。
- 查询产品公开信息。
- 查询无障碍相关公开信息。

限制：

- 联网搜索结果必须标明不确定性。
- 不得把网络信息当作本地实时视觉事实。
- 医疗、法律、金融等高风险信息必须谨慎表达。
- 用户可关闭联网搜索权限。

## 15. 对话历史

系统必须持久化保存所有对话，允许用户查看历史记录。

需要保存：

- conversationId
- userId
- agentId
- subagentId
- user input
- agent response
- modality: voice, text, image, video frame
- timestamp
- related memory
- error state
- connection status events

用户可：

- 查看历史对话。
- 搜索历史对话。
- 删除历史对话。
- 清除全部历史。
- 查看某次对话使用了哪些 Memory。

## 16. 连接状态与自动重连

系统需要通过语音告知连接状态。

示例：

- “正在连接。”
- “已连接。”
- “连接中断，我正在尝试重新连接。”
- “重新连接成功。”
- “暂时无法连接云端服务，请稍后再试。”

Auto Retry 要求：

- 云端连接断开时自动重试。
- 重试期间语音提醒用户。
- 避免频繁重复播报造成干扰。
- 多次失败后提供清晰状态。
- 允许用户手动重新连接。

## 17. 震动反馈

在适合场景下，App 可提供不同震动模式配合语音反馈。

示例：

- 短震动：按钮确认。
- 双短震动：识别完成。
- 长震动：连接失败或需要用户注意。
- 连续轻震：正在处理。
- 强提醒震动：潜在风险或用户需要停下确认。

震动不能替代语音说明，只作为辅助反馈。

## 18. 安全与表达原则

系统不得把历史记录说成实时事实。

错误表达：

```text
钥匙就在门口托盘。
```

正确表达：

```text
你记录的钥匙常放位置是门口的蓝色托盘。上次确认是在今天早上。
```

如果记录过旧：

```text
这个位置已经超过七天没有确认。需要我帮你扫描附近吗？
```

如果不确定：

```text
我不确定。请先停下，我可以帮你再次扫描附近。
```

高风险场景必须提醒：

```text
我不能实时判断危险。请先停下，并使用白杖或其他可靠方式确认。
```

## 19. 数据模型建议

### 19.1 PersonalMemory

- id
- userId
- name
- description
- memoryType
- key
- value
- assignedAgentIds
- createdAt
- updatedAt
- lastUsedAt

### 19.2 AgentConfig

- id
- userId
- agentType
- name
- description
- systemInstruction
- personalMemoryIds
- visualFocusDetective
- voiceModel
- voiceTone
- phraseStyle
- enabledTools
- createdAt
- updatedAt

### 19.3 Conversation

- id
- userId
- agentId
- subagentId
- title
- messages
- createdAt
- updatedAt

### 19.4 ConversationMessage

- id
- conversationId
- role
- content
- language
- modality
- relatedMemoryIds
- timestamp

### 19.5 ConnectionEvent

- id
- conversationId
- status
- message
- timestamp

### 19.6 VideoUploadConfig

- id
- userId
- mode
- samplingRate
- createdAt
- updatedAt

## 19.7 General Configuration
- Timezone
- Country
- City
- Home


## 20. MVP 范围

第一版包含：

- PWA 基础应用。
- Gemini Live API 语音/视觉/文本交互。
- Aura Manager Agent。
- 至少一个 Find Items Subagent。
- Personal Memory CRUD。
- 语音添加 Memory。
- 常用物品位置记忆。
- 上次看见记录。
- 家庭物品标签库基础能力。
- 视频上传模式配置。
- 连接状态语音提示。
- 自动重连。
- 对话历史持久化。
- 基础震动反馈。
- `.env` 环境变量配置。
- 基础无障碍支持。

## 21. 暂不包含

MVP 暂不做：

- 实时避障。
- 自动过马路提醒。
- 医疗诊断。
- 药物服用决策。
- 人脸身份识别。
- 无用户授权的持续监控。
- 未确认的危险行动建议。

## 22. 成功指标

- 用户可以通过语音记录和查询常用物品位置。
- Aura 能正确调用 Find Items Subagent。
- Personal Memory 能作为 Agent 输入参与回答。
- App 不会把历史记忆误说成实时事实。
- 用户可配置视频上传模式。
- 连接状态可通过语音告知。
- 云端断线后可自动重试。
- 对话历史可查看。
- 所有敏感配置通过环境变量读取。
- 用户能关闭屏幕文字显示，仅通过语音使用核心流程。

## 23. 示例流程

用户：

```text
记住，钥匙放在门口的篮子里。
```

Aura：

```json
{
  "zh": "好的，我记住了。钥匙通常放在门口的篮子里。",
  "en": "Got it. I will remember that your keys are usually kept in the basket near the entrance."
}
```

用户：

```text
我的钥匙在哪？
```

Aura 判断为找物品场景，调用 Find Items Subagent，并传入 Personal Memory。

Find Items Subagent 返回：

```json
{
  "zh": "你记录的钥匙常放位置是门口的篮子里。需要我帮你扫描附近吗？",
  "en": "Your saved usual location for the keys is the basket near the entrance. Would you like me to scan nearby?"
}
```

用户点击拍照。

Aura 上传当前画面，并调用 Gemini Live API / visual analysis。

Aura：

```json
{
  "zh": "我看到门口附近有一个篮子，但不能确定钥匙是否在里面。请靠近一点或换个角度拍摄。",
  "en": "I can see a basket near the entrance, but I cannot confirm whether the keys are inside. Please move closer or try another angle."
}
```
