# Elon Musk: Parallel Lives

## 马斯克传：平行人生

你现在要开发一款 GameX 项目的复杂系统型互动小说游戏：

# Elon Musk: Parallel Lives

# 《马斯克传：平行人生》

---

# 一、产品定义

这是一款：

> **以 Elon Musk 真实生平为历史骨架，由玩家选择、人物人格、人生状态、时代环境和随机命运共同驱动的系统型互动小说。**

它首先必须是一部：

> **有叙事张力、有代入感、让玩家想持续玩下去并反复重开的复杂互动小说。**

其次才是一套：

* 人物模拟
* Life Graph
* 概率系统
* RNG
* 平行世界
* 事业模拟
* 历史资料系统

不要把开发优先级搞反。

始终遵守：

> **前台像小说，后台像模拟器。**

---

# 二、游戏核心命题

整个游戏围绕一个问题展开：

> **如果 Elon Musk 在人生关键节点做出了不同选择，他还可能成为谁？**

游戏存在：

## Canon Timeline

真实历史世界线。

以及：

## Alternate Timelines

平行历史世界线。

玩家可以：

* 重走真实历史
* 在局部改变历史
* 大幅偏离历史
* 从 Canon 进入 Alternate
* 从 Alternate 再重新汇入类似 Canon 的路线
* 从一个 Alternate 横向跳到另一个 Alternate
* 形成现实中完全没有发生、但仍然令人信服的人生

但必须遵守：

> **玩家可以改变 Elon Musk 的命运，却不能毫无代价地改变 Elon Musk 是谁。**

游戏不是：

> 玩家借用马斯克身体体验任意人生。

而是：

> **玩家与 Elon Musk 本人的人格惯性共同塑造一条平行人生。**

---

# 三、最终体验目标

玩家主要体验应该始终是：

```text
进入人生场景
↓
理解当前困境
↓
感受到人物动机
↓
做出选择
↓
等待不确定结果
↓
看到人生发生变化
↓
进入下一段故事
```

玩家第一反应应该是：

> “接下来会发生什么？”

而不是：

> “我的 Technical 现在是多少？”

所有复杂系统都必须为：

* 人物
* 故事
* 决策
* 悬念
* 重玩价值

服务。

---

# 四、技术路线

V1 使用 Web-first 架构。

推荐：

* React
* TypeScript
* Vite
* Zustand
* React Router
* CSS Modules / Tailwind / 普通 CSS
* Motion 用于轻量动画
* Vitest
* IndexedDB 或 LocalStorage 保存本地存档

音频未来可使用：

* Web Audio
* Howler.js

视觉层：

V1 优先：

* DOM
* CSS
* SVG
* 2D / 2.5D

需要更复杂实时视觉时才考虑：

* PixiJS

SpaceX 等未来实时子玩法如果需求明显增加，再局部评估：

* PixiJS
* Phaser

不要因为“这是游戏”就一开始引入完整游戏引擎。

当前不需要：

* Unity
* Unreal
* Godot
* 大规模 Three.js

除非未来明确需要真正交互式 3D 世界。

---

# 五、核心设计原则

按照以下优先级开发：

1. 互动小说本身必须好玩
2. 叙事必须有现场感
3. 人物必须仍然像 Elon Musk
4. 玩家选择必须真正改变后续人生
5. 平行路线必须合理
6. 人格必须真正影响游戏
7. 随机性必须制造悬念而非荒谬
8. 内容必须高度可扩展
9. 新内容原则上不能要求修改核心引擎
10. 真实历史和平行历史必须使用同一套 Runtime
11. 系统复杂度必须隐藏在后台
12. 后续 SpaceX / Tesla / AI 等事业模块必须可渐进深化
13. 不要为了架构优雅牺牲游戏体验
14. 不要为了内容数量牺牲叙事质量

开发任何系统之前都问：

> **它会让互动小说更好玩吗？**

---

# 六、真实历史资料原则

Canon Timeline 不能仅凭模型记忆随意编造。

真实历史内容必须尽量依据可靠公开资料。

主要参考包括：

## Walter Isaacson《Elon Musk》

主要用于：

* 人生事件
* 决策背景
* 人物关系
* 公司冲突
* 人物细节
* 场景素材
* 时代氛围

但：

> 传记作者的解释不自动等于历史事实。

---

## Ashlee Vance 等可靠人物传记

主要用于：

* 早期经历
* Zip2
* X.com
* PayPal
* Tesla
* SpaceX
* 硅谷时期

并用于不同传记之间交叉验证。

---

## 官方一手资料

未来包括：

* SpaceX 官方资料
* Tesla 官方资料
* 公司公开文件
* 官方发布
* 试射记录
* 产品记录
* 企业历史资料

主要用于确认：

* 时间
* 公司事件
* 技术事件
* 产品
* 试射
* 组织变化

---

## 历史采访 / 演讲 / 第一人称材料

用于理解：

* 当时思维方式
* 第一性原理
* 风险判断
* 技术观点
* 长期目标
* 决策逻辑

尽量优先使用：

> 与事件发生时间较接近的一手资料。

---

# 七、禁止直接复制传记文本

可以参考：

* 事实
* 背景
* 事件结构
* 人物关系
* 冲突
* 场景信息

但不能：

> 直接复制 Walter Isaacson、Ashlee Vance 或其他传记的大段文字作为游戏叙事。

游戏 Narrative 必须重新创作。

目标是：

```text
史料
↓
事件建模
↓
游戏化重组
↓
原创叙事表达
```

而不是：

```text
传记
↓
拆章节
↓
变成游戏文本
```

---

# 八、历史内容三级边界

