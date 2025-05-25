// 规则集通用配置
const ruleProviderCommon = {
  "type": "http",
  "format": "text",
  "interval": 86400
};

// 策略组通用配置
const groupBaseOption = {
  "interval": 300,
  "url": "http://connectivitycheck.gstatic.com/generate_204",
  "max-failed-times": 3,
};

// 程序入口
function main() {
  // 对于 OpenClash Mihomo 覆写脚本，我们不直接接收和修改原始 config
  // 而是返回一个包含所有要覆写设置的对象
  const overrides = {};

  // 覆盖通用配置
  overrides["mixed-port"] = "7890";
  overrides["tcp-concurrent"] = true;
  overrides["allow-lan"] = true;
  overrides["ipv6"] = false;
  overrides["log-level"] = "info";
  overrides["unified-delay"] = true; // Mihomo 使用 true/false, 非字符串
  overrides["find-process-mode"] = "strict";
  overrides["global-client-fingerprint"] = "chrome";

  // 覆盖 dns 配置
  overrides["dns"] = {
    "enable": true,
    "listen": "0.0.0.0:1053",
    "ipv6": false,
    "enhanced-mode": "fake-ip",
    "fake-ip-range": "198.18.0.1/16",
    "fake-ip-filter": ["*", "+.lan", "+.local", "+.direct", "+.msftconnecttest.com", "+.msftncsi.com"],
    "default-nameserver": ["system"],
    "nameserver": ["223.5.5.5", "119.29.29.29", "180.184.1.1"],
    "nameserver-policy": {
      "geosite:cn": "system",
      "geosite:gfw,geolocation-!cn": ["quic://223.5.5.5", "quic://223.6.6.6", "https://1.12.12.12/dns-query", "https://120.53.53.53/dns-query"]
    }
  };

  // Geodata 部分已移除，将使用 OpenClash 或 Mihomo 的默认 geodata 加载机制
  // 如果您需要在 OpenClash 中自定义 geodata URL，请在 OpenClash 的 UI 设置中进行配置

  // 覆盖 sniffer 配置
  overrides["sniffer"] = {
    "enable": true,
    "parse-pure-ip": true,
    "sniff": { // Mihomo 中此键名为 sniff，原配置结构正确
      "TLS": {
        "ports": ["443", "8443"]
      },
      "HTTP": {
        "ports": ["80", "8080-8880"],
        "override-destination": true
      },
      "QUIC": {
        "ports": ["443", "8443"]
      }
    },
    // Mihomo-alpha (部分新版内核) 可能将 'sniff' 下的规则直接放在 sniffer 下，
    // 并增加 'sniffing' 键替代原 'sniff'。为兼容性，此处保持原结构。
    // 如果遇到问题，可尝试调整为:
    // "sniffing": ["TLS", "HTTP", "QUIC"],
    // "skip-domains": [...],
    // "force-domains": [...]
    // 但通常上述 "sniff": {} 结构在 Mihomo 中是支持的。
  };

  // 覆盖 tun 配置
  overrides["tun"] = {
    "enable": true,
    "stack": "mixed", // "gvisor" (OpenClash 常用), "system", "mixed", "lwip" (旧)
    "dns-hijack": ["any:53"]
    // "auto-route": true, // 可选，让 TUN 自动处理路由
    // "auto-detect-interface": true // 可选，自动检测出口接口
  };

  // 覆盖策略组
  overrides["proxy-groups"] = [
    {
      ...groupBaseOption,
      "name": "手动切换",
      "type": "select",
      "proxies": ["香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true, // 在 Mihomo 中，通常 select 组不直接使用 include-all，而是手动列出
                           // 若要包含所有 proxy-provider 的节点，需配合 `use` 字段指向 provider 或手动添加节点名
                           // 如果 "include-all" 预期是包含所有 proxies 和 proxy-providers 下的节点，
                           // 在 Mihomo 中通常需要脚本动态生成这个列表，或依赖 `use` 字段。
                           // 为保持与原脚本意图，此处保留，但注意其在 Mihomo 中的行为。
      "icon": "https://github.com/clash-verge-rev/clash-verge-rev/raw/main/src-tauri/icons/icon.png"
    },
    {
      ...groupBaseOption,
      "name": "国外网站",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png"
    },
    {
      ...groupBaseOption,
      "name": "国际媒体",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png"
    },
    {
      ...groupBaseOption,
      "name": "苹果服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_1.png"
    },
    {
      ...groupBaseOption,
      "name": "微软服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png"
    },
    {
      ...groupBaseOption,
      "name": "谷歌服务",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google Search.png"
    },
    {
      ...groupBaseOption,
      "name": "电报消息",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png"
    },
    {
      ...groupBaseOption,
      "name": "推特消息",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Twitter.png"
    },
    {
      ...groupBaseOption,
      "name": "AI",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png"
    },
    {
      ...groupBaseOption,
      "name": "游戏平台",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png"
    },
    {
      ...groupBaseOption,
      "name": "Emby",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Emby.png"
    },
    {
      ...groupBaseOption,
      "name": "广告拦截",
      "type": "select",
      "proxies": ["REJECT", "DIRECT"],
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png"
    },
    {
      ...groupBaseOption,
      "name": "兜底分流",
      "type": "select",
      "proxies": ["手动切换", "香港节点", "美国节点", "狮城节点", "日本节点", "DIRECT"],
      "include-all": true,
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
    },
    // 地区分组
    {
      ...groupBaseOption,
      "name": "香港节点",
      "type": "url-test",
      "tolerance": 0, // Mihomo 中，tolerance 建议设置一个实际的值，例如 50 (ms)
      "include-all-proxies": true, // Mihomo 中使用 include-all-proxies
      // "proxies": [], // 如果不使用 include-all-proxies，则需要手动列出或使用 use
      "filter": "(?i)🇭🇰|香港|(\b(HK|Hong)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    },
    {
      ...groupBaseOption,
      "name": "美国节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all-proxies": true,
      "filter": "(?i)🇺🇸|美国|洛杉矶|圣何塞|(\b(US|United States)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
    },
    {
      ...groupBaseOption,
      "name": "狮城节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all-proxies": true,
      "filter": "(?i)🇸🇬|新加坡|狮|(\b(SG|Singapore)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png"
    },
    {
      ...groupBaseOption,
      "name": "日本节点",
      "type": "url-test",
      "tolerance": 0,
      "include-all-proxies": true,
      "filter": "(?i)🇯🇵|日本|东京|(\b(JP|Japan)\b)",
      "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png"
    }
  ];

  // 覆盖规则集
  overrides["rule-providers"] = {
    "AD": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Reject.list",
      "path": "./rules/AD.list" // 在 OpenClash 中，路径通常相对于 /etc/openclash/rules/
    },
    "Apple": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Apple.list",
      "path": "./rules/Apple.list"
    },
    "Google": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Google.list",
      "path": "./rules/Google.list"
    },
    "YouTube": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/YouTube.list",
      "path": "./rules/YouTube.list"
    },
    "Telegram": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Telegram.list",
      "path": "./rules/Telegram.list"
    },
    "Steam": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Steam.list",
      "path": "./rules/Steam.list"
    },
    "Epic": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Epic.list",
      "path": "./rules/Epic.list"
    },
    "AI": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/AI.list",
      "path": "./rules/AI.list"
    },
    "Emby": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Emby.list",
      "path": "./rules/Emby.list"
    },
    "Spotify": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Spotify.list",
      "path": "./rules/Spotify.list"
    },
    "Bahamut": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Bahamut.list",
      "path": "./rules/Bahamut.list"
    },
    "Netflix": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Netflix.list",
      "path": "./rules/Netflix.list"
    },
    "Disney": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Disney.list",
      "path": "./rules/Disney.list"
    },
    "PrimeVideo": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/PrimeVideo.list",
      "path": "./rules/PrimeVideo.list"
    },
    "HBO": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/HBO.list",
      "path": "./rules/HBO.list"
    },
    "OneDrive": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/OneDrive.list",
      "path": "./rules/OneDrive.list"
    },
    "Github": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Github.list",
      "path": "./rules/Github.list"
    },
    "Microsoft": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Microsoft.list",
      "path": "./rules/Microsoft.list"
    },
    "Lan": {
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/Lan.list",
      "path": "./rules/Lan.list"
    },
    "ProxyGFW": { // 注意这个规则集名称，确保与规则部分对应
      ...ruleProviderCommon,
      "behavior": "classical",
      "url": "https://github.com/Acacia415/Tool/raw/X/Clash/Rules/ProxyGFW.list",
      "path": "./rules/ProxyGFW.list"
    }
  };

  // 覆盖规则
  // 注意：Mihomo (Clash Meta) 内核的规则格式与旧版 Clash 不同，
  // 例如，不再有 `RULE-SET`，而是使用 `GEOSITE` 或 `GEOIP` 配合 `no-resolve` (如果需要)
  // 或者直接在 rule-providers 中定义，然后在规则中引用 provider 名称。
  // 为保持与原脚本规则意图接近，这里保留了类似格式，但请注意 Mihomo 的实际行为。
  // 对于 `RULE-SET`，Mihomo 通常期望这些是 rule-provider 的名称。
  // 确保 rule-provider 中的名称与 `RULE-SET` 后面的名称完全一致。
  overrides["rules"] = [
    "DOMAIN-SUFFIX,18comic.vip,香港节点",
    "DOMAIN-SUFFIX,hanime1.me,香港节点",
    "DOMAIN-SUFFIX,yxvm.com,DIRECT",
    "DOMAIN-SUFFIX,nodeseek.com,香港节点",
    "RULE-SET,AD,REJECT", // 'AD' 应该是 rule-providers 中的一个键名
    "GEOIP,private,DIRECT,no-resolve", // 建议为 private IP 添加 no-resolve
    "GEOIP,cn,DIRECT",
    "RULE-SET,Apple,苹果服务",
    "RULE-SET,Twitter,推特消息", // 确保 rule-providers 中有 'Twitter' 或修改此处
    "RULE-SET,Steam,游戏平台",
    "RULE-SET,Epic,游戏平台",
    "GEOSITE,microsoft,微软服务",
    "RULE-SET,OneDrive,微软服务", // 'OneDrive' 应该是 rule-providers 中的键名
    "RULE-SET,Github,微软服务", // 'Github' 应该是 rule-providers 中的键名
    // "RULE-SET,TikTok,国际媒体", // 确保 rule-providers 中有 'TikTok'
    "RULE-SET,YouTube,国际媒体",
    "RULE-SET,Spotify,国际媒体",
    "RULE-SET,Netflix,国际媒体",
    "RULE-SET,Disney,国际媒体",
    "RULE-SET,Bahamut,国际媒体",
    "RULE-SET,HBO,国际媒体",
    // "RULE-SET,Gemini,Gemini", // 确保 rule-providers 中有 'Gemini' 且有名为 'Gemini' 的策略组
    "RULE-SET,AI,AI", // 'AI' 是 rule-providers 的键名，对应策略组 'AI'
    "RULE-SET,Google,谷歌服务",
    "RULE-SET,Telegram,电报消息",
    "GEOSITE,gfw,国外网站", // 'gfw' 是 geosite 的标准代码
    // "RULE-SET,TalkTone,TalkTone", // 确保 rule-providers 和策略组存在
    // "RULE-SET,PayPal,PayPal", // 确保 rule-providers 和策略组存在
    "MATCH,兜底分流"
  ];
  
  // 返回包含所有覆写设置的对象
  return overrides;
}
