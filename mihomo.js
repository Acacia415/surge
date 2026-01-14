// 通用配置
const ruleProviderCommon = {
    "type": "http",
    "format": "text",
    "behavior": "classical",
    "interval": 86400 // 24小时更新一次
};

// 自动测速策略组的通用配置
const groupBaseOption = {
    "interval": 600, // 10分钟测速一次
    "url": "http://cp.cloudflare.com/generate_204",
    "tolerance": 50,
};

// --- 主函数 ---

function main(config) {
    // 检查配置文件中是否存在代理节点
    const proxyCount = config?.proxies?.length ?? 0;
    const proxyProviderCount =
        typeof config?.["proxy-providers"] === "object" ? Object.keys(config["proxy-providers"]).length : 0;
    if (proxyCount === 0 && proxyProviderCount === 0) {
        throw new Error("配置文件中未找到任何代理或代理提供者。");
    }

    // 获取所有手动添加的代理节点名称
    const allProxyNames = (config.proxies || []).map(p => p.name);

    // --- 1. 设置基础配置 ---
    setBaseConfig(config);

    // --- 2. 创建代理组 ---
    config["proxy-groups"] = createProxyGroups(allProxyNames);

    // --- 3. 创建规则提供者 ---
    config["rule-providers"] = createRuleProviders();

    // --- 4. 创建分流规则 ---
    config["rules"] = createRules();

    return config;
}

/**
 * 设置通用的基础配置
 * @param {object} config - Clash 配置对象
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
        "fake-ip-filter": ['*', '+.lan', '+.local', '+.direct', '+.msftconnecttest.com', '+.msftncsi.com'],
        "nameserver": ["223.5.5.5", "8.8.8.8"]
    };

    config["sniffer"] = {
        "enable": true,
        "sniff": {
            "HTTP": { "ports": [80], "override-destination": true },
            "TLS": { "ports": [443, 8443] },
            "QUIC": { "ports": [443, 8443] }
        }
    };

    config["tun"] = { "enable": true, "stack": "mixed", "dns-hijack": ["any:53"] };
}

/**
 * 创建所有的代理组
 * @param {string[]} allProxyNames - 从配置文件中读取的所有代理节点名称
 * @returns {object[]} 代理组配置数组
 */
