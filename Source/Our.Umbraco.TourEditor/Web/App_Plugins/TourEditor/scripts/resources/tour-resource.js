﻿(function () {
    "use strict";

    function TourResource($http, umbRequestHelper) {

        var apiUrl = Umbraco.Sys.ServerVariables["Our.Umbraco.TourEditor"].TourEditorApi;

        var resource = {
            createTourFile: createTourFile,
            deleteTourFile: deleteTourFile,
            getTourFile : getTourFile
        };

        return resource;

        function createTourFile(filename) {
           
            return umbRequestHelper.resourcePromise(
                $http.post(apiUrl + "CreateTourFile?filename=" + filename),
                "Failed creating tourfile"
            );
        };

        function deleteTourFile(filename) {

            return umbRequestHelper.resourcePromise(
                $http.post(apiUrl + "DeleteTourFile?filename=" + filename),
                "Failed deleting tourfile"
            );
        };

        function getTourFile(filename) {
            return umbRequestHelper.resourcePromise(
                $http.get(apiUrl + "GetTourFile?filename=" + filename),
                "Failed loading tourfile"
            );
        }

    }

    angular.module("umbraco.resources").factory("Our.Umbraco.TourEditor.TourResource", TourResource);

})();