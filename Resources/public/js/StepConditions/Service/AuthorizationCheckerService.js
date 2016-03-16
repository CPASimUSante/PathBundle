/**
 * AuthorizationChecker Service
 */
(function () {
    'use strict';

    angular.module('StepConditionsModule').factory('AuthorizationCheckerService', [
        'AlertService',
        'PathService',
        'UserProgressionService',
        'StepConditionsService',
        '$q',
        function AuthorizationCheckerService(AlertService, PathService, UserProgressionService, StepConditionsService, $q) {

            return {
                /**
                 * Check if the UserProgression grant access to the Step
                 * @param step
                 * @returns {boolean}
                 */
                isProgressionAuthorized: function isProgressionAuthorized(step) {
                    var progressionAuthorized = false;

                    var userProgression = UserProgressionService.get();
                    if (angular.isDefined(userProgression[step.id]) && angular.isDefined(userProgression[step.id].authorized) && userProgression[step.id].authorized) {
                        // Step is already authorized
                        progressionAuthorized = true;
                    }

                    return progressionAuthorized;
                },

                doAuthorizeSteps:function doAuthorizeSteps() {
                    //loop through steps to authorize if needed
                    for(var i=0;i<maybeAuthorizedStep.length;i++) {
                        var progression=UserProgressionService.getForStep(maybeAuthorizedStep[i]);
                        var status=(typeof progression=='undefined'||null==progression)?"seen":progression.status;
                        UserProgressionService.update(maybeAuthorizedStep[i],status,1);
                    }
                    //go to step
                    if(maybeAuthorizedStep.length>0) {
                        PathService.goTo(maybeAuthorizedStep[0]);
                    }
                    //reset array
                    maybeAuthorizedStep.length=0;
                },

                checkStepConditions: function checkStepConditions(step, previous, authorization, isClickedStep, that) {
                    var progression = UserProgressionService.getForStep(step);
                    var status = (typeof progression == 'undefined' || null == progression) ? "seen" : progression.status;

                        // There is a condition on the previous step => check if it is OK
                        // Process evaluation of the Activity
                        StepConditionsService.getActivityEvaluation(previous.activityId).then(function onSuccess(result) {
                            if (StepConditionsService.testCondition(previous, result)) {
                                //doesn't apply to step and previous (< N-1)
                                this.isAuthorized(previous, isClickedStep);

                            } else {
                                // validate condition on previous step ? NO
                                var conditionsList = StepConditionsService.getConditionList();
                                //display error
                                authorization.resolve({
                                    granted: false,
                                    message: Translator.trans('step_access_denied_condition', {stepName: step.name, conditionList: conditionsList}, 'path_wizards')
                                });
                            }
                        });
                },

                /**
                 * Check if the User can access to the Step
                 * @param step
                 * @returns {object}
                 */
                isAuthorized: function isAuthorized(step, isClickedStep) {
                    //to reset maybeAuthorizedStep on each click
                    if (!angular.isDefined(isClickedStep)) {
                      //reset array
                      maybeAuthorizedStep.length=0;
                      isClickedStep = true;
                    }
                    // Authorization object (contains a granted boolean and a message if not authorized)
                    var authorization = $q.defer();

                    if (PathService.getRoot() == step) {
                        // Always grant access to the Root step
                        authorization.resolve({granted: true});
                        this.doAuthorizeSteps();
                        // previous step exists ? YES
                    } else {
                        // Check authorization for the current step
                        var previous = PathService.getPrevious(step);

                        // Check progression of the User to know if the step is already granted
                        if (this.isProgressionAuthorized(step)) {
                          //doesn't apply to step and previous (< N-1)
                          if (maybeAuthorizedStep.length > 0) {
                              maybeAuthorizedStep.push(step);
                              this.isAuthorized(previous, isClickedStep);
                          } else {
                              // Step has already been marked as accessible => grant access
                              authorization.resolve({granted: true});
                              this.doAuthorizeSteps();
                          }
                        } else {
                            maybeAuthorizedStep.push(step);
                            // Step is not already granted => so check conditions
                            if (!angular.isDefined(previous.activityId)) {
                                // activity has been set for the step : NO => path error
                                authorization.resolve({
                                    granted: false,
                                    message: Translator.trans('step_access_denied_no_activity_set', {stepName: step.name}, 'path_wizards')
                                });
                            } else {
                                var progression = UserProgressionService.getForStep(step);
                                var status = (typeof progression == 'undefined' || null == progression) ? "seen" : progression.status;

                                //activity has been set for the step : YES
                                if (this.isProgressionAuthorized(previous)) {
                                    // Previous step is authorized, so check the condition to know if User can access current step
                                    // retrieve user progression

                                    if (angular.isDefined(previous.condition) && angular.isObject(previous.condition)) {
                                        // There is a condition on the previous step => check if it is OK
                                        this.checkStepConditions(step, previous, authorization, isClickedStep, this);
                                    } else {
                                        // Previous step doesn't lock the current step so access it and update the User progression
                                        UserProgressionService.update(step, status, 1);

                                        // Don't stand by for request response => authorize access anyway
                                        authorization.resolve({ granted: true });
                                        this.doAuthorizeSteps();
                                    }
                                } else {
                                  //because we can't just test Root for condition : even unauthorized step should be tested for condition
                                  if (angular.isDefined(previous.condition) && angular.isObject(previous.condition)) {
                                      this.checkStepConditions(step, previous, authorization, isClickedStep, this);
                                  } else {
                                      if (PathService.getRoot() == previous) {
                                          authorization.resolve({ granted: true });
                                          this.doAuthorizeSteps();
                                      } else {
                                          this.isAuthorized(previous, isClickedStep);
                                      }
                                  }
                                }
                            }
                        }
                    }

                    return authorization.promise;
                }
            };
        }
    ]);
})();
