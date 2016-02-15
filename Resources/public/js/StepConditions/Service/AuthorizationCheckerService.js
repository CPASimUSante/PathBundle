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
            var maybeAuthorizedStep=[];
            return {
                /**
                 * Check if the UserProgression grant access to the Step
                 * @param step
                 * @returns {boolean}
                 */
                isProgressionAuthorized: function isProgressionAuthorized(step) {
                    var progressionAuthorized = false;

                    var userProgression = UserProgressionService.get();
                    if (
                       // (!angular.isDefined(step.condition) || !angular.isObject(step.condition)) ||
                        (angular.isDefined(userProgression[step.id]) && angular.isDefined(userProgression[step.id].authorized) && userProgression[step.id].authorized) ) {
                        // Step is already authorized or there is no condition on it
                        progressionAuthorized = true;
                    }

                    return progressionAuthorized;
                },

                doAuthorizeSteps:function doAuthorizeSteps(){
                    console.log("maybeAuthorizedSteps");console.log(maybeAuthorizedStep);
                    //loop through steps to authorize if needed
                    for(var i=0;i<maybeAuthorizedStep.length;i++){
                        var progression=UserProgressionService.getForStep(maybeAuthorizedStep[i]);
                        var status=(typeof progression=='undefined'||null==progression)?"seen":progression.status;
                        UserProgressionService.update(maybeAuthorizedStep[i],status,1);
                    }
                    //go to step
                    if(maybeAuthorizedStep.length>0){
                        PathService.goTo(maybeAuthorizedStep[0]);
                    }
                    //reset array
                    maybeAuthorizedStep=[];
                },

                checkStepConditions: function checkStepConditions(step, previous, authorization, that) {
                    console.log("checkStepConditions ");
                    var progression = UserProgressionService.getForStep(step);
                    var status = (typeof progression == 'undefined' || null == progression) ? "seen" : progression.status;

                    if (angular.isDefined(previous.condition) && angular.isObject(previous.condition)) {
                        // There is a condition on the previous step => check if it is OK
                        console.log("il existe des conditions sur l'étape "+previous.name );
                        // Process evaluation of the Activity
                        StepConditionsService.getActivityEvaluation(previous.activityId).then(function onSuccess(result) {
                            if (StepConditionsService.testCondition(previous, result)) {
                                //doesn't apply to step and previous (< N-1)
                                maybeAuthorizedStep.push(step);
                                that.isAuthorized(previous);
                            } else {
                                // validate condition on previous step ? NO
                                var conditionsList = StepConditionsService.getConditionList();
                                console.log("test des conditions sur "+step.name+" raté");
                                //display error
                                authorization.resolve({
                                    granted: false,
                                    message: Translator.trans('step_access_denied_condition', {stepName: step.name, conditionList: conditionsList}, 'path_wizards')
                                });
                                console.log("conditionsList");console.log(conditionsList);
                            }
                        });
                        //si pas de conditions sur S-1 (qui est déjà auth) => OK
                    } else {
                        //doesn't apply to step and previous (< N-1)
                        maybeAuthorizedStep.push(step);
                        this.isAuthorized(previous);
                    }
                },
                /**
                 * Check if the User can access to the Step
                 * @param step
                 * @returns {object}
                 */
                isAuthorized: function isAuthorized(step, arr) {
                    if (angular.isDefined(arr))
                        maybeAuthorizedStep = arr;
                    // Authorization object (contains a granted boolean and a message if not authorized)
                    var authorization = $q.defer();

                    if (PathService.getRoot() == step) {
                        // Always grant access to the Root step
                        authorization.resolve({granted: true});
                        console.log("=> c'est la racine : ok");
                        this.doAuthorizeSteps();
                        // previous step exists ? YES
                    } else {
                        console.log("INFO : "+step.name+" ce n'est pas la racine sur laquelle vous avez cliqué");
                        // Check authorization for the current step
                        var previous = PathService.getPrevious(step);

                        // Check progression of the User to know if the step is already granted
                        // Step has already been marked as accessible => grant access
                        if (this.isProgressionAuthorized(step)) {
                            //doesn't apply to step and previous (< N-1)
                            if (maybeAuthorizedStep.length > 0) {
                                maybeAuthorizedStep.push(step);
                                this.isAuthorized(previous);
                            } else {
                                authorization.resolve({granted: true});
                                console.log("=> l'étape "+step.name+" est déjà autorisée");
                            }
                            // Step is not already granted
                        } else {
                            console.log("INFO : l'étape "+step.name+" n'est pas encore autorisée");
                            //=> so check conditions
                            if (!angular.isDefined(previous.activityId)) {
                                console.log("=> pas d'activité liée sur "+previous.name+": erreur");
                                // activity has been set for the step : NO => path error
                                authorization.resolve({
                                    granted: false,
                                    message: Translator.trans('step_access_denied_no_activity_set', {stepName: step.name}, 'path_wizards')
                                });
                            } else {
                                console.log("INFO : une activité est liée sur "+previous.name);
                                //activity has been set for the step : YES
                                if (this.isProgressionAuthorized(previous)) {
                                    console.log("=> l'étape ("+previous.name+") est déjà autorisée, on doit vérifier s'il existe des conditions");
                                    // Previous step is authorized, so check the condition to know if User can access current step
                                    // retrieve user progression
                                    var progression = UserProgressionService.getForStep(step);
                                    var status = (typeof progression == 'undefined' || null == progression) ? "seen" : progression.status;

                                    if (angular.isDefined(previous.condition) && angular.isObject(previous.condition)) {
                                        // There is a condition on the previous step => check if it is OK
                                        console.log("il existe des conditions sur l'étape "+previous.name );
                                        // Process evaluation of the Activity
                                        StepConditionsService.getActivityEvaluation(previous.activityId).then(function onSuccess(result) {
                                            if (StepConditionsService.testCondition(previous, result)) {
                                                //doesn't apply to step and previous (< N-1)
                                                if (maybeAuthorizedStep.length > 0) {
                                                    maybeAuthorizedStep.push(step);
                                                    this.isAuthorized(previous);
                                                } else {
                                                    // validate condition on previous step ? YES
                                                    // Update UserProgression
                                                    UserProgressionService.update(step, status, 1);
                                                    console.log("test des conditions réussi sur "+step.name );
                                                    authorization.resolve({ granted: true });
                                                }
                                            } else {
                                                // validate condition on previous step ? NO
                                                var conditionsList = StepConditionsService.getConditionList();
                                                console.log("test des conditions sur "+step.name+" raté");
                                                //display error
                                                authorization.resolve({
                                                    granted: false,
                                                    message: Translator.trans('step_access_denied_condition', {stepName: step.name, conditionList: conditionsList}, 'path_wizards')
                                                });
                                                console.log("conditionsList");console.log(conditionsList);
                                            }
                                        });
                                        //si pas de conditions sur S-1 (qui est déjà auth) => OK
                                    } else {
                                        //doesn't apply to step and previous (< N-1)
                                        if (maybeAuthorizedStep.length > 0) {
                                            maybeAuthorizedStep.push(step);
                                            this.isAuthorized(previous);
                                        } else {
                                            console.log("INFO : il n'existe pas de condition sur l'étape "+step.name);
                                            // Previous step doesn't lock the current step so access it and update the User progression
                                            UserProgressionService.update(step, status, 1);
                                            // Don't stand by for request response => authorize access anyway
                                            authorization.resolve({ granted: true });
                                        }
                                    }
                                    // étape non autorisée
                                } else {
                                    maybeAuthorizedStep.push(step);
                                    //because we can't just test Root for condition : even unauthorized step should be tested for condition
                                    this.checkStepConditions(step, previous, authorization, this);

                                    console.log("INFO : L'étape "+previous.name+" n'est pas autorisée");
                                    console.log("INFO : => recursif");
                                    if (this.isAuthorized(previous)) {
                                        console.log("INFO : we checked "+previous.name);
                                    } else {
                                        // The previous step is not accessible, so the current step neither
                                        authorization.resolve({
                                            granted: false,
                                            message: Translator.trans('step_access_denied', {}, 'path_wizards')
                                        });
                                        console.log("l'étape "+step.name+" n'est pas autorisée");
                                    }
                                }
                            }
                        }
                    }
                    console.log("authorization.promise");console.log(authorization.promise);
                    return authorization.promise;
                }
            };
        }
    ]);
})();