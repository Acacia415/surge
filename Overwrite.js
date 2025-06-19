// 参考 Verge Rev 示例 Script 配置
//
// Clash Verge Rev (Version ≥ 17.2) & Mihomo-Party (Version ≥ 0.5.8)
//
// 最后更新时间: 2025-06-19 01:05 (由 Gemini AI 生成)

// 规则集通用配置
const ruleProviderCommon = {
    "type": "http",
    "format": "text",
    "behavior": "classical", // 从您的配置锚点 &c 推断
    "interval": 86400
};
 
// 策略组通用配置
const groupBaseOption = {
    "interval": 300,
    "url": "http://1.1.1.1/generate_204", // 沿用您的 url-test 和 fallback 配置
    "tolerance": 0, // 沿用您的 url-test 配置
};
 
// 程序入口
function main(config) {
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
      typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
    if (proxyCount === 0 && proxyProviderCount === 0) {
      throw new Error("配置文件中未找到任何代理");
    }
 
    // 覆盖通用配置 (基于您的原始配置)
    config["mixed-port"] = 7893;
    config["tcp-concurrent"] = true;
    config["allow-lan"] = true;
    config["ipv6"] = false;
    config["log-level"] = "info";
    config["unified-delay"] = true;
    config["find-process-mode"] = "strict";
    config["global-client-fingerprint"] = "chrome";

    // 覆盖 GeoX URL 配置
    config["geox-url"] = {
        "geoip": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/geoip.dat",
        "geosite": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
        "mmdb": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb",
        "asn": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/GeoLite2-ASN.mmdb"
    };

    // 覆盖 profile 配置
    config["profile"] = { "store-selected": true, "store-fake-ip": false };
 
    // 覆盖 dns 配置 (基于您的原始配置)
    config["dns"] = {
      "enable": true,
      "listen": ":1053",
      "ipv6": false,
      "enhanced-mode": "fake-ip",
      "fake-ip-range": "198.18.0.1/16",
      "fake-ip-filter": ['*', '+.lan', '+.local', '+.direct', '+.msftconnecttest.com', '+.msftncsi.com'],
      "nameserver": ["223.5.5.5", "8.8.8.8"]
    };
 
    // 覆盖 sniffer 配置 (基于您的原始配置)
    config["sniffer"] = {
      "enable": true,
      "sniff": {
        "HTTP": {
          "ports": [80],
          "override-destination": true
        },
        "TLS": {
          "ports": [443, 8443]
        },
        "QUIC": {
          "ports": [443, 8443]
        }
      }
    };
 
    // 覆盖 tun 配置 (基于您的原始配置)
    config["tun"] = {
      "enable": true,
      "stack": "mixed",
      "dns-hijack": ["any:53"]
    };
 
    // 覆盖策略组 (基于您的原始配置)
    config["proxy-groups"] = [
      {
        "name": "手动切换",
        "type": "select",
        "include-all": true,
        "proxies": ["DIRECT"],
        "icon": "https://github.com/shindgewongxj/WHATSINStash/raw/main/icon/applesafari.png"
      },
      {
        "name": "国外网站",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png"
      },
      {
        "name": "国际媒体",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png"
      },
      {
        "name": "微软服务",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png"
      },
      {
        "name": "谷歌服务",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google Search.png"
      },
      {
        "name": "电报消息",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png"
      },
      {
        "name": "TikTok",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png"
      },
      {
        "name": "Gemini",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Prince671/Gemini/main/gemini_icon.png"
      },
      {
        "name": "AI",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png"
      },
      {
        "name": "TalkTone",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Orz-3/mini/master/Color/QQ.png"
      },
      {
        "name": "PayPal",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/PayPal.png"
      },
      {
        ...groupBaseOption,
        "name": "香港节点",
        "type": "url-test",
        "include-all": true,
        "filter": "(?i)🇭🇰|香港|HK|(\\b(HK|Hong)\\b)",
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
      },
      {
        ...groupBaseOption,
        "name": "美国节点",
        "type": "url-test",
        "include-all": true,
        "filter": "(?i)🇺🇸|美国|LA|SJC|(\\b(US|United States)\\b)",
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png"
      },
      {
        "name": "兜底分流",
        "type": "select",
        "include-all": true,
        "proxies": ["手动切换", "DIRECT"],
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png"
      }
    ];
 
    // 覆盖规则集 (基于您的原始配置)
    config["rule-providers"] = {
      "AD": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Reject.list",
        "path": "./rules/AD.list"
      },
      "YouTube": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/YouTube.list",
        "path": "./rules/YouTube.list"
      },
      "Google": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Google.list",
        "path": "./rules/Google.list"
      },
      "Telegram": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/Telegram.list",
        "path": "./rules/Telegram.list"
      },
      "Gemini": {
        ...ruleProviderCommon,
        "url": "https://github.com/blackmatrix7/ios_rule_script/raw/master/rule/Clash/Gemini/Gemini.list",
        "path": "./rules/Gemini.list"
      },
      "AI": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/AI.list",
        "path": "./rules/AI.list"
      },
      "TikTok": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/TikTok.list",
        "path": "./rules/TikTok.list"
      },
      "TalkTone": {
        ...ruleProviderCommon,
        "url": "https://github.com/Acacia415/surge/raw/main/TalkaTone.list",
        "path": "./rules/TalkTone.list"
      },
      "PayPal": {
        ...ruleProviderCommon,
        "url": "https://github.com/Repcz/Tool/raw/X/Clash/Rules/PayPal.list",
        "path": "./rules/PayPal.list"
      }
    };
 
    // 覆盖规则 (基于您的原始配置)
    config["rules"] = [
      "DOMAIN-SUFFIX,18comic.vip,香港节点",
      "DOMAIN-SUFFIX,hanime1.me,香港节点",
      "DOMAIN-SUFFIX,yxvm.com,DIRECT",
      "DOMAIN-SUFFIX,nodeseek.com,香港节点",
      "RULE-SET,AD,REJECT",
      "GEOIP,private,DIRECT",
      "GEOIP,cn,DIRECT",
      "GEOSITE,microsoft,微软服务",
      "GEOSITE,onedrive,微软服务",
      "GEOSITE,github,微软服务",
      "RULE-SET,TikTok,国际媒体",
      "RULE-SET,YouTube,国际媒体",
      "RULE-SET,Gemini,Gemini",
      "RULE-SET,AI,AI",
      "RULE-SET,Google,谷歌服务",
      "RULE-SET,Telegram,电报消息",
      "GEOSITE,gfw,国外网站",
      "RULE-SET,TalkTone,TalkTone",
      "RULE-SET,PayPal,PayPal",
      "MATCH,兜底分流"
    ];
 
    // 返回修改后的配置
    return config;
}
