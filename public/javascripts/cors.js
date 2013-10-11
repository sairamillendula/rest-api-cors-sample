var div = document.getElementById("status");
var lastSignature = "",
  lastToken = "";

// Create the XHR object.

function createXHR(method, url) {
  var xhr = new XMLHttpRequest();
  if (xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

function generateSignature(callback) {
  var xhr = createXHR('get', '/signature');
  if (!xhr) {
    alert('CORS not supported');
    return;
  }

  xhr.onload = function() {
    var text = xhr.responseText;
    var json = JSON.parse(text);
    if (json.success) {
      // update global variables every time you get a new token and signature.
      lastSignature = json.signature;
      lastToken = json.token;

      callback(json.signature, json.token);

    }else {
      div.innerHTML = "failed to get a signature from Zuora:" + text;
    }

  };

  xhr.onerror = function(error) {
    div.innerHTML = 'Woops, there was an error making the request.' + error;
  };

  try {
    xhr.send();
  } catch (e) {
    alert(e);
  }
}

// Make the actual CORS request.

function makeCorsRequest(signature, token) {
  clearErrorMsg();
  // All HTML5 Rocks properties support CORS.
  //var updateAccountUrl = 'http://leo.bj.zuora.com:8080/rest/v1/accounts/A00000001';
  var postCreditCardURL = 'http://192.168.18.222:8080/apps/v1/payment-methods/credit-cards';

  var xhr = createXHR('post', postCreditCardURL);
  if (!xhr) {
    alert('CORS not supported');
    return;
  }


  // Set Headers
  xhr.setRequestHeader("Accept", "application/json");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("signature", signature);
  xhr.setRequestHeader("token", token);

  xhr.withCredentials = true;

  // Response handlers.
  xhr.onload = function() {
    var text = xhr.responseText;

    if (text) {
      var json = JSON.parse(text);

      if (json.success) {
        // successfully create a credit card
        alert("Woohoo, created a credit card in Zuora, its Zuora internal id: " + json.paymentMethodId);
      } else {
        for (var i in json.reasons) {
          var reason = json.reasons[i];
          var fieldCode = reason.code.toString().substr(4, 2);
          switch (fieldCode) {
            case "01":
              // accountKey
              document.getElementById("accountKeyMsg").innerHTML = reason.message;
              break;
            case "02":
              // creditCardType
              document.getElementById("creditCardTypeMsg").innerHTML = reason.message;
              break;

            case "03":
              // creditCardNumber
              document.getElementById("creditCardNumberMsg").innerHTML = reason.message;
              break;

            case "04":
              // expirationMonth
              document.getElementById("expirationMonthMsg").innerHTML = reason.message;
              break;

            case "05":
              // expirationYear
              document.getElementById("expirationYearMsg").innerHTML = reason.message;
              break;

            case "06":
              // securityCode
              document.getElementById("securityCodeMsg").innerHTML = reason.message;
              break;

            case "07":
              // defaultPaymentMethod
              document.getElementById("defaultPaymentMethodMsg").innerHTML = reason.message;
              break;

            default:
              alert("error:" + reason.message);

          }
        }
      }

      div.innerHTML = text;
    } else
      div.innerHTML = "{}";
  };

  xhr.onerror = function() {
    div.innerHTML = 'Woops, there was an error making the request.';
  };

  //var putAccountData = '{"notes": "changed notes from cors"}';
  var postCreditCard = {
    "accountKey": document.getElementById("accountKey").value,
    "creditCardType": document.getElementById("creditCardType").value,
    "creditCardNumber": document.getElementById("creditCardNumber").value,
    "expirationMonth": document.getElementById("expirationMonth").value,
    "expirationYear": document.getElementById("expirationYear").value,
    "securityCode": document.getElementById("securityCode").value,
    "defaultPaymentMethod": document.getElementById("defaultPaymentMethod").value
  };

  try {
    xhr.send(JSON.stringify(postCreditCard));
  } catch (e) {
    alert(e);
  }
}

function clearErrorMsg() {
  var msgLabels = document.getElementsByTagName("label");
  for (var i in msgLabels) {
    if (msgLabels[i].className == "text-error") {
      msgLabels[i].innerHTML = "";
    }
  }
}

function showCards() {
  var ele = document.getElementById("cardList");
  var xhr = createXHR("get", "/listCards");
  xhr.onload = function (){

    var text = xhr.responseText;
    if (text){
      var json = JSON.parse(text);
      ele.innerHTML = JSON.stringify(json, null, 4);
    }
  };

  xhr.onerror = function (){
    ele.innerHTML = "error happens";
  };

  xhr.send();
}