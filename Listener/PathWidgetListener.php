<?php

namespace Innova\PathBundle\Listener;

use Claroline\CoreBundle\Event\DisplayWidgetEvent;
use Claroline\CoreBundle\Listener\NoHttpRequestException;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use JMS\DiExtraBundle\Annotation as DI;

/**
 * @DI\Service()
 */
class PathWidgetListener
{
    private $request;
    private $httpKernel;

    /**
     * @DI\InjectParams({
     *     "requestStack"   = @DI\Inject("request_stack"),
     *     "httpKernel"     = @DI\Inject("http_kernel")
     * })
     */
    public function __construct(RequestStack $requestStack, HttpKernelInterface $httpKernel)
    {
        $this->request = $requestStack->getCurrentRequest();
        $this->httpKernel = $httpKernel;
    }

    /**
     * @DI\Observe("widget_innova_path_widget")
     *
     * @param DisplayWidgetEvent $event
     * @throws \Claroline\CoreBundle\Listener\NoHttpRequestException
     */
    public function onDisplayPathsWorkspace(DisplayWidgetEvent $event)
    {
        if (!$this->request) {
            throw new NoHttpRequestException();
        }

        $widgetInstance = $event->getInstance();
        $workspace = $widgetInstance->getWorkspace();
        $params = array();

        $params['_controller'] = 'InnovaPathBundle:Widget:pathsWorkspaceWidget';
        $params['workspaceId'] = $workspace->getId();
      

        $subRequest = $this->request->duplicate(
            array(),
            null,
            $params
        );
        $response = $this->httpKernel->handle($subRequest, HttpKernelInterface::SUB_REQUEST);

        $event->setContent($response->getContent());
        $event->stopPropagation();
    }


    /**
     * @DI\Observe("widget_innova_my_paths_widget")
     *
     * @param DisplayWidgetEvent $event
     * @throws \Claroline\CoreBundle\Listener\NoHttpRequestException
     */
    public function onDisplayMyPaths(DisplayWidgetEvent $event)
    {
        if (!$this->request) {
            throw new NoHttpRequestException();
        }

        $params = array();
        $params['_controller'] = 'InnovaPathBundle:Widget:myPathsWidget';

        $subRequest = $this->request->duplicate(array(), null, $params);
        $response = $this->httpKernel->handle($subRequest, HttpKernelInterface::SUB_REQUEST);

        $event->setContent($response->getContent());
        $event->stopPropagation();
    }
}
