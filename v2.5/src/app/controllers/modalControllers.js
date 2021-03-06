(function() {
  define(['./baseController'], function() {
    'use strict';
    return angular.module('compass.controllers').controller('modifySwitchModalCtrl', [
      '$scope', '$modalInstance', 'wizardService', 'targetSwitch', function($scope, $modalInstance, wizardService, targetSwitch) {
        $scope.targetSwitch = angular.copy(targetSwitch);
        $scope.ok = function() {
          var updatedSwitch;
          $scope.alerts = [];
          updatedSwitch = {
            ip: $scope.targetSwitch.ip,
            filters: $scope.targetSwitch.filters,
            credentials: $scope.targetSwitch.credentials
          };
          return wizardService.putSwitches(targetSwitch.id, updatedSwitch).success(function(data) {
            return $modalInstance.close(data);
          }).error(function(response) {
            return $scope.alerts[0] = response;
          });
        };
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('addSubnetModalInstanceCtrl', [
      '$scope', '$modalInstance', 'wizardService', 'subnets', function($scope, $modalInstance, wizardService, subnets) {
        var subnet, _i, _len, _ref;
        $scope.subnetworks = angular.copy(subnets);
        wizardService.copyWithHashKey($scope.subnetworks, subnets);
        $scope.subnetAllValid = true;
        _ref = $scope.subnetworks;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          subnet = _ref[_i];
          subnet['valid'] = true;
        }
        if ($scope.subnetworks.length === 0) {
          $scope.subnetworks.push({
            valid: false
          });
        }
        $scope.addSubnetwork = function() {
          $scope.subnetworks.push({
            valid: false
          });
          return wizardService.validateAllSubnets($scope);
        };
        $scope.removeSubnetwork = function(index) {
          wizardService.deleteSubnet($scope, index, $scope.subnetworks[index].id);
          return wizardService.validateAllSubnets($scope);
        };
        $scope.subnet_change = function(index, subnet) {
          var subnetRegExp;
          subnetRegExp = /(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}(\/){1}([0-9]|[0-2][0-9]|3[0-2])$/;
          $scope.subnetworks[index]['valid'] = subnetRegExp.test(subnet);
          return wizardService.validateAllSubnets($scope);
        };
        $scope.ok = function() {
          return wizardService.subnetCommit($scope, $modalInstance);
        };
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('addProviderModalInstanceCtrl', [
      '$scope', '$modalInstance', 'wizardService', 'dataService', 'wizardFactory', 'providers', 'package_config', 'cluster_id', function($scope, $modalInstance, wizardService, dataService, wizardFactory, providers, package_config, cluster_id) {
        
        $scope.providers = angular.copy(providers);

        if ($scope.providers.length === 0) {
          $scope.providers.push({
            valid: false
          });
        }
        $scope.addProvider = function() {
          $scope.providers.push({
            valid: false
          });
        };

        $scope.ok = function() {
          for(var i=0; i<=$scope.providers.length;i++) {
            for(var prop in $scope.providers[i]) {
              if(prop === "valid") {
                delete $scope.providers[i]["valid"];
              }
            }
          }

          package_config['network_cfg']['provider_net_mappings'] = $scope.providers;

          var targetSysConfigData = {
            "package_config": package_config
          };
          return dataService.updateClusterConfig(cluster_id, targetSysConfigData).success(function(configData) {
            $modalInstance.close($scope.providers);
            return wizardFactory.setCommitState({
              "name": "package_config",
              "state": "success",
              "message": ""
            });
          });
        }
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('errorMessageCtrl', [
      '$scope', '$modalInstance', 'title', 'content', function($scope, $modalInstance, title, content) {
        $scope.title = title;
        $scope.content = content;
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('userModalCtrl', [
      '$scope', '$modalInstance', 'newUser', function($scope, $modalInstance, newUser) {
        $scope.newUser = newUser;
        $scope.ok = function() {
          $scope.result = 'ok';
          return $modalInstance.close($scope.newUser);
        };
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('reportErrorCtrl', [
      '$scope', '$modalInstance', 'detail', function($scope, $modalInstance, detail) {
        $scope.detail = detail;
        $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
        return console.log($scope.detail);
      }
    ]).controller('uploadFileModalInstanceCtrl', [
      '$scope', '$modalInstance', 'wizardService', 'allSwitches', 'allMachines', function($scope, $modalInstance, wizardService, allSwitches, allMachines) {
        $scope.switchLoading = false;
        $scope.machineLoading = false;
        $scope.switchFileNameChanged = function() {
          return wizardService.readDataFromFile($scope, '#switchInput', 'switchFile');
        };
        $scope.machineFileNameChanged = function() {
          return wizardService.readDataFromFile($scope, '#machineInput', 'machineFile');
        };
        $scope.ok = function() {
          $scope.result = 'ok';
          if ($scope.switchFile) {
            wizardService.addUploadSwitches($scope, allSwitches, allMachines);
          }
          if (!$scope.switchFile && $scope.machineFile) {
            return wizardService.addUploadMachines($scope, allMachines, wizardService.getDataService());
          }
        };
        return $scope.cancel = function() {
          return $modalInstance.dismiss('cancel');
        };
      }
    ]).controller('addMachineModalInstanceCtrl', [
      '$scope', '$modalInstance', 'wizardService', 'allSwitches', 'allMachines', function($scope, $modalInstance, wizardService, allSwitches, allMachines) {
        $scope.switchOptions = allSwitches;
        $scope.selected_switch = allSwitches[0];

        $scope.cluster = wizardService.getClusterInfo();
        
        var counter = 0;

        $scope.newMac = [];
        $scope.newMac.push({ 'address': '', 'counter': 0 });

        $scope.addNewMacAddress = function() {
          counter = counter+1;

          return $scope.newMac.push({
            'address': '',
            'counter': counter
          });
        };

        $scope.ok = function() {
          return wizardService.addMachineWithoutSwitch($scope, $modalInstance, allMachines);
        };

        return $scope.cancel = function() {
          console.log("inside cancel");
          return $modalInstance.dismiss('cancel');
        };
      }
    ]);
  });

}).call(this);
