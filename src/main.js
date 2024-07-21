var lang = require("./lang.js");

function supportLanguages() {
  return lang.supportLanguages.map(([standardLang]) => standardLang);
}

function translate(query, completion) {
  const { text, detectFrom, detectTo } = query;
  const apiKey = $option.apiKey;
  const model = $option.model;

  if (!apiKey) {
    completion({
      error: {
        type: "secretKey",
        message: "请先设置 API Key",
        addtion: "请在插件配置中填写正确的 DeepSeek API Key",
      },
    });
    return;
  }

  const body = {
    messages: [
      {
        content:
          "You are a translation engine that can only translate text and cannot interpret it.",
        role: "system",
      },
      {
        content: `Translate the following text from ${detectFrom} to ${detectTo}: ${text}`,
        role: "user",
      },
    ],
    model: model,
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false,
  };

  (async () => {
    try {
      const resp = await $http.request({
        method: "POST",
        url: "https://api.deepseek.com/chat/completions",
        header: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: body,
      });

      if (resp.error) {
        completion({
          error: {
            type: "api",
            message: "接口请求错误",
            addition: JSON.stringify(resp.error),
          },
        });
      } else {
        const translatedText = resp.data.choices[0].message.content.trim();
        completion({
          result: {
            from: detectFrom,
            to: detectTo,
            toParagraphs: [translatedText],
          },
        });
      }
    } catch (e) {
      completion({
        error: {
          type: "unknown",
          message: "插件出错",
          addition: e.toString(),
        },
      });
    }
  })();
}

function pluginTimeoutInterval() {
  return 60;
}

function pluginValidate(completion) {
  const apiKey = $option.apiKey;
  if (!apiKey) {
    completion({
      result: false,
      error: {
        type: "secretKey",
        message: "请先设置 API Key",
        addition: "请在插件配置中填写正确的 DeepSeek API Key",
      },
    });
  } else {
    completion({ result: true });
  }
}

exports.supportLanguages = supportLanguages;
exports.translate = translate;
exports.pluginTimeoutInterval = pluginTimeoutInterval;
exports.pluginValidate = pluginValidate;
