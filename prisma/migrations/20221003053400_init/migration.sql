-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "selectedCharacterId" INTEGER,
    CONSTRAINT "User_selectedCharacterId_fkey" FOREIGN KEY ("selectedCharacterId") REFERENCES "GameCharacter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("id") SELECT "id" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_selectedCharacterId_key" ON "User"("selectedCharacterId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