所有内容必须明确属于以下三种之一。

## CANON_FACT

核心事件拥有可靠历史资料支持。

例如：

* 某公司成立
* 某次公司出售
* 某次重大职业变化

---

## CANON_DRAMATIZED

历史事件真实存在。

但：

* 对话
* 内心独白
* 具体场景细节
* 部分戏剧化表现

属于合理艺术加工。

不要把这些戏剧化细节呈现为确定史实。

---

## ALTERNATE

现实历史没有发生。

属于平行历史推演。

必须符合：

* 人格
* 能力
* 价值观
* 当前经历
* 时代环境
* 技术条件

---

# 九、历史资料数据结构

建立：

```ts
type SourceRef = {
  title: string

  type:
    | 'biography'
    | 'interview'
    | 'official'
    | 'news'
    | 'book'
    | 'archive'

  author?: string
  year?: number
  note?: string
}
```

历史类型：

```ts
type NarrativeTruthType =
  | 'CANON_FACT'
  | 'CANON_DRAMATIZED'
  | 'ALTERNATE'
```

史实可信度：

```ts
type HistoricalConfidence =
  | 'high'
  | 'medium'
  | 'disputed'
  | 'alternate'
```

Canon Event 可拥有：

```ts
sourceRefs?: SourceRef[]
historicalConfidence?: HistoricalConfidence
truthType: NarrativeTruthType
```

这些信息主要用于：

* 内容开发
* 校验
* 历史档案
* Timeline

不要把大量参考资料直接展示在主叙事画面。

---

# 十、Canon Timeline 必须可持续增长

不要认为 Canon Timeline 在游戏发布时已经结束。

它必须允许：

```text
2026
↓
2027
↓
2028
↓
2030
↓
...
```

未来 Elon Musk 的现实人生继续发展时：

只需要新增：

> Canon Content Pack / Canon Events

而不需要修改核心 Runtime。

因此：

> **现实世界本身也是未来游戏内容来源。**

---

# 十一、互动小说优先原则

每一个重大事件都必须首先是一段：

> **有冲突的具体人生场景。**

应该尽量包含：

* 时间
* 地点
* 人物
* 当前处境
* 动机
* 冲突
* 不确定性
* 选择
* 结果
* 后续影响

错误形式：

```text
事件：Netscape 求职

A. 继续
B. 放弃
C. 创业
```

正确方向：

```text
Palo Alto · 1995

你已经第三次来到 Netscape。

招聘经理还是没有回复你的邮件。

大厅里不断有人走过。

你手里的简历已经被攥得有些发皱。

互联网正在以前所未有的速度增长。

而你开始怀疑：

等待别人给你一个位置，
也许本身就是错误。
```

然后才出现选择。

---

# 十二、Narrative Scene

建议：

```ts
type NarrativeScene = {
  location?: string
  year?: number
  timeOfDay?: string

  backgroundKey?: string

  characterKeys?: string[]

  propKeys?: string[]

  atmosphere?: string

  openingNarrative: string

  dialogue?: DialogueLine[]

  closingNarrative?: string
}
```

核心 Event 必须尽可能映射到：

> 一个具体人生时刻。

---

# 十三、动态叙事

核心剧情：

> 人工设计并固定主结构。

细节：

> 根据人生状态动态变化。

允许引用：

* previousFailure
* currentCompany
* currentCareer
* previousChoice
* wealthState
* relationshipState
* historicalTags
* reputation
* stress

例如玩家曾被 Netscape 拒绝：

几年后创业成功时可以出现：

> 几年前，你甚至没有得到这家公司的面试机会。

使历史真正进入叙事。

---

# 十四、人物自由不是无限自由

游戏必须存在：

# Musk Possibility Space

也就是：

> 当前条件下 Elon Musk 真正可能考虑的选择空间。

不要首先问：

> “玩家会想选什么？”

而要问：

> **“这个时期的 Elon 会想到什么？”**

例如：

年轻 Elon 合理的人生空间可以包括：

* 软件
* 游戏开发
* 学术
* 科技公司
* 创业
* 互联网
* AI
* 工程

以后：

* 航天
* 汽车
* 能源
* 机器人

无特殊背景时通常不应该自然产生：

* 职业歌手
* 餐馆老板
* 完全脱离科技
* 极端追求稳定的常规职业

除非此前人生已经发生巨大变化。

---

# 十五、人物人格引力

加入：

# Personality Gravity

玩家拥有自由意志。

但 Elon 本人拥有：

> 人格惯性。

例如玩家让 Elon 长期留在稳定软件公司。

允许。

但可能逐渐积累：

```text
AutonomyConflict
AmbitionPressure
UnresolvedProblemPressure
```

后续增加事件：

* 对管理层不满
* 内部创新冲突
* 自建团队
* 强行重构
* 离职
* 创业

不要硬编码：

> Elon 必须创业。

而应该让系统自然产生：

> 这种人格长期处于这种环境，很容易重新向高自主、高风险创造行为移动。

---

# 十六、人物模型三层结构

后台人物模型至少包括：

## Personality

人物如何思考。

## Values

人物为什么行动。

## State

人物现在处于什么状态。

---

# 十七、Personality

不要写死：

```ts
mbti = 'ENTP'
```

也不要写死：

```ts
mbti = 'INTJ'
```

MBTI 只是一个辅助建模框架。

当前人物模型可以暂时偏向：

> **xNTP 核心 + 明显 Ni / Te 能力**

推荐 V1 内部游戏参数：

```text
Ti   95
Ne   93

Ni   80
Te   78

Se   55
Fi   42
Si   25
Fe   20
```

