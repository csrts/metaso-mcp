# MCP Server 配置指南

本文档提供了在各种AI IDE工具中配置Metaso MCP Server的详细说明。

## 准备工作

1. **构建项目**
   ```bash
   npm install
   npm run build
   ```

2. **获取绝对路径**
   ```bash
   pwd
   # 记录输出的完整路径，例如：/Users/username/projects/metaso-mcp-server
   ```

3. **设置API密钥**
   - 访问 [Metaso官网](https://metaso.cn) 获取API密钥
   - 格式：`mk-` + 32位字母数字字符

## 配置方法

### 1. Claude Desktop / Cursor / Windsurf, etc.

**配置文件位置**：
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**配置内容**：
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["/Users/username/path/to/metaso-mcp-server/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-YOUR_32_CHARACTER_API_KEY_HERE"
      }
    }
  }
}
```

**Claude Code配置（使用命令）**
```bash
claude mcp add metaso \
  -e "METASO_API_KEY": "mk-YOUR_32_CHARACTER_API_KEY_HERE" \
  -- node /Users/username/path/to/metaso-mcp-server/dist/index.js
```


**步骤**：
1. 替换路径为你的实际项目路径
2. 替换API密钥为你的真实密钥
3. 重启Claude Desktop



### 2. VS Code (通用MCP扩展)

如果使用VS Code的MCP扩展，配置文件通常位于：
- `~/.vscode/mcp-config.json` 或项目根目录下的 `.vscode/mcp.json`

**配置内容**：
```json
{
  "mcpServers": {
    "metaso": {
      "command": "node",
      "args": ["/Users/username/path/to/metaso-mcp-server/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-YOUR_32_CHARACTER_API_KEY_HERE",
        "METASO_BASE_URL": "https://metaso.cn",
        "METASO_TIMEOUT": "30000"
      }
    }
  }
}
```

## 环境变量配置

### 可选环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `METASO_BASE_URL` | `https://metaso.cn` | API基础URL |
| `METASO_TIMEOUT` | `30000` | 请求超时（毫秒） |
| `METASO_DEBUG` | `false` | 调试模式 |

### 系统环境变量设置

**macOS/Linux**：
```bash
export METASO_API_KEY="mk-YOUR_32_CHARACTER_API_KEY_HERE"
export METASO_DEBUG="true"  # 可选，用于调试
```

**Windows**：
```cmd
set METASO_API_KEY=mk-YOUR_32_CHARACTER_API_KEY_HERE
set METASO_DEBUG=true
```

**PowerShell**：
```powershell
$env:METASO_API_KEY="mk-YOUR_32_CHARACTER_API_KEY_HERE"
$env:METASO_DEBUG="true"
```

## 验证配置

### 1. 测试服务器启动

```bash
cd /path/to/metaso-mcp-server
METASO_API_KEY="mk-YOUR_API_KEY" node dist/index.js
```

如果配置正确，应该看到：
```
Metaso MCP Server started successfully
Available tools: metaso_search, metaso_reader, metaso_chat
```

### 2. 检查IDE集成

1. 重启你的AI IDE
2. 检查MCP服务器是否显示在工具列表中
3. 尝试调用 `metaso_search` 工具进行测试

### 3. 测试工具调用

在AI IDE中尝试以下命令：

```
使用metaso_search搜索"人工智能最新发展"
```

或

```
使用metaso_reader读取网页内容：https://example.com
```

## 故障排除

### 常见问题

1. **路径错误**
   - 确保使用绝对路径
   - 检查文件是否存在：`ls -la /path/to/metaso-mcp-server/dist/index.js`

2. **API密钥错误**
   - 确保密钥格式正确：`mk-` + 32位字符
   - 检查密钥是否有效

3. **权限问题**
   - 确保对项目目录有读取权限
   - 检查Node.js是否正确安装：`node --version`

4. **端口冲突**
   - MCP使用stdio通信，通常不会有端口冲突
   - 如果有问题，检查防火墙设置

### 调试方法

启用调试模式：
```json
{
  "env": {
    "METASO_DEBUG": "true"
  }
}
```

查看日志：
- Claude Desktop: 查看控制台日志
- VS Code: 查看输出面板
- 其他IDE: 查看相应的日志面板

## 高级配置

### 自定义超时

```json
{
  "env": {
    "METASO_TIMEOUT": "60000"
  }
}
```

### 使用不同的API端点

```json
{
  "env": {
    "METASO_BASE_URL": "https://api.custom-endpoint.com"
  }
}
```

### 多实例配置

```json
{
  "mcpServers": {
    "metaso-prod": {
      "command": "node",
      "args": ["/Users/username/path/to/metaso-mcp-server/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-PRODUCTION_KEY"
      }
    },
    "metaso-dev": {
      "command": "npx",
      "args": ["-y", "tsx", "/Users/username/path/to/metaso-mcp-server/dist/index.js"],
      "env": {
        "METASO_API_KEY": "mk-DEVELOPMENT_KEY",
        "METASO_DEBUG": "true"
      }
    }
  }
}
```

这样你就可以同时使用生产和开发版本的MCP服务器了。 