# MCP 工具参数传递示例

本文档详细说明了AI如何通过MCP协议调用Metaso工具时传递参数。

## 参数传递机制

### 🔧 环境变量（静态配置）
在MCP配置文件中设置，服务器启动时加载：
- `METASO_API_KEY` - API认证密钥
- `METASO_BASE_URL` - API服务地址  
- `METASO_TIMEOUT` - 请求超时设置
- `METASO_DEBUG` - 调试开关

### 📨 工具调用参数（动态请求）
AI通过MCP协议调用工具时，在每次请求中传递具体的功能参数。

---

## 1. metaso_search - 搜索工具

### 基本搜索示例

**AI调用方式**：
```
请使用metaso_search搜索"人工智能最新发展"
```

**实际MCP调用**：
```json
{
  "tool": "metaso_search",
  "arguments": {
    "query": "人工智能最新发展"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/search' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"人工智能最新发展","scope":"webpage","includeSummary":true,"includeRowContent":false}'
```

### 高级搜索示例

**AI调用方式**：
```
使用metaso_search在学术范围内搜索"量子计算"，返回10条结果，包含摘要但不包含原文
```

**实际MCP调用**：
```json
{
  "tool": "metaso_search",
  "arguments": {
    "query": "量子计算",
    "scope": "scholar",
    "size": 10,
    "include_summary": true,
    "include_row_content": false
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/search' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"量子计算","scope":"scholar","includeSummary":true,"includeRowContent":false,"size":10}'
```

### 分页搜索示例

**AI调用方式**：
```
使用metaso_search搜索"区块链技术"，获取第3页结果
```

**实际MCP调用**：
```json
{
  "tool": "metaso_search",
  "arguments": {
    "query": "区块链技术",
    "page": 3,
    "include_summary": true
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/search' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"区块链技术","scope":"webpage","includeSummary":true,"includeRowContent":false,"page":"3"}'
```

### 所有搜索范围示例

| 搜索范围 | AI调用示例 | MCP参数 |
|----------|------------|---------|
| 网页 | `搜索"AI新闻"` | `{"scope": "webpage"}` |
| 文档 | `在文档中搜索"API文档"` | `{"scope": "document"}` |
| 学术 | `学术搜索"机器学习"` | `{"scope": "scholar"}` |
| 图片 | `搜索"猫咪"图片` | `{"scope": "image"}` |
| 视频 | `搜索"编程教程"视频` | `{"scope": "video"}` |
| 播客 | `搜索"科技播客"` | `{"scope": "podcast"}` |

---

## 2. metaso_reader - 网页读取工具

### Markdown格式读取

**AI调用方式**：
```
使用metaso_reader读取这个网页内容：https://example.com/article
```

**实际MCP调用**：
```json
{
  "tool": "metaso_reader",
  "arguments": {
    "url": "https://example.com/article",
    "format": "markdown"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/reader' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: text/plain' \
--header 'Content-Type: application/json' \
--data '{"url":"https://example.com/article"}'
```

### JSON格式读取

**AI调用方式**：
```
使用metaso_reader以JSON格式读取https://news.example.com/latest的内容
```

**实际MCP调用**：
```json
{
  "tool": "metaso_reader",
  "arguments": {
    "url": "https://news.example.com/latest",
    "format": "json"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/reader' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"url":"https://news.example.com/latest"}'
```

---

## 3. metaso_chat - AI问答工具

### 快速模式问答

**AI调用方式**：
```
使用metaso_chat询问："什么是人工智能？"
```

**实际MCP调用**：
```json
{
  "tool": "metaso_chat",
  "arguments": {
    "query": "什么是人工智能？",
    "model": "fast",
    "format": "chat_completions"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"fast","stream":false,"messages":[{"role":"user","content":"什么是人工智能？"}]}'
```

### DeepSeek R1模式问答

**AI调用方式**：
```
使用metaso_chat以ds-r1模型询问："解释量子纠缠现象"，基于学术资料
```

**实际MCP调用**：
```json
{
  "tool": "metaso_chat",
  "arguments": {
    "query": "解释量子纠缠现象",
    "model": "ds-r1",
    "scope": "scholar",
    "format": "chat_completions"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"model":"ds-r1","stream":false,"scope":"scholar","messages":[{"role":"user","content":"解释量子纠缠现象"}]}'
```

