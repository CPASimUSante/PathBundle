/**
 * StepConditions Service
 */
(function () {
    'use strict';

    angular.module('StepConditionsModule').factory('StepConditionsService', [
        '$http',
        '$q',
        'IdentifierService',
        function StepConditionsService($http, $q, IdentifierService) {
            /**
             * List of group of user
             * @type {array}
             */
            var usergrouplist = null;
            var useringroup = null;
            /**
             * Evaluation data from \CoreBundle\Entity\Activity\Evaluation
             * @type {null}
             */
            var evaluation = null;
            /**
             * StepConditions object
             *
             * @constructor
             */
            var StepConditions = function StepConditions() {
                // Initialize step properties
                this.id                = IdentifierService.generateUUID();
                //the step the conditions belongs to (not useful if condition structure saved into path structure JSON: it will be at the step level)
                // this.step              = step;
                //list of criteria group
                this.criteriagroups     = [];
                //result of the evaluation of the condition
                //this.evaluation        = true;
                // ???
                //this.propagateToChildren = true;
            };

            /**
             * Criterion object
             *
             * @constructor
             */
            var Criterion = function Criterion() {
                // criteria group identifier
                this.id                  = IdentifierService.generateUUID();
                //activity status, user group, primary resource repeat
                this.type                = null;
                this.data                = null;
            };
            /**
             * Criteria group object
             *
             * @constructor
             */
            var CriteriaGroup = function CriteriaGroup(parent) {
                var lvl;
                if (parent) {
                    lvl  = parent.lvl + 1;
                } else {
                    lvl = 0;
                }
                // criteria group identifier
                this.id = IdentifierService.generateUUID();
                this.lvl = lvl;
                //contains array of criterion and/or criteria group
                this.criterion = [];
                this.criteriagroup = [];
            };
            return {
                /**
                 * Retrieve evaluation data from DB for an activity
                 *
                 * @param activityId
                 * @returns {*}
                 */
                getEvaluationFromController: function getEvaluationFromController(activityId){
                    this.getActivityEvaluation(activityId);
                    return this.evaluation;
                },
                setEvaluation: function setEvaluation(value){
                    this.evaluation = value;
                },
                /**
                 * Retrieve usergroup list from DB
                 *
                 * @returns {*|usergrouplist}
                 */
                getUsergroupListFromController: function getUsergroupListFromController(){
                    this.getUsergroup();
                    return this.usergrouplist;
                },
                /**
                 * set the usergroup list value
                 * @param ugl
                 */
                setUsergroupList: function setUsergroupList(ugl){
                    this.usergrouplist = ugl;
                },
                /**
                 * Retrieve usergroup list from DB
                 *
                 * @returns {*|usergrouplist}
                 */
                getUseringroupFromController: function getUseringroupFromController(){
                    this.getUseringroup();
                    return this.useringroup;
                },
                setUseringroup: function setUseringroup(uig){
                    this.useringroup = uig;
                },
                /**
                 * Retrieve the groups in which the user is registered
                 *
                 */
                getUserBelongsTo: function getUserBelongsTo() {
                    this.useringroup = [];
                },
                /**
                 * Generates a new empty stepConditions
                 *
                 * @param {object} [step]
                 * @returns {StepConditions}
                 */
                initialize: function initialize(step) {
                    //create an empty Condition for the given step
                    var newStepConditions = new StepConditions();
                    //create an structure : empty criteriagroup
                    var newCriteriaGroup = new CriteriaGroup();
                    //add the empty criteriagroup to the empty condition
                    newStepConditions.criteriagroups.push(newCriteriaGroup);
                    //attach condition to step
                    step.condition = newStepConditions;
                    return newStepConditions;
                },
                /**
                 * Adds a new criteria group
                 *
                 * @returns {CriteriaGroup}
                 */
                addCriteriagroup: function (cgroup) {
                    //create a new criteriagroup object structure
                    var newCriteriaGroup = new CriteriaGroup(cgroup);
                    //adds the criteriagroup to a criteriagroup
                    if (cgroup.criteriagroup) {
                        cgroup.criteriagroup.push(newCriteriaGroup);
                    } else {
                        //if this is root
                        cgroup.criteriagroups.push(newCriteriaGroup);
                    }
                    return newCriteriaGroup;
                },
                /**
                 * Adds a new criterion
                 * @param {object} [criterion]
                 * @returns {Criterion}
                 */
                addCriterion: function (cgroup) {
                    //create a new criterion object structure
                    var newCriterion = new Criterion(cgroup);
                    //adds the criterion to the criteriagroup
                    cgroup.criterion.push(newCriterion);
                    return newCriterion;
                },
                /**
                 * Get the list of User groups
                 *
                 * @returns {object}
                 */
                getUsergroup: function getUsergroup() {
                    var deferred = $q.defer();
                    var params = {};
                    $http
                        .get(Routing.generate('innova_path_criteria_usergroup', params))
                        .success(function (response) {
                            this.setUsergroupList(response);
                            deferred.resolve(response);
                        }
                            .bind(this)) //to access StepConditionsService object method and attributes
                        .error(function (response) {
                            deferred.reject(response);
                        });
                    return deferred.promise;
                },
                /**
                 * Get the list of group the user is registered in
                 *
                 * @returns {object}
                 */
                getUseringroup: function getUseringroup() {
                    var deferred = $q.defer();
                    var params = {};
                    $http
                        .get(Routing.generate('innova_path_criteria_groupsforuser', params))
                        .success(function (response) {
                            this.setUseringroup(response);
                            deferred.resolve(response);
                        }
                            .bind(this)) //to access StepConditionsService object method and attributes
                        .error(function (response) {
                            deferred.reject(response);
                        });
                    return deferred.promise;
                },
                /**
                 * Retrieve activity evaluation data from a activity
                 *
                 * @param activityId
                 */
                getActivityEvaluation: function getActivityEvaluation(activityId) {
                    var deferred = $q.defer();
                    var params = {'activityId':activityId};
                    $http
                        .get(Routing.generate('innova_path_activity_eval', params))
                        .success(function (response) {
console.log('getActivityEvaluation success');console.log(response);
                            this.setEvaluation(response);
                            deferred.resolve(response);
                        }.bind(this))
                        .error(function (response) {
                            deferred.reject(response);
                        });
                    return deferred.promise;
                },
                /**
                 * Test a condition from a step
                 *
                 * @param step
                 * @returns {boolean}
                 */
                testCondition: function testCondition(step) {
                    //get root criteriagroup
                    var criteriagroups = step.condition.criteriagroups;
      //              var activityEvaluation = getActivityEvaluation(activityId);
                    var result = true;
                    for (var i=0;i<criteriagroups.length;i++) {
                        result = result || this.testCriteriagroup(criteriagroups);
console.log("Inside testCondition, for i = "+i+ " result : ");console.log(result);
                    }
                    return result;
                },
                /**
                 * Test a criteriagroup from a criteriagroup
                 *
                 * @param cgroup
                 * @returns {boolean}
                 */
                testCriteriagroup: function testCriteriagroup(cgroup) {
                    //First, get all the criteria
                    var crit = cgroup.criterion;
                    var result = true;
                    //test all criteria of the criteriagroup
                    for (var i=0;i<crit.length;i++){
                        result = result && this.testCriterion(crit[i]);
console.log("Inside testCriteriagroup(criterion), for i = "+i+ " result : ");console.log(result);
                    }
                    var cgl = cgroup.criteriagroup.length;
                    //then test all criteriagroup inside this criteriagroup (recursive part)
                    if (cgl > 0) {
                        for (var j=0;j<cgl;j++) {
                            result = result || this.testCriteriagroup(cgroup.criteriagroup[j]);
console.log("Inside testCriteriagroup(criteriagroup), for j = "+j+ " result : ");console.log(result);
                        }
                    }
                    return result;
                },
                /**
                 * Test a criterion in a condition
                 *
                 * @param criterion
                 * @returns {boolean}
                 */
                testCriterion: function testCriterion(criterion) {
                    var test = false;
                    //retrieve evaluation data to check against (evaluation must be retrieved when step is loaded)
                    var evaluationResultToCheck = this.evaluation;
                    //if there are data
                    if (evaluationResultToCheck !== null && evaluationResultToCheck.status !== 'NA'){
                        switch (criterion.type) {
                            case "activityrepetition":
                                test = criterion.data === evaluationResultToCheck.attempts;
console.log('activityrepetition '+criterion.data);
//test = true;
                                break;
                            case "activitystatus":
                                test = criterion.data === evaluationResultToCheck.status;
console.log('activitystatus '+criterion.data);
//test = false;
                                break;
                            case "usergroup":
                                test = criterion.data === this.useringroup;
console.log('usergroup '+criterion.data);
                                break;
                            default:
                                break;
                        }
                    }
console.log('testCriterion :');console.log(criterion);console.log(test);
                    return test;
                },

                getParent: function getParent(cgroup) {
                    var parentCriteriagroup = null;
                    this.browseCriteriagroups(path.steps, function (parent, current) {
                        if (cgroup.id == current.id) {
                            parentCriteriagroup = parent;
                            return true;
                        }
                        return false
                    });
                    return parentCriteriagroup;
                },
                /**
                 * Loop over all criteriagroup of a condition and execute callback
                 * Iteration stops when callback returns true
                 * (Based on browseStep in pathService.js)
                 *
                 * @param {array}    criteriagroups    - an array of criteriagroup to browse
                 * @param {function} callback - a callback to execute on each criteriagroup (called with args `parentCriteriagroup`, `currentCriteriagroup`)
                 */
                browseCriteriagroups: function browseCriteriagroups(criteriagroups, callback) {
console.log('browseCriteriagroups: criteriagroups');
                    /**
                     * Recursively loop through the criteriagroups to execute callback on each criteriagroup
                     * @param   {object} parentCriteriagroup
                     * @param   {object} currentCriteriagroup
                     * @returns {boolean}
                     */
                    function recursiveLoop(parentCriteriagroup, currentCriteriagroup) {
console.log('recursiveLoop(parentCriteriagroup, currentCriteriagroup)');
console.log(parentCriteriagroup);
console.log(currentCriteriagroup);
                        var terminated = false;

                        // Execute callback on current criteriagroup
                        if (typeof callback === 'function') {
                            terminated = callback(parentCriteriagroup, currentCriteriagroup);
                        }

                        if (!terminated && typeof currentCriteriagroup.criteriagroup !== 'undefined' && currentCriteriagroup.criteriagroup.length !== 0) {
                            for (var i = 0; i < currentCriteriagroup.criteriagroup.length; i++) {
console.log('i='+i);
                                terminated = recursiveLoop(currentCriteriagroup, currentCriteriagroup.criteriagroup[i]);
                            }
                        }
console.log('terminated');
console.log(terminated);
                        return terminated;
                    }

                    if (typeof criteriagroups !== 'undefined' && criteriagroups.length !== 0) {
                        for (var j = 0; j < criteriagroups.length; j++) {
                            var terminated = recursiveLoop(null, criteriagroups[j]);
                            if (terminated) {
                                break;
                            }
                        }
                    }
                },
                /**
                 * Remove a criteriagroup from the path's tree
                 * @param {array}  criteriagroups        - an array of criteriagroups to browse
                 * @param {object} criteriagroupToDelete - the criteriagroup to delete
                 */
                removeCriteriagroup: function removeCriteriagroup(criteriagroups, criteriagroupToDelete) {
console.log('removeCriteriagroup: function removeCriteriagroup(criteriagroups, criteriagroupToDelete)');
console.log('criteriagroupToDelete');console.log(criteriagroupToDelete);
                    this.browseCriteriagroups(criteriagroups, function (parent, group) {
console.log('this.browseCriteriagroups(criteriagroups, function (parent, group)');
console.log(criteriagroups);
console.log(parent);
console.log(group);
                        var deleted = false;
                        //if current criteriagroup is the one to be deleted
                        if (group === criteriagroupToDelete) {
console.log("group === criteriagroupToDelete");
                            if (typeof parent !== 'undefined' && null !== parent) {
                                var pos = parent.criteriagroup.indexOf(criteriagroupToDelete);
                                if (-1 !== pos) {
                                    parent.criteriagroup.splice(pos, 1);

                                    deleted = true;
                                }
                            } else {
console.log("group !== criteriagroupToDelete");
                                // We are deleting the root criteriagroup
                                var pos = criteriagroups.indexOf(criteriagroupToDelete);
                                if (-1 !== pos) {
                                    criteriagroups.splice(pos, 1);

                                    deleted = true;
                                }
                            }
                        }

                        return deleted;
                    });
                },
                /**
                 * Do some condition checking before adding to step
                 */
                cleanCondition: function(condition){
                    //TODO : Check stuff
                    return condition;
                }

                /**
                 * Save the condition in the path
                 * SHOULD BE USELESS : condition saved when path saved
                 */
               /* saveCondition: function() {
                    //retrieve current step
                    var step = this.pathService.getStep(this.current.stepId);
                    //add condition to the step
                    step.condition = condition;
                    //save the path
                    this.pathService.save();
                }
                */
            };
        }
    ]);
})();