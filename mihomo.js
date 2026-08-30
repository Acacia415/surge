// 通用配置
const ruleProviderCommon = {
    "type": "http",
    "format": "text",
    "behavior": "classical",
    "interval": 86400 
};

// 自动测速策略组的通用配置
const groupBaseOption = {
  interval: 300,
  url: "https://cp.cloudflare.com",
  tolerance: 50,
  timeout: 12000,
  lazy: true,
  //"expected-status": 204,
};

// 手动选择策略组的通用测速配置
const selectGroupBaseOption = {
  url: "https://cp.cloudflare.com",
  timeout: 12000,
  lazy: true,
};

// --- 主函数 ---

function main(config) {
    if (!config.proxies) config.proxies = [];

    // --- 1. 处理代理链节点 (数组遍历法) ---
    // 【核心修改】：在这里统一定义你的代理链配置。以后想加几条就写几行！
    // target: 你要找的原始落地节点名称包含的关键字
    // newName: 生成的新代理链节点名称（强烈建议保留 "-Chained" 后缀防环路）
    // dialer: 你的前置跳板节点名称
    const chainConfigs = [
      // { target: "Boil-HKT", newName: "Boil-HKT-Chained", dialer: "RFC-HK" },
        { target: "Halo-SG", newName: "Halo-SG-Chained", dialer: "RFC-HK" },
        { target: "Green-SG", newName: "Green-SG-Chained", dialer: "RFC-HK" },
        { target: "Zouter-SG", newName: "Zouter-SG-Chained", dialer: "RFC-HK" },
        // { target: "美国-ATT", newName: "美国-ATT-Chained", dialer: "DMIT-LA" },
        // 示例：如果你想加一条美国的代理链，取消下面这行的注释并修改即可
        // { target: "US-Node", newName: "US-Node-Chained", dialer: "Japan-Relay" }
    ];
    
    // 自动遍历生成所有代理链
    chainConfigs.forEach(cfg => {
        const originalNode = config.proxies.find(p => p.name.includes(cfg.target));
        if (originalNode) {
            // 通过深拷贝，克隆出一个完全独立的全新节点，不破坏原节点
            const chainedNode = JSON.parse(JSON.stringify(originalNode));
            chainedNode.name = cfg.newName;
            chainedNode["dialer-proxy"] = cfg.dialer; 
            
            // 将新创建的代理链节点推入 proxies 列表
            config.proxies.push(chainedNode);
            console.log(`代理链节点 [${cfg.newName}] 创建成功并已推入列表`);
        } else {
            console.log(`未找到匹配 [${cfg.target}] 的原始节点，跳过创建`);
        }
    });

    // 检查配置文件中是否存在代理节点
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
        typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
    
    if (proxyCount === 0 && proxyProviderCount === 0) {
        throw new Error("配置文件中未找到任何代理或代理提供者。");
    }

    // 获取所有代理节点名称 (包含了刚刚 push 进去的所有 Chained 节点)
    const allProxyNames = (config.proxies || []).map(p => p.name);

    // --- 2. 设置基础配置 ---
    setBaseConfig(config);

    // --- 3. 创建代理组 ---
    config["proxy-groups"] = createProxyGroups(allProxyNames);

    // --- 4. 创建规则提供者 ---
    config["rule-providers"] = createRuleProviders();

    // --- 5. 创建分流规则 ---
    config["rules"] = createRules();

    return config;
}

/**
 * 设置通用的基础配置
 */
function setBaseConfig(config) {
    config['proxy-provider-compatibility'] = true;
    config["mixed-port"] = 7893;
    config["tcp-concurrent"] = true;
    config["allow-lan"] = true;
    config["ipv6"] = false;
    config["log-level"] = "info";
    config["unified-delay"] = true;
    config["find-process-mode"] = "strict";
    config["global-client-fingerprint"] = "chrome";
    config["profile"] = { "store-selected": true, "store-fake-ip": false };

    config["geox-url"] = {
        "geoip": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/geoip.dat",
        "geosite": "https://mirror.ghproxy.com/https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
        "mmdb": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/Country.mmdb",
        "asn": "https://mirror.ghproxy.com/https://raw.githubusercontent.com/Loyalsoldier/geoip/release/GeoLite2-ASN.mmdb"
    };

    config["dns"] = {
        "enable": true,
        "listen": ":1053",
        "ipv6": false,
        "enhanced-mode": "fake-ip",
        "fake-ip-range": "198.18.0.1/16",
        "fake-ip-filter": [
            '*',
            '+.lan',
            '+.local',
            '+.direct',
            '+.msftconnecttest.com',
            '+.msftncsi.com'
        ],
        "default-nameserver": [
            "223.5.5.5",
            "8.8.8.8"
        ],
        "proxy-server-nameserver": [
            "223.5.5.5",
            "8.8.8.8"
        ],
        "nameserver": [
            "223.5.5.5",
            "119.29.29.29"
        ]
    };

    config["sniffer"] = {
        "enable": true,
        "sniff": {
            "HTTP": { "ports": [80], "override-destination": true },
            "TLS": { "ports": [443, 8443] },
            "QUIC": { "ports": [443, 8443] }
        }
    };

    config["tun"] = {
        "enable": true,
        "stack": "mixed",
        "dns-hijack": ["any:53"]
    };
}

