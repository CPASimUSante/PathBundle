<?php
namespace Innova\PathBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\JsonResponse;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
// Controller dependencies
use Doctrine\Common\Persistence\ObjectManager;
use Claroline\CoreBundle\Entity\User;
use Innova\PathBundle\Entity\Path\Path;
use Innova\PathBundle\Entity\Step;
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
     * List users using this path
     * @Route(
     *     "/list/{id}",
     *     name         = "innova_path_lock_userlist",
     *     requirements = {"id" = "\d+"},
     *     options      = {"expose" = true}
     * )
     * @Template("InnovaPathBundle::pathManagement.html.twig")
     * @Method("GET")
     */
    public function listUserAction(Path $path)
    {
        //retrieve users doing the path
        //???
        /*foreach ($users as $user)
        {
            //get their progression
            $progression = $this->pathManager->getUserProgression($path, $user);
            //
        }*/
        $paths = $this->container->get('innova_path.manager.path')->findAccessibleByUser();
        return array (
            'paths'      => $paths,
        );
    }
}