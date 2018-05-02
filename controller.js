var app = angular.module("mainApp", ["ngRoute"]);
var currentUser;
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
				currentUser = data.results._id;
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
	$scope.uploadSubImage = function(e){
		var i = e.attributes['tag'].value;
		var f = document.getElementById('file'+i).files[0];
		var fd = new FormData();
		fd.append("file", f);
		console.log("file" + f);
		$http({
	        url: "https://cookbook-server.herokuapp.com/image/",
	        method: 'POST',
	        data: fd,
	        headers: { 'Content-Type': undefined, Token: window.localStorage.getItem("FOOD_TOKEN")},
	    }).then((res)=>{
			var data = res.data;
			if (data.success == true)
			{
				let path = "https://cookbook-server.herokuapp.com/" + data.results.path;
				var img = angular.element(document.querySelector('#img'+i));
				img.attr('src', path);
				$scope.food.content[i].arrImage.push({image: path});
	        	console.log(angular.element(e));
	        	angular.element(e).val(null);
			}
		});
    };
	$scope.uploadImage = function() {
	    var f = document.getElementById('file').files[0];
	    // console.log(f);
        var fd = new FormData();
			fd.append("file", f);

		$http({
	        url: "https://cookbook-server.herokuapp.com/image/",
	        method: 'POST',
	        data: fd,
	        headers: { 'Content-Type': undefined, Token: window.localStorage.getItem("FOOD_TOKEN")},
	    }).then((res)=>{
			var data = res.data;
			if (data.success == true)
			{
				let path = "https://cookbook-server.herokuapp.com/" + data.results.path;
				$scope.food.image = path;
				var i = angular.element(document.querySelector('#img'));
				i.attr('src', path);
				i.attr('class', 'food-image center-block');
				console.log(path);
			}
		});
	}

	$scope.add = function(){
		// alert(currentUser);/
		var materials = $scope.materials.split(";")
		if ($scope.materials != "" && $scope.food.name != "" && $scope.food.decriptions != "" && $scope.food.content.length > 0)
		{
			materials.forEach((m)=>{
				var ss = m.split(":");
				var temp = {
					material: ss[0],
					amount: ss[1]
				}
				$scope.food.materials.push(temp);
				console.log($scope.food.name);
				// console.log($scope.food.materials); //amazing !!!!!
			})
			var selector = document.getElementById("selector");
			$scope.food.categoryId = selector.options[ selector.selectedIndex ].value;
			console.log(selector.options[selector.selectedIndex ].value);
			console.log($scope.food);
			$http.post("https://cookbook-server.herokuapp.com/food/" + $scope.food.categoryId + "/create", $scope.food, ConfigToken()).then((res)=>{
				var data = res.data;
				if (data.success == true){
					console.log(data.results);
				}
			})
		}
		else alert ("Bạn phải nhập đủ thông tin có dấu *");
	}
	$scope.delStep = function(i){
		console.log($scope.food.content);
		$scope.food.content.splice(i, 1);
	}
	$scope.addStep = function(i){
		var emptyStep = {
			"step": "",
			"arrImage": []
		}
		$scope.food.content.push(emptyStep);
		console.log($scope.food.content);
	}
	$http.get("https://cookbook-server.herokuapp.com/category", ConfigToken()).then((res)=>{
		var data = res.data;
		if (data.success == true){
			$scope.categories = data.results;
		}
	})
	$scope.food={};
	$scope.food.favourite=[];//
	$scope.food.name="";
	$scope.food.categoryId=[];//
	$scope.food.materials=[];
	$scope.materials="";
	$scope.food.content = [];
})

// app.directive('customOnChange', function() {
//   return {
//     restrict: 'A',
//     link: function (scope, element, attrs) {
//       var onChangeFunc = scope.$eval(attrs.customOnChange);
//       element.bind('change', onChangeFunc);
//     }
//   };
// });
