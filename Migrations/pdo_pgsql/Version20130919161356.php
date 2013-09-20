<?php

namespace Innova\PathBundle\Migrations\pdo_pgsql;

use Doctrine\DBAL\Migrations\AbstractMigration;
use Doctrine\DBAL\Schema\Schema;

/**
 * Auto-generated migration based on mapping information: modify it with caution
 *
 * Generation date: 2013/09/19 04:13:56
 */
class Version20130919161356 extends AbstractMigration
{
    public function up(Schema $schema)
    {
        $this->addSql("
            CREATE TABLE Step2ResourceNode (
                id SERIAL NOT NULL, 
                step_id INT DEFAULT NULL, 
                resourceNode_id INT DEFAULT NULL, 
                PRIMARY KEY(id)
            )
        ");
        $this->addSql("
            CREATE INDEX IDX_C5D743873B21E9C ON Step2ResourceNode (step_id)
        ");
        $this->addSql("
            CREATE INDEX IDX_C5D7438B87FAB32 ON Step2ResourceNode (resourceNode_id)
        ");
        $this->addSql("
            ALTER TABLE Step2ResourceNode 
            ADD CONSTRAINT FK_C5D743873B21E9C FOREIGN KEY (step_id) 
            REFERENCES innova_step (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        ");
        $this->addSql("
            ALTER TABLE Step2ResourceNode 
            ADD CONSTRAINT FK_C5D7438B87FAB32 FOREIGN KEY (resourceNode_id) 
            REFERENCES claro_resource_node (id) NOT DEFERRABLE INITIALLY IMMEDIATE
        ");
    }

    public function down(Schema $schema)
    {
        $this->addSql("
            DROP TABLE Step2ResourceNode
        ");
    }
}