这些参数只是：

> 游戏人物模型参数。

不是心理学诊断。

---

# 十八、MBTI / Cognitive Functions 的作用

只表达：

> 人物倾向如何思考。

Ti：

* 第一性原理
* 拆假设
* 内部逻辑
* 重新推导
* 质疑默认规则

Ne：

* 发散
* 跨领域连接
* 非常规方案
* 多可能性探索

Ni：

* 长期未来
* 宏观愿景
* 文明尺度目标

Te：

* 执行
* 工程化
* 组织资源
* 提速
* 落地

禁止：

> Ti 高 → 必须做软件。

认知功能不能直接决定职业。

---

# 十九、Values

建立：

```ts
type ValueProfile = {
  firstPrinciples: number
  autonomy: number
  ambition: number
  engineeringDrive: number
  curiosity: number
  riskTolerance: number
  urgency: number
  civilizationMission: number
  competitiveness: number
  controlNeed: number

  stabilityNeed: number
  socialConformity: number
  socialHarmonyNeed: number
}
```

V1 可暂用：

```text
FIRST_PRINCIPLES       96
AUTONOMY               95
AMBITION               97
ENGINEERING_DRIVE      96
CURIOSITY              92
RISK_TOLERANCE         90
URGENCY                 94
CIVILIZATION_MISSION   88
COMPETITIVENESS        84
CONTROL_NEED           82

STABILITY_NEED         15
SOCIAL_CONFORMITY      18
SOCIAL_HARMONY_NEED    25
```

仍然只是：

> 游戏参数。

---

# 二十、State

快速变化的人生状态：

```ts
type LifeState = {
  year: number
  age: number

  wealth: number
  income: number

  technical: number
  business: number
  network: number
  reputation: number
  influence: number

  energy: number
  stress: number

  currentCountry?: string
  currentCity?: string

  currentIdentity?: string
  currentCompany?: string
  currentCareer?: string

  autonomyConflict: number
  ambitionPressure: number
  unresolvedProblemPressure: number

  tags: string[]

  history: HistoryEntry[]

  timelineDeviation: number

  seed: string

  simulationProfileVersion: string
}
```

这些主要运行在后台。

---

# 二十一、人物模型必须版本化

不要将人物参数散落为魔法常量。

例如：

```text
elon-profile-v1
```

未来人物研究或游戏平衡发生变化，可以新增：

```text
elon-profile-v2
```

存档记录：

```text
simulationProfileVersion
```

这样可以：

* 保持旧存档可解释
* 比较不同人物模型结果
* 避免更新人格参数后无法重现旧世界线

---

# 二十二、Choice Fit

建立：

```ts
calculateChoiceFit()
```

综合：

* Personality
* Values
* State
* History
* Environment
* Age
* Career
* Era

后台将选择分类：

## Natural

高度符合人物。

## Plausible

并非最自然，但合理。

## Unnatural

当前状态明显不自然。

Natural / Plausible：

正常加入候选选项。

Unnatural：

默认隐藏或极少出现。

但特殊人生经历可以让它重新变成 Plausible。

---

# 二十三、人格约束不能变成轨道锁

禁止：

> “该选项不符合 Elon 性格，所以不能选择。”

玩家应该仍然可以：

> 长期违背人物自然倾向。

但会产生：

* 心理冲突
* 压力
* 后悔
* 不稳定
* 新事件
* 人生转向

形成真正的：

> 玩家意志 vs 人物意志。

---

# 二十四、Life Graph

不要使用传统无限剧情树。

使用：

> 状态图。

允许：

* 分叉
* 汇合
* 横向跳转
* 重返旧职业
* Alternate → Canon
* Alternate → Alternate

例如：

```text
Stanford
├── Zip2
│
├── Netscape
│      ↓
│   Engineer
│      ↓
│   Startup
│      ↓
└──── Zip2
```

必须证明：

> 平行历史不是简单的一次性分叉。

---

# 二十五、Narrative Content Pack

这是整个长期项目最重要的扩展机制之一。

所有叙事内容必须组织成：

# Narrative Content Pack

例如：

```text
content/
  packs/
    childhood/
    canada/
    university/
    silicon-valley/
    netscape/
    zip2/
    paypal/
    spacex/
    tesla/
    ai/
```

一个 Content Pack 可以独立包含：

* Canon Events
* Alternate Events
* Random Events
* Characters
* Locations
* Narrative Templates
* Scene References
* Historical Sources
* Endings
* Assets Manifest

---

# 二十六、内容扩展方向

内容不能只：

> 向时间轴后面增加。

必须同时允许：

## 向未来增长

例如：

新增 2028 SpaceX Canon。

---

## 向旧时间横向扩展

例如：

增加：

> Netscape Expanded Pack

给 1995～1998 增加新机会和路线。

---

## 向已有事业纵向深化

例如：

SpaceX 原来只有几个事件。

后来加入：

> SpaceX Trial Pack

让该事业拥有几十次试射。

---

## 向人物关系扩展

以后增加：

* 新关系
* 新角色
* 新冲突

---

# 二十七、新 Content Pack 原则上不得修改核心引擎

新增内容包不应该要求修改：

* Event Engine
* Probability Engine
* Timeline Engine
* Narrative Scheduler
* React 主界面
* RNG Engine
* 旧内容包

内容通过：

> Registry

注册。

---

# 二十八、Content Pack 依赖

支持：

```ts
type ContentPackManifest = {
  id: string
  version: string

  requires?: string[]

  events?: LifeEvent[]
  randomEvents?: RandomEventDefinition[]
  endings?: EndingDefinition[]

  assets?: AssetManifest[]

  sources?: SourceRef[]
}
```

