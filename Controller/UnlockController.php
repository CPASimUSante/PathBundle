<?php
namespace Innova\PathBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

use Innova\PathBundle\Entity\Path\Path;

// Controller dependencies
use Doctrine\Common\Persistence\ObjectManager;
use Innova\PathBundle\Manager\PathManager;

/**
 * Class UnlockController
 *
 * @Route(
 *      "/unlock",
 *      name    = "innova_path_unlock",
 *      service = "innova_path.controller.unlock"
 * )
 */
class UnlockController extends Controller
{
    protected $om;
    protected $pathManager;
    /**
     * Class constructor - Inject required services
     * @param \Doctrine\Common\Persistence\ObjectManager       $objectManager
     * @param \Innova\PathBundle\Manager\PathManager           $pathManager
     */
    public function __construct(
        ObjectManager          $objectManager,
        PathManager             $pathManager)
    {
        $this->om              = $objectManager;
        $this->pathManager     = $pathManager;
    }

    /**
     * Ajax call for unlocking step
     * @Route(
     *     "/unlock/{path}/{step}/{user}",
     *     name="innova_paths_unlock",
     *     options={"expose"=true}
     * )
     * @Method("GET")
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function unlockAction(Path $path, Step $step, User $user)
    {
    }
}