function createProxyGroups(allProxyNames) {
    const regionNodes = ['香港节点', '美国节点', '狮城节点', '日本节点'];

    // 为 “手动切换” 组定制的代理列表，不包含它自己，以避免循环引用
    const manualSelectProxies = ['DIRECT', ...regionNodes, ...allProxyNames];
    
    // 为其他所有策略组准备的通用代理列表，包含 “手动切换” 选项
    const commonProxies = ['DIRECT', '手动切换', ...regionNodes, ...allProxyNames];

    // 数据驱动：定义所有 select 类型的策略组
    const selectGroupsData = [
        { name: "手动切换", icon: "https://github.com/shindgewongxj/WHATSINStash/raw/main/icon/applesafari.png" },
        { name: "国外网站", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Global.png" },
        { name: "国际媒体", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png" },
        { name: "微软服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png" },
        { name: "Apple服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple.png" },
        { name: "谷歌服务", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png" },
        { name: "电报消息", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png" },
        { name: "TikTok", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png" },
        { name: "AI", icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/OpenAI.png" },
        { name: "Steam", icon: "https://raw.githubusercontent.com/Orz-3/mini/master/Color/Steam.png" },
        { name: "PayPal", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/PayPal.png" },
        { name: "兜底分流", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png" }
    ];

    // 动态生成 select 组，并根据组名决定使用哪个代理列表
    const selectGroups = selectGroupsData.map(group => {
        const isManualSelectGroup = group.name === "手动切换";
        return {
            "name": group.name,
            "type": "select",
            // 如果是 “手动切换” 组，使用不包含自身的代理列表，否则使用通用列表
            "proxies": isManualSelectGroup ? manualSelectProxies : commonProxies,
            "icon": group.icon
        };
    });

    // 数据驱动：定义所有 url-test 类型的策略组
    const urlTestGroupsData = [
        { name: "香港节点", filter: "^(?=.*(🇭🇰|香港|HK|Hong))(?!.*(Ali-HK|GGY-HK)).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png" },
        { name: "美国节点", filter: "^(?=.*(🇺🇸|美国|LA|SJC|ASB|SEA|US|United States))(?!.*(Alpha)).*$", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png" },
        { name: "狮城节点", filter: "(?i)🇸🇬|新加坡|SG", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png" },
        { name: "日本节点", filter: "(?i)🇯🇵|日本|JP", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png" },
        { name: "欧洲节点", filter: "(?i)🇺🇸|NL|AU|FRA|NBG", icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Europe_Map.png" },
    ];

    // 动态生成 url-test 组
    const urlTestGroups = urlTestGroupsData.map(group => ({
        ...groupBaseOption,
        "name": group.name,
        "type": "url-test",
        "include-all": true,
        "filter": group.filter,
        "icon": group.icon
    }));

    // 将所有代理组按正确顺序组合
    // 找到 "PayPal" 组的位置，在其后插入测速组
    const payPalIndex = selectGroups.findIndex(group => group.name === "PayPal");
    const finalGroups = [
        ...selectGroups.slice(0, payPalIndex + 1), // "手动切换" 到 "PayPal"
        ...urlTestGroups,                          // "香港节点", "美国节点" 等
        ...selectGroups.slice(payPalIndex + 1)     // 剩余的组，即 "兜底分流"
    ];

    return finalGroups;
}

/**
 * 创建所有的规则提供者
 * @returns {object} 规则提供者配置对象
 */
function createRuleProviders() {
    const rulesBaseUrl = "https://raw.githubusercontent.com/Acacia415/Tool/X/mihomo/Rules/";
    const providerData = {
        "AD": `${rulesBaseUrl}Reject.list`,
        "YouTube": `${rulesBaseUrl}YouTube.list`,
        "Google": `${rulesBaseUrl}Google.list`,
        "Telegram": `${rulesBaseUrl}Telegram.list`,
        "AI": `${rulesBaseUrl}AI.list`,
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
 * @returns {string[]} 规则数组
 */
function createRules() {
    return [
        // --- 自定义规则 ---
        "DOMAIN-SUFFIX,copilot.microsoft.com,微软服务",
        "DOMAIN-SUFFIX,copilot.github.com,微软服务",
        "DOMAIN-SUFFIX,bing.com,DIRECT",
        "DOMAIN-SUFFIX,yxvm.com,DIRECT",
        "DOMAIN-SUFFIX,vps.hosting,DIRECT",
        "DOMAIN-SUFFIX,18comic.vip,香港节点",
        "DOMAIN-SUFFIX,hanime1.me,香港节点",
        "DOMAIN-SUFFIX,nodeseek.com,美国节点",

        // --- 规则集 ---
        "RULE-SET,AD,REJECT",
        "RULE-SET,Apple服务,Apple服务",
        "RULE-SET,TikTok,国际媒体",
        "RULE-SET,YouTube,国际媒体",
        "RULE-SET,AI,AI",
        "RULE-SET,Google,谷歌服务",
        "RULE-SET,Telegram,电报消息",
        "RULE-SET,Steam,Steam",
        "RULE-SET,PayPal,PayPal",

        // --- GEO 规则 ---
        "GEOIP,private,DIRECT", // 私有地址直连
        "GEOIP,cn,DIRECT",      // 国内 IP 直连

        // 需要走代理的微软服务
        "GEOSITE,github,微软服务",
        "GEOSITE,onedrive,微软服务",
        "GEOSITE,azure,微软服务", 
        // 剩余的其他微软服务直连
        "GEOSITE,microsoft,DIRECT", 

        "GEOSITE,gfw,国外网站", // 被墙的网站走代理

        // --- 兜底规则 ---
        "MATCH,兜底分流"
    ];
}