例如：

```text
spacex-2006

requires:
- core
- spacex-base
```

避免模块之间隐式耦合。

---

# 二十九、事件不依赖固定前后节点

不要要求：

```text
eventA
↓
eventB
↓
eventC
```

才能扩展。

事件应该主要通过：

* year
* age
* company
* career
* state
* tags
* history
* personality
* values
* world state

决定是否进入候选池。

例如新增：

“游戏公司邀请”

只需要定义：

```text
year: 1996～1999

technical > 70

hasTag:
game_development_experience

not:
major_company_founder
```

满足条件的世界线：

都有机会触发。

---

# 三十、Random Event Pack

随机事件必须成为独立内容类型。

不能散落：

```ts
if (...) {
  triggerSomething()
}
```

建立：

```ts
type RandomEventDefinition = {
  id: string

  pool: string

  conditions: EventCondition[]

  baseWeight: number

  cooldown?: number

  once?: boolean

  personalityAffinity?: PersonalityAffinity
  valueAffinity?: ValueAffinity

  scene: NarrativeScene

  choices?: EventChoice[]

  effects?: Effect[]
}
```

---

# 三十一、Random Event Pools

例如：

```text
career
startup
finance
relationship
technology
opportunity
media
company_crisis
burnout
engineering
recruitment
investment
```

未来模块可以注册自己的随机池。

---

# 三十二、SpaceX Random Pack 示例

例如：

```text
engine_failure
test_delay
supplier_failure
NASA_opportunity
key_engineer_leaves
funding_crisis
unexpected_test_success
```

只有进入 SpaceX 相关状态时：

才进入候选随机池。

---

# 三十三、Tesla Random Pack 示例

例如：

```text
battery_issue
production_delay
factory_problem
supplier_issue
talent_recruitment
regulation_change
```

---

# 三十四、AI Random Pack 示例

例如：

```text
research_breakthrough
talent_poaching
compute_shortage
model_failure
competitor_release
funding_opportunity
```

---

# 三十五、随机必须发生在合理空间

Random ≠ Anything Can Happen。

候选随机事件必须先通过：

```text
时间
+
人物
+
事业
+
历史
+
State
+
Personality
+
Values
+
世界状态
```

过滤。

之后才做权重抽取。

RNG 只负责：

> 在合理可能性空间里制造不确定性。

---

# 三十六、Narrative Scheduler

必须实现：

# Narrative Scheduler

因为同一时间可能存在多个：

> Eligible Events。

Scheduler 负责：

```text
所有可触发事件
↓
过滤
↓
计算优先级
↓
检查剧情节奏
↓
解决冲突
↓
选出当前最适合发生的事件
```

---

# 三十七、事件调度属性

Event 可以增加：

```ts
priority?: number

urgency?: number

storyRole?:
  | 'anchor'
  | 'major'
  | 'minor'
  | 'random'

expiresAt?: number

cooldownGroup?: string
```

---

# 三十八、Anchor Event

重要 Canon 或人生机会节点可以定义为：

# Anchor Event

Anchor 不意味着：

> 必须发生。

而意味着：

> 在满足条件和历史机会窗口时拥有较高叙事权重。

例如：

* Stanford
* Zip2
* X.com
* PayPal
* SpaceX

这样不会因为随机事件过多，导致真正的重要人生节点长期不出现。

---

# 三十九、Narrative Pacing

必须有：

# Narrative Pacing

随机事件不能：

> 连续无限触发。

Pacing 决定：

> 什么时候应该发生什么规模的事件。

例如可以初步规定：

* Major Event 后允许短结果段
* Major 之间最多插入 1～2 个 Minor/Random Event
* 同类别事件不能连续高频出现
* 连续危机后适当产生缓冲
* 高 Stress 时 Crisis 权重上升
* 平静时期 Opportunity / Relationship / Reflection 权重提高
* Anchor Event 到达紧迫期时提高调度优先级

注意：

> Random Event 决定发生什么。

> Narrative Pacing 决定什么时候发生。

---

# 四十、概率系统

玩家选择：

> 不直接决定结果。

结果由：

```text
Choice
+
Personality
+
Values
+
State
+
History
+
Environment
+
RNG
```

共同决定。

例如：

> 继续求职 Netscape

基础：

```text
录用：35
拒绝：55
其他机会：10
```

technical 高：

录用提高。

network 高：

录用提高。

某些历史标签：

改变概率。

---

# 四十一、Seed RNG

所有随机结果统一由 Seed 控制。

禁止到处：

```ts
Math.random()
```

例如：

```text
WORLDLINE SEED

MUSK-88421
```

同 Seed + 同选择序列：

应尽可能得到相同世界线结果。

用途：

* 世界线分享
* Bug 重现
* 测试
* Speedrun
* 平衡
* 玩家挑战

---

# 四十二、Deterministic RNG Streams

不要只使用：

> 单一全局 RNG 流。

否则一个视觉随机效果都有可能改变人生结果。

从：

```text
worldSeed
```

派生：

```text
narrative RNG
outcome RNG
randomEvent RNG
company RNG
cosmetic RNG
```

或者使用：

```text
seed
+
eventId
+
attemptIndex
```

生成局部随机流。

必须保证：

> Cosmetic RNG 的新增或删除不能改变剧情 Outcome。

这对于：

* Bug 复现
* Seed 分享
* 自动测试

非常重要。

---

# 四十三、结果反馈

结果必须首先叙事化。

错误：

```text
Technical +5
Stress +8
Ambition +4
```

正确：

