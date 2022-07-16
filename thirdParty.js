// ====================================================================
// TODO 
// --------------------------------------------------------------------
//
// Send PostMessage, but need to wait until they respond to send off 
// to my api.
// 
// ====================================================================

let card = null;
let cvv = null;
let cardFrame = null;
let cvvFrame = null;
let appConfig = {};
let appData = {};

const ThirdParty = {
    setupForm: function (config) {
        appConfig = config;
        card = document.getElementById(appConfig.cardElement);
        cvv = document.getElementById(appConfig.cvvElement);

        card.innerHTML = `<iframe id="cardFrame" src="thirdParty_card.html" style="border:none;" />`;
        cvv.innerHTML = `<iframe id="cvvFrame" src="thirdParty_cvv.html" style="border:none;" />`;
    },
    createCard: function (formData) {
        appData = formData;
        cardFrame = document.getElementById("cardFrame").contentWindow;
        cardFrame.postMessage(`CardSendValue::`, '*');

        cvvFrame = document.getElementById("cvvFrame").contentWindow;
        cvvFrame.postMessage(`CvvSendValue::`, '*');
    },
    onCompleted: function (callback) {
        window.addEventListener('completed', callback, false);
    }
}

function submit() {
    const event = new CustomEvent('completed', {
        detail: appData
    });
    window.dispatchEvent(event);
}

window.addEventListener("message", (event) => {
    if (event.origin !== 'http://localhost:5500') return;

    let [command, data] = event.data.split("::");
    if (command == null) {
        command = event.data;
    }
    if (data != '' && data != undefined) {
        try {
            data = JSON.parse(data);
        } catch (error) {}
    } else {
        data = {};
    }

    switch(command) {
        case "CardFrameLoaded":
            cardFrame = document.getElementById("cardFrame").contentWindow;
            cardFrame.postMessage(`CardSetStyle::${appConfig.cardStyle}`, '*');
            break;

        case "CvvFrameLoaded": 
            cvvFrame = document.getElementById("cvvFrame").contentWindow;
            cvvFrame.postMessage(`CvvSetStyle::${appConfig.cvvStyle}`, '*');
            break;

        case "CvvFrameValue":
            appData["cvv"] = data;
            if (appData.hasOwnProperty("card")) {
                submit();
            }
            break;

        case "CardFrameValue":
            appData["card"] = data;
            if (appData.hasOwnProperty("cvv")) {
                submit();
            }
            break;
    }
}, false);