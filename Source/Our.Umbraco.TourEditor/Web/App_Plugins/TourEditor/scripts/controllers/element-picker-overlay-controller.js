﻿(function() {
    "use strict";

    function ElementPickerOverlayController($scope, $q, treeResource, dashboardResource, contentResource) {
        var vm = this;

        vm.isLoading = true;
        vm.promises = [];
        vm.trees = [];
        vm.dashboards = [];
        vm.doctypes = [];
        vm.selectedDoctype = '';
        vm.doctypeItems = [];
        vm.promiseObj = {};

        // get sections in correct format for view
        vm.sections = _.map($scope.model.sections,
            function(x) {
                return {
                    "alias": x.alias,
                    "icon": x.icon,
                    "name": x.name,
                    "element": "[data-element='section-" + x.alias + "']"
                };
            });

        vm.other = [
            {
                "alias": "avatar",
                "icon": "icon-user",
                "name": "Avatar",
                "element": "[data-element='section-user']"
            },
            {
                "alias": "help",
                "icon": "icon-help-alt",
                "name": "Help",
                "element": "[data-element='section-help']"
            },
            {
                "alias": "search",
                "icon": "icon-search",
                "name": "Search",
                "element": "[data-element='section-global-search-field']"
            },
            {
                "alias": "applications",
                "icon": "icon-thumbnail-list",
                "name": "Sections bar",
                "element": "#applications"
            },
            {
                "alias": "navigation",
                "icon": "icon-sitemap",
                "name": "Navigation",
                "element": "#navigation"
            },
            {
                "alias": "contentsection",
                "icon": "icon-browser-window",
                "name": "Content section",
                "element": "#contentWrapper"
            }
        ];

        // add sections tab
        vm.tabs = [
            {
                active: true,
                id: 1,
                label: "Sections",
                alias: "sections",
                items: vm.sections
            }
        ];


        function pickElement(eventElement) {
            $scope.model.submit(eventElement);
        }

        vm.pickElement = pickElement;

        function onDoctypeChanged() {
            getElementsForDocType();
        }

        vm.onDoctypeChanged = onDoctypeChanged;

        function getElementsForDocType() {
            if (vm.selectedDoctype === '') {
                vm.doctypeItems = [];
            } else {
                var doctype = _.find(vm.doctypes, function (x) { return x.alias == vm.selectedDoctype });

                var items = [];

                if (doctype != null) {
                    for (var i = 0; i < doctype.tabs.length; i++) {
                        var tab = doctype.tabs[i];
                        items.push({
                            "alias": tab.alias,
                            "name": tab.label,
                            "icon": "icon-tab",
                            "element": "[data-element='tab-" + tab.alias + "']"
                        });

                        for (var j = 0; j < tab.properties.length; j++) {
                            var prop = tab.properties[j];
                            items.push({
                                "alias": prop.alias,
                                "name": prop.label,
                                "icon": "icon-autofill",
                                "element": "#" + prop.alias
                            });
                        }
                    }
                }
                

                vm.doctypeItems = items;
            }
        };

        vm.getElementsForDocType = getElementsForDocType;

        function getTrees(section) {
            var deferred = $q.defer();

            treeResource.loadApplication({ "section": section, "isDialog": true }).then(function (data) {
                var trees = [];
                if (data.isContainer) {
                    for (var i = 0; i < data.children.length; i++) {
                        var tree = data.children[i];
                        trees.push({
                            "alias": tree.metaData.treeAlias,
                            "name": tree.name,
                            "icon": tree.icon,
                            "element": "[data-element='tree-item-" + tree.metaData.treeAlias + "']" 
                        });
                    }
                }

                deferred.resolve(trees);
            }, function () {
                deferred.reject();
            });

            return deferred.promise;
        }

        function getDashBoards(section) {
            var deferred = $q.defer();

            dashboardResource.getDashboard(section).then(function (data) {
                var dashboards = [];
                for (var i = 0; i < data.length; i++) {
                    var dashboard = data[i];
                    dashboards.push(
                        {
                            "alias": dashboard.alias,
                            "name": dashboard.label,
                            "icon": "icon-dashboard",
                            "element": "[data-element='tab-" + dashboard.alias + "']"
                        }
                    );
                }

                deferred.resolve(dashboards);
            }, function () {
                deferred.reject();
            });            

            return deferred.promise;
        }

        function getDocumentType(alias) {
            var deferred = $q.defer();

            contentResource.getScaffold(-1, alias).then(function(data) {
                deferred.resolve(data);
            }, function() {
                deferred.reject();
            })

            return deferred.promise;
        }

        function init() {            
            // store promises based on sections           
            for (var i = 0; i < vm.sections.length; i++) {
                var alias = vm.sections[i].alias;
               
                vm.promiseObj['tree' + alias] = getTrees(alias);
                vm.promiseObj['dashboard' + alias] = getDashBoards(alias);               
            }  

            for (var i = 0; i < $scope.model.doctypes.length; i++) {
                var alias = $scope.model.doctypes[i];

                vm.promiseObj['doctype' + alias] = getDocumentType(alias);
            }

            // handle data when all promises are resolved
            $q.all(vm.promiseObj).then(function (values) {

                var keys = Object.keys(values);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];

                    if (key.startsWith('tree')) {                        
                       vm.trees =  vm.trees.concat(values[key]);
                    }

                    if (key.startsWith('dashboard')) {
                        vm.dashboards = vm.dashboards.concat(values[key]);
                    }

                    if (key.startsWith('doctype')) {
                        var scaffold = values[key];

                        var doctype = {
                            'name': scaffold.contentTypeName,
                            'alias': scaffold.contentTypeAlias,
                            'tabs': scaffold.tabs
                        };

                        vm.doctypes.push(doctype);
                    }
                }

                if (vm.trees.length > 0) {
                    vm.tabs.push({
                        active: false,
                        id: vm.tabs.length + 1,
                        label: "Trees",
                        alias: "trees",
                        items: vm.trees
                    });
                }

                if (vm.doctypes.length > 0) {                   
                    vm.tabs.push({
                        active: false,
                        id: vm.tabs.length + 1,
                        label: "Document types",
                        alias: "doctypes",
                        items: vm.doctypes
                    });
                }

                if (vm.dashboards.length > 0) {
                    vm.tabs.push({
                        active: false,
                        id: vm.tabs.length + 1,
                        label: "Dashboards",
                        alias: "Dashboards",
                        items: vm.dashboards
                    });
                }

                if (vm.other.length > 0) {
                    vm.tabs.push({
                        active: false,
                        id: vm.tabs.length + 1,
                        label: "Other",
                        alias: "other",
                        items: vm.other
                    });
                }

                vm.isLoading = false;
            });
        }

        init();
    }


    angular.module("umbraco").controller("Our.Umbraco.TourEditor.ElementPickerOverlayController",
        [
            '$scope',
            '$q',
            'treeResource',
            'dashboardResource',
            'contentResource',
            ElementPickerOverlayController
        ]);

})();