> 你在停车场坐了很久。
>
> 如果没人愿意给你机会，也许应该自己创造一个。

然后轻量：

```text
压力 ↑
野心 ↑
```

详细数值进入：

> Life Profile。

---

# 四十四、Narrative Authoring Layer

虽然不用 Ink 作为主 Runtime，但内容创作体验应该借鉴：

> Ink / Twine 的声明式思想。

80% 以上的新剧情：

> 应只需要写内容数据，而不需要写新业务逻辑。

例如：

```ts
defineEvent({
  id: 'netscape_offer',

  when: {
    year: [1995, 1996],
    technical: { gte: 70 }
  },

  scene: {
    location: 'Palo Alto',
    openingNarrative: `...`
  },

  choices: [...]
})
```

禁止把内容系统发展成：

```ts
new EventFactory(
  composeCondition(
    create...
  )
)
```

导致只有程序员才能写剧情。

---

# 四十五、核心 Event 数据结构

保持声明式：

```ts
type LifeEvent = {
  id: string

  title: string

  truthType: NarrativeTruthType

  historicalConfidence?: HistoricalConfidence
  sourceRefs?: SourceRef[]

  conditions?: EventCondition[]

  priority?: number
  urgency?: number

  storyRole?:
    | 'anchor'
    | 'major'
    | 'minor'
    | 'random'

  expiresAt?: number
  cooldownGroup?: string

  scene: NarrativeScene

  choices: EventChoice[]

  category: EventCategory

  once?: boolean
}
```

---

# 四十六、Choice

```ts
type EventChoice = {
  id: string

  text: string

  requirements?: EventCondition[]

  personalityAffinity?: PersonalityAffinity

  valueAffinity?: ValueAffinity

  outcomes: EventOutcome[]
}
```

---

# 四十七、Outcome

```ts
type EventOutcome = {
  weight: number

  conditions?: EventCondition[]

  narrative: string

  effects?: Effect[]

  addTags?: string[]

  removeTags?: string[]

  nextEventId?: string
}
```

---

# 四十八、Content Validator

必须开发：

# Content Validator / Content Linter

因为未来主要风险不是：

> TS 语法错误。

而是：

> 剧情数据逻辑错误。

提供命令：

```bash
pnpm validate:content
```

至少检查：

* Event ID 重复
* Random Event ID 重复
* Ending ID 重复
* nextEventId 不存在
* 内容包依赖不存在
* 永远不可满足条件
* 明显不可达事件
* Probability Weight 非法
* Outcome 缺少 Narrative
* Canon Fact 没有 sourceRefs
* Alternate 错误标记 Canon
* Tag 拼写不一致
* Random Event 没 cooldown 且可能无限重复
* Ending 条件永远无法满足
* Asset Key 不存在
* Character Key 不存在
* Background Key 不存在
* Content Pack 循环依赖

---

# 四十九、Developer Narrative Inspector

正式玩家 UI：

> 隐藏复杂系统。

但开发模式必须可以看到：

```text
World Seed

Current State

Current Tags

Current Personality Profile

Candidate Events

Event Priority

Scheduler Score

Choice Fit

Outcome Weight

Random Roll

Why Event Is Locked

Current Random Pool

Timeline Deviation
```

---

# 五十、开发调试能力

开发模式建议支持：

* Force Event
* Force Random Event
* Jump Year
* Modify State
* Add Tag
* Remove Tag
* Set Seed
* Trigger Ending
* 查看 History
* 查看候选事件
* 查看未触发原因
* 查看 Scheduler 评分
* 查看 RNG Stream
* 查看当前 Content Packs

这些工具：

> 不属于玩家正式体验。

但必须帮助 Codex 和开发者快速定位问题。

---

# 五十一、Timeline Deviation

加入：

# Timeline Deviation

范围：

```text
0 ～ 100
```

表示：

> 当前人生与真实历史偏离程度。

不表示：

好坏。

例如：

```text
Google AI Researcher

Deviation = 82
```

完全可能是非常成功的人生。

计算可以参考：

* 关键 Canon Event
* 当前公司
* 当前职业
* 财富
* 事业方向
* 关键人生标签
* 当前时代

---

# 五十二、UI 三层结构

## 第一层：Narrative Scene

玩家约：

> 70%～80% 游戏时间

看到。

包含：

* 背景
* 人物
* 年份
* 地点
* 叙事
* 对话
* 选择
* 极少量关键状态

它是：

> 主游戏。

---

## 第二层：Life Profile

玩家主动打开。

显示：

* 财富
* 技术
* 商业
* 人脉
* 声望
* 当前职业
* 公司
* 压力
* 精力
* 重要经历
* 人格倾向

不要默认展示：

```text
Ti 95
Ne 93
```

可以概括成：

```text
强第一性原理
高度发散
高自主需求
高风险接受度
```

---

## 第三层：Timeline

用于：

> 元叙事观察。

例如：

```text
REALITY

Stanford
↓
Zip2
↓
X.com


PLAYER

Stanford
↓
Netscape
↓
Senior Engineer
```

显示：

* Canon Timeline
* Player Timeline
* Timeline Deviation
* 分叉
* 汇合
* 同期现实 Elon 状态

---

# 五十三、美术方向

采用：

# Cinematic Stylized Realism

# 电影化半写实纪实插画风

目标约：

> 70% 现实感 + 30% 艺术化。

不要采用：

* 明显日漫
* Q版
* 二次元传统 VN
* 纯赛博朋克
* 纯科技 HUD
* 照片拼贴
* 完全照片级真人复刻

视觉目标：

> **像一部可以被玩家改写的历史电影 / 高质量数字传记插画。**

