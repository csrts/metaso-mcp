# Metaso MCP Server

基于Metaso AI搜索引擎的MCP (Model Context Protocol) Server，为大语言模型提供AI搜索、网页内容读取和AI问答功能。

## 功能特性

- **🔍 AI搜索**: 支持网页、文档、学术、图片、视频、播客等多种搜索范围
- **📖 网页读取**: 提取网页完整内容，支持Markdown和JSON格式输出
- **💬 AI问答**: 基于搜索增强的智能问答，支持多种AI模型
- **🔒 安全验证**: URL安全检查、API密钥验证、输入长度限制
- **🚀 高性能**: 内置重试机制、连接池、错误处理

## 安装

### 从源码构建

```bash
# 克隆项目
git clone https://github.com/csrts/metaso-mcp
cd metaso-mcp

# 安装依赖
npm install

# 构建项目
npm run build
```


## 配置

### 环境变量

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `METASO_API_KEY` | ✅ | - | Metaso API密钥（格式：mk-[32位字符]） |
| `METASO_BASE_URL` | ❌ | `https://metaso.cn` | API基础URL |
| `METASO_TIMEOUT` | ❌ | `30000` | 请求超时时间（毫秒） |
| `METASO_DEBUG` | ❌ | `false` | 启用调试日志 |

### 获取API密钥

1. 访问 [Metaso官网](https://metaso.cn)
2. 注册账户并获取API密钥
3. 设置环境变量：
   ```bash
   export METASO_API_KEY="mk-YOUR_API_KEY_HERE"
   ```

## MCP客户端配置

### Claude Desktop

在Claude Desktop的配置文件中添加：

```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["/path/to/metaso-mcp-server/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-YOUR_API_KEY_HERE"
      }
    }
  }
}
```

### 开发模式

```json
{
  "mcpServers": {
    "metaso": {
      "command": "npx",
      "args": ["-y", "tsx", "/path/to/metaso-mcp-server/src/index.ts"],
      "env": {
        "METASO_API_KEY": "mk-YOUR_API_KEY_HERE",
        "METASO_DEBUG": "true"
      }
    }
  }
}
```

## 可用工具

### 1. metaso_search - AI搜索

搜索互联网内容，支持多种搜索范围。

**参数**：
- `query` (必需): 搜索查询内容
- `scope` (可选): 搜索范围，支持 `webpage`、`document`、`scholar`、`image`、`video`、`podcast`
- `page` (可选): 页数（与size互斥）
- `size` (可选): 结果数量（与page互斥）
- `include_summary` (可选): 是否包含AI摘要（默认true）
- `include_row_content` (可选): 是否包含原文内容（默认false）

**示例**：
```json
{
  "query": "人工智能最新发展",
  "scope": "scholar",
  "size": 10,
  "include_summary": true
}
```

### 2. metaso_reader - 网页读取

读取指定网页的完整内容。

**参数**：
- `url` (必需): 要读取的网页URL
- `format` (可选): 返回格式，支持 `markdown`、`json`（默认markdown）

**示例**：
```json
{
  "url": "https://example.com/article",
  "format": "markdown"
}
```

### 3. metaso_chat - AI问答

与Metaso AI助手对话，获得基于搜索增强的智能回答。

**参数**：
- `query` (必需): 问题或提示内容
- `model` (可选): AI模型，支持 `fast`、`fast_thinking`、`ds-r1`（默认fast）
- `scope` (可选): 搜索范围，支持 `document`、`scholar`、`video`、`podcast`
- `format` (可选): 响应格式，支持 `chat_completions`、`simple`（默认chat_completions）
- `stream` (可选): 启用流式输出（默认false）

**示例**：
```json
{
  "query": "解释量子计算的基本原理",
  "model": "ds-r1",
  "scope": "scholar"
}
```

## 开发

### 项目结构

```
metaso-mcp-server/
├── src/
│   ├── index.ts                 # 主入口文件
│   ├── server.ts                # MCP服务器实现
│   ├── tools/                   # 工具实现
│   │   ├── search.ts            # 搜索工具
│   │   ├── reader.ts            # 读取工具
│   │   └── chat.ts              # 问答工具
│   ├── types/                   # 类型定义
│   │   └── requests.ts          # 请求和响应类型
│   └── utils/                   # 工具函数
│       ├── config.ts            # 配置管理
│       └── http-client.ts       # HTTP客户端
├── tests/                       # 测试文件
├── dist/                        # 编译输出
└── specs/                       # 需求和设计文档
```

### 开发命令

```bash
# 开发模式运行
npm run dev

# 构建项目
npm run build
```

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- search.test.ts

# 监视模式
npm run test:watch
```

## 故障排除

### 常见错误

1. **配置验证失败**
   ```
   Configuration validation failed: apiKey: Required
   ```
   **解决方案**: 确保设置了`METASO_API_KEY`环境变量

2. **API密钥格式错误**
   ```
   Invalid API key format. Expected format: mk-[32 alphanumeric characters]
   ```
   **解决方案**: 检查API密钥格式是否正确

3. **网络连接错误**
   ```
   Network error: Unable to connect to Metaso API
   ```
   **解决方案**: 检查网络连接和API基础URL设置

### 调试模式

启用调试日志以获取更多信息：

```bash
export METASO_DEBUG=true
```

## 安全性

- 🔐 API密钥通过环境变量安全管理
- 🚫 阻止访问私有IP和localhost
- 📏 查询内容长度限制
- 🔍 URL安全性验证
- 🚨 敏感信息日志屏蔽

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 更新日志

### v1.0.0
- 初始版本发布
- 支持AI搜索、网页读取、AI问答功能
- 完整的MCP协议兼容性
- 安全性和错误处理 