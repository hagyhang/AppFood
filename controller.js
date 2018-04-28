var app = angular.module("mainApp", ["ngRoute"]);
app.config(($routeProvider)=>{
	$routeProvider
	.when("/", {
		templateUrl : "Login.html"
	})
	.when("/dashboard", {
		templateUrl : "Dashboard.html"
	})
	.when("/food/:id", {
		templateUrl : "food.html"
	})
	.when("/admin", {
		templateUrl : "admin.html"
	})
	.when("/add-food", {
		templateUrl : "add-food.html"
	})
	.otherwise({
		redirectTo: "/"
	});
});
var token, config;
function ConfigToken(){
	if(window.localStorage.getItem("FOOD_TOKEN") == null) return null;
	return {
		headers : {
			Token: window.localStorage.getItem("FOOD_TOKEN")
		}
	}
}
app.controller("loginCtrl", ($scope, $location, $http)=>{
	let token = ConfigToken();
	if (token != null){
		console.log("t " + token);
		$location.path('/dashboard');
	}
	$scope.submit = ()=>{
		// console.log($scope.name + " " + $scope.pass);
		let data = {
			"email" : 'phananh123qqq@gmail.com',//$scope.name
			"password" : '123123qqq'//$scope.pass
		}
		$http.post("https://cookbook-server.herokuapp.com/users/sign_in/", data).then((res)=>{
			var data = res.data;
			if (data.success == true)
			{
				token = data.results.token;
				$location.path('/dashboard');
				window.localStorage.setItem("FOOD_TOKEN", token);
			}
		})
	}
})
app.controller("dashCtrl", ($scope, $location, $http)=>{

	$http.get("https://cookbook-server.herokuapp.com/category", ConfigToken()).then((res)=>{
		var data = res.data;
		if (data.success == true){
			$scope.categories = data.results;
			$http.get("https://cookbook-server.herokuapp.com/food/" + $scope.categories[0]._id, ConfigToken()).then((res)=>{
				var data = res.data;
				if (data.success == true){
					$scope.foods = data.results;
				}
				else {
					$location.path("/");
				}
			})
		}
	})

	$scope.CateSelected = ($event)=>{
		var i = $event.srcElement.attributes.stt.nodeValue;
		var key = $scope.categories[i]._id;
		$http.get("https://cookbook-server.herokuapp.com/food/" + key, ConfigToken()).then((res)=>{
			var data = res.data;
			if (data.success == true){
				$scope.foods = data.results;
			}
			else {
				$location.path("/");
			}
		})	
	}
	$scope.FoodSelected = ($event)=>{
		var id = $event.srcElement.attributes.fid.nodeValue;
		$location.path("/food/"+id);
	}
})
app.controller("foodCtrl", ($scope, $location, $http)=>{
	$scope.currentPath = $location.$$path;
	console.log($location);
	console.log("https://cookbook-server.herokuapp.com" + $scope.currentPath);
	
	$http.get("https://cookbook-server.herokuapp.com" + $scope.currentPath + "/detail", ConfigToken()).then((res)=>{
			var data = res.data;
			if (data.success == true){
				$scope.food = data.results;
			}
			else {
				$location.path("/");
			}
		})
})
app.controller("addFoods", ($scope, $location, $http) => {
	$scope.uploadFile = function(e){
		$scope.$apply(function(scope) {
			console.log($scope.stepList);
			var i = e.attributes['tag'].value;
			$scope.stepList[i].arrImage.push({image: ""});
			e.files[0] = "";
        	console.log($scope.stepList);
	    });
    };
	$scope.add = function() {
	    var f = document.getElementById('file').files[0];
	    console.log(f);
        r = new FileReader();

        var fd = new FormData();
			fd.append("file", f);

			$http({
	        url: "https://cookbook-server.herokuapp.com/image/",
	        method: 'POST',
	        data: fd,
	        headers: { 'Content-Type': undefined, Token: window.localStorage.getItem("FOOD_TOKEN")},
	        // transformRequest: angular.identity
	    }).then((res)=>{
			var data = res.data;
			if (data.success == true)
			{
				console.log(data)
			}
		});

	  //   r.onloadend = function(e) {
		 //    var data = e.target.result;
		 //    // document.getElementById("img").src = "data:image/jpg;base64," + data;
		 //    var fd = new FormData();
   // 			fd.append("file", data);

   // 			$http({
		 //        url: "https://cookbook-server.herokuapp.com/image/",
		 //        method: 'POST',
		 //        data: fd,
		 //        headers: { 'Content-Type': undefined, Token: window.localStorage.getItem("FOOD_TOKEN")},
		 //        // transformRequest: angular.identity
		 //    }).then((res)=>{
			// 	var data = res.data;
			// 	if (data.success == true)
			// 	{
			// 		console.log(data)
			// 	}
			// });
	  //   }
	  //   r.readAsBinaryString(f);
	}

	var emptyStep = {
		"step": "",
		"arrImage": []
	}
	$scope.stepList = [];
	$scope.stepList.push(emptyStep);
})
app.directive('customOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeFunc = scope.$eval(attrs.customOnChange);
      element.bind('change', onChangeFunc);
    }
  };
});
