<?php

namespace Innova\PathBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Innova\PathBundle\Entity\Step;
use Innova\PathBundle\Entity\Criteriagroup;

/**
 * StepCondition
 *
 * @ORM\Table(name="innova_stepcondition")
 * @ORM\Entity(repositoryClass="Innova\PathBundle\Repository\StepConditionRepository")
 */
class StepCondition implements \JsonSerializable
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * criteriagroups linked to the condition
     *
     * @ORM\OneToMany(targetEntity="Innova\PathBundle\Entity\Criteriagroup", mappedBy="stepcondition", indexBy="id", cascade={"persist", "remove"})
     * @ORM\OrderBy({"order" = "ASC"})
     */
    private $criteriagroups;

    /**
     * Step the condition belongs to
     * @var \Innova\PathBundle\Entity\Step
     *
     * @ORM\OneToOne(targetEntity="Innova\PathBundle\Entity\Step", inversedBy="condition")
     */
    protected $step;

    /**
     * Step locked from date
     * @ORM\Column(name="lockedfrom", type="datetime", nullable=true)
     */
    protected $lockedfrom;

    /**
     * Step locked until date
     * @ORM\Column(name="lockeduntil", type="datetime", nullable=true)
     */
    protected $lockeduntil;

    /**
     * Class constructor
     */
    public function __construct()
    {
        $this->criteriagroups = new ArrayCollection();
    }

    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Add criteriagroup
     * @param  \Innova\PathBundle\Entity\Criteriagroup $criteriagroup
     * @return \Innova\PathBundle\Entity\StepCondition
     */
    public function addCriteriagroup(Criteriagroup $criteriagroup)
    {
        if (!$this->criteriagroups->contains($criteriagroup)) {
            $this->criteriagroups->add($criteriagroup);
        }

        $criteriagroup->setStepCondition($this);

        return $this;
    }

    /**
     * Remove criteriagroup
     * @param \Innova\PathBundle\Entity\Criteriagroup $criteriagroup
     * @return \Innova\PathBundle\Entity\StepCondition
     */
    public function removeCriteriagroup(Criteriagroup $criteriagroup)
    {
        if ($this->criteriagroups->contains($criteriagroup)) {
            $this->criteriagroups->removeElement($criteriagroup);
        }

        $criteriagroup->setStepCondition(null);

        return $this;
    }

    /**
     * Get criteriagroups
     * @return \Doctrine\Common\Collections\Collection
     */
    public function getCriteriagroups()
    {
        return $this->criteriagroups;
    }

    /**
     * Get root criteriagroup of the condition
     * @throws \Exception
     * @return \Innova\PathBundle\Entity\Criteriagroup
     */
    public function getRootCriteriagroup()
    {
        $root = null;

        if (!empty($this->criteriagroups)) {
            foreach ($this->criteriagroups as $criteriagroup) {
                if (null === $criteriagroup->getParent()) {
                    // Root criteriagroup found
                    $root = $criteriagroup;
                    break;
                }
            }
        }

        return $root;
    }

    /**
     * Set step
     *
     * @param \Innova\PathBundle\Entity\Step $step
     *
     * @return StepCondition
     */
    public function setStep(\Innova\PathBundle\Entity\Step $step = null)
    {
        if ($step !== $this->step) {
            $this->step = $step;
            if (null !== $step) {
                $step->setCondition($this);
            }
        }

        return $this;
    }

    /**
     * Get step
     *
     * @return \Innova\PathBundle\Entity\Step
     */
    public function getStep()
    {
        return $this->step;
    }

    /**
     * Get lockedfrom
     *
     * @return \DateTime
     */
    public function getLockedfrom()
    {
        return $this->lockedfrom;
    }

    /**
     * Set lockedfrom
     *
     * @param \DateTime $lockedfrom
     *
     * @return StepCondition
     */
    public function setLockedfrom($lockedfrom)
    {
        $this->lockedfrom = $lockedfrom;
        return $this;
    }

    /**
     * Get lockeduntil
     *
     * @return \DateTime
     */
    public function getLockeduntil()
    {
        return $this->lockeduntil;
    }

    /**
     * Set lockeduntil
     *
     * @param \DateTime $lockeduntil
     *
     * @return StepCondition
     */
    public function setLockeduntil($lockeduntil)
    {
        $this->lockeduntil = $lockeduntil;
        return $this;
    }


    public function jsonSerialize()
    {
        // Initialize data array
        $jsonArray = array (
            'id'                => $this->id,
            'scid'              => $this->id,
            'lockedfrom'        => $this->getLockedfrom(),
            'lockeduntil'       => $this->getLockeduntil(),
        );

        $criteriagroups = array();
        $rootCriteriagroup = $this->getRootCriteriagroup();
        if (!empty($rootCriteriagroup)) {
            $criteriagroups[] = $rootCriteriagroup;
        }

        $jsonArray['criteriagroups'] = $criteriagroups;

        return $jsonArray;
    }
}