---

# 五十四、为什么不采用纯动漫

因为游戏大量使用：

* 真实人物
* 真实公司
* 真实科技史
* 真实商业史

视觉应该维持：

> “这真的可能发生过。”

过强动漫化会削弱：

> 平行历史的可信度。

---

# 五十五、为什么不采用纯照片写实

项目长期跨度可能从：

1970s

到：

* 1980s
* 1990s
* 2000s
* SpaceX
* Tesla
* AI
* Starship
* Mars

纯照片级制作会造成：

* 资产量过大
* 人物一致性难
* 年龄一致性难
* AI视觉容易失控
* 内容成本巨大

因此：

> 一致的半写实美术语言优先于绝对照片逼真。

---

# 五十六、年代摄影语言

整体风格统一。

但年代可以变化。

## 1970s～1980s

* 家庭摄影
* 暖色
* 颗粒
* CRT
* 旧电脑
* 老照片感

## 1990s

* Silicon Valley
* CRT
* 灰白电脑
* 小办公室
* 车库
* 夜间编码
* 胶片 / 早期数码感

## 2000s

* 工业
* 互联网公司成熟化
* 工厂
* 航天基地
* 更冷静视觉

## 2010s～现代

* 大型工程
* 工厂
* Falcon
* Tesla
* 自动化
* 数据中心

## 未来

继续建立在现实主义上：

* Starship
* Robot
* AI
* Mars

不要突然变成：

> 完全不同的科幻游戏。

---

# 五十七、2D / 2.5D 优先

V1 优先使用：

* 半写实背景
* 半写实人物
* 分层场景
* 视差
* 景深
* 光影
* 局部动画
* Motion

例如：

* CRT 闪烁
* 雨
* 风
* 光线
* 汽车经过
* 火箭尾焰
* 屏幕变化

制造：

> 电影场景感。

---

# 五十八、Scene Library

不要：

> 一个事件 = 一张全新背景。

建立：

```text
childhood_home
school
computer_room_1980s
canada_city
university_campus
dorm_room
silicon_valley_street
office_1990s
garage_startup
boardroom
apartment
airport
factory
launch_site
```

通过：

* 时间
* 天气
* 光照
* 人物
* 道具
* 前景
* 音效

复用场景。

---

# 五十九、Asset Manifest

视觉资产也必须数据驱动。

不要在事件里写死：

```text
/assets/random-office-2.webp
```

事件只能引用：

```text
backgroundKey
characterKey
propKey
audioKey
```

例如：

```ts
type AssetManifest = {
  id: string

  type:
    | 'background'
    | 'character'
    | 'prop'
    | 'overlay'
    | 'audio'

  era?: string

  variants?: string[]

  path: string
}
```

这样未来可以：

> 更换资产而不修改剧情。

---

# 六十、音频

V1 不要求大量原创音乐。

但预留：

* 环境音
* UI 音效
* 场景音乐
* 年代音乐风格
* 工厂
* 发动机
* 火箭

音频同样通过：

> Asset Key

引用。

---

# 六十一、结局系统

结局首先必须是：

> 小说式人生总结。

而不是属性统计。

例如：

```text
2002。

你没有创办 SpaceX。

事实上，你已经很久没有认真想过火箭。

你现在是硅谷最受欢迎的技术创业者之一。

一家快速增长的搜索公司向你发出了邀请。

它叫 Google。
```

然后：

```text
ENDING

THE ROAD NOT TAKEN
```

再展示：

* 财富
* 影响力
* 世界线偏离度
* 关键选择
* 主要人生节点

---

# 六十二、长期传奇目标

未来完整版本可以包括：

* Trillionaire
* Mars
* AGI
* Industrial Empire
* Civilization Impact

财富：

> 不是唯一目标。

---

# 六十三、V1 正式内容范围

正式 V1：

> 1971 ～ 2002

主要阶段：

* 童年
* 编程
* Blastar
* 加拿大
* Queen's
* UPenn
* Stanford
* Netscape
* Zip2
* X.com
* PayPal
* SpaceX Prelude

建议最终：

* 30～50 个核心事件
* 15～30 个条件随机事件
* 5～10 个阶段结局

但：

> 不要第一阶段一次性全部制作。

---

# 六十四、第一阶段 Vertical Slice

先做：

> 10～15 个高质量事件。

至少包含：

## Canon

```text
童年
↓
编程
↓
加拿大
↓
大学
↓
Stanford
↓
Zip2
```

---

## Alternate A

```text
大学
↓
Netscape
↓
Engineer
↓
离职
↓
Zip2
```

证明：

> Alternate 可以重新汇入 Canon。

---

## Alternate B

```text
大学
↓
独立游戏开发
↓
游戏公司
```

---

## Alternate C

```text
创业失败
↓
软件工程师
↓
稳定工作
↓
人格冲突积累
↓
再次创业机会
```

证明：

> 玩家可以违背人物，但人物会抵抗。

---

# 六十五、Vertical Slice 必须证明

1. 玩家愿意继续读
2. 关键事件有叙事张力
3. 玩家真的会犹豫
4. 选择不是假选择
5. 同一选择可能产生不同合理结果
6. Seed 能复现
7. 分支能汇合
8. Alternate 仍然像 Elon
9. Personality Gravity 实际影响故事
10. Timeline 可查看
11. 美术具有真实年代感
12. 不是纯 UI Demo

---

# 六十六、Vertical Slice 可扩展性验收

除了“当前能玩”，还必须证明：

> **未来能长。**

新增：

```text
test-alternate-pack
```

其中包含：