### 简化格式问答

**AI调用方式**：
```
使用metaso_chat以简单格式询问："今天天气如何？"
```

**实际MCP调用**：
```json
{
  "tool": "metaso_chat",
  "arguments": {
    "query": "今天天气如何？",
    "model": "fast",
    "format": "simple"
  }
}
```

**生成的API请求**：
```bash
curl --location 'https://metaso.cn/api/v1/chat/completions' \
--header 'Authorization: Bearer mk-YOUR-API-KEY-HERE' \
--header 'Accept: application/json' \
--header 'Content-Type: application/json' \
--data '{"q":"今天天气如何？","model":"fast","format":"simple"}'
```

### 不同模型和范围组合

| 模型 | 搜索范围 | AI调用示例 | MCP参数 |
|------|----------|------------|---------|
| fast | 默认(网页) | `快速回答"什么是GPT？"` | `{"model": "fast"}` |
| fast_thinking | document | `基于文档深度思考"AI伦理问题"` | `{"model": "fast_thinking", "scope": "document"}` |
| ds-r1 | scholar | `用R1模型基于学术资料分析"气候变化"` | `{"model": "ds-r1", "scope": "scholar"}` |

---

## 参数验证和错误处理

### 参数验证示例

**无效的搜索范围**：
```json
{
  "tool": "metaso_search",
  "arguments": {
    "query": "测试",
    "scope": "invalid_scope"  // ❌ 无效范围
  }
}
```

**服务器响应**：
```json
{
  "error": "Invalid enum value. Expected 'webpage' | 'document' | 'scholar' | 'image' | 'video' | 'podcast', received 'invalid_scope'"
}
```

**page和size同时使用**：
```json
{
  "tool": "metaso_search",
  "arguments": {
    "query": "测试",
    "page": 2,     // ❌ 不能同时使用
    "size": 10     // ❌ 不能同时使用
  }
}
```

**服务器响应**：
```json
{
  "error": "page和size参数不能同时使用"
}
```

### URL安全检查示例

**不安全的URL**：
```json
{
  "tool": "metaso_reader",
  "arguments": {
    "url": "http://localhost:8080/admin"  // ❌ 本地地址
  }
}
```

**服务器响应**：
```json
{
  "error": "Invalid or unsafe URL. Only public HTTP/HTTPS URLs are allowed."
}
```

---

## 实际使用场景示例

### 场景1：研究特定主题

**AI对话**：
```
用户: 我想研究量子计算的最新进展
AI: 我帮您搜索量子计算的最新学术资料
```

**MCP调用序列**：
```json
// 1. 搜索学术资料
{
  "tool": "metaso_search",
  "arguments": {
    "query": "量子计算最新进展 2024",
    "scope": "scholar",
    "size": 15,
    "include_summary": true
  }
}

// 2. 读取特定论文
{
  "tool": "metaso_reader",
  "arguments": {
    "url": "https://arxiv.org/abs/2024.xxxxx",
    "format": "markdown"
  }
}

// 3. 深度分析
{
  "tool": "metaso_chat",
  "arguments": {
    "query": "基于上述论文，总结量子计算在2024年的突破性进展",
    "model": "ds-r1",
    "scope": "scholar"
  }
}
```

### 场景2：内容创作辅助

**AI对话**：
```
用户: 我要写一篇关于AI发展历史的文章
AI: 我来帮您收集资料和生成内容
```

**MCP调用序列**：
```json
// 1. 搜索历史资料
{
  "tool": "metaso_search",
  "arguments": {
    "query": "人工智能发展历史 里程碑",
    "scope": "document",
    "include_summary": true,
    "include_row_content": true
  }
}

// 2. 获取详细信息
{
  "tool": "metaso_chat",
  "arguments": {
    "query": "详细描述人工智能从1950年代到现在的重要发展阶段",
    "model": "fast_thinking",
    "scope": "document"
  }
}
```

---

## 总结

✅ **环境变量** = 静态服务配置（API密钥、超时等）  
✅ **工具参数** = 动态请求内容（查询、范围、格式等）  

这种设计让：
- 🔐 **安全信息**（API密钥）在配置层面管理
- 🎯 **业务参数**（搜索内容、格式选项）由AI灵活传递
- 🚀 **最大化灵活性**，AI可以根据用户需求动态调整参数 