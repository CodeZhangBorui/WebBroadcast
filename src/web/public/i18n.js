function pagei18n() {
    i18nData = {
        "en-US": {
            "join_a_broadcast": "Join a web broadcast",
            "create_a_broadcast": "Create a new web broadcast"
        },
        "zh-CN": {
            "join_a_broadcast": "加入一个直播",
            "create_a_broadcast": "创建一个直播"
        }
    }
    userLanguage = navigator.language;
    if(i18nData[userLanguage] == undefined) {
        //用户的语言不存在，使用默认英文
        userLanguage = "en-US";
    }
    i18nObject = document.getElementsByTagName('i18n');
    for(i = 0; i < i18nObject.length; i++) {
        if(i18nData[userLanguage][i18nObject[i].id] == undefined) {
            //没有对应翻译
            i18nObject[i].innerText = `i18nError:${i18nObject[i].id}`;
        } else {
            i18nObject[i].innerText = i18nData[userLanguage][i18nObject[i].id];
        }
    }
}