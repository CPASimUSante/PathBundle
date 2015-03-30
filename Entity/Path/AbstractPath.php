<?php

namespace Innova\PathBundle\Entity\Path;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/** 
 * Abstract path
 *  
 * @ORM\MappedSuperclass 
 */
class AbstractPath
{
    /**
     * Name of the path
     * @var string
     *
     * @ORM\Column(name="name", type="string", length=255)
     * @Assert\NotBlank
     */
    protected $name;
    
    /**
     * JSON structure of the path
     * @var string
     *
     * @ORM\Column(name="structure", type="text")
     */
    protected $structure;
    
    /**
     * Set name
     * @param  string $name
     * @return \Innova\PathBundle\Entity\Path\AbstractPath
     */
    public function setName($name)
    {
        $this->name = $name;
    
        return $this;
    }
    
    /**
     * Get name
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }
    
    /**
     * Set structure
     * @param  string $structure
     * @return \Innova\PathBundle\Entity\Path\AbstractPath
     */
    public function setStructure($structure)
    {
        $this->structure = $structure;
    
        return $this;
    }
    
    /**
     * Get structure
     * @return string
     */
    public function getStructure()
    {
        return $this->structure;
    }
}