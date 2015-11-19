<?php

namespace Innova\PathBundle\Manager;

use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

use Claroline\CoreBundle\Entity\User;
use Doctrine\Common\Persistence\ObjectManager;
use Innova\PathBundle\Entity\Step;
use Innova\PathBundle\Entity\UserProgression;

/**
 * Class UserProgressionManager
 */
class UserProgressionManager
{
    /**
     * Object manager
     * @var \Doctrine\Common\Persistence\ObjectManager
     */
    protected $om;

    /**
     * @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface
     */
    protected $securityToken;

    /**
     * Class constructor
     * @param \Doctrine\Common\Persistence\ObjectManager $objectManager
     * @param \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface $securityToken
     */
    public function __construct(
        ObjectManager         $objectManager,
        TokenStorageInterface $securityToken)
    {
        $this->om            = $objectManager;
        $this->securityToken = $securityToken;
    }

    /**
     * Create a new progression for a User and a Step (by default, the first action is 'seen')
     * @param Step $step
     * @param User $user
     * @param string $status
     * @param bool $authorized
     * @return UserProgression
     */
    public function create(Step $step, User $user = null, $status = null, $authorized=false)
    {
        if (empty($user)) {
            // Load current logged User
            $user = $this->securityToken->getToken()->getUser();
        }

        $progression = new UserProgression();

        $progression->setUser($user);
        $progression->setStep($step);

        if (empty($status)) {
            $status = UserProgression::getDefaultStatus();
        }

        $progression->setStatus($status);
        $progression->setAuthorized($authorized);

        //unlocked by default
        $progression->setLocked(0);
        $progression->setLockedcall(0);

        $this->om->persist($progression);
        $this->om->flush();

        return $progression;
    }

    public function update(Step $step, User $user = null, $status, $authorized=false)
    {
        if (empty($user)) {
            // Load current logged User
            $user = $this->securityToken->getToken()->getUser();
        }

        // Retrieve the current progression for this step
        $progression = $this->om->getRepository('InnovaPathBundle:UserProgression')->findOneBy(array (
            'step' => $step,
            'user' => $user
        ));

        if (empty($progression)) {
            // No progression for User => initialize a new one
            $progression = $this->create($step, $user, $status, $authorized);
        } else {
            // Update existing progression
            $progression->setStatus($status);
            $progression->setAuthorized($authorized);

            $this->om->persist($progression);
            $this->om->flush();
        }

        return $progression;
    }

    /**
     * update state of the lock for User Progression for a step
     *
     * @param User $user
     * @param Step $step
     * @param null $lockedcall
     * @param null $lock
     * @return object
     */
    public function updateLockedState(User $user, Step $step, $lockedcall=null, $lock=null)
    {
        // Retrieve the current progression for this step
        $progression = $this->om->getRepository('InnovaPathBundle:UserProgression')->findOneBy(array (
            'step' => $step,
            'user' => $user
        ));

        //if unlock call has changed
        if ($lockedcall != null)
            $progression->setLockedcall($lockedcall);

        //if lock state has changed
        if ($lock != null)
            $progression->setLocked($lock);

        $this->om->persist($progression);
        $this->om->flush();
        return $progression;
    }

    /**
     * Authorize access to a step
     * @Route(
     *     "stepauth/{step}/user/{user}",
     *     name="innova_path_stepauth",
     *     options={"expose"=true}
     * )
     * @Method("GET")
     * @param User $user
     * @param Step $step
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function authorizeStep(User $user, Step $step)
    {
        // Retrieve the current progression for this step
        $progression = $this->om->getRepository('InnovaPathBundle:UserProgression')->findOneBy(array (
            'step' => $step,
            'user' => $user
        ));

        //remove the call
        $progression->setLockedcall(false);

        $this->om->persist($progression);
        $this->om->flush();
        return $progression;
    }
}
