const app = angular.module('app', []);

app.controller('main', ['$scope', function($scope){
    $scope.name = 'Hola!';
}]);