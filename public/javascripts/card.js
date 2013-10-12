function CardCtrl($scope) {

	$scope.card = {
    "accountId": 1,
		"accountKey": "A00000001",
		"creditCardType": "Visa",
		"creditCardNumber": "4111111111111111",
		"expirationMonth": "10",
		"expirationYear": "2015",
		"securityCode": "111",
		"defaultPaymentMethod": true
	};

  $scope.years = ["2013", "2014", "2015", "2016", "2017", "2018", "2019"];
  $scope.monthes = ["1","2","3","4","5","6","7","8","9","10","11","12"];

  $scope.makeCorsRequest = function() {
    generateSignature($scope.card.accountId, callZuora);
  };

  function callZuora(data) {
    if (!data.success){
      showError("Zuora responds failure when creating signature:" + JSON.stringify(data));
      return;
    }

    $.ajax({
      
      type: 'POST',
      
      url: 'https://apisandbox-api.zuora.com/rest/v1/payment-methods/credit-cards',
      
      contentType: "application/json",

      dataType: 'json',
      
      xhrFields: {
        withCredentials: true
      },
      
      headers: {
        token: data.token,
        signature: data.signature
      },

      data: JSON.stringify(cloneCard($scope.card)),

      success: function(data) {
        showError(JSON.stringify(data));
      },

      error: function() {
        showError("failed to call zuora REST API");
      }
    });
  };

  function cloneCard(card) {
    var newCard = $.extend({}, card);
    delete newCard.accountId;
    return newCard;
  }

  function generateSignature(accountId, callback) {
    $.get("/signature/" + accountId)
      .done(callback)
      .fail(function(){
        showError("failed to generate signature.");
      })
  };

  function showError(msg){
    alert(msg);
  };
}