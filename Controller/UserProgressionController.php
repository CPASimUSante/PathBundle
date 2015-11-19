<?php

namespace Innova\PathBundle\Controller;

use Innova\PathBundle\Manager\UserProgressionManager;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

use Claroline\CoreBundle\Entity\User;
use Innova\PathBundle\Entity\Step;

/**
 * Class UserProgressionController
 *
 * @Route(
 *      "/progression",
 *      name    = "innova_path_progression",
 *      service = "innova_path.controller.user_progression"
 * )
 */
class UserProgressionController
{
    /**
     * User Progression manager
     * @var \Innova\PathBundle\Manager\UserProgressionManager
     */
    protected $userProgressionManager;
    protected $eventDispatcher;
    protected $securityToken;

    /**
     * Class constructor
     * @param \Innova\PathBundle\Manager\UserProgressionManager $userProgressionManager
     * @param EventDispatcherInterface $eventDispatcher
     * @param TokenStorageInterface $securityToken
     */
    public function __construct(
        UserProgressionManager      $userProgressionManager,
        EventDispatcherInterface    $eventDispatcher,
        TokenStorageInterface       $securityToken
    )
    {
        $this->userProgressionManager   = $userProgressionManager;
        $this->eventDispatcher          = $eventDispatcher;
        $this->securityToken            = $securityToken;
    }

    /**
     * Log a new action from User (mark the the  step as to do)
     * @param \Innova\PathBundle\Entity\Step $step
     * @param string $status
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     *
     * @Route(
     *     "/create/{id}/{authorized}/{status}",
     *     name         = "innova_path_progression_create",
     *     requirements = {"id" = "\d+"},
     *     options      = { "expose" = true }
     * )
     * @Method("POST")
     */
    public function createAction(Step $step, $status = null, $authorized=0)
    {
        $progression = $this->userProgressionManager->create($step, null, $status, $authorized);

        return new JsonResponse($progression);
    }

    /**
     * Update progression of a User
     * @param \Innova\PathBundle\Entity\Step $step
     * @param string $status
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     *
     * @Route(
     *     "/step/{id}/{status}/{authorized}",
     *     name         = "innova_path_progression_update",
     *     requirements = {"id" = "\d+"},
     *     options      = { "expose" = true }
     * )
     * @Method("PUT")
     */
    public function updateAction(Step $step, $status, $authorized)
    {
        $progression = $this->userProgressionManager->update($step, null, $status, $authorized);

        return new JsonResponse($progression);
    }

    /**
     * @param Step $step
     * @param Step $nextstep
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     * @Route(
     *     "/stepunlock/{step}/{nextstep}",
     *     name         = "innova_path_step_unlock",
     *     options      = { "expose" = true }
     * )
     * @Method("GET")
     */
    public function callForUnlock(Step $step, Step $nextstep)
    {
        //Begin send notification (custom)
        //array of user id to send the notification to = users who will receive the call : the path creator
        $creator = $nextstep->getPath()->getCreator()->getId();
        $userIds = array($creator);
        //create an event, and pass parameters
        $event = new \Innova\PathBundle\Event\Log\LogStepUnlockEvent($nextstep, $userIds);
        //send the event to the event dispatcher
        $this->eventDispatcher->dispatch('log', $event); //don't change it.
        //update lockedcall value : set to true = called
        $user = $this->securityToken->getToken()->getUser();
        $progression = $this->userProgressionManager->updateLockedState($user, $step, true);
        //return response
        return new JsonResponse($progression);
    }

    /**
     * Ajax call for unlocking step
     * @Route(
     *     "stepauth/{step}/user/{user}",
     *     name="innova_path_stepauth",
     *     options={"expose"=true}
     * )
     * @Method("GET")
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function authorizeStep(Step $step, User $user)
    {
        $userIds = array($user->getId());
        //create an event, and pass parameters
        $event = new \Innova\PathBundle\Event\Log\LogStepUnlockDoneEvent($step, $userIds);
        //send the event to the event dispatcher
        $this->eventDispatcher->dispatch('log', $event); //don't change it.
        //update lockedcall value : set to true = called
        $progression = $this->userProgressionManager->authorizeStep($user, $step, false);
        //return response
        return new JsonResponse($progression);
    }

    /**
     * Set lock for progression of a User
     * @param \Innova\PathBundle\Entity\Step $step
     * @param boolean $lock
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     *
     * @Route(
     *     "/steplock/{id}/{locked}",
     *     name         = "innova_path_progression_setlock",
     *     requirements = {"id" = "\d+"},
     *     options      = { "expose" = true }
     * )
     * @Method("PUT")
     */
    public function setLockAction(Step $step, $locked)
    {
        $progression = $this->userProgressionManager->setLock($step, $locked);
        return new JsonResponse($progression);
    }

}