/**
 * 创建所有的代理组
 */
function createProxyGroups(allProxyNames) {
    const regionNodes = ['香港节点', '美国节点', '狮城节点', '日本节点', '荷兰节点'];

    const manualSelectProxies = ['DIRECT', ...regionNodes, ...allProxyNames];
    const commonProxies = ['DIRECT', '手动切换', ...regionNodes, ...allProxyNames];
    const geminiProxies = [
        '狮城节点',
        '手动切换',
        ...regionNodes.filter(name => name !== '狮城节点'),
        ...allProxyNames,
        'DIRECT'
    ];

    const selectGroupsData = [
        { name: "手动切换", icon: "https://github.com/shindgewongxj/WHATSINStash/raw/main/icon/applesafari.png" },
        { name: "国外网站", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png" },
        { name: "国际媒体", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
        { name: "微软服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png" },
        { name: "Apple服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png" },
        { name: "谷歌服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png" },
        { name: "Gemini", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png" },
        { name: "电报消息", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
        { name: "TikTok", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png" },
        { name: "AI", icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png" },
        { name: "Steam", icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Steam.png" },
        { name: "PayPal", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/PayPal.png" },
        { name: "兜底分流", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png" }
    ];

    const selectGroups = selectGroupsData.map(group => {
        const isManualSelectGroup = group.name === "手动切换";
        const isGeminiGroup = group.name === "Gemini";
        const proxies = isManualSelectGroup
            ? manualSelectProxies
            : isGeminiGroup
                ? geminiProxies
                : commonProxies;
        return {
            ...selectGroupBaseOption,
            "name": group.name,
            "type": "select",
            "proxies": proxies,
            "icon": group.icon
        };
    });

    // -------- 香港节点：改为 fallback，并允许手动指定优先顺序 --------
    // 这里放“额外允许加入香港组”的特殊节点，例如代理链节点
    const hkExtraNodes = [
        // "Boil-HKT-Chained",
    ];

    // 香港候选节点：
    // 1. 常规香港节点（排除 GGY-HK 和其它 Chained）
    // 2. 额外手动加入的节点（如 Boil-HKT-Chained）
    const hkCandidates = allProxyNames.filter(name =>
        (
            /(?:🇭🇰|香港|HK|Hong)/i.test(name) &&
            !/GGY-HK/i.test(name)
        ) ||
        hkExtraNodes.includes(name)
    );

    // 这里的顺序，就是 fallback 的优先顺序
    // 写在前面的优先使用，没写的节点自动排在后面
    const hkPriorityKeywords = [
        "LALA-Boil-HKT",
        "RFC-Boil-HKT",
        "RFC-HK",
    ];

    const hkPreferred = hkPriorityKeywords.flatMap(keyword =>
        hkCandidates.filter(name => name.includes(keyword))
    );

    const hkOthers = hkCandidates.filter(name =>
        !hkPriorityKeywords.some(keyword => name.includes(keyword))
    );

    const hkFallbackProxies = [...new Set([
        ...hkPreferred,
        ...hkOthers
    ])];

    const hkFallbackGroup = {
        "name": "香港节点",
        "type": "fallback",
        "proxies": hkFallbackProxies.length ? hkFallbackProxies : ["DIRECT"],
        "url": "https://cp.cloudflare.com",
        "interval": 180,
        "lazy": true,
        "timeout": 10000,
        "max-failed-times": 3,
        // "expected-status": 204,
        "icon": "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png"
    };

    // -------- 其它地区仍保持 url-test --------
    const urlTestGroupsData = [
        { name: "美国节点", filter: "^(?=.*(🇺🇸|美国|LA|SJC|ASB|SEA|US|United States))(?!.*(Alpha|HKT|Chained)).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png" },
        { name: "狮城节点", filter: "(?i)(🇸🇬|新加坡|SG).*Chained", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png" },
        { name: "日本节点", filter: "(?i)(🇯🇵|日本|JP)(?!.*Chained)", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png" },
        { name: "荷兰节点", filter: "(?i)(🇳🇱|荷兰|NL|Netherlands)(?!.*Chained)", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Europe_Map.png" },
        { name: "欧洲节点", filter: "(?i)(FRA|NBG)(?!.*Chained)", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Europe_Map.png" },
    ];

    const urlTestGroups = urlTestGroupsData.map(group => ({
        ...groupBaseOption,
        "name": group.name,
        "type": "url-test",
        "include-all": true,
        "filter": group.filter,
        "icon": group.icon
    }));

    const payPalIndex = selectGroups.findIndex(group => group.name === "PayPal");
    const finalGroups = [
        ...selectGroups.slice(0, payPalIndex + 1),
        hkFallbackGroup,
        ...urlTestGroups,
        ...selectGroups.slice(payPalIndex + 1)
    ];

    return finalGroups;
}

/**
 * 创建所有的规则提供者
 */
function createRuleProviders() {
    const rulesBaseUrl = "https://raw.githubusercontent.com/Acacia415/Tool/X/mihomo/Rules/";
    const customAiRulesBaseUrl = "https://raw.githubusercontent.com/Acacia415/surge/main/";
    const providerData = {
        "AD": `${rulesBaseUrl}Reject.list`,
        "YouTube": `${rulesBaseUrl}YouTube.list`,
        "Google": `${customAiRulesBaseUrl}Google.list`,
        "Gemini": `${customAiRulesBaseUrl}Gemini.list`,
        "Telegram": `${rulesBaseUrl}Telegram.list`,
        "AI": `${customAiRulesBaseUrl}AI.list`,
        "TikTok": `${rulesBaseUrl}TikTok.list`,
        "PayPal": `${rulesBaseUrl}PayPal.list`,
        "Steam": `${rulesBaseUrl}Steam.list`,
        "Apple服务": `${rulesBaseUrl}Apple.list`,
    };

    const providers = {};
    for (const name in providerData) {
        providers[name] = {
            ...ruleProviderCommon,
            "url": providerData[name],
            "path": `./rules/${name}.list`
        };
    }
    return providers;
}

/**
 * 创建所有的分流规则
 */
function createRules() {
    return [  
        "DOMAIN-SUFFIX,okex.com,狮城节点",
        "DOMAIN-SUFFIX,oklink.com,狮城节点",
        "DOMAIN-SUFFIX,okx.com,狮城节点",
        
        "DOMAIN-SUFFIX,tech26.de,欧洲节点",
        "DOMAIN-SUFFIX,n26.com,欧洲节点",
        "DOMAIN-SUFFIX,number26.de,欧洲节点",
        "DOMAIN-KEYWORD,n26,欧洲节点",
        "DOMAIN-KEYWORD,number26,欧洲节点",
        "DOMAIN-KEYWORD,tech26,欧洲节点",
        
        "DOMAIN-SUFFIX,copilot.microsoft.com,微软服务",
        "DOMAIN-SUFFIX,copilot.github.com,微软服务",
        "DOMAIN-SUFFIX,bing.com,DIRECT",
        "DOMAIN-SUFFIX,yxvm.com,DIRECT",
        "DOMAIN-SUFFIX,vps.hosting,DIRECT",
        "DOMAIN-SUFFIX,18comic.vip,香港节点",
        "DOMAIN-SUFFIX,hanime1.me,香港节点",
        "DOMAIN-SUFFIX,nodeseek.com,香港节点",

        // --- 规则集 ---
        "RULE-SET,AD,REJECT",
        "RULE-SET,Apple服务,Apple服务",
        "RULE-SET,TikTok,国际媒体",
        "RULE-SET,YouTube,国际媒体",
        "RULE-SET,Gemini,Gemini",
        "RULE-SET,AI,AI",
        "RULE-SET,Google,谷歌服务",
        "RULE-SET,Telegram,电报消息",
        "RULE-SET,Steam,Steam",
        "RULE-SET,PayPal,PayPal",

        "GEOIP,private,DIRECT",
        "GEOIP,cn,DIRECT",

        "GEOSITE,github,微软服务",
        "GEOSITE,onedrive,微软服务",
        "GEOSITE,azure,微软服务", 
        "GEOSITE,microsoft,DIRECT", 

        "GEOSITE,gfw,国外网站",

        "MATCH,兜底分流"
    ];
}