* 1 个 Alternate Event
* 1 个 Random Event
* 1 个 Ending
* 1 个 Scene/Asset 引用

要求：

1. 不修改 Event Engine
2. 不修改 Probability Engine
3. 不修改 Narrative Scheduler
4. 不修改 React 主游戏页面
5. Registry 注册后即可运行
6. 满足条件的旧状态能够触发新内容
7. 删除测试 Pack 后核心游戏正常

---

# 六十七、Narrative Scheduler 验收

构造：

> 同时满足多个事件条件。

验证：

Scheduler 能根据：

* priority
* urgency
* storyRole
* pacing
* state

合理选出当前事件。

不能只是：

> 从可用事件里随便 random 一个。

---

# 六十八、Random Event Pack 验收

新增随机事件包后：

* 不改 Scheduler
* 不改核心 RNG
* 不改 Event Engine

即可：

> 进入正确随机池。

---

# 六十九、Content Validator 验收

运行：

```bash
pnpm validate:content
```

Vertical Slice 必须：

* 无重复 ID
* 无不存在引用
* 无非法概率
* 无明显不可达核心 Event
* 无缺失 Canon Source
* 无错误 Asset Key
* 无 Content Pack 依赖错误

---

# 七十、Developer Inspector 验收

开发模式必须能够解释：

> “为什么这个事件没有发生？”

例如：

```text
Google Recruit

LOCKED

Reason:
year < 1998
technical < 75
```

不能让开发者只能：

> 猜条件哪里错了。

---

# 七十一、未来 SpaceX 模块

SpaceX 不作为独立游戏。

它是：

> Elon 人生中的深度事业模块。

未来核心循环：

```text
叙事
↓
工程问题
↓
方案
↓
试验规划
↓
试射
↓
遥测
↓
结果
↓
技术进步
↓
公司与人物反馈
↓
叙事
```

---

# 七十二、SpaceX 玩法必须体现人物思维

例如：

问题：

> 为什么火箭这么贵？

普通经营选项可能是：

* 找便宜供应商
* 申请更多资金

Elon Possibility Space 更容易产生：

* 自研发动机
* 垂直整合
* 重新推导材料成本
* 重构制造流程
* 重复使用
* 提高发射频率
* 改变整枚火箭架构

SpaceX 应成为：

> 人物思维模型的工程化体现。

---

# 七十三、未来 Tesla / AI 同理

Tesla 不只是：

> 看汽车销量。

而应该围绕：

* 电池
* 工厂
* 制造
* 自动化
* 软件
* 垂直整合
* 产能

AI 模块不只是：

> 参数排行榜。

而可能涉及：

* 算力
* 人才
* 模型路线
* 数据
* Agent
* Robotics
* AGI
* 竞争

但：

> 不要 V1 就做这些完整系统。

---

# 七十四、推荐目录

```text
src/
  engine/
    eventEngine.ts
    conditionEngine.ts
    probability.ts
    rng.ts
    randomStreams.ts
    personality.ts
    timeline.ts
    scheduler.ts
    pacing.ts

  game/
    state.ts
    types.ts
    save.ts

  character/
    elon/
      profile-v1.ts
      values.ts
      baseline.ts

  content/
    registry.ts

    packs/
      childhood/
      canada/
      university/
      silicon-valley/
      netscape/
      zip2/
      paypal/

  research/
    sources.ts
    canonReferences.ts

  scenes/
    registry.ts
    manifests/
    backgrounds/
    characters/
    props/
    audio/

  modules/
    companies/

  ui/
    narrative/
    choices/
    profile/
    timeline/
    ending/
    debug/

  validation/
    contentValidator.ts
```

可以根据实际仓库调整。

不要机械照抄目录。

重点是：

> 职责分离。

---

# 七十五、核心函数

V1 优先：

```ts
getAvailableEvents()

getAvailableChoices()

calculateChoiceFit()

calculateOutcomeWeights()

resolveEventOutcome()

applyEffects()

advanceTime()

updatePersonalityConflict()

calculateTimelineDeviation()

getEligibleRandomEvents()

calculateRandomEventWeights()

resolveRandomEvent()

scheduleNextEvent()

validateContent()
```

不要一开始造几十个复杂抽象层。

---

# 七十六、测试

至少测试：

1. 同 Seed + 同选择 = 同 Outcome
2. Cosmetic RNG 不改变人生 Outcome
3. Event Condition
4. Choice Fit
5. Outcome Weight
6. Effect
7. Personality Conflict
8. Alternate → Canon 汇合
9. Random Event Pool
10. Narrative Scheduler
11. Pacing
12. Timeline Deviation
13. Save / Load
14. Content Pack 注册
15. Content Pack 依赖
16. Asset Key 校验
17. Canon Source 校验
18. 新内容无需修改 Engine

---

# 七十七、存档

支持：

* New Game
* Save
* Load
* Multiple Slots
* Seed
* Content Version
* Simulation Profile Version

不要保存：

> 完整 Event Object。

只保存：

* event IDs
* state
* tags
* history
* seed
* content versions
* profile version

这样未来新增 Event：

不会让旧存档天然失效。

---

# 七十八、旧存档与新内容

当新增 Narrative Content Pack 后：

如果旧存档满足新事件条件：

> 应可以自然进入新内容。

不要默认要求：

> 新剧情 = 必须重新开局。

破坏性 Schema 改动才使用：

> Save Migration。

---

# 七十九、开发顺序

## Phase 1：极小 Runtime + 3～5 个好故事

同时建立：

* 最小 Event Schema
* Narrative Runtime
* 3～5 个连续场景

不要：

> 先做完整引擎。

也不要：

> 先硬编码故事之后再全部重构。

