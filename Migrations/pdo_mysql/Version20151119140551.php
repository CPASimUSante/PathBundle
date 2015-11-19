<?php

namespace Innova\PathBundle\Migrations\pdo_mysql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution
 *
 * Generation date: 2015/11/19 02:05:53
 */
class Version20151119140551 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql("
            ALTER TABLE innova_stepcondition 
            ADD lockedfrom DATETIME DEFAULT NULL, 
            ADD lockeduntil DATETIME DEFAULT NULL
        ");
    }

    public function down(Schema $schema)
    {
        $this->addSql("
            ALTER TABLE innova_stepcondition 
            DROP lockedfrom, 
            DROP lockeduntil
        ");
    }
}