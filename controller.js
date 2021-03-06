var app = angular.module("mainApp", ["ngRoute"]);
var currentUser;
var backLocation="/";
app.config(($routeProvider)=>{
	$routeProvider
	.when("/", {
		templateUrl : "Login.html"
	})
	.when("/sign-up", {
		templateUrl : "sign-up.html"
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
function ConfigToken(){
	if(window.localStorage.getItem("FOOD_TOKEN") == null) return null;
	return {
		headers : {
			Token: window.localStorage.getItem("FOOD_TOKEN")
		}
	}
}
app.controller("signUpCtrl", ($scope, $location, $http)=>{
	$scope.submit = ()=>{
		var user={
			email : $scope.email,
			password : $scope.password,
			fullName : $scope.fullName
		};
		
		$http.post("https://cookbook-server.herokuapp.com/users/register", user).then((res)=>{
			var data = res.data;
			if (data.success == true)
			{
				console.log("Tạo thành công!");
				$location.path('/');
			}
		})
	}
})
app.controller("loginCtrl", ($scope, $location, $http)=>{
	$scope.email = "";
	$scope.password = "";
	let token = ConfigToken();
	if (token != null){
		$location.path('/dashboard');
	}
	$scope.SignUp = ()=>{
		$location.path('/sign-up');
	}
	$scope.submit = ()=>{

		let user = {
			"email" : $scope.email, //'phananh123qqq@gmail.com'
			"password" : $scope.password //'123123qqq'
		}
		$http.post("https://cookbook-server.herokuapp.com/users/sign_in/", user).then((res)=>{
			var data = res.data;
			console.log(data)
			if (data.success == true)
			{
				token = data.results.token;
				currentUser = data.results._id;
				$location.path('/dashboard');
				window.localStorage.setItem("FOOD_TOKEN", token);
			}
		}, (res)=>{
			alert("Tài khoản không tồn tại!");
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
					for (let i=0; i<$scope.foods.length; i++){
						$scope.foods[i].isFavourite = "unliked";
						$scope.foods[i].favourite.forEach((fa)=>{
							if (fa == currentUser){
								$scope.foods[i].isFavourite = "liked";
							}
						})
					}
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
				console.log($scope.foods);
				for (let i=0; i<$scope.foods.length; i++){
					$scope.foods[i].isFavourite = "unliked";
					$scope.foods[i].favourite.forEach((fa)=>{
						if (fa == currentUser){
							$scope.foods[i].isFavourite = "liked";
						}
					})
				}
			}
			else {
				$location.path("/");
			}
		})	
	}
	$scope.FoodSelected = ($event)=>{
		let id = $event.srcElement.attributes.fid.nodeValue;
		$location.path("/food/"+id);
	}
	$scope.Like = (i)=>{
		let favouriters = $scope.foods[i].favourite;
		if ($scope.foods[i].isFavourite == "liked"){
			for(let i=0; i<favouriters.length; i++){
				if (favouriters[i] == currentUser){
					favouriters.splice(i, 1);
				}
			}
			$scope.foods[i].isFavourite = "unliked";
		}
		else{
			favouriters.push(currentUser);
			$scope.foods[i].isFavourite = "liked";
		}

		$http.post("https://cookbook-server.herokuapp.com/food/" + $scope.foods[i]._id + "/update", {favourite: favouriters}, ConfigToken()).then((res)=>{
			var data = res.data;
			if (data.success == true){
				console.log(data.results);
			}
		})
	}
	$scope.Logout = ()=>{
		window.localStorage.clear();
		$location.path("/");
	}
	$scope.AddFood = ()=>{
		$location.path("/add-food");
		backLocation = "/dashboard";
	}
})
app.controller("foodCtrl", ($scope, $location, $http)=>{
	$scope.currentPath = $location.$$path;
	$scope.isDel = "collapseDel";
	$http.get("https://cookbook-server.herokuapp.com" + $scope.currentPath + "/detail", ConfigToken()).then((res)=>{
		var data = res.data;
		if (data.success == true){
			$scope.food = data.results;
			if ($scope.food.createBy == currentUser){
				$scope.isDel = "visibleDel";
			}
		}
		else {
			$location.path("/");
		}
	})
	$scope.Logout = ()=>{
		window.localStorage.clear();
		$location.path("/");
	}
	$scope.AddFood = ()=>{
		$location.path("/add-food");
		backLocation = $scope.currentPath;
	}
	$scope.DelFood = ()=>{
		if (confirm("Bạn có chắc xóa bài viết này?")) {
			$http.post("https://cookbook-server.herokuapp.com" + $scope.currentPath + "/delete",{}, ConfigToken()).then((res)=>{
				var data = res.data;
				if (data.success == true){
					$scope.food = data.results;
					console.log(data);
					alert("Đã xóa");
					$location.path("/");
				}
			})
	    } 
	}
})

app.controller("addFoods", ($scope, $location, $http) => {
	$scope.Back = ()=>{
		$location.path(backLocation);
	}
	$scope.Logout = ()=>{
		window.localStorage.clear();
		$location.path("/");
	}
	$scope.uploadSubImage = function(e){
		var i = e.attributes['tag'].value;
		var f = document.getElementById('file'+i).files[0];
		var fd = new FormData();
		fd.append("file", f);
		// console.log("file" + f);
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
					alert("Thêm thành công!");
					$location.path('/dashboard');
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
