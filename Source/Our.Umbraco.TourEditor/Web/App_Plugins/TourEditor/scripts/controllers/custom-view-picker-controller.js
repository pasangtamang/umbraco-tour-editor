﻿(function () {
    "use strict";

    function CustomViewPickerOverlayController($scope, tourResource) {
        var vm = this;

        vm.isLoading = true;
        vm.customViews = [];
        vm.selectedView = $scope.model.selectedView;
        vm.customProperties = [];
        vm.customPropertiesJson = null;
        vm.watcher = null;

        if (!vm.selectedView) {
            vm.selectedView = '';
        }        

        vm.customViewProperty = { 'label': 'View', 'description': 'Select the view you want to use'};

        function changeView() {                       
            setupCustomProperties();
        }

        vm.changeView = changeView;

        function setupCustomProperties() {
            if (vm.watcher) {
                // unbind watch
                vm.watcher();
            }

            vm.customProperties = [];
            vm.customPropertiesJson = null;
            vm.watcher = null;

            if (vm.selectedView !== '') {
                vm.customPropertiesJson = {};
                var currentView = _.find(vm.customViews, function (view) { return view.viewPath === vm.selectedView; });               
                if (currentView) {
                    for (var i = 0; i < currentView.customProperties.length; i++) {
                        var currentProp = currentView.customProperties[i];

                        var config = {};

                        if (currentProp.config !== '') {
                            config = JSON.parse(currentProp.config);
                        }

                        vm.customProperties.push({
                            texts: { 'label': currentProp.label, 'description': currentProp.description },
                            editor: {
                                'view': currentProp.view,
                                'config': config,
                                'value' : ''
                            },
                            property: currentProp.property
                        });

                        vm.customPropertiesJson[currentProp.property] = '';   

                        if ($scope.model.selectedView === vm.selectedView && $scope.model.customProperties) {
                            vm.customPropertiesJson[currentProp.property] = $scope.model.customProperties[currentProp.property];  
                            vm.customProperties[vm.customProperties.length - 1].editor.value = $scope.model.customProperties[currentProp.property];  
                        }
                    }    

                    vm.watcher = $scope.$watch('vm.customProperties',
                        function (newValue) {
                            if (newValue) {                               
                                for (var i = 0; i < newValue.length; i++) {
                                    var propName = newValue[i].property;
                                    var value = newValue[i].editor.value;

                                    vm.customPropertiesJson[propName] = value;                                    
                                }
                            }
                        }, true);
                }
            }
        }
        
        function init() {
            tourResource.getCustomViews().then(function(views) {               
                vm.customViews = views;
                vm.customViews.unshift({
                    "name": "Select a view",
                    "viewPath": ""
                });

                setupCustomProperties();

                vm.isLoading = false;
            });
        }

        init();

        $scope.$on("formSubmitting",
            function(ev, args) {
                args.scope.model.selectedView = vm.selectedView;
                args.scope.model.customProperties = vm.customPropertiesJson;
            });
    }


    angular.module("umbraco").controller("Our.Umbraco.TourEditor.CustomViewPickerOverlayController",
        [
            '$scope',            
            'Our.Umbraco.TourEditor.TourResource',            
            CustomViewPickerOverlayController
        ]);

})();