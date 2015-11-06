/**
 * AuthorizationChecker Service
 */
(function () {
    'use strict';

    angular.module('StepConditionsModule').factory('AuthorizationCheckerService', [
        'AlertService',
        'PathService',
        function AuthorizationCheckerService(AlertService, PathService) {

            return {
                isAuthorized: function isAuthorized(step) {
                    var authorized = false;

                    var currentStepId = step.id;
                    var rootStep = PathService.getRoot();

                    //make sure root is accessible anyways
                    if (typeof this.userProgression[rootStep.id] == 'undefined'
                        || !angular.isDefined(this.userProgression[rootStep.id].authorized)
                        || !this.userProgression[rootStep.id].authorized) {
                        this.userProgressionService.update(rootStep, this.userProgression[rootStep.id].status, 1);    //pass 1 (and not "true") to controller : problem in url
                    }
                    //previous step exists ? NO : we're on root step => access
                    if (!angular.isObject(this.pathService.getPrevious(step))) {
                        this.pathService.goTo(step);
                        //previous step exists ? YES
                    } else {
                        var previousstep = this.pathService.getPrevious(step);
                        //is there a flag authorized on current step ? YES => access
                        if (typeof this.userProgression[currentStepId] !== 'undefined'
                            && angular.isDefined(this.userProgression[currentStepId].authorized)
                            && this.userProgression[currentStepId].authorized) {
                            this.pathService.goTo(step);
                            //is there a flag authorized on current step ? NO (or because the progression is not set)
                        } else {
                            //activity has been set for the step : NO => path error
                            if (!angular.isDefined(previousstep.activityId)) {
                                this.alertService.addAlert('error', Translator.trans('step_access_denied_no_activity_set', {stepName: step.name}, 'path_wizards'));
                                //activity has been set for the step : YES
                            } else {
                                //is there a flag authorized on previous step ? YES
                                if (typeof this.userProgression[previousstep.id] !== 'undefined'
                                    && angular.isDefined(this.userProgression[previousstep.id].authorized)
                                    && this.userProgression[previousstep.id].authorized) {
                                    //retrieve user progression
                                    var progression = this.userProgression[step.id];
                                    var status = (typeof progression == 'undefined') ? "seen" : progression.status;
                                    //is there a condition on previous step ? YES
                                    if (angular.isDefined(previousstep.condition) && angular.isObject(previousstep.condition)) {
                                        //get the promise
                                        var activityEvaluationPromise = this.stepConditionsService.getActivityEvaluation(previousstep.activityId);
                                        activityEvaluationPromise.then(
                                            function (result) {
                                                this.evaluation = result;
                                                // validate condition on previous step ? YES
                                                if (this.stepConditionsService.testCondition(previousstep, this.evaluation)) {
                                                    //add flag to current step
                                                    var promise = this.userProgressionService.update(step, status, 1);
                                                    promise.then(function(result){
                                                        //grant access
                                                        this.pathService.goTo(step);
                                                    }.bind(this));          //important, to keep the scope
                                                    // validate condition on previous step ? NO
                                                } else {
                                                    var conditionlist=this.stepConditionsService.getConditionList();
                                                    //display error
                                                    this.alertService.addAlert('error', Translator.trans('step_access_denied_condition', {stepName: step.name, conditionList: conditionlist}, 'path_wizards'));
                                                }
                                            }.bind(this),
                                            function (error) {
                                                this.evaluation = null;
                                            }.bind(this));
                                        //is there a condition on previous step ? NO
                                    } else {
                                        //add flag to current step
                                        var promise = this.userProgressionService.update(step, status, 1);
                                        promise.then(function(result){
                                            //grant access
                                            this.pathService.goTo(step);
                                        }.bind(this));
                                    }
                                    //is there a flag authorized on previous step ? NO => no access => message
                                } else {
                                    //display error
                                    this.alertService.addAlert('error', Translator.trans('step_access_denied', {}, 'path_wizards'));
                                }
                            }
                        }
                    }

                    return authorized;
                }
            };
        }
    ]);
})();