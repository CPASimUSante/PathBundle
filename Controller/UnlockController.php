<?php

namespace Innova\PathBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;

use Claroline\CoreBundle\Entity\Workspace\Workspace;
use Claroline\CoreBundle\Entity\User;
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
     * @param \Doctrine\Common\Persistence\ObjectManager $objectManager
     * @param \Innova\PathBundle\Manager\PathManager $pathManager
     */
    public function __construct(
        ObjectManager $objectManager,
        PathManager $pathManager)
    {
        $this->om = $objectManager;
        $this->pathManager = $pathManager;
    }

    /**
     * Display dashboard for path of users
     * @Route(
     *     "/userpath/{path}",
     *     name         = "innova_path_unlock_management",
     *     requirements={"path" = "\d+"},
     *     options      = {"expose" = true}
     * )
     * @Method("GET")
     * @Template("InnovaPathBundle::unlockManagement.html.twig")
     */
    public function displayStepUnlockAction(Path $path)
    {
        $data = array();
        $workspace = $path->getWorkspace();
        //get list of paths for WS
        $paths = $this->pathManager->getWorkspacePaths($workspace);

        //retrieve users having access to the WS
        //TODO Optimize
       // $users = $this->om->getRepository('ClarolineCoreBundle:User')->findUsersByWorkspace($workspace);
       // foreach ($paths as $path) {
           /* $userdata = array();
         //   foreach ($users as $user) {
                //get their progression
                $userdata[] = array(
                  //  'progression' => $this->pathManager->getUserProgression($path, $user),
                    'progression' => $this->pathManager->getPathLockedProgression($path),
                    //'user' => $user
                );
           // }*/
            $userdata = $this->pathManager->getPathLockedProgression($path);
           // $data[] = array(
            $data = array(
                'path'      => $path,
                'userdata'  => $userdata
            );
     //   }

        return array(
            'workspace' => $workspace,
            'data'      => $data
        );
       // return array('data'      => $data);
    }
}