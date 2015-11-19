<?php

namespace Innova\PathBundle\Migrations\pdo_mysql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution
 *
 * Generation date: 2015/11/19 09:07:00
 */
class Version20151119090659 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql("
            ALTER TABLE innova_path_progression 
            ADD locked_access TINYINT(1) NOT NULL, 
            ADD lockedcall_access TINYINT(1) NOT NULL
        ");
        $this->addSql("
            ALTER TABLE StepConditionsGroup 
            ADD guid VARCHAR(255) NOT NULL
        ");
    }

    public function down(Schema $schema)
    {
        $this->addSql("
            ALTER TABLE StepConditionsGroup 
            DROP guid
        ");
        $this->addSql("
            ALTER TABLE innova_path_progression 
            DROP locked_access, 
            DROP lockedcall_access
        ");
    }
}