目标是：

> 最小 Runtime 与真实故事同时验证。

---

## Phase 2：Life Graph

扩展：

10～15 个 Event。

增加：

* Canon
* Alternate
* 汇合

---

## Phase 3：概率与 Seed

加入：

* Seed RNG
* Deterministic RNG Streams
* Outcome Probability

---

## Phase 4：人物模型

加入最小：

* Personality
* Values
* Choice Fit
* Personality Conflict

只做到：

> 对故事产生明显价值。

---

## Phase 5：Scheduler / Pacing

加入：

* Anchor Event
* Major
* Minor
* Random
* Event Priority
* Narrative Pacing

---

## Phase 6：Content Pack

加入：

* Registry
* Pack Manifest
* Dependency
* Random Event Pack

---

## Phase 7：Validator / Debug

加入：

* Content Validator
* Developer Inspector

---

## Phase 8：历史资料层

加入：

* sourceRefs
* truthType
* historicalConfidence

---

## Phase 9：Timeline

实现：

Canon vs Player。

---

## Phase 10：Save

实现：

存档与版本信息。

---

## Phase 11：视觉完善

统一：

* 半写实
* 年代摄影语言
* Scene Library
* Asset Manifest
* 2.5D
* UI 克制

---

## Phase 12：扩展正式 V1

之后才扩展：

> 1971～2002。

---

# 八十、禁止事项

禁止把游戏做成：

* 马斯克百科
* MBTI 测试器
* 人生属性管理器
* BI Dashboard
* Excel 模拟器
* 巨大科技树
* 纯经营游戏
* 固定剧情树
* AI 自动写小说 Demo

禁止：

* 一开始实现完整 Personality Engine
* 一开始实现完整 SpaceX
* 一开始实现所有公司
* 一开始写几百个事件
* 所有属性常驻 UI
* 大量 if(eventId === ...)
* Math.random() 散落代码
* Random Event 写成大量 if/else
* 新剧情必须修改 Engine
* 新事件必须接固定前驱
* 把 Canon 当正确答案
* 把 Alternate 当错误答案
* 无限提供不符合 Elon 的选择
* Personality Fit 低就绝对禁止
* 用随机解释一切
* 让 Random Event 淹没重大剧情
* 复制传记原文
* 把传记解释当确定事实
* 凭模型记忆随意编造 Canon
* 使用明显动漫 / Q版
* 使用纯赛博朋克
* 为了视觉一开始大量 3D
* 使用 LLM 决定核心概率
* 过早设计超复杂架构

---

# 八十一、最终开发判断标准

开发任何 Canon Event 前问：

> 有什么可靠历史依据？

开发 Canon Dramatised 内容前问：

> 哪些是事实，哪些是合理艺术补全？

开发 Alternate 前问：

> 为什么这个 Elon 会走到这里？

开发 Choice 前问：

> 这是玩家会想到的，还是 Elon 会想到的？

开发 Random Event 前问：

> 为什么这种状态下它有可能发生？

开发新 Engine 前问：

> 它会让游戏更好玩吗？

开发新 UI 前问：

> 它会增加叙事代入，还是把游戏做成数据管理器？

开发新美术前问：

> 它像真实年代里可能发生的一幕，还是普通 AI 科技概念图？

新增内容包前问：

> 能不能不修改核心 Engine 就安装进去？

---

# 八十二、最终产品定义

# Elon Musk: Parallel Lives

# 《马斯克传：平行人生》

它应该最终成为：

> **一部以可靠真实历史为骨架，以 Elon Musk 的人格和价值观为边界，以玩家选择、概率和人生状态为动力，以电影化半写实视觉表现，并能够随着现实历史和平行世界不断增长的系统型互动小说。**

历史：

> 提供现实锚点。

人物：

> 提供宿命。

玩家：

> 提供变量。

随机：

> 提供命运。

Life Graph：

> 提供分叉与汇合。

Content Pack：

> 提供持续扩展能力。

画面：

> 提供人生现场感。

最终，当玩家沿 Canon 前进时应该感觉：

> **“原来真实的 Elon 当时真的经历过这些。”**

而当玩家进入 Alternate 时应该感觉：

> **“这没有真正发生过，但我真的相信另一个 Elon Musk 可能走到这里。”**

---

# 八十三、现在开始开发

不要只输出设计文档。

执行：

1. 阅读当前仓库。
2. 理解现有技术栈。
3. 不要贸然大规模重构。
4. 建立最小 Narrative Runtime。
5. 建立声明式 Event Schema。
6. 制作一个真正有年代感和电影感的 Narrative Scene。
7. 连续制作 3～5 个高质量可玩事件。
8. 确认互动小说体验成立。
9. 扩展成 10～15 个 Event Vertical Slice。
10. 实现至少一个 Canon → Alternate。
11. 实现至少一个 Alternate → Canon 汇合。
12. 实现一次“玩家违背人格 → 冲突积累 → 后续新事件”。
13. 加入 Seed RNG 与独立 Random Streams。
14. 加入 Narrative Scheduler 与基础 Pacing。
15. 加入 Narrative Content Pack / Random Event Pack Registry。
16. 加入测试 Content Pack 验证扩展能力。
17. 加入 Content Validator。
18. 加入 Developer Narrative Inspector。
19. 加入 Canon Source / Truth Type 数据。
20. 加入 Timeline。
21. 加入 Save / Load。
22. 实际运行游戏。
23. 运行单元测试和 Content Validator。
24. 修复 TypeScript / Runtime / Content 错误。
25. 最终交付真正可以玩的 Vertical Slice，而不是架构说明。
